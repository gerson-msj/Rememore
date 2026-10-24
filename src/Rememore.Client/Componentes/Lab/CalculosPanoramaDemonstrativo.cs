namespace Rememore.Client.Componentes.Lab;

public sealed record AssociacaoPanoramaDemonstrativa(
    string IdentificadorCategoria,
    string NomeCategoria,
    int? Tom,
    bool ReferenciaTomDireto = false);

public sealed record OcorrenciaPanoramaDemonstrativa(
    string Identificador,
    DateOnly Data,
    IReadOnlyList<AssociacaoPanoramaDemonstrativa> Categorias);

public sealed record ResumoCategoriaPanoramaDemonstrativo(
    string IdentificadorCategoria,
    string NomeCategoria,
    int QuantidadeAssociacoes,
    int QuantidadeTonsDefinidos,
    double? TomMedio,
    double Representatividade)
{
    public int? TomDireto { get; init; }

    public string? IdentificadorObservacaoTomDireto { get; init; }
}

public sealed record ResultadoPanoramaDemonstrativo(
    int QuantidadeDatasConsideradas,
    int QuantidadeOcorrencias,
    int QuantidadeAssociacoes,
    int QuantidadeMaximaAssociacoes,
    IReadOnlyList<ResumoCategoriaPanoramaDemonstrativo> Categorias,
    double? TomMedioPonderado);

public static class CalculosPanoramaDemonstrativo
{
    public static ResultadoPanoramaDemonstrativo Calcular(
        IReadOnlyCollection<DateOnly> datasConsideradas,
        IReadOnlyCollection<OcorrenciaPanoramaDemonstrativa> ocorrencias)
    {
        ArgumentNullException.ThrowIfNull(datasConsideradas);
        ArgumentNullException.ThrowIfNull(ocorrencias);

        var conjuntoDatas = datasConsideradas.ToHashSet();
        var ocorrenciasDoIntervalo = ocorrencias
            .Where(ocorrencia => conjuntoDatas.Contains(ocorrencia.Data))
            .ToArray();

        ValidarOcorrencias(ocorrenciasDoIntervalo);

        var associacoes = ocorrenciasDoIntervalo
            .SelectMany(ocorrencia => ocorrencia.Categorias.Select(categoria => new
            {
                ocorrencia.Identificador,
                Categoria = categoria
            }))
            .ToArray();

        if (associacoes
            .GroupBy(associacao => associacao.Categoria.IdentificadorCategoria)
            .Any(grupo => grupo.Select(associacao => associacao.Categoria.NomeCategoria)
                .Distinct(StringComparer.Ordinal)
                .Count() != 1))
        {
            throw new ArgumentException("Cada identificador de categoria precisa manter o mesmo nome na massa demonstrativa.", nameof(ocorrencias));
        }

        var categoriasSemRepresentatividade = associacoes
            .GroupBy(associacao => associacao.Categoria.IdentificadorCategoria)
            .Select(grupo =>
            {
                var observacoesDiretas = grupo
                    .Where(associacao => associacao.Categoria.ReferenciaTomDireto)
                    .ToArray();
                if (observacoesDiretas.Length > 1)
                {
                    throw new ArgumentException("Cada categoria pode ter no máximo uma observação direta no recorte.", nameof(ocorrencias));
                }

                var tonsDefinidos = grupo
                    .Where(associacao => associacao.Categoria.Tom.HasValue)
                    .Select(associacao => (double)associacao.Categoria.Tom!.Value)
                    .ToArray();

                var resumo = new ResumoCategoriaPanoramaDemonstrativo(
                    grupo.Key,
                    grupo.First().Categoria.NomeCategoria,
                    grupo.Count(),
                    tonsDefinidos.Length,
                    tonsDefinidos.Length == 0 ? null : tonsDefinidos.Average(),
                    0d);

                return observacoesDiretas.Length == 0
                    ? resumo
                    : resumo with
                    {
                        TomDireto = observacoesDiretas[0].Categoria.Tom,
                        IdentificadorObservacaoTomDireto = observacoesDiretas[0].Identificador
                    };
            })
            .ToArray();

        var quantidadeMaxima = categoriasSemRepresentatividade
            .Select(categoria => categoria.QuantidadeAssociacoes)
            .DefaultIfEmpty(0)
            .Max();

        var categorias = categoriasSemRepresentatividade
            .Select(categoria => categoria with
            {
                Representatividade = Math.Sqrt(categoria.QuantidadeAssociacoes / (double)quantidadeMaxima)
            })
            .ToArray();

        return new ResultadoPanoramaDemonstrativo(
            conjuntoDatas.Count,
            ocorrenciasDoIntervalo.Length,
            associacoes.Length,
            quantidadeMaxima,
            categorias,
            CalcularTomMedioPonderado(categorias));
    }

    public static double? CalcularTomMedioPonderado(
        IReadOnlyCollection<ResumoCategoriaPanoramaDemonstrativo> categorias)
    {
        ArgumentNullException.ThrowIfNull(categorias);

        var categoriasComTom = categorias
            .Where(categoria => categoria.QuantidadeTonsDefinidos > 0 && categoria.TomMedio.HasValue)
            .ToArray();
        var quantidadeTonsDefinidos = categoriasComTom.Sum(categoria => categoria.QuantidadeTonsDefinidos);

        if (quantidadeTonsDefinidos == 0)
        {
            return null;
        }

        var somaPonderada = categoriasComTom.Sum(categoria =>
            categoria.TomMedio!.Value * categoria.QuantidadeTonsDefinidos);

        return somaPonderada / quantidadeTonsDefinidos;
    }

    private static void ValidarOcorrencias(IReadOnlyCollection<OcorrenciaPanoramaDemonstrativa> ocorrencias)
    {
        if (ocorrencias.Select(ocorrencia => ocorrencia.Identificador).Distinct(StringComparer.Ordinal).Count() != ocorrencias.Count)
        {
            throw new ArgumentException("Cada ocorrência demonstrativa precisa ter um identificador estável e único.", nameof(ocorrencias));
        }

        foreach (var ocorrencia in ocorrencias)
        {
            if (ocorrencia.Categorias
                .Select(categoria => categoria.IdentificadorCategoria)
                .Distinct(StringComparer.Ordinal)
                .Count() != ocorrencia.Categorias.Count)
            {
                throw new ArgumentException("Uma ocorrência não pode repetir a associação com a mesma categoria.", nameof(ocorrencias));
            }
        }
    }
}
