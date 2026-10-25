using Rememore.Client.Componentes;

namespace Rememore.Client.Tests;

public sealed class CalculosVariacaoTomCategoriaTests
{
    [Fact]
    public void ColecaoVaziaOuApenasNulosNaoDefineTom()
    {
        var vazia = CalculosVariacaoTomCategoria.Calcular([]);
        var nulos = CalculosVariacaoTomCategoria.Calcular([null, null]);

        Assert.True(vazia.Ausente);
        Assert.Equal(0, vazia.QuantidadeTonsDefinidos);
        Assert.Null(vazia.MediaNegativa);
        Assert.Null(vazia.MediaPositiva);
        Assert.Equal(0d, vazia.LarguraNegativaPercentual);
        Assert.Equal(0d, vazia.LarguraPositivaPercentual);

        Assert.True(nulos.Ausente);
        Assert.Equal(0, nulos.QuantidadeTonsDefinidos);
        Assert.Null(nulos.MediaNegativa);
        Assert.Null(nulos.MediaPositiva);
    }

    [Fact]
    public void CalculaCadaPolaridadeSeparadamenteEContaZeroComoDefinido()
    {
        var resultado = CalculosVariacaoTomCategoria.Calcular([-80, -20, 20, 60, 0, null]);

        Assert.Equal(-50d, resultado.MediaNegativa.GetValueOrDefault());
        Assert.Equal(40d, resultado.MediaPositiva.GetValueOrDefault());
        Assert.Equal(5, resultado.QuantidadeTonsDefinidos);
        Assert.True(resultado.TomDefinido);
    }

    [Fact]
    public void ZerosDefinemNeutralidadeSemEntrarNasMedias()
    {
        var resultado = CalculosVariacaoTomCategoria.Calcular([0, 0, null]);

        Assert.True(resultado.TomDefinido);
        Assert.Equal(2, resultado.QuantidadeTonsDefinidos);
        Assert.Null(resultado.MediaNegativa);
        Assert.Null(resultado.MediaPositiva);
    }

    [Fact]
    public void PolaridadeAusenteNaoRecebeExtensao()
    {
        var somenteNegativos = CalculosVariacaoTomCategoria.Calcular([-80, -20]);
        var somentePositivos = CalculosVariacaoTomCategoria.Calcular([20, 60]);

        Assert.Equal(-50d, somenteNegativos.MediaNegativa.GetValueOrDefault());
        Assert.Null(somenteNegativos.MediaPositiva);
        Assert.Equal(25d, somenteNegativos.LarguraNegativaPercentual);
        Assert.Equal(0d, somenteNegativos.LarguraPositivaPercentual);

        Assert.Null(somentePositivos.MediaNegativa);
        Assert.Equal(40d, somentePositivos.MediaPositiva.GetValueOrDefault());
        Assert.Equal(0d, somentePositivos.LarguraNegativaPercentual);
        Assert.Equal(20d, somentePositivos.LarguraPositivaPercentual);
    }

    [Fact]
    public void ProjetaExtremosEMediasLinearmenteEmCadaMetade()
    {
        var resultado = CalculosVariacaoTomCategoria.Calcular([-100, 100, -80, 60, 90]);

        Assert.Equal(-90d, resultado.MediaNegativa.GetValueOrDefault());
        Assert.Equal(250d / 3d, resultado.MediaPositiva.GetValueOrDefault(), 10);
        Assert.Equal(45d, resultado.LarguraNegativaPercentual);
        Assert.Equal(125d / 3d, resultado.LarguraPositivaPercentual, 10);

        var extremos = CalculosVariacaoTomCategoria.Calcular([-100, 100]);
        Assert.Equal(50d, extremos.LarguraNegativaPercentual);
        Assert.Equal(50d, extremos.LarguraPositivaPercentual);
    }

    [Fact]
    public void AlterarUmaPolaridadeNaoAlteraAMediaDaOutra()
    {
        var original = CalculosVariacaoTomCategoria.Calcular([-80, -20, 20, 60]);
        var alterado = CalculosVariacaoTomCategoria.Calcular([-80, -20, 20, 60, 100]);

        Assert.Equal(original.MediaNegativa, alterado.MediaNegativa);
        Assert.Equal(-50d, alterado.MediaNegativa);
        Assert.Equal(40d, original.MediaPositiva);
        Assert.Equal(60d, alterado.MediaPositiva);
    }
}
