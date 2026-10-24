using Rememore.Client.Componentes.Lab;
using Rememore.Client.Componentes;

namespace Rememore.Client.Tests;

public sealed class CalculosPanoramaDemonstrativoTests
{
    [Fact]
    public void MassaUsaIdentificadoresEstaveisEContaOcorrenciaMulticategoriaEmCadaCategoria()
    {
        var resultado = CalcularMassaCompleta();
        var ocorrenciaCompartilhada = MassaPanoramaDemonstrativa.Ocorrencias
            .Single(ocorrencia => ocorrencia.Identificador == "memoria-001");

        Assert.Equal(13, MassaPanoramaDemonstrativa.Ocorrencias.Count);
        Assert.Equal(2, ocorrenciaCompartilhada.Categorias.Count);
        Assert.Equal(16, resultado.Categorias.Count);
        Assert.Equal(3, Categoria(resultado, "categoria-rotina").QuantidadeAssociacoes);
        Assert.Equal(4, Categoria(resultado, "categoria-projetos").QuantidadeAssociacoes);
        Assert.Equal(51, resultado.QuantidadeAssociacoes);
    }

    [Fact]
    public void RepresentatividadeUsaRaizDaProporcaoEmRelacaoAoMaiorQ()
    {
        var resultado = CalcularMassaCompleta();

        Assert.Equal(5, resultado.QuantidadeMaximaAssociacoes);
        Assert.Equal(Math.Sqrt(4d / 5d), Categoria(resultado, "categoria-projetos").Representatividade, 12);
        Assert.Equal(Math.Sqrt(3d / 5d), Categoria(resultado, "categoria-rotina").Representatividade, 12);
        Assert.Equal(Math.Sqrt(2d / 5d), Categoria(resultado, "categoria-equilibrio").Representatividade, 12);
    }

    [Fact]
    public void NulosContamEmQMasNaoNaMediaETomZeroContinuaDefinido()
    {
        var resultado = CalcularMassaCompleta();
        var categoriaRotina = Categoria(resultado, "categoria-rotina");
        var categoriaSemTom = Categoria(resultado, "categoria-sem-tom");
        var categoriaEquilibrio = Categoria(resultado, "categoria-equilibrio");

        Assert.Equal(3, categoriaRotina.QuantidadeAssociacoes);
        Assert.Equal(2, categoriaRotina.QuantidadeTonsDefinidos);
        Assert.Equal(20d, categoriaRotina.TomMedio!.Value);
        Assert.Equal(2, categoriaSemTom.QuantidadeAssociacoes);
        Assert.Equal(0, categoriaSemTom.QuantidadeTonsDefinidos);
        Assert.Null(categoriaSemTom.TomMedio);
        Assert.Equal(0d, categoriaEquilibrio.TomMedio!.Value);
        Assert.Equal(2, categoriaEquilibrio.QuantidadeTonsDefinidos);
    }

    [Fact]
    public void MediaDeTrintaMenosDezZeroEUmNuloPreservaFracaoEContaQuatroAssociacoes()
    {
        var categoria = Categoria(CalcularMassaCompleta(), "categoria-projetos");

        Assert.Equal(4, categoria.QuantidadeAssociacoes);
        Assert.Equal(3, categoria.QuantidadeTonsDefinidos);
        Assert.Equal(20d / 3d, categoria.TomMedio!.Value, 12);
    }

