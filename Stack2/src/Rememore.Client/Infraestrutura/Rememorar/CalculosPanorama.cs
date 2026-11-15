using System.Globalization;
using Rememore.Client.Infraestrutura.Categorias;

namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record CategoriaPanoramaCalculada(
    string Identidade, string Nome, long QuantidadeAssociacoes, double Representatividade, double? TomMedio);

public sealed record ResultadoCalculoPanorama(
    IReadOnlyList<CategoriaPanoramaCalculada> Categorias, double? TomMedioJanela);

public static class CalculosPanorama
{
    public static bool AcervoDisponivel(IEnumerable<BlocoDiaPanoramaRemoto> dias)
    {
        ArgumentNullException.ThrowIfNull(dias);
        var blocos = dias.ToArray();
        var datas = blocos.Select(dia => dia.Data).Distinct(StringComparer.Ordinal).Count();
        var categorias = blocos.SelectMany(dia => dia.Associacoes)
            .Select(associacao => associacao.IdentidadeCategoria)
            .Where(identidade => !string.IsNullOrWhiteSpace(identidade))
            .Distinct(StringComparer.Ordinal).Count();
        return datas >= 2 && categorias >= 2;
    }

    public static ResultadoCalculoPanorama Calcular(
        IEnumerable<BlocoDiaPanoramaRemoto> dias,
        IReadOnlyList<CategoriaPreservadaRemota> catalogo,
        DateOnly inicio,
        DateOnly fim)
    {
        ArgumentNullException.ThrowIfNull(dias);
        ArgumentNullException.ThrowIfNull(catalogo);
        if (fim < inicio) throw new ArgumentOutOfRangeException(nameof(fim), "O fim do período deve ser igual ou posterior ao início.");

        var nomes = catalogo.ToDictionary(categoria => categoria.Identidade, StringComparer.Ordinal);
        var acumulados = new Dictionary<string, Acumulado>(StringComparer.Ordinal);
        foreach (var dia in dias)
        {
            if (!DateOnly.TryParseExact(dia.Data, "yyyy-MM-dd", CultureInfo.InvariantCulture,
                    DateTimeStyles.None, out var data) || data < inicio || data > fim)
                continue;

            foreach (var associacao in dia.Associacoes)
            {
                if (!nomes.ContainsKey(associacao.IdentidadeCategoria))
                    throw new InvalidOperationException($"A categoria {associacao.IdentidadeCategoria} não está resolvida no catálogo da conta.");
                if (!acumulados.TryGetValue(associacao.IdentidadeCategoria, out var acumulado))
                    acumulado = new Acumulado();
                acumulado.Quantidade++;
                if (associacao.Tom is { } tom)
                {
                    acumulado.SomaTons += tom;
                    acumulado.QuantidadeTons++;
                }
                acumulados[associacao.IdentidadeCategoria] = acumulado;
            }
        }

        if (acumulados.Count == 0) return new([], null);
        var quantidadeMaxima = acumulados.Values.Max(item => item.Quantidade);
        var categorias = acumulados.Select(par =>
        {
            var categoria = nomes[par.Key];
            var acumulado = par.Value;
            var tomMedio = acumulado.QuantidadeTons == 0
                ? (double?)null
                : acumulado.SomaTons / acumulado.QuantidadeTons;
            return new CategoriaPanoramaCalculada(categoria.Identidade, categoria.Nome, acumulado.Quantidade,
                Math.Sqrt(acumulado.Quantidade / (double)quantidadeMaxima), tomMedio);
        }).OrderByDescending(categoria => categoria.QuantidadeAssociacoes)
            .ThenBy(categoria => categoria.Nome, StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var totalTons = acumulados.Values.Sum(item => item.SomaTons);
        var quantidadeTonsJanela = acumulados.Values.Sum(item => item.QuantidadeTons);
        var tomJanela = quantidadeTonsJanela == 0 ? (double?)null : totalTons / quantidadeTonsJanela;
        return new(categorias, tomJanela);
    }

    private sealed class Acumulado
    {
        public long Quantidade { get; set; }
        public long QuantidadeTons { get; set; }
        public double SomaTons { get; set; }
    }
}
