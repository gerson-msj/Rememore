namespace Rememore.Client.Infraestrutura;

public sealed record ResultadoCadastro(bool ConviteValido, bool NomeDisponivel, bool SenhaValida, string? ChaveRedefinicao)
{
    public bool Aceito => ConviteValido && NomeDisponivel && SenhaValida && ChaveRedefinicao is not null;
}

public interface ICadastroPorConvite
{
    Task<ResultadoCadastro> CadastrarAsync(string convite, string nomeNormalizado, string senha);
}
