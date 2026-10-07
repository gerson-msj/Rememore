import type { CategoriaPanoramaDerivada } from "./panoramaRememorar.ts"

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

export type OrdenacaoPanorama =
    | { criterio: "representatividade"; direcao: "decrescente" | "crescente" }
    | { criterio: "tom"; direcao: "positivo" | "negativo" | "ausentePrimeiro" }

export const ORDENACAO_PANORAMA_PADRAO: OrdenacaoPanorama = {
    criterio: "representatividade",
    direcao: "decrescente"
}

const CHAVE_ORDENACAO = "rememore:rememorar:ordenacao:v1:"

export function avancarOrdenacaoPanorama(estado: EstadoOrdenacaoPanorama, criterio: CriterioOrdenacaoPanorama): EstadoOrdenacaoPanorama
export function avancarOrdenacaoPanorama(estado: OrdenacaoPanorama, criterio: OrdenacaoPanorama["criterio"]): OrdenacaoPanorama
export function avancarOrdenacaoPanorama(
    estado: EstadoOrdenacaoPanorama | OrdenacaoPanorama,
    criterio: CriterioOrdenacaoPanorama
): EstadoOrdenacaoPanorama | OrdenacaoPanorama {
    if (!("ordemRepresentatividade" in estado)) return avancarOrdenacaoPersistente(estado, criterio)
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

function avancarOrdenacaoPersistente(atual: OrdenacaoPanorama, criterio: OrdenacaoPanorama["criterio"]): OrdenacaoPanorama {
    if (atual.criterio !== criterio) {
        return criterio === "representatividade" ? { criterio, direcao: "decrescente" } : { criterio, direcao: "positivo" }
    }
    if (criterio === "representatividade") {
        return {
            criterio,
            direcao: atual.direcao === "decrescente" ? "crescente" : "decrescente"
        }
    }
    return {
        criterio,
        direcao: atual.direcao === "positivo" ? "negativo" : atual.direcao === "negativo" ? "ausentePrimeiro" : "positivo"
    }
}

export function ordenarCategoriasPanorama<T extends CategoriaOrdenavelPanorama>(
    categorias: readonly T[],
    ordenacao: EstadoOrdenacaoPanorama
): T[]
export function ordenarCategoriasPanorama(
    categorias: readonly CategoriaPanoramaDerivada[],
    ordenacao: OrdenacaoPanorama
): CategoriaPanoramaDerivada[]
export function ordenarCategoriasPanorama(
    categorias: readonly CategoriaOrdenavelPanorama[],
    ordenacao: EstadoOrdenacaoPanorama | OrdenacaoPanorama
): CategoriaOrdenavelPanorama[] {
    if ("ordemRepresentatividade" in ordenacao) {
        const ordenadas = [...categorias]
        if (ordenacao.criterio === "representatividade") {
            return ordenadas.sort((a, b) =>
                ordenacao.ordemRepresentatividade === "decrescente"
                    ? compararRepresentatividade(a, b)
                    : a.representatividade - b.representatividade || compararNome(a.nome, b.nome)
            )
        }
        if (ordenacao.ordemTom === "ausentes-primeiro") {
            return ordenadas.sort((a, b) => {
                if ((a.tom === null || b.tom === null) && a.tom !== b.tom) return a.tom === null ? -1 : 1
                return compararRepresentatividade(a, b)
            })
        }
        return ordenadas.sort((a, b) => compararTom(a, b, ordenacao.ordemTom === "crescente"))
    }
    return [...categorias].sort((a, b) => {
        if (ordenacao.criterio === "representatividade") {
            const diferenca = ordenacao.direcao === "decrescente"
                ? b.representatividade - a.representatividade
                : a.representatividade - b.representatividade
            return diferenca || compararNome(a.nome, b.nome)
        }

        const semTomA = a.tom === null
        const semTomB = b.tom === null
        if (semTomA !== semTomB) {
            if (ordenacao.direcao === "ausentePrimeiro") return semTomA ? -1 : 1
            return semTomA ? 1 : -1
        }
        if (!semTomA && !semTomB && ordenacao.direcao !== "ausentePrimeiro") {
            const diferenca = ordenacao.direcao === "positivo" ? b.tom! - a.tom! : a.tom! - b.tom!
            if (diferenca) return diferenca
        }
        return b.representatividade - a.representatividade || compararNome(a.nome, b.nome)
    })
}

export function lerOrdenacaoPanorama(idConta: string, armazenamento: Storage | null = obterArmazenamento()): OrdenacaoPanorama {
    if (!armazenamento) return ORDENACAO_PANORAMA_PADRAO
    try {
        const valor = JSON.parse(armazenamento.getItem(chaveConta(idConta)) ?? "null") as unknown
        if (!valor || typeof valor !== "object") return ORDENACAO_PANORAMA_PADRAO
        const { criterio, direcao } = valor as Record<string, unknown>
        if (criterio === "representatividade" && (direcao === "decrescente" || direcao === "crescente")) {
            return { criterio, direcao }
        }
        if (criterio === "tom" && (direcao === "positivo" || direcao === "negativo" || direcao === "ausentePrimeiro")) {
            return { criterio, direcao }
        }
    } catch {
        // Uma preferência inválida ou indisponível começa no estado padrão.
    }
    return ORDENACAO_PANORAMA_PADRAO
}

export function salvarOrdenacaoPanorama(
    idConta: string,
    ordenacao: OrdenacaoPanorama,
    armazenamento: Storage | null = obterArmazenamento()
): void {
    if (!armazenamento) return
    try {
        armazenamento.setItem(chaveConta(idConta), JSON.stringify(ordenacao))
    } catch {
        // A preferência continua ativa nesta sessão se o armazenamento estiver indisponível.
    }
}

function compararNome(a: string, b: string): number {
    return a.localeCompare(b, "pt-BR", { sensitivity: "base" })
}

function compararRepresentatividade(a: CategoriaOrdenavelPanorama, b: CategoriaOrdenavelPanorama): number {
    return b.representatividade - a.representatividade || compararNome(a.nome, b.nome)
}

function compararTom(a: CategoriaOrdenavelPanorama, b: CategoriaOrdenavelPanorama, crescente: boolean): number {
    if (a.tom === null || b.tom === null) {
        if (a.tom === b.tom) return compararRepresentatividade(a, b)
        return a.tom === null ? 1 : -1
    }
    const diferenca = crescente ? a.tom - b.tom : b.tom - a.tom
    return diferenca || compararRepresentatividade(a, b)
}

function chaveConta(idConta: string): string {
    return `${CHAVE_ORDENACAO}${encodeURIComponent(idConta)}`
}

function obterArmazenamento(): Storage | null {
    try {
        return typeof localStorage === "undefined" ? null : localStorage
    } catch {
        return null
    }
}
