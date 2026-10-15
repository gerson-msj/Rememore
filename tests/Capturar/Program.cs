using Rememore.Client.Infraestrutura.Capturar;
using Rememore.Client.Infraestrutura.TrabalhoLocal;

const string contaA = "conta-a";
const string contaB = "conta-b";
var data = new DateOnly(2026, 10, 14);
var outraData = data.AddDays(-1);
var memoria = new MemoriaCapturaLocal("m1", "Conteúdo preservado", 0);
var concluidos = 0;

await Cenario("Data canônica, existente e não futura", () =>
{
    Conferir(DatasCaptura.TentarValidar("2026-10-14", data, out _));
    Conferir(!DatasCaptura.TentarValidar("2026-10-15", data, out _));
    Conferir(!DatasCaptura.TentarValidar("2026-02-30", data, out _));
    Conferir(!DatasCaptura.TentarValidar("14/10/2026", data, out _));
    Conferir(DatasCaptura.Apresentar(data) == "14/10/2026");
    return Task.CompletedTask;
});

await Cenario("Ausência remota confirmada cria workspace vazio e limpo", async () =>
{
    var (local, remoto, abertura) = Montar();
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Estado == EstadoAberturaCaptura.Aberta);
    Conferir(resultado.Workspace is { Origem: OrigemCapturaLocal.Ausente, Alterado: false });
    Conferir(resultado.Workspace!.Memorias.Count == 0 && remoto.Verificacoes == 1 && remoto.LeiturasCompletas == 0);
    Conferir(local.Capturas[(contaA, data)] == resultado.Workspace);
});

await Cenario("Presença remota traz composição e revisão efetiva", async () =>
{
    var (_, remoto, abertura) = Montar();
    remoto.Verificacao = new(EstadoComposicaoRemota.Presente, "rev-1");
    remoto.Completa = new(EstadoComposicaoRemota.Presente, "rev-2", [memoria]);
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace is { Origem: OrigemCapturaLocal.Presente, RevisaoOrigem: "rev-2" });
    Conferir(resultado.Workspace!.Memorias.Single() == memoria);
});

await Cenario("Cache limpo coincidente faz só verificação leve", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [memoria], OrigemCapturaLocal.Presente, "rev-1");
    remoto.Verificacao = new(EstadoComposicaoRemota.Presente, "rev-1");
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace == local.Capturas[(contaA, data)]);
    Conferir(remoto.Verificacoes == 1 && remoto.LeiturasCompletas == 0 && local.Gravacoes == 0);
});

await Cenario("Revisão diferente reconstrói apenas o limpo", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [], OrigemCapturaLocal.Presente, "rev-1");
    remoto.Verificacao = new(EstadoComposicaoRemota.Presente, "rev-2");
    remoto.Completa = new(EstadoComposicaoRemota.Presente, "rev-3", [memoria]);
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace?.RevisaoOrigem == "rev-3" && resultado.Workspace.Memorias.Single() == memoria);
    Conferir(local.Gravacoes == 1 && remoto.LeiturasCompletas == 1);
});

await Cenario("Ausente passa a presente em nova entrada", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [], OrigemCapturaLocal.Ausente);
    remoto.Verificacao = new(EstadoComposicaoRemota.Presente, "nova");
    remoto.Completa = new(EstadoComposicaoRemota.Presente, "nova", [memoria]);
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Workspace?.Origem == OrigemCapturaLocal.Presente);
});

await Cenario("Presente passa a ausente em nova entrada", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [memoria], OrigemCapturaLocal.Presente, "antiga");
    remoto.Verificacao = new(EstadoComposicaoRemota.Ausente);
    remoto.Completa = new(EstadoComposicaoRemota.Ausente);
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace is { Origem: OrigemCapturaLocal.Ausente, Alterado: false });
    Conferir(resultado.Workspace!.Memorias.Count == 0 && remoto.LeiturasCompletas == 1);
});

await Cenario("Workspace limpo sem origem verificável é reconstruído", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [memoria]);
    remoto.Verificacao = new(EstadoComposicaoRemota.Ausente);
    remoto.Completa = new(EstadoComposicaoRemota.Ausente);
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Workspace?.Origem == OrigemCapturaLocal.Ausente);
    Conferir(remoto.LeiturasCompletas == 1);
});

