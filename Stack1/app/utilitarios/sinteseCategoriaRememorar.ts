import type { BlocoProjecaoRememorar } from "../servicos/local/projecaoRememorar.ts"
import type { IntervaloJanela } from "./janelaTemporal.ts"
import { calcularTomMedioCategoria } from "./panoramaRememorar.ts"

export interface SinteseCategoriaRememorar {
    serie: number[]
    tons: (number | null)[]
    tom: number | null
}

/** Deriva as duas sínteses somente dos blocos locais da conta e do intervalo funcional. */
export function derivarSinteseCategoriaRememorar(
    idConta: string,
    idCategoria: string,
    dias: readonly string[],
    intervalo: IntervaloJanela | null,
    blocosPorData: ReadonlyMap<string, readonly BlocoProjecaoRememorar[]>
): SinteseCategoriaRememorar {
    const vazio: SinteseCategoriaRememorar = { serie: [], tons: [], tom: null }
    if (
        !intervalo || !Number.isInteger(intervalo.primeiraPosicao) || !Number.isInteger(intervalo.ultimaPosicao) ||
        intervalo.primeiraPosicao < 0 || intervalo.ultimaPosicao >= dias.length ||
        intervalo.ultimaPosicao - intervalo.primeiraPosicao < 1
    ) return vazio

    const serie: number[] = []
    const tons: (number | null)[] = []
    for (let indice = intervalo.primeiraPosicao; indice <= intervalo.ultimaPosicao; indice++) {
        const data = dias[indice]
        if (!data) continue
        let quantidadeDoDia = 0
        for (const bloco of blocosPorData.get(data) ?? []) {
            if (bloco.idConta !== idConta) continue
            for (const associacao of bloco.categorias) {
                if (associacao.idCategoria !== idCategoria) continue
                quantidadeDoDia += associacao.tons.length
                tons.push(...associacao.tons)
            }
        }
        if (quantidadeDoDia > 0) serie.push(quantidadeDoDia)
    }
    return { serie, tons, tom: calcularTomMedioCategoria(tons) }
}
