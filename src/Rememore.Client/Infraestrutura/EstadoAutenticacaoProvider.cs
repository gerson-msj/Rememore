using System.Security.Claims;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.JSInterop;

namespace Rememore.Client.Infraestrutura;

public sealed class EstadoAutenticacaoProvider(IJSRuntime js) : AuthenticationStateProvider, IAsyncDisposable
{
    private const string ChaveSessao = "rememore.sessao.simulada.v1";
    private static readonly ClaimsPrincipal Anonimo = new(new ClaimsIdentity());
    private ClaimsPrincipal usuario = Anonimo;
    private IJSObjectReference? modulo;

    public bool Inicializado { get; private set; }
    public bool Autenticado => usuario.Identity?.IsAuthenticated == true;

    public override Task<AuthenticationState> GetAuthenticationStateAsync() => Task.FromResult(new AuthenticationState(usuario));

    public async Task InicializarAsync()
    {
        if (Inicializado) return;
        modulo = await js.InvokeAsync<IJSObjectReference>("import", "./js/sessaoSimulada.js");
        var marcador = await modulo.InvokeAsync<string?>("ler", ChaveSessao);
        usuario = marcador == "ativa" ? CriarUsuario() : Anonimo;
        Inicializado = true;
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public async Task EstabelecerSessaoAsync()
    {
        await GarantirModuloAsync();
        await modulo!.InvokeVoidAsync("gravar", ChaveSessao, "ativa");
        usuario = CriarUsuario();
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
    }

    public async Task EncerrarSessaoAsync()
    {
        await GarantirModuloAsync();
        await modulo!.InvokeVoidAsync("remover", ChaveSessao);
        usuario = Anonimo;
        NotifyAuthenticationStateChanged(GetAuthenticationStateAsync());
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
}
