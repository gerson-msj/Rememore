using System.Globalization;

namespace Rememore.Client.Infraestrutura;

public sealed record AparenciaTomVisual(string Classes, string Estilo);

public static class AparenciaTom
{
    public const int LimiarPadrao = 20;
    public const int IntensidadePadrao = 50;

    public static double? Transformar(int? tom, int limiar = LimiarPadrao, int intensidadeNoLimiar = IntensidadePadrao)
    {
        if (!tom.HasValue)
        {
            return null;
        }

        var valor = Math.Clamp(tom.Value, -100, 100);
        var magnitude = Math.Abs(valor);
        var limiarAjustado = Math.Clamp(limiar, 1, 99);
        var intensidadeAjustada = Math.Clamp(intensidadeNoLimiar, 0, 100);
        var intensidade = magnitude <= limiarAjustado
            ? magnitude / (double)limiarAjustado * intensidadeAjustada
            : intensidadeAjustada + (magnitude - limiarAjustado) / (100d - limiarAjustado) * (100 - intensidadeAjustada);

        return Math.Sign(valor) * intensidade;
    }

    public static AparenciaTomVisual Obter(int? tom, int limiar = LimiarPadrao, int intensidadeNoLimiar = IntensidadePadrao)
    {
        if (!tom.HasValue)
        {
            return new("aparencia-tom", string.Empty);
        }

        var valor = Math.Clamp(tom.Value, -100, 100);
        var intensidade = Math.Abs(Transformar(valor, limiar, intensidadeNoLimiar)!.Value);
        return CriarVisual(valor, intensidade);
    }

    public static AparenciaTomVisual ObterLinear(int? tom)
    {
        if (!tom.HasValue) return new("aparencia-tom", string.Empty);
        var valor = Math.Clamp(tom.Value, -100, 100);
        return CriarVisual(valor, Math.Abs((double)valor));
    }

    private static AparenciaTomVisual CriarVisual(int valor, double intensidade)
    {
        var intensidadeCss = intensidade.ToString("0.################", CultureInfo.InvariantCulture);
        var polaridade = valor < 0 ? "negativo" : "positivo";
        var estilo = $"--tom-extremo:var(--tom-{polaridade});--tom-peso:{intensidadeCss}%";
        const string classes = "aparencia-tom tom-informado tom-categoria tom-borda tom-sombra tom-fundo tom-setas";

        return new(classes, estilo);
    }
}
