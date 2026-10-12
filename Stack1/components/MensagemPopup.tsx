import { useEffect, useId, useRef, useState } from "preact/hooks"

export const acoesPopup = {
    yesNo: ["Sim", "Não"],
    yes: ["Sim"],
    no: ["Não"],
    okCancel: ["OK", "Cancelar"],
    ok: ["OK"],
    none: []
} as const

export type ResultadoPopup = "confirm" | "cancel"
export type CorPopup = "primary" | "link" | "info" | "success" | "warning" | "danger"

interface PropriedadesMensagemPopup {
    aberto: boolean
    titulo?: string
    mensagem: string
    acoes: keyof typeof acoesPopup
    rotuloConfirmacao?: string
    rotuloCancelamento?: string
    icone?: string
    cor?: CorPopup
    aoResponder: (resultado: ResultadoPopup) => void
}

export default function MensagemPopup(
    { aberto: aberto, titulo, mensagem, acoes, rotuloConfirmacao, rotuloCancelamento, icone, cor, aoResponder }: PropriedadesMensagemPopup
) {
    const dialogo = useRef<HTMLDialogElement>(null)
    const idTitulo = useId()
    const idMensagem = useId()
    const [visivel, definirVisivel] = useState(false)
    const paragrafos = mensagem.split(/\n\n+/)

    useEffect(() => {
        const elemento = dialogo.current!
        if (aberto) {
            if (!elemento.open) elemento.showModal()
            const quadro = requestAnimationFrame(() => definirVisivel(true))
            return () => cancelAnimationFrame(quadro)
        }
        definirVisivel(false)
        // A duração corresponde à transição CSS; não representa fechamento funcional temporizado.
        const temporizador = setTimeout(() => elemento.close(), 180)
        return () => clearTimeout(temporizador)
    }, [aberto])

    return (
        <dialog
            ref={dialogo}
            class={`mensagem-popup${visivel ? " esta-visivel" : ""}${cor ? ` popup-${cor}` : ""}`}
            aria-labelledby={titulo ? idTitulo : idMensagem}
            aria-describedby={titulo ? idMensagem : undefined}
            tabIndex={-1}
            onKeyDown={(evento) => {
                if (evento.key !== "Escape") return
                // Interceptar a tecla evita o fechamento nativo independente do estado do chamador.
                evento.preventDefault()
                evento.stopPropagation()
                if (aberto && !evento.repeat) aoResponder("cancel")
            }}
            onCancel={(evento) => {
                evento.preventDefault()
                if (aberto) aoResponder("cancel")
            }}
            onClick={(evento) => {
                if (!aberto || evento.target !== evento.currentTarget) return
                const caixa = evento.currentTarget.getBoundingClientRect()
                if (
                    evento.clientX < caixa.left || evento.clientX > caixa.right || evento.clientY < caixa.top ||
                    evento.clientY > caixa.bottom
                ) {
                    aoResponder("cancel")
                }
            }}
        >
            <div class="mensagem-popup-conteudo">
                {icone && <i class={`${icone} mensagem-popup-icone`} aria-hidden="true" />}
                <div class="mensagem-popup-texto">
                    {titulo && <h2 id={idTitulo} class="title is-4 mensagem-popup-titulo">{titulo}</h2>}
                    <div id={idMensagem} class="mensagem-popup-mensagem">
                        {paragrafos.map((paragrafo, indice) => <p key={indice}>{paragrafo}</p>)}
                    </div>
                </div>
            </div>
            {acoesPopup[acoes].length > 0 && (
                <div class="mensagem-popup-acoes">
                    {acoesPopup[acoes].map((rotulo) => (
                        <button
                            key={rotulo}
                            type="button"
                            class="button"
                            disabled={!aberto}
                            onClick={() => aoResponder(rotulo === "Sim" || rotulo === "OK" ? "confirm" : "cancel")}
                        >
                            {rotulo === "Sim" || rotulo === "OK" ? rotuloConfirmacao ?? rotulo : rotuloCancelamento ?? rotulo}
                        </button>
                    ))}
                </div>
            )}
        </dialog>
    )
}
