namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record PedidoMemoriasCategoria(
    string IdentidadeConta, string IdentidadeCategoria, DateOnly DataInicio, DateOnly DataFim,
    string? Cursor = null);

public sealed record MemoriaCategoriaRemota(
    string Identidade, DateOnly Data, int Ordem, string Conteudo, int? Tom);

public enum EstadoConsultaMemoriasCategoria { Sucesso, ReinicioNecessario, Falha, EntradaInvalida }

public sealed record RespostaMemoriasCategoria(
    EstadoConsultaMemoriasCategoria Estado, string? Revisao = null,
    IReadOnlyList<MemoriaCategoriaRemota>? Itens = null, bool TemMais = false,
    string? ProximoCursor = null);

public interface IConsultaMemoriasCategoriaRemota
{
    Task<RespostaMemoriasCategoria> ConsultarMemoriasCategoriaAsync(PedidoMemoriasCategoria pedido);
}
