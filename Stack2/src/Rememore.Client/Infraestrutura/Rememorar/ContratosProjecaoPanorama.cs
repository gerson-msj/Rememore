using System.Globalization;
using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record AssociacaoPanoramaRemota(string IdentidadeCategoria, int? Tom);
public sealed record BlocoDiaPanoramaRemoto(string Data, IReadOnlyList<AssociacaoPanoramaRemota> Associacoes);
public enum TipoAlteracaoDiaPanorama { Atualizado, Removido }
public sealed record AlteracaoDiaPanoramaRemota(TipoAlteracaoDiaPanorama Tipo, string Data, BlocoDiaPanoramaRemoto? Bloco = null);
public enum EstadoConsultaPanoramaRemota { Inicial, SemMudancas, Delta, Reconstrucao, Falha, Inconclusivo }
public sealed record RespostaPanoramaRemota(
    EstadoConsultaPanoramaRemota Estado, string? Revisao = null,
    IReadOnlyList<BlocoDiaPanoramaRemoto>? Dias = null,
    IReadOnlyList<AlteracaoDiaPanoramaRemota>? Alteracoes = null);
public sealed record CacheProjecaoPanoramaLocal(
    string IdentidadeConta, string Revisao, IReadOnlyList<BlocoDiaPanoramaRemoto> Dias);
public sealed record ResultadoPreparacaoPanorama(
    bool Disponivel, IReadOnlyList<BlocoDiaPanoramaRemoto> Dias,
    IReadOnlyList<CategoriaPreservadaRemota> Categorias, bool UsouCache, string? Falha = null);

public interface IProjecaoPanoramaRemota
{
    Task<RespostaPanoramaRemota> ConsultarProjecaoAsync(string identidadeConta, string? revisaoConhecida);
}

public interface ICacheProjecaoPanoramaLocal
{
    Task<ResultadoLocal<CacheProjecaoPanoramaLocal>> RecuperarProjecaoAsync(string identidadeConta);
    Task<ResultadoLocal<bool>> GravarProjecaoAsync(CacheProjecaoPanoramaLocal cache);
}

