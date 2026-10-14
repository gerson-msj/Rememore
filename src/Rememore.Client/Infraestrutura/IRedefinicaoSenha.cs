namespace Rememore.Client.Infraestrutura;

public sealed record ResultadoRedefinicaoSenha(bool Aceita, string? NovaChave);

public interface IRedefinicaoSenha
{
    Task<ResultadoRedefinicaoSenha> RedefinirAsync(string nomeNormalizado, string chave, string novaSenha);
}
