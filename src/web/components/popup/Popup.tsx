import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { AcaoPopup, OpcoesPopup, TemaPopup } from "./PopupContext";
import "./popup.css";

type PopupProps = {
  id: number;
  opcoes: OpcoesPopup;
  aoResponder: (acao: AcaoPopup) => void;
};

function classeTemaBotao(tema?: TemaPopup) {
  return tema && tema !== "normal" ? `cor-${tema}` : undefined;
}

export function Popup({ id, opcoes, aoResponder }: PopupProps) {
  const [estado, setEstado] = useState<"inicial" | "aberto" | "fechando">("inicial");
  const camadaRef = useRef<HTMLDivElement>(null);
  const dialogoRef = useRef<HTMLElement>(null);
  const acaoFechamentoRef = useRef<AcaoPopup | null>(null);

  const fechar = useCallback((acao: AcaoPopup) => {
    if (acaoFechamentoRef.current !== null) return;
    acaoFechamentoRef.current = acao;
    setEstado("fechando");
  }, []);

  const concluirFechamento = useCallback(() => {
    const acao = acaoFechamentoRef.current;
    if (acao === null) return;
    acaoFechamentoRef.current = null;
    aoResponder(acao);
  }, [aoResponder]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      if (acaoFechamentoRef.current === null) setEstado("aberto");
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const dialogo = dialogoRef.current;
    if (!dialogo) return;

    const focoAnterior = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const manterFoco = (evento: FocusEvent) => {
      if (evento.target instanceof Node && !dialogo.contains(evento.target)) {
        dialogo.focus();
      }
    };

    document.addEventListener("focusin", manterFoco);
    dialogo.focus();

    return () => {
      document.removeEventListener("focusin", manterFoco);
      if (focoAnterior?.isConnected) focoAnterior.focus();
    };
  }, []);

  useEffect(() => {
    const tratarTecla = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        evento.preventDefault();
        fechar("Cancelar");
      } else if (evento.key === "Tab") {
        const dialogo = dialogoRef.current;
        if (!dialogo) return;

        const controles = Array.from(dialogo.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        )).filter((controle) => controle.getClientRects().length > 0);
        const primeiro = controles[0];
        const ultimo = controles[controles.length - 1];
        const focoAtual = document.activeElement;

        if (!primeiro || !ultimo) {
          evento.preventDefault();
          dialogo.focus();
        } else if (evento.shiftKey && (focoAtual === primeiro || focoAtual === dialogo || !dialogo.contains(focoAtual))) {
          evento.preventDefault();
          ultimo.focus();
        } else if (!evento.shiftKey && (focoAtual === ultimo || focoAtual === dialogo || !dialogo.contains(focoAtual))) {
          evento.preventDefault();
          primeiro.focus();
        }
      }
    };

    document.addEventListener("keydown", tratarTecla);
    return () => document.removeEventListener("keydown", tratarTecla);
  }, [fechar]);

  useEffect(() => {
    if (estado !== "fechando") return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      concluirFechamento();
      return;
    }

    const camada = camadaRef.current;
    if (!camada) {
      concluirFechamento();
      return;
    }

    const duracao = getComputedStyle(camada).getPropertyValue("--duracao-transicao-popup").trim();
    const valorDuracao = Number.parseFloat(duracao);
    const duracaoMs = duracao.endsWith("ms") ? valorDuracao : valorDuracao * 1000;

    if (!Number.isFinite(duracaoMs) || duracaoMs <= 0) {
      concluirFechamento();
      return;
    }

    const timeout = window.setTimeout(concluirFechamento, duracaoMs + 50);
    return () => window.clearTimeout(timeout);
  }, [estado, concluirFechamento]);

  const mostrarOk = opcoes.botoes?.ok?.apresentar ?? true;
  const mostrarCancelar = opcoes.botoes?.cancelar?.apresentar ?? true;
  const tituloId = `popup-titulo-${id}`;
  const classeEstado = estado === "aberto"
    ? " popup-camada--aberta"
    : estado === "fechando"
    ? " popup-camada--fechando"
    : "";

  return (
    <div
      ref={camadaRef}
      className={`popup-camada${classeEstado}`}
      onTransitionEnd={(evento) => {
        if (
          estado === "fechando" &&
          evento.target === evento.currentTarget &&
          evento.propertyName === "opacity"
        ) {
          concluirFechamento();
        }
      }}
      onMouseDown={(evento) => {
        if (evento.target === evento.currentTarget) fechar("Cancelar");
      }}
    >
      <section
        ref={dialogoRef}
        className={`popup${opcoes.tema && opcoes.tema !== "normal" ? ` cor-popup-${opcoes.tema}` : ""}`}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={opcoes.titulo ? tituloId : undefined}
        aria-label={opcoes.titulo ? undefined : "Mensagem"}
      >
        {opcoes.titulo && (
          <h2 id={tituloId} className="popup-titulo">{opcoes.titulo}</h2>
        )}
        <div className="popup-conteudo">
          {opcoes.icone && (
            <i className={`popup-icone ${opcoes.icone}`} aria-hidden="true" />
          )}
          <div
            className="popup-mensagem"
            dangerouslySetInnerHTML={{ __html: opcoes.mensagemHtml }}
          />
        </div>
        {(mostrarOk || mostrarCancelar) && (
          <div className="grupo-botoes popup-acoes">
            {mostrarOk && (
              <button
                type="button"
                className={`botao ${classeTemaBotao(opcoes.botoes?.ok?.tema) ?? ""}`.trim()}
                onClick={() => fechar("OK")}
              >
                {opcoes.botoes?.ok?.texto ?? "OK"}
              </button>
            )}
            {mostrarCancelar && (
              <button
                type="button"
                className={`botao ${classeTemaBotao(opcoes.botoes?.cancelar?.tema) ?? ""}`.trim()}
                onClick={() => fechar("Cancelar")}
              >
                {opcoes.botoes?.cancelar?.texto ?? "Cancelar"}
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
