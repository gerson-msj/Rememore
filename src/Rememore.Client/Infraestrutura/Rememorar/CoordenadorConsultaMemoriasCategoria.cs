using Rememore.Client.Componentes;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Rememorar;

public sealed record PublicacaoMemoriasCategoria(
    string IdentidadeConta, string IdentidadeJornada, string IdentidadeCategoria,
    IntervaloJanelaTemporal Intervalo, string Revisao,
    IReadOnlyList<MemoriaCategoriaRemota> Itens, bool TemMais, string? ProximoCursor,
    bool RestauradaDoCache);

public sealed class CoordenadorConsultaMemoriasCategoria(
    IConsultaMemoriasCategoriaRemota remota,
    ICacheConsultaMemoriasCategoriaLocal cacheLocal)
{
    private readonly SemaphoreSlim escritaCache = new(1, 1);
    private long geracao;
    private string? conta;
    private string? jornada;
    private string? categoria;
    private IntervaloJanelaTemporal? intervaloPendente;
    private bool carregandoLote;

    public PublicacaoMemoriasCategoria? Publicado { get; private set; }
    public bool Carregando { get; private set; }
    public bool CacheIndisponivel { get; private set; }
    public string? Falha { get; private set; }
    public event Action? Atualizado;

    public async Task AbrirAsync(string identidadeConta, string identidadeJornada,
        string identidadeCategoria, IntervaloJanelaTemporal intervalo)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(identidadeConta);
        ArgumentException.ThrowIfNullOrWhiteSpace(identidadeJornada);
        ArgumentException.ThrowIfNullOrWhiteSpace(identidadeCategoria);
        ArgumentNullException.ThrowIfNull(intervalo);
        conta = identidadeConta;
        jornada = identidadeJornada;
        categoria = identidadeCategoria;
        Publicado = null;
        CacheIndisponivel = false;
        await ConsultarPrimeiroAsync(intervalo, restaurar: true);
    }

    public Task ConfirmarIntervaloAsync(IntervaloJanelaTemporal? intervalo)
    {
        if (intervalo is null || conta is null || jornada is null || categoria is null
            || intervalo == intervaloPendente)
            return Task.CompletedTask;
        if (intervalo == Publicado?.Intervalo)
        {
            if (intervaloPendente is not null)
            {
                geracao++;
                intervaloPendente = null;
                Carregando = false;
                Falha = null;
                Notificar();
            }
            return Task.CompletedTask;
        }
        return ConsultarPrimeiroAsync(intervalo, restaurar: false);
    }

    public async Task CarregarMaisAsync()
    {
        var publicado = Publicado;
        if (publicado is null || !publicado.TemMais || publicado.ProximoCursor is null
            || carregandoLote || intervaloPendente is not null)
            return;
        carregandoLote = true;
        Carregando = true;
        Falha = null;
        Notificar();
        var versao = geracao;
        try
        {
            var resposta = await ConsultarRemotaAsync(publicado, publicado.ProximoCursor);
            if (versao != geracao || !ReferenceEquals(publicado, Publicado)) return;
            if (resposta.Estado == EstadoConsultaMemoriasCategoria.ReinicioNecessario)
            {
                await ConsultarPrimeiroAsync(publicado.Intervalo, restaurar: false);
                return;
            }
            if (!RespostaValida(resposta) || resposta.Revisao != publicado.Revisao)
            {
                Falha = "consultaLote";
                return;
            }
            var identidades = publicado.Itens.Select(item => item.Identidade).ToHashSet(StringComparer.Ordinal);
            var itens = publicado.Itens.Concat(resposta.Itens!.Where(item => identidades.Add(item.Identidade))).ToArray();
            var atualizado = publicado with { Itens = itens, TemMais = resposta.TemMais,
                ProximoCursor = resposta.ProximoCursor, RestauradaDoCache = false };
            await GravarSeAtualAsync(atualizado, versao);
            if (versao == geracao && ReferenceEquals(publicado, Publicado)) Publicado = atualizado;
        }
        finally
        {
            carregandoLote = false;
            if (versao == geracao) { Carregando = false; Notificar(); }
        }
    }

    public async Task EncerrarJornadaAsync()
    {
        var contaAtual = conta;
        var jornadaAtual = jornada;
        geracao++;
        conta = jornada = categoria = null;
        intervaloPendente = null;
        Publicado = null;
        Carregando = false;
        Falha = null;
        Notificar();
        if (contaAtual is null || jornadaAtual is null) return;
        await escritaCache.WaitAsync();
        try { await cacheLocal.RemoverConsultaMemoriasCategoriaAsync(contaAtual, jornadaAtual); }
        finally { escritaCache.Release(); }
    }

    private async Task ConsultarPrimeiroAsync(IntervaloJanelaTemporal intervalo, bool restaurar)
    {
        var versao = ++geracao;
        intervaloPendente = intervalo;
        Carregando = true;
        Falha = null;
        Notificar();
        try
        {
            CacheConsultaMemoriasCategoriaLocal? cache = null;
            if (restaurar)
            {
                try
                {
                    var leitura = await cacheLocal.RecuperarConsultaMemoriasCategoriaAsync(conta!, jornada!);
                    if (leitura.Sucesso && CacheCompativel(leitura.Valor, intervalo)) cache = leitura.Valor;
                    else if (versao == geracao && leitura.Estado is not (EstadoOperacaoLocal.Sucesso or EstadoOperacaoLocal.Ausente))
                        CacheIndisponivel = true;
                }
                catch { if (versao == geracao) CacheIndisponivel = true; }
            }
            if (versao != geracao) return;
            var resposta = await ConsultarRemotaAsync(conta!, categoria!, intervalo, null);
            if (versao != geracao) return;
            if (!RespostaValida(resposta)) { Falha = "consultaInicial"; return; }

            PublicacaoMemoriasCategoria publicacao;
            if (cache is not null && cache.Revisao == resposta.Revisao)
                publicacao = new(conta!, jornada!, categoria!, intervalo, cache.Revisao,
                    cache.Itens, cache.TemMais, cache.ProximoCursor, true);
            else
                publicacao = new(conta!, jornada!, categoria!, intervalo, resposta.Revisao!,
                    resposta.Itens!, resposta.TemMais, resposta.ProximoCursor, false);

            if (!publicacao.RestauradaDoCache) await GravarSeAtualAsync(publicacao, versao);
            if (versao == geracao) Publicado = publicacao;
        }
        finally
        {
            if (versao == geracao)
            {
                intervaloPendente = null;
                Carregando = false;
                Notificar();
            }
        }
    }

    private Task<RespostaMemoriasCategoria> ConsultarRemotaAsync(
        PublicacaoMemoriasCategoria publicado, string cursor) =>
        ConsultarRemotaAsync(publicado.IdentidadeConta, publicado.IdentidadeCategoria, publicado.Intervalo, cursor);

    private async Task<RespostaMemoriasCategoria> ConsultarRemotaAsync(
        string identidadeConta, string identidadeCategoria, IntervaloJanelaTemporal intervalo, string? cursor)
    {
        try
        {
            return await remota.ConsultarMemoriasCategoriaAsync(new(identidadeConta,
                identidadeCategoria, intervalo.DataInicio, intervalo.DataFim, cursor));
        }
        catch { return new(EstadoConsultaMemoriasCategoria.Falha); }
    }

    private async Task GravarSeAtualAsync(PublicacaoMemoriasCategoria publicacao, long versao)
    {
        await escritaCache.WaitAsync();
        try
        {
            if (versao != geracao) return;
            var registro = new CacheConsultaMemoriasCategoriaLocal(publicacao.IdentidadeConta,
                publicacao.IdentidadeJornada, publicacao.IdentidadeCategoria,
                publicacao.Intervalo.DataInicio, publicacao.Intervalo.DataFim,
                publicacao.Revisao, publicacao.Itens, publicacao.TemMais, publicacao.ProximoCursor);
            var resultado = await cacheLocal.GravarConsultaMemoriasCategoriaAsync(registro);
            if (!resultado.Sucesso) CacheIndisponivel = true;
        }
        catch { CacheIndisponivel = true; }
        finally { escritaCache.Release(); }
    }

    private bool CacheCompativel(CacheConsultaMemoriasCategoriaLocal? cache,
        IntervaloJanelaTemporal intervalo) =>
        cache is not null && cache.IdentidadeConta == conta && cache.IdentidadeJornada == jornada
        && cache.IdentidadeCategoria == categoria && cache.DataInicio == intervalo.DataInicio
        && cache.DataFim == intervalo.DataFim && !string.IsNullOrWhiteSpace(cache.Revisao)
        && cache.Itens is not null && cache.TemMais == !string.IsNullOrWhiteSpace(cache.ProximoCursor)
        && cache.Itens.All(item => item.Data >= intervalo.DataInicio && item.Data <= intervalo.DataFim);

    private static bool RespostaValida(RespostaMemoriasCategoria resposta) =>
        resposta.Estado == EstadoConsultaMemoriasCategoria.Sucesso
        && !string.IsNullOrWhiteSpace(resposta.Revisao) && resposta.Itens is { Count: <= 30 }
        && resposta.TemMais == !string.IsNullOrWhiteSpace(resposta.ProximoCursor);

    private void Notificar() => Atualizado?.Invoke();
}
