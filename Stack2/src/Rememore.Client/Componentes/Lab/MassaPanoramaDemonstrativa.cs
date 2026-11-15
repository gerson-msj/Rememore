namespace Rememore.Client.Componentes.Lab;

public static class MassaPanoramaDemonstrativa
{
    private static readonly IReadOnlyList<DateOnly> datas = Array.AsReadOnly(new[]
    {
        new DateOnly(2025, 1, 2),
        new DateOnly(2025, 1, 5),
        new DateOnly(2025, 1, 12),
        new DateOnly(2025, 1, 19),
        new DateOnly(2025, 1, 26)
    });

    private static readonly IReadOnlyList<OcorrenciaPanoramaDemonstrativa> ocorrencias = Array.AsReadOnly(new[]
    {
        CriarOcorrencia("memoria-001", new DateOnly(2025, 1, 2),
            new AssociacaoPanoramaDemonstrativa("categoria-rotina", "Rotina", 100, true),
            new AssociacaoPanoramaDemonstrativa("categoria-projetos", "Projetos e ideias", 30)),
        CriarOcorrencia("memoria-005", new DateOnly(2025, 1, 2),
            new AssociacaoPanoramaDemonstrativa("categoria-equilibrio", "Equilíbrio", 80)),
        CriarOcorrencia("memoria-002", new DateOnly(2025, 1, 5),
            new AssociacaoPanoramaDemonstrativa("categoria-rotina", "Rotina", -60),
            new AssociacaoPanoramaDemonstrativa("categoria-projetos", "Projetos e ideias", -10)),
        CriarOcorrencia("memoria-007", new DateOnly(2025, 1, 5),
            new AssociacaoPanoramaDemonstrativa("categoria-sem-tom", "Sem Tons definidos", null, true)),
        CriarOcorrencia("memoria-003", new DateOnly(2025, 1, 12),
            new AssociacaoPanoramaDemonstrativa("categoria-rotina", "Rotina", null),
            new AssociacaoPanoramaDemonstrativa("categoria-projetos", "Projetos e ideias", 0, true)),
        CriarOcorrencia("memoria-006", new DateOnly(2025, 1, 12),
            new AssociacaoPanoramaDemonstrativa("categoria-equilibrio", "Equilíbrio", -80, true)),
        CriarOcorrencia("memoria-004", new DateOnly(2025, 1, 19),
            new AssociacaoPanoramaDemonstrativa("categoria-projetos", "Projetos e ideias", null)),
        CriarOcorrencia("memoria-008", new DateOnly(2025, 1, 19),
            new AssociacaoPanoramaDemonstrativa("categoria-sem-tom", "Sem Tons definidos", null)),
        CriarAmostraLimiar(new DateOnly(2025, 1, 2), 0, -20),
        CriarAmostraLimiar(new DateOnly(2025, 1, 5), 1, -10),
        CriarAmostraLimiar(new DateOnly(2025, 1, 12), 2, 0),
        CriarAmostraLimiar(new DateOnly(2025, 1, 19), 3, 60),
        CriarAmostraLimiar(new DateOnly(2025, 1, 26), 4, 80)
    });

    public static IReadOnlyList<DateOnly> Datas => datas;

    public static IReadOnlyList<OcorrenciaPanoramaDemonstrativa> Ocorrencias => ocorrencias;

    private static OcorrenciaPanoramaDemonstrativa CriarOcorrencia(
        string identificador,
        DateOnly data,
        params AssociacaoPanoramaDemonstrativa[] categorias) =>
        new(identificador, data, Array.AsReadOnly(categorias));

    private static OcorrenciaPanoramaDemonstrativa CriarAmostraLimiar(DateOnly data, int indice, int tomVariavel)
    {
        var tonsProximosDoLimiar = new[] { 17, 19, 20, 21, 23 };
        var categorias = tonsProximosDoLimiar
            .SelectMany((tom, nivel) =>
            {
                if (indice > nivel)
                {
                    return Array.Empty<AssociacaoPanoramaDemonstrativa>();
                }

                return new[]
                {
                    new AssociacaoPanoramaDemonstrativa(
                        $"categoria-limiar-positivo-{tom}",
                        $"Tom positivo {tom}",
                        tom,
                        indice == 0),
                    new AssociacaoPanoramaDemonstrativa(
                        $"categoria-limiar-negativo-{tom}",
                        $"Tom negativo {-tom}",
                        -tom,
                        indice == 0)
                };
            })
            .Append(new AssociacaoPanoramaDemonstrativa(
                "categoria-periodo-estavel",
                "Tom estável, 20",
                20,
                indice == 0))
            .Append(new AssociacaoPanoramaDemonstrativa(
                "categoria-periodo-variavel",
                "Tom variável no período",
                tomVariavel,
                indice == 0));

        return CriarOcorrencia($"amostra-limiar-{data:yyyyMMdd}", data, categorias.ToArray());
    }
}
