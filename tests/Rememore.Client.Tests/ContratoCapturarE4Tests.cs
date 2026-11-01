using Rememore.Client.Infraestrutura;
using Rememore.Client.Infraestrutura.Capturar;

namespace Rememore.Client.Tests;

public sealed class ContratoCapturarE4Tests
{
    [Fact]
    public async Task FakeEntregaDuasMemoriasComHistoricosIndependentes()
    {
        var fake = new ComposicaoCapturaRemotaSimulada();
        var resposta = await fake.ObterCompletaAsync(EstadoAutenticacaoProvider.IdentidadeContaSimulada,
            ComposicaoCapturaRemotaSimulada.DataCenarioE4);

        Assert.Equal(EstadoComposicaoRemota.Presente, resposta.Estado);
        Assert.Equal(2, resposta.Memorias!.Count);
        Assert.Empty(resposta.Memorias[0].Complementos!);
        var complemento = Assert.Single(resposta.Memorias[1].Complementos!);
        Assert.Equal(0, complemento.Ordem);
        Assert.Equal(new DateTimeOffset(2026, 10, 27, 12, 0, 0, TimeSpan.Zero), complemento.PrimeiraPreservacaoUtc);
        Assert.True(complemento.TemporalidadeConhecida);
    }

    [Fact]
    public async Task FakeNaoVazaCenarioEntreContasOuDatas()
    {
        var fake = new ComposicaoCapturaRemotaSimulada();
        var outraConta = await fake.ObterCompletaAsync("outra-conta", ComposicaoCapturaRemotaSimulada.DataCenarioE4);
        var outraData = await fake.ObterCompletaAsync(EstadoAutenticacaoProvider.IdentidadeContaSimulada,
            ComposicaoCapturaRemotaSimulada.DataCenarioE4.AddDays(1));

        Assert.Equal(EstadoComposicaoRemota.Ausente, outraConta.Estado);
        Assert.Equal(EstadoComposicaoRemota.Ausente, outraData.Estado);
    }
}
