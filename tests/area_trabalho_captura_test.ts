import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { BancoLocal } from "../app/servicos/local/banco.ts"
import { RepositorioCapturasLocais } from "../app/servicos/local/capturas.ts"
import { migracoesLocais } from "../app/servicos/local/esquema.ts"
import { prepararCaptura } from "../app/servicos/captura.ts"
import { type CenarioCapturaSimulada, criarCapturaSimulada } from "../app/servicos/captura/simulado.ts"
import { ehDataCaptura, formatarDataCaptura } from "../app/utilitarios/dataCaptura.ts"
import { sessaoSimulada } from "../app/servicos/autenticacao/simulado.ts"
import { SessaoCapturaAberta } from "../app/servicos/captura/sessaoAberta.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

async function verificarRejeicao(operacao: () => Promise<unknown>) {
    let falhou = false
    try {
        await operacao()
    } catch {
        falhou = true
    }
    verificarIgualdade(falhou, true)
}

function prepararCenario() {
    const fabrica = new IDBFactory()
    const banco = new BancoLocal({ fabrica: () => fabrica })
    const repositorio = new RepositorioCapturasLocais(banco)
    const cenario: CenarioCapturaSimulada = { status: "absent", revision: "X", editWindowDays: 3, memories: [] }
    const chamadas: string[] = []
    const remoto = criarCapturaSimulada(() => cenario, (operacao) => chamadas.push(operacao))
    const abrir = (dataCaptura = "2026-09-01", retomar?: string, conta = "a") =>
        prepararCaptura(conta, dataCaptura, repositorio, remoto, retomar)
    const encontrado = (revisao = "X") => {
        cenario.status = "found"
        cenario.revision = revisao
        cenario.memories = [{
            id: "stable-memory-id",
            content: `Revision ${revisao}`,
            order: 0,
            firstPreservedAt: "2026-09-01T12:00:00.000Z",
            complements: [{ id: "stable-complement-id", content: "Complemento", firstPreservedAt: "2026-09-02T12:00:00.000Z" }]
        }]
    }
    return { database: banco, repository: repositorio, scenario: cenario, calls: chamadas, open: abrir, found: encontrado }
}

Deno.test("datas de captura: calendário real, datas completas e limite de hoje", () => {
    for (const valor of ["2026-02-29", "2026-04-31", "2026-00-10", "2026-09", "2026-09-14", "0000-01-01"]) {
        verificarIgualdade(ehDataCaptura(valor, "2026-09-13"), false)
    }
    verificarIgualdade(ehDataCaptura("2024-02-29", "2026-09-13"), true)
    verificarIgualdade(ehDataCaptura("1900-02-29", "2026-09-13"), false)
    verificarIgualdade(ehDataCaptura("2000-02-29", "2026-09-13"), true)
    verificarIgualdade(formatarDataCaptura("2026-09-13"), "13/09/2026")
})

Deno.test("cache: ausência materializada uma vez e revalidada sem transferência integral", async () => {
    const { open: abrir, calls: chamadas, repository: repositorio } = prepararCenario()
    const primeiro = await abrir()
    verificarIgualdade(primeiro.alterada, false)
    verificarIgualdade(primeiro.origemPreservada, false)
    verificarIgualdade(primeiro.revisaoOrigem, null)
    verificarIgualdade(primeiro.prazoEdicaoDias, 3)
    verificarIgualdade(primeiro.memorias, [])
    verificarIgualdade(await repositorio.obter("a", primeiro.dataCaptura), primeiro)
    verificarIgualdade(await repositorio.listarPendentes("a"), [])
    verificarIgualdade(await abrir(), primeiro)
    verificarIgualdade(chamadas, ["metadata", "metadata"])
})

Deno.test("cache: revisão igual reutiliza memórias e atualiza parâmetros; revisão diferente obtém a composição", async () => {
    const { open: abrir, calls: chamadas, found: encontrado, scenario: cenario } = prepararCenario()
    encontrado()
    const primeiro = await abrir()
    verificarIgualdade(chamadas, ["metadata", "download"])
    verificarIgualdade(primeiro.revisaoOrigem, "X")
    // A mesma revisão não pode retransmitir nem substituir o conteúdo já obtido.
    cenario.memories = []
    cenario.editWindowDays = 4
    const segundo = await abrir()
    verificarIgualdade(segundo.memorias, primeiro.memorias)
    verificarIgualdade(segundo.idAreaTrabalho, primeiro.idAreaTrabalho)
    verificarIgualdade(segundo.prazoEdicaoDias, 4)
    verificarIgualdade(segundo.alterada, false)
    verificarIgualdade(chamadas, ["metadata", "download", "metadata"])
    encontrado("Y")
    const terceiro = await abrir()
    verificarIgualdade(terceiro.revisaoOrigem, "Y")
    verificarIgualdade(terceiro.memorias[0].conteudo, "Revision Y")
    verificarIgualdade(terceiro.idAreaTrabalho === primeiro.idAreaTrabalho, false)
    verificarIgualdade(chamadas, ["metadata", "download", "metadata", "metadata", "download"])
})

