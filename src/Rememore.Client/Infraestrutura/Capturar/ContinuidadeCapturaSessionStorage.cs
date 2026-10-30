using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura.Capturar;

public sealed record RascunhoInclusaoCaptura(bool InclusaoAberta, string Texto);

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

    private async Task<IJSObjectReference> GarantirModuloAsync() =>
        modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/continuidadeCaptura.js");

    public async ValueTask DisposeAsync()
    {
        if (modulo is not null) await modulo.DisposeAsync();
    }
}
