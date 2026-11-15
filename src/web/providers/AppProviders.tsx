import type { ReactNode } from "react";
import { HeaderProvider } from "@web/components/Header/HeaderContext";

type AppProvidersProps = {
  children: ReactNode;
};

export function AppProviders({ children }: AppProvidersProps) {
  return <HeaderProvider>{children}</HeaderProvider>;
}

