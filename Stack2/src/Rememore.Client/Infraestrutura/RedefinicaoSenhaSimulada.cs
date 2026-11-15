namespace Rememore.Client.Infraestrutura;

public sealed class RedefinicaoSenhaSimulada : IRedefinicaoSenha
{
    public Task<ResultadoRedefinicaoSenha> RedefinirAsync(string nomeNormalizado, string chave, string novaSenha)
    {
        var aceita = nomeNormalizado == "usuario" && chave == "usuario" && novaSenha.Length >= 6;
        var novaChave = aceita ? Guid.NewGuid().ToString("D") : null;
        return Task.FromResult(new ResultadoRedefinicaoSenha(aceita, novaChave));
    }
}
