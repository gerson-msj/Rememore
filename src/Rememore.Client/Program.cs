using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Rememore.Client;
using Rememore.Client.Infraestrutura;
using Rememore.Client.Infraestrutura.TrabalhoLocal;
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
builder.Services.AddScoped<TrabalhoLocalIndexedDb>();
builder.Services.AddScoped<IDiagnosticoTrabalhoLocal>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddScoped<ICapturasLocais>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<IAutenticador, AutenticadorSimulado>();
builder.Services.AddScoped<ICadastroPorConvite, CadastroPorConviteSimulado>();
builder.Services.AddScoped<IRedefinicaoSenha, RedefinicaoSenhaSimulada>();
builder.Services.AddScoped<IContextoChavePendente, ContextoChavePendenteSessionStorage>();
builder.Services.AddScoped<CapacidadesAmbienteSimuladas>();
builder.Services.AddScoped<ICapacidadesAmbiente>(servicos => servicos.GetRequiredService<CapacidadesAmbienteSimuladas>());
builder.Services.AddScoped<PendenciaCapturaLocalSimulada>();
builder.Services.AddScoped<IPendenciaCapturaLocal>(servicos => servicos.GetRequiredService<PendenciaCapturaLocalSimulada>());
builder.Services.AddScoped<ConfirmacaoChavePendente>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<EstadoAutenticacaoProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(servicos => servicos.GetRequiredService<EstadoAutenticacaoProvider>());

await builder.Build().RunAsync();
