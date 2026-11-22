import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ContextoProcessamento } from "./ProcessingContext.tsx";
import "./processing-overlay.css";

const LIMIAR_VISUAL_MS = 5000;

type EstadoCobertura = "inativa" | "aguardando" | "visivel" | "saindo";
type ProcessingProviderProps = { children: ReactNode };

function isElemento(elemento: Element): elemento is HTMLElement {
  return elemento instanceof HTMLElement;
}

export function ProcessingProvider({ children }: ProcessingProviderProps) {
  const [estado, setEstado] = useState<EstadoCobertura>("inativa");
  const estadoAtual = useRef<EstadoCobertura>("inativa");
  const [mensagem, setMensagem] = useState("Aguarde...");
  const operacoesAtivas = useRef(0);
  const temporizadorEntrada = useRef<number | undefined>(undefined);
  const temporizadorSaida = useRef<number | undefined>(undefined);
  const focoAnterior = useRef<HTMLElement | null>(null);
  const caminhoAnterior = useRef("");
  const elementosIsolados = useRef(new Map<HTMLElement, boolean>());
  const observador = useRef<MutationObserver | undefined>(undefined);
  const camadaRef = useRef<HTMLDivElement>(null);

  const mudarEstado = useCallback((seguinte: EstadoCobertura) => {
    estadoAtual.current = seguinte;
    setEstado(seguinte);
  }, []);

  const isCamadaProcessamento = (elemento: HTMLElement) =>
    elemento.hasAttribute("data-cobertura-processamento");

  const isolarElemento = useCallback((elemento: HTMLElement) => {
    if (isCamadaProcessamento(elemento) || elementosIsolados.current.has(elemento)) return;
    elementosIsolados.current.set(elemento, elemento.inert);
    elemento.inert = true;
  }, []);

  const ativarBloqueio = useCallback(() => {
    document.documentElement.dataset.processamentoAtivo = "true";
    focoAnterior.current = isElemento(document.activeElement as Element)
      ? document.activeElement as HTMLElement
      : null;
    caminhoAnterior.current = window.location.pathname;
    Array.from(document.body.children).forEach((elemento) => {
      if (isElemento(elemento)) isolarElemento(elemento);
    });
    observador.current = new MutationObserver((alteracoes) => {
      alteracoes.forEach((alteracao) => alteracao.addedNodes.forEach((no) => {
        if (no instanceof HTMLElement && no.parentElement === document.body) isolarElemento(no);
      }));
    });
    observador.current.observe(document.body, { childList: true });
  }, [isolarElemento]);

  const desativarBloqueio = useCallback(() => {
    observador.current?.disconnect();
    observador.current = undefined;
    elementosIsolados.current.forEach((eraInerte, elemento) => {
      if (elemento.isConnected) elemento.inert = eraInerte;
    });
    elementosIsolados.current.clear();
    delete document.documentElement.dataset.processamentoAtivo;

    const popup = document.querySelector<HTMLElement>(".popup-camada [role='dialog']");
    if (popup) {
      popup.focus();
      return;
    }
    const anterior = focoAnterior.current;
    if (window.location.pathname === caminhoAnterior.current && anterior?.isConnected) anterior.focus();
    focoAnterior.current = null;
  }, []);

  const iniciar = useCallback((texto: string) => {
    if (operacoesAtivas.current === 0) {
      window.clearTimeout(temporizadorSaida.current);
      temporizadorSaida.current = undefined;
      setMensagem(texto);
      if (estadoAtual.current === "inativa") ativarBloqueio();
      mudarEstado("aguardando");
      temporizadorEntrada.current = window.setTimeout(() => mudarEstado("visivel"), LIMIAR_VISUAL_MS);
    }
    operacoesAtivas.current += 1;
  }, [ativarBloqueio, mudarEstado]);

  const finalizar = useCallback(() => {
    operacoesAtivas.current = Math.max(0, operacoesAtivas.current - 1);
    if (operacoesAtivas.current > 0) return;
    window.clearTimeout(temporizadorEntrada.current);
    temporizadorEntrada.current = undefined;
    if (estadoAtual.current === "visivel") {
      mudarEstado("saindo");
      const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      temporizadorSaida.current = window.setTimeout(() => {
        mudarEstado("inativa");
        temporizadorSaida.current = undefined;
        desativarBloqueio();
      }, reduzido ? 0 : 260);
    } else {
      mudarEstado("inativa");
      desativarBloqueio();
    }
  }, [desativarBloqueio, mudarEstado]);

  const processar = useCallback(async <T,>(operacao: () => Promise<T>, texto = "Aguarde...") => {
    iniciar(texto);
    try {
      return await operacao();
    } finally {
      finalizar();
    }
  }, [finalizar, iniciar]);

  const valor = useMemo(() => ({ processar }), [processar]);
  const protegida = estado !== "inativa";

  useEffect(() => {
    if (protegida) camadaRef.current?.focus();
  }, [protegida]);

  useEffect(() => () => {
    window.clearTimeout(temporizadorEntrada.current);
    window.clearTimeout(temporizadorSaida.current);
    observador.current?.disconnect();
    elementosIsolados.current.forEach((eraInerte, elemento) => {
      if (elemento.isConnected) elemento.inert = eraInerte;
    });
    delete document.documentElement.dataset.processamentoAtivo;
  }, []);

  useEffect(() => {
    if (!protegida) return;
    const bloquearTeclado = (evento: KeyboardEvent) => {
      evento.preventDefault();
      evento.stopImmediatePropagation();
    };
    document.addEventListener("keydown", bloquearTeclado, true);
    return () => document.removeEventListener("keydown", bloquearTeclado, true);
  }, [protegida]);

  return (
    <ContextoProcessamento.Provider value={valor}>
      <div className="processamento-conteudo">
        {children}
      </div>
      {protegida && typeof document !== "undefined" && createPortal(
        <div
          ref={camadaRef}
          className={`cobertura-processamento camada-modal${estado === "visivel" ? " camada-modal--visivel" : ""}${estado === "saindo" ? " camada-modal--saindo" : ""}`}
          data-cobertura-processamento
          role="dialog"
          aria-modal="true"
          aria-label="Operação em processamento"
          aria-busy="true"
          tabIndex={-1}
          onFocus={(evento) => {
            if (evento.target === evento.currentTarget) return;
            evento.currentTarget.focus();
          }}
          onKeyDown={(evento) => {
            evento.preventDefault();
            evento.stopPropagation();
          }}
          onWheel={(evento) => evento.preventDefault()}
          onTouchMove={(evento) => evento.preventDefault()}
        >
          <section
            className="cobertura-processamento-mensagem painel-modal"
            role="status"
            aria-live={estado === "visivel" || estado === "saindo" ? "polite" : "off"}
            aria-atomic="true"
            tabIndex={-1}
          >
            <p>{mensagem}</p>
          </section>
        </div>,
        document.body,
      )}
    </ContextoProcessamento.Provider>
  );
}
