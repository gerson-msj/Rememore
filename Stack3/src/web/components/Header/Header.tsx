import { useHeader } from "./HeaderContext";
import "./header.css";

export function Header() {
  const { configuracao } = useHeader();

  return (
    <header className="cabecalho">
      <div className="cabecalho-container">
        <div className="cabecalho-coluna-esquerda">
          {configuracao.voltar ? (
            <button
              className="cabecalho-acao link"
              type="button"
              aria-label="Voltar"
              onClick={configuracao.voltar}
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          ) : (
            <i className="fa-solid fa-book-open" aria-hidden="true" />
          )}
        </div>
        <div className="cabecalho-coluna-central">
          <h1>{configuracao.titulo}</h1>
        </div>
        <div className="cabecalho-coluna-direita">
          {configuracao.sair && (
            <button
              className="cabecalho-acao link-perigo"
              type="button"
              aria-label="Sair"
              onClick={configuracao.sair}
            >
              <i
                className="fa-solid fa-arrow-right-from-bracket"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
