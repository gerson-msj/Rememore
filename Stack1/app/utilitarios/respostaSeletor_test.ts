import { avancarSeletor, RESPOSTA_JANELA_PADRAO, RESPOSTA_TOM_PADRAO, type RespostaSeletor } from "./respostaSeletor.ts"

function simularAproximacao(resposta: RespostaSeletor, quadros: number) {
    let valor = 0
    let velocidade = 0
    for (let quadro = 0; quadro < quadros; quadro++) {
        const avancamento = avancarSeletor(valor, 1, velocidade, 1 / 60, resposta)
        valor = avancamento.valor
        velocidade = avancamento.velocidade
        if (avancamento.concluido) break
    }
    return valor
}

Deno.test("seletores: janela e Tom começam com atraso de 1000 ms e desaceleração", () => {
    if (RESPOSTA_JANELA_PADRAO.atrasoMs !== 1000 || RESPOSTA_JANELA_PADRAO.curva !== "ease-out") {
        throw new Error("Padrão inesperado para a janela temporal")
    }
    if (RESPOSTA_TOM_PADRAO.atrasoMs !== 1000 || RESPOSTA_TOM_PADRAO.curva !== "ease-out") {
        throw new Error("Padrão inesperado para a escala de Tom")
    }
})

Deno.test("seletores: atraso zero alcança o destino imediatamente", () => {
    const resultado = avancarSeletor(0, 1, 0, 1 / 60, { atrasoMs: 0, curva: "ease-out" })
    if (resultado.valor !== 1 || !resultado.concluido) throw new Error("Atraso zero não foi imediato")
})

Deno.test("seletores: a mesma curva responde mais lentamente ao atraso maior", () => {
    const progresso500 = simularAproximacao({ atrasoMs: 500, curva: "ease-out" }, 6)
    const progresso1000 = simularAproximacao({ atrasoMs: 1000, curva: "ease-out" }, 6)
    if (!(progresso500 > progresso1000)) throw new Error("Atrasos diferentes produziram a mesma resposta")
})

Deno.test("seletores: ease-out conclui próximo do atraso configurado a 60 quadros por segundo", () => {
    const progresso = simularAproximacao(RESPOSTA_JANELA_PADRAO, 63)
    if (progresso < 0.999) throw new Error(`Aproximação insuficiente após 1050 ms: ${progresso}`)
})
