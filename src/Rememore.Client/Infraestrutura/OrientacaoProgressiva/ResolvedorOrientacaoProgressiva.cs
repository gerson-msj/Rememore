namespace Rememore.Client.Infraestrutura.OrientacaoProgressiva;

public sealed class ResolvedorOrientacaoProgressiva(
    IFonteNivelOrientacao fonteNivel,
    CatalogoOrientacoes catalogo) : IOrientacaoProgressiva
{
    public async Task<string?> ObterTextoAsync(string contexto)
    {
        var nivel = await fonteNivel.ObterNivelAsync();
        return ObterTextoAsync(contexto, nivel);
    }

    public string? ObterTextoAsync(string contexto, NivelOrientacao nivel)
    {
        var definicao = catalogo.Obter(contexto);

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
    public NivelOrientacao NivelAtual { get; set; } = NivelOrientacao.Intermediario;

    public Task<NivelOrientacao> ObterNivelAsync() => Task.FromResult(NivelAtual);
}
