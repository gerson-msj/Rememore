import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { HeaderProvider } from "@web/components/Header/HeaderContext";
import { PopupProvider } from "@web/components/popup/PopupContext";
import { SessaoProvider } from "@web/contexts/SessaoContext";

type ValorContextoConfirmacaoCadastro = {
  chaveRedefinicao: string | null;
  definirChaveRedefinicao: (chave: string) => void;
  limparChaveRedefinicao: () => void;
};

const ContextoConfirmacaoCadastro = createContext<ValorContextoConfirmacaoCadastro | null>(null);

function ProviderContextoConfirmacaoCadastro({ children }: { children: ReactNode }) {
  const [chaveRedefinicao, setChaveRedefinicao] = useState<string | null>(null);
  const valor = useMemo<ValorContextoConfirmacaoCadastro>(
    () => ({
      chaveRedefinicao,
      definirChaveRedefinicao: setChaveRedefinicao,
      limparChaveRedefinicao: () => setChaveRedefinicao(null),
    }),
    [chaveRedefinicao],
  );

  return (
    <ContextoConfirmacaoCadastro.Provider value={valor}>
      {children}
    </ContextoConfirmacaoCadastro.Provider>
  );
}

export function useContextoConfirmacaoCadastro() {
  const contexto = useContext(ContextoConfirmacaoCadastro);
  if (!contexto) {
    throw new Error("useContextoConfirmacaoCadastro deve ser usado dentro do AppProviders.");
  }
  return contexto;
}

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessaoProvider>
      <ProviderContextoConfirmacaoCadastro>
        <HeaderProvider>
          <PopupProvider>{children}</PopupProvider>
        </HeaderProvider>
      </ProviderContextoConfirmacaoCadastro>
    </SessaoProvider>
  );
}

