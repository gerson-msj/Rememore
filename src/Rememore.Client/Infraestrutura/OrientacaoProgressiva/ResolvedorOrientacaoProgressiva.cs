namespace Rememore.Client.Infraestrutura.OrientacaoProgressiva;

public sealed class ResolvedorOrientacaoProgressiva(
    IFonteNivelOrientacao fonteNivel,
    CatalogoOrientacoes catalogo) : IOrientacaoProgressiva
{
    public async Task<string?> ObterTextoAsync(string contexto)
    {
        var definicao = catalogo.Obter(contexto);
        var nivel = await fonteNivel.ObterNivelAsync();

        return nivel switch
        {
            NivelOrientacao.Iniciante => definicao.Iniciante,
            NivelOrientacao.Intermediario => definicao.Intermediario,
            NivelOrientacao.Avancado => definicao.Avancado,
            _ => throw new InvalidOperationException($"Nível de orientação inválido: {nivel}.")
        };
    }
}

public sealed class FonteNivelOrientacaoSimulada : IFonteNivelOrientacao
{
    public NivelOrientacao NivelAtual { get; set; } = NivelOrientacao.Iniciante;

    public Task<NivelOrientacao> ObterNivelAsync() => Task.FromResult(NivelAtual);
}
