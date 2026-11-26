import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import type { CorSemantica } from "@web/styles/cores";
import { Popup } from "./Popup";

export type AcaoPopup = "OK" | "Cancelar";

export type OpcaoBotaoPopup = {
  apresentar?: boolean;
  texto?: string;
  tema?: CorSemantica;
};

export type OpcoesPopup = {
  mensagemHtml: string;
  titulo?: string;
  icone?: string;
  tema?: CorSemantica;
  impedirDispensa?: boolean;
  botoes?: {
    ok?: OpcaoBotaoPopup;
    cancelar?: OpcaoBotaoPopup;
  };
};

type SolicitacaoPopup = {
  id: number;
  opcoes: OpcoesPopup;
  resolver: (acao: AcaoPopup) => void;
};

type PopupContexto = {
  abrirPopup: (opcoes: OpcoesPopup, signal?: AbortSignal) => Promise<AcaoPopup>;
};

const ContextoPopup = createContext<PopupContexto | undefined>(undefined);

type PopupProviderProps = {
  children: ReactNode;
};

export function PopupProvider({ children }: PopupProviderProps) {
  const [fila, setFila] = useState<SolicitacaoPopup[]>([]);
  const proximoId = useRef(0);
  const atual = fila[0];

  const abrirPopup = useCallback((opcoes: OpcoesPopup, signal?: AbortSignal) => {
    if (signal?.aborted) return Promise.resolve<AcaoPopup>("Cancelar");

    return new Promise<AcaoPopup>((resolver) => {
      const id = proximoId.current++;
      const cancelar = () => {
        setFila((itens) => itens.filter((item) => item.id !== id));
        concluir("Cancelar");
      };
      const concluir = (acao: AcaoPopup) => {
        signal?.removeEventListener("abort", cancelar);
        resolver(acao);
      };
      const solicitacao = {
        id,
        opcoes,
        resolver: concluir,
      };
      signal?.addEventListener("abort", cancelar, { once: true });
      setFila((itens) => [...itens, solicitacao]);
    });
  }, []);

  const valorContexto = useMemo(() => ({ abrirPopup }), [abrirPopup]);

  const responder = useCallback((acao: AcaoPopup) => {
    const solicitacao = fila[0];
    if (!solicitacao) return;
    setFila((itens) => itens.filter((item) => item.id !== solicitacao.id));
    solicitacao.resolver(acao);
  }, [fila]);

  return (
    <ContextoPopup.Provider value={valorContexto}>
      {children}
      {atual && typeof document !== "undefined" && createPortal(
        <Popup
          key={atual.id}
          id={atual.id}
          opcoes={atual.opcoes}
          aoResponder={responder}
        />,
        document.body,
      )}
    </ContextoPopup.Provider>
  );
}

export function usePopup() {
  const contexto = useContext(ContextoPopup);

  if (!contexto) {
    throw new Error("usePopup deve ser usado dentro de PopupProvider");
  }

  return contexto;
}
