namespace Rememore.Client.Infraestrutura;

public sealed record ResultadoAutenticacao(bool Autenticado);

public interface IAutenticador
{
    Task<ResultadoAutenticacao> AutenticarAsync(string nomeNormalizado, string senha);
}
