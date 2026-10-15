namespace Rememore.Client.Infraestrutura.OrientacaoProgressiva;

public static class ContextosOrientacao
{
    public const string SelecaoCapturar = "capturar.selecao";
}

public enum NivelOrientacao
{
    Iniciante,
    Intermediario,
    Avancado
}

public sealed record DefinicaoOrientacao(
    string Contexto,
    string? Iniciante,
    string? Intermediario,
    string? Avancado);

public interface IFonteNivelOrientacao
{
    Task<NivelOrientacao> ObterNivelAsync();
}

public interface IOrientacaoProgressiva
{
    Task<string?> ObterTextoAsync(string contexto);
}
