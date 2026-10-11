export const camposPaleta = [
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

export type ChaveCor = typeof camposPaleta[number][0]
export type Paleta = Record<ChaveCor, string>
export type TemaPaleta = "light" | "dark"
export type Rascunhos = Record<TemaPaleta, Partial<Paleta>>
export const chaveArmazenamentoPaleta = "rememore:lab:palettes:v1"

export function normalizarHexadecimal(valor: string): string | null {
    const hex = valor.trim().replace(/^#/, "")
    if (/^[0-9a-f]{3}$/i.test(hex)) return "#" + [...hex].map((c) => c + c).join("").toUpperCase()
    return /^[0-9a-f]{6}$/i.test(hex) ? "#" + hex.toUpperCase() : null
}

export function interpretarRascunhos(bruto: string | null): Rascunhos {
    const resultado: Rascunhos = { light: {}, dark: {} }
    try {
        const valor = JSON.parse(bruto ?? "{}")
        for (const tema of ["light", "dark"] as const) {
            for (const [chave] of camposPaleta) {
                const candidato = valor?.[tema]?.[chave]
                const hex = typeof candidato === "string" ? normalizarHexadecimal(candidato) : null
                if (hex) resultado[tema][chave] = hex
            }
        }
    } catch { /* Um rascunho inválido não impede abrir o laboratório. */ }
    return resultado
}

export function hexadecimalParaHsl(hex: string): [number, number, number] {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    const maximo = Math.max(r, g, b), minimo = Math.min(r, g, b)
    const delta = maximo - minimo, l = (maximo + minimo) / 2
    let h = 0
    if (delta) {
        if (maximo === r) h = ((g - b) / delta) % 6
        else if (maximo === g) h = (b - r) / delta + 2
        else h = (r - g) / delta + 4
        h = (h * 60 + 360) % 360
    }
    return [h, delta ? delta / (1 - Math.abs(2 * l - 1)) * 100 : 0, l * 100]
}

function luminancia(h: number, s: number, l: number) {
    s /= 100
    l /= 100
    const a = s * Math.min(l, 1 - l)
    const canais = [0, 8, 4].map((n) => {
        const k = (n + h / 30) % 12
        const v = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
        return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    })
    return canais[0] * 0.2126 + canais[1] * 0.7152 + canais[2] * 0.0722
}

export function contraste(a: [number, number, number], b: [number, number, number]) {
    const x = luminancia(...a), y = luminancia(...b)
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

function inverter(h: number, s: number, l: number) {
    return contraste([h, s, l], [0, 0, 0]) >= contraste([h, s, l], [0, 0, 100]) ? 0 : 100
}

function luminosidadeLegivel(h: number, s: number, l: number, fundo: [number, number, number]) {
    if (contraste([h, s, l], fundo) >= 4.5) return l
    const opcoes = Array.from({ length: 101 }, (_, i) => i)
        .filter((i) => contraste([h, s, i], fundo) >= 4.5)
        .sort((a, b) => Math.abs(a - l) - Math.abs(b - l))
    return opcoes[0] ?? inverter(...fundo)
}

/** Gera apenas CSS validado a partir de cores hexadecimais. */
export function declaracoesPaleta(paleta: Paleta): string {
    const declaracoes: string[] = []
    const gravar = (chave: string, valor: string | number) => declaracoes.push("--bulma-" + chave + ":" + valor + ";")
    for (const [chave, , , variavel] of camposPaleta.slice(0, 10)) {
        const cor = paleta[chave], [h, s, l] = hexadecimalParaHsl(cor)
        gravar(variavel, cor)
        gravar(variavel + "-l", l + "%")
        if (chave === "main") {
            gravar("scheme-h", h)
            gravar("scheme-s", s + "%")
        }
        if (chave === "text") {
            gravar("text-h", h)
            gravar("text-s", s + "%")
            gravar("text-base", cor)
        }
    }
    // As escalas e as cores de texto precisam acompanhar também mudanças do fundo.
    for (const [chave] of camposPaleta.slice(10)) {
        const [h, s, l] = hexadecimalParaHsl(paleta[chave])
        gravar(chave, paleta[chave])
        gravar(chave + "-base", paleta[chave])
        gravar(chave + "-h", h)
        gravar(chave + "-s", s + "%")
        gravar(chave + "-l", l + "%")
        gravar(chave + "-invert-l", inverter(h, s, l) + "%")
        gravar(chave + "-on-scheme-l", luminosidadeLegivel(h, s, l, hexadecimalParaHsl(paleta.main)) + "%")
        for (let passo = 0; passo <= 100; passo += 5) {
            const tonalidade = String(passo).padStart(2, "0")
            gravar(chave + "-" + tonalidade + "-l", passo + "%")
            gravar(chave + "-" + tonalidade + "-invert-l", inverter(h, s, passo) + "%")
        }
    }
    return declaracoes.join("\n")
}

export function estilosPaleta(padroes: Record<TemaPaleta, Paleta>, rascunhos: Rascunhos): string {
    const regra = (tema: TemaPaleta) => {
        if (!Object.keys(rascunhos[tema]).length) return ""
        const valores = declaracoesPaleta({ ...padroes[tema], ...rascunhos[tema] })
        const explicito = ':root[data-theme="' + tema + '"]{' + valores + "}"
        const sistema = "@media(prefers-color-scheme:" + tema + "){:root:not([data-theme]){" + valores + "}}"
        // Componentes do Bulma que recompõem neutros com um único matiz
        // precisam usar as cores independentes escolhidas no painel.
        const componentes = (escopo: string) => `
            ${escopo} .title { --bulma-title-color: var(--bulma-text-title, var(--bulma-text-strong)); }
            ${escopo} .content { --bulma-content-heading-color: var(--bulma-text-title, var(--bulma-text-strong)); }
            ${escopo} :is(.input, .textarea, .select select):not(:disabled) {
                background-color: var(--bulma-scheme-main);
                color: var(--bulma-text-strong);
            }
            ${escopo} :is(.input, .textarea, .select select):not(:disabled):not(:focus):not(:hover):not(.is-focused):not(.is-hovered):not(.is-active):not(.is-primary):not(.is-link):not(.is-info):not(.is-success):not(.is-warning):not(.is-danger) {
                border-color: var(--bulma-border);
            }
        `
        return explicito + sistema + componentes(':root[data-theme="' + tema + '"]') +
            "@media(prefers-color-scheme:" + tema + "){" + componentes(":root:not([data-theme])") + "}"
    }
    return regra("light") + regra("dark")
}

export function exportarPaleta(tema: TemaPaleta, paleta: Paleta): string {
    return "Rememore — Tema " + (tema === "light" ? "Claro" : "Escuro") + "\n" +
        camposPaleta.map(([chave, rotulo]) => rotulo + ": " + paleta[chave]).join("\n")
}
