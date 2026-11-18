import { useState } from "react";
import { NewKeyConfirmation } from "@web/components/new-key-confirmation/new-key-confirmation";
import "./cmp002.css";

const chaveInicial = "chave-de-teste-1234567890";

export function Cmp002() {
  const [chaveTeste, setChaveTeste] = useState(chaveInicial);
  const [chaveAplicada, setChaveAplicada] = useState(chaveInicial);

  function limparChave() {
    setChaveTeste("");
    setChaveAplicada("");
  }

  return (
    <details className="bloco-teste cmp002-lab">
      <summary className="bloco-teste-titulo link">CMP-002 Confirmação de nova chave</summary>
      <div className="bloco-teste-conteudo">
        <div className="cmp002-lab-controles">
          <div className="campo-texto">
            <label htmlFor="cmp002-lab-chave">Chave sob controle do Lab</label>
            <input
              id="cmp002-lab-chave"
              className="controle-com-borda"
              type="text"
              value={chaveTeste}
              onChange={(evento) => setChaveTeste(evento.currentTarget.value)}
            />
          </div>
          <div className="grupo-botoes">
            <button type="button" onClick={() => setChaveAplicada(chaveTeste)}>Aplicar chave</button>
            <button type="button" onClick={limparChave}>Limpar chave</button>
          </div>
        </div>

        <p>Instância real do CMP-002:</p>
        <NewKeyConfirmation chave={chaveAplicada} />
      </div>
    </details>
  );
}
