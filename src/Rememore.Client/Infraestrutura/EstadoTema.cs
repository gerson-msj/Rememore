using System.Text.Json;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoTema(IJSRuntime js) : IAsyncDisposable
{
    private const string ChaveTema = "rememore.lab.tema.v1";
    private const string ChavePaletas = "rememore.lab.paletas.v1";
    private IJSObjectReference? modulo;
    private IJSObjectReference? observadorSistema;
    private DotNetObjectReference<EstadoTema>? referenciaJs;
    private Dictionary<string, string> paletaClara = new(PaletaTema.Clara.Cores);
    private Dictionary<string, string> paletaEscura = new(PaletaTema.Escura.Cores);
    private object revisao = new();

    public event Action? Alterado;
    public object Revisao => revisao;
    public PreferenciaTema Preferencia { get; private set; } = PreferenciaTema.Sistema;
    public bool PreferenciaDoSistemaEscura { get; private set; }
    public string MensagemArmazenamento { get; private set; } = "";
    public IReadOnlyDictionary<string, string> PaletaClara => paletaClara;
    public IReadOnlyDictionary<string, string> PaletaEscura => paletaEscura;
    public bool AparenciaEscura => Preferencia == PreferenciaTema.Escuro || Preferencia == PreferenciaTema.Sistema && PreferenciaDoSistemaEscura;
    public IReadOnlyDictionary<string, string> PaletaEfetiva => AparenciaEscura ? paletaEscura : paletaClara;

    public async Task InicializarHomeAsync()
    {
        Preferencia = PreferenciaTema.Sistema;
        paletaClara = new(PaletaTema.Clara.Cores);
        paletaEscura = new(PaletaTema.Escura.Cores);
        await AplicarAsync("sistema", null);
        await IniciarObservacaoSistemaAsync();
        NotificarAlteracao();
    }

    public async Task InicializarLaboratorioAsync()
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            var preferenciaSalva = await modulo.InvokeAsync<string?>("ler", ChaveTema);
            if (Enum.TryParse<PreferenciaTema>(preferenciaSalva, true, out var preferencia)) Preferencia = preferencia;
            var paletasSalvas = await modulo.InvokeAsync<string?>("ler", ChavePaletas);
            if (!string.IsNullOrWhiteSpace(paletasSalvas))
            {
                var rascunhos = JsonSerializer.Deserialize<Dictionary<string, Dictionary<string, string>>>(paletasSalvas);
                if (rascunhos?.TryGetValue("clara", out var clara) == true) paletaClara = Mesclar(PaletaTema.Clara.Cores, clara);
                if (rascunhos?.TryGetValue("escura", out var escura) == true) paletaEscura = Mesclar(PaletaTema.Escura.Cores, escura);
            }
            MensagemArmazenamento = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException or JsonException)
        {
            MensagemArmazenamento = "O armazenamento local não está disponível. As alterações desta sessão não serão preservadas.";
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
        if (!System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9A-Fa-f]{6}$")) return;
        var paleta = Preferencia == PreferenciaTema.Escuro ? paletaEscura : paletaClara;
        if (!paleta.ContainsKey(nome)) return;
        paleta[nome] = valor.ToUpperInvariant();
        await PersistirPaletasAsync();
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task RestaurarCorAsync(string nome)
    {
        if (Preferencia == PreferenciaTema.Sistema) return;
        var baseCores = Preferencia == PreferenciaTema.Escuro ? PaletaTema.Escura.Cores : PaletaTema.Clara.Cores;
        var paleta = Preferencia == PreferenciaTema.Escuro ? paletaEscura : paletaClara;
        if (!baseCores.TryGetValue(nome, out var valor)) return;
        paleta[nome] = valor;
        await PersistirPaletasAsync();
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task RestaurarPaletaAsync()
    {
        if (Preferencia == PreferenciaTema.Escuro) paletaEscura = new(PaletaTema.Escura.Cores);
        else if (Preferencia == PreferenciaTema.Claro) paletaClara = new(PaletaTema.Clara.Cores);
        await PersistirPaletasAsync();
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public string ExportarPaleta() => JsonSerializer.Serialize(new { tema = Preferencia.ToString(), cores = PaletaEfetiva }, new JsonSerializerOptions { WriteIndented = true });

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

    private async Task PersistirPaletasAsync() => await PersistirAsync(ChavePaletas, JsonSerializer.Serialize(new { clara = paletaClara, escura = paletaEscura }));

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

    private static Dictionary<string, string> Mesclar(IReadOnlyDictionary<string, string> baseCores, Dictionary<string, string> salvas)
    {
        var resultado = new Dictionary<string, string>(baseCores);
        foreach (var (nome, valor) in salvas)
            if (resultado.ContainsKey(nome) && System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9A-Fa-f]{6}$")) resultado[nome] = valor.ToUpperInvariant();
        return resultado;
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
