using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura.Capturar;

public sealed record RascunhoInclusaoCaptura(bool InclusaoAberta, string Texto);
public sealed record RascunhoEdicaoMemoria(string Texto, bool AutorizacaoConcedida,
    string Tipo = "MemoriaPrincipal", string? IdentidadeComplemento = null);

public sealed class ContinuidadeCapturaSessionStorage(IJSRuntime js) : IAsyncDisposable
{
    private IJSObjectReference? modulo;

    public async Task<bool> EhRecargaAtivaAsync(string identidadeConta, DateOnly data)
    {
        try
        {
            return await (await GarantirModuloAsync()).InvokeAsync<bool>(
                "ehRecargaAtiva", identidadeConta, data.ToString("yyyy-MM-dd"));
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { return false; }
    }

    public async Task RegistrarAsync(string identidadeConta, DateOnly data)
    {
        try
        {
            await (await GarantirModuloAsync()).InvokeVoidAsync(
                "registrar", identidadeConta, data.ToString("yyyy-MM-dd"));
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task LimparAsync()
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("limpar"); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task RegistrarRascunhoAsync(string identidadeConta, DateOnly data, bool inclusaoAberta, string texto)
    {
        try
        {
            await (await GarantirModuloAsync()).InvokeVoidAsync(
                "registrarRascunho", identidadeConta, data.ToString("yyyy-MM-dd"), inclusaoAberta, texto);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task<RascunhoInclusaoCaptura?> RecuperarRascunhoAsync(string identidadeConta, DateOnly data)
    {
        try
        {
            return await (await GarantirModuloAsync()).InvokeAsync<RascunhoInclusaoCaptura?>(
                "recuperarRascunho", identidadeConta, data.ToString("yyyy-MM-dd"));
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { return null; }
    }

    public async Task LimparRascunhoAsync()
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("limparRascunho"); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task RegistrarEdicaoMemoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string texto, bool autorizacaoConcedida)
    {
        await RegistrarEdicaoAsync(identidadeConta, data, identidadeMemoria, "MemoriaPrincipal", null, texto, autorizacaoConcedida);
    }

    public async Task RegistrarEdicaoAsync(string identidadeConta, DateOnly data, string identidadeMemoria, string tipo,
        string? identidadeComplemento, string texto, bool autorizacaoConcedida)
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("registrarEdicaoMemoria", identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria, tipo, identidadeComplemento, texto, autorizacaoConcedida); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task<RascunhoEdicaoMemoria?> RecuperarEdicaoMemoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria)
    {
        try { return await (await GarantirModuloAsync()).InvokeAsync<RascunhoEdicaoMemoria?>("recuperarEdicaoMemoria", identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { return null; }
    }

    public async Task<RascunhoEdicaoMemoria?> RecuperarEdicaoAsync(string identidadeConta, DateOnly data, string identidadeMemoria)
    {
        try { return await (await GarantirModuloAsync()).InvokeAsync<RascunhoEdicaoMemoria?>("recuperarEdicaoMemoria", identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { return null; }
    }

    public async Task LimparEdicaoMemoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria)
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("limparEdicaoMemoria", identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task RegistrarAutorizacaoCategoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria)
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("registrarAutorizacaoCategoria",
            identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    public async Task<bool> RecuperarAutorizacaoCategoriaAsync(string identidadeConta, DateOnly data, string identidadeMemoria)
    {
        try { return await (await GarantirModuloAsync()).InvokeAsync<bool>("recuperarAutorizacaoCategoria",
            identidadeConta, data.ToString("yyyy-MM-dd"), identidadeMemoria); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { return false; }
    }

    public async Task LimparAutorizacaoCategoriaAsync()
    {
        try { await (await GarantirModuloAsync()).InvokeVoidAsync("limparAutorizacaoCategoria"); }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private async Task<IJSObjectReference> GarantirModuloAsync() =>
        modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/continuidadeCaptura.js");

    public async ValueTask DisposeAsync()
    {
        if (modulo is not null) await modulo.DisposeAsync();
    }
}
