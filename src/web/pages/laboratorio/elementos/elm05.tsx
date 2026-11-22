import { useState } from "react";
import "./elm05.css";

export function Elm05() {
  const [corSelecionada, setCorSelecionada] = useState("");
  const classeCampoTexto = corSelecionada ? `campo-texto ${corSelecionada}` : "campo-texto";

  return (
    <details className="bloco-teste elm05">
      <summary className="bloco-teste-titulo link">ELM-05 Campo de texto</summary>
      <div className="bloco-teste-conteudo">
        <div className="elm05-controles">
          <label htmlFor="elm05-cor-campo">Cor dos campos</label>
          <span className="select-com-icone">
            <select
              id="elm05-cor-campo"
              className="controle-com-borda"
              value={corSelecionada}
              onChange={(evento) => setCorSelecionada(evento.currentTarget.value)}
            >
              <option value="">Padrão</option>
              <option value="cor-link">Link</option>
              <option value="cor-perigo">Perigo</option>
              <option value="cor-alerta">Alerta</option>
              <option value="cor-info">Info</option>
            </select>
            <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
          </span>
        </div>
        <div className="elm05-variacoes">
          <div>
            <p>Variação: Caixa de texto</p>
            {/* ELM-05, caixa de texto: reproduzir o bloco completo a partir de campo-texto. */}
            <div className={classeCampoTexto}>
              <label htmlFor="elm05-caixa-texto">Texto</label>
              <input id="elm05-caixa-texto" className="controle-com-borda" type="text" />
            </div>
          </div>
          <div>
            <p>Variação: Caixa numérica</p>
            {/* ELM-05, caixa numérica: reproduzir o bloco completo a partir de campo-texto. */}
            <div className={classeCampoTexto}>
              <label htmlFor="elm05-caixa-numerica">Número</label>
              <input
                id="elm05-caixa-numerica"
                className="controle-com-borda"
                type="number"
                min="0"
                step="1"
              />
            </div>
          </div>
          <div>
            <p>Variação: Caixa de texto multilinear</p>
            {/* ELM-05, multilinear: reproduzir o bloco completo a partir de campo-texto. */}
            <div className={classeCampoTexto}>
              <label htmlFor="elm05-caixa-texto-multilinear">Texto</label>
              <textarea id="elm05-caixa-texto-multilinear" className="controle-com-borda" rows={3} />
            </div>
          </div>
          <div>
            <p>Variação: Caixa de texto em estado de erro</p>
            {/* ELM-05, erro: reproduzir o bloco completo, incluindo a mensagem. */}
            <div className="campo-texto cor-perigo">
              <label htmlFor="elm05-caixa-texto-erro">Texto</label>
              <input id="elm05-caixa-texto-erro" className="controle-com-borda" type="text" aria-invalid="true" />
              <small className="mensagem-erro">Este campo contém um erro.</small>
            </div>
          </div>
          <div>
            <p>Variação: Caixa de texto somente leitura</p>
            {/* ELM-05, somente leitura: reproduzir o bloco completo a partir de campo-texto. */}
            <div className={classeCampoTexto}>
              <label htmlFor="elm05-caixa-texto-leitura">Texto</label>
              <input id="elm05-caixa-texto-leitura" className="controle-com-borda" type="text" value="Texto somente leitura" readOnly />
            </div>
          </div>
          <div>
            <p>Variação: Caixa de seleção</p>
            {/* ELM-05, seleção: reproduzir o bloco completo, incluindo select-com-icone. */}
            <div className={classeCampoTexto}>
              <label htmlFor="elm05-caixa-selecao">Opção</label>
              <div className="select-com-icone">
                <select id="elm05-caixa-selecao" className="controle-com-borda" defaultValue="">
                  <option value="" disabled>Selecione uma opção</option>
                  <option value="opcao-1">Opção 1</option>
                  <option value="opcao-2">Opção 2</option>
                  <option value="opcao-3">Opção 3</option>
                </select>
                <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
              </div>
            </div>
          </div>
          <div className="elm05-checkbox-variacao">
            <p>Variação: Checkbox</p>
            {/* ELM-05, checkbox: reproduzir o bloco completo a partir de campo-checkbox. */}
            <div className={corSelecionada ? `campo-checkbox ${corSelecionada}` : "campo-checkbox"}>
              <input id="elm05-checkbox" className="controle-com-borda" type="checkbox" />
              <label htmlFor="elm05-checkbox">Opção</label>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
