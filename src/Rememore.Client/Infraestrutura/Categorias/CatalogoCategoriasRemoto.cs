namespace Rememore.Client.Infraestrutura.Categorias;

public enum EstadoCatalogoCategoriasRemoto
{
    Disponivel,
    Falha,
    Inconclusivo
}

public sealed record CategoriaPreservadaRemota(string Identidade, string Nome, bool Ativa);

public sealed record RespostaCatalogoCategoriasRemoto(
    EstadoCatalogoCategoriasRemoto Estado,
    IReadOnlyList<CategoriaPreservadaRemota>? Categorias = null);

public interface ICatalogoCategoriasRemoto
{
    Task<RespostaCatalogoCategoriasRemoto> ObterAtivasAsync(string identidadeConta);
}

public sealed class CatalogoCategoriasRemotoSimulado : ICatalogoCategoriasRemoto
{
    private static readonly IReadOnlyList<CategoriaPreservadaRemota> Categorias =
    [
        new("categoria-familia", "Família", true),
        new("categoria-trabalho", "Trabalho", true),
        new("categoria-viagens", "Viagens", true)
    ];

    public Task<RespostaCatalogoCategoriasRemoto> ObterAtivasAsync(string identidadeConta) =>
        Task.FromResult(string.IsNullOrWhiteSpace(identidadeConta)
            ? new RespostaCatalogoCategoriasRemoto(EstadoCatalogoCategoriasRemoto.Inconclusivo)
            : new RespostaCatalogoCategoriasRemoto(EstadoCatalogoCategoriasRemoto.Disponivel, Categorias));
}
