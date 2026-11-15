using Rememore.Client.Componentes;

namespace Rememore.Client.Tests;

public sealed class ModeloJanelaTemporalTests
{
    [Theory]
    [InlineData(2)]
    [InlineData(3)]
    [InlineData(5)]
    [InlineData(30)]
    [InlineData(300)]
    [InlineData(1500)]
    public void IniciaSelecionandoTodoUniverso(int quantidadeDias)
    {
        var dias = CriarDias(quantidadeDias);

        var modelo = new ModeloJanelaTemporal(dias);

        Assert.Equal(0d, modelo.Estado.PosicaoInicio);
        Assert.Equal(1d, modelo.Estado.PosicaoFim);
        Assert.Equal(0, modelo.Estado.IndiceInicio);
        Assert.Equal(quantidadeDias - 1, modelo.Estado.IndiceFim);
        Assert.Equal(dias[0], modelo.Estado.IntervaloValidoAtual?.DataInicio);
        Assert.Equal(dias[^1], modelo.Estado.IntervaloValidoAtual?.DataFim);
        Assert.Equal(quantidadeDias, modelo.Estado.IntervaloValidoAtual?.QuantidadeDias);
        Assert.False(modelo.Estado.Invalida);
    }

    [Fact]
    public void ArredondaFronteirasDeEmpateParaOIndiceSuperior()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));

        var estado = modelo.AtualizarPosicoes(0.125d, 0.375d);

        Assert.Equal(1, estado.IndiceInicio);
        Assert.Equal(2, estado.IndiceFim);
        Assert.Equal(2, estado.IntervaloValidoAtual?.QuantidadeDias);
    }

    [Fact]
    public void DatasComLacunasContinuamOcupandoIndicesConsecutivos()
    {
        var dias = new[]
        {
            new DateOnly(2025, 1, 3),
            new DateOnly(2025, 1, 4),
            new DateOnly(2025, 1, 20),
            new DateOnly(2025, 2, 15),
            new DateOnly(2025, 6, 2)
        };
        var modelo = new ModeloJanelaTemporal(dias);

        var intervalo = modelo.AtualizarPosicoes(0.25d, 0.75d).IntervaloValidoAtual;

        Assert.Equal(new IntervaloJanelaTemporal(1, 3, dias[1], dias[3]), intervalo);
        Assert.Equal(3, intervalo?.QuantidadeDias);
    }

    [Fact]
    public void GeometriaInvalidaPreservaUltimoIntervaloERecuperaSemPublicarDuplicata()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        var posicoes = new List<EstadoJanelaTemporal>();
        var intervalos = new List<IntervaloJanelaTemporal>();
        modelo.PosicaoAlterada += posicoes.Add;
        modelo.IntervaloAlterado += intervalos.Add;

        var invalido = modelo.AtualizarPosicoes(0.1d, 0.12d);
        var recuperado = modelo.AtualizarPosicoes(0d, 1d);

        Assert.True(invalido.Invalida);
        Assert.Null(invalido.IntervaloValidoAtual);
        Assert.Equal(0, invalido.IndiceInicio);
        Assert.Equal(0, invalido.IndiceFim);
        Assert.Equal(5, invalido.UltimoIntervaloValido?.QuantidadeDias);
        Assert.False(recuperado.Invalida);
        Assert.Equal(5, recuperado.IntervaloValidoAtual?.QuantidadeDias);
        Assert.Equal(2, posicoes.Count);
        Assert.Empty(intervalos);
    }

    [Fact]
    public void IntervaloDeDoisDiasEAlcancavelComUniversoDeMilEQuinhentos()
    {
        var dias = CriarDias(1500);
        var modelo = new ModeloJanelaTemporal(dias);
        var indiceInicio = 731;

        var estado = modelo.AtualizarPosicoes((indiceInicio + 0.1d) / 1499d, (indiceInicio + 1.1d) / 1499d);

        Assert.Equal(indiceInicio, estado.IndiceInicio);
        Assert.Equal(indiceInicio + 1, estado.IndiceFim);
        Assert.Equal(2, estado.IntervaloValidoAtual?.QuantidadeDias);
        Assert.Equal(dias[indiceInicio], estado.IntervaloValidoAtual?.DataInicio);
        Assert.Equal(dias[indiceInicio + 1], estado.IntervaloValidoAtual?.DataFim);
    }

    [Fact]
    public void RestauraPosicoesInvalidasEUltimoIntervaloSemEmitirEventos()
    {
        var dias = CriarDias(5);
        var intervaloAnterior = new IntervaloJanelaTemporal(1, 4, dias[1], dias[4]);
        var restaurado = new EstadoJanelaTemporalRestaurado(0.1d, 0.12d, intervaloAnterior);
        var modelo = new ModeloJanelaTemporal(dias, restaurado);
        var posicaoEmitida = false;
        var intervaloEmitido = false;
        modelo.PosicaoAlterada += _ => posicaoEmitida = true;
        modelo.IntervaloAlterado += _ => intervaloEmitido = true;

        Assert.True(modelo.Estado.Invalida);
        Assert.Equal(intervaloAnterior, modelo.Estado.UltimoIntervaloValido);
        Assert.False(posicaoEmitida);
        Assert.False(intervaloEmitido);
    }

    [Fact]
    public void ConclusaoEEventoSeparadoECarregaSomenteIntervaloValidoAtual()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        var conclusoes = new List<ConclusaoOperacaoJanelaTemporal>();
        modelo.OperacaoConcluida += conclusoes.Add;

        modelo.AtualizarPosicoes(0.1d, 0.12d);
        var conclusaoInvalida = modelo.ConcluirOperacao();
        modelo.AtualizarPosicoes(0.5d, 1d);
        var conclusaoValida = modelo.ConcluirOperacao();

        Assert.True(conclusaoInvalida.Invalida);
        Assert.Null(conclusaoInvalida.IntervaloValido);
        Assert.NotNull(conclusaoInvalida.UltimoIntervaloValido);
        Assert.False(conclusaoValida.Invalida);
        Assert.Equal(modelo.Estado.IntervaloValidoAtual, conclusaoValida.IntervaloValido);
        Assert.Equal(2, conclusoes.Count);
    }

    [Fact]
    public void NaoEmiteEventosQuandoPosicoesENaoMudam()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        var posicaoEmitida = false;
        var intervaloEmitido = false;
        modelo.PosicaoAlterada += _ => posicaoEmitida = true;
        modelo.IntervaloAlterado += _ => intervaloEmitido = true;

        modelo.AtualizarPosicoes(0d, 1d);

        Assert.False(posicaoEmitida);
        Assert.False(intervaloEmitido);
    }

    [Fact]
    public void GeometriaPodeMudarSemAlterarOIntervaloFuncional()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        var posicoesEmitidas = 0;
        var intervalosEmitidos = 0;
        modelo.PosicaoAlterada += _ => posicoesEmitidas++;
        modelo.IntervaloAlterado += _ => intervalosEmitidos++;

        modelo.AtualizarPosicoes(0.01d, 0.99d);
        modelo.AtualizarPosicoes(0.02d, 0.98d);

        Assert.Equal(2, posicoesEmitidas);
        Assert.Equal(0, intervalosEmitidos);
        Assert.Equal(5, modelo.Estado.IntervaloValidoAtual?.QuantidadeDias);
    }

    [Fact]
    public void ArrasteDaAlcaInicialParaNasBordasInternasSemCruzar()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));

        var encostado = modelo.MoverInicio(0.9d, 0.2d);
        var tentativaDeCruzar = modelo.MoverInicio(1d, 0.2d);

        Assert.Equal(0.8d, encostado.PosicaoInicio, 10);
        Assert.Equal(1d, encostado.PosicaoFim);
        Assert.Equal(encostado, tentativaDeCruzar);
        Assert.True(tentativaDeCruzar.PosicaoInicio <= tentativaDeCruzar.PosicaoFim);
    }

    [Fact]
    public void ArrasteDaAlcaFinalRespeitaLimiteEColisaoPelaSeparacaoVisual()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        modelo.AtualizarPosicoes(0d, 0.5d);

        var encostado = modelo.MoverFim(0.1d, 0.2d);
        var tentativaDeCruzar = modelo.MoverFim(0d, 0.2d);
        var extremo = modelo.MoverFim(1d, 0.2d);

        Assert.Equal(0d, encostado.PosicaoInicio);
        Assert.Equal(0.2d, encostado.PosicaoFim, 10);
        Assert.Equal(encostado, tentativaDeCruzar);
        Assert.Equal(1d, extremo.PosicaoFim);
    }

    [Fact]
    public void ArrastarParaForaDaColisaoCorrigeGeometriaInvalida()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5), new EstadoJanelaTemporalRestaurado(0.5d, 0.5d, null));

        var estado = modelo.MoverFim(0.7d, 0.1d);

        Assert.False(estado.Invalida);
        Assert.Equal(2, estado.IntervaloValidoAtual?.QuantidadeDias);
        Assert.Equal(0.5d, estado.PosicaoInicio);
        Assert.Equal(0.7d, estado.PosicaoFim);
    }

    [Fact]
    public void SeparacaoFisicaNaoSeTransformaEmMinimoTemporalDeDias()
    {
        var universoPequeno = new ModeloJanelaTemporal(CriarDias(5));
        var universoGrande = new ModeloJanelaTemporal(CriarDias(1500));

        var estadoPequeno = universoPequeno.MoverFim(0.25d, 0.25d);
        var estadoGrande = universoGrande.MoverFim(0.25d, 0.25d);

        Assert.Equal(2, estadoPequeno.IntervaloValidoAtual?.QuantidadeDias);
        Assert.Equal(376, estadoGrande.IntervaloValidoAtual?.QuantidadeDias);
        Assert.Equal(0.25d, estadoPequeno.PosicaoFim);
        Assert.Equal(0.25d, estadoGrande.PosicaoFim);
    }

    [Fact]
    public void ArrasteDoConjuntoPreservaLarguraContinuaEConverteExtremosSeparadamente()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        modelo.AtualizarPosicoes(0.1d, 0.7d);

        var estado = modelo.MoverConjunto(0.25d, 0.85d);

        Assert.Equal(0.25d, estado.PosicaoInicio, 10);
        Assert.Equal(0.85d, estado.PosicaoFim, 10);
        Assert.Equal(0.6d, estado.PosicaoFim - estado.PosicaoInicio, 10);
        Assert.Equal(1, estado.IndiceInicio);
        Assert.Equal(3, estado.IndiceFim);
        Assert.Equal(3, estado.IntervaloValidoAtual?.QuantidadeDias);
    }

    [Fact]
    public void ArrasteDoConjuntoLimitaNosDoisExtremosSemInverterAlcas()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));
        modelo.AtualizarPosicoes(0.25d, 0.75d);

        var inicioDoTrilho = modelo.MoverConjunto(-0.25d, 0.25d);
        var fimDoTrilho = modelo.MoverConjunto(0.75d, 1.25d);

        Assert.Equal(0d, inicioDoTrilho.PosicaoInicio);
        Assert.Equal(0.5d, inicioDoTrilho.PosicaoFim, 10);
        Assert.Equal(0.5d, fimDoTrilho.PosicaoInicio, 10);
        Assert.Equal(1d, fimDoTrilho.PosicaoFim);
        Assert.True(fimDoTrilho.PosicaoInicio <= fimDoTrilho.PosicaoFim);
    }

    [Fact]
    public void ArrasteDoConjuntoPodeRecuperarSelecaoInvalidaSemAlterarLargura()
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5), new EstadoJanelaTemporalRestaurado(0.1d, 0.12d, null));
        Assert.True(modelo.Estado.Invalida);

        var estado = modelo.MoverConjunto(0.12d, 0.14d);

        Assert.False(estado.Invalida);
        Assert.Equal(0.02d, estado.PosicaoFim - estado.PosicaoInicio, 10);
        Assert.Equal(2, estado.IntervaloValidoAtual?.QuantidadeDias);
    }

    [Theory]
    [InlineData(double.NaN, 0d)]
    [InlineData(0d, double.PositiveInfinity)]
    [InlineData(0.75d, 0.25d)]
    [InlineData(-1d, 0.1d)]
    [InlineData(0d, 1.01d)]
    public void RejeitaExtremosInvalidosNoArrasteDoConjunto(double inicio, double fim)
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));

        Assert.ThrowsAny<ArgumentException>(() => modelo.MoverConjunto(inicio, fim));
        Assert.Equal(0d, modelo.Estado.PosicaoInicio);
        Assert.Equal(1d, modelo.Estado.PosicaoFim);
    }

    [Theory]
    [InlineData(double.NaN)]
    [InlineData(double.PositiveInfinity)]
    [InlineData(-0.01d)]
    [InlineData(1.01d)]
    public void RejeitaSeparacaoFisicaForaDoDominio(double separacao)
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));

        Assert.Throws<ArgumentOutOfRangeException>(() => modelo.MoverInicio(0.2d, separacao));
        Assert.Equal(0d, modelo.Estado.PosicaoInicio);
        Assert.Equal(1d, modelo.Estado.PosicaoFim);
    }

    [Theory]
    [MemberData(nameof(EntradasDeDiasInvalidas))]
    public void RejeitaColecoesSemSequenciaCronologicaValida(DateOnly[] dias)
    {
        Assert.Throws<ArgumentException>(() => new ModeloJanelaTemporal(dias));
    }

    public static IEnumerable<object[]> EntradasDeDiasInvalidas()
    {
        yield return new object[] { Array.Empty<DateOnly>() };
        yield return new object[] { new[] { new DateOnly(2025, 1, 1) } };
        yield return new object[] { new[] { new DateOnly(2025, 1, 2), new DateOnly(2025, 1, 1) } };
        yield return new object[] { new[] { new DateOnly(2025, 1, 1), new DateOnly(2025, 1, 1) } };
    }

    [Theory]
    [InlineData(double.NaN, 1d)]
    [InlineData(0d, double.PositiveInfinity)]
    [InlineData(-0.01d, 1d)]
    [InlineData(0d, 1.01d)]
    [InlineData(0.75d, 0.25d)]
    public void RejeitaPosicoesForaDoDominio(double inicio, double fim)
    {
        var modelo = new ModeloJanelaTemporal(CriarDias(5));

        Assert.ThrowsAny<ArgumentException>(() => modelo.AtualizarPosicoes(inicio, fim));
        Assert.Equal(0d, modelo.Estado.PosicaoInicio);
        Assert.Equal(1d, modelo.Estado.PosicaoFim);
    }

    private static DateOnly[] CriarDias(int quantidade) =>
        Enumerable.Range(0, quantidade)
            .Select(indice => new DateOnly(2025, 1, 1).AddDays(indice * 3))
            .ToArray();
}
