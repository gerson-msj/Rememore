import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";

export function PaginaDestino({ titulo, voltarPara = "/home" }: { titulo: string; voltarPara?: string }) {
  const navigate = useNavigate();
  const { setConfiguracao } = useHeader();

  useLayoutEffect(() => {
    setConfiguracao({ titulo, voltar: () => void navigate(voltarPara) });
  }, [navigate, setConfiguracao, titulo, voltarPara]);

  return null;
}
