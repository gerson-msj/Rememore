import { useLayoutEffect } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";

export default function Home() {
  const { setConfiguracao } = useHeader();

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Rememore" });
  }, [setConfiguracao]);

  return <section className="pagina-home" aria-label="Home" />;
}
