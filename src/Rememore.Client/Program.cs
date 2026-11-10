using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
using Rememore.Client;
using Rememore.Client.Infraestrutura;
using Rememore.Client.Infraestrutura.Capturar;
using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.OrientacaoProgressiva;
using Rememore.Client.Infraestrutura.TrabalhoLocal;
using Rememore.Client.Infraestrutura.Rememorar;
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
builder.Services.AddScoped<EstadoPaletaLaboratorio>();
builder.Services.AddSingleton(CatalogoOrientacoes.CriarPadrao());
builder.Services.AddScoped<FonteNivelOrientacaoSimulada>();
builder.Services.AddScoped<IFonteNivelOrientacao>(servicos => servicos.GetRequiredService<FonteNivelOrientacaoSimulada>());
builder.Services.AddScoped<ResolvedorOrientacaoProgressiva>();
builder.Services.AddScoped<IOrientacaoProgressiva>(servicos => servicos.GetRequiredService<ResolvedorOrientacaoProgressiva>());
builder.Services.AddScoped<TrabalhoLocalIndexedDb>();
builder.Services.AddScoped<IDiagnosticoTrabalhoLocal>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddScoped<ICapturasLocais>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddScoped<ICacheCatalogoCategoriasLocal>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddScoped<ICacheProjecaoPanoramaLocal>(servicos => servicos.GetRequiredService<TrabalhoLocalIndexedDb>());
builder.Services.AddAuthorizationCore();
builder.Services.AddScoped<IAutenticador, AutenticadorSimulado>();
builder.Services.AddScoped<ICadastroPorConvite, CadastroPorConviteSimulado>();
builder.Services.AddScoped<IRedefinicaoSenha, RedefinicaoSenhaSimulada>();
builder.Services.AddScoped<IContextoChavePendente, ContextoChavePendenteSessionStorage>();
builder.Services.AddScoped<CapacidadesAmbienteSimuladas>();
builder.Services.AddScoped<ICapacidadesAmbiente>(servicos => servicos.GetRequiredService<CapacidadesAmbienteSimuladas>());
builder.Services.AddScoped<IPendenciaCapturaLocal, PendenciaCapturaLocalIndexedDb>();
builder.Services.AddScoped<AutoridadeCapturaFakePersistente>();
builder.Services.AddScoped<IAutoridadeCapturaFake>(servicos => servicos.GetRequiredService<AutoridadeCapturaFakePersistente>());
builder.Services.AddScoped<IComposicaoCapturaRemota>(servicos => servicos.GetRequiredService<AutoridadeCapturaFakePersistente>());
builder.Services.AddScoped<ICatalogoCategoriasRemoto>(servicos => servicos.GetRequiredService<AutoridadeCapturaFakePersistente>());
builder.Services.AddScoped<IProjecaoPanoramaRemota>(servicos => servicos.GetRequiredService<AutoridadeCapturaFakePersistente>());
builder.Services.AddScoped<CatalogoCategoriasPorConta>();
builder.Services.AddScoped<SincronizadorProjecaoPanorama>();
builder.Services.AddScoped<ConfiguracaoCapturarSimulada>();
builder.Services.AddScoped<IConfiguracaoCapturar>(servicos => servicos.GetRequiredService<ConfiguracaoCapturarSimulada>());
builder.Services.AddScoped<AberturaCaptura>();
builder.Services.AddScoped<ContinuidadeCapturaSessionStorage>();
builder.Services.AddScoped<ConfirmacaoChavePendente>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<EstadoAutenticacaoProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(servicos => servicos.GetRequiredService<EstadoAutenticacaoProvider>());

await builder.Build().RunAsync();
