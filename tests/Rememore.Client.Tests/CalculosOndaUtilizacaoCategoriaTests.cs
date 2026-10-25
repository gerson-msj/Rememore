using Rememore.Client.Componentes;

namespace Rememore.Client.Tests;

public sealed class CalculosOndaUtilizacaoCategoriaTests
{
    [Fact]
    public void FiltraZerosValoresNegativosENaoFinitosSemAlterarOrdem()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular(
            [3, 0, 7, 0, 4, -1, double.NaN, double.PositiveInfinity, double.NegativeInfinity]);

        Assert.Equal(new[] { 3d, 7d, 4d }, resultado.SerieFiltrada);
        Assert.False(resultado.SemDados);
    }

    [Fact]
    public void SerieVaziaProduzQuatroValoresNeutros()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([0, -3, double.NaN, double.PositiveInfinity]);

        Assert.True(resultado.SemDados);
        Assert.Empty(resultado.SerieFiltrada);
        Assert.Equal(new[] { 0d, 0d, 0d, 0d }, resultado.ValoresAmostrados);
        Assert.Equal(new[] { 0d, 0d, 0d, 0d }, resultado.ValoresNormalizados);
    }

    [Fact]
    public void UmaOcorrenciaEConstanteFicamNoCentro()
    {
        var unica = CalculosOndaUtilizacaoCategoria.Calcular([5]);
        var constante = CalculosOndaUtilizacaoCategoria.Calcular([4, 4, 4, 4, 4, 4]);

        Assert.Equal(new[] { 5d, 5d, 5d, 5d }, unica.ValoresAmostrados);
        Assert.Equal(new[] { 0d, 0d, 0d, 0d }, unica.ValoresNormalizados);
        Assert.Equal(new[] { 4d, 4d, 4d, 4d }, constante.ValoresAmostrados);
        Assert.Equal(new[] { 0d, 0d, 0d, 0d }, constante.ValoresNormalizados);
    }

    [Fact]
    public void DuasOcorrenciasSaoExpandidasLinearmente()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([1, 7]);

        Assert.Equal(new[] { 1d, 3d, 5d, 7d }, resultado.ValoresAmostrados);
        AssertValoresAproximados(new[] { -1d, -1d / 3d, 1d / 3d, 1d }, resultado.ValoresNormalizados);
    }

    [Fact]
    public void TresValoresInterpolamPosicoesFracionariasSemArredondamento()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([2, 8, 5]);

        AssertValoresAproximados(new[] { 2d, 6d, 7d, 5d }, resultado.ValoresAmostrados);
        AssertValoresAproximados(new[] { -1d, 1d / 3d, 2d / 3d, 0d }, resultado.ValoresNormalizados);
    }

    [Fact]
    public void QuatroValoresPreservamAsAmostrasEUsamOsExtremosOriginais()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([2, 8, 4, 10]);

        Assert.Equal(new[] { 2d, 8d, 4d, 10d }, resultado.ValoresAmostrados);
        AssertValoresAproximados(new[] { -1d, 0.5d, -0.5d, 1d }, resultado.ValoresNormalizados);
    }

    [Fact]
    public void ReferenciaLongaComprimePelasPosicoesUniformes()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([1, 2, 3, 2, 20, 5, 6, 7, 6, 8, 9, 8, 11, 10, 12, 14, 15]);

        AssertValoresAproximados(new[] { 1d, 16d / 3d, 25d / 3d, 15d }, resultado.ValoresAmostrados);
        AssertValoresAproximados(new[] { -1d, (16d / 3d - 10.5d) / 9.5d, (25d / 3d - 10.5d) / 9.5d, 4.5d / 9.5d }, resultado.ValoresNormalizados);
    }

    [Fact]
    public void NormalizacaoUsaPicoOriginalMesmoQuandoAmostragemNaoOPreserva()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([1, 2, 3, 4, 100, 5, 6, 7, 8, 9]);

        Assert.DoesNotContain(100d, resultado.ValoresAmostrados);
        Assert.Equal(-1d, resultado.ValoresNormalizados[0], 10);
        Assert.Equal((4d - 50.5d) / 49.5d, resultado.ValoresNormalizados[1], 10);
        Assert.Equal((7d - 50.5d) / 49.5d, resultado.ValoresNormalizados[2], 10);
    }

    [Fact]
    public void EscalasProporcionaisGeramAFormaNormalizadaIgual()
    {
        var pequena = CalculosOndaUtilizacaoCategoria.Calcular([1, 2, 3, 4]);
        var grande = CalculosOndaUtilizacaoCategoria.Calcular([10, 20, 30, 40]);

        AssertValoresAproximados(pequena.ValoresNormalizados, grande.ValoresNormalizados);
    }

    [Fact]
    public void ValoresGrandesContinuamFinitos()
    {
        var resultado = CalculosOndaUtilizacaoCategoria.Calcular([1e308, 1.5e308, 1.7e308]);

        Assert.All(resultado.ValoresAmostrados, valor => Assert.True(double.IsFinite(valor)));
        Assert.All(resultado.ValoresNormalizados, valor => Assert.True(double.IsFinite(valor)));
    }

    [Theory]
    [MemberData(nameof(FormasDeCurva))]
    public void CurvaCubicaPermaneceMonotonaEntreCadaParDeAncora(double[] pontos)
    {
        var segmentos = CalculosOndaUtilizacaoCategoria.CriarSegmentos(pontos);
        var alturas = pontos.Select(valor => 50d - 40d * valor).ToArray();

        Assert.Equal(3, segmentos.Count);
        for (var indice = 0; indice < segmentos.Count; indice++)
        {
            var segmento = segmentos[indice];
            Assert.Equal(indice == 2 ? 100d : (indice + 1) * 100d / 3d, segmento.XFim, 10);
            var alturaInicial = alturas[indice];
            var alturaFinal = alturas[indice + 1];
            var sentido = Math.Sign(alturaFinal - alturaInicial);
            var anterior = alturaInicial;

            for (var amostra = 1; amostra <= 100; amostra++)
            {
                var t = amostra / 100d;
                var atual = AvaliarBezier(alturaInicial, segmento.YControle1, segmento.YControle2, alturaFinal, t);
                Assert.InRange(atual, Math.Min(alturaInicial, alturaFinal) - 1e-10, Math.Max(alturaInicial, alturaFinal) + 1e-10);
                Assert.True(sentido == 0 ? Math.Abs(atual - anterior) < 1e-10 : Math.Sign(atual - anterior) == sentido);
                anterior = atual;
            }
        }
    }

    public static IEnumerable<object[]> FormasDeCurva()
    {
        yield return new object[] { new[] { -1d, -0.5d, 0.25d, 1d } };
        yield return new object[] { new[] { -1d, 0.8d, 0.2d, -0.5d } };
        yield return new object[] { new[] { 0d, 0d, 0d, 0d } };
        yield return new object[] { new[] { 0.9d, -0.8d, 0.75d, -0.7d } };
    }

    private static double AvaliarBezier(double inicio, double controle1, double controle2, double fim, double t)
    {
        var complemento = 1d - t;
        return complemento * complemento * complemento * inicio
            + 3d * complemento * complemento * t * controle1
            + 3d * complemento * t * t * controle2
            + t * t * t * fim;
    }

    private static void AssertValoresAproximados(
        IReadOnlyList<double> esperados,
        IReadOnlyList<double> atuais,
        int precisao = 10)
    {
        Assert.Equal(esperados.Count, atuais.Count);
        for (var indice = 0; indice < esperados.Count; indice++)
            Assert.Equal(esperados[indice], atuais[indice], precisao);
    }
}
