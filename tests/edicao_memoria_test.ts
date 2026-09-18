import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { BancoLocal } from "../app/servicos/local/banco.ts"
import { type CapturaLocal, RepositorioCapturasLocais } from "../app/servicos/local/capturas.ts"
import {
    abrirComplemento,
    abrirEdicao,
    confirmarComplemento,
    confirmarMemoria,
    excluirUltimoElemento,
    moverMemoria,
    RascunhoMemoria
} from "../app/servicos/captura/edicao.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}
async function rejeita(operacao: () => unknown) {
    let falhou = false
    try {
        await operacao()
    } catch {
        falhou = true
    }
    igual(falhou, true)
}
function captura(): CapturaLocal {
    return {
        idConta: "a",
        dataCaptura: "2026-09-01",
        idAreaTrabalho: "base",
        prazoEdicaoDias: 3,
        alterada: false,
        origemPreservada: true,
        revisaoOrigem: "X",
        memorias: [
            { id: "b", conteudo: "Segunda", ordem: 9, primeiraPreservacaoEm: null, complementos: [] },
            { id: "a", conteudo: "Primeira", ordem: 2, primeiraPreservacaoEm: "2026-09-01T12:00:00Z", complementos: [] }
        ]
    }
}
function armazenamento(): Storage {
    const dados = new Map<string, string>()
    return {
        get length() {
            return dados.size
        },
        clear: () => dados.clear(),
        key: (indice) => [...dados.keys()][indice] ?? null,
        getItem: (chave) => dados.get(chave) ?? null,
        setItem: (chave, valor) => {
            dados.set(chave, valor)
        },
        removeItem: (chave) => {
            dados.delete(chave)
        }
    }
}

Deno.test("exclusão regressiva: remove último complemento por vez e só então a memória, após commit", async () => {
    const inicial = captura()
    inicial.memorias[1].complementos = [
        { id: "c1", conteudo: "Primeiro", primeiraPreservacaoEm: "2026-09-02T12:00:00Z" },
        { id: "c2", conteudo: "Último", primeiraPreservacaoEm: "2026-09-03T12:00:00Z" }
    ]
    const copia = structuredClone(inicial)
    const agora = Date.parse("2026-09-17T12:00:00Z")
    let liberar!: () => void
    let concluida = false
    const operacao = excluirUltimoElemento(inicial, abrirEdicao(inicial, "a", 30, agora), () =>
        new Promise<void>((resolver) => {
            liberar = resolver
        })).then((proxima) => {
            concluida = true
            return proxima
        })
    await Promise.resolve()
    igual(concluida, false)
    igual(inicial, copia)
    liberar()
    const primeira = await operacao
    igual(primeira.memorias[1].complementos, [copia.memorias[1].complementos[0]])
    igual(primeira.memorias[1].conteudo, copia.memorias[1].conteudo)
    igual([primeira.alterada, primeira.revisaoOrigem, primeira.idAreaTrabalho], [true, "X", "base"])
    const segunda = await excluirUltimoElemento(primeira, abrirEdicao(primeira, "a", 30, agora), () => Promise.resolve())
    igual(segunda.memorias[1].complementos, [])
    const terceira = await excluirUltimoElemento(segunda, abrirEdicao(segunda, "a", 30, agora), () => Promise.resolve())
    igual(terceira.memorias, [copia.memorias[0]])
    igual(inicial, copia)
})

