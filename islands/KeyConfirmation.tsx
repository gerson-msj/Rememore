import { useEffect, useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import NewKeyConfirmation from "../components/NewKeyConfirmation.tsx"

export default function KeyConfirmation({ title, endpoint, storageKey, message }: {
    title: string
    endpoint: string
    storageKey: string
    message: string
}) {
    const [key, setKey] = useState<string | null>(null)
    useEffect(() => {
        let active = true
        async function restore() {
            setKey(null)
            const pendingId = sessionStorage.getItem(storageKey)
            if (!pendingId) {
                globalThis.location.replace("/")
                return
            }
            const response = await fetch(endpoint, {
                method: "POST",
                body: new URLSearchParams({ pendingId, intent: "read" })
            })
            if (response.redirected) {
                sessionStorage.removeItem(storageKey)
                globalThis.location.replace(response.url)
                return
            }
            if (!response.ok) throw new Error("Confirmação: resposta inesperada")
            const data: { key: string } = await response.json()
            if (active) setKey(data.key)
        }
        const onShow = (event: PageTransitionEvent) => {
            if (event.persisted) void restore()
        }
        const onHide = () => setKey(null)
        void restore()
        globalThis.addEventListener("pageshow", onShow)
        globalThis.addEventListener("pagehide", onHide)
        return () => {
            active = false
            globalThis.removeEventListener("pageshow", onShow)
            globalThis.removeEventListener("pagehide", onHide)
        }
    }, [endpoint, storageKey])
    if (!key) return null
    return (
        <>
            <PageHeader title={title} />
            <main class="rememore-container page-with-header">
                <NewKeyConfirmation
                    newKey={key}
                    message={message}
                    information="Esta chave será exibida somente agora. O Rememore não poderá mostrá-la novamente depois que você sair desta página."
                    onConfirm={async () => {
                        const pendingId = sessionStorage.getItem(storageKey) ?? ""
                        const response = await fetch(endpoint, {
                            method: "POST",
                            body: new URLSearchParams({ pendingId, intent: "confirm" })
                        })
                        if (!response.ok) throw new Error("Confirmação: resposta inesperada")
                        sessionStorage.removeItem(storageKey)
                        setKey(null)
                        globalThis.location.replace(response.redirected ? response.url : "/principal")
                    }}
                />
            </main>
        </>
    )
}
