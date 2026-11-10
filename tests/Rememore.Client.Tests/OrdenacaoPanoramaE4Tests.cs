using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Tests;

public sealed class OrdenacaoPanoramaE4Tests
{
    private static readonly CategoriaPanoramaCalculada[] Categorias =
    [
        new("a", "Alfa", 3, 1, null),
        new("b", "Beta", 2, .81, 50),
        new("c", "Charlie", 5, .6, -50),
        new("d", "Delta", 2, .8, 0)
    ];

    [Fact]
    public void DisponibilidadeExigeDoisDiasEDuasCategoriasIndependentes()
    {
        Assert.False(CalculosPanorama.AcervoDisponivel([Dia("2026-11-01", ("familia", 0)), Dia("2026-11-02", ("familia", null))]));
        Assert.False(CalculosPanorama.AcervoDisponivel([Dia("2026-11-01", ("familia", 0), ("trabalho", 2))]));
        Assert.True(CalculosPanorama.AcervoDisponivel([Dia("2026-11-01", ("familia", 0)), Dia("2026-11-03", ("trabalho", null))]));
    }

    [Fact]
    public void RepresentatividadeOrdenaEmAmbosSentidosComDesempatePorNome()
    {
        Assert.Equal(["c", "a", "b", "d"], Ordenar("Representatividade", "Positivo"));
        Assert.Equal(["b", "d", "a", "c"], Ordenar("Representatividade", "Negativo"));
    }

    [Fact]
    public void TomPositivoENegativoMantemNulosAoFimEUsaRepresentatividadeNosEmpates()
    {
        Assert.Equal(["b", "d", "c", "a"], Ordenar("Tom", "Positivo"));
        Assert.Equal(["c", "d", "b", "a"], Ordenar("Tom", "Negativo"));
    }

    [Fact]
    public void TomNuloAgrupaSemTomPrimeiroESemOrdenarOsDefinidosPorValor()
    {
        Assert.Equal(["a", "b", "d", "c"], Ordenar("Tom", "Nulo"));
    }

    [Fact]
    public void EstadosAlternamECriterioNovoReiniciaEmPositivo()
    {
        var estado = EstadoOrdenacaoPanorama.Inicial;
        Assert.Equal(new("Representatividade", "Negativo"), estado.AlternarRepresentatividade());
        Assert.Equal(new("Tom", "Positivo"), estado.AlternarTom());
        estado = new("Tom", "Positivo");
        Assert.Equal(new("Tom", "Negativo"), estado.AlternarTom());
        Assert.Equal(new("Tom", "Nulo"), estado.AlternarTom().AlternarTom());
        Assert.Equal(new("Representatividade", "Positivo"), new EstadoOrdenacaoPanorama("Tom", "Nulo").AlternarRepresentatividade());
    }

    private static string[] Ordenar(string criterio, string sentido) => OrdenacaoPanorama
        .Ordenar(Categorias, new(criterio, sentido)).Select(categoria => categoria.Identidade).ToArray();

    private static BlocoDiaPanoramaRemoto Dia(string data, params (string Categoria, int? Tom)[] associacoes) =>
        new(data, associacoes.Select(item => new AssociacaoPanoramaRemota(item.Categoria, item.Tom)).ToArray());
}
