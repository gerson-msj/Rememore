using Rememore.Client.Infraestrutura.OrientacaoProgressiva;

const string textoIniciante = "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.";
const string textoIntermediario = "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.";
const string textoMultilinha = "Primeira linha\n\nTerceira linha";

var fonte = new FonteNivelOrientacaoSimulada();
IOrientacaoProgressiva orientacao = new ResolvedorOrientacaoProgressiva(
    fonte, CatalogoOrientacoes.CriarPadrao());
IOrientacaoProgressiva orientacaoOutroContexto = new ResolvedorOrientacaoProgressiva(
    fonte,
    new CatalogoOrientacoes([new("teste.outro-contexto", textoMultilinha, null, "Outra orientação")]));

Conferir(fonte.NivelAtual == NivelOrientacao.Iniciante, "A fonte simulada deve iniciar em iniciante.");
Conferir(await orientacao.ObterTextoAsync(ContextosOrientacao.SelecaoCapturar) == textoIniciante,
    "Mensagem iniciante exata.");
Conferir(await orientacaoOutroContexto.ObterTextoAsync("teste.outro-contexto") == textoMultilinha,
    "Outro contexto preserva quebra de linha e linha em branco.");

fonte.NivelAtual = NivelOrientacao.Intermediario;
Conferir(await orientacao.ObterTextoAsync(ContextosOrientacao.SelecaoCapturar) == textoIntermediario,
    "Mensagem intermediária exata.");
Conferir(await orientacaoOutroContexto.ObterTextoAsync("teste.outro-contexto") is null,
    "Ausência intencional no outro contexto.");

fonte.NivelAtual = NivelOrientacao.Avancado;
Conferir(await orientacao.ObterTextoAsync(ContextosOrientacao.SelecaoCapturar) is null,
    "Ausência intencional no avançado.");
Conferir(await orientacaoOutroContexto.ObterTextoAsync("teste.outro-contexto") == "Outra orientação",
    "Outro contexto usa o mesmo resolvedor.");

await ConferirExcecaoAsync<ArgumentException>(
    () => orientacao.ObterTextoAsync("contexto.inexistente"), "Contexto desconhecido.");
ConferirExcecao<ArgumentException>(
    () => new CatalogoOrientacoes([new("teste", " ", null, null)]), "Mensagem vazia é configuração inválida.");
ConferirExcecao<ArgumentException>(
    () => new CatalogoOrientacoes([new("teste", "a", null, null), new("teste", "b", null, null)]),
    "Contexto duplicado é configuração inválida.");

fonte.NivelAtual = (NivelOrientacao)99;
await ConferirExcecaoAsync<InvalidOperationException>(
    () => orientacao.ObterTextoAsync(ContextosOrientacao.SelecaoCapturar), "Nível inválido.");

Console.WriteLine("Orientação progressiva: 11 verificações concluídas.");

static void Conferir(bool condicao, string cenario)
{
    if (!condicao)
        throw new Exception($"Falha: {cenario}");
}

static void ConferirExcecao<TExcecao>(Action acao, string cenario) where TExcecao : Exception
{
    try
    {
        acao();
    }
    catch (TExcecao)
    {
        return;
    }

    throw new Exception($"Falha: {cenario}");
}

static async Task ConferirExcecaoAsync<TExcecao>(Func<Task> acao, string cenario) where TExcecao : Exception
{
    try
    {
        await acao();
    }
    catch (TExcecao)
    {
        return;
    }

    throw new Exception($"Falha: {cenario}");
}
