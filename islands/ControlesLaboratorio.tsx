import { useEffect, useState } from "preact/hooks"
import PaletaLaboratorio from "../components/PaletaLaboratorio.tsx"

type Tema = "system" | "light" | "dark"
const chaveTema = "rememore:lab:theme"
const fontes = ["Chewy", "Damion", "Dekko", "Dongle", "Faculty Glyphic", "Happy Monkey", "Iansui", "Kalam"]

export default function ControlesLaboratorio() {
    const [tema, definirTema] = useState<Tema>("system")
    const [fonte, definirFonte] = useState("")
    const [pronto, definirPronto] = useState(false)
    const [avisoArmazenamento, definirAvisoArmazenamento] = useState(false)

    useEffect(() => {
        const atual = document.documentElement.dataset.theme
        definirTema(atual === "light" || atual === "dark" ? atual : "system")
        definirPronto(true)

        const sincronizar = (evento: StorageEvent) => {
            if (evento.key !== chaveTema && evento.key !== null) return
            const proximo = evento.newValue === "light" || evento.newValue === "dark" ? evento.newValue : "system"
            aplicarTema(proximo)
            definirTema(proximo)
        }
        globalThis.addEventListener("storage", sincronizar)
        return () => globalThis.removeEventListener("storage", sincronizar)
    }, [])

    function aplicarTema(proximo: Tema) {
        if (proximo === "system") delete document.documentElement.dataset.theme
        else document.documentElement.dataset.theme = proximo
    }

    function alterarTema(proximo: Tema) {
        aplicarTema(proximo)
        definirTema(proximo)
        try {
            localStorage.setItem(chaveTema, proximo)
            definirAvisoArmazenamento(false)
        } catch {
            definirAvisoArmazenamento(true)
        }
    }

    function alterarFonte(proximo: string) {
        definirFonte(proximo)
        if (proximo) document.documentElement.style.setProperty("--rememore-fonte", '"' + proximo + '"')
        else document.documentElement.style.removeProperty("--rememore-fonte")
    }

    return (
        <div class="box">
            <div class="lab-controles">
                <div class="field">
                    <label class="label" for="lab-theme">Tema</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select
                                id="lab-theme"
                                value={tema}
                                disabled={!pronto}
                                onChange={(evento) => alterarTema(evento.currentTarget.value as Tema)}
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
                                value={fonte}
                                disabled={!pronto}
                                onChange={(evento) => alterarFonte(evento.currentTarget.value)}
                            >
                                <option value="">Padrão global</option>
                                {fontes.map((nome) => <option key={nome} value={nome}>{nome}</option>)}
                            </select>
                        </div>
                    </div>
                    <p class="help">Comparação temporária. A família aprovada será definida no CSS global.</p>
                </div>
            </div>
            {avisoArmazenamento && (
                <p class="help is-warning" role="status">O navegador não permitiu salvar o tema. A escolha vale nesta abertura.</p>
            )}
            <PaletaLaboratorio tema={tema} />
            <noscript>
                <p>Ative o JavaScript para usar os seletores. As amostras acompanham o tema do sistema.</p>
            </noscript>
        </div>
    )
}