Deno.test("cache: transições entre ausência e existência reconstroem estado limpo somente com respostas conclusivas", async () => {
    const { open: abrir, calls: chamadas, found: encontrado, scenario: cenario } = prepararCenario()
    await abrir()
    encontrado()
    const existente = await abrir()
    verificarIgualdade(existente.origemPreservada, true)
    cenario.status = "absent"
    const vazio = await abrir()
    verificarIgualdade(vazio.origemPreservada, false)
    verificarIgualdade(vazio.revisaoOrigem, null)
    verificarIgualdade(vazio.memorias, [])
    verificarIgualdade(vazio.alterada, false)
    verificarIgualdade(chamadas, ["metadata", "metadata", "download", "metadata"])
})

Deno.test("pendência: trabalho local e prazo original prevalecem sem consulta remota, isolados por conta/data", async () => {
    const { open: abrir, calls: chamadas, found: encontrado, scenario: cenario, repository: repositorio } = prepararCenario()
    encontrado()
    const primeiro = await abrir("2026-09-02")
    await abrir()
    await repositorio.marcarAlterada("a", "2026-09-02")
    await repositorio.marcarAlterada("a", "2026-09-01")
    await repositorio.marcarAlterada("a", "2026-09-01")
    verificarIgualdade((await repositorio.listarPendentes("a")).map((captura) => captura.dataCaptura), ["2026-09-01", "2026-09-02"])
    verificarIgualdade(await repositorio.listarPendentes("b"), [])
    const antes = chamadas.length
    cenario.status = "failed"
    cenario.editWindowDays = 8
    const retomado = await abrir("2026-09-02")
    verificarIgualdade(retomado, { ...primeiro, alterada: true })
    verificarIgualdade(chamadas.length, antes)
    await verificarRejeicao(() => abrir("2026-09-02", undefined, "b"))
    await repositorio.remover("a", "2026-09-01")
    verificarIgualdade((await repositorio.listarPendentes("a")).length, 1)
    await verificarRejeicao(() => repositorio.marcarAlterada("a", "2026-09-01"))
})

Deno.test("recarregamento: sessão limpa conserva revisão e prazo; nova entrada normal revalida", async () => {
    const { open: abrir, calls: chamadas, found: encontrado, scenario: cenario } = prepararCenario()
    encontrado()
    const primeiro = await abrir()
    encontrado("Y")
    cenario.editWindowDays = 6
    verificarIgualdade(await abrir(primeiro.dataCaptura, primeiro.idAreaTrabalho), primeiro)
    verificarIgualdade(chamadas, ["metadata", "download"])
    const proximo = await abrir()
    verificarIgualdade(proximo.revisaoOrigem, "Y")
    verificarIgualdade(proximo.prazoEdicaoDias, 6)
    encontrado("Z")
    // Marcador de uma área substituída ou excluída não pode restaurar sua base antiga.
    verificarIgualdade((await abrir(primeiro.dataCaptura, primeiro.idAreaTrabalho)).revisaoOrigem, "Z")
})

Deno.test("falhas: erros de metadados, transferência e configuração não apagam cache nem criam áreas vazias", async () => {
    const { open: abrir, found: encontrado, scenario: cenario, repository: repositorio } = prepararCenario()
    cenario.status = "failed"
    await verificarRejeicao(() => abrir())
    verificarIgualdade(await repositorio.obter("a", "2026-09-01"), undefined)
    encontrado()
    const primeiro = await abrir()
    cenario.status = "failed"
    await verificarRejeicao(() => abrir())
    encontrado("Y")
    cenario.failRead = true
    await verificarRejeicao(() => abrir())
    cenario.failRead = false
    for (const invalido of [NaN, Infinity, 0, -1, "3" as unknown as number]) {
        cenario.editWindowDays = invalido
        await verificarRejeicao(() => abrir())
    }
    verificarIgualdade(await repositorio.obter("a", primeiro.dataCaptura), primeiro)
    verificarIgualdade(await repositorio.listarPendentes("a"), [])
})

