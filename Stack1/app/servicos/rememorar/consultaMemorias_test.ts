import { criarServicoConsultaMemoriasRememorar } from "./consultaMemorias.ts"

const consulta = criarServicoConsultaMemoriasRememorar(() => 300)

Deno.test("Consulta de memórias: filtra período inclusivo e devolve sequência ordenada", async () => {
    const lote = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2025-09-24",
        ultimoDia: "2025-10-01",
        offset: 0
    })
    if (lote.total !== 30 || lote.memorias.length !== 30 || lote.proximoOffset !== null) {
        throw new Error(`Recorte de 30 memórias incorreto: ${lote.total}/${lote.memorias.length}`)
    }
    const ids = new Set(lote.memorias.map((memoria) => memoria.id))
    if (ids.size !== lote.memorias.length) throw new Error("A consulta repetiu IDs de memória")
    for (let indice = 1; indice < lote.memorias.length; indice++) {
        const anterior = lote.memorias[indice - 1]
        const atual = lote.memorias[indice]
        if (
            anterior.data > atual.data ||
            anterior.data === atual.data && (anterior.ordem > atual.ordem || anterior.ordem === atual.ordem && anterior.id > atual.id)
        ) throw new Error("A consulta não respeitou a ordenação cronológica determinística")
    }
})

Deno.test("Consulta de memórias: pagina 853 registros e termina com 13", async () => {
    const base = {
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2024-05-21",
        ultimoDia: "2026-12-31"
    }
    const memorias: Awaited<ReturnType<typeof consulta.consultar>>["memorias"] = []
    let offset: number | null = 0
    let lotes = 0
    while (offset !== null) {
        const lote = await consulta.consultar({ ...base, offset })
        if (lote.total !== 853) throw new Error("O total da categoria-01 mudou durante a paginação")
        memorias.push(...lote.memorias)
        lotes++
        if (lote.proximoOffset === null && lote.memorias.length !== 13) {
            throw new Error("O lote terminal da categoria-01 não contém 13 registros")
        }
        if (lote.proximoOffset !== null && lote.memorias.length !== 30) {
            throw new Error("Um lote intermediário não contém 30 registros")
        }
        offset = lote.proximoOffset
    }
    const ids = new Set(memorias.map((memoria) => memoria.id))
    if (lotes !== 29 || memorias.length !== 853 || ids.size !== 853) {
        throw new Error("A paginação não percorreu os 29 lotes sem duplicar registros")
    }
})

Deno.test("Consulta de memórias: mantém categorias múltiplas e dados integrais", async () => {
    const lote = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2025-01-01",
        ultimoDia: "2026-12-31",
        offset: 0
    })
    const memoriaComMultiplasCategorias = lote.memorias.find((memoria) => memoria.categorias.length > 1)
    if (!memoriaComMultiplasCategorias || !memoriaComMultiplasCategorias.conteudo || memoriaComMultiplasCategorias.ordem < 1) {
        throw new Error("O lote não preservou os campos integrais esperados")
    }
    if (!Array.isArray(memoriaComMultiplasCategorias.complementos) || memoriaComMultiplasCategorias.complementos.length > 3) {
        throw new Error("Complementos integrais não foram preservados")
    }
})

Deno.test("Consulta de memórias: recorte vazio informa total zero", async () => {
    const lote = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-02",
        primeiroDia: "2025-10-07",
        ultimoDia: "2025-10-09",
        offset: 0
    })
    if (lote.total !== 0 || lote.memorias.length !== 0 || lote.proximoOffset !== null) {
        throw new Error("O recorte sem memórias deve terminar vazio")
    }
})

Deno.test("Consulta de memórias: recortes de 31 e 91 registros", async () => {
    const sete = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2024-05-21",
        ultimoDia: "2024-05-31",
        offset: 0
    })
    const trintaEUm = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2025-05-05",
        ultimoDia: "2025-05-13",
        offset: 0
    })
    const noventaEUm = await consulta.consultar({
        idConta: "conta-a",
        idCategoria: "categoria-01",
        primeiroDia: "2025-06-03",
        ultimoDia: "2025-07-03",
        offset: 0
    })
    if (sete.total !== 7 || trintaEUm.total !== 31 || noventaEUm.total !== 91) {
        throw new Error(`Recortes incorretos: ${sete.total}, ${trintaEUm.total} e ${noventaEUm.total}`)
    }
})