await Cenario("Alterado prevalece sem consulta remota", async () =>
{
    var (local, remoto, abertura) = Montar();
    var alterado = new WorkspaceCapturaLocal(contaA, data, true, [memoria]);
    local.Capturas[(contaA, data)] = alterado;
    remoto.Verificacao = new(EstadoComposicaoRemota.Falha);
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Workspace == alterado);
    Conferir(remoto.Verificacoes == 0 && local.Gravacoes == 0);
});

await Cenario("F5 conserva limpo sem consulta; nova entrada revalida", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.Capturas[(contaA, data)] = new(contaA, data, false, [], OrigemCapturaLocal.Ausente);
    remoto.Verificacao = new(EstadoComposicaoRemota.Falha);
    Conferir((await abertura.AbrirAsync(contaA, data, true)).Estado == EstadoAberturaCaptura.Aberta);
    Conferir(remoto.Verificacoes == 0);
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaPreparacao);
    Conferir(remoto.Verificacoes == 1);
});

await Cenario("Falha ou inconclusão remota mantém o limpo anterior", async () =>
{
    foreach (var estado in new[] { EstadoComposicaoRemota.Falha, EstadoComposicaoRemota.Inconclusiva })
    {
        var (local, remoto, abertura) = Montar();
        var anterior = new WorkspaceCapturaLocal(contaA, data, false, [memoria], OrigemCapturaLocal.Presente, "antiga");
        local.Capturas[(contaA, data)] = anterior;
        remoto.Verificacao = new(estado);
        Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaPreparacao);
        Conferir(local.Capturas[(contaA, data)] == anterior && local.Gravacoes == 0);
    }
});

await Cenario("Resposta integral inconclusiva não substitui cache", async () =>
{
    var (local, remoto, abertura) = Montar();
    var anterior = new WorkspaceCapturaLocal(contaA, data, false, [memoria], OrigemCapturaLocal.Presente, "antiga");
    local.Capturas[(contaA, data)] = anterior;
    remoto.Verificacao = new(EstadoComposicaoRemota.Presente, "nova");
    remoto.Completa = new(EstadoComposicaoRemota.Inconclusiva);
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaPreparacao);
    Conferir(local.Capturas[(contaA, data)] == anterior);
});

await Cenario("Diagnóstico distingue API indisponível e falha efetiva", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.EstadoDiagnostico = EstadoOperacaoLocal.ApiIndisponivel;
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.ApiIndisponivel);
    local.EstadoDiagnostico = EstadoOperacaoLocal.Falha;
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaArmazenamento);
    Conferir(remoto.Verificacoes == 0);
});

await Cenario("Falhas locais de leitura e escrita impedem abertura", async () =>
{
    var (local, remoto, abertura) = Montar();
    local.FalharLeitura = true;
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaPreparacao);
    Conferir(remoto.Verificacoes == 0);
    local.FalharLeitura = false;
    local.FalharGravacao = true;
    Conferir((await abertura.AbrirAsync(contaA, data, false)).Estado == EstadoAberturaCaptura.FalhaPreparacao);
    Conferir(local.Capturas.Count == 0);
});

await Cenario("Alteração concorrente detectada no commit prevalece", async () =>
{
    var (local, _, abertura) = Montar();
    local.AlterarNoCommit = true;
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace is { Alterado: true });
    Conferir(local.Capturas[(contaA, data)].Alterado);
});

await Cenario("Conta e data permanecem isoladas", async () =>
{
    var (local, _, abertura) = Montar();
    local.Capturas[(contaB, data)] = new(contaB, data, true, [memoria]);
    local.Capturas[(contaA, outraData)] = new(contaA, outraData, true, [memoria]);
    var resultado = await abertura.AbrirAsync(contaA, data, false);
    Conferir(resultado.Workspace is { IdentidadeConta: contaA, Alterado: false });
    Conferir(local.Capturas[(contaB, data)].Alterado && local.Capturas[(contaA, outraData)].Alterado);
});

Console.WriteLine($"Abertura de Capturar: {concluidos} cenários concluídos.");

async Task Cenario(string nome, Func<Task> executar)
{
    await executar();
    concluidos++;
    Console.WriteLine($"OK: {nome}");
}

static void Conferir(bool condicao)
{
    if (!condicao) throw new Exception("Cenário de abertura não atendido.");
}

static (CapturasEmMemoria Local, RemotoDeTeste Remoto, AberturaCaptura Abertura) Montar()
{
    var local = new CapturasEmMemoria();
    var remoto = new RemotoDeTeste();
    return (local, remoto, new AberturaCaptura(local, local, remoto));
}

