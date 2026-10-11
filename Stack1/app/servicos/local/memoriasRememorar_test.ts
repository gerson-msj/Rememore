import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { BancoLocal } from "./banco.ts"
import { type ConsultaMemoriasEmCache, RepositorioMemoriasRememorar } from "./memoriasRememorar.ts"
import { migracoesLocais, STORE_METADADOS_PROJECAO_REMEMORAR, STORE_PROJECAO_REMEMORAR } from "./esquema.ts"

function criarCache(idConta: string, idConsulta = "consulta-a"): ConsultaMemoriasEmCache {
    return {
        idConta,
        idJornada: "jornada-a",
        idConsulta,
        idCategoria: "categoria-01",
        primeiroDia: "2025-01-01",
        ultimoDia: "2025-01-02",
        ordenacao: "data-ordem-id",
        memorias: [],
        lotesCompletos: 0,
        registrosCobertos: 0,
        proximoOffset: 0,
        total: null,
        fim: false,
        pontoLeitura: { idMemoria: null, deslocamentoPx: 0, rolagemY: 0 }
    }
}

Deno.test("Cache de Rememorar: confirma lotes consecutivos e rejeita respostas antigas", async () => {
    const fabrica = new IDBFactory()
    const banco = new BancoLocal({ nome: `rememore-cache-${crypto.randomUUID()}`, fabrica: () => fabrica })
    const repositorio = new RepositorioMemoriasRememorar(banco)
    await repositorio.iniciar(criarCache("conta-a"))
    const primeiro = await repositorio.anexarLote("conta-a", "consulta-a", 0, {
        memorias: [],
        proximoOffset: 30,
        total: 45
    })
    if (!primeiro) throw new Error("O primeiro lote não foi confirmado")
    const repetido = await repositorio.anexarLote("conta-a", "consulta-a", 0, {
        memorias: [],
        proximoOffset: 30,
        total: 45
    })
    if (repetido) throw new Error("Um offset já coberto foi aceito novamente")
    const respostaAntiga = await repositorio.anexarLote("conta-a", "consulta-anterior", 30, {
        memorias: [],
        proximoOffset: null,
        total: 45
    })
    if (respostaAntiga) throw new Error("Resposta de consulta antiga foi anexada ao cache ativo")
    const atual = await repositorio.obter("conta-a")
    if (atual?.lotesCompletos !== 1 || atual.proximoOffset !== 30 || atual.total !== 45) {
        throw new Error("Metadados do lote confirmado foram perdidos")
    }
})

Deno.test("Cache de Rememorar: mantém uma única consulta por conta e isola contas", async () => {
    const fabrica = new IDBFactory()
    const banco = new BancoLocal({ nome: `rememore-cache-${crypto.randomUUID()}`, fabrica: () => fabrica })
    const repositorio = new RepositorioMemoriasRememorar(banco)
    await repositorio.iniciar(criarCache("conta-a"))
    await repositorio.iniciar(criarCache("conta-b", "consulta-b"))
    await repositorio.iniciar(criarCache("conta-a", "consulta-c"))
    if ((await repositorio.obter("conta-a"))?.idConsulta !== "consulta-c") {
        throw new Error("A conta manteve mais de uma consulta ativa")
    }
    if ((await repositorio.obter("conta-b"))?.idConsulta !== "consulta-b") {
        throw new Error("O cache de outra conta foi sobrescrito")
    }
    await repositorio.remover("conta-a")
    if (await repositorio.obter("conta-a")) throw new Error("A limpeza não removeu o cache da conta")
    if (!(await repositorio.obter("conta-b"))) throw new Error("A limpeza afetou outra conta")
})

Deno.test("Schema local 8: acrescenta o cache sem descartar stores da projeção", async () => {
    const fabrica = new IDBFactory()
    const nome = `rememore-schema-${crypto.randomUUID()}`
    const banco7 = new BancoLocal({ nome, fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 7) })
    await banco7.transacao([STORE_PROJECAO_REMEMORAR, STORE_METADADOS_PROJECAO_REMEMORAR], "readwrite", "write", (transacao) => {
        transacao.objectStore(STORE_PROJECAO_REMEMORAR).put({
            idConta: "conta-a",
            data: "2025-01-01",
            categorias: [{ idCategoria: "categoria-01", tons: [0] }]
        })
        return transacao.objectStore(STORE_METADADOS_PROJECAO_REMEMORAR).put({
            idConta: "conta-a",
            revisao: "1",
            inicializada: true
        })
    })
    const banco8 = new BancoLocal({ nome, fabrica: () => fabrica })
    const metadados = await banco8.transacao(
        [STORE_METADADOS_PROJECAO_REMEMORAR],
        "readonly",
        "read",
        (transacao) => transacao.objectStore(STORE_METADADOS_PROJECAO_REMEMORAR).get("conta-a")
    )
    const bloco = await banco8.transacao(
        [STORE_PROJECAO_REMEMORAR],
        "readonly",
        "read",
        (transacao) => transacao.objectStore(STORE_PROJECAO_REMEMORAR).get(["conta-a", "2025-01-01"])
    )
    if (!metadados || !bloco) throw new Error("A migração do cache apagou dados da projeção")
})
