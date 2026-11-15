using System.Text.Json;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoPaletaLaboratorio(IJSRuntime js) : IAsyncDisposable
{
    private const string ChavePaletas = "rememore.lab.paletas.v1";
    private static readonly (string Chave, string VariavelBulma)[] Variaveis =
    [
        ("main", "scheme-main"),
        ("bis", "scheme-main-bis"),
        ("ter", "scheme-main-ter"),
        ("background", "background"),
        ("text", "text"),
        ("text-weak", "text-weak"),
        ("text-strong", "text-strong"),
        ("title", "title-color"),
        ("border", "border"),
        ("border-weak", "border-weak"),
        ("primary", "primary"),
        ("link", "link"),
        ("info", "info"),
        ("success", "success"),
        ("warning", "warning"),
        ("danger", "danger")
    ];

    private IJSObjectReference? modulo;
    private Dictionary<string, string> paletaClara = new(PaletaTema.Clara.Cores);
    private Dictionary<string, string> paletaEscura = new(PaletaTema.Escura.Cores);
    private object revisao = new();
    private bool inicializado;

    public event Action? Alterado;
    public object Revisao => revisao;
    public string AvisoRascunhoNaoSalvo { get; private set; } = "";
    public IReadOnlyDictionary<string, string> PaletaClara => paletaClara;
    public IReadOnlyDictionary<string, string> PaletaEscura => paletaEscura;

    public async Task InicializarAsync()
    {
        if (inicializado) return;
        inicializado = true;

        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
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

        NotificarAlteracao();
    }

    public IReadOnlyDictionary<string, string> ObterPaleta(PreferenciaTema tema) => tema switch
    {
        PreferenciaTema.Claro => paletaClara,
        PreferenciaTema.Escuro => paletaEscura,
        _ => throw new ArgumentOutOfRangeException(nameof(tema), "Escolha Claro ou Escuro para editar uma paleta.")
    };

    public IReadOnlyDictionary<string, string> ObterPaletaEfetiva(bool aparenciaEscura) => aparenciaEscura ? paletaEscura : paletaClara;

    public string GerarEstiloPrevia(PreferenciaTema tema) => GerarEstilo(ObterPaleta(tema));

    public string GerarEstiloPrevia(bool aparenciaEscura) => GerarEstilo(ObterPaletaEfetiva(aparenciaEscura));

    public async Task AtualizarCorAsync(PreferenciaTema tema, string nome, string valor)
    {
        if (!System.Text.RegularExpressions.Regex.IsMatch(valor, "^#[0-9A-Fa-f]{6}$")) return;
        var paleta = ObterPaletaEditavel(tema);
        if (paleta is null || !paleta.ContainsKey(nome)) return;
        paleta[nome] = valor.ToUpperInvariant();
        await PersistirPaletasAsync();
        NotificarAlteracao();
    }

    public Task AtualizarCorEfetivaAsync(string nome, string valor, bool aparenciaEscura) =>
        AtualizarCorAsync(aparenciaEscura ? PreferenciaTema.Escuro : PreferenciaTema.Claro, nome, valor);

    public async Task RestaurarCorAsync(PreferenciaTema tema, string nome)
    {
        var baseCores = tema == PreferenciaTema.Escuro ? PaletaTema.Escura.Cores : tema == PreferenciaTema.Claro ? PaletaTema.Clara.Cores : null;
        var paleta = ObterPaletaEditavel(tema);
        if (baseCores is null || paleta is null || !baseCores.TryGetValue(nome, out var valor)) return;
        paleta[nome] = valor;
        await PersistirPaletasAsync();
        NotificarAlteracao();
    }

    public async Task RestaurarPaletaAsync(PreferenciaTema tema)
    {
        if (tema == PreferenciaTema.Escuro) paletaEscura = new(PaletaTema.Escura.Cores);
        else if (tema == PreferenciaTema.Claro) paletaClara = new(PaletaTema.Clara.Cores);
        else return;
        await PersistirPaletasAsync();
        NotificarAlteracao();
    }

    public string ExportarPaleta(PreferenciaTema tema)
    {
        var paleta = ObterPaleta(tema);
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

    private string GerarEstilo(IReadOnlyDictionary<string, string> paleta)
    {
        var declaracoes = new List<string>();
        foreach (var (chave, variavelBulma) in Variaveis)
        {
            var valor = paleta[chave];
            declaracoes.Add($"--cor-{chave}: {valor}");
            declaracoes.Add($"--bulma-{variavelBulma}: {valor}");
            if (chave == "title") declaracoes.Add($"--bulma-text-title: {valor}");
        }

        foreach (var nome in new[] { "text", "primary", "link", "info", "success", "warning", "danger" })
        {
            var (matiz, saturacao, luminosidade) = ParaHsl(paleta[nome]);
            declaracoes.Add($"--bulma-{nome}-h: {matiz}deg");
            declaracoes.Add($"--bulma-{nome}-s: {saturacao}%");
            declaracoes.Add($"--bulma-{nome}-l: {luminosidade}%");
        }

        return string.Join(";", declaracoes);
    }

    private static (int Matiz, int Saturacao, int Luminosidade) ParaHsl(string hex)
    {
        var vermelho = Convert.ToInt32(hex.Substring(1, 2), 16) / 255d;
        var verde = Convert.ToInt32(hex.Substring(3, 2), 16) / 255d;
        var azul = Convert.ToInt32(hex.Substring(5, 2), 16) / 255d;
        var maximo = Math.Max(vermelho, Math.Max(verde, azul));
        var minimo = Math.Min(vermelho, Math.Min(verde, azul));
        var diferenca = maximo - minimo;
        var luminosidade = (maximo + minimo) / 2;
        var matiz = 0d;
        var saturacao = 0d;

        if (diferenca != 0)
        {
            saturacao = diferenca / (1 - Math.Abs(2 * luminosidade - 1));
            if (maximo == vermelho) matiz = 60 * (((verde - azul) / diferenca) % 6);
            else if (maximo == verde) matiz = 60 * ((azul - vermelho) / diferenca + 2);
            else matiz = 60 * ((vermelho - verde) / diferenca + 4);
            if (matiz < 0) matiz += 360;
        }

        return ((int)Math.Round(matiz), (int)Math.Round(saturacao * 100), (int)Math.Round(luminosidade * 100));
    }

    private Dictionary<string, string>? ObterPaletaEditavel(PreferenciaTema tema) => tema switch
    {
        PreferenciaTema.Claro => paletaClara,
        PreferenciaTema.Escuro => paletaEscura,
        _ => null
    };

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

    public async ValueTask DisposeAsync()
    {
        if (modulo is not null) await modulo.DisposeAsync();
    }
}
