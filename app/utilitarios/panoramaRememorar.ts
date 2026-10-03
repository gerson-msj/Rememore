import type { CatalogoCategorias } from "../servicos/local/catalogoCategorias.ts"
import type { BlocoProjecaoRememorar } from "../servicos/local/projecaoRememorar.ts"

export interface CategoriaPanoramaDerivada {
    identificador: string
    nome: string
    quantidade: number
    representatividade: number
    tom: number | null
}

/** Deriva o primeiro nível do Panorama somente dos blocos incluídos no intervalo válido. */
export function derivarPanoramaRememorar(
    dias: readonly string[],
    primeiraPosicao: number,
    ultimaPosicao: number,
    blocos: readonly BlocoProjecaoRememorar[],
    catalogo: CatalogoCategorias
): CategoriaPanoramaDerivada[] {
    if (
        !Number.isInteger(primeiraPosicao) || !Number.isInteger(ultimaPosicao) ||
        primeiraPosicao < 0 || ultimaPosicao >= dias.length || ultimaPosicao - primeiraPosicao < 1
    ) return []

    const datasSelecionadas = new Set(dias.slice(primeiraPosicao, ultimaPosicao + 1))
    const acumulados = new Map<string, { quantidade: number; somaTons: number; quantidadeTons: number }>()
    for (const bloco of blocos) {
        if (!datasSelecionadas.has(bloco.data)) continue
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
            representatividade: Math.sqrt(acumulado.quantidade / maiorQuantidade),
            tom: acumulado.quantidadeTons === 0 ? null : acumulado.somaTons / acumulado.quantidadeTons
        }]
    }).sort((a, b) => b.quantidade - a.quantidade || (a.identificador < b.identificador ? -1 : a.identificador > b.identificador ? 1 : 0))
}