    [Fact]
    public void DistribuicoesDiferentesComAMesmaMediaProduzemMesmoTomFuncional()
    {
        var datas = new[] { new DateOnly(2025, 2, 1), new DateOnly(2025, 2, 2) };
        var ocorrencias = new[]
        {
            new OcorrenciaPanoramaDemonstrativa("amostra-a-1", datas[0],
                [new AssociacaoPanoramaDemonstrativa("categoria-a", "Distribuição A", 100)]),
            new OcorrenciaPanoramaDemonstrativa("amostra-a-2", datas[1],
                [new AssociacaoPanoramaDemonstrativa("categoria-a", "Distribuição A", -60)]),
            new OcorrenciaPanoramaDemonstrativa("amostra-b-1", datas[0],
                [new AssociacaoPanoramaDemonstrativa("categoria-b", "Distribuição B", 30)]),
            new OcorrenciaPanoramaDemonstrativa("amostra-b-2", datas[1],
                [new AssociacaoPanoramaDemonstrativa("categoria-b", "Distribuição B", 10)])
        };

        var resultado = CalculosPanoramaDemonstrativo.Calcular(datas, ocorrencias);
        var distribuicaoA = Categoria(resultado, "categoria-a");
        var distribuicaoB = Categoria(resultado, "categoria-b");

        Assert.Equal(20d, distribuicaoA.TomMedio);
        Assert.Equal(20d, distribuicaoB.TomMedio);
        Assert.Equal(2, distribuicaoA.QuantidadeAssociacoes);
        Assert.Equal(2, distribuicaoB.QuantidadeAssociacoes);
        Assert.Equal(1d, distribuicaoA.Representatividade);
        Assert.Equal(1d, distribuicaoB.Representatividade);
    }

    [Fact]
    public void MediaPonderadaReg219UsaSomenteQuantidadeDeTonsDefinidos()
    {
        var resultado = CalcularMassaCompleta();

        Assert.Equal(270d / 47d, resultado.TomMedioPonderado!.Value, 12);
        Assert.Null(CalculosPanoramaDemonstrativo.CalcularTomMedioPonderado(Array.Empty<ResumoCategoriaPanoramaDemonstrativo>()));
    }

    [Fact]
    public void IntervaloSemDatasRetornaResultadoVazioSemDividirPorZero()
    {
        var resultado = CalculosPanoramaDemonstrativo.Calcular(
            Array.Empty<DateOnly>(),
            MassaPanoramaDemonstrativa.Ocorrencias);

        Assert.Equal(0, resultado.QuantidadeDatasConsideradas);
        Assert.Empty(resultado.Categorias);
        Assert.Equal(0, resultado.QuantidadeMaximaAssociacoes);
        Assert.Null(resultado.TomMedioPonderado);
    }

    [Fact]
    public void DataSemOcorrenciasTambemProduzConjuntoVazio()
    {
        var resultado = CalculosPanoramaDemonstrativo.Calcular(
            new[] { new DateOnly(2025, 1, 27) },
            MassaPanoramaDemonstrativa.Ocorrencias);

        Assert.Equal(1, resultado.QuantidadeDatasConsideradas);
        Assert.Equal(0, resultado.QuantidadeOcorrencias);
        Assert.Empty(resultado.Categorias);
        Assert.Equal(0, resultado.QuantidadeMaximaAssociacoes);
    }

    [Fact]
    public void MassaCompletaConservaDatasEContagensDeterministicas()
    {
        var primeiraExecucao = CalcularMassaCompleta();
        var segundaExecucao = CalcularMassaCompleta();

        Assert.Equal(MassaPanoramaDemonstrativa.Datas, MassaPanoramaDemonstrativa.Datas.Distinct().ToArray());
        Assert.Equal(primeiraExecucao.QuantidadeOcorrencias, segundaExecucao.QuantidadeOcorrencias);
        Assert.Equal(primeiraExecucao.QuantidadeAssociacoes, segundaExecucao.QuantidadeAssociacoes);
        Assert.Equal(
            primeiraExecucao.Categorias.Select(categoria => categoria.IdentificadorCategoria),
            segundaExecucao.Categorias.Select(categoria => categoria.IdentificadorCategoria));
    }

