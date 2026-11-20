import type { ReactNode } from "react";
import { HeaderProvider } from "@web/components/Header/HeaderContext";
import { PopupProvider } from "@web/components/popup/PopupContext";
import { SessaoProvider } from "@web/contexts/SessaoContext";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessaoProvider>
      <HeaderProvider>
        <PopupProvider>{children}</PopupProvider>
      </HeaderProvider>
    </SessaoProvider>
  );
}

