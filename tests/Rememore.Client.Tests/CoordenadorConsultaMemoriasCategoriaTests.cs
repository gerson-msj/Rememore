using Rememore.Client.Componentes;
using Rememore.Client.Infraestrutura.Rememorar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public class CoordenadorConsultaMemoriasCategoriaTests
{
    private static readonly DateOnly Dia1 = new(2025, 1, 1);
    private static readonly DateOnly Dia2 = new(2025, 1, 2);
    private static readonly IntervaloJanelaTemporal Periodo1 = new(0, 0, Dia1, Dia1);
    private static readonly IntervaloJanelaTemporal Periodo2 = new(1, 1, Dia2, Dia2);

    [Fact]
    public async Task TrocaMantemRecorteAnteriorEAtrasadaNaoSubstituiAtual()
    {
        var remoto = new Remoto();
        var cache = new Cache();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, cache);
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        var primeira = coordenador.Publicado;

        var troca1 = coordenador.ConfirmarIntervaloAsync(Periodo2);
        Assert.Same(primeira, coordenador.Publicado);
        Assert.True(coordenador.Carregando);
        var troca2 = coordenador.ConfirmarIntervaloAsync(new(0, 1, Dia1, Dia2));
        remoto.Responder(2, Sucesso("2", Dia2));
        await troca2;
        remoto.Responder(1, Sucesso("1", Dia2));
        await troca1;

        Assert.Equal("2", coordenador.Publicado!.Revisao);
        Assert.Equal(new DateOnly(2025, 1, 2), coordenador.Publicado.Itens[0].Data);
        Assert.Equal(new DateOnly(2025, 1, 2), cache.Registros[("a", "j")].Itens[0].Data);
    }

    [Fact]
    public async Task FalhaPreservaRecorteENaoRepeteIntervaloIgualOuInvalido()
    {
        var remoto = new Remoto();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, new Cache());
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        var anterior = coordenador.Publicado;
        await coordenador.ConfirmarIntervaloAsync(null);
        await coordenador.ConfirmarIntervaloAsync(Periodo1);
        Assert.Single(remoto.Pedidos);

        var troca = coordenador.ConfirmarIntervaloAsync(Periodo2);
        remoto.Responder(1, new(EstadoConsultaMemoriasCategoria.Falha));
        await troca;
        Assert.Same(anterior, coordenador.Publicado);
        Assert.Equal("consultaInicial", coordenador.Falha);
    }

    [Fact]
    public async Task VoltarAoPeriodoPublicadoInvalidaConsultaPendente()
    {
        var remoto = new Remoto();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, new Cache());
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        var publicado = coordenador.Publicado;

        var troca = coordenador.ConfirmarIntervaloAsync(Periodo2);
        await coordenador.ConfirmarIntervaloAsync(Periodo1);
        remoto.Responder(1, Sucesso("2", Dia2));
        await troca;
        Assert.Same(publicado, coordenador.Publicado);
        Assert.False(coordenador.Carregando);
        Assert.Equal(2, remoto.Pedidos.Count);
    }

    [Fact]
    public async Task RestauracaoAguardaRevisaoEReconstroiQuandoMudou()
    {
        var cache = new Cache();
        cache.Registros[("a", "j")] = new("a", "j", "c", Dia1, Dia1, "1", [Item("cache", Dia1)], false, null);
        var remoto = new Remoto();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, cache);
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        Assert.Null(coordenador.Publicado);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        Assert.True(coordenador.Publicado!.RestauradaDoCache);
        Assert.Equal("cache", coordenador.Publicado.Itens[0].Identidade);

        var novaAbertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        Assert.Null(coordenador.Publicado);
        remoto.Responder(1, Sucesso("2", Dia1));
        await novaAbertura;
        Assert.False(coordenador.Publicado!.RestauradaDoCache);
        Assert.Equal("remota", coordenador.Publicado.Itens[0].Identidade);
    }

    [Fact]
    public async Task LoteDeduplicaEReiniciaQuandoCursorVence()
    {
        var remoto = new Remoto();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, new Cache());
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, new(EstadoConsultaMemoriasCategoria.Sucesso, "1", [Item("um", Dia1)], true, "p2"));
        await abertura;
        var lote = coordenador.CarregarMaisAsync();
        Assert.Equal("p2", remoto.Pedidos[1].Cursor);
        remoto.Responder(1, new(EstadoConsultaMemoriasCategoria.Sucesso, "1", [Item("um", Dia1), Item("dois", Dia1)], true, "p3"));
        await lote;
        Assert.Equal(["um", "dois"], coordenador.Publicado!.Itens.Select(item => item.Identidade));

        var vencido = coordenador.CarregarMaisAsync();
        remoto.Responder(2, new(EstadoConsultaMemoriasCategoria.ReinicioNecessario));
        Assert.Equal("p3", remoto.Pedidos[2].Cursor);
        await remoto.AguardarPedidosAsync(4);
        remoto.Responder(3, Sucesso("2", Dia1));
        await vencido;
        Assert.Null(remoto.Pedidos[3].Cursor);
        Assert.Single(coordenador.Publicado!.Itens);
        Assert.Equal("2", coordenador.Publicado.Revisao);
    }

    [Fact]
    public async Task EncerramentoRemoveSomenteJornadaAtual()
    {
        var remoto = new Remoto();
        var cache = new Cache();
        cache.Registros[("a", "outra")] = new("a", "outra", "c", Dia1, Dia1, "1", [], false, null);
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, cache);
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        await coordenador.EncerrarJornadaAsync();
        Assert.Null(coordenador.Publicado);
        Assert.False(cache.Registros.ContainsKey(("a", "j")));
        Assert.True(cache.Registros.ContainsKey(("a", "outra")));
    }

    [Fact]
    public async Task MudancaDeJornadaDescartaRespostaPendente()
    {
        var remoto = new Remoto();
        var cache = new Cache();
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, cache);
        var primeira = coordenador.AbrirAsync("a", "antiga", "c", Periodo1);
        var segunda = coordenador.AbrirAsync("a", "nova", "c", Periodo2);
        remoto.Responder(1, Sucesso("2", Dia2));
        await segunda;
        remoto.Responder(0, Sucesso("1", Dia1));
        await primeira;
        Assert.Equal("nova", coordenador.Publicado!.IdentidadeJornada);
        Assert.False(cache.Registros.ContainsKey(("a", "antiga")));
        Assert.True(cache.Registros.ContainsKey(("a", "nova")));
    }

    [Fact]
    public async Task CacheIndisponivelNaoImpedeRespostaRemota()
    {
        var remoto = new Remoto();
        var cache = new Cache { Falhar = true };
        var coordenador = new CoordenadorConsultaMemoriasCategoria(remoto, cache);
        var abertura = coordenador.AbrirAsync("a", "j", "c", Periodo1);
        remoto.Responder(0, Sucesso("1", Dia1));
        await abertura;
        Assert.NotNull(coordenador.Publicado);
        Assert.True(coordenador.CacheIndisponivel);
    }

    private static MemoriaCategoriaRemota Item(string id, DateOnly data) => new(id, data, 0, id, 0);
    private static RespostaMemoriasCategoria Sucesso(string revisao, DateOnly data) =>
        new(EstadoConsultaMemoriasCategoria.Sucesso, revisao, [Item("remota", data)]);

    private sealed class Remoto : IConsultaMemoriasCategoriaRemota
    {
        public List<PedidoMemoriasCategoria> Pedidos { get; } = [];
        private readonly List<TaskCompletionSource<RespostaMemoriasCategoria>> respostas = [];
        public Task<RespostaMemoriasCategoria> ConsultarMemoriasCategoriaAsync(PedidoMemoriasCategoria pedido)
        {
            Pedidos.Add(pedido);
            var fonte = new TaskCompletionSource<RespostaMemoriasCategoria>(TaskCreationOptions.RunContinuationsAsynchronously);
            respostas.Add(fonte);
            return fonte.Task;
        }
        public void Responder(int indice, RespostaMemoriasCategoria resposta) => respostas[indice].SetResult(resposta);
        public async Task AguardarPedidosAsync(int quantidade)
        {
            for (var tentativa = 0; Pedidos.Count < quantidade && tentativa < 1000; tentativa++)
                await Task.Yield();
            Assert.True(Pedidos.Count >= quantidade);
        }
    }

    private sealed class Cache : ICacheConsultaMemoriasCategoriaLocal
    {
        public bool Falhar { get; init; }
        public Dictionary<(string Conta, string Jornada), CacheConsultaMemoriasCategoriaLocal> Registros { get; } = [];
        public Task<ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>> RecuperarConsultaMemoriasCategoriaAsync(string conta, string jornada) =>
            Task.FromResult(Falhar
                ? new ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>(EstadoOperacaoLocal.Falha)
                : Registros.TryGetValue((conta, jornada), out var registro)
                ? new ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>(EstadoOperacaoLocal.Sucesso, registro)
                : new ResultadoLocal<CacheConsultaMemoriasCategoriaLocal>(EstadoOperacaoLocal.Ausente));
        public Task<ResultadoLocal<bool>> GravarConsultaMemoriasCategoriaAsync(CacheConsultaMemoriasCategoriaLocal registro)
        {
            if (Falhar) return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Falha));
            Registros[(registro.IdentidadeConta, registro.IdentidadeJornada)] = registro;
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
        }
        public Task<ResultadoLocal<bool>> RemoverConsultaMemoriasCategoriaAsync(string conta, string jornada)
        {
            Registros.Remove((conta, jornada));
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
        }
    }
}
