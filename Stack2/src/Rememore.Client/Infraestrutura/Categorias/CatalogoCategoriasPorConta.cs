using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Categorias;

public sealed class CatalogoCategoriasPorConta(ICatalogoCategoriasRemoto remoto, ICacheCatalogoCategoriasLocal cacheLocal)
{
    public async Task<ResultadoCatalogoCategorias> AtualizarAsync(string identidadeConta)
    {
        var leitura = await cacheLocal.RecuperarAsync(identidadeConta);
        var cache = leitura.Sucesso && leitura.Valor?.IdentidadeConta == identidadeConta ? leitura.Valor : null;
        if (!leitura.Sucesso && leitura.Estado != EstadoOperacaoLocal.Ausente)
            return new([], false, FalhaCache: true);
        if (leitura.Sucesso && cache is null)
            return new([], false, FalhaCache: true);

        RespostaCatalogoCategoriasRemoto resposta;
        try { resposta = await remoto.ConsultarAsync(identidadeConta, cache?.Revisao); }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
        {
            return new(cache?.Categorias ?? [], false);
        }
        var atualizado = Aplicar(cache, identidadeConta, resposta);
        if (atualizado is null)
            return new(cache?.Categorias ?? [], false);

        if (resposta.Estado != EstadoConsultaCatalogoCategorias.SemMudancas)
        {
            var gravacao = await cacheLocal.GravarAsync(atualizado);
            if (!gravacao.Sucesso)
                return new(cache?.Categorias ?? atualizado.Categorias, true, FalhaCache: true);
        }

        return new(atualizado.Categorias, true);
    }

    public static CacheCatalogoCategoriasLocal? Aplicar(
        CacheCatalogoCategoriasLocal? cache, string identidadeConta, RespostaCatalogoCategoriasRemoto resposta)
    {
        if (string.IsNullOrWhiteSpace(identidadeConta) || string.IsNullOrWhiteSpace(resposta.Revisao)) return null;
        IReadOnlyList<CategoriaPreservadaRemota> itens;
        switch (resposta.Estado)
        {
            case EstadoConsultaCatalogoCategorias.Inicial when cache is null
                && resposta.Categorias is not null && resposta.Alteracoes is null:
                itens = resposta.Categorias;
                break;
            case EstadoConsultaCatalogoCategorias.SemMudancas when cache is not null
                && cache.IdentidadeConta == identidadeConta && cache.Revisao == resposta.Revisao
                && resposta.Categorias is null && resposta.Alteracoes is null:
                return cache;
            case EstadoConsultaCatalogoCategorias.Delta when cache is not null
                && cache.IdentidadeConta == identidadeConta && resposta.Alteracoes is not null
                && resposta.Categorias is null:
                var porId = cache.Categorias.ToDictionary(item => item.Identidade, StringComparer.Ordinal);
                foreach (var alteracao in resposta.Alteracoes)
                {
                    var categoria = alteracao.Categoria;
                    if (!Enum.IsDefined(alteracao.Tipo)
                        || string.IsNullOrWhiteSpace(categoria.Identidade) || string.IsNullOrWhiteSpace(categoria.Nome)
                        || categoria.Versao <= 0)
                        return null;
                    if (!porId.TryGetValue(categoria.Identidade, out var anterior) || categoria.Versao > anterior.Versao)
                        porId[categoria.Identidade] = categoria;
                }
                itens = porId.Values.OrderBy(item => item.Identidade, StringComparer.Ordinal).ToArray();
                break;
            default:
                return null;
        }

        if (itens.Any(item => string.IsNullOrWhiteSpace(item.Identidade) || string.IsNullOrWhiteSpace(item.Nome) || item.Versao <= 0)
            || itens.Select(item => item.Identidade).Distinct(StringComparer.Ordinal).Count() != itens.Count)
            return null;
        return new(identidadeConta, resposta.Revisao, itens.ToArray());
    }
}
