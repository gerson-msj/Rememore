using Rememore.Client.Infraestrutura.TrabalhoLocal;
using Rememore.Client.Infraestrutura;

namespace Rememore.Client.Infraestrutura.Capturar;

public enum EstadoComposicaoRemota { Presente, Ausente, Falha, Inconclusiva }

public sealed record VerificacaoComposicaoRemota(EstadoComposicaoRemota Estado, string? Revisao = null);

public sealed record ComposicaoCapturaRemota(
    EstadoComposicaoRemota Estado, string? Revisao = null, IReadOnlyList<MemoriaCapturaLocal>? Memorias = null);

public interface IComposicaoCapturaRemota
{
    Task<VerificacaoComposicaoRemota> VerificarAsync(string identidadeConta, DateOnly data);
    Task<ComposicaoCapturaRemota> ObterCompletaAsync(string identidadeConta, DateOnly data);
}

public sealed record ResultadoPreservacaoRemota(EstadoComposicaoRemota Estado, string? Revisao = null,
    IReadOnlyList<MemoriaCapturaLocal>? Memorias = null);

public interface IAutoridadeCapturaFake : IComposicaoCapturaRemota
{
    Task<ResultadoPreservacaoRemota> PreservarAsync(WorkspaceCapturaLocal captura);
}

public sealed record ConfiguracaoCapturar(int PrazoEdicaoMemoriaDias);

public interface IConfiguracaoCapturar
{
    Task<ConfiguracaoCapturar?> ObterAsync();
}

public sealed class ConfiguracaoCapturarSimulada : IConfiguracaoCapturar
{
    public ConfiguracaoCapturar? Atual { get; set; } = new(3);
    public Task<ConfiguracaoCapturar?> ObterAsync() => Task.FromResult(Atual);
}

public sealed class ComposicaoCapturaRemotaSimulada : IComposicaoCapturaRemota
{
    private readonly Dictionary<(string Conta, DateOnly Data), ComposicaoCapturaRemota> dados = [];

    public static readonly DateOnly DataCenarioE1 = new(2026, 11, 1);

    public ComposicaoCapturaRemotaSimulada()
    {
        Definir(EstadoAutenticacaoProvider.IdentidadeContaSimulada, DataCenarioE1,
            new(EstadoComposicaoRemota.Presente, "e2-captura-2026-11-01-temporalidade", [
                new("e1-memoria-01", "Guardei o caminho tranquilo que fiz ao voltar para casa.", 0, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-02", "O café da manhã demorou mais porque ficamos conversando.", 1, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-03", "Recebi uma mensagem que me deixou contente.", 2, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-04", "No fim da tarde, a luz entrou pela janela e iluminou a sala.", 3, TemporalidadeConhecida: true, Complementos: [
                    new ComplementoCapturaLocal("e2-complemento-04-01", "Mais tarde, contei essa lembrança durante uma conversa tranquila.", 0, TemporalidadeConhecida: true)
                ]),
                new("e1-memoria-05", "Aprendi algo novo durante uma conversa breve.", 4, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-06", "Saí para caminhar. O ar estava fresco e a rua, silenciosa.", 5, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-07", "Preparamos juntos uma refeição simples para o jantar.", 6, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-08", "Uma ligação inesperada trouxe notícias da família e alguns planos para os próximos dias.", 7, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-09", "Anotei uma ideia antes que ela escapasse.", 8, TemporalidadeConhecida: true, Complementos: []),
                new("e1-memoria-10", "Terminamos o dia lembrando de uma viagem antiga e das histórias que ainda contamos sobre ela.", 9, TemporalidadeConhecida: true, Complementos: [])
            ]));
    }

    public int Verificacoes { get; private set; }
    public int LeiturasCompletas { get; private set; }

    public void Definir(string identidadeConta, DateOnly data, ComposicaoCapturaRemota resposta) =>
        dados[(identidadeConta, data)] = resposta;

    public Task<VerificacaoComposicaoRemota> VerificarAsync(string identidadeConta, DateOnly data)
    {
        Verificacoes++;
        var resposta = Consultar(identidadeConta, data);
        return Task.FromResult(new VerificacaoComposicaoRemota(resposta.Estado, resposta.Revisao));
    }

    public Task<ComposicaoCapturaRemota> ObterCompletaAsync(string identidadeConta, DateOnly data)
    {
        LeiturasCompletas++;
        return Task.FromResult(Consultar(identidadeConta, data));
    }

    private ComposicaoCapturaRemota Consultar(string identidadeConta, DateOnly data) =>
        dados.GetValueOrDefault((identidadeConta, data)) ?? new(EstadoComposicaoRemota.Ausente);
}
