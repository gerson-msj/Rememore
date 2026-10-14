using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Rememore.Client;
using Rememore.Client.Infraestrutura;
using Microsoft.AspNetCore.Components.Authorization;

var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

var apiBaseUrl = builder.Configuration["ApiBaseUrl"]
    ?? throw new InvalidOperationException("A configuração 'ApiBaseUrl' não foi definida.");

builder.Services.AddScoped(_ => new HttpClient
{
    BaseAddress = new Uri(apiBaseUrl)
});
builder.Services.AddScoped<EstadoTema>();
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<IAutenticador, AutenticadorSimulado>();
builder.Services.AddScoped<ICadastroPorConvite, CadastroPorConviteSimulado>();
builder.Services.AddScoped<IRedefinicaoSenha, RedefinicaoSenhaSimulada>();
builder.Services.AddScoped<IContextoChavePendente, ContextoChavePendenteSessionStorage>();
builder.Services.AddScoped<ConfirmacaoChavePendente>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<EstadoAutenticacaoProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(servicos => servicos.GetRequiredService<EstadoAutenticacaoProvider>());

await builder.Build().RunAsync();
