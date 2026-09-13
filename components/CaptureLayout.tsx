import type { ComponentChildren } from "preact"
import { useRef, useState } from "preact/hooks"
import PageHeader from "./PageHeader.tsx"
import MessagePopup from "./MessagePopup.tsx"

export default function CaptureLayout({ children, back = "/principal" }: { children: ComponentChildren; back?: string }) {
    const [logout, setLogout] = useState(false)
    const form = useRef<HTMLFormElement>(null)
    return (
        <>
            <PageHeader title="Capturar" onBack={() => location.assign(back)} onLogout={() => setLogout(true)} />
            <main class="rememore-container page-with-header capture-page">{children}</main>
            <form ref={form} method="post" action="/principal" hidden />
            <MessagePopup
                open={logout}
                message="Deseja realmente sair?"
                actions="yesNo"
                onResult={(result) => {
                    setLogout(false)
                    if (result === "confirm") form.current!.requestSubmit()
                }}
            />
        </>
    )
}
