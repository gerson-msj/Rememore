using Rememore.Client.Infraestrutura;
using Rememore.Client.Infraestrutura.Capturar;

namespace Rememore.Client.Tests;

public sealed class ContratoCapturarE1Tests
{
    [Fact]
    public async Task FakeEntregaDezMemoriasDistintasSemDadosDePreservacao()
    {
        var fake = new ComposicaoCapturaRemotaSimulada();
        var resposta = await fake.ObterCompletaAsync(EstadoAutenticacaoProvider.IdentidadeContaSimulada,
            ComposicaoCapturaRemotaSimulada.DataCenarioE1);

        Assert.Equal(EstadoComposicaoRemota.Presente, resposta.Estado);
        var memorias = resposta.Memorias!;
        Assert.Equal(10, memorias.Count);
        Assert.Equal(Enumerable.Range(0, 10), memorias.Select(memoria => memoria.Ordem));
        Assert.Equal(10, memorias.Select(memoria => memoria.Identidade).Distinct().Count());
        Assert.All(memorias, memoria =>
        {
            Assert.Null(memoria.PrimeiraPreservacaoUtc);
            Assert.False(memoria.TemporalidadeConhecida);
            Assert.Empty(memoria.Complementos!);
        });
    }

    [Fact]
    public async Task FakeNaoVazaCenarioEntreContasOuDatas()
    {
        var fake = new ComposicaoCapturaRemotaSimulada();
        var outraConta = await fake.ObterCompletaAsync("outra-conta", ComposicaoCapturaRemotaSimulada.DataCenarioE1);
        var outraData = await fake.ObterCompletaAsync(EstadoAutenticacaoProvider.IdentidadeContaSimulada,
            ComposicaoCapturaRemotaSimulada.DataCenarioE1.AddDays(1));

        Assert.Equal(EstadoComposicaoRemota.Ausente, outraConta.Estado);
        Assert.Equal(EstadoComposicaoRemota.Ausente, outraData.Estado);
    }
}
