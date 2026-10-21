using Rememore.Client.Componentes.Lab;

namespace Rememore.Client.Tests;

public sealed class MovimentacaoListaDemonstrativaTests
{
    [Theory]
    [InlineData(1, -1, "B,A,C,D")]
    [InlineData(1, 1, "A,C,B,D")]
    public void MoveExatamenteUmaPosicao(int indice, int deslocamento, string esperado)
    {
        var itens = new List<string> { "A", "B", "C", "D" };

        var moveu = MovimentacaoListaDemonstrativa.MoverUmaPosicao(itens, indice, deslocamento);

        Assert.True(moveu);
        Assert.Equal(esperado.Split(','), itens);
    }

    [Theory]
    [InlineData(0, -1)]
    [InlineData(3, 1)]
    [InlineData(-1, 1)]
    [InlineData(4, -1)]
    [InlineData(1, 0)]
    [InlineData(1, 2)]
    public void LimitesEPassosInvalidosNaoAlteramALista(int indice, int deslocamento)
    {
        var itens = new List<string> { "A", "B", "C", "D" };

        var moveu = MovimentacaoListaDemonstrativa.MoverUmaPosicao(itens, indice, deslocamento);

        Assert.False(moveu);
        Assert.Equal(["A", "B", "C", "D"], itens);
    }

    [Fact]
    public void ListaUnicaBloqueiaAmbasAsDirecoes()
    {
        var itens = new List<string> { "A" };

        Assert.False(MovimentacaoListaDemonstrativa.MoverUmaPosicao(itens, 0, -1));
        Assert.False(MovimentacaoListaDemonstrativa.MoverUmaPosicao(itens, 0, 1));
        Assert.Equal(["A"], itens);
    }
}
