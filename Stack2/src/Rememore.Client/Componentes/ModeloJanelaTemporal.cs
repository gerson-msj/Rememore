namespace Rememore.Client.Componentes;

public sealed record IntervaloJanelaTemporal(
    int IndiceInicio,
    int IndiceFim,
    DateOnly DataInicio,
    DateOnly DataFim)
{
    public int QuantidadeDias => IndiceFim - IndiceInicio + 1;
}

public sealed record EstadoJanelaTemporalRestaurado(
    double PosicaoInicio,
    double PosicaoFim,
    IntervaloJanelaTemporal? UltimoIntervaloValido);

public sealed record EstadoJanelaTemporal(
    IReadOnlyList<DateOnly> DiasPreservados,
    double PosicaoInicio,
    double PosicaoFim,
    int IndiceInicio,
    int IndiceFim,
    int QuantidadeDiasPreservados,
    IntervaloJanelaTemporal? IntervaloValidoAtual,
    IntervaloJanelaTemporal? UltimoIntervaloValido)
{
    public bool Invalida => IntervaloValidoAtual is null;
}

public sealed record ConclusaoOperacaoJanelaTemporal(
    IntervaloJanelaTemporal? IntervaloValido,
    IntervaloJanelaTemporal? UltimoIntervaloValido,
    bool Invalida);

public sealed class ModeloJanelaTemporal
{
    private readonly IReadOnlyList<DateOnly> diasPreservados;
    private IntervaloJanelaTemporal? ultimoIntervaloValido;

    public ModeloJanelaTemporal(
        IEnumerable<DateOnly> diasPreservados,
        EstadoJanelaTemporalRestaurado? restauracao = null)
    {
        ArgumentNullException.ThrowIfNull(diasPreservados);
        var dias = diasPreservados.ToArray();
        ValidarDias(dias);
        this.diasPreservados = Array.AsReadOnly(dias);

        var posicaoInicio = restauracao?.PosicaoInicio ?? 0d;
        var posicaoFim = restauracao?.PosicaoFim ?? 1d;
        ValidarPosicoes(posicaoInicio, posicaoFim);

        if (restauracao?.UltimoIntervaloValido is { } intervaloRestaurado)
            ValidarIntervaloRestaurado(intervaloRestaurado, dias);

        Estado = CriarEstado(posicaoInicio, posicaoFim, restauracao?.UltimoIntervaloValido);
        ultimoIntervaloValido = Estado.IntervaloValidoAtual ?? restauracao?.UltimoIntervaloValido;
        Estado = Estado with { UltimoIntervaloValido = ultimoIntervaloValido };
    }

    public event Action<EstadoJanelaTemporal>? PosicaoAlterada;
    public event Action<IntervaloJanelaTemporal>? IntervaloAlterado;
    public event Action<ConclusaoOperacaoJanelaTemporal>? OperacaoConcluida;

    public EstadoJanelaTemporal Estado { get; private set; }

    public IReadOnlyList<DateOnly> DiasPreservados => diasPreservados;

    public EstadoJanelaTemporal AtualizarPosicoes(double posicaoInicio, double posicaoFim)
    {
        ValidarPosicoes(posicaoInicio, posicaoFim);
        if (Estado.PosicaoInicio == posicaoInicio && Estado.PosicaoFim == posicaoFim)
            return Estado;

        var novoEstado = CriarEstado(posicaoInicio, posicaoFim, ultimoIntervaloValido);
        var intervaloNovo = novoEstado.IntervaloValidoAtual;
        var intervaloAlterado = intervaloNovo is not null && intervaloNovo != ultimoIntervaloValido;
        if (intervaloAlterado)
        {
            ultimoIntervaloValido = intervaloNovo;
            novoEstado = novoEstado with { UltimoIntervaloValido = intervaloNovo };
        }

        Estado = novoEstado;
        PosicaoAlterada?.Invoke(Estado);
        if (intervaloAlterado && Estado.IntervaloValidoAtual is { } intervaloAtual)
        {
            IntervaloAlterado?.Invoke(intervaloAtual);
        }

        return Estado;
    }

    public EstadoJanelaTemporal MoverInicio(double posicaoSolicitada, double separacaoMinima)
    {
        var posicao = LimitarInicio(posicaoSolicitada, separacaoMinima);
        return AtualizarPosicoes(posicao, Estado.PosicaoFim);
    }

    public EstadoJanelaTemporal MoverFim(double posicaoSolicitada, double separacaoMinima)
    {
        var posicao = LimitarFim(posicaoSolicitada, separacaoMinima);
        return AtualizarPosicoes(Estado.PosicaoInicio, posicao);
    }

    public EstadoJanelaTemporal MoverConjunto(double posicaoInicioSolicitada, double posicaoFimSolicitada)
    {
        var posicoes = LimitarConjunto(posicaoInicioSolicitada, posicaoFimSolicitada);
        return AtualizarPosicoes(posicoes.Inicio, posicoes.Fim);
    }

    public double LimitarInicio(double posicaoSolicitada, double separacaoMinima)
    {
        ValidarSeparacaoMinima(separacaoMinima);
        ValidarPosicao(posicaoSolicitada, nameof(posicaoSolicitada));

        var posicaoAtual = Estado.PosicaoInicio;
        return posicaoSolicitada <= posicaoAtual
            ? posicaoSolicitada
            : Math.Min(posicaoSolicitada, Math.Max(posicaoAtual, Estado.PosicaoFim - separacaoMinima));
    }

