import { useLayoutEffect } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";

export function PaginaDestino({ titulo }: { titulo: string }) {
  const navigate = useNavigate();
  const { setConfiguracao } = useHeader();

  useLayoutEffect(() => {
    setConfiguracao({ titulo, voltar: () => void navigate("/home") });
  }, [navigate, setConfiguracao, titulo]);

  return null;
}
