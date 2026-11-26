import { useState } from "react";
import { coresSemanticas } from "@web/styles/cores";
import "./elm06.css";

export function Elm06() {
  const [botoesAtivos, setBotoesAtivos] = useState(true);
  const [corSelecionada, setCorSelecionada] = useState("");
  const [posicaoIcone, setPosicaoIcone] = useState<"esquerda" | "direita">("esquerda");
  const [quantidadeBotoes, setQuantidadeBotoes] = useState(2);

  return (
    <details className="bloco-teste elm06">
      <summary className="bloco-teste-titulo link">ELM-06 Botões</summary>
      <div className="bloco-teste-conteudo">
        <div className="elm06-controles">
          <div className="elm06-controle campo-checkbox">
            <label htmlFor="elm06-botoes-ativos">Botões ativos</label>
            <input
              id="elm06-botoes-ativos"
              className="controle-com-borda"
              type="checkbox"
              checked={botoesAtivos}
              onChange={(evento) => setBotoesAtivos(evento.currentTarget.checked)}
            />
          </div>

          <div className="elm06-controle">
            <label htmlFor="elm06-cor-botao">Cor dos botões</label>
            <span className="select-com-icone">
              <select
                id="elm06-cor-botao"
                className="controle-com-borda"
                value={corSelecionada}
                onChange={(evento) => setCorSelecionada(evento.currentTarget.value)}
              >
                {coresSemanticas.map(({ cor, rotulo }) => (
                  <option key={cor} value={cor === "padrao" ? "" : `cor-${cor}`}>{rotulo}</option>
                ))}
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </span>
          </div>

          <div className="elm06-controle">
            <label htmlFor="elm06-posicao-icone">Posição do ícone</label>
            <span className="select-com-icone">
              <select
                id="elm06-posicao-icone"
                className="controle-com-borda"
                value={posicaoIcone}
                onChange={(evento) =>
                  setPosicaoIcone(evento.currentTarget.value === "direita" ? "direita" : "esquerda")
                }
              >
                <option value="esquerda">Esquerda</option>
                <option value="direita">Direita</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </span>
          </div>

          <div className="elm06-controle">
            <label htmlFor="elm06-quantidade-botoes">Quantidade de botões</label>
            <span className="select-com-icone">
              <select
                id="elm06-quantidade-botoes"
                className="controle-com-borda"
                value={quantidadeBotoes}
                onChange={(evento) => setQuantidadeBotoes(Number(evento.currentTarget.value))}
              >
                <option value={2}>Dois</option>
                <option value={3}>Três</option>
                <option value={4}>Quatro</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </span>
          </div>
        </div>
        <div className="elm06-variacoes">
          <div>
            <p>Variação: Botão</p>
            {/* ELM-06, botão: reproduzir o elemento abaixo com as classes de cor desejadas. */}
            <button className={`botao ${corSelecionada}`} type="button" disabled={!botoesAtivos}>
              Exemplo de botão
            </button>
          </div>
          <div>
            <p>Variação: Botão com ícone</p>
            {/* ELM-06, botão com ícone: reproduzir o botão e seus filhos. */}
            <button
              className={`botao botao-com-icone ${corSelecionada}`}
              type="button"
              disabled={!botoesAtivos}
            >
              {posicaoIcone === "esquerda" ? (
                <>
                  <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
                  <span>Exemplo de botão</span>
                </>
              ) : (
                <>
                  <span>Exemplo de botão</span>
                  <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
                </>
              )}
            </button>
          </div>
          <div>
            <p>Variação: Múltiplos botões</p>
            {/* ELM-06, grupo: reproduzir o bloco completo a partir de grupo-botoes. */}
            <div className="grupo-botoes">
              {Array.from({ length: quantidadeBotoes }, (_, indice) => (
                <button
                  key={indice}
                  className={`botao ${corSelecionada}`}
                  type="button"
                  disabled={!botoesAtivos}
                >
                  Botão {indice + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
