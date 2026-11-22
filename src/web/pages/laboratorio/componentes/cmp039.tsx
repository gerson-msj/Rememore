import { useState } from "react";
import { usePopup } from "@web/components/popup/PopupContext";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext.tsx";
import "./cmp039.css";

type Cenario = "sucesso" | "falha" | "sobrepostas";

function aguardar(ms: number) {
  return new Promise<void>((resolver) => window.setTimeout(resolver, ms));
}

export function Cmp039() {
  const { processar } = useProcessamento();
  const { abrirPopup } = usePopup();
  const [duracao, setDuracao] = useState("3");
  const [mensagem, setMensagem] = useState("");
  const [cenario, setCenario] = useState<Cenario>("sucesso");
  const [operacoesAtivas, setOperacoesAtivas] = useState(0);
  const [resultado, setResultado] = useState("");

  const duracaoMs = Math.max(0, Number(duracao) || 0) * 1000;

  async function executar(comPopup = false) {
    if (operacoesAtivas > 0) return;
    setResultado("");

    let popupPendente: Promise<unknown> | undefined;
    if (comPopup) {
      popupPendente = abrirPopup({
        mensagemHtml: "<p>Este Popup real ficará atrás da cobertura durante o teste.</p>",
        botoes: { ok: { texto: "Entendi" }, cancelar: { apresentar: false } },
      });
      await new Promise<void>((resolver) => window.setTimeout(resolver, 0));
    }

    const executarUma = async (atraso: number, deveFalhar = false) =>
      processar(async () => {
        setOperacoesAtivas((total) => total + 1);
        try {
          await aguardar(atraso);
          if (deveFalhar) throw new Error("Falha simulada na bancada");
        } finally {
          setOperacoesAtivas((total) => Math.max(0, total - 1));
        }
      }, mensagem.trim() || undefined);

    try {
      if (cenario === "sobrepostas") {
        await Promise.all([executarUma(duracaoMs), executarUma(duracaoMs + 1000)]);
        setResultado("As duas operações foram concluídas em ordens diferentes.");
      } else {
        await executarUma(duracaoMs, cenario === "falha");
        setResultado(
          cenario === "falha"
            ? "Falha simulada e propagada."
            : "Operação concluída com sucesso.",
        );
      }
    } catch {
      setResultado("Falha simulada e propagada.");
    }

    if (popupPendente) await popupPendente;
  }

  return (
    <details className="bloco-teste cmp039-lab">
      <summary className="bloco-teste-titulo link">CMP-039 Cobertura de Processamento</summary>
      <div className="bloco-teste-conteudo cmp039-lab-conteudo">
        <p>Testa a mesma cobertura global usada pelos fluxos da aplicação.</p>

        <div className="cmp039-lab-controles">
          <div className="campo-texto">
            <label htmlFor="cmp039-duracao">Duração (segundos)</label>
            <input
              id="cmp039-duracao"
              className="controle-com-borda"
              type="number"
              min="0"
              step="0.5"
              value={duracao}
              onChange={(evento) => setDuracao(evento.currentTarget.value)}
            />
          </div>
          <div className="campo-texto">
            <label htmlFor="cmp039-mensagem">Mensagem personalizada (opcional)</label>
            <input
              id="cmp039-mensagem"
              className="controle-com-borda"
              type="text"
              value={mensagem}
              onChange={(evento) => setMensagem(evento.currentTarget.value)}
            />
          </div>
          <div className="campo-texto">
            <label htmlFor="cmp039-cenario">Resultado</label>
            <div className="select-com-icone">
              <select
                id="cmp039-cenario"
                className="controle-com-borda"
                value={cenario}
                onChange={(evento) => setCenario(evento.currentTarget.value as Cenario)}
              >
                <option value="sucesso">Sucesso</option>
                <option value="falha">Falha</option>
                <option value="sobrepostas">Duas operações sobrepostas</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
        </div>

        <fieldset className="cmp039-lab-grupo">
          <legend>Controles protegidos para teste</legend>
          <div className="cmp039-lab-elementos">
            <div className="campo-texto">
              <label htmlFor="cmp039-campo">Campo de teste</label>
              <input id="cmp039-campo" className="controle-com-borda" type="text" />
            </div>
            <a className="link cmp039-lab-link" href="#painel-componentes">Link de teste</a>
          </div>
        </fieldset>

        <div className="cmp039-lab-acoes">
          <button
            className="botao"
            type="button"
            disabled={operacoesAtivas > 0}
            onClick={() => void executar()}
          >
            {operacoesAtivas > 0 ? `Processando (${operacoesAtivas})...` : "Testar cobertura"}
          </button>
          <button
            className="botao"
            type="button"
            disabled={operacoesAtivas > 0}
            onClick={() => void executar(true)}
          >
            Testar com Popup
          </button>
          <p aria-live="polite">{resultado}</p>
        </div>
      </div>
    </details>
  );
}
