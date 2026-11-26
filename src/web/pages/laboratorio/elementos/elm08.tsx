import { useState, type CSSProperties } from "react";
import "./elm08.css";

export function Elm08() {
  const [quantidade, setQuantidade] = useState(8);
  const [limite, setLimite] = useState(5);
  const [ultimaAcao, setUltimaAcao] = useState("");

  return (
    <details className="bloco-teste elm08">
      <summary className="bloco-teste-titulo link">ELM-08 Lista com ações</summary>
      <div className="bloco-teste-conteudo">
        <div className="elm08-controles">
          <div className="campo-texto">
            <label htmlFor="elm08-quantidade">Quantidade de itens</label>
            <select id="elm08-quantidade" className="controle-com-borda" value={quantidade} onChange={(evento) => setQuantidade(Number(evento.currentTarget.value))}>
              <option value={1}>1 item</option>
              <option value={5}>5 itens</option>
              <option value={8}>8 itens</option>
            </select>
          </div>
          <div className="campo-texto">
            <label htmlFor="elm08-limite">Limite de itens visíveis</label>
            <select id="elm08-limite" className="controle-com-borda" value={limite} onChange={(evento) => setLimite(Number(evento.currentTarget.value))}>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((valor) => <option key={valor} value={valor}>{valor}</option>)}
            </select>
          </div>
        </div>

        {/* ELM-08: reproduzir a estrutura a partir da lista. O contêiner define a largura.
            O limite padrão é cinco. O texto pode ser um link quando houver destino. */}
        <ul
          className="lista-acoes"
          role="list"
          aria-label="Itens de exemplo"
          style={limite === 5 ? undefined : { "--lista-acoes-itens-visiveis": limite } as CSSProperties}
        >
          {Array.from({ length: quantidade }, (_, indice) => {
            const numero = indice + 1;
            return (
              <li key={numero}>
                <button type="button" className="lista-acoes-texto link" onClick={() => setUltimaAcao(`Selecionar item ${numero}`)}>
                  Item {numero}
                </button>
                <div className="lista-acoes-botoes">
                  <button type="button" className="lista-acoes-acao link cor-perigo" aria-label={`Excluir item ${numero}`} onClick={() => setUltimaAcao(`Excluir item ${numero}`)}>
                    <i className="fa-solid fa-trash" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        <output>Última ação: {ultimaAcao || "Nenhuma"}</output>
      </div>
    </details>
  );
}
