using System.Globalization;
using System.Text;

namespace Rememore.Client.Infraestrutura;

internal static class PesquisaCategorias
{
    private const double SimilaridadeMinima = 0.72;

    public static string Normalizar(string texto)
    {
        var semAcentos = texto.Trim().Normalize(NormalizationForm.FormD);
        var resultado = new StringBuilder(semAcentos.Length);

        foreach (var caractere in semAcentos)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(caractere) != UnicodeCategory.NonSpacingMark)
            {
                resultado.Append(caractere);
            }
        }

        return resultado.ToString()
            .Normalize(NormalizationForm.FormC)
            .ToUpperInvariant();
    }

    public static IReadOnlyList<string> EncontrarCorrespondencias(
        IEnumerable<string> categorias,
        string consulta)
    {
        var normalizada = Normalizar(consulta);
        var existentes = categorias
            .Select(categoria => new CategoriaNormalizada(categoria, Normalizar(categoria)))
            .ToArray();

        if (normalizada.Length == 0)
        {
            return Ordenar(existentes.Select(item => item.Nome));
        }

        var simples = existentes
            .Where(item => item.Normalizada.Contains(normalizada, StringComparison.Ordinal))
            .Select(item => item.Nome)
            .ToArray();

        if (simples.Length > 0)
        {
            return Ordenar(simples);
        }

        if (normalizada.Length < 3)
        {
            return Array.Empty<string>();
        }

        return existentes
            .Select(item => new
            {
                item.Nome,
                Similaridade = CalcularSimilaridade(normalizada, item.Normalizada)
            })
            .Where(item => item.Similaridade >= SimilaridadeMinima)
            .OrderByDescending(item => item.Similaridade)
            .ThenBy(item => item.Nome, StringComparer.CurrentCultureIgnoreCase)
            .ThenBy(item => item.Nome, StringComparer.Ordinal)
            .Select(item => item.Nome)
            .ToArray();
    }

    public static bool TemCorrespondenciaSimples(IEnumerable<string> categorias, string consulta)
    {
        var normalizada = Normalizar(consulta);
        return normalizada.Length == 0 || categorias.Any(categoria =>
            Normalizar(categoria).Contains(normalizada, StringComparison.Ordinal));
    }

    private static IReadOnlyList<string> Ordenar(IEnumerable<string> nomes) =>
        nomes.OrderBy(nome => nome, StringComparer.CurrentCultureIgnoreCase)
            .ThenBy(nome => nome, StringComparer.Ordinal)
            .ToArray();

    private static double CalcularSimilaridade(string primeira, string segunda)
    {
        if (primeira.Length == 0 || segunda.Length == 0)
        {
            return 0;
        }

        var linhaAnterior = new int[segunda.Length + 1];
        var linhaAtual = new int[segunda.Length + 1];

        for (var indice = 0; indice <= segunda.Length; indice++)
        {
            linhaAnterior[indice] = indice;
        }

        for (var indicePrimeira = 1; indicePrimeira <= primeira.Length; indicePrimeira++)
        {
            linhaAtual[0] = indicePrimeira;

            for (var indiceSegunda = 1; indiceSegunda <= segunda.Length; indiceSegunda++)
            {
                var custo = primeira[indicePrimeira - 1] == segunda[indiceSegunda - 1] ? 0 : 1;
                linhaAtual[indiceSegunda] = Math.Min(
                    Math.Min(linhaAtual[indiceSegunda - 1] + 1, linhaAnterior[indiceSegunda] + 1),
                    linhaAnterior[indiceSegunda - 1] + custo);
            }

            (linhaAnterior, linhaAtual) = (linhaAtual, linhaAnterior);
        }

        var distancia = linhaAnterior[segunda.Length];
        return 1d - (double)distancia / Math.Max(primeira.Length, segunda.Length);
    }

    private sealed record CategoriaNormalizada(string Nome, string Normalizada);
}
