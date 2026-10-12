import { aparenciaTom } from "./aparenciaTom.ts"
import { calcularOndaUtilizacaoCategoria, calcularOndaUtilizacaoCategoriaB, calcularTangentesOnda } from "./ondaUtilizacaoCategoria.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

function verificarProximos(obtidos: number[], esperados: number[]) {
    if (obtidos.length !== esperados.length || obtidos.some((valor, indice) => Math.abs(valor - esperados[indice]) > 1e-10)) {
        throw new Error(`Esperado ${JSON.stringify(esperados)}, recebido ${JSON.stringify(obtidos)}`)
    }
}

Deno.test("onda exclui dias sem ocorrência sem alterar a ordem cronológica", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([3, 0, 7, 0, 4]).serie, [3, 7, 4])
})

Deno.test("onda sem dados ocupa quatro posições neutras", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([0]).pontos, [0, 0, 0, 0])
    verificarIgualdade(calcularOndaUtilizacaoCategoria([]).serie, [])
})

Deno.test("um valor existente permanece no centro e é distinto da ausência", () => {
    const resultado = calcularOndaUtilizacaoCategoria([5])
    verificarIgualdade(resultado.serie, [5])
    verificarIgualdade(resultado.valoresAmostrados, [5, 5, 5, 5])
    verificarIgualdade(resultado.pontos, [0, 0, 0, 0])
})

Deno.test("dois valores são expandidos por interpolação linear", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([1, 7]).valoresAmostrados, [1, 3, 5, 7])
    verificarProximos(calcularOndaUtilizacaoCategoria([1, 7]).pontos, [-1, -1 / 3, 1 / 3, 1])
})

Deno.test("dois valores em queda mantêm a ordem recebida", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([7, 1]).valoresAmostrados, [7, 5, 3, 1])
})

Deno.test("três valores são amostrados em posições igualmente distribuídas", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([1, 5, 9]).valoresAmostrados, [1, 11 / 3, 19 / 3, 9])
})

Deno.test("quatro valores são preservados", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([2, 8, 4, 10]).valoresAmostrados, [2, 8, 4, 10])
})

Deno.test("série longa é comprimida por interpolação entre os índices", () => {
    verificarProximos(calcularOndaUtilizacaoCategoria([1, 2, 3, 2, 20, 5, 6, 7, 6, 8, 9, 8, 11, 10, 12, 14, 15]).valoresAmostrados, [
        1,
        16 / 3,
        25 / 3,
        15
    ])
})

Deno.test("normalização usa extremos da série original mesmo quando o pico não é amostrado", () => {
    const resultado = calcularOndaUtilizacaoCategoria([1, 20, 2, 3, 4])
    verificarProximos(resultado.pontos, [-1, 7 / 19, -47 / 57, -13 / 19])
})

Deno.test("série constante fica centralizada", () => {
    verificarIgualdade(calcularOndaUtilizacaoCategoria([4, 4, 4, 4, 4]).pontos, [0, 0, 0, 0])
})

Deno.test("escalas diferentes com a mesma forma produzem os mesmos pontos", () => {
    verificarProximos(
        calcularOndaUtilizacaoCategoria([1, 2, 3, 4]).pontos,
        calcularOndaUtilizacaoCategoria([100, 200, 300, 400]).pontos
    )
})

Deno.test("cenário de referência da planilha mantém a compressão prevista", () => {
    const resultado = calcularOndaUtilizacaoCategoria([1, 2, 3, 2, 20, 5, 6, 7, 6, 8, 9, 8, 11, 10, 12, 14, 15])
    verificarProximos(resultado.valoresAmostrados, [1, 16 / 3, 25 / 3, 15])
})

Deno.test("uma nova sequência vazia não reutiliza os pontos da sequência anterior", () => {
    const anterior = calcularOndaUtilizacaoCategoria([1, 9])
    const atual = calcularOndaUtilizacaoCategoria([])
    verificarProximos(anterior.pontos, [-1, -1 / 3, 1 / 3, 1])
    verificarIgualdade(atual.pontos, [0, 0, 0, 0])
})

Deno.test("aparência compartilhada preserva Tons positivos, negativos, zero e nulo", () => {
    verificarIgualdade(aparenciaTom(65).style["--tom-extremo"], "var(--tom-positivo)")
    verificarIgualdade(aparenciaTom(-65).style["--tom-extremo"], "var(--tom-negativo)")
    verificarIgualdade(aparenciaTom(0).style["--tom-peso"], "0%")
    verificarIgualdade(aparenciaTom(null).style, {})
})

Deno.test("tangentes da curva não criam extremos entre pontos monotônicos", () => {
    const pontos = [-1, -0.4, 0.35, 1]
    const tangentes = calcularTangentesOnda(pontos)
    for (let indice = 0; indice < 3; indice++) {
        const diferenca = pontos[indice + 1] - pontos[indice]
        if (tangentes[indice] < 0 || tangentes[indice + 1] < 0) {
            throw new Error("A curva crescente não pode inverter sua direção")
        }
        if (tangentes[indice] > 3 * diferenca || tangentes[indice + 1] > 3 * diferenca) {
            throw new Error("Os controles da curva devem permanecer entre os extremos do segmento")
        }
    }
})

Deno.test("tangentes zeram nos extremos da oscilação para não acrescentar picos ou vales", () => {
    verificarIgualdade(calcularTangentesOnda([0, 1, -1, 0])[1], 0)
    verificarIgualdade(calcularTangentesOnda([0, 1, -1, 0])[2], 0)
})

Deno.test("CMP-011-B expande dois valores para sete posições igualmente distribuídas", () => {
    const resultado = calcularOndaUtilizacaoCategoriaB([1, 7])
    verificarIgualdade(resultado.valoresAmostrados, [1, 2, 3, 4, 5, 6, 7])
    verificarProximos(resultado.pontos, [-1, -2 / 3, -1 / 3, 0, 1 / 3, 2 / 3, 1])
})

Deno.test("CMP-011-B mantém sete posições neutras sem dados", () => {
    const resultado = calcularOndaUtilizacaoCategoriaB([])
    verificarIgualdade(resultado.valoresAmostrados, [0, 0, 0, 0, 0, 0, 0])
    verificarIgualdade(resultado.pontos, [0, 0, 0, 0, 0, 0, 0])
})

Deno.test("tangentes generalizadas preservam uma série crescente de sete pontos", () => {
    const pontos = [-1, -0.7, -0.2, 0.1, 0.4, 0.8, 1]
    const tangentes = calcularTangentesOnda(pontos)
    if (tangentes.length !== 7 || tangentes.some((tangente) => tangente < 0)) {
        throw new Error("A curva de sete pontos deve permanecer crescente")
    }
    for (let indice = 0; indice < pontos.length - 1; indice++) {
        const diferenca = pontos[indice + 1] - pontos[indice]
        if (tangentes[indice] > 3 * diferenca || tangentes[indice + 1] > 3 * diferenca) {
            throw new Error("Os controles da curva devem permanecer entre os extremos do segmento")
        }
    }
})
