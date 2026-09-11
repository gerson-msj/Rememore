import { useRef, useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import MessagePopup, { type PopupResult } from "../components/MessagePopup.tsx"

interface ProtectedShellProps {
    title: string
}

export default function ProtectedShell({ title }: ProtectedShellProps) {
    const [confirmLogout, setConfirmLogout] = useState(false)
    const form = useRef<HTMLFormElement>(null)

    function receiveLogoutResult(result: PopupResult) {
        setConfirmLogout(false)
        if (result === "confirm") form.current!.requestSubmit()
    }

    return (
        <>
            <PageHeader
                title={title}
                onBack={() => globalThis.location.assign("/principal")}
                onLogout={() => setConfirmLogout(true)}
            />
            <main class="rememore-container page-with-header" />
            <form ref={form} method="post" action="/principal" hidden />
            <MessagePopup
                open={confirmLogout}
                message="Deseja realmente sair?"
                actions="yesNo"
                onResult={receiveLogoutResult}
            />
        </>
    )
}
