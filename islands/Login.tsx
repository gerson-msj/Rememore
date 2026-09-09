import { useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import PasswordField from "../components/PasswordField.tsx"
import { hasLoginContent } from "../app/utils/login.ts"

export interface LoginProps {
    username: string
    password: string
    failed: boolean
}

export default function Login({ username: initialUsername, password: initialPassword, failed }: LoginProps) {
    const [username, setUsername] = useState(initialUsername)
    const [password, setPassword] = useState(initialPassword)
    const [invalid, setInvalid] = useState(failed)
    const available = !invalid && hasLoginContent(username, password)

    function changeUsername(value: string) {
        if (value !== username) setInvalid(false)
        setUsername(value)
    }

    function changePassword(value: string) {
        if (value !== password) setInvalid(false)
        setPassword(value)
    }

    return (
        <>
            <PageHeader title="Entrar" onBack={() => globalThis.location.assign("/")} />
            <main class="rememore-container page-with-header">
                <form
                    class="login-form"
                    method="post"
                    action="/entrar"
                    onSubmit={(event) => {
                        if (!available) event.preventDefault()
                    }}
                >
                    <div class="field">
                        <label class="label" for="login-username">Nome de usuário</label>
                        <input
                            class="input"
                            id="login-username"
                            name="username"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellcheck={false}
                            value={username}
                            aria-describedby={invalid ? "login-error" : undefined}
                            onInput={(event) => changeUsername(event.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="login-password">Senha</label>
                        <PasswordField
                            id="login-password"
                            name="password"
                            value={password}
                            onValueChange={changePassword}
                            describedBy={invalid ? "login-error" : undefined}
                        />
                    </div>
                    <div class="login-actions">
                        <button class="button is-primary" type="submit" disabled={!available}>Entrar</button>
                        <a href="/redefinir-senha">Redefinir senha</a>
                    </div>
                    {invalid && (
                        <p id="login-error" class="help is-danger login-error" role="alert">
                            Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.
                        </p>
                    )}
                </form>
            </main>
        </>
    )
}
