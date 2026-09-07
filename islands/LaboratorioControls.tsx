import { useEffect, useState } from "preact/hooks"
import LaboratorioPalette from "../components/LaboratorioPalette.tsx"

type Theme = "system" | "light" | "dark"
const themeKey = "rememore:lab:theme"
const fonts = ["Chewy", "Damion", "Dekko", "Dongle", "Faculty Glyphic", "Happy Monkey", "Iansui", "Kalam"]

export default function LaboratorioControls() {
    const [theme, setTheme] = useState<Theme>("system")
    const [font, setFont] = useState("")
    const [ready, setReady] = useState(false)
    const [storageWarning, setStorageWarning] = useState(false)

    useEffect(() => {
        const current = document.documentElement.dataset.theme
        setTheme(current === "light" || current === "dark" ? current : "system")
        setReady(true)

        const sync = (event: StorageEvent) => {
            if (event.key !== themeKey && event.key !== null) return
            const next = event.newValue === "light" || event.newValue === "dark" ? event.newValue : "system"
            applyTheme(next)
            setTheme(next)
        }
        globalThis.addEventListener("storage", sync)
        return () => globalThis.removeEventListener("storage", sync)
    }, [])

    function applyTheme(next: Theme) {
        if (next === "system") delete document.documentElement.dataset.theme
        else document.documentElement.dataset.theme = next
    }

    function changeTheme(next: Theme) {
        applyTheme(next)
        setTheme(next)
        try {
            localStorage.setItem(themeKey, next)
            setStorageWarning(false)
        } catch {
            setStorageWarning(true)
        }
    }

    function changeFont(next: string) {
        setFont(next)
        if (next) document.documentElement.style.setProperty("--rememore-font", '"' + next + '"')
        else document.documentElement.style.removeProperty("--rememore-font")
    }

    return (
        <div class="box">
            <div class="lab-controls">
                <div class="field">
                    <label class="label" for="lab-theme">Tema</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select
                                id="lab-theme"
                                value={theme}
                                disabled={!ready}
                                onChange={(event) => changeTheme(event.currentTarget.value as Theme)}
                            >
                                <option value="system">Sistema</option>
                                <option value="light">Claro</option>
                                <option value="dark">Escuro</option>
                            </select>
                        </div>
                    </div>
                    <p class="help">A escolha é mantida neste dispositivo para o laboratório.</p>
                </div>
                <div class="field">
                    <label class="label" for="lab-font">Família tipográfica</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select
                                id="lab-font"
                                value={font}
                                disabled={!ready}
                                onChange={(event) => changeFont(event.currentTarget.value)}
                            >
                                <option value="">Padrão global</option>
                                {fonts.map((name) => <option key={name} value={name}>{name}</option>)}
                            </select>
                        </div>
                    </div>
                    <p class="help">Comparação temporária. A família aprovada será definida no CSS global.</p>
                </div>
            </div>
            {storageWarning && (
                <p class="help is-warning" role="status">O navegador não permitiu salvar o tema. A escolha vale nesta abertura.</p>
            )}
            <LaboratorioPalette theme={theme} />
            <noscript>
                <p>Ative o JavaScript para usar os seletores. As amostras acompanham o tema do sistema.</p>
            </noscript>
        </div>
    )
}