    [Fact]
    public void TomDiretoEUmaObservacaoFixaRastreavelSemMudarQuantidadeOuRepresentatividade()
    {
        var resultado = CalcularMassaCompleta();

        var rotina = Categoria(resultado, "categoria-rotina");
        var projetos = Categoria(resultado, "categoria-projetos");
        var equilibrio = Categoria(resultado, "categoria-equilibrio");
        var semTom = Categoria(resultado, "categoria-sem-tom");

        Assert.Equal(100, rotina.TomDireto);
        Assert.Equal("memoria-001", rotina.IdentificadorObservacaoTomDireto);
        Assert.Equal(0, projetos.TomDireto);
        Assert.Equal("memoria-003", projetos.IdentificadorObservacaoTomDireto);
        Assert.Equal(-80, equilibrio.TomDireto);
        Assert.Equal("memoria-006", equilibrio.IdentificadorObservacaoTomDireto);
        Assert.Null(semTom.TomDireto);
        Assert.Equal("memoria-007", semTom.IdentificadorObservacaoTomDireto);
        var categoriasOriginais = resultado.Categorias
            .Where(categoria => categoria.IdentificadorCategoria is "categoria-rotina"
                or "categoria-projetos"
                or "categoria-equilibrio"
                or "categoria-sem-tom")
            .ToArray();
        Assert.Equal(new[] { 3, 4, 2, 2 }, categoriasOriginais.Select(categoria => categoria.QuantidadeAssociacoes));
        Assert.Equal(new[] { 20d, 20d / 3d, 0d, (double?)null }, categoriasOriginais.Select(categoria => categoria.TomMedio));
    }

    [Fact]
    public void MassaAmpliaAmostrasNosDoisLadosDoLimiarCromatico()
    {
        var resultado = CalcularMassaCompleta();

        var tonsProximosDoLimiar = new[] { 17, 19, 20, 21, 23 };
        for (var indice = 0; indice < tonsProximosDoLimiar.Length; indice++)
        {
            var tom = tonsProximosDoLimiar[indice];
            var positiva = Categoria(resultado, $"categoria-limiar-positivo-{tom}");
            var negativa = Categoria(resultado, $"categoria-limiar-negativo-{tom}");

            Assert.Equal((double)tom, positiva.TomMedio);
            Assert.Equal((double)-tom, negativa.TomMedio);
            Assert.Equal(indice + 1, positiva.QuantidadeAssociacoes);
            Assert.Equal(indice + 1, negativa.QuantidadeAssociacoes);
            Assert.Equal(indice + 1, positiva.QuantidadeTonsDefinidos);
            Assert.Equal(indice + 1, negativa.QuantidadeTonsDefinidos);
        }
    }

    [Fact]
    public void AlterarPeriodoInverteOrdemEntreTomProximoDoLimiarETomVariavel()
    {
        var datasCompletas = MassaPanoramaDemonstrativa.Datas;
        var datasIniciais = datasCompletas.Take(3).ToArray();
        var resultadoCompleto = CalculosPanoramaDemonstrativo.Calcular(datasCompletas, MassaPanoramaDemonstrativa.Ocorrencias);
        var resultadoInicial = CalculosPanoramaDemonstrativo.Calcular(datasIniciais, MassaPanoramaDemonstrativa.Ocorrencias);
        var ordenacaoTomCrescente = new EstadoOrdenacaoPanorama(
            CriterioOrdenacaoPanorama.Tom,
            SentidoOrdenacaoPanorama.Decrescente,
            SentidoOrdenacaoPanorama.Crescente);

        var ordemCompleta = OrdenacaoPanoramaDemonstrativo.Ordenar(
            resultadoCompleto.Categorias,
            ordenacaoTomCrescente,
            categoria => categoria.TomMedio);
        var ordemInicial = OrdenacaoPanoramaDemonstrativo.Ordenar(
            resultadoInicial.Categorias,
            ordenacaoTomCrescente,
            categoria => categoria.TomMedio);

        Assert.True(22d > 20d);
        Assert.True(-10d < 20d);
        var indiceVariavelCompleto = Array.FindIndex(ordemCompleta.ToArray(), categoria => categoria.IdentificadorCategoria == "categoria-periodo-variavel");
        var indiceLimiarCompleto = Array.FindIndex(ordemCompleta.ToArray(), categoria => categoria.IdentificadorCategoria == "categoria-limiar-positivo-20");
        var indiceVariavelInicial = Array.FindIndex(ordemInicial.ToArray(), categoria => categoria.IdentificadorCategoria == "categoria-periodo-variavel");
        var indiceLimiarInicial = Array.FindIndex(ordemInicial.ToArray(), categoria => categoria.IdentificadorCategoria == "categoria-limiar-positivo-20");

        Assert.True(indiceVariavelCompleto > indiceLimiarCompleto);
        Assert.True(indiceVariavelInicial < indiceLimiarInicial);
    }

