export const paletteFields = [
    ["main", "Fundo principal", "Fundo geral da página", "scheme-main"],
    ["bis", "Superfície secundária", "Áreas com fundo discretamente diferente", "scheme-main-bis"],
    ["ter", "Superfície terciária", "Outro nível de superfície", "scheme-main-ter"],
    ["background", "Fundo de apoio", "Preenchimentos neutros dos elementos", "background"],
    ["text", "Texto normal", "Parágrafos e conteúdo comum", "text"],
    ["text-weak", "Texto secundário", "Legendas e informações auxiliares", "text-weak"],
    ["text-strong", "Texto forte", "Destaques dentro da leitura", "text-strong"],
    ["title", "Títulos", "Cabeçalhos e títulos", "text-title"],
    ["border", "Borda normal", "Contornos de campos e caixas", "border"],
    ["border-weak", "Borda suave", "Divisórias discretas", "border-weak"],
    ["primary", "Principal", "Identidade e ações principais", "primary"],
    ["link", "Link", "Links e navegação", "link"],
    ["info", "Informação", "Mensagens informativas", "info"],
    ["success", "Sucesso", "Confirmações e resultados positivos", "success"],
    ["warning", "Atenção / alerta", "Situações que precisam de atenção", "warning"],
    ["danger", "Perigo / erro", "Falhas e ações destrutivas", "danger"]
] as const

export type ColorKey = typeof paletteFields[number][0]
export type Palette = Record<ColorKey, string>
export type PaletteTheme = "light" | "dark"
export type Drafts = Record<PaletteTheme, Partial<Palette>>
export const paletteStorageKey = "rememore:lab:palettes:v1"

export function normalizeHex(value: string): string | null {
    const hex = value.trim().replace(/^#/, "")
    if (/^[0-9a-f]{3}$/i.test(hex)) return "#" + [...hex].map((c) => c + c).join("").toUpperCase()
    return /^[0-9a-f]{6}$/i.test(hex) ? "#" + hex.toUpperCase() : null
}

export function parseDrafts(raw: string | null): Drafts {
    const result: Drafts = { light: {}, dark: {} }
    try {
        const value = JSON.parse(raw ?? "{}")
        for (const theme of ["light", "dark"] as const) {
            for (const [key] of paletteFields) {
                const candidate = value?.[theme]?.[key]
                const hex = typeof candidate === "string" ? normalizeHex(candidate) : null
                if (hex) result[theme][key] = hex
            }
        }
    } catch { /* Um rascunho inválido não impede abrir o laboratório. */ }
    return result
}

export function hexToHsl(hex: string): [number, number, number] {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const delta = max - min, l = (max + min) / 2
    let h = 0
    if (delta) {
        if (max === r) h = ((g - b) / delta) % 6
        else if (max === g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4
        h = (h * 60 + 360) % 360
    }
    return [h, delta ? delta / (1 - Math.abs(2 * l - 1)) * 100 : 0, l * 100]
}

function luminance(h: number, s: number, l: number) {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const channels = [0, 8, 4].map((n) => {
        const k = (n + h / 30) % 12
        const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function contrast(a: [number, number, number], b: [number, number, number]) {
    const x = luminance(...a), y = luminance(...b)
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function invert(h: number, s: number, l: number) {
    return contrast([h, s, l], [0, 0, 0]) >= contrast([h, s, l], [0, 0, 100]) ? 0 : 100
}

function readableLightness(h: number, s: number, l: number, background: [number, number, number]) {
    if (contrast([h, s, l], background) >= 4.5) return l
    const options = Array.from({ length: 101 }, (_, i) => i)
        .filter((i) => contrast([h, s, i], background) >= 4.5)
        .sort((a, b) => Math.abs(a - l) - Math.abs(b - l))
    return options[0] ?? invert(...background)
}

/** Gera apenas CSS validado a partir de cores hexadecimais. */
export function paletteDeclarations(palette: Palette): string {
    const declarations: string[] = []
    const put = (key: string, value: string | number) => declarations.push("--bulma-" + key + ":" + value + ";")
    for (const [key, , , variable] of paletteFields.slice(0, 10)) {
        const color = palette[key], [h, s, l] = hexToHsl(color)
        put(variable, color)
        put(variable + "-l", l + "%")
        if (key === "main") {
            put("scheme-h", h)
            put("scheme-s", s + "%")
        }
        if (key === "text") {
            put("text-h", h)
            put("text-s", s + "%")
            put("text-base", color)
        }
    }
    // As escalas e as cores de texto precisam acompanhar também mudanças do fundo.
    for (const [key] of paletteFields.slice(10)) {
        const [h, s, l] = hexToHsl(palette[key])
        put(key, palette[key])
        put(key + "-base", palette[key])
        put(key + "-h", h)
        put(key + "-s", s + "%")
        put(key + "-l", l + "%")
        put(key + "-invert-l", invert(h, s, l) + "%")
        put(key + "-on-scheme-l", readableLightness(h, s, l, hexToHsl(palette.main)) + "%")
        for (let step = 0; step <= 100; step += 5) {
            const shade = String(step).padStart(2, "0")
            put(key + "-" + shade + "-l", step + "%")
            put(key + "-" + shade + "-invert-l", invert(h, s, step) + "%")
        }
    }
    return declarations.join("\n")
}

export function paletteStyles(defaults: Record<PaletteTheme, Palette>, drafts: Drafts): string {
    const rule = (theme: PaletteTheme) => {
        if (!Object.keys(drafts[theme]).length) return ""
        const values = paletteDeclarations({ ...defaults[theme], ...drafts[theme] })
        const explicit = ':root[data-theme="' + theme + '"]{' + values + "}"
        const system = "@media(prefers-color-scheme:" + theme + "){:root:not([data-theme]){" + values + "}}"
        // Componentes do Bulma que recompõem neutros com um único matiz
        // precisam usar as cores independentes escolhidas no painel.
        const components = (scope: string) => `
            ${scope} .title { --bulma-title-color: var(--bulma-text-title, var(--bulma-text-strong)); }
            ${scope} .content { --bulma-content-heading-color: var(--bulma-text-title, var(--bulma-text-strong)); }
            ${scope} :is(.input, .textarea, .select select):not(:disabled) {
                background-color: var(--bulma-scheme-main);
                color: var(--bulma-text-strong);
            }
            ${scope} :is(.input, .textarea, .select select):not(:disabled):not(:focus):not(:hover):not(.is-focused):not(.is-hovered):not(.is-active):not(.is-primary):not(.is-link):not(.is-info):not(.is-success):not(.is-warning):not(.is-danger) {
                border-color: var(--bulma-border);
            }
        `
        return explicit + system + components(':root[data-theme="' + theme + '"]') +
            "@media(prefers-color-scheme:" + theme + "){" + components(":root:not([data-theme])") + "}"
    }
    return rule("light") + rule("dark")
}

export function exportPalette(theme: PaletteTheme, palette: Palette): string {
    return "Rememore — Tema " + (theme === "light" ? "Claro" : "Escuro") + "\n" +
        paletteFields.map(([key, label]) => label + ": " + palette[key]).join("\n")
}
