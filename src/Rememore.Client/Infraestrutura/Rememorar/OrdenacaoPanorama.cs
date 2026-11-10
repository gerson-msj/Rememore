namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record EstadoOrdenacaoPanorama(string Criterio, string Sentido)
{
    public static EstadoOrdenacaoPanorama Inicial { get; } = new("Representatividade", "Positivo");

    public bool Valido => Criterio == "Representatividade" && Sentido is "Positivo" or "Negativo"
        || Criterio == "Tom" && Sentido is "Positivo" or "Negativo" or "Nulo";

    public EstadoOrdenacaoPanorama AlternarRepresentatividade() => Criterio == "Representatividade"
        ? this with { Sentido = Sentido == "Positivo" ? "Negativo" : "Positivo" }
        : Inicial;

    public EstadoOrdenacaoPanorama AlternarTom() => Criterio != "Tom"
        ? new("Tom", "Positivo")
        : this with { Sentido = Sentido switch { "Positivo" => "Negativo", "Negativo" => "Nulo", _ => "Positivo" } };
}

public static class OrdenacaoPanorama
{
    public static IReadOnlyList<CategoriaPanoramaCalculada> Ordenar(
        IEnumerable<CategoriaPanoramaCalculada> categorias,
        EstadoOrdenacaoPanorama estado)
        => Ordenar(categorias, estado,
            categoria => categoria.QuantidadeAssociacoes,
            categoria => categoria.Representatividade,
            categoria => categoria.TomMedio,
            categoria => categoria.Nome,
            categoria => categoria.Identidade);

    public static IReadOnlyList<T> Ordenar<T>(
        IEnumerable<T> categorias,
        EstadoOrdenacaoPanorama estado,
        Func<T, long> obterQuantidade,
        Func<T, double> obterRepresentatividade,
        Func<T, double?> obterTom,
        Func<T, string> obterNome,
        Func<T, string> obterIdentidade)
    {
        ArgumentNullException.ThrowIfNull(categorias);
        ArgumentNullException.ThrowIfNull(estado);
        ArgumentNullException.ThrowIfNull(obterQuantidade);
        ArgumentNullException.ThrowIfNull(obterRepresentatividade);
        ArgumentNullException.ThrowIfNull(obterTom);
        ArgumentNullException.ThrowIfNull(obterNome);
        ArgumentNullException.ThrowIfNull(obterIdentidade);
        if (!estado.Valido) estado = EstadoOrdenacaoPanorama.Inicial;

        var lista = categorias.ToArray();
        IOrderedEnumerable<T> ordenacao = estado.Criterio switch
        {
            "Tom" when estado.Sentido == "Positivo" => lista
                .OrderBy(item => !obterTom(item).HasValue)
                .ThenByDescending(obterTom)
                .ThenByDescending(obterRepresentatividade)
                .ThenBy(obterNome, StringComparer.OrdinalIgnoreCase)
                .ThenBy(obterIdentidade, StringComparer.Ordinal),
            "Tom" when estado.Sentido == "Negativo" => lista
                .OrderBy(item => !obterTom(item).HasValue)
                .ThenBy(obterTom)
                .ThenByDescending(obterRepresentatividade)
                .ThenBy(obterNome, StringComparer.OrdinalIgnoreCase)
                .ThenBy(obterIdentidade, StringComparer.Ordinal),
            "Tom" => lista
                .OrderBy(item => obterTom(item).HasValue)
                .ThenByDescending(obterRepresentatividade)
                .ThenBy(obterNome, StringComparer.OrdinalIgnoreCase)
                .ThenBy(obterIdentidade, StringComparer.Ordinal),
            _ when estado.Sentido == "Negativo" => lista
                .OrderBy(obterQuantidade)
                .ThenBy(obterNome, StringComparer.OrdinalIgnoreCase)
                .ThenBy(obterIdentidade, StringComparer.Ordinal),
            _ => lista
                .OrderByDescending(obterQuantidade)
                .ThenBy(obterNome, StringComparer.OrdinalIgnoreCase)
                .ThenBy(obterIdentidade, StringComparer.Ordinal)
        };
        return ordenacao.ToArray();
    }
}
