namespace Rememore.Client.Infraestrutura.Capturar;

public enum AbaOrigemEdicaoCaptura
{
    Memorar,
    Categorizar,
    Revisar
}

/// <summary>
/// Constrói as rotas que mantêm explícitos a origem e a memória de uma edição.
/// A rota é a fonte durável do contexto e continua válida após F5/Ctrl+R.
/// </summary>
public static class ContextoEdicaoCaptura
{
    public static AbaOrigemEdicaoCaptura InterpretarOrigem(string? valor, AbaOrigemEdicaoCaptura origemPadrao) =>
        valor?.Trim().ToLowerInvariant() switch
        {
            "memorar" => AbaOrigemEdicaoCaptura.Memorar,
            "categorizar" => AbaOrigemEdicaoCaptura.Categorizar,
            "revisar" => AbaOrigemEdicaoCaptura.Revisar,
            _ => origemPadrao
        };

    public static string RotaEdicaoMemoria(string dataRota, string identidade, AbaOrigemEdicaoCaptura origem, bool categoriaEmAtencao = false) =>
        $"editar-memoria/{Escapar(dataRota)}/{Escapar(identidade)}{Sufixo(origem, categoriaEmAtencao)}";

    public static string RotaCategorizacao(string dataRota, string identidade, AbaOrigemEdicaoCaptura origem, bool categoriaEmAtencao = false) =>
        $"categorizar/{Escapar(dataRota)}/{Escapar(identidade)}{Sufixo(origem, categoriaEmAtencao)}";

    public static string RotaRetorno(string dataRota, AbaOrigemEdicaoCaptura origem, string identidadeMemoria, bool categoriaEmAtencao = false)
    {
        var aba = Nome(origem);
        return $"capturar/{Escapar(dataRota)}?aba={aba}&memoria={Escapar(identidadeMemoria)}{(categoriaEmAtencao ? "&atencao=true" : string.Empty)}";
    }

    private static string Sufixo(AbaOrigemEdicaoCaptura origem, bool categoriaEmAtencao) =>
        $"?origem={Nome(origem)}{(categoriaEmAtencao ? "&atencao=true" : string.Empty)}";
    private static string Nome(AbaOrigemEdicaoCaptura origem) => origem.ToString().ToLowerInvariant();
    private static string Escapar(string valor) => Uri.EscapeDataString(valor);
}