Deno.test("transferência: resposta conserva revisão e parâmetros próprios quando o remoto muda após os metadados", async () => {
    const { repository: repositorio, found: encontrado, scenario: cenario } = prepararCenario()
    encontrado("Y")
    const remoto = criarCapturaSimulada(() => cenario)
    remoto.inspect = () => Promise.resolve({ status: "found", revision: "X", editWindowDays: 3 })
    cenario.editWindowDays = 4
    const resultado = await prepararCaptura("a", "2026-09-01", repositorio, remoto)
    verificarIgualdade(resultado.revisaoOrigem, "Y")
    verificarIgualdade(resultado.prazoEdicaoDias, 4)
    verificarIgualdade(resultado.memorias[0].conteudo, "Revision Y")
    cenario.status = "absent"
    await verificarRejeicao(() => prepararCaptura("a", "2026-09-01", repositorio, remoto))
    verificarIgualdade(await repositorio.obter("a", resultado.dataCaptura), resultado)
})

Deno.test("falhas locais: gravações rejeitadas preservam conteúdo confirmado, revisão de origem, identidades e primeira preservação", async () => {
    const { open: abrir, found: encontrado, repository: repositorio, database: banco } = prepararCenario()
    encontrado()
    const primeiro = await abrir()
    const transacao = banco.transacao.bind(banco)
    banco.transacao = () => Promise.reject(new Error("Falha de armazenamento simulada"))
    await verificarRejeicao(() => repositorio.marcarAlterada("a", primeiro.dataCaptura))
    await verificarRejeicao(() => repositorio.remover("a", primeiro.dataCaptura))
    await verificarRejeicao(() => repositorio.listarPendentes("a"))
    await verificarRejeicao(() => abrir("2026-09-02"))
    banco.transacao = transacao
    verificarIgualdade(await repositorio.obter("a", primeiro.dataCaptura), primeiro)
    await repositorio.marcarAlterada("a", primeiro.dataCaptura)
    verificarIgualdade(await repositorio.obter("a", primeiro.dataCaptura), { ...primeiro, alterada: true })
    const gravar = repositorio.gravar.bind(repositorio)
    repositorio.gravar = () => Promise.reject(new Error("Falha de gravação simulada"))
    await verificarRejeicao(() => abrir("2026-09-02"))
    repositorio.gravar = gravar
    verificarIgualdade(await repositorio.obter("a", "2026-09-02"), undefined)
})

Deno.test("migração 3: elimina capturas experimentais anteriores à 07 uma única vez, conforme autorizado", async () => {
    const fabrica = new IDBFactory()
    const anterior = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 2) })
    await anterior.transacao(
        ["captures"],
        "readwrite",
        "write",
        (transacao) => transacao.objectStore("captures").put({ accountId: "a", date: "2026-09-01", changed: true, memories: [] })
    )
    const versao3 = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 3) })
    verificarIgualdade(
        await versao3.transacao(["captures"], "readonly", "read", (transacao) => transacao.objectStore("captures").getAll()),
        []
    )
    const registro = { accountId: "a", date: "2026-09-01", changed: true, memories: [] }
    await versao3.transacao(["captures"], "readwrite", "write", (transacao) => transacao.objectStore("captures").put(registro))
    verificarIgualdade(
        await versao3.transacao(["captures"], "readonly", "read", (transacao) => transacao.objectStore("captures").getAll()),
        [registro]
    )
})

Deno.test("migração 4: substitui stores antigos, mantém novos dados e renova marcador de sessão anterior", async () => {
    const fabrica = new IDBFactory()
    const anterior = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 3) })
    await anterior.transacao(["captures", "_health"], "readwrite", "write", (transacao) => {
        transacao.objectStore("_health").put("antigo", "probe")
        return transacao.objectStore("captures").put({
            accountId: "a",
            date: "2026-09-01",
            changed: true,
            workspaceId: "area-antiga",
            memories: []
        })
    })
    const chaveSessao = 'rememore:capture:open:v1:["a","2026-09-01"]'
    const registros = new Map([[chaveSessao, JSON.stringify({ workspaceId: "area-antiga" })]])
    const armazenamento = {
        getItem: (chave: string) => registros.get(chave) ?? null,
        setItem: (chave: string, valor: string) => registros.set(chave, valor),
        removeItem: (chave: string) => registros.delete(chave)
    } as unknown as Storage
    const sessao = new SessaoCapturaAberta("a", "2026-09-01", armazenamento)
    const banco = new BancoLocal({ fabrica: () => fabrica })
    verificarIgualdade(await banco.diagnosticar(), { status: "operational" })
    const repositorio = new RepositorioCapturasLocais(banco)
    verificarIgualdade(await repositorio.listarPorConta("a"), [])
    await banco.transacao(["capturas", "_diagnostico"], "readonly", "read", (transacao) => {
        verificarIgualdade(transacao.db.version, migracoesLocais.length)
        verificarIgualdade(Array.from(transacao.db.objectStoreNames), ["_diagnostico", "capturas", "catalogosCategorias"])
        const capturas = transacao.objectStore("capturas")
        verificarIgualdade(capturas.keyPath, ["idConta", "dataCaptura"])
        verificarIgualdade(Array.from(capturas.indexNames), ["porConta"])
        verificarIgualdade(capturas.index("porConta").keyPath, "idConta")
        return transacao.objectStore("_diagnostico").count()
    }).then((quantidade) => verificarIgualdade(quantidade, 0))
    const chamadas: string[] = []
    const remoto = criarCapturaSimulada(
        () => ({ status: "absent", revision: "X", editWindowDays: 3, memories: [] }),
        (operacao) => chamadas.push(operacao)
    )
    const captura = await prepararCaptura("a", "2026-09-01", repositorio, remoto, sessao.retomar("reload"))
    verificarIgualdade(captura.idAreaTrabalho === "area-antiga", false)
    verificarIgualdade(chamadas, ["metadata"])
    sessao.iniciar(captura.idAreaTrabalho)
    verificarIgualdade(JSON.parse(registros.get(chaveSessao)!), { workspaceId: captura.idAreaTrabalho })
    const reaberto = new RepositorioCapturasLocais(new BancoLocal({ fabrica: () => fabrica }))
    verificarIgualdade(await reaberto.obter("a", "2026-09-01"), captura)
    verificarIgualdade(await prepararCaptura("a", "2026-09-01", reaberto, remoto, sessao.retomar("reload")), captura)
    verificarIgualdade(chamadas, ["metadata"])
    verificarIgualdade(await banco.diagnosticar(), { status: "operational" })
    verificarIgualdade(await reaberto.obter("a", "2026-09-01"), captura)
})

