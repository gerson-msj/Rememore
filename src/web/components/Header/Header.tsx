import { useRef, useState } from "react";
import { usePopup } from "@web/components/popup/PopupContext";
import { useSessao } from "@web/contexts/SessaoContext";
import { useExecutorOperacao } from "@web/hooks/useExecutorOperacao";
import { useSaidaSessao } from "@web/hooks/useSaidaSessao";
import { useHeader } from "./HeaderContext";
import "./header.css";

export function Header() {
  const { configuracao, area } = useHeader();
  const { abrirPopup } = usePopup();
  const { estado: estadoSessao } = useSessao();
  const executarOperacao = useExecutorOperacao();
  const sairDaSessao = useSaidaSessao();
  const acaoEmAndamento = useRef(false);
  const [saindo, setSaindo] = useState(false);
  const apresentarSair = area === "protegida"
    && estadoSessao === "autenticado"
    && configuracao.apresentarSair !== false;

  async function solicitarSaida() {
    if (acaoEmAndamento.current) return;
    acaoEmAndamento.current = true;
    setSaindo(true);

    try {
      if (configuracao.acaoSair) {
        await configuracao.acaoSair();
        return;
      }

      const acao = await abrirPopup({
        mensagemHtml: "<p>Deseja sair do Rememore?</p>",
        botoes: {
          ok: { texto: "Sim, sair", tema: "perigo" },
          cancelar: { texto: "Continuar aqui", tema: "link" },
        },
      });
      if (acao !== "OK") return;

      await executarOperacao({
        operacao: sairDaSessao,
        aoIniciar: () => setSaindo(true),
        aoFinalizar: () => setSaindo(false),
      });
    } finally {
      acaoEmAndamento.current = false;
      setSaindo(false);
    }
  }

  return (
    <header className="cabecalho">
      <div className="cabecalho-container">
        <div className="cabecalho-coluna-esquerda">
          {configuracao.voltar ? (
            <button
              className="botao-icone-controle link"
              type="button"
              aria-label="Voltar"
              onClick={configuracao.voltar}
            >
              <i className="fa-solid fa-chevron-left" aria-hidden="true" />
            </button>
          ) : (
            <i className="fa-solid fa-book-open" aria-hidden="true" />
          )}
        </div>
        <div className="cabecalho-coluna-central">
          <h1>{configuracao.titulo}</h1>
        </div>
        <div className="cabecalho-coluna-direita">
          {apresentarSair && (
            <button
              className="botao-icone-controle link cor-perigo"
              type="button"
              aria-label="Sair"
              onClick={() => void solicitarSaida()}
              disabled={saindo}
            >
              <i
                className="fa-solid fa-arrow-right-from-bracket"
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
