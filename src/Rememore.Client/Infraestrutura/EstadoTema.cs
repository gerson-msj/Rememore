using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoTema(IJSRuntime js) : IAsyncDisposable
{
    private const string ChaveTema = "rememore.tema.v1";
    private const string ChaveTemaAntiga = "rememore.lab.tema.v1";
    private IJSObjectReference? modulo;
    private IJSObjectReference? observadorSistema;
    private DotNetObjectReference<EstadoTema>? referenciaJs;
    private object revisao = new();
    private bool inicializado;

    public event Action? Alterado;
    public object Revisao => revisao;
    public PreferenciaTema Preferencia { get; private set; } = PreferenciaTema.Sistema;
    public bool PreferenciaDoSistemaEscura { get; private set; }
    public string MensagemArmazenamento { get; private set; } = "";
    public bool AparenciaEscura => Preferencia == PreferenciaTema.Escuro || Preferencia == PreferenciaTema.Sistema && PreferenciaDoSistemaEscura;

    public async Task InicializarAsync()
    {
        if (inicializado) return;
        inicializado = true;

        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            var preferenciaSalva = await modulo.InvokeAsync<string?>("ler", ChaveTema);
            if (string.IsNullOrWhiteSpace(preferenciaSalva))
            {
                preferenciaSalva = await modulo.InvokeAsync<string?>("ler", ChaveTemaAntiga);
                if (Enum.TryParse<PreferenciaTema>(preferenciaSalva, true, out var antiga))
                {
                    Preferencia = antiga;
                    await modulo.InvokeVoidAsync("salvar", ChaveTema, antiga.ToString());
                }
            }
            else if (Enum.TryParse<PreferenciaTema>(preferenciaSalva, true, out var preferencia))
            {
                Preferencia = preferencia;
            }

            MensagemArmazenamento = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            MensagemArmazenamento = "O armazenamento local não está disponível. As alterações desta sessão não serão preservadas.";
        }

        await AplicarAtualAsync();
        await IniciarObservacaoSistemaAsync();
        NotificarAlteracao();
    }

    public async Task SelecionarAsync(PreferenciaTema preferencia)
    {
        Preferencia = preferencia;
        await PersistirAsync(ChaveTema, preferencia.ToString());
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    public async Task AtualizarPreferenciaSistemaAsync(bool escura)
    {
        PreferenciaDoSistemaEscura = escura;
        await AplicarAtualAsync();
        NotificarAlteracao();
    }

    [JSInvokable]
    public Task AoMudarPreferenciaSistema(bool escura) => AtualizarPreferenciaSistemaAsync(escura);

    private async Task IniciarObservacaoSistemaAsync()
    {
        if (observadorSistema is not null) return;
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            referenciaJs ??= DotNetObjectReference.Create(this);
            observadorSistema = await modulo.InvokeAsync<IJSObjectReference>("observarSistema", referenciaJs);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private async Task AplicarAtualAsync()
    {
        if (Preferencia == PreferenciaTema.Sistema && modulo is not null)
        {
            try { PreferenciaDoSistemaEscura = await modulo.InvokeAsync<bool>("sistemaEscuro"); }
            catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
        }
        await AplicarAsync(Preferencia switch { PreferenciaTema.Claro => "claro", PreferenciaTema.Escuro => "escuro", _ => "sistema" });
    }

    private async Task AplicarAsync(string aparencia)
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            await modulo.InvokeVoidAsync("aplicar", aparencia);
            PreferenciaDoSistemaEscura = await modulo.InvokeAsync<bool>("sistemaEscuro");
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private void NotificarAlteracao()
    {
        revisao = new object();
        Alterado?.Invoke();
    }

    private async Task PersistirAsync(string chave, string valor)
    {
        try
        {
            modulo ??= await js.InvokeAsync<IJSObjectReference>("import", "./js/laboratorio.js");
            await modulo.InvokeVoidAsync("salvar", chave, valor);
            MensagemArmazenamento = "";
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            MensagemArmazenamento = "O armazenamento local não está disponível. As alterações desta sessão não serão preservadas.";
        }
    }

    public async ValueTask DisposeAsync()
    {
        if (observadorSistema is not null && modulo is not null)
        {
            try { await modulo.InvokeVoidAsync("pararObservarSistema", observadorSistema); }
            catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
            await observadorSistema.DisposeAsync();
        }
        if (modulo is not null) await modulo.DisposeAsync();
        referenciaJs?.Dispose();
    }
}
