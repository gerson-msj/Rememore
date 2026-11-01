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

    public static readonly DateOnly DataCenarioE4 = new(2026, 10, 22);

    public ComposicaoCapturaRemotaSimulada()
    {
        var preservacaoPrincipal = new DateTimeOffset(2026, 10, 22, 12, 0, 0, TimeSpan.Zero);
        var preservacaoComplemento = new DateTimeOffset(2026, 10, 27, 12, 0, 0, TimeSpan.Zero);
        Definir(EstadoAutenticacaoProvider.IdentidadeContaSimulada, DataCenarioE4,
            new(EstadoComposicaoRemota.Presente, "e4-cenario-2026-10-22", [
                new MemoriaCapturaLocal("e4-memoria-sem-complemento",
                    "Memória fictícia preservada há dez dias, sem complementos.", 0,
                    preservacaoPrincipal, true, []),
                new MemoriaCapturaLocal("e4-memoria-com-complemento",
                    "Memória fictícia preservada há dez dias, com um complemento histórico.", 1,
                    preservacaoPrincipal, true, [
                        new ComplementoCapturaLocal("e4-complemento-cinco-dias",
                            "Complemento fictício preservado há cinco dias.", 0,
                            preservacaoComplemento, true)
                    ])
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
