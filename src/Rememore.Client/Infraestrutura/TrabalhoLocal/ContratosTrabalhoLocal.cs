namespace Rememore.Client.Infraestrutura.TrabalhoLocal;

public enum EstadoOperacaoLocal { Sucesso, Ausente, ApiIndisponivel, Falha }

public sealed record FalhaTrabalhoLocal(string Etapa, string Codigo);

public sealed record ResultadoLocal<T>(EstadoOperacaoLocal Estado, T? Valor = default, FalhaTrabalhoLocal? Falha = null)
{
    public bool Sucesso => Estado == EstadoOperacaoLocal.Sucesso;
}

public sealed record ComplementoCapturaLocal(
    string Identidade, string Conteudo, int Ordem, DateTimeOffset? PrimeiraPreservacaoUtc = null,
    bool TemporalidadeConhecida = false);

public sealed record MemoriaCapturaLocal(
    string Identidade, string Conteudo, int Ordem,
    DateTimeOffset? PrimeiraPreservacaoUtc = null,
    bool TemporalidadeConhecida = false,
    IReadOnlyList<ComplementoCapturaLocal>? Complementos = null);

public enum OrigemCapturaLocal { Desconhecida, Ausente, Presente }

public sealed record WorkspaceCapturaLocal(
    string IdentidadeConta, DateOnly Data, bool Alterado, IReadOnlyList<MemoriaCapturaLocal> Memorias,
    OrigemCapturaLocal Origem = OrigemCapturaLocal.Desconhecida, string? RevisaoOrigem = null);

public interface IDiagnosticoTrabalhoLocal
{
    Task<ResultadoLocal<bool>> DiagnosticarAsync();
}

// A conta é explícita em toda operação; não depende do nome exibido ou de estado global.
public interface ICapturasLocais
{
    Task<ResultadoLocal<bool>> GravarAsync(WorkspaceCapturaLocal captura);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> RecuperarAsync(string identidadeConta, DateOnly data);
    Task<ResultadoLocal<bool>> RemoverAsync(string identidadeConta, DateOnly data);
    Task<ResultadoLocal<IReadOnlyList<WorkspaceCapturaLocal>>> ConsultarAsync(string identidadeConta);
    Task<ResultadoLocal<bool>> GravarSeLimpoAsync(WorkspaceCapturaLocal captura);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> MarcarAlteradoAsync(string identidadeConta, DateOnly data);
    Task<ResultadoLocal<bool>> RemoverSeAlteradoAsync(string identidadeConta, DateOnly data);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarEdicaoMemoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string conteudoAnterior, string novoConteudo);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> ExcluirMemoriaSemComplementosAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string conteudoConfirmado);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarComplementoAsync(string identidadeConta, DateOnly data, string identidadeMemoria, int quantidadeEsperada, string? identidadeUltimoEsperada, string? identidadeComplemento, string? conteudoAnterior, string novoConteudo);
    Task<ResultadoLocal<WorkspaceCapturaLocal>> ExcluirUltimoComplementoAsync(string identidadeConta, DateOnly data, string identidadeMemoria, int quantidadeEsperada, string identidadeComplemento, string conteudoConfirmado);
}
