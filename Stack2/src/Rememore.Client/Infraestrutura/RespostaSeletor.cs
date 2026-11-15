namespace Rememore.Client.Infraestrutura;

public enum CurvaRespostaSeletor
{
    Linear,
    EaseIn,
    EaseOut,
    EaseInOut
}

public sealed record RespostaSeletor(
    int AtrasoMs,
    CurvaRespostaSeletor Curva,
    CurvaRespostaSeletor CurvaClique = CurvaRespostaSeletor.EaseIn,
    CurvaRespostaSeletor CurvaArraste = CurvaRespostaSeletor.EaseInOut)
{
    public static RespostaSeletor PadraoTom { get; } = new(500, CurvaRespostaSeletor.EaseIn);
}

public readonly record struct AvancamentoSeletor(double Valor, double Velocidade, bool Concluido);

public static class MovimentoSeletor
{
    private const double DistanciaConclusao = 0.001;
    private const double DecorridoMaximoSegundos = 0.064;

    public static AvancamentoSeletor Avancar(
        double atual,
        double alvo,
        double velocidadeAnterior,
        double decorridoSegundos,
        RespostaSeletor resposta)
    {
        atual = Limitar(atual);
        alvo = Limitar(alvo);
        if (resposta.AtrasoMs <= 0) return new(alvo, 0, true);

        var distancia = alvo - atual;
        var absoluta = Math.Abs(distancia);
        if (absoluta < DistanciaConclusao) return new(alvo, 0, true);

        var decorrido = Math.Clamp(decorridoSegundos, 0, DecorridoMaximoSegundos);
        var atraso = resposta.AtrasoMs / 1000d;
        if (resposta.Curva == CurvaRespostaSeletor.EaseOut)
        {
            var progresso = 1 - Math.Exp(-6.9 * decorrido / atraso);
            var proximo = atual + distancia * progresso;
            var concluido = Math.Abs(alvo - proximo) < DistanciaConclusao;
            return new(concluido ? alvo : proximo, decorrido > 0 ? (proximo - atual) / decorrido : 0, concluido);
        }

        var velocidadeMaxima = 1 / atraso;
        var aceleracao = velocidadeMaxima / 0.3;
        var sentido = Math.Sign(distancia);
        var velocidadeDesejada = sentido * velocidadeMaxima;
        if (resposta.Curva == CurvaRespostaSeletor.EaseInOut)
        {
            velocidadeDesejada = sentido * Math.Min(velocidadeMaxima, Math.Sqrt(2 * aceleracao * absoluta));
        }

        var velocidade = resposta.Curva == CurvaRespostaSeletor.Linear
            ? velocidadeDesejada
            : velocidadeAnterior + Math.Clamp(velocidadeDesejada - velocidadeAnterior, -aceleracao * decorrido, aceleracao * decorrido);
        var deslocamento = velocidade * decorrido;
        var valor = Math.Abs(deslocamento) >= absoluta ? alvo : atual + deslocamento;
        return new(Limitar(valor), velocidade, valor == alvo);
    }

    private static double Limitar(double valor) => double.IsFinite(valor) ? Math.Clamp(valor, 0, 1) : 0;
}
