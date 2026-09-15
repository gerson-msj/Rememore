import type { ComponentChildren } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import PageHeader from "./PageHeader.tsx"
import MessagePopup from "./MessagePopup.tsx"

export default function CaptureLayout({ children, back = "/principal", onLeave, day = false }: {
    children: ComponentChildren
    back?: string
    onLeave?: () => void
    day?: boolean
}) {
    const [logout, setLogout] = useState(false)
    const form = useRef<HTMLFormElement>(null)
    const layout = useRef<HTMLDivElement>(null)
    const header = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!day || !header.current) return
        const measure = () =>
            layout.current?.style.setProperty("--capture-header-height", `${header.current!.getBoundingClientRect().height}px`)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(header.current)
        return () => observer.disconnect()
    }, [day])
    return (
        <div ref={layout} class={day ? "capture-day-layout" : undefined}>
            <div ref={header} class={day ? "capture-day-header" : undefined}>
                <PageHeader
                    title="Capturar"
                    onBack={() => {
                        onLeave?.()
                        location.assign(back)
                    }}
                    onLogout={() => setLogout(true)}
                />
            </div>
            <main class={`rememore-container page-with-header capture-page${day ? " capture-day-page" : ""}`}>{children}</main>
            <form ref={form} method="post" action="/principal" hidden />
            <MessagePopup
                open={logout}
                message="Deseja realmente sair?"
                actions="yesNo"
                onResult={(result) => {
                    setLogout(false)
                    if (result === "confirm") {
                        onLeave?.()
                        form.current!.requestSubmit()
                    }
                }}
            />
        </div>
    )
}
