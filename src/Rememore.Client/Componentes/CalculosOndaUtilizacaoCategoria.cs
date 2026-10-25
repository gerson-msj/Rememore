namespace Rememore.Client.Componentes;

public sealed record ResultadoOndaUtilizacaoCategoria(
    IReadOnlyList<double> SerieFiltrada,
    IReadOnlyList<double> ValoresAmostrados,
    IReadOnlyList<double> ValoresNormalizados)
{
    public bool SemDados => SerieFiltrada.Count == 0;
}

public readonly record struct SegmentoCurvaOnda(
    double XControle1,
    double YControle1,
    double XControle2,
    double YControle2,
    double XFim,
    double YFim);

public static class CalculosOndaUtilizacaoCategoria
{
    public const int QuantidadePontos = 4;

    public static ResultadoOndaUtilizacaoCategoria Calcular(IEnumerable<double>? serie)
    {
        var filtrada = serie?
            .Where(valor => double.IsFinite(valor) && valor > 0)
            .ToArray() ?? [];

        if (filtrada.Length == 0)
        {
            var neutros = Array.AsReadOnly(new double[QuantidadePontos]);
            return new(Array.AsReadOnly(filtrada), neutros, neutros);
        }

        var amostrados = Amostrar(filtrada);
        var minimo = filtrada.Min();
        var maximo = filtrada.Max();
        var amplitude = maximo - minimo;
        var normalizados = new double[QuantidadePontos];

        if (amplitude > 0)
        {
            var meio = minimo + amplitude / 2d;
            var semiAmplitude = amplitude / 2d;
            for (var indice = 0; indice < QuantidadePontos; indice++)
                normalizados[indice] = Math.Clamp((amostrados[indice] - meio) / semiAmplitude, -1d, 1d);
        }

        return new(
            Array.AsReadOnly(filtrada),
            Array.AsReadOnly(amostrados),
            Array.AsReadOnly(normalizados));
    }

    public static IReadOnlyList<SegmentoCurvaOnda> CriarSegmentos(IReadOnlyList<double> valoresNormalizados)
    {
        ArgumentNullException.ThrowIfNull(valoresNormalizados);
        if (valoresNormalizados.Count != QuantidadePontos)
            throw new ArgumentException($"A onda deve ter exatamente {QuantidadePontos} pontos.", nameof(valoresNormalizados));
        if (valoresNormalizados.Any(valor => !double.IsFinite(valor)))
            throw new ArgumentException("Os pontos da onda devem ser finitos.", nameof(valoresNormalizados));

        var alturas = valoresNormalizados.Select(valor => 50d - 40d * Math.Clamp(valor, -1d, 1d)).ToArray();
        var diferencas = new double[QuantidadePontos - 1];
        for (var indice = 0; indice < diferencas.Length; indice++)
            diferencas[indice] = alturas[indice + 1] - alturas[indice];

        var tangentes = new double[QuantidadePontos];
        tangentes[0] = TangenteExtrema(diferencas[0], diferencas[1]);
        tangentes[^1] = TangenteExtrema(diferencas[^1], diferencas[^2]);
        for (var indice = 1; indice < QuantidadePontos - 1; indice++)
        {
            var anterior = diferencas[indice - 1];
            var seguinte = diferencas[indice];
            tangentes[indice] = Math.Sign(anterior) == Math.Sign(seguinte) && anterior != 0
                ? 2d * anterior * seguinte / (anterior + seguinte)
                : 0d;
        }

        var larguraTrecho = 100d / (QuantidadePontos - 1);
        var resultado = new SegmentoCurvaOnda[QuantidadePontos - 1];
        for (var indice = 0; indice < resultado.Length; indice++)
        {
            var xInicio = larguraTrecho * indice;
            var xFim = indice == resultado.Length - 1 ? 100d : larguraTrecho * (indice + 1);
            resultado[indice] = new(
                xInicio + larguraTrecho / 3d,
                alturas[indice] + tangentes[indice] / 3d,
                xInicio + 2d * larguraTrecho / 3d,
                alturas[indice + 1] - tangentes[indice + 1] / 3d,
                xFim,
                alturas[indice + 1]);
        }

        return Array.AsReadOnly(resultado);
    }

    private static double[] Amostrar(IReadOnlyList<double> serie)
    {
        var valores = new double[QuantidadePontos];
        if (serie.Count == 1)
        {
            Array.Fill(valores, serie[0]);
            return valores;
        }

        for (var indice = 0; indice < QuantidadePontos; indice++)
        {
            var posicao = indice * (serie.Count - 1d) / (QuantidadePontos - 1);
            var indiceInferior = (int)Math.Floor(posicao);
            var fracao = posicao - indiceInferior;
            if (indiceInferior >= serie.Count - 1)
            {
                valores[indice] = serie[^1];
                continue;
            }

            valores[indice] = serie[indiceInferior]
                + (serie[indiceInferior + 1] - serie[indiceInferior]) * fracao;
        }

        return valores;
    }

    private static double TangenteExtrema(double primeiraDiferenca, double segundaDiferenca)
    {
        var tangente = (3d * primeiraDiferenca - segundaDiferenca) / 2d;
        if (Math.Sign(tangente) != Math.Sign(primeiraDiferenca))
            return 0d;
        if (Math.Sign(primeiraDiferenca) != Math.Sign(segundaDiferenca)
            && Math.Abs(tangente) > 3d * Math.Abs(primeiraDiferenca))
            return 3d * primeiraDiferenca;
        return tangente;
    }
}
