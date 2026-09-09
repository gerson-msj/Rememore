import { useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import PasswordField from "../components/PasswordField.tsx"
import type { RegistrationErrors, RegistrationService } from "../app/services/auth/contracts.ts"
import { hasLoginContent } from "../app/utils/login.ts"
import { registrationPendingStorage } from "../app/utils/pendingKey.ts"

const messages = {
    invitation: "Não foi possível usar este convite. Confira o código recebido e tente novamente.",
    username: "Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.",
    password: "A senha deve ter pelo menos 6 caracteres."
}

export default function Registration(props: { invitation: string; readonly: boolean }) {
    const [values, setValues] = useState({ invitation: props.invitation, username: "", password: "" })
    const [errors, setErrors] = useState<RegistrationErrors>({})
    const [busy, setBusy] = useState(false)
    const available = hasLoginContent(values.username, values.password) && values.invitation.trim().length > 0 && !busy
    function change(field: keyof typeof values, value: string) {
        if (values[field] !== value) setErrors((previous) => ({ ...previous, [field]: false }))
        setValues((previous) => ({ ...previous, [field]: value }))
    }
    return (
        <>
            <PageHeader title="Criar conta" onBack={() => globalThis.location.assign("/")} />
            <main class="rememore-container page-with-header">
                <form
                    class="login-form"
                    method="post"
                    onSubmit={async (event) => {
                        event.preventDefault()
                        if (!available) return
                        const form = new FormData(event.currentTarget)
                        setBusy(true)
                        try {
                            const response = await fetch(globalThis.location.pathname + globalThis.location.search, {
                                method: "POST",
                                body: form
                            })
                            if (response.redirected) {
                                globalThis.location.assign(response.url)
                                return
                            }
                            if (!response.ok) throw new Error("Cadastro: resposta inesperada")
                            const result: Awaited<ReturnType<RegistrationService["register"]>> = await response.json()
                            if (result.status === "invalid") setErrors(result.errors)
                            else {
                                sessionStorage.setItem(registrationPendingStorage, result.pendingId)
                                globalThis.location.assign("/cadastro/confirmacao")
                            }
                        } finally {
                            setBusy(false)
                        }
                    }}
                >
                    {(["invitation", "username"] as const).map((field) => (
                        <div class="field" key={field}>
                            <label class="label" for={`registration-${field}`}>
                                {field === "invitation" ? "Convite" : "Nome de usuário"}
                            </label>
                            <input
                                class={`input${errors[field] ? " is-danger" : ""}`}
                                id={`registration-${field}`}
                                name={field}
                                value={values[field]}
                                readOnly={field === "invitation" && props.readonly}
                                autoComplete={field === "username" ? "username" : "off"}
                                autoCapitalize="none"
                                spellcheck={false}
                                aria-invalid={!!errors[field]}
                                aria-describedby={errors[field] ? `registration-${field}-error` : undefined}
                                onInput={(event) => change(field, event.currentTarget.value)}
                            />
                            {errors[field] && (
                                <p class="help is-danger" role="alert" id={`registration-${field}-error`}>{messages[field]}</p>
                            )}
                        </div>
                    ))}
                    <div class="field">
                        <label class="label" for="registration-password">Senha</label>
                        <PasswordField
                            id="registration-password"
                            name="password"
                            value={values.password}
                            autoComplete="new-password"
                            onValueChange={(value) => change("password", value)}
                            describedBy={errors.password ? "registration-password-error" : undefined}
                        />
                        {errors.password && <p class="help is-danger" role="alert" id="registration-password-error">{messages.password}</p>}
                    </div>
                    <div class="registration-notices content">
                        <p>
                            Esta é uma versão experimental do Rememore. O sistema já pode ser utilizado, mas ainda está em desenvolvimento e
                            não podemos garantir a manutenção permanente dos dados nesta fase.
                        </p>
                        <p>
                            Suas memórias são pessoais. O conteúdo que você registra não fica disponível para leitura por outras pessoas nem
                            pelo administrador do Rememore.
                        </p>
                    </div>
                    <div class="login-actions">
                        <button class="button is-primary" type="submit" disabled={!available}>Criar conta</button>
                    </div>
                </form>
            </main>
        </>
    )
}
