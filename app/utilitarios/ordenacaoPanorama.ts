export type CriterioOrdenacaoPanorama = "representatividade" | "tom"

export interface EstadoOrdenacaoPanorama {
    criterio: CriterioOrdenacaoPanorama
    ordemRepresentatividade: "decrescente" | "crescente"
    ordemTom: "decrescente" | "crescente" | "ausentes-primeiro"
}

export interface CategoriaOrdenavelPanorama {
    nome: string
    representatividade: number
    tom: number | null
}

export const estadoInicialOrdenacaoPanorama: EstadoOrdenacaoPanorama = {
    criterio: "representatividade",
    ordemRepresentatividade: "decrescente",
    ordemTom: "decrescente"
}

export function avancarOrdenacaoPanorama(
    estado: EstadoOrdenacaoPanorama,
    criterio: CriterioOrdenacaoPanorama
): EstadoOrdenacaoPanorama {
    if (criterio === "representatividade") {
        if (estado.criterio !== criterio) return { ...estadoInicialOrdenacaoPanorama, criterio }
        return {
            ...estado,
            ordemRepresentatividade: estado.ordemRepresentatividade === "decrescente" ? "crescente" : "decrescente"
        }
    }
    if (estado.criterio !== criterio) return { ...estadoInicialOrdenacaoPanorama, criterio }
    const ordemTom = estado.ordemTom === "decrescente" ? "crescente" : estado.ordemTom === "crescente" ? "ausentes-primeiro" : "decrescente"
    return { ...estado, ordemTom }
}

function compararNome(a: CategoriaOrdenavelPanorama, b: CategoriaOrdenavelPanorama): number {
    return a.nome.localeCompare(b.nome, "pt-BR", { sensitivity: "base" })
}

function compararRepresentatividade(a: CategoriaOrdenavelPanorama, b: CategoriaOrdenavelPanorama): number {
    return b.representatividade - a.representatividade || compararNome(a, b)
}

function compararTom(a: CategoriaOrdenavelPanorama, b: CategoriaOrdenavelPanorama, crescente: boolean): number {
    if (a.tom === null || b.tom === null) {
        if (a.tom === b.tom) return compararRepresentatividade(a, b)
        return a.tom === null ? 1 : -1
    }
    const diferenca = crescente ? a.tom - b.tom : b.tom - a.tom
    return diferenca || compararRepresentatividade(a, b)
}

export function ordenarCategoriasPanorama<T extends CategoriaOrdenavelPanorama>(
    categorias: readonly T[],
    estado: EstadoOrdenacaoPanorama
): T[] {
    const ordenadas = [...categorias]
    if (estado.criterio === "representatividade") {
        return ordenadas.sort((a, b) =>
            estado.ordemRepresentatividade === "decrescente"
                ? compararRepresentatividade(a, b)
                : a.representatividade - b.representatividade || compararNome(a, b)
        )
    }
    if (estado.ordemTom === "ausentes-primeiro") {
        return ordenadas.sort((a, b) => {
            if (a.tom === null || b.tom === null) {
                if (a.tom !== b.tom) return a.tom === null ? -1 : 1
            }
            return compararRepresentatividade(a, b)
        })
    }
    return ordenadas.sort((a, b) => compararTom(a, b, estado.ordemTom === "crescente"))
}
