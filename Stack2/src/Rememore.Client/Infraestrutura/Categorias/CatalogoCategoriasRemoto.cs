using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Categorias;

public enum EstadoConsultaCatalogoCategorias { Inicial, SemMudancas, Delta, Falha, Inconclusivo }
public enum TipoAlteracaoCategoria { Criada, Renomeada, Inativada, Reativada }

public sealed record CategoriaPreservadaRemota(string Identidade, string Nome, long Versao, bool Ativa);
public sealed record AlteracaoCategoriaRemota(TipoAlteracaoCategoria Tipo, CategoriaPreservadaRemota Categoria);
public sealed record RespostaCatalogoCategoriasRemoto(
    EstadoConsultaCatalogoCategorias Estado,
    string? Revisao = null,
    IReadOnlyList<CategoriaPreservadaRemota>? Categorias = null,
    IReadOnlyList<AlteracaoCategoriaRemota>? Alteracoes = null);
public sealed record CacheCatalogoCategoriasLocal(
    string IdentidadeConta, string Revisao, IReadOnlyList<CategoriaPreservadaRemota> Categorias);
public sealed record ResultadoCatalogoCategorias(
    IReadOnlyList<CategoriaPreservadaRemota> Categorias, bool Disponivel, bool FalhaCache = false);

public interface ICatalogoCategoriasRemoto
{
    Task<RespostaCatalogoCategoriasRemoto> ConsultarAsync(string identidadeConta, string? revisaoConhecida);
}

public interface ICacheCatalogoCategoriasLocal
{
    Task<ResultadoLocal<CacheCatalogoCategoriasLocal>> RecuperarAsync(string identidadeConta);
    Task<ResultadoLocal<bool>> GravarAsync(CacheCatalogoCategoriasLocal cache);
}

public sealed class CatalogoCategoriasRemotoSimulado : ICatalogoCategoriasRemoto
{
    private readonly List<CategoriaPreservadaRemota> categorias =
    [
        new("categoria-familia", "Família", 1, true),
        new("categoria-trabalho", "Trabalho", 1, true),
        new("categoria-viagens", "Viagens", 1, true)
    ];
    private readonly List<AlteracaoCategoriaRemota> alteracoes = [];

    public string RevisaoAtual { get; private set; } = "3";
    public int Consultas { get; private set; }

    public Task<RespostaCatalogoCategoriasRemoto> ConsultarAsync(string identidadeConta, string? revisaoConhecida)
    {
        Consultas++;
        if (string.IsNullOrWhiteSpace(identidadeConta))
            return Task.FromResult(new RespostaCatalogoCategoriasRemoto(EstadoConsultaCatalogoCategorias.Inconclusivo));
        if (revisaoConhecida is null)
            return Task.FromResult(new RespostaCatalogoCategoriasRemoto(EstadoConsultaCatalogoCategorias.Inicial,
                RevisaoAtual, categorias.ToArray()));
        if (revisaoConhecida == RevisaoAtual)
            return Task.FromResult(new RespostaCatalogoCategoriasRemoto(EstadoConsultaCatalogoCategorias.SemMudancas, RevisaoAtual));

        var cursor = int.TryParse(revisaoConhecida, out var valor) ? valor : 0;
        var delta = alteracoes.Where(alteracao => alteracao.Categoria.Versao > cursor).ToArray();
        return Task.FromResult(new RespostaCatalogoCategoriasRemoto(EstadoConsultaCatalogoCategorias.Delta,
            RevisaoAtual, Alteracoes: delta));
    }

    public void Atualizar(CategoriaPreservadaRemota categoria)
    {
        var revisao = int.Parse(RevisaoAtual, System.Globalization.CultureInfo.InvariantCulture) + 1;
        var atualizada = categoria with { Versao = revisao };
        var indice = categorias.FindIndex(item => item.Identidade == categoria.Identidade);
        var anterior = indice >= 0 ? categorias[indice] : null;
        var tipo = anterior is null ? TipoAlteracaoCategoria.Criada
            : anterior.Ativa != atualizada.Ativa
                ? atualizada.Ativa ? TipoAlteracaoCategoria.Reativada : TipoAlteracaoCategoria.Inativada
                : TipoAlteracaoCategoria.Renomeada;
        if (indice >= 0) categorias[indice] = atualizada;
        else categorias.Add(atualizada);
        alteracoes.Add(new(tipo, atualizada));
        RevisaoAtual = revisao.ToString(System.Globalization.CultureInfo.InvariantCulture);
    }
}
