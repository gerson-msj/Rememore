using Rememore.Client.Componentes.Lab;

namespace Rememore.Client.Tests;

public sealed class OrdenacaoPanoramaDemonstrativoTests
{
    [Fact]
    public void CicloDeRepresentatividadeAlternaDecrescenteECrescente()
    {
        var estado = EstadoOrdenacaoPanorama.Inicial;

        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Representatividade);
        Assert.Equal(SentidoOrdenacaoPanorama.Crescente, estado.SentidoRepresentatividade);

        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Representatividade);
        Assert.Equal(SentidoOrdenacaoPanorama.Decrescente, estado.SentidoRepresentatividade);
    }

    [Fact]
    public void CicloDeTomIncluiSemTomPrimeiroEReiniciaAoTrocarCriterio()
    {
        var estado = EstadoOrdenacaoPanorama.Inicial;
        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Tom);

        Assert.Equal(SentidoOrdenacaoPanorama.Decrescente, estado.SentidoTom);
        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Tom);
        Assert.Equal(SentidoOrdenacaoPanorama.Crescente, estado.SentidoTom);
        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Tom);
        Assert.Equal(SentidoOrdenacaoPanorama.SemTomPrimeiro, estado.SentidoTom);
        estado = OrdenacaoPanoramaDemonstrativo.Avancar(estado, CriterioOrdenacaoPanorama.Representatividade);

        Assert.Equal(SentidoOrdenacaoPanorama.Decrescente, estado.SentidoRepresentatividade);
        Assert.Equal(SentidoOrdenacaoPanorama.Decrescente, estado.SentidoTom);
    }

    [Fact]
    public void OrdenacaoPorTomUsaValorFuncionalEMantemNulosNoFimOuNoInicio()
    {
        var categorias = Categorias();
        var estado = new EstadoOrdenacaoPanorama(
            CriterioOrdenacaoPanorama.Tom,
            SentidoOrdenacaoPanorama.Decrescente,
            SentidoOrdenacaoPanorama.Decrescente);

        var decrescente = OrdenacaoPanoramaDemonstrativo.Ordenar(categorias, estado, categoria => categoria.TomDireto);
        var crescente = OrdenacaoPanoramaDemonstrativo.Ordenar(categorias,
            estado with { SentidoTom = SentidoOrdenacaoPanorama.Crescente }, categoria => categoria.TomDireto);
        var semTomPrimeiro = OrdenacaoPanoramaDemonstrativo.Ordenar(categorias,
            estado with { SentidoTom = SentidoOrdenacaoPanorama.SemTomPrimeiro }, categoria => categoria.TomDireto);

        Assert.Equal(new[] { "alto", "zero", "baixo", "ausente" }, decrescente.Select(categoria => categoria.IdentificadorCategoria));
        Assert.Equal(new[] { "baixo", "zero", "alto", "ausente" }, crescente.Select(categoria => categoria.IdentificadorCategoria));
        Assert.Equal(new[] { "ausente", "alto", "baixo", "zero" }, semTomPrimeiro.Select(categoria => categoria.IdentificadorCategoria));
    }

    [Fact]
    public void RepresentatividadeEDesempatesIgnoramTomEIntensidadeVisual()
    {
        var categorias = Categorias();
        var estado = EstadoOrdenacaoPanorama.Inicial;
        var resultado = OrdenacaoPanoramaDemonstrativo.Ordenar(categorias, estado, categoria => categoria.TomDireto);

        Assert.Equal(new[] { "alto", "ausente", "baixo", "zero" }, resultado.Select(categoria => categoria.IdentificadorCategoria));
    }

    private static ResumoCategoriaPanoramaDemonstrativo[] Categorias() =>
    [
        new("alto", "Alto", 1, 1, 100, 0.8d) { TomDireto = 100 },
        new("baixo", "Baixo", 1, 1, -20, 0.7d) { TomDireto = -20 },
        new("zero", "Zero", 1, 1, 0, 0.5d) { TomDireto = 0 },
        new("ausente", "Ausente", 1, 0, null, 0.8d)
    ];
}
