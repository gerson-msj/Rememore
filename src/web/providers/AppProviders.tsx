import type { ReactNode } from "react";
import { HeaderProvider } from "@web/components/Header/HeaderContext";
import { PopupProvider } from "@web/components/popup/PopupContext";
import { SessaoProvider } from "@web/contexts/SessaoContext";
import { ProcessingProvider } from "@web/components/processing-overlay/ProcessingOverlay.tsx";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SessaoProvider>
      <HeaderProvider>
        <PopupProvider>
          <ProcessingProvider>{children}</ProcessingProvider>
        </PopupProvider>
      </HeaderProvider>
    </SessaoProvider>
  );
}

