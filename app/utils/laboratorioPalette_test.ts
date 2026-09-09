function ok(value: unknown): asserts value {
    if (!value) throw new Error("Condição esperada não atendida")
}
function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error("Esperado " + expected + ", recebido " + actual)
}
function deepStrictEqual(actual: unknown, expected: unknown) {
    equal(JSON.stringify(actual), JSON.stringify(expected))
}
import {
    contrast,
    exportPalette,
    hexToHsl,
    normalizeHex,
    type Palette,
    paletteDeclarations,
    paletteFields,
    paletteStyles,
    parseDrafts
} from "./laboratorioPalette.ts"

const baseline = Object.fromEntries(paletteFields.map(([key]) => [key, "#808080"])) as Palette

Deno.test("hexadecimal: normaliza abreviações e rejeita entradas inválidas", () => {
    equal(normalizeHex(" abc "), "#AABBCC")
    equal(normalizeHex("#f5f2eb"), "#F5F2EB")
    for (const value of ["", "#12", "#12345678", "red", "#fff; } body {display:none}"]) equal(normalizeHex(value), null)
})

Deno.test("rascunhos: recupera cores válidas e separa os temas", () => {
    deepStrictEqual(parseDrafts("{"), { light: {}, dark: {} })
    deepStrictEqual(parseDrafts("null"), { light: {}, dark: {} })
    deepStrictEqual(
        parseDrafts(JSON.stringify({
            light: { main: "#abc", text: "url(evil)", unknown: "#123456" },
            dark: { main: "#123456", text: 123 }
        })),
        { light: { main: "#AABBCC" }, dark: { main: "#123456" } }
    )
})

Deno.test("conversão e contraste conhecidos", () => {
    deepStrictEqual(hexToHsl("#FF0000"), [0, 100, 50])
    deepStrictEqual(hexToHsl("#000000"), [0, 0, 0])
    deepStrictEqual(hexToHsl("#FFFFFF"), [0, 0, 100])
    equal(contrast([0, 0, 0], [0, 0, 100]), 21)
})

Deno.test("mudar o fundo preserva as outras escolhas", () => {
    const css = paletteDeclarations({ ...baseline, main: "#112233", text: "#ABCDEF" })
    ok(css.includes("--bulma-scheme-main:#112233;"))
    ok(css.includes("--bulma-text:#ABCDEF;"))
    ok(css.includes("--bulma-text-weak:#808080;"))
    ok(css.includes("--bulma-text-h:"))
})

Deno.test("contraste semântico acompanha a cor e o fundo", () => {
    const palette = { ...baseline, main: "#FFFFFF", primary: "#FFFF00" }
    const css = paletteDeclarations(palette)
    const match = css.match(/--bulma-primary-on-scheme-l:([\d.]+)%;/)
    ok(match)
    const [h, s] = hexToHsl(palette.primary)
    ok(contrast([h, s, Number(match[1])], hexToHsl(palette.main)) >= 4.5)
    ok(css.includes("--bulma-primary-invert-l:0%;"))
})

Deno.test("restaurar um tema preserva o outro; restaurar ambos remove a prévia", () => {
    const css = paletteStyles({ light: baseline, dark: baseline }, { light: {}, dark: { main: "#112233" } })
    ok(!css.includes('data-theme="light"'))
    ok(css.includes('data-theme="dark"'))
    ok(css.includes("prefers-color-scheme:dark"))
    equal(paletteStyles({ light: baseline, dark: baseline }, { light: {}, dark: {} }), "")
})

Deno.test("exporta tema e exatamente 16 cores identificadas", () => {
    const lines = exportPalette("dark", baseline).split("\n")
    equal(lines.length, 17)
    equal(lines[0], "Rememore — Tema Escuro")
    ok(lines.includes("Fundo principal: #808080"))
    ok(lines.includes("Perigo / erro: #808080"))
})
