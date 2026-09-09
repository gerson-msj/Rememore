import { useEffect, useRef, useState } from "preact/hooks"
import {
    type ColorKey,
    type Drafts,
    exportPalette,
    normalizeHex,
    type Palette,
    paletteFields,
    paletteStorageKey,
    paletteStyles,
    type PaletteTheme,
    parseDrafts
} from "../app/utils/laboratorioPalette.ts"

function readDefaults(): Record<PaletteTheme, Palette> {
    const root = document.documentElement
    const previous = root.getAttribute("data-theme")
    const probe = document.createElement("span")
    probe.hidden = true
    root.append(probe)
    const palettes = {} as Record<PaletteTheme, Palette>
    try {
        for (const theme of ["light", "dark"] as const) {
            root.dataset.theme = theme
            palettes[theme] = {} as Palette
            for (const [key, , , variable] of paletteFields) {
                probe.style.color = key === "title" ? "var(--bulma-text-title, var(--bulma-text-strong))" : "var(--bulma-" + variable + ")"
                const channels = getComputedStyle(probe).color.match(/[\d.]+/g)
                if (!channels || channels.length < 3) throw new Error("Cor indisponível: " + key)
                palettes[theme][key] = "#" + channels.slice(0, 3)
                    .map((value) => Math.round(Number(value)).toString(16).padStart(2, "0")).join("").toUpperCase()
            }
        }
    } finally {
        probe.remove()
        if (previous === null) root.removeAttribute("data-theme")
        else root.setAttribute("data-theme", previous)
    }
    return palettes
}

