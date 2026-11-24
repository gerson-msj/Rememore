import { useState } from "react";
import "./elm07.css";

export function Elm07() {
  const [largura, setLargura] = useState(480);
  const [altura, setAltura] = useState(0);
  const [corIcone, setCorIcone] = useState("cor-info");
  const [exibirTextoTerciario, setExibirTextoTerciario] = useState(true);

  return (
    <details className="bloco-teste elm07">
      <summary className="bloco-teste-titulo link">ELM-07 Card clicável</summary>
      <div className="bloco-teste-conteudo">
        <div className="elm07-controles">
          <div className="elm07-largura">
            <label htmlFor="elm07-largura">Largura do contêiner: {largura}px</label>
            <input
              id="elm07-largura"
              type="range"
              min={200}
              max={800}
              step={10}
              value={largura}
              onChange={(evento) => setLargura(Number(evento.currentTarget.value))}
            />
          </div>
          <div className="elm07-dimensao">
            <label htmlFor="elm07-altura">
              Altura mínima do contêiner: {altura === 0 ? "Conteúdo" : `${altura}px`}
            </label>
            <input
              id="elm07-altura"
              type="range"
              min={0}
              max={600}
              step={10}
              value={altura}
              onChange={(evento) => setAltura(Number(evento.currentTarget.value))}
            />
          </div>
          <div className="campo-texto elm07-cor">
            <label htmlFor="elm07-cor-icone">Cor do ícone</label>
            <div className="select-com-icone">
              <select
                id="elm07-cor-icone"
                className="controle-com-borda"
                value={corIcone}
                onChange={(evento) => setCorIcone(evento.currentTarget.value)}
              >
                <option value="cor-padrao">Padrão</option>
                <option value="cor-link">Link</option>
                <option value="cor-perigo">Perigo</option>
                <option value="cor-alerta">Alerta</option>
                <option value="cor-info">Info</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
          <div className="campo-checkbox">
            <input
              id="elm07-texto-terciario"
              className="controle-com-borda"
              type="checkbox"
              checked={exibirTextoTerciario}
              onChange={(evento) => setExibirTextoTerciario(evento.currentTarget.checked)}
            />
            <label htmlFor="elm07-texto-terciario">Exibir texto terciário</label>
          </div>
        </div>
        <div className="elm07-amostra" style={{ width: largura, minHeight: altura }}>
          {/* ELM-07: reproduzir o botão completo; título e secundário obrigatórios,
              terciário opcional. O contêiner consumidor fornece largura e altura. */}
          <button className="card-clicavel controle-com-borda" type="button">
            <i
              className={`card-clicavel-icone fa-solid fa-feather-pointed texto-cor-selecionada ${corIcone}`}
              aria-hidden="true"
            />
            <span className="card-clicavel-textos">
              <span className="card-clicavel-titulo">Capturar memórias</span>
              <span className="card-clicavel-descricao">
                Registre os momentos que deseja preservar.
              </span>
              {exibirTextoTerciario && (
                <span className="card-clicavel-terciario">
                  Cada dia guarda uma história.
                  <br />
                  Preserve suas memórias.
                </span>
              )}
            </span>
          </button>
        </div>
      </div>
    </details>
  );
}
