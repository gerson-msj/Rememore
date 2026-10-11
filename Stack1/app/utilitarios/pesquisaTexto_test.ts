import { correspondeAproximadamente, normalizarPesquisa } from "./pesquisaTexto.ts"

function conferir(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}; recebido ${obtido}`)
}

Deno.test("pesquisa normaliza acentos, caixa e espaços externos sem mudar espaços internos", () => {
    conferir(normalizarPesquisa("  FAMÍLIA  "), "familia")
    conferir(normalizarPesquisa("\tTRABALHO\n"), "trabalho")
    conferir(normalizarPesquisa("Casa  nova"), "casa  nova")
    conferir(normalizarPesquisa("   "), "")
})

Deno.test("aproximação reconhece pequenos erros sem sugerir nomes sem relação", () => {
    conferir(correspondeAproximadamente("famlia", "Família"), true)
    conferir(correspondeAproximadamente("traablho", "Trabalho"), true)
    conferir(correspondeAproximadamente("astronomia", "Família"), false)
    conferir(correspondeAproximadamente("f", "Faculdade"), false)
    conferir(correspondeAproximadamente("", "Família"), false)
})
