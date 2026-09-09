import { useRef, useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import MessagePopup, { type PopupResult } from "../components/MessagePopup.tsx"

export default function Principal() {
    const [confirmLogout, setConfirmLogout] = useState(false)
    const form = useRef<HTMLFormElement>(null)

    function receiveResult(result: PopupResult) {
        setConfirmLogout(false)
        if (result === "confirm") form.current!.requestSubmit()
    }

    return (
        <>
            <PageHeader title="Rememore" onLogout={() => setConfirmLogout(true)} />
            <form ref={form} method="post" action="/principal" hidden />
            <MessagePopup
                open={confirmLogout}
                message="Deseja realmente sair?"
                actions="yesNo"
                onResult={receiveResult}
            />
        </>
    )
}
