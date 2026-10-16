using System.Text.Json;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoTema(IJSRuntime js) : IAsyncDisposable
{
    private const string ChaveTema = "rememore.tema.v1";
    private const string ChaveTemaAntiga = "rememore.lab.tema.v1";
    private const string ChavePaletas = "rememore.lab.paletas.v1";
    private IJSObjectReference? modulo;
    private IJSObjectReference? observadorSistema;
    private DotNetObjectReference<EstadoTema>? referenciaJs;
    private Dictionary<string, string> paletaClara = new(PaletaTema.Clara.Cores);
    private Dictionary<string, string> paletaEscura = new(PaletaTema.Escura.Cores);
    private object revisao = new();
    private bool inicializado;

    public event Action? Alterado;
    public object Revisao => revisao;
    public PreferenciaTema Preferencia { get; private set; } = PreferenciaTema.Sistema;
    public bool PreferenciaDoSistemaEscura { get; private set; }
    public string MensagemArmazenamento { get; private set; } = "";
    public string AvisoRascunhoNaoSalvo { get; private set; } = "";
    public IReadOnlyDictionary<string, string> PaletaClara => paletaClara;
    public IReadOnlyDictionary<string, string> PaletaEscura => paletaEscura;
    public bool AparenciaEscura => Preferencia == PreferenciaTema.Escuro || Preferencia == PreferenciaTema.Sistema && PreferenciaDoSistemaEscura;
    public IReadOnlyDictionary<string, string> PaletaEfetiva => AparenciaEscura ? paletaEscura : paletaClara;

    public async Task InicializarAsync()
    {
        if (inicializado) return;
        inicializado = true;

        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            var preferenciaSalva = await modulo.InvokeAsync<string?>("ler", ChaveTema);
            if (string.IsNullOrWhiteSpace(preferenciaSalva))
            {
                preferenciaSalva = await modulo.InvokeAsync<string?>("ler", ChaveTemaAntiga);
                if (Enum.TryParse<PreferenciaTema>(preferenciaSalva, true, out var antiga))
                {
                    Preferencia = antiga;
                    await modulo.InvokeVoidAsync("salvar", ChaveTema, antiga.ToString());
                }
            }
            else if (Enum.TryParse<PreferenciaTema>(preferenciaSalva, true, out var preferencia))
            {
                Preferencia = preferencia;
            }

            try
            {
                var paletasSalvas = await modulo.InvokeAsync<string?>("ler", ChavePaletas);
                if (!string.IsNullOrWhiteSpace(paletasSalvas))
                {
                    var rascunhos = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(paletasSalvas);
                    if (rascunhos?.TryGetValue("clara", out var clara) == true) paletaClara = Mesclar(PaletaTema.Clara.Cores, clara);
                    if (rascunhos?.TryGetValue("escura", out var escura) == true) paletaEscura = Mesclar(PaletaTema.Escura.Cores, escura);
                }
            }
            catch (Exception ex) when (ex is JSException or InvalidOperationException)
            {
                AvisoRascunhoNaoSalvo = "O navegador não permitiu ler o rascunho salvo. As cores padrão foram carregadas.";
            }
            catch (JsonException)
            {
                AvisoRascunhoNaoSalvo = "O rascunho salvo estava inválido. As cores padrão foram carregadas.";
            }

            MensagemArmazenamento = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException or JsonException)
        {
            MensagemArmazenamento = "O armazenamento local não está disponível. As alterações desta sessão não serão preservadas.";
            AvisoRascunhoNaoSalvo = "O navegador não permitiu salvar o rascunho. Copie a paleta antes de sair.";
        }

        await AplicarAtualAsync();
        await IniciarObservacaoSistemaAsync();
        NotificarAlteracao();
    }

    public async Task SelecionarAsync(PreferenciaTema preferencia)
    {
        Preferencia = preferencia;
        await PersistirAsync(ChaveTema, preferencia.ToString());
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task AtualizarCorAsync(string nome, string valor)
    {
        var tema = AparenciaEscura ? PreferenciaTema.Escuro : PreferenciaTema.Claro;
        await AtualizarCorAsync(tema, nome, valor);
    }

    public async Task AtualizarCorAsync(PreferenciaTema tema, string nome, string valor)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9A-Fa-f]{6}$")) return;
        var paleta = ObterPaletaEditavel(tema);
        if (paleta is null) return;
        if (!paleta.ContainsKey(nome)) return;
        paleta[nome] = valor.ToUpperInvariant();
        await PersistirPaletasAsync();
        if (TemaEfetivo(tema)) await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task RestaurarCorAsync(string nome)
    {
        if (Preferencia == PreferenciaTema.Sistema) return;
        await RestaurarCorAsync(Preferencia, nome);
    }

    public async Task RestaurarCorAsync(PreferenciaTema tema, string nome)
    {
        var baseCores = tema == PreferenciaTema.Escuro ? PaletaTema.Escura.Cores : PaletaTema.Clara.Cores;
        var paleta = ObterPaletaEditavel(tema);
        if (paleta is null) return;
        if (!baseCores.TryGetValue(nome, out var valor)) return;
        paleta[nome] = valor;
        await PersistirPaletasAsync();
        if (TemaEfetivo(tema)) await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task RestaurarPaletaAsync()
    {
        if (Preferencia is not (PreferenciaTema.Escuro or PreferenciaTema.Claro)) return;
        await RestaurarPaletaAsync(Preferencia);
    }

    public async Task RestaurarPaletaAsync(PreferenciaTema tema)
    {
        if (tema == PreferenciaTema.Escuro) paletaEscura = new(PaletaTema.Escura.Cores);
        else if (tema == PreferenciaTema.Claro) paletaClara = new(PaletaTema.Clara.Cores);
        else return;
        await PersistirPaletasAsync();
        if (TemaEfetivo(tema)) await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public string ExportarPaleta() => ExportarPaleta(AparenciaEscura ? PreferenciaTema.Escuro : PreferenciaTema.Claro);

    public string ExportarPaleta(PreferenciaTema tema)
    {
        var paleta = tema == PreferenciaTema.Escuro ? paletaEscura : paletaClara;
        var rotulos = new Dictionary<string, string>
        {
            ["main"] = "Fundo principal", ["bis"] = "Superfície secundária", ["ter"] = "Superfície terciária",
            ["background"] = "Fundo de apoio", ["text"] = "Texto normal", ["text-weak"] = "Texto secundário",
            ["text-strong"] = "Texto forte", ["title"] = "Títulos", ["border"] = "Borda normal",
            ["border-weak"] = "Borda suave", ["primary"] = "Principal", ["link"] = "Link",
            ["info"] = "Informação", ["success"] = "Sucesso", ["warning"] = "Atenção / alerta", ["danger"] = "Perigo / erro"
        };
        var nomeTema = tema == PreferenciaTema.Escuro ? "Escuro" : "Claro";
        return $"Rememore — Tema {nomeTema}{Environment.NewLine}" + string.Join(Environment.NewLine, paleta.Select(par => $"{rotulos[par.Key]}: {par.Value}"));
    }

    public async Task AtualizarPreferenciaSistemaAsync(bool escura)
    {
        PreferenciaDoSistemaEscura = escura;
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    [JSInvokable]
    public Task AoMudarPreferenciaSistema(bool escura) => AtualizarPreferenciaSistemaAsync(escura);

    private async Task IniciarObservacaoSistemaAsync()
    {
        if (observadorSistema is not null) return;
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            referenciaJs ??= DotNetObjectReference.Create(this);
            observadorSistema = await modulo.InvokeAsync<IJSObjectReference>("observarSistema", referenciaJs);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private async Task AplicarAtualAsync()
    {
        if (Preferencia == PreferenciaTema.Sistema && modulo is not null)
        {
            try { PreferenciaDoSistemaEscura = await modulo.InvokeAsync<bool>("sistemaEscuro"); }
            catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
        }
        await AplicarAsync(Preferencia switch { PreferenciaTema.Claro => "claro", PreferenciaTema.Escuro => "escuro", _ => "sistema" }, PaletaEfetiva);
    }

    private async Task AplicarAsync(string aparencia, IReadOnlyDictionary<string, string>? cores)
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            await modulo.InvokeVoidAsync("aplicar", aparencia, cores);
            PreferenciaDoSistemaEscura = await modulo.InvokeAsync<bool>("sistemaEscuro");
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private Dictionary<string, string>? ObterPaletaEditavel(PreferenciaTema tema) => tema switch
    {
        PreferenciaTema.Claro => paletaClara,
        PreferenciaTema.Escuro => paletaEscura,
        _ => null
    };

    private bool TemaEfetivo(PreferenciaTema tema) =>
        Preferencia == tema || Preferencia == PreferenciaTema.Sistema &&
        (PreferenciaDoSistemaEscura ? PreferenciaTema.Escuro : PreferenciaTema.Claro) == tema;

    private async Task PersistirPaletasAsync()
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            await modulo.InvokeVoidAsync("salvar", ChavePaletas, JsonSerializer.Serialize(new { clara = paletaClara, escura = paletaEscura }));
            AvisoRascunhoNaoSalvo = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            AvisoRascunhoNaoSalvo = "O navegador não permitiu salvar o rascunho. Copie a paleta antes de sair.";
        }
    }

    private static Dictionary<string, string> Mesclar(IReadOnlyDictionary<string, string> baseCores, Dictionary<string, string> salvas)
    {
        var resultado = new Dictionary<string, string>(baseCores);
        foreach (var (nome, valor) in salvas)
            if (resultado.ContainsKey(nome) && System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9A-Fa-f]{6}$")) resultado[nome] = valor.ToUpperInvariant();
        return resultado;
    }

    private void NotificarAlteracao()
    {
        revisao = new object();
        Alterado?.Invoke();
    }

    private async Task PersistirAsync(string chave, string valor)
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            await modulo.InvokeVoidAsync("salvar", chave, valor);
            MensagemArmazenamento = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            MensagemArmazenamento = "O armazenamento local não está disponível. As alterações desta sessão não serão preservadas.";
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (observadorSistema is not null && modulo is not null)
        {
            try { await modulo.InvokeVoidAsync("pararObservarSistema", observadorSistema); }
            catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
            await observadorSistema.DisposeAsync();
        }
        if (modulo is not null) await modulo.DisposeAsync();
        referenciaJs?.Dispose();
    }
}
