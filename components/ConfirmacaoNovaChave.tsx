import { useEffect, useRef, useState } from "preact/hooks"
import MensagemPopup from "./MensagemPopup.tsx"

interface Propriedades {
    mensagem: string
    novaChave: string
    informacao: string
    aoConfirmar: () => Promise<void>
}

export default function ConfirmacaoNovaChave({ mensagem, novaChave, informacao, aoConfirmar }: Propriedades) {
    const [retornoCopia, definirRetornoCopia] = useState(false)
    const [aberto, definirAberto] = useState(false)
    const [ocupado, definirOcupado] = useState(false)
    const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(temporizador.current), [])
    async function copiar() {
        clearTimeout(temporizador.current)
        definirRetornoCopia(false)
        try {
            await navigator.clipboard.writeText(novaChave)
            definirRetornoCopia(true)
            temporizador.current = setTimeout(() => definirRetornoCopia(false), 4000)
        } catch {
            // A seleção manual e Entrar permanecem disponíveis.
        }
    }
    return (
        <div class="confirmacao-chave">
            <p>{mensagem}</p>
            <div class="field">
                <label class="label" for="new-reset-key">Chave de redefinição</label>
                <div class="chave-campo-copia">
                    <input class="input" id="new-reset-key" value={novaChave} readOnly spellcheck={false} />
                    <button class="button" type="button" aria-label="Copiar chave" title="Copiar chave" onClick={copiar}>
                        <i class="fas fa-copy" aria-hidden="true" />
                    </button>
                </div>
                <div class="chave-retorno-copia" role="status">{retornoCopia && "Chave copiada. Guarde-a em um local seguro."}</div>
            </div>
            <p>{informacao}</p>
            <div class="entrada-acoes">
                <button class="button is-primary" type="button" disabled={ocupado} onClick={() => definirAberto(true)}>Entrar</button>
            </div>
            <MensagemPopup
                aberto={aberto}
                cor="warning"
                icone="fas fa-triangle-exclamation"
                acoes="yesNo"
                mensagem="Você já guardou sua chave de redefinição? Depois de entrar, ela não poderá ser exibida novamente."
                rotuloConfirmacao="Já guardei, entrar"
                rotuloCancelamento="Voltar e guardar"
                aoResponder={async (resultado) => {
                    definirAberto(false)
                    if (resultado !== "confirm" || ocupado) return
                    definirOcupado(true)
                    try {
                        await aoConfirmar()
                    } finally {
                        definirOcupado(false)
                    }
                }}
            />
        </div>
    )
}
