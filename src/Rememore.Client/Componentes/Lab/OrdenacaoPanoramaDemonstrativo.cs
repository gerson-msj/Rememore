using System.Globalization;

namespace Rememore.Client.Componentes.Lab;

public enum CriterioOrdenacaoPanorama
{
    Representatividade,
    Tom
}

public enum SentidoOrdenacaoPanorama
{
    Decrescente,
    Crescente,
    SemTomPrimeiro
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

public sealed record EstadoOrdenacaoPanorama(
    CriterioOrdenacaoPanorama Criterio,
    SentidoOrdenacaoPanorama SentidoRepresentatividade,
    SentidoOrdenacaoPanorama SentidoTom)
{
    public static EstadoOrdenacaoPanorama Inicial { get; } = new(
        CriterioOrdenacaoPanorama.Representatividade,
        SentidoOrdenacaoPanorama.Decrescente,
        SentidoOrdenacaoPanorama.Decrescente);
}

public static class OrdenacaoPanoramaDemonstrativo
{
    private static readonly StringComparer comparadorNome =
        StringComparer.Create(CultureInfo.GetCultureInfo("pt-BR"), ignoreCase: true);

    public static EstadoOrdenacaoPanorama Avancar(EstadoOrdenacaoPanorama estado, CriterioOrdenacaoPanorama criterio)
    {
        ArgumentNullException.ThrowIfNull(estado);

        if (estado.Criterio != criterio)
        {
            return estado with
            {
                Criterio = criterio,
                SentidoRepresentatividade = SentidoOrdenacaoPanorama.Decrescente,
                SentidoTom = SentidoOrdenacaoPanorama.Decrescente
            };
        }

        return criterio switch
        {
            CriterioOrdenacaoPanorama.Representatividade => estado with
            {
                SentidoRepresentatividade = estado.SentidoRepresentatividade == SentidoOrdenacaoPanorama.Decrescente
                    ? SentidoOrdenacaoPanorama.Crescente
                    : SentidoOrdenacaoPanorama.Decrescente
            },
            CriterioOrdenacaoPanorama.Tom => estado with
            {
                SentidoTom = estado.SentidoTom switch
                {
                    SentidoOrdenacaoPanorama.Decrescente => SentidoOrdenacaoPanorama.Crescente,
                    SentidoOrdenacaoPanorama.Crescente => SentidoOrdenacaoPanorama.SemTomPrimeiro,
                    _ => SentidoOrdenacaoPanorama.Decrescente
                }
            },
            _ => throw new ArgumentOutOfRangeException(nameof(criterio))
        };
    }

    public static IReadOnlyList<ResumoCategoriaPanoramaDemonstrativo> Ordenar(
        IReadOnlyCollection<ResumoCategoriaPanoramaDemonstrativo> categorias,
        EstadoOrdenacaoPanorama estado,
        Func<ResumoCategoriaPanoramaDemonstrativo, double?> obterTom)
    {
        ArgumentNullException.ThrowIfNull(categorias);
        ArgumentNullException.ThrowIfNull(estado);
        ArgumentNullException.ThrowIfNull(obterTom);

        IEnumerable<ResumoCategoriaPanoramaDemonstrativo> ordenadas = estado.Criterio switch
        {
            CriterioOrdenacaoPanorama.Representatividade when estado.SentidoRepresentatividade == SentidoOrdenacaoPanorama.Decrescente =>
                categorias.OrderByDescending(categoria => categoria.Representatividade)
                    .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
                    .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal),
            CriterioOrdenacaoPanorama.Representatividade =>
                categorias.OrderBy(categoria => categoria.Representatividade)
                    .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
                    .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal),
            CriterioOrdenacaoPanorama.Tom when estado.SentidoTom == SentidoOrdenacaoPanorama.SemTomPrimeiro =>
                categorias.Where(categoria => obterTom(categoria) is null)
                    .OrderByDescending(categoria => categoria.Representatividade)
                    .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
                    .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal)
                    .Concat(categorias.Where(categoria => obterTom(categoria) is not null)
                        .OrderByDescending(categoria => categoria.Representatividade)
                        .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
                        .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal)),
            CriterioOrdenacaoPanorama.Tom =>
                OrdenarPorTom(categorias, obterTom, estado.SentidoTom),
            _ => throw new ArgumentOutOfRangeException(nameof(estado))
        };

        return Array.AsReadOnly(ordenadas.ToArray());
    }

    private static IEnumerable<ResumoCategoriaPanoramaDemonstrativo> OrdenarPorTom(
        IReadOnlyCollection<ResumoCategoriaPanoramaDemonstrativo> categorias,
        Func<ResumoCategoriaPanoramaDemonstrativo, double?> obterTom,
        SentidoOrdenacaoPanorama sentido)
    {
        var definidos = categorias.Where(categoria => obterTom(categoria).HasValue);
        var nulos = categorias.Where(categoria => !obterTom(categoria).HasValue)
            .OrderByDescending(categoria => categoria.Representatividade)
            .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
            .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal);

        var ordenados = sentido == SentidoOrdenacaoPanorama.Decrescente
            ? definidos.OrderByDescending(obterTom)
            : definidos.OrderBy(obterTom);

        return ordenados
            .ThenByDescending(categoria => categoria.Representatividade)
            .ThenBy(categoria => categoria.NomeCategoria, comparadorNome)
            .ThenBy(categoria => categoria.IdentificadorCategoria, StringComparer.Ordinal)
            .Concat(nulos);
    }
}