Deno.test("exclusão: criação, edição suja e base incompatível rejeitam sem gravar", async () => {
    const inicial = captura()
    const agora = Date.parse("2026-09-17T12:00:00Z")
    let gravacoes = 0
    const gravar = () => {
        gravacoes++
        return Promise.resolve()
    }
    for (
        const edicao of [
            abrirEdicao(inicial, null, 0, agora),
            abrirComplemento(inicial, "a", 0, agora),
            { ...abrirEdicao(inicial, "b", 0, agora), suja: true },
            { ...abrirEdicao(inicial, "b", 0, agora), idAreaTrabalho: "outra" }
        ]
    ) await rejeita(() => excluirUltimoElemento(inicial, edicao, gravar))
    inicial.memorias[1].complementos = [{ id: "c", conteudo: "Editável", primeiraPreservacaoEm: null }]
    const complemento = abrirEdicao(inicial, "a", 0, agora)
    await rejeita(() => excluirUltimoElemento(inicial, { ...complemento, suja: true }, gravar))
    igual(gravacoes, 0)
    const proxima = await excluirUltimoElemento(inicial, complemento, gravar)
    igual(proxima.memorias[1].complementos, [])
    igual(gravacoes, 1)
})

Deno.test("exclusão: falha mantém memória, complementos e rascunho confirmado", async () => {
    const inicial = captura()
    inicial.memorias[1].complementos = [{ id: "c", conteudo: "Mantido", primeiraPreservacaoEm: null }]
    const copia = structuredClone(inicial)
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
    for (const id of ["a", "b"]) {
        const edicao = abrirEdicao(inicial, id, 0, Date.parse("2026-09-17T12:00:00Z"))
        rascunho.gravar(edicao)
        await rejeita(() => excluirUltimoElemento(inicial, edicao, () => Promise.reject(new Error("Falha"))))
        igual(rascunho.retomar(inicial, true), edicao)
        igual(inicial, copia)
    }
})

Deno.test("complementos: histórico integrado, prazo próprio e mesma variável da memória", () => {
    const inicial = captura()
    const memoria = inicial.memorias[1]
    memoria.complementos = [
        { id: "c1", conteudo: "Histórico", primeiraPreservacaoEm: "2026-09-02T12:00:00Z" },
        { id: "c2", conteudo: "Último", primeiraPreservacaoEm: "2026-09-05T12:00:00Z" }
    ]
    const limite = Date.parse("2026-09-08T12:00:00Z")
    igual(abrirEdicao(inicial, "a", 0, limite - 1).idComplemento, "c2")
    igual(abrirEdicao(inicial, "a", 0, limite).autorizada, false)
    igual(abrirEdicao({ ...inicial, prazoEdicaoDias: 4 }, "a", 0, limite).idComplemento, "c2")
    memoria.complementos[1].primeiraPreservacaoEm = null
    igual(abrirEdicao(inicial, "a", 0, limite + 86400000 * 100).idComplemento, "c2")
})

Deno.test("complementos: confirmação aguarda commit, preserva memória e falha conserva rascunho", async () => {
    const inicial = captura()
    const agora = Date.parse("2026-09-10T12:00:00Z")
    const edicao = { ...abrirComplemento(inicial, "a", 400, agora), texto: "Percepção posterior", suja: true }
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
    rascunho.gravar(edicao)
    await rejeita(() => confirmarComplemento(inicial, edicao, () => Promise.reject(new Error("Falha"))))
    igual(rascunho.retomar(inicial, true), edicao)
    igual(inicial, captura())
    let liberar!: () => void
    let concluida = false
    const operacao = confirmarComplemento(inicial, edicao, () =>
        new Promise<void>((resolver) => {
            liberar = resolver
        }))
        .then((proxima) => {
            concluida = true
            return proxima
        })
    await Promise.resolve()
    igual(concluida, false)
    liberar()
    const proxima = await operacao
    igual(proxima.memorias[1].complementos, [{ id: edicao.idComplemento, conteudo: edicao.texto, primeiraPreservacaoEm: null }])
    igual(proxima.memorias[1].conteudo, inicial.memorias[1].conteudo)
    igual([proxima.alterada, proxima.revisaoOrigem], [true, "X"])
    igual(rascunho.retomar(proxima, true), null)
    igual(abrirEdicao(proxima, "a", 0, agora).idComplemento, edicao.idComplemento)
    await rejeita(() => abrirComplemento(proxima, "a", 0, agora))
    await rejeita(() => abrirComplemento(inicial, "b", 0, agora))
})

