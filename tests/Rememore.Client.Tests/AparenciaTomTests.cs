using Rememore.Client.Infraestrutura;

namespace Rememore.Client.Tests;

public sealed class AparenciaTomTests
{
    [Fact]
    public void AusenciaPermaneceForaDaCurvaEVisualNeutra()
    {
        Assert.Null(AparenciaTom.Transformar(null));
        var visual = AparenciaTom.Obter(null);
        Assert.Equal("aparencia-tom", visual.Classes);
        Assert.Empty(visual.Estilo);
    }

    [Theory]
    [InlineData(0, 0)]
    [InlineData(20, 50)]
    [InlineData(-20, -50)]
    [InlineData(37, 60.625)]
    [InlineData(-37, -60.625)]
    [InlineData(100, 100)]
    [InlineData(-100, -100)]
    public void CurvaOficialMantemPontosAprovados(int tom, double esperado)
    {
        Assert.Equal(esperado, AparenciaTom.Transformar(tom)!.Value, 10);
    }

    [Fact]
    public void CurvaESimetricaEMonotonaComLimitesControlados()
    {
        double anterior = -101;
        for (var tom = -100; tom <= 100; tom++)
        {
            var visual = AparenciaTom.Transformar(tom)!.Value;
            Assert.InRange(visual, -100, 100);
            Assert.True(visual >= anterior);
            Assert.Equal(-visual, AparenciaTom.Transformar(-tom)!.Value, 10);
            anterior = visual;
        }
    }

    [Theory]
    [InlineData(-500, -100)]
    [InlineData(500, 100)]
    public void EntradasForaDoDominioSaoLimitadasSemAlterarEntrada(int entrada, int extremo)
    {
        Assert.Equal((double)Math.Sign(extremo) * 100, AparenciaTom.Transformar(entrada));
        Assert.Contains($"--tom-{(extremo < 0 ? "negativo" : "positivo")}", AparenciaTom.Obter(entrada).Estilo);
        var valorFuncional = entrada;
        _ = AparenciaTom.Transformar(valorFuncional);
        Assert.Equal(entrada, valorFuncional);
    }

    [Fact]
    public void AparenciaCompoeTokensSemCodificarCorNemCurvaDeExperimento()
    {
        var visual = AparenciaTom.Obter(37);
        Assert.Contains("--tom-extremo:var(--tom-positivo)", visual.Estilo);
        Assert.Contains("--tom-peso:60.625%", visual.Estilo);
        Assert.Contains("tom-fundo", visual.Classes);
        Assert.Contains("tom-borda", visual.Classes);
        Assert.DoesNotContain("#", visual.Estilo);
    }

    [Fact]
    public void IntensidadeNegativaUsaPesoPositivoEPreservaPolaridadeNoToken()
    {
        var visual = AparenciaTom.Obter(-37);
        Assert.Contains("--tom-extremo:var(--tom-negativo)", visual.Estilo);
        Assert.Contains("--tom-peso:60.625%", visual.Estilo);
    }

    [Fact]
    public void CurvaLinearExperimentalNaoMudaAOficial()
    {
        Assert.Contains("--tom-peso:37%", AparenciaTom.ObterLinear(37).Estilo);
        Assert.Equal(60.625, AparenciaTom.Transformar(37)!.Value, 10);
    }
}
