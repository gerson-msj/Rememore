import { useEffect, useRef, useState } from "preact/hooks"
import CaptureLayout from "../components/CaptureLayout.tsx"
import CaptureFrame, { type CaptureTab } from "../components/CaptureFrame.tsx"
import { localDatabase } from "../app/services/local/database.ts"
import { type LocalCapture, localCaptures } from "../app/services/local/captures.ts"
import { prepareCapture } from "../app/services/capture.ts"
import { isCaptureDate } from "../app/utils/captureDate.ts"
import { acquireCaptureLock, type CaptureLease } from "../app/services/capture/lock.ts"
import { CaptureOpenSession } from "../app/services/capture/openSession.ts"

export default function CaptureDay({ accountId, date }: { accountId: string; date: string }) {
    const [workspace, setWorkspace] = useState<LocalCapture | null>(null)
    const [failure, setFailure] = useState("")
    const [changeError, setChangeError] = useState("")
    const [busy, setBusy] = useState(false)
    const changing = useRef(false)
    const lease = useRef<CaptureLease | null>(null)
    const openSession = useRef<CaptureOpenSession | null>(null)
    const [sessionWarning, setSessionWarning] = useState(false)
    const [tab, setTab] = useState<CaptureTab>("Registrar e organizar")
    // undefined = capture tabs; null = new memory shell; string = existing memory shell.
    const [memoryId, setMemoryId] = useState<string | null | undefined>(undefined)
    const listScroll = useRef(0)
    const memory = workspace?.memories.find((item) => item.id === memoryId)

    function openMemory(id: string | null) {
        listScroll.current = globalThis.scrollY
        setMemoryId(id)
        globalThis.scrollTo(0, 0)
    }

    function returnToCapture() {
        setMemoryId(undefined)
        setTab("Registrar e organizar")
        requestAnimationFrame(() => globalThis.scrollTo(0, listScroll.current))
    }

    function endSession() {
        try {
            openSession.current?.end()
        } catch {
            setSessionWarning(true)
        }
    }

    useEffect(() => {
        let active = true
        let owned: CaptureLease | null = null
        const hide = () => {
            active = false
            lease.current = null
            void owned?.release()
        }
        const show = (event: PageTransitionEvent) => {
            // A BFCache page no longer owns its lock. Re-enter before allowing any operation.
            if (event.persisted) {
                endSession()
                location.replace(location.href)
            }
        }
        globalThis.addEventListener("pagehide", hide)
        globalThis.addEventListener("pageshow", show)
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
                let resumeWorkspaceId: string | undefined
                try {
                    openSession.current = new CaptureOpenSession(accountId, date, sessionStorage)
                    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
                    resumeWorkspaceId = openSession.current.resume(navigation?.type ?? "navigate")
                } catch {
                    if (active) setSessionWarning(true)
                }
                owned = await acquireCaptureLock(accountId, date)
                if (!active) {
                    await owned?.release()
                    return
                }
                if (!owned) {
                    setFailure("Esta captura está aberta em outra aba ou janela. Continue o trabalho na aba ou janela original.")
                    return
                }
                lease.current = owned
                const capture = await owned.run(() => prepareCapture(accountId, date, undefined, undefined, resumeWorkspaceId))
                if (active) {
                    try {
                        openSession.current?.begin(capture.workspaceId)
                    } catch {
                        setSessionWarning(true)
                    }
                    if (import.meta.env.DEV) {
                        console.info("[Capturar local]", {
                            date,
                            revision: capture.originRevision,
                            editWindowDays: capture.editWindowDays,
                            changed: capture.changed,
                            memories: capture.memories.length,
                            workspaceId: capture.workspaceId
                        })
                    }
                    setWorkspace(capture)
                }
            } catch {
                lease.current = null
                await owned?.release()
                if (active) setFailure("Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.")
            }
        }
        void open()
        return () => {
            hide()
            globalThis.removeEventListener("pagehide", hide)
            globalThis.removeEventListener("pageshow", show)
        }
    }, [accountId, date])

    async function markChanged() {
        if (!workspace || changing.current || !lease.current) return
        changing.current = true
        setBusy(true)
        setChangeError("")
        try {
            await lease.current.run(() => localCaptures.markChanged(accountId, date))
            setWorkspace({ ...workspace, changed: true })
        } catch {
            setChangeError("Não foi possível marcar a captura como alterada. Tente novamente.")
        } finally {
            changing.current = false
            setBusy(false)
        }
    }

    return (
        <CaptureLayout back="/capturar" onLeave={endSession} day>
            {sessionWarning && (
                <p class="notification is-warning" role="alert">
                    Não foi possível proteger o rascunho contra recarregamento. Seu texto continua nesta tela. Confirme a edição antes de
                    sair ou recarregar.
                </p>
            )}
            {failure
                ? (
                    <>
                        <p class="notification is-warning" role="alert">{failure}</p>
                        <a class="button" href="/principal">Voltar à Principal</a>
                    </>
                )
                : workspace
                ? (
                    <CaptureFrame
                        date={date}
                        tab={tab}
                        onTab={(next) => {
                            setTab(next)
                            globalThis.scrollTo(0, 0)
                        }}
                        memoryOpen={memoryId !== undefined}
                        actions={memoryId !== undefined
                            ? (
                                <>
                                    <button
                                        type="button"
                                        class="button"
                                        title="Voltar à captura"
                                        aria-label="Voltar à captura"
                                        onClick={returnToCapture}
                                    >
                                        <span class="icon">
                                            <i class="fas fa-chevron-left" aria-hidden="true" />
                                        </span>
                                    </button>
                                    {memoryId === null && (
                                        <button
                                            type="button"
                                            class="button is-success"
                                            title="Confirmar Memória"
                                            aria-label="Confirmar Memória"
                                            disabled
                                        >
                                            <span class="icon">
                                                <i class="fas fa-bookmark" aria-hidden="true" />
                                            </span>
                                        </button>
                                    )}
                                </>
                            )
                            : tab === "Registrar e organizar"
                            ? (
                                <button
                                    type="button"
                                    class="button is-primary"
                                    title="Adicionar memória"
                                    aria-label="Adicionar memória"
                                    onClick={() => openMemory(null)}
                                >
                                    <span class="icon">
                                        <i class="fas fa-plus" aria-hidden="true" />
                                    </span>
                                </button>
                            )
                            : null}
                    >
                        {memoryId !== undefined
                            ? memoryId === null
                                ? <textarea class="textarea capture-memory-input" rows={5} aria-label="Texto da memória" disabled />
                                : <p class="capture-memory-text">{memory?.content}</p>
                            : tab === "Registrar e organizar" && (
                                <>
                                    <ul class="capture-memory-list">
                                        {[...workspace.memories].sort((a, b) => a.order - b.order).map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    class="capture-memory-preview"
                                                    onClick={() => openMemory(item.id)}
                                                >
                                                    <span>{item.content}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div class="capture-development-scaffold">
                                        <p class="mb-4">Controle temporário de desenvolvimento</p>
                                        <button type="button" class="button" disabled={busy} onClick={markChanged}>
                                            Marcar como alterada
                                        </button>
                                        <p class="mt-4" role="status">
                                            {workspace.changed ? "Captura com alterações pendentes." : "Captura sem alterações."}
                                        </p>
                                        {changeError && <p class="notification is-warning mt-4" role="alert">{changeError}</p>}
                                    </div>
                                </>
                            )}
                    </CaptureFrame>
                )
                : <p role="status">Preparando captura…</p>}
        </CaptureLayout>
    )
}
