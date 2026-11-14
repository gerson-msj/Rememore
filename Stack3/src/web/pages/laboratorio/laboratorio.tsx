import { useLayoutEffect, useState } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";
import { Elm01 } from "./elementos/elm01";

export default function Laboratorio() {
  const { setConfiguracao } = useHeader();
  const [abaSelecionada, setAbaSelecionada] = useState<"elementos" | "componentes">("elementos");

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Laboratório",
    });
  }, [setConfiguracao]);

  return (
    <div>
      <div>
        <button
          type="button"
          aria-pressed={abaSelecionada === "elementos"}
          aria-controls="painel-elementos"
          onClick={() => setAbaSelecionada("elementos")}
        >
          Elementos
        </button>
        <button
          type="button"
          aria-pressed={abaSelecionada === "componentes"}
          aria-controls="painel-componentes"
          onClick={() => setAbaSelecionada("componentes")}
        >
          Componentes
        </button>
      </div>

      <section
        id="painel-elementos"
        aria-label="Elementos"
        hidden={abaSelecionada !== "elementos"}
      >
        <Elm01 />
      </section>
      <section
        id="painel-componentes"
        aria-label="Componentes"
        hidden={abaSelecionada !== "componentes"}
      />
    </div>
  );
}
