import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type ConfiguracaoHeader = {
  titulo: string;
  voltar?: () => void;
  sair?: () => void;
};

type HeaderContextValue = {
  configuracao: ConfiguracaoHeader;
  setConfiguracao: Dispatch<SetStateAction<ConfiguracaoHeader>>;
};

const HeaderContext = createContext<HeaderContextValue | undefined>(
  undefined,
);

type HeaderProviderProps = {
  children: ReactNode;
  tituloInicial?: string;
};

export function HeaderProvider({
  children,
  tituloInicial = "",
}: HeaderProviderProps) {
  const [configuracao, setConfiguracao] = useState<ConfiguracaoHeader>({
    titulo: tituloInicial,
  });
  const valorContexto = useMemo(
    () => ({ configuracao, setConfiguracao }),
    [configuracao],
  );

  return (
    <HeaderContext.Provider value={valorContexto}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);

  if (!context) {
    throw new Error("useHeader deve ser usado dentro de HeaderProvider");
  }

  return context;
}
