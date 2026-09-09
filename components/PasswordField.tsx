import { useState } from "preact/hooks"

interface PasswordFieldProps {
    id: string
    name: string
    value: string
    onValueChange: (value: string) => void
    describedBy?: string
    autoComplete?: "current-password" | "new-password"
}

export default function PasswordField(
    { id, name, value, onValueChange, describedBy, autoComplete = "current-password" }: PasswordFieldProps
) {
    const [visible, setVisible] = useState(false)
    return (
        <div class="password-field">
            <input
                class="input"
                id={id}
                name={name}
                type={visible ? "text" : "password"}
                value={value}
                autoComplete={autoComplete}
                aria-describedby={describedBy}
                onInput={(event) => onValueChange(event.currentTarget.value)}
            />
            <button
                class="password-visibility"
                type="button"
                aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
                aria-controls={id}
                aria-pressed={visible}
                onClick={() => setVisible(!visible)}
            >
                <i class={visible ? "fas fa-eye-slash" : "fas fa-eye"} aria-hidden="true" />
            </button>
        </div>
    )
}
