import { useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import PasswordField from "../components/PasswordField.tsx"
import type { PasswordResetService } from "../app/services/auth/contracts.ts"
import { hasLoginContent } from "../app/utils/login.ts"
import { passwordResetPendingStorage } from "../app/utils/pendingKey.ts"

export default function ResetPassword({ resetKey }: { resetKey: string }) {
    const [username, setUsername] = useState("")
    const [key, setKey] = useState(resetKey)
    const [password, setPassword] = useState("")
    const [invalidPassword, setInvalidPassword] = useState(false)
    const [rejected, setRejected] = useState(false)
    const [busy, setBusy] = useState(false)
    const available = hasLoginContent(username, password) && key.length > 0 && !busy

    return (
        <>
            <PageHeader title="Redefinir senha" onBack={() => globalThis.location.assign("/entrar")} />
            <main class="rememore-container page-with-header">
                <form
                    class="login-form"
                    method="post"
                    action="/redefinir-senha"
                    onSubmit={async (event) => {
                        event.preventDefault()
                        if (!available) return
                        if (password.length < 6) {
                            setInvalidPassword(true)
                            return
                        }
                        const form = new FormData(event.currentTarget)
                        setBusy(true)
                        try {
                            const response = await fetch("/redefinir-senha", { method: "POST", body: form })
                            if (response.redirected) {
                                globalThis.location.assign(response.url)
                                return
                            }
                            if (!response.ok) throw new Error("Redefinição: resposta inesperada")
                            const result: Awaited<ReturnType<PasswordResetService["reset"]>> | { status: "invalidPassword" } =
                                await response.json()
                            if (result.status === "invalidPassword") setInvalidPassword(true)
                            else if (result.status === "invalid") setRejected(true)
                            else {
                                sessionStorage.setItem(passwordResetPendingStorage, result.pendingId)
                                globalThis.location.assign("/redefinir-senha/confirmacao")
                            }
                        } finally {
                            setBusy(false)
                        }
                    }}
                >
                    <div class="field">
                        <label class="label" for="reset-username">Nome de usuário</label>
                        <input
                            class="input"
                            id="reset-username"
                            name="username"
                            value={username}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellcheck={false}
                            aria-describedby={rejected ? "reset-error" : undefined}
                            onInput={(event) => {
                                const value = event.currentTarget.value
                                if (value !== username) setRejected(false)
                                setUsername(value)
                            }}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="reset-key">Chave de redefinição</label>
                        <input
                            class="input"
                            id="reset-key"
                            name="key"
                            value={key}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellcheck={false}
                            aria-describedby={rejected ? "reset-error" : undefined}
                            onInput={(event) => {
                                const value = event.currentTarget.value
                                if (value !== key) setRejected(false)
                                setKey(value)
                            }}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="reset-password">Nova senha</label>
                        <PasswordField
                            id="reset-password"
                            name="password"
                            value={password}
                            autoComplete="new-password"
                            describedBy={invalidPassword ? "reset-password-error" : undefined}
                            onValueChange={(value) => {
                                if (value !== password) setInvalidPassword(false)
                                setPassword(value)
                            }}
                        />
                        {invalidPassword && (
                            <p class="help is-danger" role="alert" id="reset-password-error">
                                A senha deve ter pelo menos 6 caracteres.
                            </p>
                        )}
                    </div>
                    <div class="login-actions">
                        <button class="button is-primary" type="submit" disabled={!available}>Redefinir senha</button>
                    </div>
                    {rejected && (
                        <p class="help is-danger login-error" role="alert" id="reset-error">
                            Não foi possível redefinir a senha. Confira as informações e tente novamente.
                        </p>
                    )}
                </form>
            </main>
        </>
    )
}
