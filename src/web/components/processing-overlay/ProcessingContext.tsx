import { createContext, useContext } from "react";

type ContextoProcessamento = {
  processar: <T>(operacao: () => Promise<T>, mensagem?: string) => Promise<T>;
};

export const ContextoProcessamento = createContext<ContextoProcessamento | undefined>(undefined);

export function useProcessamento() {
  const contexto = useContext(ContextoProcessamento);
  if (!contexto) throw new Error("useProcessamento deve ser usado dentro de ProcessingProvider");
  return contexto;
}
