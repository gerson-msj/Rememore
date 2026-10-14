namespace Rememore.Client.Infraestrutura;

public sealed class CadastroPorConviteSimulado : ICadastroPorConvite
{
    public Task<ResultadoCadastro> CadastrarAsync(string convite, string nomeNormalizado, string senha)
    {
        var conviteValido = convite == "usuario";
        var nomeValido = nomeNormalizado == "usuario"
            && !NormalizacaoNomeUsuario.TemEspacoInterno(nomeNormalizado);
        var senhaValida = senha.Length >= 6;
        var chave = conviteValido && nomeValido && senhaValida
            ? Guid.NewGuid().ToString("D")
            : null;

        return Task.FromResult(new ResultadoCadastro(conviteValido, nomeValido, senhaValida, chave));
    }
}