public sealed class SincronizadorProjecaoPanorama(
    IProjecaoPanoramaRemota remota,
    ICacheProjecaoPanoramaLocal cacheLocal,
    CatalogoCategoriasPorConta catalogo)
{
    public async Task<ResultadoPreparacaoPanorama> PrepararAsync(string identidadeConta)
    {
        if (string.IsNullOrWhiteSpace(identidadeConta)) return Indisponivel("contaInvalida");
        var leitura = await cacheLocal.RecuperarProjecaoAsync(identidadeConta);
        if (!leitura.Sucesso && leitura.Estado != EstadoOperacaoLocal.Ausente)
            return Indisponivel("leituraCache");
        var cache = leitura.Sucesso ? leitura.Valor : null;
        if (cache is not null && cache.IdentidadeConta != identidadeConta) return Indisponivel("contaCacheIncompativel");
        if (cache is not null && !CacheValido(cache)) cache = null;

        RespostaPanoramaRemota resposta;
        try { resposta = await remota.ConsultarProjecaoAsync(identidadeConta, cache?.Revisao); }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException or InvalidOperationException)
        { resposta = new(EstadoConsultaPanoramaRemota.Falha); }

        var atualizado = Aplicar(cache, identidadeConta, resposta);
        var usouCache = atualizado is null;
        if (atualizado is null)
        {
            if (cache is null) return Indisponivel("consultaRemota");
            atualizado = cache;
        }
        else if (!ReferenceEquals(atualizado, cache))
        {
            var gravacao = await cacheLocal.GravarProjecaoAsync(atualizado);
            if (!gravacao.Sucesso) return cache is null
                ? Indisponivel("gravacaoCache")
                : new(false, cache.Dias, [], true, "gravacaoCache");
        }

        // Primeiro reconciliamos a projeção mínima; depois atualizamos o catálogo compartilhado.
        var resultadoCatalogo = await catalogo.AtualizarAsync(identidadeConta);
        if (!resultadoCatalogo.Disponivel)
        {
            var identidadesAssociadas = atualizado.Dias.SelectMany(dia => dia.Associacoes)
                .Select(associacao => associacao.IdentidadeCategoria).Distinct(StringComparer.Ordinal).ToArray();
            var identidadesResolvidas = resultadoCatalogo.Categorias.Select(categoria => categoria.Identidade)
                .ToHashSet(StringComparer.Ordinal);
            if (!resultadoCatalogo.FalhaCache
                && identidadesAssociadas.All(identidadesResolvidas.Contains))
                return new(true, atualizado.Dias, resultadoCatalogo.Categorias, true);
            return new(false, atualizado.Dias, resultadoCatalogo.Categorias, usouCache, "catalogoIndisponivel");
        }
        return new(true, atualizado.Dias, resultadoCatalogo.Categorias, usouCache);
    }

    public static CacheProjecaoPanoramaLocal? Aplicar(
        CacheProjecaoPanoramaLocal? cache, string identidadeConta, RespostaPanoramaRemota resposta)
    {
        if (cache is not null && (cache.IdentidadeConta != identidadeConta || !CacheValido(cache))) return null;
        if (string.IsNullOrWhiteSpace(identidadeConta) || !long.TryParse(resposta.Revisao,
                NumberStyles.None, CultureInfo.InvariantCulture, out var revisao) || revisao < 0)
            return null;
        if (cache is not null && (!long.TryParse(cache.Revisao, NumberStyles.None,
                CultureInfo.InvariantCulture, out var revisaoCache) || revisao < revisaoCache
                || resposta.Estado == EstadoConsultaPanoramaRemota.Delta && revisao <= revisaoCache))
            return null;

        IReadOnlyList<BlocoDiaPanoramaRemoto> dias;
        switch (resposta.Estado)
        {
            case EstadoConsultaPanoramaRemota.Inicial when cache is null && resposta.Dias is not null && resposta.Alteracoes is null:
            case EstadoConsultaPanoramaRemota.Reconstrucao when resposta.Dias is not null && resposta.Alteracoes is null:
                dias = resposta.Dias;
                break;
            case EstadoConsultaPanoramaRemota.SemMudancas when cache is not null
                && cache.IdentidadeConta == identidadeConta && cache.Revisao == resposta.Revisao
                && resposta.Dias is null && resposta.Alteracoes is null:
                return cache;
            case EstadoConsultaPanoramaRemota.Delta when cache is not null
                && cache.IdentidadeConta == identidadeConta && resposta.Alteracoes is not null && resposta.Dias is null:
                var porData = cache.Dias.ToDictionary(dia => dia.Data, StringComparer.Ordinal);
                foreach (var alteracao in resposta.Alteracoes)
                {
                    if (!DataValida(alteracao.Data) || !Enum.IsDefined(alteracao.Tipo)) return null;
                    if (alteracao.Tipo == TipoAlteracaoDiaPanorama.Removido)
                    {
                        if (alteracao.Bloco is not null) return null;
                        porData.Remove(alteracao.Data);
                    }
                    else
                    {
                        if (alteracao.Bloco is null || alteracao.Bloco.Data != alteracao.Data || !BlocoValido(alteracao.Bloco)) return null;
                        porData[alteracao.Data] = alteracao.Bloco;
                    }
                }
                dias = porData.Values.OrderBy(dia => dia.Data, StringComparer.Ordinal).ToArray();
                break;
            default:
                return null;
        }

        if (dias.Any(dia => !BlocoValido(dia)) || dias.Select(dia => dia.Data).Distinct(StringComparer.Ordinal).Count() != dias.Count)
            return null;
        return new(identidadeConta, revisao.ToString(CultureInfo.InvariantCulture), dias
            .OrderBy(dia => dia.Data, StringComparer.Ordinal).ToArray());
    }

    private static bool BlocoValido(BlocoDiaPanoramaRemoto dia) => DataValida(dia.Data)
        && dia.Associacoes is not null
        && dia.Associacoes.All(item => !string.IsNullOrWhiteSpace(item.IdentidadeCategoria)
            && (item.Tom is null || item.Tom is >= -100 and <= 100));

    private static bool CacheValido(CacheProjecaoPanoramaLocal cache) =>
        long.TryParse(cache.Revisao, NumberStyles.None, CultureInfo.InvariantCulture, out _)
        && cache.Dias is not null
        && cache.Dias.All(BlocoValido)
        && cache.Dias.Select(dia => dia.Data).Distinct(StringComparer.Ordinal).Count() == cache.Dias.Count;

    private static bool DataValida(string data) => DateOnly.TryParseExact(data, "yyyy-MM-dd", CultureInfo.InvariantCulture,
        DateTimeStyles.None, out _);

    private static ResultadoPreparacaoPanorama Indisponivel(string falha) => new(false, [], [], false, falha);
}
