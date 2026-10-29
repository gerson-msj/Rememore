namespace Rememore.Client.Infraestrutura.OrientacaoProgressiva;

public sealed class CatalogoOrientacoes
{
    private readonly Dictionary<string, DefinicaoOrientacao> definicoes = new(StringComparer.Ordinal);

    public static CatalogoOrientacoes CriarPadrao() => new([
        new DefinicaoOrientacao(
            ContextosOrientacao.SelecaoCapturar,
            "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
            "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
            null),
        new DefinicaoOrientacao(
            ContextosOrientacao.CapturaMemorar,
            "Comece pelo que vier à memória. Pode ser uma frase curta, um detalhe ou algo que aconteceu hoje.",
            "Registre uma lembrança por vez. Memórias mais focadas ajudam a reencontrar melhor cada contexto depois.",
            "Observe detalhes que normalmente passariam despercebidos: uma conversa, uma sensação, uma pequena mudança.")
    ]);

    public CatalogoOrientacoes(IEnumerable<DefinicaoOrientacao> definicoes)
    {
        ArgumentNullException.ThrowIfNull(definicoes);

        foreach (var definicao in definicoes)
        {
            ArgumentNullException.ThrowIfNull(definicao);

            if (string.IsNullOrWhiteSpace(definicao.Contexto))
                throw new ArgumentException("O contexto de orientação não pode ser vazio.", nameof(definicoes));

            ValidarMensagem(definicao.Iniciante, definicao.Contexto);
            ValidarMensagem(definicao.Intermediario, definicao.Contexto);
            ValidarMensagem(definicao.Avancado, definicao.Contexto);

            if (!this.definicoes.TryAdd(definicao.Contexto, definicao))
                throw new ArgumentException($"O contexto de orientação '{definicao.Contexto}' está duplicado.", nameof(definicoes));
        }
    }

    public DefinicaoOrientacao Obter(string contexto)
    {
        if (string.IsNullOrWhiteSpace(contexto))
            throw new ArgumentException("Informe um contexto de orientação.", nameof(contexto));

        if (!definicoes.TryGetValue(contexto, out var definicao))
            throw new ArgumentException($"Contexto de orientação desconhecido: '{contexto}'.", nameof(contexto));

        return definicao;
    }

    private static void ValidarMensagem(string? mensagem, string contexto)
    {
        if (mensagem is not null && string.IsNullOrWhiteSpace(mensagem))
            throw new ArgumentException($"O contexto de orientação '{contexto}' possui uma mensagem vazia.");
    }
}
