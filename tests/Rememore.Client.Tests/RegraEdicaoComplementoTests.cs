using Rememore.Client.Infraestrutura.Capturar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public sealed class RegraEdicaoComplementoTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 1, 12, 0, 0, TimeSpan.Zero);

    [Theory]
    [InlineData(-2, true)]
    [InlineData(-3, false)]
    [InlineData(-4, false)]
    public void PrazoDoComplementoUsaPrimeiraPreservacao(int dias, bool esperada)
    {
        var resultado = RegraEdicaoComplemento.Resolver(Complemento(Agora.AddDays(dias)), new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, esperada), resultado);
    }

    [Fact]
    public void ComplementoNuncaPreservadoPodeSerEditado()
    {
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, true), RegraEdicaoComplemento.Resolver(Complemento(), new(3), Agora));
    }

    [Fact]
    public void AutorizacaoDaSessaoSobreviveAoVencimento()
    {
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, true),
            RegraEdicaoComplemento.Resolver(Complemento(Agora.AddDays(-4)), new(3), Agora, true));
    }

    [Fact]
    public void MetadadosInvalidosNaoPodemSerLiberadosPelaSessao()
    {
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false),
            RegraEdicaoComplemento.Resolver(Complemento() with { TemporalidadeConhecida = false }, new(3), Agora, true));
    }

    private static ComplementoCapturaLocal Complemento(DateTimeOffset? marco = null) =>
        new("c1", "conteúdo", 0, marco, true);
}
