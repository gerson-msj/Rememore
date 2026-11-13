import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderContextValue = {
  titulo: string;
  setTitulo: (titulo: string) => void;
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
  const [titulo, setTitulo] = useState(tituloInicial);

  return (
    <HeaderContext.Provider value={{ titulo, setTitulo }}>
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
