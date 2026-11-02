using Rememore.Client.Infraestrutura.Categorias;
using Rememore.Client.Infraestrutura.OrientacaoProgressiva;

namespace Rememore.Client.Tests;

public sealed class ContratoCategoriasE2Tests
{
    [Fact]
    public async Task CatalogoFakeRetornaSomenteTresCategoriasAtivasTipadas()
    {
        var fake = new CatalogoCategoriasRemotoSimulado();

        var resposta = await fake.ObterAtivasAsync("conta-teste");

        Assert.Equal(EstadoCatalogoCategoriasRemoto.Disponivel, resposta.Estado);
        var categorias = resposta.Categorias!;
        Assert.Equal(3, categorias.Count);
        Assert.Equal(3, categorias.Select(categoria => categoria.Identidade).Distinct().Count());
        Assert.All(categorias, categoria => Assert.True(categoria.Ativa));
        Assert.Equal(new[] { "Família", "Trabalho", "Viagens" }, categorias.Select(categoria => categoria.Nome));
    }

    [Fact]
    public async Task CatalogoFakeNaoInventaContaAusente()
    {
        var resposta = await new CatalogoCategoriasRemotoSimulado().ObterAtivasAsync(" ");

        Assert.Equal(EstadoCatalogoCategoriasRemoto.Inconclusivo, resposta.Estado);
        Assert.Null(resposta.Categorias);
    }

    [Fact]
    public async Task ContextoDeOrientacaoDeCategoriaResolveAsTresMensagensAprovadas()
    {
        var nivel = new FonteNivelOrientacaoSimulada();
        var resolvedor = new ResolvedorOrientacaoProgressiva(nivel, CatalogoOrientacoes.CriarPadrao());

        nivel.NivelAtual = NivelOrientacao.Iniciante;
        Assert.Equal("Escolha uma categoria que represente esta memória. Se ela ainda não existir, basta escrever o nome.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
        nivel.NivelAtual = NivelOrientacao.Intermediario;
        Assert.Equal("Escolha a categoria que melhor representa o contexto desta memória.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
        nivel.NivelAtual = NivelOrientacao.Avancado;
        Assert.Equal("Categorias consistentes tornam mais perceptíveis os temas que atravessam suas memórias.",
            await resolvedor.ObterTextoAsync(ContextosOrientacao.CategorizacaoCategoria));
    }
}
