export interface OndaUtilizacaoCategoria {
    serie: number[]
    valoresAmostrados: number[]
    pontos: number[]
}

function calcularOndaComQuantidadeDePontos(quantidades: readonly number[], quantidadeDePontos: number): OndaUtilizacaoCategoria {
    if (!Number.isInteger(quantidadeDePontos) || quantidadeDePontos < 2) {
        throw new Error("A onda deve possuir pelo menos dois pontos")
    }

    const serie = quantidades.filter((quantidade) => Number.isFinite(quantidade) && quantidade > 0)
    if (serie.length === 0) {
        const neutros = Array.from({ length: quantidadeDePontos }, () => 0)
        return { serie, valoresAmostrados: neutros, pontos: neutros }
    }

    const minimo = Math.min(...serie)
    const maximo = Math.max(...serie)
    const valoresAmostrados = Array.from({ length: quantidadeDePontos }, (_, indice) => {
        if (serie.length === 1) return serie[0]
        const posicao = indice * (serie.length - 1) / (quantidadeDePontos - 1)
        const anterior = Math.floor(posicao)
        const fracao = posicao - anterior
        return serie[anterior] + (serie[Math.min(anterior + 1, serie.length - 1)] - serie[anterior]) * fracao
    })

    const amplitude = maximo - minimo
    const pontos = amplitude === 0
        ? Array.from({ length: quantidadeDePontos }, () => 0)
        : valoresAmostrados.map((valor) => (valor - (minimo + maximo) / 2) / (amplitude / 2))

    return { serie, valoresAmostrados, pontos }
}

export function calcularOndaUtilizacaoCategoria(quantidades: readonly number[]): OndaUtilizacaoCategoria {
    return calcularOndaComQuantidadeDePontos(quantidades, 4)
}

export function calcularOndaUtilizacaoCategoriaB(quantidades: readonly number[]): OndaUtilizacaoCategoria {
    return calcularOndaComQuantidadeDePontos(quantidades, 7)
}

export function calcularTangentesOnda(pontos: readonly number[]): number[] {
    if (pontos.length < 2) throw new Error("A curva da onda deve possuir pelo menos dois pontos")

    const diferencas = pontos.slice(0, -1).map((ponto, indice) => pontos[indice + 1] - ponto)
    if (diferencas.length === 1) return [diferencas[0], diferencas[0]]
    const tangentes = Array.from({ length: pontos.length }, () => 0)

    function tangenteExtrema(diferencaProxima: number, diferencaSeguinte: number): number {
        let tangente = (3 * diferencaProxima - diferencaSeguinte) / 2
        if (tangente * diferencaProxima <= 0) return 0
        if (diferencaProxima * diferencaSeguinte < 0 && Math.abs(tangente) > 3 * Math.abs(diferencaProxima)) {
            tangente = 3 * diferencaProxima
        }
        return tangente
    }

    const ultimo = diferencas.length - 1
    tangentes[0] = tangenteExtrema(diferencas[0], diferencas[1])
    tangentes[pontos.length - 1] = tangenteExtrema(diferencas[ultimo], diferencas[ultimo - 1])

    for (let indice = 1; indice < pontos.length - 1; indice++) {
        const anterior = diferencas[indice - 1]
        const seguinte = diferencas[indice]
        if (anterior * seguinte > 0) tangentes[indice] = 2 * anterior * seguinte / (anterior + seguinte)
    }

    return tangentes
}