    public double LimitarFim(double posicaoSolicitada, double separacaoMinima)
    {
        ValidarSeparacaoMinima(separacaoMinima);
        ValidarPosicao(posicaoSolicitada, nameof(posicaoSolicitada));

        var posicaoAtual = Estado.PosicaoFim;
        return posicaoSolicitada >= posicaoAtual
            ? posicaoSolicitada
            : Math.Max(posicaoSolicitada, Math.Min(posicaoAtual, Estado.PosicaoInicio + separacaoMinima));
    }

    public (double Inicio, double Fim) LimitarConjunto(double posicaoInicioSolicitada, double posicaoFimSolicitada)
    {
        ValidarPosicoesSolicitadasConjunto(posicaoInicioSolicitada, posicaoFimSolicitada);

        var larguraSolicitada = posicaoFimSolicitada - posicaoInicioSolicitada;
        var posicaoInicio = Math.Clamp(posicaoInicioSolicitada, 0d, 1d - larguraSolicitada);
        return (posicaoInicio, posicaoInicio + larguraSolicitada);
    }

    public ConclusaoOperacaoJanelaTemporal ConcluirOperacao()
    {
        var conclusao = new ConclusaoOperacaoJanelaTemporal(
            Estado.IntervaloValidoAtual,
            ultimoIntervaloValido,
            Estado.Invalida);
        OperacaoConcluida?.Invoke(conclusao);
        return conclusao;
    }

    private EstadoJanelaTemporal CriarEstado(
        double posicaoInicio,
        double posicaoFim,
        IntervaloJanelaTemporal? ultimoIntervalo)
    {
        var indiceInicio = ObterIndice(posicaoInicio, diasPreservados.Count);
        var indiceFim = ObterIndice(posicaoFim, diasPreservados.Count);
        var intervaloAtual = indiceInicio < indiceFim
            ? CriarIntervalo(indiceInicio, indiceFim)
            : null;

        return new EstadoJanelaTemporal(
            diasPreservados,
            posicaoInicio,
            posicaoFim,
            indiceInicio,
            indiceFim,
            diasPreservados.Count,
            intervaloAtual,
            intervaloAtual ?? ultimoIntervalo);
    }

    private IntervaloJanelaTemporal CriarIntervalo(int indiceInicio, int indiceFim) =>
        new(indiceInicio, indiceFim, diasPreservados[indiceInicio], diasPreservados[indiceFim]);

    private static int ObterIndice(double posicao, int quantidadeDias) =>
        (int)Math.Floor(posicao * (quantidadeDias - 1) + 0.5d);

    private static void ValidarDias(IReadOnlyList<DateOnly> dias)
    {
        if (dias.Count < 2)
            throw new ArgumentException("São necessários pelo menos dois dias preservados distintos.", nameof(dias));

        for (var indice = 1; indice < dias.Count; indice++)
        {
            if (dias[indice] <= dias[indice - 1])
                throw new ArgumentException("Os dias preservados devem ser distintos e estar em ordem cronológica.", nameof(dias));
        }
    }

    private static void ValidarPosicoes(double posicaoInicio, double posicaoFim)
    {
        ValidarPosicao(posicaoInicio, nameof(posicaoInicio));
        ValidarPosicao(posicaoFim, nameof(posicaoFim));
        if (posicaoInicio > posicaoFim)
            throw new ArgumentException("A posição inicial não pode ultrapassar a posição final.", nameof(posicaoInicio));
    }

    private static void ValidarPosicao(double posicao, string nomeParametro)
    {
        if (!double.IsFinite(posicao) || posicao is < 0d or > 1d)
            throw new ArgumentOutOfRangeException(nomeParametro, "A posição deve estar normalizada entre 0 e 1.");
    }

    private static void ValidarSeparacaoMinima(double separacaoMinima)
    {
        if (!double.IsFinite(separacaoMinima) || separacaoMinima is < 0d or > 1d)
            throw new ArgumentOutOfRangeException(nameof(separacaoMinima), "A separação mínima deve estar normalizada entre 0 e 1.");
    }

    private static void ValidarPosicoesSolicitadasConjunto(double posicaoInicio, double posicaoFim)
    {
        if (!double.IsFinite(posicaoInicio))
            throw new ArgumentOutOfRangeException(nameof(posicaoInicio), "A posição solicitada deve ser finita.");
        if (!double.IsFinite(posicaoFim))
            throw new ArgumentOutOfRangeException(nameof(posicaoFim), "A posição solicitada deve ser finita.");
        if (posicaoInicio > posicaoFim)
            throw new ArgumentException("A posição inicial não pode ultrapassar a posição final.", nameof(posicaoInicio));

        var largura = posicaoFim - posicaoInicio;
        if (!double.IsFinite(largura) || largura > 1d)
            throw new ArgumentOutOfRangeException(nameof(posicaoFim), "A largura do intervalo solicitado deve caber no trilho normalizado.");
    }

    private static void ValidarIntervaloRestaurado(
        IntervaloJanelaTemporal intervalo,
        IReadOnlyList<DateOnly> dias)
    {
        if (intervalo.IndiceInicio < 0
            || intervalo.IndiceFim >= dias.Count
            || intervalo.IndiceInicio >= intervalo.IndiceFim
            || intervalo.DataInicio != dias[intervalo.IndiceInicio]
            || intervalo.DataFim != dias[intervalo.IndiceFim])
        {
            throw new ArgumentException("O último intervalo restaurado não pertence à sequência de dias preservados atual.", nameof(intervalo));
        }
    }
}
