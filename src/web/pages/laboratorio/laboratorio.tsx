import { useLayoutEffect, useState } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";
import { Elm01 } from "./elementos/elm01";
import { Elm02 } from "./elementos/elm02";
import { Elm03 } from "./elementos/elm03";
import { Elm04 } from "./elementos/elm04";
import { Elm05 } from "./elementos/elm05";
import { Elm06 } from "./elementos/elm06";
import { Cmp001 } from "./componentes/cmp001";

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
        <Elm02 />
        <Elm03 />
        <Elm04 />
        <Elm05 />
        <Elm06 />
      </section>
      <section
        id="painel-componentes"
        aria-label="Componentes"
        hidden={abaSelecionada !== "componentes"}
      >
        <Cmp001 />
      </section>
    </div>
  );
}
