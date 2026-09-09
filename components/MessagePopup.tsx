import { useEffect, useId, useRef, useState } from "preact/hooks"

export const popupActions = {
    yesNo: ["Sim", "Não"],
    yes: ["Sim"],
    no: ["Não"],
    okCancel: ["OK", "Cancelar"],
    ok: ["OK"],
    none: []
} as const

export type PopupResult = "confirm" | "cancel"
export type PopupColor = "primary" | "link" | "info" | "success" | "warning" | "danger"

interface MessagePopupProps {
    open: boolean
    message: string
    actions: keyof typeof popupActions
    confirmLabel?: string
    cancelLabel?: string
    icon?: string
    color?: PopupColor
    onResult: (result: PopupResult) => void
}

export default function MessagePopup({ open, message, actions, confirmLabel, cancelLabel, icon, color, onResult }: MessagePopupProps) {
    const dialog = useRef<HTMLDialogElement>(null)
    const messageId = useId()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const element = dialog.current!
        if (open) {
            if (!element.open) element.showModal()
            const frame = requestAnimationFrame(() => setVisible(true))
            return () => cancelAnimationFrame(frame)
        }
        setVisible(false)
        // A duração corresponde à transição CSS; não representa fechamento funcional temporizado.
        const timer = setTimeout(() => element.close(), 180)
        return () => clearTimeout(timer)
    }, [open])

    return (
        <dialog
            ref={dialog}
            class={`message-popup${visible ? " is-visible" : ""}${color ? ` popup-${color}` : ""}`}
            aria-labelledby={messageId}
            tabIndex={-1}
            onKeyDown={(event) => {
                if (event.key !== "Escape") return
                // Interceptar a tecla evita o fechamento nativo independente do estado do chamador.
                event.preventDefault()
                event.stopPropagation()
                if (open && !event.repeat) onResult("cancel")
            }}
            onCancel={(event) => {
                event.preventDefault()
                if (open) onResult("cancel")
            }}
            onClick={(event) => {
                if (!open || event.target !== event.currentTarget) return
                const box = event.currentTarget.getBoundingClientRect()
                if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) {
                    onResult("cancel")
                }
            }}
        >
            <div class="message-popup-content">
                {icon && <i class={`${icon} message-popup-icon`} aria-hidden="true" />}
                <p id={messageId}>{message}</p>
            </div>
            {popupActions[actions].length > 0 && (
                <div class="message-popup-actions">
                    {popupActions[actions].map((label) => (
                        <button
                            key={label}
                            type="button"
                            class="button"
                            disabled={!open}
                            onClick={() => onResult(label === "Sim" || label === "OK" ? "confirm" : "cancel")}
                        >
                            {label === "Sim" || label === "OK" ? confirmLabel ?? label : cancelLabel ?? label}
                        </button>
                    ))}
                </div>
            )}
        </dialog>
    )
}
