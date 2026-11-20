import { useId, useState } from "react";
import "./password-field.css";

export type PasswordAutocomplete = "off" | "current-password" | "new-password";

type PasswordFieldProps = {
  inputId?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete: PasswordAutocomplete;
  hasError: boolean;
  errorMessage: string;
  errorMessageId?: string;
  renderErrorMessage?: boolean;
  disabled: boolean;
};

export function PasswordField({
  inputId,
  value,
  onChange,
  autoComplete,
  hasError,
  errorMessage,
  errorMessageId,
  renderErrorMessage = true,
  disabled,
}: PasswordFieldProps) {
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const iconeInativo = disabled || value.length === 0;
  const classeCorIcone = iconeInativo ? "cor-elemento-inativo" : hasError ? "texto-cor-selecionada" : "";
  const idBase = useId();
  const id = inputId ?? `${idBase}-campo-senha`;
  const errorId = errorMessageId ?? `${idBase}-mensagem-erro`;

  return (
    <div className="cmp001">
      <div className={`campo-texto${hasError ? " cor-perigo" : ""}`}>
        <label htmlFor={id}>Senha</label>
        <div className="controle-com-icone cmp001-entrada">
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
            className="botao-icone-controle cmp001-alternar link"
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
        {hasError && renderErrorMessage && <small id={errorId} className="mensagem-erro">{errorMessage}</small>}
      </div>
    </div>
  );
}
