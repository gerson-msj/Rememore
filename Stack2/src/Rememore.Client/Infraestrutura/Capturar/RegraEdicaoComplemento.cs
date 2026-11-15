using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Capturar;

public static class RegraEdicaoComplemento
{
    public static ResultadoAutorizacaoMemoria Resolver(ComplementoCapturaLocal complemento,
        ConfiguracaoCapturar? configuracao, DateTimeOffset agoraUtc, bool? autorizacaoDaSessao = null)
    {
        if (configuracao is null || configuracao.PrazoEdicaoMemoriaDias <= 0
            || string.IsNullOrWhiteSpace(complemento.Identidade) || string.IsNullOrWhiteSpace(complemento.Conteudo)
            || complemento.Ordem < 0 || !complemento.TemporalidadeConhecida
            || (complemento.PrimeiraPreservacaoUtc is { Offset: var offset } && offset != TimeSpan.Zero)
            || (complemento.PrimeiraPreservacaoUtc is { } marco && marco > agoraUtc))
            return new(false, false);

        if (autorizacaoDaSessao.HasValue) return new(true, autorizacaoDaSessao.Value);
        var concedida = complemento.PrimeiraPreservacaoUtc is null
            || agoraUtc < complemento.PrimeiraPreservacaoUtc.Value.AddDays(configuracao.PrazoEdicaoMemoriaDias);
        return new(true, concedida);
    }
}
