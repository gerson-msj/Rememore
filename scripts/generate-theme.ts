// Após aprovar uma paleta, atualize assets/palettes.json e execute:
// deno run --allow-read --allow-write scripts/generate-theme.ts
import palettes from "../assets/palettes.json" with { type: "json" }
import { paletteDeclarations } from "../app/utils/laboratorioPalette.ts"

const light = paletteDeclarations(palettes.light)
const dark = paletteDeclarations(palettes.dark)
const css = `/* Gerado de assets/palettes.json por scripts/generate-theme.ts. */
:root { ${light} color-scheme: light; }
@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { ${dark} color-scheme: dark; }
}
:root[data-theme="light"] { ${light} color-scheme: light; }
:root[data-theme="dark"] { ${dark} color-scheme: dark; }
`
await Deno.writeTextFile(new URL("../assets/palettes.css", import.meta.url), css)
