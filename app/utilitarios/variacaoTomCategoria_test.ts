import { calcularVariacaoTomCategoria } from "./variacaoTomCategoria.ts"

function verificar(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

function verificarProximo(obtido: number | null, esperado: number | null) {
    if (obtido === null || esperado === null ? obtido !== esperado : Math.abs(obtido - esperado) > 1e-10) {
        throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
    }
}

Deno.test("calcula médias polares independentes e projeção em cada metade", () => {
    const resultado = calcularVariacaoTomCategoria([-80, -20, 20, 60])
    verificarProximo(resultado.mediaNegativa, -50)
    verificarProximo(resultado.mediaPositiva, 40)
    verificar(resultado.extensaoNegativa, 25)
    verificar(resultado.extensaoPositiva, 20)
})

Deno.test("ignora nulos e zero nas médias laterais, reconhecendo zero como definido", () => {
    const resultado = calcularVariacaoTomCategoria([-40, 0, 60, null])
    verificarProximo(resultado.mediaNegativa, -40)
    verificarProximo(resultado.mediaPositiva, 60)
    verificar(resultado.possuiTomDefinido, true)
    verificar(resultado.quantidadeDefinida, 3)
})

Deno.test("zero isolado é definido e não cria extensões", () => {
    verificar(calcularVariacaoTomCategoria([0]), {
        mediaNegativa: null,
        mediaPositiva: null,
        possuiTomDefinido: true,
        quantidadeDefinida: 1,
        extensaoNegativa: 0,
        extensaoPositiva: 0
    })
})

Deno.test("conjunto vazio ou somente nulos representa ausência", () => {
    for (const tons of [[], [null, null]]) {
        const resultado = calcularVariacaoTomCategoria(tons)
        verificar(resultado.possuiTomDefinido, false)
        verificar(resultado.mediaNegativa, null)
        verificar(resultado.mediaPositiva, null)
        verificar(resultado.extensaoNegativa, 0)
        verificar(resultado.extensaoPositiva, 0)
    }
})

Deno.test("polaridades isoladas e extremos mantêm a escala fixa", () => {
    verificar(calcularVariacaoTomCategoria([-100]).extensaoNegativa, 50)
    verificar(calcularVariacaoTomCategoria([100]).extensaoPositiva, 50)
    verificar(calcularVariacaoTomCategoria([-2, 2]).extensaoNegativa, 1)
    verificar(calcularVariacaoTomCategoria([-2, 2]).extensaoPositiva, 1)
})

Deno.test("mudança para conjunto sem Tom remove as duas extensões", () => {
    const anterior = calcularVariacaoTomCategoria([-70, 20])
    const atual = calcularVariacaoTomCategoria([null])
    verificar(anterior.extensaoNegativa, 35)
    verificar(anterior.extensaoPositiva, 10)
    verificar(atual.possuiTomDefinido, false)
    verificar(atual.extensaoNegativa, 0)
    verificar(atual.extensaoPositiva, 0)
})
