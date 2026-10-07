import type { CatalogoCategorias } from "../servicos/local/catalogoCategorias.ts"
import type { BlocoProjecaoRememorar } from "../servicos/local/projecaoRememorar.ts"

export interface CategoriaPanoramaDerivada {
    identificador: string
    nome: string
    quantidade: number
    quantidadeTons: number
    representatividade: number
    tom: number | null
}

/** Calcula a média global ponderando cada categoria pela quantidade de Tons definidos. */
export function calcularTomMedioPanorama(categorias: readonly CategoriaPanoramaDerivada[]): number | null {
    const quantidade = categorias.reduce((total, categoria) => total + categoria.quantidadeTons, 0)
    if (quantidade === 0) return null
    return categorias.reduce(
        (total, categoria) => total + (categoria.tom ?? 0) * categoria.quantidadeTons,
        0
    ) / quantidade
}

/** Calcula a média simples dos Tons definidos da categoria no período exibido. */
export function calcularTomMedioCategoria(tons: readonly (number | null)[]): number | null {
    let soma = 0
    let quantidade = 0
    for (const tom of tons) {
        if (tom === null) continue
        soma += tom
        quantidade++
    }
    return quantidade === 0 ? null : soma / quantidade
}

/** Deriva o primeiro nível do Panorama somente dos blocos incluídos no intervalo válido. */
export function derivarPanoramaRememorar(
    dias: readonly string[],
    primeiraPosicao: number,
    ultimaPosicao: number,
    blocos: readonly BlocoProjecaoRememorar[],
    catalogo: CatalogoCategorias,
    blocosPorData?: ReadonlyMap<string, readonly BlocoProjecaoRememorar[]>
): CategoriaPanoramaDerivada[] {
    if (
        !Number.isInteger(primeiraPosicao) || !Number.isInteger(ultimaPosicao) ||
        primeiraPosicao < 0 || ultimaPosicao >= dias.length || ultimaPosicao - primeiraPosicao < 1
    ) return []

    const acumulados = new Map<string, { quantidade: number; somaTons: number; quantidadeTons: number }>()
    const acumularBloco = (bloco: BlocoProjecaoRememorar) => {
        for (const categoria of bloco.categorias) {
            const acumulado = acumulados.get(categoria.idCategoria) ?? { quantidade: 0, somaTons: 0, quantidadeTons: 0 }
            acumulado.quantidade += categoria.tons.length
            for (const tom of categoria.tons) {
                if (tom === null) continue
                acumulado.somaTons += tom
                acumulado.quantidadeTons++
            }
            acumulados.set(categoria.idCategoria, acumulado)
        }
    }
    if (blocosPorData) {
        for (let indice = primeiraPosicao; indice <= ultimaPosicao; indice++) {
            const data = dias[indice]
            for (const bloco of blocosPorData.get(data) ?? []) acumularBloco(bloco)
        }
    } else {
        const datasSelecionadas = new Set(dias.slice(primeiraPosicao, ultimaPosicao + 1))
        for (const bloco of blocos) {
            if (datasSelecionadas.has(bloco.data)) acumularBloco(bloco)
        }
    }

    const porId = new Map(catalogo.categorias.map((categoria) => [categoria.id, categoria]))
    const maiorQuantidade = Math.max(0, ...[...acumulados.values()].map(({ quantidade }) => quantidade))
    if (maiorQuantidade === 0) return []
    return [...acumulados.entries()].flatMap(([identificador, acumulado]) => {
        const categoria = porId.get(identificador)
        if (!categoria || acumulado.quantidade === 0) return []
        return [{
            identificador,
            nome: categoria.nome,
            quantidade: acumulado.quantidade,
            quantidadeTons: acumulado.quantidadeTons,
            representatividade: Math.sqrt(acumulado.quantidade / maiorQuantidade),
            tom: acumulado.quantidadeTons === 0 ? null : acumulado.somaTons / acumulado.quantidadeTons
        }]
    }).sort((a, b) => b.quantidade - a.quantidade || (a.identificador < b.identificador ? -1 : a.identificador > b.identificador ? 1 : 0))
}
