import { useEffect, useState } from "preact/hooks"
import CaptureLayout from "../components/CaptureLayout.tsx"
import DateSelector from "../components/DateSelector.tsx"
import MessagePopup from "../components/MessagePopup.tsx"
import { guidance } from "../app/services/guidance.ts"
import { type LocalCapture, localCaptures } from "../app/services/local/captures.ts"
import { formatCaptureDate, isCaptureDate, today } from "../app/utils/captureDate.ts"

export default function CaptureSelection({ accountId }: { accountId: string }) {
    const [date, setDate] = useState("")
    const [current, setCurrent] = useState("")
    const [pending, setPending] = useState<LocalCapture[]>([])
    const [error, setError] = useState("")
    const [invalid, setInvalid] = useState(false)
    const [deleting, setDeleting] = useState<LocalCapture | null>(null)
    const [busy, setBusy] = useState(false)
    const message = guidance("captureSelection")

    useEffect(() => {
        let active = true
        const refresh = async () => {
            setCurrent(today())
            try {
                const captures = await localCaptures.listPending(accountId)
                if (active) {
                    setPending(captures)
                    setError("")
                }
            } catch {
                if (active) setError("Não foi possível verificar as capturas pendentes neste dispositivo.")
            }
        }
        setDate(today())
        setInvalid(new URLSearchParams(location.search).has("data-invalida"))
        void refresh()
        globalThis.addEventListener("pageshow", refresh)
        globalThis.addEventListener("focus", refresh)
        return () => {
            active = false
            globalThis.removeEventListener("pageshow", refresh)
            globalThis.removeEventListener("focus", refresh)
        }
    }, [accountId])

    async function remove(capture: LocalCapture) {
        setBusy(true)
        setError("")
        try {
            await localCaptures.remove(accountId, capture.date)
            setPending((items) => items.filter((item) => item.date !== capture.date))
        } catch {
            setError("Não foi possível apagar as alterações. Tente novamente.")
        } finally {
            setBusy(false)
        }
    }

    return (
        <CaptureLayout>
            {message && <p class="capture-guidance">{message}</p>}
            {invalid && <p class="notification is-warning" role="alert">Data inválida. Escolha uma data completa, existente e até hoje.</p>}
            <form
                class="capture-selection-form"
                onSubmit={(event) => {
                    event.preventDefault()
                    setCurrent(today())
                    if (isCaptureDate(date)) location.assign(`/capturar/${date}`)
                    else setInvalid(true)
                }}
            >
                <DateSelector value={date} max={current} onChange={setDate} />
                <button class="button is-primary" type="submit" disabled={!isCaptureDate(date, current)}>Capturar</button>
            </form>
            {error && <p class="notification is-warning" role="alert">{error}</p>}
            {pending.length > 0 && (
                <section class="capture-pending" aria-labelledby="pending-title">
                    <h3 id="pending-title" class="title is-5">Capturas pendentes</h3>
                    <ul>
                        {pending.map((capture) => (
                            <li key={capture.date}>
                                <a href={`/capturar/${capture.date}`}>{formatCaptureDate(capture.date)}</a>
                                <button
                                    type="button"
                                    class="button is-ghost"
                                    disabled={busy}
                                    onClick={() => setDeleting(capture)}
                                    aria-label={`Apagar captura de ${formatCaptureDate(capture.date)}`}
                                >
                                    <i class="fas fa-trash-can" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <MessagePopup
                open={deleting !== null}
                actions="okCancel"
                confirmLabel="Apagar"
                cancelLabel="Cancelar"
                title={deleting
                    ? `Apagar ${deleting.preservedOrigin ? "as alterações" : "as memórias"} de ${formatCaptureDate(deleting.date)}?`
                    : ""}
                message={deleting?.preservedOrigin
                    ? "As alterações ainda não preservadas serão removidas. As memórias já preservadas desse dia serão mantidas."
                    : "As memórias desta captura ainda não foram preservadas e serão removidas."}
                onResult={(result) => {
                    const capture = deleting
                    setDeleting(null)
                    if (result === "confirm" && capture) void remove(capture)
                }}
            />
        </CaptureLayout>
    )
}
