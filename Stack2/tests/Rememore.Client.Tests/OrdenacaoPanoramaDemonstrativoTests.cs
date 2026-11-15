using Rememore.Client.Componentes.Lab;
using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Tests;

public sealed class OrdenacaoPanoramaDemonstrativoTests
{
    [Fact]
    public void LaboratorioUsaOsMesmoEstadosDeTransicaoDaPagina()
    {
        var estado = EstadoOrdenacaoPanorama.Inicial;
        Assert.Equal(EstadoOrdenacaoPanorama.Inicial.AlternarRepresentatividade(),
            OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Representatividade));
        Assert.Equal(new("Tom", "Positivo"),
            OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Tom));
        estado = new("Tom", "Positivo");
        Assert.Equal(estado.AlternarTom(),
            OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Tom));
        Assert.Equal(new("Representatividade", "Positivo"),
            OrdenacaoPanoramaDemonstrativo.Avancar(new("Tom", "Nulo"), CriterioOrdenacaoPanorama.Representatividade));
    }

    [Fact]
    public void LaboratorioEPaginaAplicamAsMesmasRegrasDeOrdenacao()
    {
        var demonstrativas = Categorias();
        var pagina = demonstrativas.Select(categoria => new CategoriaPanoramaCalculada(
            categoria.IdentificadorCategoria, categoria.NomeCategoria, categoria.QuantidadeAssociacoes,
            categoria.Representatividade, categoria.TomMedio)).ToArray();

        foreach (var estado in new[]
                 {
                     new EstadoOrdenacaoPanorama("Representatividade", "Positivo"),
                     new EstadoOrdenacaoPanorama("Representatividade", "Negativo"),
                     new EstadoOrdenacaoPanorama("Tom", "Positivo"),
                     new EstadoOrdenacaoPanorama("Tom", "Negativo"),
                     new EstadoOrdenacaoPanorama("Tom", "Nulo")
                 })
        {
            var naPagina = OrdenacaoPanorama.Ordenar(pagina, estado).Select(categoria => categoria.Identidade);
            var noLab = OrdenacaoPanoramaDemonstrativo.Ordenar(demonstrativas, estado, categoria => categoria.TomMedio)
                .Select(categoria => categoria.IdentificadorCategoria);
            Assert.Equal(naPagina, noLab);
        }
    }

    [Fact]
    public void LaboratorioUsaTomDaOrigemEscolhidaSemMudarAsRegrasCompartilhadas()
    {
        var estado = new EstadoOrdenacaoPanorama("Tom", "Positivo");
        var direto = OrdenacaoPanoramaDemonstrativo.Ordenar(Categorias(), estado, categoria => categoria.TomDireto);
        var medio = OrdenacaoPanoramaDemonstrativo.Ordenar(Categorias(), estado, categoria => categoria.TomMedio);

        Assert.NotEqual(direto.Select(categoria => categoria.IdentificadorCategoria),
            medio.Select(categoria => categoria.IdentificadorCategoria));
    }

    private static ResumoCategoriaPanoramaDemonstrativo[] Categorias() =>
    [
        new("alto", "Alto", 4, 1, 100, 0.8d) { TomDireto = -20 },
        new("baixo", "Baixo", 1, 1, -20, 0.2d) { TomDireto = 70 },
        new("zero", "Zero", 2, 1, 0, 0.4d) { TomDireto = 0 },
        new("ausente", "Ausente", 2, 0, null, 0.4d)
    ];
}
