using Rememore.Client.Infraestrutura;

namespace Rememore.Client.Tests;

public sealed class MovimentoSeletorTests
{
    [Fact]
    public void PadraoDoSeletorSeparaCliqueEArrasteEmQuinhentosMilissegundos()
    {
        Assert.Equal(500, RespostaSeletor.PadraoTom.AtrasoMs);
        Assert.Equal(CurvaRespostaSeletor.EaseIn, RespostaSeletor.PadraoTom.Curva);
        Assert.Equal(CurvaRespostaSeletor.EaseIn, RespostaSeletor.PadraoTom.CurvaClique);
        Assert.Equal(CurvaRespostaSeletor.EaseInOut, RespostaSeletor.PadraoTom.CurvaArraste);
    }

    [Fact]
    public void AtrasoZeroMoveImediatamenteAoAlvo()
    {
        var resultado = MovimentoSeletor.Avancar(0.2, 0.8, 0, 0.016, new(0, CurvaRespostaSeletor.EaseOut));
        Assert.Equal(0.8, resultado.Valor);
        Assert.True(resultado.Concluido);
    }

    [Theory]
    [InlineData(CurvaRespostaSeletor.Linear)]
    [InlineData(CurvaRespostaSeletor.EaseIn)]
    [InlineData(CurvaRespostaSeletor.EaseOut)]
    [InlineData(CurvaRespostaSeletor.EaseInOut)]
    public void CurvasMovemMonotonicamenteEPermitemReversao(CurvaRespostaSeletor curva)
    {
        var resposta = new RespostaSeletor(1000, curva);
        var atual = 0d;
        var velocidade = 0d;
        for (var indice = 0; indice < 100; indice++)
        {
            var proximo = MovimentoSeletor.Avancar(atual, 1, velocidade, 0.016, resposta);
            Assert.InRange(proximo.Valor, atual, 1);
            atual = proximo.Valor;
            velocidade = proximo.Velocidade;
        }
        Assert.True(atual > 0);

        var reversao = MovimentoSeletor.Avancar(atual, 0, velocidade, 0.064, resposta);
        Assert.InRange(reversao.Valor, 0, atual);
    }

    [Fact]
    public void LimitaDecorridoPorQuadroEEntradasInvalidas()
    {
        var resposta = new RespostaSeletor(1000, CurvaRespostaSeletor.EaseOut);
        var quadroCurto = MovimentoSeletor.Avancar(0, 1, 0, 0.064, resposta);
        var quadroLongo = MovimentoSeletor.Avancar(0, 1, 0, 2, resposta);
        Assert.Equal(quadroCurto.Valor, quadroLongo.Valor, 12);
        Assert.InRange(MovimentoSeletor.Avancar(-5, 7, 0, 0.016, resposta).Valor, 0, 1);
        var valorNaoFinito = MovimentoSeletor.Avancar(double.NaN, 0.5, 0, 0.016, resposta).Valor;
        Assert.InRange(valorNaoFinito, 0, 1);
        Assert.False(double.IsNaN(valorNaoFinito));
    }
}
