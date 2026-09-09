import { useEffect, useRef, useState } from "preact/hooks"
import MessagePopup from "./MessagePopup.tsx"

interface Props {
    message: string
    newKey: string
    information: string
    onConfirm: () => Promise<void>
}

export default function NewKeyConfirmation({ message, newKey, information, onConfirm }: Props) {
    const [feedback, setFeedback] = useState(false)
    const [open, setOpen] = useState(false)
    const [busy, setBusy] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    useEffect(() => () => clearTimeout(timer.current), [])
    async function copy() {
        clearTimeout(timer.current)
        setFeedback(false)
        try {
            await navigator.clipboard.writeText(newKey)
            setFeedback(true)
            timer.current = setTimeout(() => setFeedback(false), 4000)
        } catch {
            // A seleção manual e Entrar permanecem disponíveis.
        }
    }
    return (
        <div class="key-confirmation">
            <p>{message}</p>
            <div class="field">
                <label class="label" for="new-reset-key">Chave de redefinição</label>
                <div class="key-copy-field">
                    <input class="input" id="new-reset-key" value={newKey} readOnly spellcheck={false} />
                    <button class="button" type="button" aria-label="Copiar chave" title="Copiar chave" onClick={copy}>
                        <i class="fas fa-copy" aria-hidden="true" />
                    </button>
                </div>
                <div class="key-copy-feedback" role="status">{feedback && "Chave copiada. Guarde-a em um local seguro."}</div>
            </div>
            <p>{information}</p>
            <div class="login-actions">
                <button class="button is-primary" type="button" disabled={busy} onClick={() => setOpen(true)}>Entrar</button>
            </div>
            <MessagePopup
                open={open}
                color="warning"
                icon="fas fa-triangle-exclamation"
                actions="yesNo"
                message="Você já guardou sua chave de redefinição? Depois de entrar, ela não poderá ser exibida novamente."
                confirmLabel="Já guardei, entrar"
                cancelLabel="Voltar e guardar"
                onResult={async (result) => {
                    setOpen(false)
                    if (result !== "confirm" || busy) return
                    setBusy(true)
                    try {
                        await onConfirm()
                    } finally {
                        setBusy(false)
                    }
                }}
            />
        </div>
    )
}
