// Após aprovar uma paleta, atualize assets/paletas.json e execute:
// deno run --allow-read --allow-write scripts/gerar-tema.ts
import paletas from "../assets/paletas.json" with { type: "json" }
import { declaracoesPaleta } from "../app/utilitarios/paletaLaboratorio.ts"

const claro = declaracoesPaleta(paletas.light)
const escuro = declaracoesPaleta(paletas.dark)
const css = `/* Gerado de assets/paletas.json por scripts/gerar-tema.ts. */
:root { ${claro} color-scheme: light; }
@media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) { ${escuro} color-scheme: dark; }
}
:root[data-theme="light"] { ${claro} color-scheme: light; }
:root[data-theme="dark"] { ${escuro} color-scheme: dark; }
`
await Deno.writeTextFile(new URL("../assets/palettes.css", import.meta.url), css)