Deno.test("complementos: autorização sobrevive ao reload e não reinicia primeira preservação", async () => {
    const inicial = captura()
    inicial.memorias[1].complementos = [{ id: "c", conteudo: "Anterior", primeiraPreservacaoEm: "2026-09-05T12:00:00Z" }]
    const limite = Date.parse("2026-09-08T12:00:00Z")
    const edicao = { ...abrirEdicao(inicial, "a", 300, limite - 1), texto: "Revisado", suja: true }
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
    rascunho.gravar(edicao)
    igual(abrirEdicao(inicial, "a", 0, limite).autorizada, false)
    const proxima = await confirmarComplemento(inicial, rascunho.retomar(inicial, true)!, () => Promise.resolve())
    igual(proxima.memorias[1].complementos[0], { id: "c", conteudo: "Revisado", primeiraPreservacaoEm: "2026-09-05T12:00:00Z" })
    igual(rascunho.retomar(proxima, true), null)
    rascunho.gravar(edicao)
    igual(rascunho.retomar(inicial, false), null)
})

Deno.test("complementos: branco, confirmação idêntica e alvo incompatível não gravam", async () => {
    const inicial = captura()
    inicial.memorias[1].complementos = [{ id: "c", conteudo: "Anterior", primeiraPreservacaoEm: null }]
    const edicao = abrirEdicao(inicial, "a", 0, Date.parse("2026-09-10T12:00:00Z"))
    let gravacoes = 0
    const gravar = () => {
        gravacoes++
        return Promise.resolve()
    }
    igual(await confirmarComplemento(inicial, edicao, gravar), inicial)
    await rejeita(() => confirmarComplemento(inicial, { ...edicao, texto: " \n " }, gravar))
    await rejeita(() => confirmarMemoria(inicial, edicao, gravar))
    const incompativel = structuredClone(inicial)
    incompativel.memorias[1].complementos.push({ id: "outro", conteudo: "Novo último", primeiraPreservacaoEm: null })
    await rejeita(() => confirmarComplemento(incompativel, { ...edicao, texto: "Mudança" }, gravar))
    igual(gravacoes, 0)
})

Deno.test("edição: digitação não grava; confirmação insere ao final com identidade e origem preservadas", async () => {
    const fabrica = new IDBFactory()
    const repositorio = new RepositorioCapturasLocais(new BancoLocal({ fabrica: () => fabrica }))
    const inicial = captura()
    await repositorio.gravar(inicial)
    const edicao = { ...abrirEdicao(inicial, null, 400), texto: " Nova memória ", suja: true }
    igual(await repositorio.obter("a", inicial.dataCaptura), inicial)
    const proxima = await confirmarMemoria(inicial, edicao, (valor) => repositorio.gravar(valor))
    igual(await repositorio.obter("a", inicial.dataCaptura), proxima)
    igual(proxima.memorias.at(-1), {
        id: edicao.idMemoria,
        conteudo: " Nova memória ",
        ordem: 10,
        primeiraPreservacaoEm: null,
        complementos: []
    })
    igual([proxima.alterada, proxima.revisaoOrigem, proxima.idAreaTrabalho], [true, "X", "base"])
    igual(inicial.alterada, false)
    igual(await repositorio.obter("outra", inicial.dataCaptura), undefined)
})

Deno.test("edição: texto branco rejeitado e confirmação idêntica não grava nem cria pendência", async () => {
    const inicial = captura()
    let gravacoes = 0
    const gravar = () => {
        gravacoes++
        return Promise.resolve()
    }
    for (const texto of ["", " \n\t "]) {
        await rejeita(() => confirmarMemoria(inicial, { ...abrirEdicao(inicial, null, 0), texto }, gravar))
    }
    igual(await confirmarMemoria(inicial, abrirEdicao(inicial, "b", 0), gravar), inicial)
    igual(gravacoes, 0)
})

