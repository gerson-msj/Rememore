import { useEffect, useRef, useState } from "preact/hooks"
import CaptureLayout from "../components/CaptureLayout.tsx"
import { localDatabase } from "../app/services/local/database.ts"
import { type LocalCapture, localCaptures } from "../app/services/local/captures.ts"
import { prepareCapture } from "../app/services/capture.ts"
import { formatCaptureDate, isCaptureDate } from "../app/utils/captureDate.ts"

export default function CaptureDay({ accountId, date }: { accountId: string; date: string }) {
    const [workspace, setWorkspace] = useState<LocalCapture | null>(null)
    const [failure, setFailure] = useState("")
    const [changeError, setChangeError] = useState("")
    const [busy, setBusy] = useState(false)
    const changing = useRef(false)

    useEffect(() => {
        let active = true
        async function open() {
            if (!isCaptureDate(date)) {
                location.replace("/capturar?data-invalida")
                return
            }
            const availability = await localDatabase.diagnose()
            if (!active) return
            if (availability.status !== "operational") {
                setFailure(
                    availability.status === "unsupported"
                        ? "Não é possível iniciar uma captura neste navegador. O Rememore precisa do armazenamento local do navegador para proteger suas memórias enquanto você trabalha. Tente utilizar uma versão atualizada de um navegador compatível."
                        : "Não foi possível acessar o armazenamento local. O Rememore precisa desse recurso para proteger suas memórias enquanto você trabalha. Verifique as configurações de privacidade do navegador ou tente novamente em uma janela de navegação normal."
                )
                return
            }
            try {
                const capture = await prepareCapture(accountId, date)
                if (active) setWorkspace(capture)
            } catch {
                if (active) setFailure("Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.")
            }
        }
        void open()
        return () => {
            active = false
        }
    }, [accountId, date])

    async function markChanged() {
        if (!workspace || changing.current) return
        changing.current = true
        setBusy(true)
        setChangeError("")
        try {
            await localCaptures.markChanged(accountId, date)
            setWorkspace({ ...workspace, changed: true })
        } catch {
            setChangeError("Não foi possível marcar a captura como alterada. Tente novamente.")
        } finally {
            changing.current = false
            setBusy(false)
        }
    }

    return (
        <CaptureLayout back="/capturar">
            {failure
                ? (
                    <>
                        <p class="notification is-warning" role="alert">{failure}</p>
                        <a class="button" href="/principal">Voltar à Principal</a>
                    </>
                )
                : workspace
                ? (
                    <>
                        <h3 class="title is-4">
                            <time dateTime={date}>{formatCaptureDate(date)}</time>
                        </h3>
                        <p class="mb-4">Controle temporário de desenvolvimento</p>
                        <button type="button" class="button" disabled={busy} onClick={markChanged}>Marcar como alterada</button>
                        <p class="mt-4" role="status">
                            {workspace.changed ? "Captura com alterações pendentes." : "Captura sem alterações."}
                        </p>
                        {changeError && <p class="notification is-warning mt-4" role="alert">{changeError}</p>}
                    </>
                )
                : <p role="status">Preparando captura…</p>}
        </CaptureLayout>
    )
}
