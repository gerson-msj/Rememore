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

    [Theory]
    [InlineData(20d, 50d)]
    [InlineData(-20d, -50d)]
    [InlineData(37.5d, 60.9375d)]
    [InlineData(-37.5d, -60.9375d)]
    [InlineData(100d / 15d, 16.666666666666668d)]
    [InlineData(0d, 0d)]
    public void CurvaOficialPreservaTomFracionario(double tom, double esperado)
    {
        Assert.Equal(esperado, AparenciaTom.TransformarPrecisao(tom)!.Value, 10);
    }

    [Fact]
    public void AparenciaFracionariaPreservaPrecisaoPolaridadeZeroENulo()
    {
        var positivo = AparenciaTom.ObterPrecisao(60d / 7d);
        var negativo = AparenciaTom.ObterPrecisao(-60d / 7d);
        var zero = AparenciaTom.ObterPrecisao(0d);
        var nulo = AparenciaTom.ObterPrecisao(null);

        Assert.Contains("--tom-extremo:var(--tom-positivo)", positivo.Estilo);
        Assert.Equal(AparenciaTom.TransformarPrecisao(60d / 7d)!.Value.ToString("0.################", System.Globalization.CultureInfo.InvariantCulture),
            LerPeso(positivo.Estilo)?.TrimEnd('%'));
        Assert.Contains("--tom-extremo:var(--tom-negativo)", negativo.Estilo);
        Assert.Contains("--tom-peso:0%", zero.Estilo);
        Assert.Equal("aparencia-tom", nulo.Classes);
        Assert.Empty(nulo.Estilo);
    }

    [Fact]
    public void CurvaComPrecisaoMantemAparenciaAprovadaParaTodosOsInteiros()
    {
        for (var tom = -100; tom <= 100; tom++)
        {
            var aparenciaInteira = AparenciaTom.Obter(tom);
            var aparenciaPrecisa = AparenciaTom.ObterPrecisao(tom);

            Assert.Equal(aparenciaInteira.Classes, aparenciaPrecisa.Classes);
            Assert.Equal(aparenciaInteira.Estilo, aparenciaPrecisa.Estilo);
        }
    }

    [Theory]
    [InlineData(100d, 20, 50, 100d)]
    [InlineData(37.5d, 20, 50, 60.9375d)]
    [InlineData(-20d, 20, 50, -50d)]
    [InlineData(10d, 20, 0, 0d)]
    [InlineData(10d, 20, 100, 50d)]
    [InlineData(100d, 99, 100, 100d)]
    public void CurvaParametrizadaMantemLimitesEPrecisa(double tom, int limiar, int intensidade, double esperado)
    {
        Assert.Equal(esperado, AparenciaTom.TransformarPrecisao(tom, limiar, intensidade)!.Value, 10);
    }

    [Fact]
    public void CurvaLinearPrecisaPreservaFracaoEContinuaForaDaEscalaQuandoAusente()
    {
        var visual = AparenciaTom.ObterLinearPrecisao(20d / 3d);

        Assert.Equal(20d / 3d, double.Parse(LerPeso(visual.Estilo)!.TrimEnd('%'), System.Globalization.CultureInfo.InvariantCulture), 12);
        Assert.Equal("aparencia-tom", AparenciaTom.ObterLinearPrecisao(null).Classes);
    }

    private static string? LerPeso(string estilo) => estilo
        .Split(';', StringSplitOptions.RemoveEmptyEntries)
        .Select(propriedade => propriedade.Trim())
        .Where(propriedade => propriedade.StartsWith("--tom-peso:", StringComparison.Ordinal))
        .Select(propriedade => propriedade["--tom-peso:".Length..])
        .SingleOrDefault();
}
