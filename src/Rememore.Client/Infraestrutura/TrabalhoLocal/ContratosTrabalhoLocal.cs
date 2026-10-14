namespace Rememore.Client.Infraestrutura.TrabalhoLocal;

public enum EstadoOperacaoLocal { Sucesso, Ausente, ApiIndisponivel, Falha }

public sealed record FalhaTrabalhoLocal(string Etapa, string Codigo);

public sealed record ResultadoLocal<T>(EstadoOperacaoLocal Estado, T? Valor = default, FalhaTrabalhoLocal? Falha = null)
{
    public bool Sucesso => Estado == EstadoOperacaoLocal.Sucesso;
}

public sealed record MemoriaCapturaLocal(string Identidade, string Conteudo, int Ordem);

public sealed record WorkspaceCapturaLocal(
    string IdentidadeConta, DateOnly Data, bool Alterado, IReadOnlyList<MemoriaCapturaLocal> Memorias);

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
}
