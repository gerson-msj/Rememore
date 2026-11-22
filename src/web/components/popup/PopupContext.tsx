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
import { Popup } from "./Popup";

export type TemaPopup = "normal" | "link" | "perigo" | "alerta" | "info";
export type AcaoPopup = "OK" | "Cancelar";

export type OpcaoBotaoPopup = {
  apresentar?: boolean;
  texto?: string;
  tema?: TemaPopup;
};

export type OpcoesPopup = {
  mensagemHtml: string;
  titulo?: string;
  icone?: string;
  tema?: TemaPopup;
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
  abrirPopup: (opcoes: OpcoesPopup) => Promise<AcaoPopup>;
};

const ContextoPopup = createContext<PopupContexto | undefined>(undefined);

type PopupProviderProps = {
  children: ReactNode;
};

export function PopupProvider({ children }: PopupProviderProps) {
  const [fila, setFila] = useState<SolicitacaoPopup[]>([]);
  const proximoId = useRef(0);
  const atual = fila[0];

  const abrirPopup = useCallback((opcoes: OpcoesPopup) => {
    return new Promise<AcaoPopup>((resolver) => {
      const solicitacao = {
        id: proximoId.current++,
        opcoes,
        resolver,
      };
      setFila((itens) => [...itens, solicitacao]);
    });
  }, []);

  const valorContexto = useMemo(() => ({ abrirPopup }), [abrirPopup]);

  const responder = useCallback((acao: AcaoPopup) => {
    const solicitacao = fila[0];
    if (!solicitacao) return;
    setFila((itens) => itens.slice(1));
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
