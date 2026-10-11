import { transformarTomVisual } from "./curvaTom.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

function verificarProximo(obtido: number | null, esperado: number) {
    if (obtido === null || Math.abs(obtido - esperado) > 1e-10) {
        throw new Error(`Esperado aproximadamente ${esperado}, recebido ${obtido}`)
    }
}

Deno.test("curva experimental preserva zero e extremo", () => {
    verificarIgualdade(transformarTomVisual(0, 20, 50), 0)
    verificarIgualdade(transformarTomVisual(100, 20, 50), 100)
})

Deno.test("limiar produz exatamente a intensidade configurada", () => {
    verificarIgualdade(transformarTomVisual(20, 20, 50), 50)
})

Deno.test("curva é simétrica para Tons positivos e negativos", () => {
    const positivo = transformarTomVisual(37, 20, 50)
    const negativo = transformarTomVisual(-37, 20, 50)
    verificarProximo(positivo, 60.625)
    verificarProximo(negativo, -60.625)
})

Deno.test("Tom nulo permanece fora da escala", () => {
    verificarIgualdade(transformarTomVisual(null, 20, 50), null)
})

Deno.test("a curva mantém a intensidade dentro de zero e cem", () => {
    verificarIgualdade(transformarTomVisual(10, 20, 0), 0)
    verificarIgualdade(transformarTomVisual(-10, 20, 100), -50)
})