    [Fact]
    public void TomDiretoAusenteNoRecorteNaoRecuperaOutraObservacaoNemViraZero()
    {
        var resultado = CalculosPanoramaDemonstrativo.Calcular(
            new[] { new DateOnly(2025, 1, 5) },
            MassaPanoramaDemonstrativa.Ocorrencias);
        var rotina = Categoria(resultado, "categoria-rotina");

        Assert.Null(rotina.TomDireto);
        Assert.Null(rotina.IdentificadorObservacaoTomDireto);
        Assert.Equal(-60d, rotina.TomMedio);
        Assert.Equal(1, rotina.QuantidadeAssociacoes);
    }

    [Fact]
    public void NovoIntervaloValidoRecalculaUmaVezEMovimentoInvalidoPreservaUltimoResultado()
    {
        var modelo = new ModeloJanelaTemporal(MassaPanoramaDemonstrativa.Datas);
        var resultados = new List<ResultadoPanoramaDemonstrativo>();
        modelo.IntervaloAlterado += intervalo =>
        {
            var datasDoIntervalo = modelo.DiasPreservados
                .Where(data => data >= intervalo.DataInicio && data <= intervalo.DataFim)
                .ToArray();
            resultados.Add(CalculosPanoramaDemonstrativo.Calcular(datasDoIntervalo, MassaPanoramaDemonstrativa.Ocorrencias));
        };

        modelo.AtualizarPosicoes(0.25d, 0.5d);

        Assert.Single(resultados);
        Assert.Equal(new DateOnly(2025, 1, 5), modelo.Estado.IntervaloValidoAtual?.DataInicio);
        Assert.Equal(new DateOnly(2025, 1, 12), modelo.Estado.IntervaloValidoAtual?.DataFim);
        Assert.Equal(2, Categoria(resultados[0], "categoria-rotina").QuantidadeAssociacoes);
        Assert.Equal(-60d, Categoria(resultados[0], "categoria-rotina").TomMedio!.Value);
        Assert.Equal(-60d / 11d, resultados[0].TomMedioPonderado!.Value, 12);

        modelo.AtualizarPosicoes(0.26d, 0.51d);
        var invalido = modelo.AtualizarPosicoes(0.25d, 0.25d);

        Assert.Single(resultados);
        Assert.True(invalido.Invalida);
        Assert.Equal(new DateOnly(2025, 1, 5), invalido.UltimoIntervaloValido?.DataInicio);
        Assert.Equal(new DateOnly(2025, 1, 12), invalido.UltimoIntervaloValido?.DataFim);
        Assert.Equal(-60d / 11d, resultados[0].TomMedioPonderado!.Value, 12);
    }

    private static ResultadoPanoramaDemonstrativo CalcularMassaCompleta() =>
        CalculosPanoramaDemonstrativo.Calcular(MassaPanoramaDemonstrativa.Datas, MassaPanoramaDemonstrativa.Ocorrencias);

    private static ResumoCategoriaPanoramaDemonstrativo Categoria(ResultadoPanoramaDemonstrativo resultado, string identificador) =>
        Assert.Single(resultado.Categorias, categoria => categoria.IdentificadorCategoria == identificador);
}