sealed class RemotoDeTeste : IComposicaoCapturaRemota
{
    public VerificacaoComposicaoRemota Verificacao { get; set; } = new(EstadoComposicaoRemota.Ausente);
    public ComposicaoCapturaRemota Completa { get; set; } = new(EstadoComposicaoRemota.Ausente);
    public int Verificacoes { get; private set; }
    public int LeiturasCompletas { get; private set; }
    public Task<VerificacaoComposicaoRemota> VerificarAsync(string _, DateOnly __)
    {
        Verificacoes++;
        return Task.FromResult(Verificacao);
    }
    public Task<ComposicaoCapturaRemota> ObterCompletaAsync(string _, DateOnly __)
    {
        LeiturasCompletas++;
        return Task.FromResult(Completa);
    }
}

sealed class CapturasEmMemoria : IDiagnosticoTrabalhoLocal, ICapturasLocais
{
    public Dictionary<(string, DateOnly), WorkspaceCapturaLocal> Capturas { get; } = [];
    public EstadoOperacaoLocal EstadoDiagnostico { get; set; } = EstadoOperacaoLocal.Sucesso;
    public bool FalharLeitura { get; set; }
    public bool FalharGravacao { get; set; }
    public bool AlterarNoCommit { get; set; }
    public int Gravacoes { get; private set; }

    public Task<ResultadoLocal<bool>> DiagnosticarAsync() => Task.FromResult(
        new ResultadoLocal<bool>(EstadoDiagnostico, EstadoDiagnostico == EstadoOperacaoLocal.Sucesso));
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> RecuperarAsync(string identidadeConta, DateOnly data) => Task.FromResult(
        FalharLeitura ? new ResultadoLocal<WorkspaceCapturaLocal>(EstadoOperacaoLocal.Falha) :
        Capturas.TryGetValue((identidadeConta, data), out var captura)
            ? new ResultadoLocal<WorkspaceCapturaLocal>(EstadoOperacaoLocal.Sucesso, captura)
            : new ResultadoLocal<WorkspaceCapturaLocal>(EstadoOperacaoLocal.Ausente));
    public Task<ResultadoLocal<bool>> GravarSeLimpoAsync(WorkspaceCapturaLocal captura)
    {
        if (AlterarNoCommit)
        {
            Capturas[(captura.IdentidadeConta, captura.Data)] = captura with { Alterado = true };
            return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Falha, false,
                new FalhaTrabalhoLocal("escrita", "CapturaAlterada")));
        }
        if (FalharGravacao) return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Falha));
        Gravacoes++;
        Capturas[(captura.IdentidadeConta, captura.Data)] = captura;
        return Task.FromResult(new ResultadoLocal<bool>(EstadoOperacaoLocal.Sucesso, true));
    }
    public Task<ResultadoLocal<bool>> GravarAsync(WorkspaceCapturaLocal captura) => GravarSeLimpoAsync(captura);
    public Task<ResultadoLocal<bool>> RemoverAsync(string identidadeConta, DateOnly data) => RemoverSeAlteradoAsync(identidadeConta, data);
    public Task<ResultadoLocal<bool>> RemoverSeAlteradoAsync(string identidadeConta, DateOnly data) => Task.FromResult(
        new ResultadoLocal<bool>(Capturas.Remove((identidadeConta, data)) ? EstadoOperacaoLocal.Sucesso : EstadoOperacaoLocal.Ausente));
    public Task<ResultadoLocal<WorkspaceCapturaLocal>> MarcarAlteradoAsync(string identidadeConta, DateOnly data) => Task.FromResult(
        Capturas.TryGetValue((identidadeConta, data), out var captura)
            ? new ResultadoLocal<WorkspaceCapturaLocal>(EstadoOperacaoLocal.Sucesso,
                Capturas[(identidadeConta, data)] = captura with { Alterado = true })
            : new ResultadoLocal<WorkspaceCapturaLocal>(EstadoOperacaoLocal.Ausente));
    public Task<ResultadoLocal<IReadOnlyList<WorkspaceCapturaLocal>>> ConsultarAsync(string identidadeConta) => Task.FromResult(
        new ResultadoLocal<IReadOnlyList<WorkspaceCapturaLocal>>(EstadoOperacaoLocal.Sucesso,
            Capturas.Values.Where(captura => captura.IdentidadeConta == identidadeConta).ToArray()));
}
