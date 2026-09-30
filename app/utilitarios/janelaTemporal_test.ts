import {
    avaliarPosicoesJanela,
    criarIntervaloJanela,
    deslocarIntervaloJanela,
    limitarPosicaoAlca,
    moverAlcaSemCruzamento,
    posicaoDiscreta,
    posicaoDivisoria,
    restaurarEstadoJanela,
    restaurarPosicoesJanela
} from "./janelaTemporal.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

const dias = ["2025-01-01", "2025-01-02", "2025-01-20", "2025-02-15", "2025-06-02"]

Deno.test("janela temporal: posição contínua vira uma das posições dos dias, sem interpolar lacunas do calendário", () => {
    igual(posicaoDiscreta(0, dias.length), 0)
    igual(posicaoDiscreta(0.5, dias.length), 2)
    igual(posicaoDiscreta(1, dias.length), 4)
    igual(criarIntervaloJanela(dias, 1, 3)?.quantidadeDias, 3)
    igual(criarIntervaloJanela(dias, 1, 3)?.primeiroDia, "2025-01-02")
    igual(criarIntervaloJanela(dias, 1, 3)?.ultimoDia, "2025-02-15")
})

Deno.test("janela temporal: divisórias ficam nos limites entre as regiões discretas", () => {
    igual(posicaoDivisoria(0, 2), 0.5)
    igual([0, 1, 2, 3].map((indice) => posicaoDivisoria(indice, 5)), [0.125, 0.375, 0.625, 0.875])
    igual(posicaoDivisoria(4, 5), null)
    igual(posicaoDivisoria(0, 1), null)
})

Deno.test("janela temporal: exige pelo menos duas posições discretas distintas", () => {
    igual(criarIntervaloJanela(dias, 2, 2), null)
    igual(criarIntervaloJanela(dias, 2, 3)?.quantidadeDias, 2)
    igual(criarIntervaloJanela(["2025-01-01"], 0, 0), null)
})

Deno.test("janela temporal: configuração inválida preserva o último intervalo publicado", () => {
    const anterior = criarIntervaloJanela(dias, 1, 3)!
    const avaliacao = avaliarPosicoesJanela(dias, { esquerda: 0.51, direita: 0.55 }, anterior)
    igual(avaliacao.valido, false)
    igual(avaliacao.intervaloAtual, null)
    igual(avaliacao.intervaloPublicado, anterior)
})

Deno.test("janela temporal: sair da configuração inválida publica o novo intervalo", () => {
    const anterior = criarIntervaloJanela(dias, 1, 3)!
    const avaliacao = avaliarPosicoesJanela(dias, { esquerda: 0.51, direita: 0.99 }, anterior)
    igual(avaliacao.valido, true)
    igual(avaliacao.intervaloPublicado?.primeiroDia, "2025-01-20")
    igual(avaliacao.intervaloPublicado?.ultimoDia, "2025-06-02")
})

Deno.test("janela temporal: limites contínuos não deixam as alças atravessarem", () => {
    igual(limitarPosicaoAlca(0.8, 0.4, "esquerda"), 0.4)
    igual(limitarPosicaoAlca(0.2, 0.4, "direita"), 0.4)
    igual(moverAlcaSemCruzamento({ esquerda: 0.25, direita: 0.75 }, "esquerda", 0.9), { esquerda: 0.75, direita: 0.75 })
    igual(moverAlcaSemCruzamento({ esquerda: 0.25, direita: 0.75 }, "direita", 0.1), { esquerda: 0.25, direita: 0.25 })
})

Deno.test("janela temporal: dois dias permitem somente o intervalo completo", () => {
    const conjunto = ["2025-01-01", "2025-06-02"]
    const inicial = criarIntervaloJanela(conjunto, 0, 1)!
    const invalida = avaliarPosicoesJanela(conjunto, { esquerda: 0.1, direita: 0.4 }, inicial)
    igual(invalida.valido, false)
    igual(invalida.intervaloPublicado?.quantidadeDias, 2)
    igual(avaliarPosicoesJanela(conjunto, { esquerda: 0.1, direita: 0.9 }, inicial).intervaloPublicado, inicial)
})

Deno.test("janela temporal: deslocamento preserva a extensão e respeita as extremidades", () => {
    const intervalo = criarIntervaloJanela(dias, 1, 3)!
    const avancado = deslocarIntervaloJanela(dias, intervalo, 20)!
    igual([avancado.primeiraPosicao, avancado.ultimaPosicao, avancado.quantidadeDias], [2, 4, 3])
    const recuado = deslocarIntervaloJanela(dias, intervalo, -20)!
    igual([recuado.primeiraPosicao, recuado.ultimaPosicao, recuado.quantidadeDias], [0, 2, 3])
})

Deno.test("janela temporal: restauração aceita somente posições normalizadas ordenadas", () => {
    igual(restaurarPosicoesJanela({ esquerda: 0.2, direita: 0.8 }), { esquerda: 0.2, direita: 0.8 })
    igual(restaurarPosicoesJanela({ esquerda: 0.9, direita: 0.1 }), null)
    igual(restaurarPosicoesJanela({ esquerda: -0.1, direita: 1 }), null)
    igual(restaurarPosicoesJanela(null), null)
})

Deno.test("janela temporal: restaura o último intervalo válido junto da geometria inválida", () => {
    const intervaloValido = criarIntervaloJanela(dias, 1, 3)!
    const estado = { posicoes: { esquerda: 0.51, direita: 0.55 }, intervaloValido }
    igual(restaurarEstadoJanela(estado, dias), estado)
    igual(restaurarEstadoJanela(estado, ["2025-01-01", "2025-02-01"]), null)
    igual(restaurarEstadoJanela({ ...estado, posicoes: { esquerda: 0.1, direita: 0.9 } }, dias), null)
})

Deno.test("janela temporal: resolução da geometria não participa da seleção semântica", () => {
    const posicao = 0.375
    const resultado = [320, 800, 1440].map(() => posicaoDiscreta(posicao, dias.length))
    igual(resultado, [2, 2, 2])
    igual(
        avaliarPosicoesJanela(dias, { esquerda: 0.1, direita: 0.9 }, criarIntervaloJanela(dias, 0, 4)!).intervaloPublicado,
        criarIntervaloJanela(dias, 0, 4)
    )
})

Deno.test("janela temporal: conjuntos pequenos e grandes mantêm posições dentro do universo", () => {
    for (const quantidade of [2, 3, 5, 100]) {
        const conjunto = Array.from({ length: quantidade }, (_, indice) => {
            const data = new Date("2025-01-01T00:00:00Z")
            data.setUTCDate(data.getUTCDate() + indice)
            return data.toISOString().slice(0, 10)
        })
        const intervalo = criarIntervaloJanela(conjunto, 0, quantidade - 1)
        igual(intervalo?.quantidadeDias, quantidade)
        igual(posicaoDiscreta(0.5, quantidade) < quantidade, true)
    }
})
