import { useEffect, useId, useRef, useState } from "react";
import "./new-key-confirmation.css";

type NewKeyConfirmationProps = {
  chave: string;
};

const mensagemCopiada = "Chave copiada. Guarde-a em um local seguro.";
const duracaoFeedbackMs = 5000;

function copiarComFallback(valor: string) {
  const campoTemporario = document.createElement("textarea");
  campoTemporario.value = valor;
  campoTemporario.setAttribute("readonly", "");
  campoTemporario.style.position = "fixed";
  campoTemporario.style.opacity = "0";
  document.body.appendChild(campoTemporario);
  campoTemporario.select();

  let copiado = false;
  try {
    copiado = document.execCommand("copy");
  } finally {
    campoTemporario.remove();
  }

  return copiado;
}

export function NewKeyConfirmation({ chave }: NewKeyConfirmationProps) {
  const idCampo = useId();
  const [feedbackVisivel, setFeedbackVisivel] = useState(false);
  const temporizadorRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (temporizadorRef.current !== null) {
      window.clearTimeout(temporizadorRef.current);
    }
  }, []);

  function apresentarFeedback() {
    setFeedbackVisivel(true);
    if (temporizadorRef.current !== null) {
      window.clearTimeout(temporizadorRef.current);
    }
    temporizadorRef.current = window.setTimeout(() => {
      setFeedbackVisivel(false);
      temporizadorRef.current = null;
    }, duracaoFeedbackMs);
  }

  async function copiarChave() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(chave);
      } else if (!copiarComFallback(chave)) {
        return;
      }
      apresentarFeedback();
    } catch {
      if (copiarComFallback(chave)) {
        apresentarFeedback();
      }
    }
  }

  return (
    <div className="cmp002">
      <div className="cmp002-conteudo">
        <div className="campo-texto">
          <label htmlFor={idCampo}>Chave de redefinição de senha</label>
          <div className="controle-com-icone">
            <input
              id={idCampo}
              className="controle-com-borda"
              type="text"
              value={chave}
              readOnly
            />
            <button
              className="botao-icone-controle link"
              type="button"
              aria-label="Copiar chave"
              onClick={copiarChave}
            >
              <i className="fa-solid fa-copy" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {feedbackVisivel && (
        <small className="cmp002-feedback" role="status" aria-live="polite">
          {mensagemCopiada}
        </small>
      )}
    </div>
  );
}
