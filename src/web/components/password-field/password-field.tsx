import { useState } from "react";
import "./password-field.css";

export type PasswordAutocomplete = "off" | "current-password" | "new-password";

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  autoComplete: PasswordAutocomplete;
  hasError: boolean;
  errorMessage: string;
  disabled: boolean;
};

export function PasswordField({
  value,
  onChange,
  autoComplete,
  hasError,
  errorMessage,
  disabled,
}: PasswordFieldProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const iconeInativo = disabled || value.length === 0;
  const classeCorIcone = iconeInativo ? "cor-elemento-inativo" : hasError ? "cor-perigo" : "";
  const id = "cmp001-campo-senha";
  const errorId = "cmp001-mensagem-erro";

  return (
    <div className="cmp001">
      <div className={`campo-texto${hasError ? " cor-perigo" : ""}`}>
        <label htmlFor={id}>Senha</label>
        <div className="cmp001-entrada">
          <input
            id={id}
            className="controle-com-borda"
            type={senhaVisivel ? "text" : "password"}
            value={value}
            autoComplete={autoComplete}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={hasError ? errorId : undefined}
            onChange={(evento) => onChange(evento.currentTarget.value)}
          />
          <button
            className="cmp001-alternar link"
            type="button"
            aria-label={senhaVisivel ? "Ocultar senha" : "Exibir senha"}
            aria-pressed={senhaVisivel}
            disabled={disabled || value.length === 0}
            onClick={() => setSenhaVisivel((visivel) => !visivel)}
          >
            <i className={`fa-solid fa-eye cmp001-icone ${classeCorIcone} ${senhaVisivel ? "cmp001-icone-oculto" : "cmp001-icone-visivel"}`} aria-hidden="true" />
            <i className={`fa-solid fa-eye-slash cmp001-icone ${classeCorIcone} ${senhaVisivel ? "cmp001-icone-visivel" : "cmp001-icone-oculto"}`} aria-hidden="true" />
          </button>
        </div>
        {hasError && <small id={errorId} className="mensagem-erro">{errorMessage}</small>}
      </div>
    </div>
  );
}
