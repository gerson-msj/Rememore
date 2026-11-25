import { useState, type FormEvent } from "react";
import { SeletorData, type SelecaoData } from "@web/components/seletor-data/seletor-data";
import "./cmp003.css";

const campos = [
  { nome: "dataInicial", rotulo: "Data inicial" },
  { nome: "dataMinima", rotulo: "Data mínima" },
  { nome: "dataMaxima", rotulo: "Data máxima" },
] as const;

export function Cmp003() {
  const [configuracao, setConfiguracao] = useState({
    dataInicial: "2024-02-29",
    dataMinima: "",
    dataMaxima: "",
  });
  const [montagem, setMontagem] = useState(0);
  const [selecao, setSelecao] = useState<SelecaoData>({ valor: "", valida: false });

  function aplicarConfiguracao(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const valores = new FormData(evento.currentTarget);
    setConfiguracao({
      dataInicial: String(valores.get("dataInicial") ?? ""),
      dataMinima: String(valores.get("dataMinima") ?? ""),
      dataMaxima: String(valores.get("dataMaxima") ?? ""),
    });
    setMontagem((atual) => atual + 1);
  }

  return (
    <details className="bloco-teste cmp003-lab">
      <summary className="bloco-teste-titulo link">CMP-003 Seletor de Data</summary>
      <div className="bloco-teste-conteudo">
        <form className="cmp003-lab-configuracao" onSubmit={aplicarConfiguracao}>
          {campos.map(({ nome, rotulo }) => (
            <div className="campo-texto" key={nome}>
              <label htmlFor={`cmp003-lab-${nome}`}>{rotulo}</label>
              <input id={`cmp003-lab-${nome}`} name={nome} className="controle-com-borda" type="date" defaultValue={configuracao[nome]} />
            </div>
          ))}
          <div className="cmp003-lab-acoes">
            <button className="botao" type="submit">Aplicar configuração</button>
          </div>
        </form>

        <SeletorData
          key={montagem}
          dataInicial={configuracao.dataInicial}
          dataMinima={configuracao.dataMinima || undefined}
          dataMaxima={configuracao.dataMaxima || undefined}
          aoSelecionar={setSelecao}
        />
        <output>
          Valor retornado <strong>{selecao.valor || "vazio"}</strong><br />
          Seleção <strong>{selecao.valida ? "válida" : "inválida"}</strong>
        </output>
      </div>
    </details>
  );
}
