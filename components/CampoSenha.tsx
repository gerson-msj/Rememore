import { useState } from "preact/hooks"

interface PropriedadesCampoSenha {
    id: string
    name: string
    value: string
    aoAlterarValor: (valor: string) => void
    descritoPor?: string
    autoComplete?: "current-password" | "new-password"
}

export default function CampoSenha(
    { id, name: nome, value: valor, aoAlterarValor, descritoPor, autoComplete: preenchimentoAutomatico = "current-password" }:
        PropriedadesCampoSenha
) {
    const [visivel, definirVisivel] = useState(false)
    return (
        <div class="campo-senha">
            <input
                class="input"
                id={id}
                name={nome}
                type={visivel ? "text" : "password"}
                value={valor}
                autoComplete={preenchimentoAutomatico}
                aria-describedby={descritoPor}
                onInput={(evento) => aoAlterarValor(evento.currentTarget.value)}
            />
            <button
                class="senha-visibilidade"
                type="button"
                aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
                aria-controls={id}
                aria-pressed={visivel}
                onClick={() => definirVisivel(!visivel)}
            >
                <i class={visivel ? "fas fa-eye-slash" : "fas fa-eye"} aria-hidden="true" />
            </button>
        </div>
    )
}
