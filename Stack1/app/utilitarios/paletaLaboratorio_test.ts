function ok(valor: unknown): asserts valor {
    if (!valor) throw new Error("Condição esperada não atendida")
}
function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error("Esperado " + esperado + ", recebido " + obtido)
}
function verificarIgualdadeProfunda(obtido: unknown, esperado: unknown) {
    verificarIgualdade(JSON.stringify(obtido), JSON.stringify(esperado))
}
import {
    camposPaleta,
    contraste,
    declaracoesPaleta,
    estilosPaleta,
    exportarPaleta,
    hexadecimalParaHsl,
    interpretarRascunhos,
    normalizarHexadecimal,
    type Paleta
} from "./paletaLaboratorio.ts"

const paletaBase = Object.fromEntries(camposPaleta.map(([chave]) => [chave, "#808080"])) as Paleta

Deno.test("hexadecimal: normaliza abreviações e rejeita entradas inválidas", () => {
    verificarIgualdade(normalizarHexadecimal(" abc "), "#AABBCC")
    verificarIgualdade(normalizarHexadecimal("#f5f2eb"), "#F5F2EB")
    for (const valor of ["", "#12", "#12345678", "red", "#fff; } body {display:none}"]) {
        verificarIgualdade(normalizarHexadecimal(valor), null)
    }
})

Deno.test("rascunhos: recupera cores válidas e separa os temas", () => {
    verificarIgualdadeProfunda(interpretarRascunhos("{"), { light: {}, dark: {} })
    verificarIgualdadeProfunda(interpretarRascunhos("null"), { light: {}, dark: {} })
    verificarIgualdadeProfunda(
        interpretarRascunhos(JSON.stringify({
            light: { main: "#abc", text: "url(evil)", unknown: "#123456" },
            dark: { main: "#123456", text: 123 }
        })),
        { light: { main: "#AABBCC" }, dark: { main: "#123456" } }
    )
})

Deno.test("conversão e contraste conhecidos", () => {
    verificarIgualdadeProfunda(hexadecimalParaHsl("#FF0000"), [0, 100, 50])
    verificarIgualdadeProfunda(hexadecimalParaHsl("#000000"), [0, 0, 0])
    verificarIgualdadeProfunda(hexadecimalParaHsl("#FFFFFF"), [0, 0, 100])
    verificarIgualdade(contraste([0, 0, 0], [0, 0, 100]), 21)
})

Deno.test("mudar o fundo preserva as outras escolhas", () => {
    const css = declaracoesPaleta({ ...paletaBase, main: "#112233", text: "#ABCDEF" })
    ok(css.includes("--bulma-scheme-main:#112233;"))
    ok(css.includes("--bulma-text:#ABCDEF;"))
    ok(css.includes("--bulma-text-weak:#808080;"))
    ok(css.includes("--bulma-text-h:"))
})

Deno.test("contraste semântico acompanha a cor e o fundo", () => {
    const paleta = { ...paletaBase, main: "#FFFFFF", primary: "#FFFF00" }
    const css = declaracoesPaleta(paleta)
    const correspondencia = css.match(/--bulma-primary-on-scheme-l:([\d.]+)%;/)
    ok(correspondencia)
    const [h, s] = hexadecimalParaHsl(paleta.primary)
    ok(contraste([h, s, Number(correspondencia[1])], hexadecimalParaHsl(paleta.main)) >= 4.5)
    ok(css.includes("--bulma-primary-invert-l:0%;"))
})

Deno.test("restaurar um tema preserva o outro; restaurar ambos remove a prévia", () => {
    const css = estilosPaleta({ light: paletaBase, dark: paletaBase }, { light: {}, dark: { main: "#112233" } })
    ok(!css.includes('data-theme="light"'))
    ok(css.includes('data-theme="dark"'))
    ok(css.includes("prefers-color-scheme:dark"))
    verificarIgualdade(estilosPaleta({ light: paletaBase, dark: paletaBase }, { light: {}, dark: {} }), "")
})

Deno.test("exporta tema e exatamente 16 cores identificadas", () => {
    const linhas = exportarPaleta("dark", paletaBase).split("\n")
    verificarIgualdade(linhas.length, 17)
    verificarIgualdade(linhas[0], "Rememore — Tema Escuro")
    ok(linhas.includes("Fundo principal: #808080"))
    ok(linhas.includes("Perigo / erro: #808080"))
})
