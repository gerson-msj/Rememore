import { Fragment } from "react";
import { coresSemanticas } from "@web/styles/cores";

export function Elm03() {
  return (
    <details className="bloco-teste">
      <summary className="bloco-teste-titulo link">ELM-03 Link</summary>
      <div className="bloco-teste-conteudo">
        <p>Variação: Link</p>
        {/* ELM-03, link: reproduzir o elemento abaixo com o destino adequado ao uso. */}
        <a className="link" href="/lab">
          Exemplo de link
        </a>
        {/* ELM-03, link colorido: aplicar a classe de cor semântica e o destino adequado. */}
        {coresSemanticas.filter(({ cor }) => cor !== "padrao" && cor !== "link").map(({ cor, rotulo }) => (
          <Fragment key={cor}>
            <p>Variação: Link {rotulo.toLocaleLowerCase("pt-BR")}</p>
            <a className={`link cor-${cor}`} href="/lab">
              Exemplo de link {rotulo.toLocaleLowerCase("pt-BR")}
            </a>
          </Fragment>
        ))}
      </div>
    </details>
  );
}
