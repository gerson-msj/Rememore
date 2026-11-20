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
  apresentarSair?: boolean;
  acaoSair?: () => void | Promise<void>;
};

type HeaderContextValue = {
  configuracao: ConfiguracaoHeader;
  setConfiguracao: Dispatch<SetStateAction<ConfiguracaoHeader>>;
  area: "aberta" | "protegida";
  setArea: Dispatch<SetStateAction<"aberta" | "protegida">>;
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
  const [area, setArea] = useState<"aberta" | "protegida">("aberta");
  const valorContexto = useMemo(
    () => ({ configuracao, setConfiguracao, area, setArea }),
    [configuracao, area],
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
