import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { usePopup } from "@web/components/popup/PopupContext";
import { useSessao } from "@web/contexts/SessaoContext";
import { useExecutorOperacao } from "@web/hooks/useExecutorOperacao";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext.tsx";
import { CHAVE_CONFIRMACAO_CADASTRO, CHAVE_CONFIRMACAO_REDEFINICAO, remover } from "@web/services/storage";
import { useHeader } from "./HeaderContext";
import "./header.css";

export function Header() {
  const { configuracao, area } = useHeader();
  const { abrirPopup } = usePopup();
  const { estado: estadoSessao, sair } = useSessao();
  const navigate = useNavigate();
  const executarOperacao = useExecutorOperacao();
  const { processar } = useProcessamento();
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
        operacao: async () => {
          await processar(async () => {
            // Uma saída descartada não deve afetar uma sessão posterior.
            if (!await sair()) return;
            try {
              // Temporário: remove apenas a chave da E5; será substituído por uma limpeza completa.
              remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
              remover(CHAVE_CONFIRMACAO_REDEFINICAO, "sessao");
            } catch {
              // A limpeza temporária não bloqueia a navegação após sair.
            }
            navigate("/", { replace: true });
          }, "Saindo...");
        },
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
