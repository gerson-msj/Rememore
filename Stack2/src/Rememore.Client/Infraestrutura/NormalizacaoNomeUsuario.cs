namespace Rememore.Client.Infraestrutura;

public static class NormalizacaoNomeUsuario
{
    public static string Normalizar(string? nome) => (nome ?? "").Trim().ToLowerInvariant();

    public static bool TemEspacoInterno(string nomeNormalizado) => nomeNormalizado.Any(char.IsWhiteSpace);
}
