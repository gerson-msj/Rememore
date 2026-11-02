using Rememore.Client.Infraestrutura.Capturar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Tests;

public sealed class ContratoCapturarE3Tests
{
    [Fact]
    public async Task FakePreservaMetadadosTipadosDeMemoriaEComplemento()
    {
        var conta = "conta-teste";
        var data = new DateOnly(2026, 10, 31);
        var marco = new DateTimeOffset(2026, 10, 30, 12, 0, 0, TimeSpan.Zero);
        var memoria = new MemoriaCapturaLocal("m1", "principal", 0, marco, true,
            [new ComplementoCapturaLocal("c1", "complemento", 0, marco, true)]);
        var fake = new ComposicaoCapturaRemotaSimulada();
        fake.Definir(conta, data, new(EstadoComposicaoRemota.Presente, "rev-1", [memoria]));

        var verificacao = await fake.VerificarAsync(conta, data);
        var completa = await fake.ObterCompletaAsync(conta, data);

        Assert.Equal(EstadoComposicaoRemota.Presente, verificacao.Estado);
        Assert.Equal("rev-1", verificacao.Revisao);
        Assert.Equal(marco, completa.Memorias![0].PrimeiraPreservacaoUtc);
        Assert.Equal("c1", completa.Memorias[0].Complementos![0].Identidade);
        Assert.Equal(1, fake.Verificacoes);
        Assert.Equal(1, fake.LeiturasCompletas);
    }

    [Fact]
    public async Task ConfiguracaoFakeOferecePrazoAprovadoEPermiteCenarioInvalido()
    {
        var fake = new ConfiguracaoCapturarSimulada();
        Assert.Equal(new ConfiguracaoCapturar(3), await fake.ObterAsync());
        fake.Atual = new(0);
        Assert.Equal(new ConfiguracaoCapturar(0), await fake.ObterAsync());
    }

    [Fact]
    public void AutorizacaoHistoricaUsaPreservacaoOriginalEConcessaoDaSessao()
    {
        var primeiraPreservacao = new DateTimeOffset(2026, 10, 1, 12, 0, 0, TimeSpan.Zero);
        var memoria = new MemoriaCapturaLocal("m1", "memória", 0, primeiraPreservacao, true,
            [new ComplementoCapturaLocal("c1", "complemento recente", 0, primeiraPreservacao.AddDays(10), true)]);
        var configuracao = new ConfiguracaoCapturar(3);
        var aposPrazo = primeiraPreservacao.AddDays(3);

        var expirada = RegraEdicaoMemoria.Resolver(memoria, configuracao, aposPrazo);
        var restaurada = RegraEdicaoMemoria.Resolver(memoria, configuracao, aposPrazo, autorizacaoDaSessao: true);

        Assert.False(expirada.Concedida);
        Assert.True(restaurada.Concedida);
        Assert.True(RegraEdicaoMemoria.Resolver(memoria, configuracao, aposPrazo.AddTicks(-1)).Concedida);
    }
}
