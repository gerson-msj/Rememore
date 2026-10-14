using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoAutenticacaoProvider(IJSRuntime js, TimeProvider relogio) : AuthenticationStateProvider, IAsyncDisposable
{
    private const string ChaveSessao = "rememore.sessao.simulada.v2";
    private const string ChaveLegada = "rememore.sessao.simulada.v1";
    private const int VersaoAtual = 2;
    private static readonly TimeSpan DuracaoSessao = TimeSpan.FromDays(30);
    private static readonly TimeSpan IntervaloRenovacao = TimeSpan.FromDays(7);
    private static readonly ClaimsPrincipal Anonimo = new(new ClaimsIdentity());
    private static readonly JsonSerializerOptions OpcoesJson = new(JsonSerializerDefaults.Web);
    private ClaimsPrincipal usuario = Anonimo;
    private SessaoSimulada? sessao;
    private IJSObjectReference? modulo;

    public bool Inicializado { get; private set; }
    public bool Autenticado => usuario.Identity?.IsAuthenticated == true;

    public override Task<AuthenticationState> GetAuthenticationStateAsync() => Task.FromResult(new AuthenticationState(usuario));

    public async Task InicializarAsync()
    {
        if (Inicializado) return;

        try
        {
            await GarantirModuloAsync();
            var json = await modulo!.InvokeAsync<string?>("lerPersistente", ChaveSessao);
            if (json is not null)
            {
                SessaoSimulada? encontrada;
                try { encontrada = string.IsNullOrWhiteSpace(json) ? null : JsonSerializer.Deserialize<SessaoSimulada>(json, OpcoesJson); }
                catch (JsonException) { encontrada = null; }

                var agora = relogio.GetUtcNow();
                if (SessaoValida(encontrada, agora))
                {
                    sessao = encontrada;
                    usuario = CriarUsuario();
                    await VerificarSessaoAsync();
                }
                else await TentarRemoverSessaoInvalidaAsync();
            }

            await TentarRemoverLegadoAsync();
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            TornarAnonimo();
        }
        finally
        {
            Inicializado = true;
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }
    }

    public async Task VerificarSessaoAsync()
    {
        if (sessao is null) return;

        var agora = relogio.GetUtcNow();
        if (!SessaoValida(sessao, agora))
        {
            TornarAnonimo();
            await TentarRemoverSessaoInvalidaAsync();
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
            return;
        }

        if (agora - sessao.RenovadaEmUtc < IntervaloRenovacao) return;

        var renovada = sessao with { RenovadaEmUtc = agora, ExpiraEmUtc = agora.Add(DuracaoSessao) };
        try
        {
            await GarantirModuloAsync();
            await modulo!.InvokeVoidAsync("gravarPersistente", ChaveSessao, JsonSerializer.Serialize(renovada, OpcoesJson));
            sessao = renovada;
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException)
        {
            TornarAnonimo();
            NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
        }
    }

    public async Task EstabelecerSessaoAsync()
    {
        await GarantirModuloAsync();
        var agora = relogio.GetUtcNow();
        var nova = new SessaoSimulada(VersaoAtual, agora, agora, agora.Add(DuracaoSessao));
        await modulo!.InvokeVoidAsync("gravarPersistente", ChaveSessao, JsonSerializer.Serialize(nova, OpcoesJson));
        sessao = nova;
        usuario = CriarUsuario();
        await TentarRemoverLegadoAsync();
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public async Task EncerrarSessaoAsync()
    {
        await GarantirModuloAsync();
        await modulo!.InvokeVoidAsync("removerPersistente", ChaveSessao);
        await TentarRemoverLegadoAsync();
        TornarAnonimo();
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    private static bool SessaoValida(SessaoSimulada? registro, DateTimeOffset agora) => registro is not null
        && registro.Versao == VersaoAtual
        && registro.CriadaEmUtc.Offset == TimeSpan.Zero
        && registro.RenovadaEmUtc.Offset == TimeSpan.Zero
        && registro.ExpiraEmUtc.Offset == TimeSpan.Zero
        && registro.CriadaEmUtc <= registro.RenovadaEmUtc
        && registro.RenovadaEmUtc <= agora
        && registro.ExpiraEmUtc == registro.RenovadaEmUtc.Add(DuracaoSessao)
        && agora < registro.ExpiraEmUtc;

    private async Task TentarRemoverSessaoInvalidaAsync()
    {
        try
        {
            await GarantirModuloAsync();
            await modulo!.InvokeVoidAsync("removerPersistente", ChaveSessao);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private async Task TentarRemoverLegadoAsync()
    {
        try
        {
            await GarantirModuloAsync();
            await modulo!.InvokeVoidAsync("remover", ChaveLegada);
        }
        catch (Exception ex) when (ex is JSException or InvalidOperationException) { }
    }

    private void TornarAnonimo()
    {
        sessao = null;
        usuario = Anonimo;
    }

    private async Task GarantirModuloAsync()
    {
        if (modulo is null) modulo = await js.InvokeAsync<IJSObjectReference>("import", "./js/sessaoSimulada.js");
    }

    private static ClaimsPrincipal CriarUsuario() => new(new ClaimsIdentity(
        [new Claim(ClaimTypes.Name, "usuario")], "SessaoSimulada"));

    public async ValueTask DisposeAsync()
    {
        if (modulo is not null) await modulo.DisposeAsync();
    }

    private sealed record SessaoSimulada(int Versao, DateTimeOffset CriadaEmUtc, DateTimeOffset RenovadaEmUtc, DateTimeOffset ExpiraEmUtc);
}
