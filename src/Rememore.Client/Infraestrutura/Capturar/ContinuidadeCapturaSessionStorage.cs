using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura.Capturar;

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

    private async Task<IJSObjectReference> GarantirModuloAsync() =>
        modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/continuidadeCaptura.js");

    public async ValueTask DisposeAsync()
    {
        if (modulo is not null) await modulo.DisposeAsync();
    }
}