function ColorField({ colorKey, label, description, value, disabled, onChange }: {
    colorKey: ColorKey
    label: string
    description: string
    value: string
    disabled: boolean
    onChange: (key: ColorKey, value: string) => void
}) {
    const [input, setInput] = useState(value)
    const [invalid, setInvalid] = useState(false)
    useEffect(() => {
        setInput(value)
        setInvalid(false)
    }, [value])
    const id = "palette-" + colorKey
    return (
        <div class="lab-color-field">
            <label class="label" for={id}>{label}</label>
            <div class="lab-color-inputs">
                <input
                    type="color"
                    value={value}
                    disabled={disabled}
                    aria-label={"Escolher " + label.toLowerCase()}
                    onInput={(event) => onChange(colorKey, event.currentTarget.value.toUpperCase())}
                />
                <input
                    id={id}
                    class={"input" + (invalid ? " is-danger" : "")}
                    value={input}
                    disabled={disabled}
                    spellcheck={false}
                    autoComplete="off"
                    maxLength={7}
                    aria-invalid={invalid}
                    aria-describedby={id + "-help"}
                    onInput={(event) => {
                        const next = event.currentTarget.value
                        setInput(next)
                        setInvalid(false)
                        if (/^#?[0-9a-f]{6}$/i.test(next)) onChange(colorKey, normalizeHex(next)!)
                    }}
                    onBlur={() => {
                        const hex = normalizeHex(input)
                        if (hex) {
                            setInput(hex)
                            onChange(colorKey, hex)
                        } else setInvalid(true)
                    }}
                />
            </div>
            <p class={"help" + (invalid ? " is-danger" : "")} id={id + "-help"}>
                {invalid ? "Informe uma cor hexadecimal, como #F5F2EB." : description}
            </p>
        </div>
    )
}

export default function LaboratorioPalette({ theme }: { theme: "system" | PaletteTheme }) {
    const [defaults, setDefaults] = useState<Record<PaletteTheme, Palette> | null>(null)
    const [drafts, setDrafts] = useState<Drafts>({ light: {}, dark: {} })
    const [systemTheme, setSystemTheme] = useState<PaletteTheme>("light")
    const [message, setMessage] = useState("")
    const [storageWarning, setStorageWarning] = useState(false)
    const styleRef = useRef<HTMLStyleElement | null>(null)
    const active = theme === "system" ? systemTheme : theme

    useEffect(() => {
        const style = document.createElement("style")
        style.dataset.labPalette = ""
        document.head.append(style)
        styleRef.current = style
        const media = matchMedia("(prefers-color-scheme: dark)")
        const updateSystem = () => setSystemTheme(media.matches ? "dark" : "light")
        updateSystem()
        media.addEventListener("change", updateSystem)
        try {
            setDefaults(readDefaults())
            try {
                setDrafts(parseDrafts(localStorage.getItem(paletteStorageKey)))
            } catch {
                setStorageWarning(true)
            }
        } catch {
            setMessage("Não foi possível ler a paleta do CSS. Recarregue o laboratório.")
        }
        const sync = (event: StorageEvent) => {
            if (event.key === paletteStorageKey || event.key === null) setDrafts(parseDrafts(event.newValue))
        }
        globalThis.addEventListener("storage", sync)
        return () => {
            style.remove()
            media.removeEventListener("change", updateSystem)
            globalThis.removeEventListener("storage", sync)
        }
    }, [])

    useEffect(() => {
        if (defaults && styleRef.current) styleRef.current.textContent = paletteStyles(defaults, drafts)
    }, [defaults, drafts])

    useEffect(() => setMessage(""), [theme])

    function save(next: Drafts) {
        setDrafts(next)
        setMessage("")
        try {
            localStorage.setItem(paletteStorageKey, JSON.stringify(next))
            setStorageWarning(false)
        } catch {
            setStorageWarning(true)
        }
    }

    function change(key: ColorKey, color: string) {
        if (theme === "system" || !defaults) return
        const next = { ...drafts[active], [key]: color }
        if (color === defaults[active][key]) delete next[key]
        save({ ...drafts, [active]: next })
    }

    const palette = defaults ? { ...defaults[active], ...drafts[active] } : null
    const exported = palette ? exportPalette(active, palette) : ""
    async function copy() {
        try {
            await navigator.clipboard.writeText(exported)
            setMessage("Paleta copiada.")
        } catch {
            setMessage("Selecione e copie o texto no campo abaixo.")
        }
    }

    return (
        <section class="lab-palette mt-5" aria-labelledby="palette-title">
            <h2 class="title is-4" id="palette-title">Paleta de cores</h2>
            <p class="mb-4">
                Ajuste cada cor e observe as amostras abaixo. Os rascunhos Claro e Escuro ficam salvos neste navegador. Quando terminar,
                copie a paleta para definirmos as cores do projeto.
            </p>
            <p class="has-text-weight-semibold mb-3">
                {theme === "system" ? "Prévia do sistema: " : "Editando tema: "}
                {active === "light" ? "Claro" : "Escuro"}
            </p>
            {theme === "system" && (
                <p class="notification is-light">Selecione Claro ou Escuro no controle de tema acima para editar a paleta.</p>
            )}
            {storageWarning && <p role="status">O navegador não permitiu salvar o rascunho. Copie a paleta antes de sair.</p>}
            {palette && (
                <>
                    <div class="lab-palette-grid">
                        {paletteFields.map(([key, label, description]) => (
                            <ColorField
                                key={active + key}
                                colorKey={key}
                                label={label}
                                description={description}
                                value={palette[key]}
                                disabled={theme === "system"}
                                onChange={change}
                            />
                        ))}
                    </div>
                    <div class="buttons mt-5">
                        <button type="button" class="button is-link" onClick={copy}>
                            Copiar paleta {active === "light" ? "clara" : "escura"}
                        </button>
                        <button
                            type="button"
                            class="button"
                            disabled={theme === "system" || !Object.keys(drafts[active]).length}
                            onClick={() => save({ ...drafts, [active]: {} })}
                        >
                            Restaurar cores do CSS deste tema
                        </button>
                    </div>
                    <label class="label" for="palette-export">As 16 cores do tema {active === "light" ? "claro" : "escuro"}</label>
                    <textarea
                        id="palette-export"
                        class="textarea lab-palette-export"
                        rows={6}
                        readOnly
                        value={exported}
                        onFocus={(event) => event.currentTarget.select()}
                    />
                    <p class="help">
                        Copie este texto para guardar uma versão ou enviar a paleta. Os rascunhos não alteram o CSS do projeto.
                    </p>
                </>
            )}
            <p role="status" aria-live="polite" class="mt-3">{message}</p>
        </section>
    )
}
