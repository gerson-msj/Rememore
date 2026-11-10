using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.Rememorar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public sealed class ContratoProjecaoPanoramaE2Tests
{
    [Fact]
    public void CargaInicialGuardaCamposMinimosESeparaTomZeroDeNulo()
    {
        var resposta = new RespostaPanoramaRemota(EstadoConsultaPanoramaRemota.Inicial, "4", [
            Dia("2026-11-01", ("familia", 0), ("trabalho", null)),
            Dia("2026-11-03", ("familia", -20))
        ]);

        var cache = SincronizadorProjecaoPanorama.Aplicar(null, "conta-a", resposta)!;

        Assert.Equal("4", cache.Revisao);
        Assert.Equal(2, cache.Dias.Count);
        Assert.Equal(0, cache.Dias[0].Associacoes[0].Tom);
        Assert.Null(cache.Dias[0].Associacoes[1].Tom);
        Assert.Equal(new[] { "IdentidadeCategoria", "Tom" }, typeof(AssociacaoPanoramaRemota).GetProperties().Select(item => item.Name));
    }

    [Fact]
    public void DeltaSubstituiDiaInteiroEAplicaTombstoneERessurreicao()
    {
        var cache = Inicial("1", Dia("2026-11-01", ("familia", 5)));
        var incluido = SincronizadorProjecaoPanorama.Aplicar(cache, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "2", Alteracoes: [
                new(TipoAlteracaoDiaPanorama.Atualizado, "2026-11-02", Dia("2026-11-02", ("trabalho", null)))
            ]))!;
        Assert.Equal(2, incluido.Dias.Count);
        var alterado = SincronizadorProjecaoPanorama.Aplicar(incluido, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "3", Alteracoes: [
                new(TipoAlteracaoDiaPanorama.Atualizado, "2026-11-01", Dia("2026-11-01", ("familia", null), ("trabalho", 0)))
            ]))!;
        Assert.Equal(2, alterado.Dias[0].Associacoes.Count);
        Assert.Null(alterado.Dias[0].Associacoes[0].Tom);
        Assert.Equal(0, alterado.Dias[0].Associacoes[1].Tom);

        var removido = SincronizadorProjecaoPanorama.Aplicar(alterado, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "4", Alteracoes: [new(TipoAlteracaoDiaPanorama.Removido, "2026-11-01")]))!;
        Assert.Equal("2026-11-02", Assert.Single(removido.Dias).Data);
        var recriado = SincronizadorProjecaoPanorama.Aplicar(removido, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "5", Alteracoes: [
                new(TipoAlteracaoDiaPanorama.Atualizado, "2026-11-01", Dia("2026-11-01", ("viagens", 70)))
            ]))!;
        Assert.Equal("viagens", Assert.Single(recriado.Dias.Single(dia => dia.Data == "2026-11-01").Associacoes).IdentidadeCategoria);
    }

    [Fact]
    public void RevisaoInalteradaReutilizaCacheEReconstrucaoRefazSnapshot()
    {
        var cache = Inicial("2", Dia("2026-11-01", ("familia", 10)));
        Assert.Same(cache, SincronizadorProjecaoPanorama.Aplicar(cache, "conta-a",
            new(EstadoConsultaPanoramaRemota.SemMudancas, "2")));
        var reconstruido = SincronizadorProjecaoPanorama.Aplicar(cache, "conta-a",
            new(EstadoConsultaPanoramaRemota.Reconstrucao, "90", [Dia("2026-11-03", ("trabalho", 0))]));
        Assert.Equal("90", reconstruido!.Revisao);
        Assert.Equal("2026-11-03", Assert.Single(reconstruido.Dias).Data);
    }

    [Fact]
    public void RespostaDeOutraContaOuDeltaInvalidoNaoPodeAvancarCache()
    {
        var cache = Inicial("3", Dia("2026-11-01", ("familia", 10)));
        Assert.Null(SincronizadorProjecaoPanorama.Aplicar(cache, "conta-b",
            new(EstadoConsultaPanoramaRemota.Delta, "4", Alteracoes: [new(TipoAlteracaoDiaPanorama.Removido, "2026-11-01")] )));
        Assert.Null(SincronizadorProjecaoPanorama.Aplicar(cache, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "2", Alteracoes: [new(TipoAlteracaoDiaPanorama.Removido, "2026-11-01")] )));
        Assert.Null(SincronizadorProjecaoPanorama.Aplicar(cache, "conta-a",
            new(EstadoConsultaPanoramaRemota.Delta, "4", Alteracoes: [new(TipoAlteracaoDiaPanorama.Atualizado, "2026-11-02")] )));
        Assert.Equal("3", cache.Revisao);
        Assert.Single(cache.Dias);
    }

    [Fact]
    public async Task FalhaRemotaMantemCachesEFalhaDeGravacaoNaoPromoveRevisao()
    {
        var store = new CachePanoramaEmMemoria { Valor = new("conta-a", "7", [Dia("2026-11-01", ("familia", 0))]) };
        var remota = new AutoridadePanoramaEmMemoria(new(EstadoConsultaPanoramaRemota.Falha));
        var catalogoLocal = new CacheCatalogoEmMemoria();
        var catalogoRemoto = new CatalogoCategoriasRemotoSimulado();
        var sincronizador = new SincronizadorProjecaoPanorama(remota, store, new(catalogoRemoto, catalogoLocal));
        var resultado = await sincronizador.PrepararAsync("conta-a");
        Assert.True(resultado.Disponivel);
        Assert.True(resultado.UsouCache);
        Assert.Equal("7", store.Valor!.Revisao);

        store.FalharGravacao = true;
        remota.Resposta = new(EstadoConsultaPanoramaRemota.Delta, "8", Alteracoes: [
            new(TipoAlteracaoDiaPanorama.Atualizado, "2026-11-02", Dia("2026-11-02", ("trabalho", null)))
        ]);
        var falhaGravacao = await new SincronizadorProjecaoPanorama(remota, store,
            new(catalogoRemoto, catalogoLocal)).PrepararAsync("conta-a");
        Assert.False(falhaGravacao.Disponivel);
        Assert.Equal("7", store.Valor.Revisao);
        Assert.Single(store.Valor.Dias);

        var semCache = await new SincronizadorProjecaoPanorama(remota, new CachePanoramaEmMemoria(),
            new(catalogoRemoto, catalogoLocal)).PrepararAsync("conta-sem-cache");
        Assert.False(semCache.Disponivel);
        Assert.Empty(semCache.Dias);
    }

    [Fact]
    public async Task PrimeiraPreparacaoIsolaContaEAtualizaCatalogoCompartilhadoAposProjecao()
    {
        var store = new CachePanoramaEmMemoria();
        var remota = new AutoridadePanoramaEmMemoria(new(EstadoConsultaPanoramaRemota.Inicial, "1", [
            Dia("2026-11-01", ("categoria-familia", 0))
        ]));
        var catalogoLocal = new CacheCatalogoEmMemoria();
        var catalogoRemoto = new CatalogoCategoriasRemotoSimulado();
        catalogoRemoto.Atualizar(new("categoria-familia", "Família", 0, false));
        var resultado = await new SincronizadorProjecaoPanorama(remota, store,
            new(catalogoRemoto, catalogoLocal)).PrepararAsync("conta-a");

        Assert.True(resultado.Disponivel);
        Assert.Equal("conta-a", store.Valor!.IdentidadeConta);
        Assert.Equal("conta-a", catalogoLocal.Valor!.IdentidadeConta);
        Assert.Equal(1, catalogoRemoto.Consultas);
        Assert.Contains(resultado.Categorias, item => item.Identidade == "categoria-familia" && !item.Ativa);
        Assert.Equal(EstadoOperacaoLocal.Ausente, (await store.RecuperarProjecaoAsync("conta-b")).Estado);
    }

    private static CacheProjecaoPanoramaLocal Inicial(string revisao, params BlocoDiaPanoramaRemoto[] dias) =>
        SincronizadorProjecaoPanorama.Aplicar(null, "conta-a", new(EstadoConsultaPanoramaRemota.Inicial, revisao, dias))!;

    private static BlocoDiaPanoramaRemoto Dia(string data, params (string Categoria, int? Tom)[] associacoes) =>
        new(data, associacoes.Select(item => new AssociacaoPanoramaRemota(item.Categoria, item.Tom)).ToArray());

    private sealed class AutoridadePanoramaEmMemoria(RespostaPanoramaRemota resposta) : IProjecaoPanoramaRemota
    {
        public RespostaPanoramaRemota Resposta { get; set; } = resposta;
        public Task<RespostaPanoramaRemota> ConsultarProjecaoAsync(string identidadeConta, string? revisaoConhecida) => Task.FromResult(Resposta);
    }

    private sealed class CachePanoramaEmMemoria : ICacheProjecaoPanoramaLocal
    {
        public CacheProjecaoPanoramaLocal? Valor { get; set; }
        public bool FalharGravacao { get; set; }
        public Task<ResultadoLocal<CacheProjecaoPanoramaLocal>> RecuperarProjecaoAsync(string identidadeConta) =>
            Task.FromResult(Valor is null || Valor.IdentidadeConta != identidadeConta
                ? new ResultadoLocal<CacheProjecaoPanoramaLocal>(EstadoOperacaoLocal.Ausente)
                : new ResultadoLocal<CacheProjecaoPanoramaLocal>(EstadoOperacaoLocal.Sucesso, Valor));
        public Task<ResultadoLocal<bool>> GravarProjecaoAsync(CacheProjecaoPanoramaLocal cache)
        {
            if (FalharGravacao) return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Falha));
            Valor = cache;
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
        }
    }

    private sealed class CacheCatalogoEmMemoria : ICacheCatalogoCategoriasLocal
    {
        public CacheCatalogoCategoriasLocal? Valor { get; private set; }
        public Task<ResultadoLocal<CacheCatalogoCategoriasLocal>> RecuperarAsync(string identidadeConta) =>
            Task.FromResult(Valor is null || Valor.IdentidadeConta != identidadeConta
                ? new ResultadoLocal<CacheCatalogoCategoriasLocal>(EstadoOperacaoLocal.Ausente)
                : new ResultadoLocal<CacheCatalogoCategoriasLocal>(EstadoOperacaoLocal.Sucesso, Valor));
        public Task<ResultadoLocal<bool>> GravarAsync(CacheCatalogoCategoriasLocal cache)
        {
            Valor = cache;
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
        }
    }
}
