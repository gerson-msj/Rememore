import { type CatalogoCategorias, catalogosCategorias } from "./local/catalogoCategorias.ts"
import type { DeltaCatalogo, ServicoCatalogoCategorias } from "./categorias/contratos.ts"
import { catalogoSimulado } from "./categorias/simulado.ts"

export function aplicarDeltaCatalogo(idConta: string, anterior: CatalogoCategorias | undefined, delta: DeltaCatalogo): CatalogoCategorias {
    if (!delta.revisao.trim()) throw new Error("Revisão de catálogo inválida")
    const categorias = new Map(anterior?.categorias.map((item) => [item.id, item]))
    for (const item of delta.alteracoes) {
        if (!item.id || !item.nome.trim() || !Number.isSafeInteger(item.versao) || item.versao < 1 || typeof item.ativa !== "boolean") {
            throw new Error("Categoria preservada inválida")
        }
        const existente = categorias.get(item.id)
        if (!existente || item.versao > existente.versao) categorias.set(item.id, { ...item })
    }
    return { idConta, revisao: delta.revisao, categorias: [...categorias.values()] }
}

export async function sincronizarCatalogo(
    idConta: string,
    repositorio: Pick<typeof catalogosCategorias, "obter" | "gravar"> = catalogosCategorias,
    remoto: ServicoCatalogoCategorias = catalogoSimulado
) {
    const anterior = await repositorio.obter(idConta)
    const delta = await remoto.consultar(idConta, anterior?.revisao ?? null)
    if (anterior && delta.revisao === anterior.revisao && delta.alteracoes.length === 0) return anterior
    const atualizado = aplicarDeltaCatalogo(idConta, anterior, delta)
    await repositorio.gravar(atualizado)
    return atualizado
}

/** Capturas diferentes podem abrir em paralelo; serializa apenas a revisão compartilhada da conta. */
export async function prepararCatalogo(idConta: string): Promise<{ catalogo?: CatalogoCategorias; falhou: boolean }> {
    try {
        const catalogo = await navigator.locks.request(`rememore:catalogo-categorias:${idConta}`, () => sincronizarCatalogo(idConta))
        return { catalogo, falhou: false }
    } catch {
        try {
            return { catalogo: await catalogosCategorias.obter(idConta), falhou: true }
        } catch {
            return { falhou: true }
        }
    }
}
