using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Componentes.Lab;

public enum CriterioOrdenacaoPanorama
{
    Representatividade,
    Tom
}

public enum OrigemTomPanoramaDemonstrativo
{
    Direto,
    Media
}

public enum PoliticaCromaticaPanoramaDemonstrativa
{
    Linear,
    Limiar
}

public enum ModoVisualizacaoPanoramaDemonstrativa
{
    ListaUnica,
    CompararCurvas,
    CompararOrigens
}

public static class OrdenacaoPanoramaDemonstrativo
{
    public static EstadoOrdenacaoPanorama Avancar(EstadoOrdenacaoPanorama estado, CriterioOrdenacaoPanorama criterio)
    {
        ArgumentNullException.ThrowIfNull(estado);
        return criterio switch
        {
            CriterioOrdenacaoPanorama.Representatividade => estado.AlternarRepresentatividade(),
            CriterioOrdenacaoPanorama.Tom => estado.AlternarTom(),
            _ => throw new ArgumentOutOfRangeException(nameof(criterio))
        };
    }

    public static IReadOnlyList<ResumoCategoriaPanoramaDemonstrativo> Ordenar(
        IReadOnlyCollection<ResumoCategoriaPanoramaDemonstrativo> categorias,
        EstadoOrdenacaoPanorama estado,
        Func<ResumoCategoriaPanoramaDemonstrativo, double?> obterTom) =>
        OrdenacaoPanorama.Ordenar(categorias, estado,
            categoria => categoria.QuantidadeAssociacoes,
            categoria => categoria.Representatividade,
            obterTom,
            categoria => categoria.NomeCategoria,
            categoria => categoria.IdentificadorCategoria);
}
