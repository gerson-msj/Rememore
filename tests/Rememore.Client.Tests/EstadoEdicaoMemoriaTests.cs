using Rememore.Client.Infraestrutura.Capturar;

namespace Rememore.Client.Tests;

public sealed class EstadoEdicaoMemoriaTests
{
    [Fact]
    public void CapturaJaAlteradaNaoTornaEdicaoSuja()
    {
        var estado = Resolver(autorizada: true, textoValido: true, capturaAlterada: true);
        Assert.True(estado.PermiteConfirmar);
        Assert.True(estado.PermiteExcluirMemoria);
        Assert.False(estado.ExigeConfirmacaoDeSaida);
        Assert.True(estado.CapturaAlterada);
    }

    [Fact]
    public void TextoSujoBloqueiaExclusaoEProtegeSaida()
    {
        var estado = Resolver(autorizada: true, textoValido: true, suja: true);
        Assert.True(estado.PermiteConfirmar);
        Assert.False(estado.PermiteExcluirMemoria);
        Assert.True(estado.ExigeConfirmacaoDeSaida);
    }

    [Fact]
    public void TextoVazioImpedeConfirmacaoMasMantemProtecaoDeSaida()
    {
        var estado = Resolver(autorizada: true, textoValido: false, suja: true);
        Assert.False(estado.PermiteConfirmar);
        Assert.False(estado.PermiteExcluirMemoria);
        Assert.True(estado.ExigeConfirmacaoDeSaida);
    }

    [Fact]
    public void HistoricaContinuaElegivelParaExcluirQuandoLimpaESemComplementos()
    {
        var estado = Resolver(autorizada: false, textoValido: true);
        Assert.False(estado.PermiteEditar);
        Assert.False(estado.PermiteConfirmar);
        Assert.True(estado.PermiteExcluirMemoria);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    public void ComplementosConfirmadosBloqueiamExclusaoDaPrincipal(int quantidade)
    {
        var estado = Resolver(autorizada: false, textoValido: true, complementos: quantidade);
        Assert.False(estado.PermiteExcluirMemoria);
    }

    [Fact]
    public void MetadadosDesconhecidosBloqueiamOperacoes()
    {
        var estado = Resolver(dadosValidos: false, autorizada: true, textoValido: true);
        Assert.False(estado.PermiteEditar);
        Assert.False(estado.PermiteConfirmar);
        Assert.False(estado.PermiteExcluirMemoria);
    }

    private static EstadoEdicaoMemoria Resolver(bool dadosValidos = true, bool autorizada = true,
        bool textoValido = true, bool suja = false, int complementos = 0, bool capturaAlterada = false) =>
        ResolutorEstadoEdicaoMemoria.Resolver(new(dadosValidos, autorizada, textoValido, suja,
            true, complementos, false, capturaAlterada));
}
