using Microsoft.JSInterop;
using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.TrabalhoLocal;
using Rememore.Client.Infraestrutura.Rememorar;

namespace Rememore.Client.Infraestrutura.Capturar;

/// <summary>Autoridade remota simulada, durável no navegador e separada dos workspaces locais.</summary>
public sealed class AutoridadeCapturaFakePersistente(IJSRuntime js) : IAutoridadeCapturaFake,
    ICatalogoCategoriasRemoto, IProjecaoPanoramaRemota, IAsyncDisposable
{
    private Task<IJSObjectReference>? modulo;

    public async Task<VerificacaoComposicaoRemota> VerificarAsync(string identidadeConta, DateOnly data)
    {
        try { return await InvocarAsync<VerificacaoComposicaoRemota>("verificar", identidadeConta, data); }
        catch { return new(EstadoComposicaoRemota.Inconclusiva); }
    }

    public async Task<ComposicaoCapturaRemota> ObterCompletaAsync(string identidadeConta, DateOnly data)
    {
        try { return await InvocarAsync<ComposicaoCapturaRemota>("obterCompleta", identidadeConta, data); }
        catch { return new(EstadoComposicaoRemota.Inconclusiva); }
    }

    public async Task<ResultadoPreservacaoRemota> PreservarAsync(WorkspaceCapturaLocal captura)
    {
        try { return await InvocarAsync<ResultadoPreservacaoRemota>("preservar", captura); }
        catch { return new(EstadoComposicaoRemota.Falha); }
    }

    public async Task<RespostaCatalogoCategoriasRemoto> ConsultarAsync(string identidadeConta, string? revisaoConhecida)
    {
        try { return await InvocarAsync<RespostaCatalogoCategoriasRemoto>("consultarCatalogo", identidadeConta, revisaoConhecida); }
        catch { return new(EstadoConsultaCatalogoCategorias.Falha); }
    }

    public async Task<RespostaPanoramaRemota> ConsultarProjecaoAsync(string identidadeConta, string? revisaoConhecida)
    {
        try { return await InvocarAsync<RespostaPanoramaRemota>("consultarPanorama", identidadeConta, revisaoConhecida); }
        catch { return new(EstadoConsultaPanoramaRemota.Falha); }
    }

    private async Task<T> InvocarAsync<T>(string operacao, params object?[] argumentos)
    {
        modulo ??= js.InvokeAsync<IJSObjectReference>("import", "./js/autoridadeCapturaFake.js").AsTask();
        var referencia = await modulo;
        return await referencia.InvokeAsync<T>(operacao, argumentos);
    }

    public async ValueTask DisposeAsync()
    {
        if (modulo?.IsCompletedSuccessfully == true) await modulo.Result.DisposeAsync();
    }
}
