using Rememore.Client.Infraestrutura.TrabalhoLocal;

namespace Rememore.Client.Infraestrutura.Capturar;

public enum EstadoAberturaCaptura { Aberta, ApiIndisponivel, FalhaArmazenamento, FalhaPreparacao }

public sealed record ResultadoAberturaCaptura(EstadoAberturaCaptura Estado, WorkspaceCapturaLocal? Workspace = null);

public sealed class AberturaCaptura(
    IDiagnosticoTrabalhoLocal diagnostico,
    ICapturasLocais capturas,
    IComposicaoCapturaRemota remoto)
{
    public async Task<ResultadoAberturaCaptura> AbrirAsync(
        string identidadeConta, DateOnly data, bool continuidadeAtiva)
    {
        var diagnosticoLocal = await diagnostico.DiagnosticarAsync();
        if (diagnosticoLocal.Estado == EstadoOperacaoLocal.ApiIndisponivel)
            return new(EstadoAberturaCaptura.ApiIndisponivel);
        if (!diagnosticoLocal.Sucesso || diagnosticoLocal.Valor != true)
            return new(EstadoAberturaCaptura.FalhaArmazenamento);

        var leitura = await capturas.RecuperarAsync(identidadeConta, data);
        if (leitura.Sucesso && leitura.Valor is { Alterado: true } alterado)
            return new(EstadoAberturaCaptura.Aberta, alterado);
        if (leitura.Estado != EstadoOperacaoLocal.Ausente && (!leitura.Sucesso || leitura.Valor is null))
            return new(EstadoAberturaCaptura.FalhaPreparacao);

        var limpo = leitura.Valor;
        if (limpo is not null && continuidadeAtiva)
            return new(EstadoAberturaCaptura.Aberta, limpo);

        var verificacao = await remoto.VerificarAsync(identidadeConta, data);
        if (!Valida(verificacao)) return new(EstadoAberturaCaptura.FalhaPreparacao);

        if (limpo is not null && OrigemCoincide(limpo, verificacao))
            return new(EstadoAberturaCaptura.Aberta, limpo);

        ComposicaoCapturaRemota composicao;
        if (limpo is null && verificacao.Estado == EstadoComposicaoRemota.Ausente)
            composicao = new(EstadoComposicaoRemota.Ausente);
        else
            composicao = await remoto.ObterCompletaAsync(identidadeConta, data);

        if (!Valida(composicao)) return new(EstadoAberturaCaptura.FalhaPreparacao);

        var novo = composicao.Estado == EstadoComposicaoRemota.Presente
            ? new WorkspaceCapturaLocal(identidadeConta, data, false, composicao.Memorias!,
                OrigemCapturaLocal.Presente, composicao.Revisao)
            : new WorkspaceCapturaLocal(identidadeConta, data, false, [], OrigemCapturaLocal.Ausente);

        var gravacao = await capturas.GravarSeLimpoAsync(novo);
        if (gravacao.Sucesso) return new(EstadoAberturaCaptura.Aberta, novo);

        // Uma alteração surgida durante a consulta remota continua sendo a fonte protegida.
        if (gravacao.Falha?.Codigo == "CapturaAlterada")
        {
            var atual = await capturas.RecuperarAsync(identidadeConta, data);
            if (atual.Sucesso && atual.Valor is { Alterado: true } alteradoAtual)
                return new(EstadoAberturaCaptura.Aberta, alteradoAtual);
        }

        return new(EstadoAberturaCaptura.FalhaPreparacao);
    }

    private static bool OrigemCoincide(WorkspaceCapturaLocal local, VerificacaoComposicaoRemota remota) =>
        (local.Origem == OrigemCapturaLocal.Ausente && remota.Estado == EstadoComposicaoRemota.Ausente)
        || (local.Origem == OrigemCapturaLocal.Presente
            && remota.Estado == EstadoComposicaoRemota.Presente
            && local.RevisaoOrigem == remota.Revisao);

    private static bool Valida(VerificacaoComposicaoRemota resposta) => resposta.Estado switch
    {
        EstadoComposicaoRemota.Ausente => resposta.Revisao is null,
        EstadoComposicaoRemota.Presente => !string.IsNullOrWhiteSpace(resposta.Revisao),
        _ => false
    };

    private static bool Valida(ComposicaoCapturaRemota resposta) => resposta.Estado switch
    {
        EstadoComposicaoRemota.Ausente => resposta.Revisao is null && resposta.Memorias is null,
        EstadoComposicaoRemota.Presente => !string.IsNullOrWhiteSpace(resposta.Revisao) && resposta.Memorias is not null,
        _ => false
    };
}
