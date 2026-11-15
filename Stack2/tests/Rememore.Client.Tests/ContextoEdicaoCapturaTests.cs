using Rememore.Client.Infraestrutura.Capturar;

namespace Rememore.Client.Tests;

public class ContextoEdicaoCapturaTests
{
    [Theory]
    [InlineData("memorar", AbaOrigemEdicaoCaptura.Memorar)]
    [InlineData("CATEGORIZAR", AbaOrigemEdicaoCaptura.Categorizar)]
    [InlineData("revisar", AbaOrigemEdicaoCaptura.Revisar)]
    public void InterpretaOrigemDaRota(string origem, AbaOrigemEdicaoCaptura esperada) =>
        Assert.Equal(esperada, ContextoEdicaoCaptura.InterpretarOrigem(origem, AbaOrigemEdicaoCaptura.Memorar));

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("desconhecida")]
    public void UsaOrigemPadraoParaValorAusenteOuInvalido(string? origem) =>
        Assert.Equal(AbaOrigemEdicaoCaptura.Categorizar,
            ContextoEdicaoCaptura.InterpretarOrigem(origem, AbaOrigemEdicaoCaptura.Categorizar));

    [Fact]
    public void RotasDeEdicaoPreservamOrigemIdentidadeEAtencao()
    {
        Assert.Equal("editar-memoria/2026-11-06/id%2Fmemoria?origem=revisar&atencao=true",
            ContextoEdicaoCaptura.RotaEdicaoMemoria("2026-11-06", "id/memoria", AbaOrigemEdicaoCaptura.Revisar, true));
        Assert.Equal("categorizar/2026-11-06/id%2Fmemoria?origem=categorizar",
            ContextoEdicaoCaptura.RotaCategorizacao("2026-11-06", "id/memoria", AbaOrigemEdicaoCaptura.Categorizar));
    }

    [Fact]
    public void RotaDeRetornoPreservaAbaEReferenciaDaMemoria()
    {
        Assert.Equal("capturar/2026-11-06?aba=revisar&memoria=id%2Fmemoria&atencao=true",
            ContextoEdicaoCaptura.RotaRetorno("2026-11-06", AbaOrigemEdicaoCaptura.Revisar, "id/memoria", true));
    }
}
