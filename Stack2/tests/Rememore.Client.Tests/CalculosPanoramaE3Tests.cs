using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Tests;

public sealed class CalculosPanoramaE3Tests
{
    [Fact]
    public void IntervaloIncluiExtremosContaAssociacoesMulticategoriaECalculaRaizDeProporcao()
    {
        var resultado = CalculosPanorama.Calcular(
        [
            Dia("2025-01-01", ("familia", 10), ("familia", null), ("trabalho", -10), ("sem-tom", null)),
            Dia("2025-01-04", ("familia", 0), ("historica-inativa", 100), ("sem-tom", null)),
            Dia("2025-01-10", ("fora", 100))
        ],
        [
            Categoria("familia", "Família"), Categoria("trabalho", "Trabalho"),
            Categoria("sem-tom", "Sem Tom"), Categoria("historica-inativa", "Histórica", ativa: false),
            Categoria("fora", "Fora do período")
        ],
        new(2025, 1, 1), new(2025, 1, 4));

        Assert.Equal(4, resultado.Categorias.Count);
        var familia = resultado.Categorias.Single(item => item.Identidade == "familia");
        var trabalho = resultado.Categorias.Single(item => item.Identidade == "trabalho");
        var semTom = resultado.Categorias.Single(item => item.Identidade == "sem-tom");
        var historica = resultado.Categorias.Single(item => item.Identidade == "historica-inativa");
        Assert.Equal(3, familia.QuantidadeAssociacoes);
        Assert.Equal(1d, familia.Representatividade);
        Assert.Equal(5d, familia.TomMedio);
        Assert.Equal(Math.Sqrt(1d / 3d), trabalho.Representatividade, 12);
        Assert.Equal(-10d, trabalho.TomMedio);
        Assert.Equal(2, semTom.QuantidadeAssociacoes);
        Assert.Equal(Math.Sqrt(2d / 3d), semTom.Representatividade, 12);
        Assert.Null(semTom.TomMedio);
        Assert.Equal(100d, historica.TomMedio);
        Assert.Equal(25d, resultado.TomMedioJanela);
    }

    [Fact]
    public void TomZeroParticipaDaMediaESemTonsDefinidosMantemTomNulo()
    {
        var resultado = CalculosPanorama.Calcular(
        [Dia("2025-02-01", ("zero", 0), ("zero", 20), ("nulo", null), ("nulo", null))],
        [Categoria("zero", "Zero"), Categoria("nulo", "Nulos")],
        new(2025, 2, 1), new(2025, 2, 1));

        Assert.Equal(10d, resultado.Categorias.Single(item => item.Identidade == "zero").TomMedio);
        Assert.Null(resultado.Categorias.Single(item => item.Identidade == "nulo").TomMedio);
        Assert.Equal(10d, resultado.TomMedioJanela);
    }

    [Fact]
    public void RecorteSemAssociacoesNaoInventaCategoriaNemTom()
    {
        var resultado = CalculosPanorama.Calcular(
            [Dia("2025-03-01", ("familia", 30))],
            [Categoria("familia", "Família")],
            new(2025, 3, 2), new(2025, 3, 4));

        Assert.Empty(resultado.Categorias);
        Assert.Null(resultado.TomMedioJanela);
    }

    [Fact]
    public void CategoriaAusenteNoCatalogoFalhaEmVezDeSumirSilenciosamente()
    {
        Assert.Throws<InvalidOperationException>(() => CalculosPanorama.Calcular(
            [Dia("2025-03-01", ("sem-cadastro", 0))],
            [], new(2025, 3, 1), new(2025, 3, 1)));
    }

    private static CategoriaPreservadaRemota Categoria(string id, string nome, bool ativa = true) => new(id, nome, 1, ativa);

    private static BlocoDiaPanoramaRemoto Dia(string data, params (string Categoria, int? Tom)[] associacoes) =>
        new(data, associacoes.Select(item => new AssociacaoPanoramaRemota(item.Categoria, item.Tom)).ToArray());
}
