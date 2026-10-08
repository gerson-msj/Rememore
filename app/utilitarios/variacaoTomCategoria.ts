export interface VariacaoTomCategoria {
    mediaNegativa: number | null
    mediaPositiva: number | null
    possuiTomDefinido: boolean
    quantidadeDefinida: number
    extensaoNegativa: number
    extensaoPositiva: number
}

export function calcularVariacaoTomCategoria(tons: readonly (number | null)[]): VariacaoTomCategoria {
    const definidos = tons.filter((tom): tom is number => tom !== null)
    const negativos = definidos.filter((tom) => tom < 0)
    const positivos = definidos.filter((tom) => tom > 0)
    const media = (valores: readonly number[]) =>
        valores.length === 0 ? null : valores.reduce((soma, valor) => soma + valor, 0) / valores.length
    const mediaNegativa = media(negativos)
    const mediaPositiva = media(positivos)

    return {
        mediaNegativa,
        mediaPositiva,
        possuiTomDefinido: definidos.length > 0,
        quantidadeDefinida: definidos.length,
        extensaoNegativa: Math.abs(mediaNegativa ?? 0) / 2,
        extensaoPositiva: (mediaPositiva ?? 0) / 2
    }
}
