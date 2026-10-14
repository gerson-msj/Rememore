namespace Rememore.Client.Infraestrutura;

public enum OrigemChavePendente
{
    Cadastro,
    RedefinicaoSenha
}

public sealed record ContextoChavePendente(
    int Versao,
    Guid IdentificadorContexto,
    OrigemChavePendente Origem,
    string Chave);

public interface IContextoChavePendente
{
    Task<ContextoChavePendente> CriarAsync(OrigemChavePendente origem, string chave);
    Task<ContextoChavePendente?> RestaurarAsync(OrigemChavePendente origem);
    Task<bool> ConsumirAsync(OrigemChavePendente origem, Guid identificadorContexto);
    Task ReporAsync(ContextoChavePendente contexto);
}