Deno.test("conversão local: preserva payload remoto, identidades, ordem e historicidade de memórias e complementos", async () => {
    const { open: abrir, found: encontrado, scenario: cenario, repository: repositorio } = prepararCenario()
    encontrado()
    cenario.memories[0].order = 7
    cenario.memories[0].complements.push({ id: "outro", content: "Ainda não preservado", firstPreservedAt: null })
    cenario.memories.push({ id: "segunda", content: "Outra memória", order: 2, firstPreservedAt: null, complements: [] })
    const original = structuredClone(cenario)
    const captura = await abrir()
    verificarIgualdade(captura.memorias, [{
        id: "stable-memory-id",
        conteudo: "Revision X",
        ordem: 7,
        primeiraPreservacaoEm: "2026-09-01T12:00:00.000Z",
        complementos: [{
            id: "stable-complement-id",
            conteudo: "Complemento",
            primeiraPreservacaoEm: "2026-09-02T12:00:00.000Z"
        }, { id: "outro", conteudo: "Ainda não preservado", primeiraPreservacaoEm: null }]
    }, { id: "segunda", conteudo: "Outra memória", ordem: 2, primeiraPreservacaoEm: null, complementos: [] }])
    verificarIgualdade(cenario, original)
    verificarIgualdade(Object.keys(captura).sort(), [
        "alterada",
        "dataCaptura",
        "idAreaTrabalho",
        "idConta",
        "memorias",
        "origemPreservada",
        "prazoEdicaoDias",
        "revisaoOrigem"
    ])
    verificarIgualdade(await repositorio.obter("a", captura.dataCaptura), captura)
})

Deno.test("migração 4: falha no upgrade reverte descarte e permite nova tentativa", async () => {
    const fabrica = new IDBFactory()
    const anterior = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 3) })
    const registro = { accountId: "a", date: "2026-09-01", memories: [] }
    await anterior.transacao(["captures"], "readwrite", "write", (transacao) => transacao.objectStore("captures").put(registro))
    const falho = new BancoLocal({
        fabrica: () => fabrica,
        migracoes: [...migracoesLocais.slice(0, 3), {
            versao: 4,
            migrar(banco, transacao) {
                migracoesLocais[3].migrar(banco, transacao)
                throw new Error("Falha simulada após substituir stores")
            }
        }]
    })
    verificarIgualdade((await falho.diagnosticar()).status, "unavailable")
    verificarIgualdade(
        await anterior.transacao(["captures"], "readonly", "read", (transacao) => transacao.objectStore("captures").getAll()),
        [registro]
    )
    const banco = new BancoLocal({ fabrica: () => fabrica })
    verificarIgualdade(await banco.diagnosticar(), { status: "operational" })
    verificarIgualdade(await new RepositorioCapturasLocais(banco).listarPorConta("a"), [])
})

Deno.test("identidade da sessão: ausente fora da sessão autenticada simulada", async () => {
    verificarIgualdade(await sessaoSimulada.accountId(new Request("http://localhost")), null)
    verificarIgualdade(
        await sessaoSimulada.accountId(new Request("http://localhost", { headers: { cookie: "rememore_mock_auth=authenticated" } })),
        "01K4Z5J6M7N8P9Q0R1S2T3V4W5"
    )
})
