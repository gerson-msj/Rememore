namespace Rememore.Client.Infraestrutura;

public sealed class AutenticadorSimulado : IAutenticador
{
    public async Task<ResultadoAutenticacao> AutenticarAsync(string nomeNormalizado, string senha)
    {
        await Task.Yield();
        var nomeInterpretado = NormalizacaoNomeUsuario.Normalizar(nomeNormalizado);
        var nomeValido = nomeInterpretado == "usuario" && !NormalizacaoNomeUsuario.TemEspacoInterno(nomeInterpretado);
        return new ResultadoAutenticacao(nomeValido && !string.IsNullOrWhiteSpace(senha));
    }
}
