using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Capturar;

public sealed record ResultadoAutorizacaoMemoria(bool DadosValidos, bool Concedida);

public static class RegraEdicaoMemoria
{
    public static ResultadoAutorizacaoMemoria Resolver(
        MemoriaCapturaLocal memoria,
        ConfiguracaoCapturar? configuracao,
        DateTimeOffset agoraUtc,
        bool? autorizacaoDaSessao = null)
    {
        if (configuracao is null || configuracao.PrazoEdicaoMemoriaDias <= 0
            || !memoria.TemporalidadeConhecida || memoria.Complementos is null
            || string.IsNullOrWhiteSpace(memoria.Conteudo)
            || (memoria.PrimeiraPreservacaoUtc is { Offset: var offset } && offset != TimeSpan.Zero)
            || (memoria.PrimeiraPreservacaoUtc is { } marco && marco > agoraUtc))
            return new(false, false);

        if (autorizacaoDaSessao.HasValue)
            return new(true, autorizacaoDaSessao.Value);

        var concedida = memoria.PrimeiraPreservacaoUtc is null
            || agoraUtc < memoria.PrimeiraPreservacaoUtc.Value.AddDays(configuracao.PrazoEdicaoMemoriaDias);
        return new(true, concedida);
    }
}
