import { useState } from "react";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import "./cmp038.css";

export function Cmp038() {
  const [valorCampoUm, setValorCampoUm] = useState("");
  const [valorCampoDois, setValorCampoDois] = useState("");
  const [apresentarErroGeral, setApresentarErroGeral] = useState(false);

  const mensagens = [
    ...(!valorCampoUm.trim()
      ? [{ id: "cmp038-campo-um-erro", texto: "Preencha o primeiro campo.", campo: "campoUm" }]
      : []),
    ...(!valorCampoDois.trim()
      ? [{ id: "cmp038-campo-dois-erro", texto: "Preencha o segundo campo.", campo: "campoDois" }]
      : []),
    ...(apresentarErroGeral
      ? [{ id: "cmp038-erro-geral", texto: "Erro de exemplo sem associação a campo." }]
      : []),
  ];

  return (
    <details className="bloco-teste cmp038-lab">
      <summary className="bloco-teste-titulo link">CMP-038 Mensagens de Erro</summary>
      <div className="bloco-teste-conteudo cmp038-lab-conteudo">
        <div className="cmp038-lab-campos">
          <div className={`campo-texto${!valorCampoUm.trim() ? " cor-perigo" : ""}`}>
            <label htmlFor="cmp038-campo-um">Primeiro campo</label>
            <input id="cmp038-campo-um" className="controle-com-borda" type="text" value={valorCampoUm}
              aria-invalid={!valorCampoUm.trim() || undefined}
              aria-describedby={!valorCampoUm.trim() ? "cmp038-campo-um-erro" : undefined}
              onChange={(evento) => setValorCampoUm(evento.currentTarget.value)} />
          </div>
          <div className={`campo-texto${!valorCampoDois.trim() ? " cor-perigo" : ""}`}>
            <label htmlFor="cmp038-campo-dois">Segundo campo</label>
            <input id="cmp038-campo-dois" className="controle-com-borda" type="text" value={valorCampoDois}
              aria-invalid={!valorCampoDois.trim() || undefined}
              aria-describedby={!valorCampoDois.trim() ? "cmp038-campo-dois-erro" : undefined}
              onChange={(evento) => setValorCampoDois(evento.currentTarget.value)} />
          </div>
          <label className="campo-checkbox">
            <input className="controle-com-borda" type="checkbox" checked={apresentarErroGeral}
              onChange={(evento) => setApresentarErroGeral(evento.currentTarget.checked)} />
            Apresentar erro geral
          </label>
        </div>
        <ErrorMessages mensagens={mensagens} aoFocarCampo={(campo) => {
          if (campo === "campoUm") document.getElementById("cmp038-campo-um")?.focus();
          if (campo === "campoDois") document.getElementById("cmp038-campo-dois")?.focus();
        }} />
      </div>
    </details>
  );
}
