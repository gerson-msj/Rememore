using Microsoft.JSInterop;
using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Infraestrutura.TrabalhoLocal;

public sealed class TrabalhoLocalIndexedDb(IJSRuntime js) : IDiagnosticoTrabalhoLocal, ICapturasLocais,
    ICacheCatalogoCategoriasLocal, ICacheProjecaoPanoramaLocal, ICacheConsultaMemoriasCategoriaLocal, IAsyncDisposable
{
    private Task<IJSObjectReference>? modulo;
    private bool descartado;

    public Task<ResultadoLocal<bool>> DiagnosticarAsync() => InvocarAsync<bool>("diagnosticar");
    public Task<ResultadoLocal<bool>> GravarAsync(WorkspaceCapturaLocal captura) => InvocarAsync<bool>("gravar", captura);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> RecuperarAsync(string identidadeConta, DateOnly data) =>
        InvocarAsync<WorkspaceCapturaLocal>("recuperar", identidadeConta, data);
    public Task<ResultadoLocal<bool>> RemoverAsync(string identidadeConta, DateOnly data) =>
        InvocarAsync<bool>("remover", identidadeConta, data);
    public Task<ResultadoLocal<IReadOnlyList<WorkspaceCapturaLocal>>> ConsultarAsync(string identidadeConta) =>
        InvocarAsync<IReadOnlyList<WorkspaceCapturaLocal>>("consultar", identidadeConta);
    public Task<ResultadoLocal<bool>> GravarSeLimpoAsync(WorkspaceCapturaLocal captura) =>
        InvocarAsync<bool>("gravarSeLimpo", captura);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> MarcarAlteradoAsync(string identidadeConta, DateOnly data) =>
        InvocarAsync<WorkspaceCapturaLocal>("marcarAlterado", identidadeConta, data);
    public Task<ResultadoLocal<bool>> RemoverSeAlteradoAsync(string identidadeConta, DateOnly data) =>
        InvocarAsync<bool>("removerSeAlterado", identidadeConta, data);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarEdicaoMemoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string conteudoAnterior, string novoConteudo) =>
        InvocarAsync<WorkspaceCapturaLocal>("confirmarEdicaoMemoria", identidadeConta, data, identidadeMemoria, conteudoAnterior, novoConteudo);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ExcluirMemoriaSemComplementosAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string conteudoConfirmado) =>
        InvocarAsync<WorkspaceCapturaLocal>("excluirMemoriaSemComplementos", identidadeConta, data, identidadeMemoria, conteudoConfirmado);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarComplementoAsync(string identidadeConta, DateOnly data, string identidadeMemoria, int quantidadeEsperada, string? identidadeUltimoEsperada, string? identidadeComplemento, string? conteudoAnterior, string novoConteudo) =>
        InvocarAsync<WorkspaceCapturaLocal>("confirmarComplemento", identidadeConta, data, identidadeMemoria, quantidadeEsperada, identidadeUltimoEsperada, identidadeComplemento, conteudoAnterior, novoConteudo);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ExcluirUltimoComplementoAsync(string identidadeConta, DateOnly data, string identidadeMemoria, int quantidadeEsperada, string identidadeComplemento, string conteudoConfirmado) =>
        InvocarAsync<WorkspaceCapturaLocal>("excluirUltimoComplemento", identidadeConta, data, identidadeMemoria, quantidadeEsperada, identidadeComplemento, conteudoConfirmado);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarCategoriasAsync(string identidadeConta, DateOnly data,
        string identidadeMemoria, IReadOnlyList<CategoriaAssociadaLocal> categoriasEsperadas,
        IReadOnlyList<CategoriaAssociadaLocal> categoriasNovas) =>
        InvocarAsync<WorkspaceCapturaLocal>("confirmarCategorias", identidadeConta, data, identidadeMemoria,
            categoriasEsperadas, categoriasNovas);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarTomAsync(string identidadeConta, DateOnly data,
        string identidadeMemoria, int? tomEsperado, int? tomNovo) =>
        InvocarAsync<WorkspaceCapturaLocal>("confirmarTom", identidadeConta, data, identidadeMemoria, tomEsperado, tomNovo);
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> ConfirmarBalancoSentimentalAsync(string identidadeConta, DateOnly data,
        string identidadeMemoria, string? balancoEsperado, string? balancoNovo) =>
        InvocarAsync<WorkspaceCapturaLocal>("confirmarBalancoSentimental", identidadeConta, data, identidadeMemoria, balancoEsperado, balancoNovo);
    public Task<ResultadoLocal<CacheCatalogoCategoriasLocal>> RecuperarAsync(string identidadeConta) =>
        InvocarAsync<CacheCatalogoCategoriasLocal>("recuperarCacheCategorias", identidadeConta);
    public Task<ResultadoLocal<bool>> GravarAsync(CacheCatalogoCategoriasLocal cache) =>
        InvocarAsync<bool>("gravarCacheCategorias", cache);
    public Task<ResultadoLocal<CacheProjecaoPanoramaLocal>> RecuperarProjecaoAsync(string identidadeConta) =>
        InvocarAsync<CacheProjecaoPanoramaLocal>("recuperarProjecaoPanorama", identidadeConta);
    public Task<ResultadoLocal<bool>> GravarProjecaoAsync(CacheProjecaoPanoramaLocal cache) =>
        InvocarAsync<bool>("gravarProjecaoPanorama", cache);
    public Task<ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>> RecuperarConsultaMemoriasCategoriaAsync(string identidadeConta, string identidadeJornada) =>
        InvocarAsync<CacheConsultaMemoriasCategoriaLocal>("recuperarConsultaMemoriasCategoria", identidadeConta, identidadeJornada);
    public Task<ResultadoLocal<bool>> GravarConsultaMemoriasCategoriaAsync(CacheConsultaMemoriasCategoriaLocal cache) =>
        InvocarAsync<bool>("gravarConsultaMemoriasCategoria", cache);
    public Task<ResultadoLocal<bool>> RemoverConsultaMemoriasCategoriaAsync(string identidadeConta, string identidadeJornada) =>
        InvocarAsync<bool>("removerConsultaMemoriasCategoria", identidadeConta, identidadeJornada);

    private async Task<ResultadoLocal<T>> InvocarAsync<T>(string operacao, params object?[] argumentos)
    {
        try
        {
            modulo ??= js.InvokeAsync<IJSObjectReference>("import", "./js/trabalhoLocal.js?e4=1").AsTask();
            var referencia = await modulo;
            var resposta = await referencia.InvokeAsync<RespostaInterop<T>>(operacao, argumentos);
            var estado = resposta.Estado switch
            {
                "sucesso" => EstadoOperacaoLocal.Sucesso,
                "ausente" => EstadoOperacaoLocal.Ausente,
                "apiIndisponivel" => EstadoOperacaoLocal.ApiIndisponivel,
                _ => EstadoOperacaoLocal.Falha
            };
            return new(estado, resposta.Valor, resposta.Falha);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException or TaskCanceledException)
        {
            // Falha de importação pode ser transitória. A próxima operação tenta novamente.
            if (modulo?.IsCompletedSuccessfully != true) modulo = null;
            return new(EstadoOperacaoLocal.Falha, default, new("interop", ex.GetType().Name));
        }
    }

    public async ValueTask DisposeAsync()
    {
        // Os dois contratos de DI apontam à mesma instância scoped.
        if (descartado) return;
        descartado = true;
        if (modulo?.IsCompletedSuccessfully == true) await modulo.Result.DisposeAsync();
    }

    private sealed record RespostaInterop<T>(string Estado, T? Valor, FalhaTrabalhoLocal? Falha);
}
