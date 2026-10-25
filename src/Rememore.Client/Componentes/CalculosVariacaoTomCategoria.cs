namespace Rememore.Client.Componentes;

public sealed record ResultadoVariacaoTomCategoria(
    double? MediaNegativa,
    double? MediaPositiva,
    int QuantidadeTonsDefinidos)
{
    public bool TomDefinido => QuantidadeTonsDefinidos > 0;

    public bool Ausente => !TomDefinido;

    public double LarguraNegativaPercentual => MediaNegativa.HasValue
        ? Math.Abs(MediaNegativa.Value) / 2d
        : 0d;

    public double LarguraPositivaPercentual => MediaPositiva.HasValue
        ? MediaPositiva.Value / 2d
        : 0d;
}

public static class CalculosVariacaoTomCategoria
{
    public static ResultadoVariacaoTomCategoria Calcular(IEnumerable<double?>? tons)
    {
        var definidos = tons?
            .Where(tom => tom.HasValue)
            .Select(tom => tom.GetValueOrDefault())
            .ToArray() ?? [];

        var negativos = definidos.Where(tom => tom < 0).ToArray();
        var positivos = definidos.Where(tom => tom > 0).ToArray();

        return new(
            negativos.Length > 0 ? negativos.Average() : null,
            positivos.Length > 0 ? positivos.Average() : null,
            definidos.Length);
    }
}
