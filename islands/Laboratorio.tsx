import { useEffect, useState } from "preact/hooks"
import type { ComponentChildren } from "preact"
import ControlesLaboratorio from "./ControlesLaboratorio.tsx"
import VisualizacaoLaboratorio from "../components/VisualizacaoLaboratorio.tsx"
import ExperimentoMemoria from "../components/ExperimentoMemoria.tsx"
import MemoriaLaboratorio from "../components/MemoriaLaboratorio.tsx"

function Bloco({ id, titulo, children }: { id: string; titulo: string; children: ComponentChildren }) {
    const [aberto, definirAberto] = useState(true)
    const [pronto, definirPronto] = useState(false)
    const [aviso, definirAviso] = useState(false)
    const chave = `rememore:lab:bloco:${id}:v1`
    useEffect(() => {
        try {
            definirAberto(localStorage.getItem(chave) !== "fechado")
        } catch {
            definirAviso(true)
        }
        definirPronto(true)
    }, [chave])
    return (
        <section class="lab-bloco">
            <h2 class="title is-4">
                <button
                    type="button"
                    class="lab-bloco-titulo"
                    aria-expanded={aberto}
                    aria-controls={`lab-bloco-${id}`}
                    disabled={!pronto}
                    onClick={() => {
                        const proximo = !aberto
                        definirAberto(proximo)
                        try {
                            localStorage.setItem(chave, proximo ? "aberto" : "fechado")
                            definirAviso(false)
                        } catch {
                            definirAviso(true)
                        }
                    }}
                >
                    <span aria-hidden="true">{aberto ? "▾" : "▸"}</span> {titulo}
                </button>
            </h2>
            {aviso && <p role="status">Não foi possível guardar a expansão deste bloco neste navegador.</p>}
            <div id={`lab-bloco-${id}`} hidden={!aberto}>{children}</div>
        </section>
    )
}

export default function Laboratorio() {
    const [coresTom, definirCoresTom] = useState({
        light: { negativa: "#B45F4D", positiva: "#237F88" },
        dark: { negativa: "#E99E89", positiva: "#79CBD1" }
    })
    const [tema, definirTema] = useState<"system" | "light" | "dark">("system")
    const [sistemaEscuro, definirSistemaEscuro] = useState(false)
    useEffect(() => {
        const consulta = matchMedia("(prefers-color-scheme: dark)")
        const atualizar = () => definirSistemaEscuro(consulta.matches)
        atualizar()
        consulta.addEventListener("change", atualizar)
        return () => consulta.removeEventListener("change", atualizar)
    }, [])
    const temaEfetivo = tema === "system" ? (sistemaEscuro ? "dark" : "light") : tema
    return (
        <div style={{ "--tom-negativo": coresTom[temaEfetivo].negativa, "--tom-positivo": coresTom[temaEfetivo].positiva }}>
            <Bloco id="tema" titulo="Tema e calibração das cores">
                <ControlesLaboratorio aoAlterarTema={definirTema} />
            </Bloco>
            <Bloco id="visualizacao" titulo="Visualização do tema">
                <VisualizacaoLaboratorio />
            </Bloco>
            <Bloco id="memoria" titulo="Componente de memória — experimentação">
                <ExperimentoMemoria tema={temaEfetivo} cores={coresTom} definirCores={definirCoresTom} />
            </Bloco>
            <Bloco id="memoria-real" titulo="Componente de memória — componente real">
                <MemoriaLaboratorio />
            </Bloco>
        </div>
    )
}
