using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.OrientacaoProgressiva;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public sealed class ContratoCategoriasE2Tests
{
    [Fact]
    public async Task CatalogoFakeRetornaRevisaoInicialComTresCategoriasTipadas()
    {
        var fake = new CatalogoCategoriasRemotoSimulado();

        var resposta = await fake.ConsultarAsync("conta-teste", null);

        Assert.Equal(EstadoConsultaCatalogoCategorias.Inicial, resposta.Estado);
        Assert.Equal("3", resposta.Revisao);
        var categorias = resposta.Categorias!;
        Assert.Equal(3, categorias.Count);
        Assert.Equal(3, categorias.Select(categoria => categoria.Identidade).Distinct().Count());
        Assert.All(categorias, categoria => Assert.True(categoria.Ativa));
        Assert.All(categorias, categoria => Assert.Equal(1, categoria.Versao));
        Assert.Equal(new[] { "Família", "Trabalho", "Viagens" }, categorias.Select(categoria => categoria.Nome));
    }

    [Fact]
    public async Task CatalogoFakeRetornaSemMudancasParaRevisaoAtual()
    {
        var resposta = await new CatalogoCategoriasRemotoSimulado().ConsultarAsync("conta-teste", "3");

        Assert.Equal(EstadoConsultaCatalogoCategorias.SemMudancas, resposta.Estado);
        Assert.Equal("3", resposta.Revisao);
        Assert.Null(resposta.Categorias);
        Assert.Null(resposta.Alteracoes);
    }

    [Fact]
    public async Task CacheAplicaDeltaDeNomeAtivoEVersaoSemDescartarOutrosItens()
    {
        var fake = new CatalogoCategoriasRemotoSimulado();
        var inicial = await fake.ConsultarAsync("conta-teste", null);
        var cache = CatalogoCategoriasPorConta.Aplicar(null, "conta-teste", inicial)!;
        fake.Atualizar(new("categoria-trabalho", "Trabalho e projetos", 0, false));
        fake.Atualizar(new("categoria-nova", "Leitura", 0, true));
        fake.Atualizar(new("categoria-viagens", "Viagens", 0, false));
        fake.Atualizar(new("categoria-viagens", "Viagens", 0, true));
        var delta = await fake.ConsultarAsync("conta-teste", cache.Revisao);

        var atualizado = CatalogoCategoriasPorConta.Aplicar(cache, "conta-teste", delta)!;

        Assert.Equal("7", atualizado.Revisao);
        Assert.Equal(4, atualizado.Categorias.Count);
        Assert.Contains(atualizado.Categorias, item => item.Identidade == "categoria-familia" && item.Ativa);
        Assert.Contains(atualizado.Categorias, item => item.Identidade == "categoria-trabalho"
            && item.Nome == "Trabalho e projetos" && !item.Ativa && item.Versao == 4);
        Assert.Contains(atualizado.Categorias, item => item.Identidade == "categoria-nova" && item.Ativa && item.Versao == 5);
        Assert.Contains(atualizado.Categorias, item => item.Identidade == "categoria-viagens" && item.Ativa && item.Versao == 7);
        Assert.Contains(delta.Alteracoes!, item => item.Tipo == TipoAlteracaoCategoria.Criada);
        Assert.Contains(delta.Alteracoes!, item => item.Tipo == TipoAlteracaoCategoria.Inativada);
        Assert.Contains(delta.Alteracoes!, item => item.Tipo == TipoAlteracaoCategoria.Reativada);
    }

    [Fact]
    public async Task FalhaOuRespostaInconclusivaNaoSubstituiCacheExistente()
    {
        var fake = new CatalogoCategoriasRemotoSimulado();
        var inicial = await fake.ConsultarAsync("conta-teste", null);
        var cache = CatalogoCategoriasPorConta.Aplicar(null, "conta-teste", inicial)!;

        var falha = CatalogoCategoriasPorConta.Aplicar(cache, "conta-teste",
            new(EstadoConsultaCatalogoCategorias.Falha));
        var inconclusiva = CatalogoCategoriasPorConta.Aplicar(cache, "conta-teste",
            new(EstadoConsultaCatalogoCategorias.Inconclusivo));

        Assert.Null(falha);
        Assert.Null(inconclusiva);
        Assert.Equal(3, cache.Categorias.Count);
        Assert.Equal("3", cache.Revisao);
    }

    [Fact]
    public async Task ServicoConsultaDeltaEReaproveitaCacheQuandoRevisaoNaoMuda()
    {
        var fake = new CatalogoCategoriasRemotoSimulado();
        var cache = new CacheCatalogoEmMemoria();
        var servico = new CatalogoCategoriasPorConta(fake, cache);

        var inicial = await servico.AtualizarAsync("conta-teste");
        var semMudancas = await servico.AtualizarAsync("conta-teste");
        fake.Atualizar(new("categoria-familia", "Família e vínculos", 0, true));
        var delta = await servico.AtualizarAsync("conta-teste");

        Assert.True(inicial.Disponivel);
        Assert.Equal(3, inicial.Categorias.Count);
        Assert.True(semMudancas.Disponivel);
        Assert.Equal(2, cache.Gravacoes);
        Assert.Contains(delta.Categorias, item => item.Nome == "Família e vínculos" && item.Versao == 4);
        Assert.Equal(3, fake.Consultas);
        var mudancas = await fake.ConsultarAsync("conta-teste", "3");
        Assert.Contains(mudancas.Alteracoes!, item => item.Tipo == TipoAlteracaoCategoria.Renomeada);
        Assert.Equal("4", cache.Valor!.Revisao);
    }

    [Fact]
    public async Task FalhaDeTransporteMantemCategoriasConhecidasDoCache()
    {
        var cache = new CacheCatalogoEmMemoria();
        await cache.GravarAsync(new("conta-teste", "3", [new("categoria-familia", "Família", 1, true)]));
        var servico = new CatalogoCategoriasPorConta(new CatalogoComFalha(), cache);

        var resultado = await servico.AtualizarAsync("conta-teste");

        Assert.False(resultado.Disponivel);
        Assert.Single(resultado.Categorias);
        Assert.Equal("Família", resultado.Categorias[0].Nome);
        Assert.Equal("3", cache.Valor!.Revisao);
    }

    [Fact]
    public async Task CatalogoFakeNaoInventaContaAusente()
    {
        var resposta = await new CatalogoCategoriasRemotoSimulado().ConsultarAsync(" ", null);

        Assert.Equal(EstadoConsultaCatalogoCategorias.Inconclusivo, resposta.Estado);
        Assert.Null(resposta.Revisao);
    }

    [Fact]
    public async Task ContextoDeOrientacaoDeCategoriaResolveAsTresMensagensAprovadas()
    {
        var nivel = new FonteNivelOrientacaoSimulada();
        var resolvedor = new ResolvedorOrientacaoProgressiva(nivel, CatalogoOrientacoes.CriarPadrao());

        nivel.NivelAtual = NivelOrientacao.Iniciante;
        Assert.Equal("Escolha uma categoria que represente esta memória. Se ela ainda não existir, basta escrever o nome.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
        nivel.NivelAtual = NivelOrientacao.Intermediario;
        Assert.Equal("Escolha a categoria que melhor representa o contexto desta memória.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
        nivel.NivelAtual = NivelOrientacao.Avancado;
        Assert.Equal("Categorias consistentes tornam mais perceptíveis os temas que atravessam suas memórias.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
    }

    private sealed class CacheCatalogoEmMemoria : ICacheCatalogoCategoriasLocal
    {
        public CacheCatalogoCategoriasLocal? Valor { get; private set; }
        public int Gravacoes { get; private set; }
        public Task<ResultadoLocal<CacheCatalogoCategoriasLocal>> RecuperarAsync(string identidadeConta) =>
            Task.FromResult(Valor is null || Valor.IdentidadeConta != identidadeConta
                ? new ResultadoLocal<CacheCatalogoCategoriasLocal>(EstadoOperacaoLocal.Ausente)
                : new ResultadoLocal<CacheCatalogoCategoriasLocal>(EstadoOperacaoLocal.Sucesso, Valor));
        public Task<ResultadoLocal<bool>> GravarAsync(CacheCatalogoCategoriasLocal cache)
        {
            Valor = cache;
            Gravacoes++;
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
        }
    }

    private sealed class CatalogoComFalha : ICatalogoCategoriasRemoto
    {
        public Task<RespostaCatalogoCategoriasRemoto> ConsultarAsync(string identidadeConta, string? revisaoConhecida) =>
            throw new HttpRequestException("Falha técnica do teste.");
    }
}
