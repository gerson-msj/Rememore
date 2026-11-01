using Rememore.Client.Infraestrutura.Capturar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public sealed class RegraEdicaoMemoriaTests
{
    private static readonly DateTimeOffset Agora = new(2026, 11, 1, 12, 0, 0, TimeSpan.Zero);

    [Fact]
    public void NuncaPreservadaPermaneceEditavel()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(), new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, true), resultado);
    }

    [Fact]
    public void PreservadaAntesDoPrazoEditavel()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(Agora.AddDays(-2)), new(3), Agora);
        Assert.True(resultado.Concedida);
    }

    [Fact]
    public void ExatamenteNoPrazoTornaHistorica()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(Agora.AddDays(-3)), new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, false), resultado);
    }

    [Fact]
    public void PreservacaoPosteriorNaoReiniciaMarcoInicial()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(Agora.AddDays(-4)), new(3), Agora);
        Assert.False(resultado.Concedida);
    }

    [Fact]
    public void AutorizacaoRestauradaMantemSessaoAposVencimento()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(Agora.AddDays(-4)), new(3), Agora, true);
        Assert.Equal(new ResultadoAutorizacaoMemoria(true, true), resultado);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void PrazoInvalidoNaoAutoriza(int dias)
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(), new(dias), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false), resultado);
    }

    [Fact]
    public void MetadadosDesconhecidosNaoAutorizam()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria() with { TemporalidadeConhecida = false }, new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false), resultado);
    }

    [Fact]
    public void ColecaoDeComplementosDesconhecidaNaoAutoriza()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria() with { Complementos = null }, new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false), resultado);
    }

    [Fact]
    public void ConteudoConfirmadoVazioNaoAutoriza()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria() with { Conteudo = "  " }, new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false), resultado);
    }

    [Fact]
    public void MarcoNoFuturoNaoAutoriza()
    {
        var resultado = RegraEdicaoMemoria.Resolver(Memoria(Agora.AddMinutes(1)), new(3), Agora);
        Assert.Equal(new ResultadoAutorizacaoMemoria(false, false), resultado);
    }

    private static MemoriaCapturaLocal Memoria(DateTimeOffset? primeiraPreservacaoUtc = null) =>
        new("mem-1", "memória", 0, primeiraPreservacaoUtc, true, []);
}