Deno.test("ordem: move uma posição física e respeita extremos sem mutar a base", async () => {
    const inicial = captura()
    let gravacoes = 0
    const gravar = () => {
        gravacoes++
        return Promise.resolve()
    }
    igual(await moverMemoria(inicial, "a", -1, gravar), inicial)
    igual(await moverMemoria(inicial, "b", 1, gravar), inicial)
    igual(gravacoes, 0)
    const proxima = await moverMemoria(inicial, "b", -1, gravar)
    igual(proxima.memorias.map((item) => [item.id, item.ordem]), [["b", 0], ["a", 1]])
    igual(proxima.alterada, true)
    igual(inicial, captura())
    igual((await moverMemoria(proxima, "b", 1, gravar)).memorias.map((item) => item.id), ["a", "b"])
})

Deno.test("falha de gravação: inclusão, edição e ordem rejeitam sem mudar captura ou rascunho", async () => {
    const inicial = captura()
    const falhar = () => Promise.reject(new Error("Falha simulada de commit"))
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
    for (const id of [null, "b"]) {
        const edicao = { ...abrirEdicao(inicial, id, 20), texto: "Texto protegido", suja: true }
        rascunho.gravar(edicao)
        await rejeita(() => confirmarMemoria(inicial, edicao, falhar))
        igual(rascunho.retomar(inicial, true), edicao)
    }
    await rejeita(() => moverMemoria(inicial, "b", -1, falhar))
    igual(inicial, captura())
})

Deno.test("prazo: limite exato, memória nunca preservada e autorização mantida na mesma edição", async () => {
    const inicial = captura()
    const limite = Date.parse("2026-09-04T12:00:00Z")
    const edicao = { ...abrirEdicao(inicial, "a", 70, limite - 1), texto: "Edição autorizada" }
    igual(edicao.autorizada, true)
    igual(abrirEdicao(inicial, "a", 0, limite).autorizada, false)
    igual(abrirEdicao(inicial, "b", 0, limite + 86400000 * 100).autorizada, true)
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
    rascunho.gravar(edicao)
    const restaurada = rascunho.retomar(inicial, true)!
    const proxima = await confirmarMemoria(inicial, restaurada, () => Promise.resolve())
    igual(proxima.memorias.find((item) => item.id === "a")?.primeiraPreservacaoEm, "2026-09-01T12:00:00Z")
    igual(proxima.memorias.find((item) => item.id === "a")?.conteudo, edicao.texto)
})

Deno.test("rascunho: isolamento, abandono e materialização incompatível não restauram edição", () => {
    const inicial = captura()
    const storage = armazenamento()
    const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, storage)
    const edicao = { ...abrirEdicao(inicial, null, 500), texto: "Rascunho", suja: true }
    rascunho.gravar(edicao)
    igual(new RascunhoMemoria("b", inicial.dataCaptura, storage).retomar(inicial, true), null)
    igual(new RascunhoMemoria("a", "2026-09-02", storage).retomar(inicial, true), null)
    igual(rascunho.retomar(inicial, true), edicao)
    rascunho.limpar()
    igual(rascunho.retomar(inicial, true), null)
    rascunho.gravar(edicao)
    igual(rascunho.retomar(inicial, false), null)
    rascunho.gravar(edicao)
    igual(rascunho.retomar({ ...inicial, idAreaTrabalho: "outra" }, true), null)
})

Deno.test("rascunho: commit anterior ao reload não duplica inclusão nem repõe edição obsoleta", async () => {
    for (const id of [null, "b"]) {
        const inicial = captura()
        const edicao = { ...abrirEdicao(inicial, id, 0), texto: "Confirmado" }
        const rascunho = new RascunhoMemoria("a", inicial.dataCaptura, armazenamento())
        rascunho.gravar(edicao)
        const proxima = await confirmarMemoria(inicial, edicao, () => Promise.resolve())
        igual(rascunho.retomar(proxima, true), null)
    }
})
