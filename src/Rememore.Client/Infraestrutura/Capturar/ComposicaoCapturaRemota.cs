using Rememore.Client.Infraestrutura.TrabalhoLocal;

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

public sealed class ComposicaoCapturaRemotaSimulada : IComposicaoCapturaRemota
{
    private readonly Dictionary<(string Conta, DateOnly Data), ComposicaoCapturaRemota> dados = [];

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
