using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record CacheConsultaMemoriasCategoriaLocal(
    string IdentidadeConta, string IdentidadeJornada, string IdentidadeCategoria,
    DateOnly DataInicio, DateOnly DataFim, string Revisao,
    IReadOnlyList<MemoriaCategoriaRemota> Itens, bool TemMais, string? ProximoCursor);

public interface ICacheConsultaMemoriasCategoriaLocal
{
    Task<ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>> RecuperarConsultaMemoriasCategoriaAsync(
        string identidadeConta, string identidadeJornada);
    Task<ResultadoLocal<bool>> GravarConsultaMemoriasCategoriaAsync(CacheConsultaMemoriasCategoriaLocal cache);
    Task<ResultadoLocal<bool>> RemoverConsultaMemoriasCategoriaAsync(string identidadeConta, string identidadeJornada);
}
