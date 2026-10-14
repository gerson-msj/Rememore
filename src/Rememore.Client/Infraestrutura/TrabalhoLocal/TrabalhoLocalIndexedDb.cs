using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura.TrabalhoLocal;

public sealed class TrabalhoLocalIndexedDb(IJSRuntime js) : IDiagnosticoTrabalhoLocal, ICapturasLocais, IAsyncDisposable
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

    private async Task<ResultadoLocal<T>> InvocarAsync<T>(string operacao, params object?[] argumentos)
    {
        try
        {
            modulo ??= js.InvokeAsync<IJSObjectReference>("import", "./js/trabalhoLocal.js").AsTask();
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
