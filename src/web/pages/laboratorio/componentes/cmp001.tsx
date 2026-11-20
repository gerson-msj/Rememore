import { useState } from "react";
import { PasswordField, type PasswordAutocomplete } from "@web/components/password-field/password-field";
import "./cmp001.css";

export function Cmp001() {
  const [valorTeste, setValorTeste] = useState("");
  const [valorAplicado, setValorAplicado] = useState("");
  const [exibirErro, setExibirErro] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("Mensagem de erro de teste.");
  const [habilitado, setHabilitado] = useState(true);
  const [autocomplete, setAutocomplete] = useState<PasswordAutocomplete>("off");

  return (
    <details className="bloco-teste cmp001-lab">
      <summary className="bloco-teste-titulo link">CMP-001 Campo de Senha</summary>
      <div className="bloco-teste-conteudo cmp001-lab-conteudo">
        <div className="cmp001-lab-controles">
          <div className="cmp001-lab-valor">
            <div className="cmp001-lab-controle campo-texto">
              <label htmlFor="cmp001-lab-valor">Valor sob controle do Lab</label>
              <input
                id="cmp001-lab-valor"
                className="controle-com-borda"
                type="text"
                value={valorTeste}
                onChange={(evento) => setValorTeste(evento.currentTarget.value)}
              />
            </div>
            <div className="grupo-botoes">
              <button className="botao" type="button" onClick={() => setValorAplicado(valorTeste)}>Aplicar valor</button>
              <button className="botao" type="button" onClick={() => { setValorTeste(""); setValorAplicado(""); }}>Limpar valor</button>
            </div>
          </div>

          <div className="cmp001-lab-controle campo-texto">
            <label htmlFor="cmp001-lab-mensagem">Mensagem de erro</label>
            <input
              id="cmp001-lab-mensagem"
              className="controle-com-borda"
              type="text"
              value={mensagemErro}
              onChange={(evento) => setMensagemErro(evento.currentTarget.value)}
            />
          </div>

          <div className="cmp001-lab-controle campo-texto">
            <label htmlFor="cmp001-lab-autocomplete">Autocomplete</label>
            <span className="select-com-icone">
              <select
                id="cmp001-lab-autocomplete"
                className="controle-com-borda"
                value={autocomplete}
                onChange={(evento) => setAutocomplete(evento.currentTarget.value as PasswordAutocomplete)}
              >
                <option value="off">off</option>
                <option value="current-password">current-password</option>
                <option value="new-password">new-password</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </span>
            <small>Valor atual: {autocomplete}</small>
          </div>

          <label className="cmp001-lab-opcao campo-checkbox">
            <input className="controle-com-borda" type="checkbox" checked={exibirErro} onChange={(evento) => setExibirErro(evento.currentTarget.checked)} />
            Exibir erro
          </label>
          <label className="cmp001-lab-opcao campo-checkbox">
            <input className="controle-com-borda" type="checkbox" checked={habilitado} onChange={(evento) => setHabilitado(evento.currentTarget.checked)} />
            Habilitado
          </label>
        </div>

        <p>Instância real do CMP-001:</p>
        <PasswordField
          value={valorAplicado}
          onChange={(valor) => { setValorAplicado(valor); setValorTeste(valor); }}
          autoComplete={autocomplete}
          hasError={exibirErro}
          errorMessage={mensagemErro}
          disabled={!habilitado}
        />
      </div>
    </details>
  );
}
