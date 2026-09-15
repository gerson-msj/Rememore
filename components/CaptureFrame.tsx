import type { ComponentChildren } from "preact"
import { useRef } from "preact/hooks"
import { formatCaptureDateLong } from "../app/utils/captureDate.ts"

export const captureTabs = ["Registrar e organizar", "Categorizar e Tom", "Revisar e Preservar"] as const
export type CaptureTab = typeof captureTabs[number]

interface CaptureFrameProps {
    date: string
    tab: CaptureTab
    onTab: (tab: CaptureTab) => void
    memoryOpen: boolean
    actions: ComponentChildren
    children: ComponentChildren
}

/** Common capture toolbar and tabs; only the panel below participates in document scrolling. */
export default function CaptureFrame({ date, tab, onTab, memoryOpen, actions, children }: CaptureFrameProps) {
    const buttons = useRef<(HTMLButtonElement | null)[]>([])
    const index = captureTabs.indexOf(tab)
    return (
        <>
            <div class="capture-day-controls">
                <div class="capture-day-toolbar">
                    <time class="capture-day-date" dateTime={date}>{formatCaptureDateLong(date)}</time>
                    <div class="buttons has-addons capture-day-actions" role="group" aria-label="Ações da captura">{actions}</div>
                </div>
                {!memoryOpen && (
                    <div class="capture-day-tabs" role="tablist" aria-label="Etapas da captura">
                        {captureTabs.map((label, position) => (
                            <button
                                ref={(element) => {
                                    buttons.current[position] = element
                                }}
                                key={label}
                                id={`capture-tab-${position}`}
                                type="button"
                                role="tab"
                                aria-selected={tab === label}
                                aria-controls={`capture-panel-${position}`}
                                tabIndex={tab === label ? 0 : -1}
                                onClick={() => onTab(label)}
                                onKeyDown={(event) => {
                                    let next = position
                                    if (event.key === "ArrowRight") next = (position + 1) % captureTabs.length
                                    else if (event.key === "ArrowLeft") next = (position + captureTabs.length - 1) % captureTabs.length
                                    else if (event.key === "Home") next = 0
                                    else if (event.key === "End") next = captureTabs.length - 1
                                    else return
                                    event.preventDefault()
                                    onTab(captureTabs[next])
                                    buttons.current[next]?.focus()
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {memoryOpen
                ? <section class="capture-day-content" aria-label="Memória">{children}</section>
                : captureTabs.map((label, position) => (
                    <section
                        key={label}
                        id={`capture-panel-${position}`}
                        role="tabpanel"
                        aria-labelledby={`capture-tab-${position}`}
                        tabIndex={0}
                        hidden={index !== position}
                        class="capture-day-content"
                    >
                        {index === position && children}
                    </section>
                ))}
        </>
    )
}
