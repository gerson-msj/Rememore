import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { armazenar, recuperar } from "@web/services/storage";
import { Elm01 } from "./elementos/elm01";
import { Elm02 } from "./elementos/elm02";
import { Elm03 } from "./elementos/elm03";
import { Elm04 } from "./elementos/elm04";
import { Elm05 } from "./elementos/elm05";
import { Elm06 } from "./elementos/elm06";
import { Elm07 } from "./elementos/elm07";
import { Cmp001 } from "./componentes/cmp001";
import { Cmp002 } from "./componentes/cmp002";
import { Cmp028 } from "./componentes/cmp028";
import { Cmp038 } from "./componentes/cmp038";
import { Cmp039 } from "./componentes/cmp039";
import "./laboratorio.css";

export default function Laboratorio() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [abaSelecionada, setAbaSelecionada] = useState<"elementos" | "componentes">(() => {
    try {
      const abaSalva = recuperar<string>("laboratorio:abaAtiva");
      return abaSalva === "componentes" ? "componentes" : "elementos";
    } catch {
      return "elementos";
    }
  });

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Laboratório",
      voltar: () => navigate("/"),
    });
  }, [navigate, setConfiguracao]);

  useLayoutEffect(() => {
    try {
      armazenar("laboratorio:abaAtiva", abaSelecionada);
    } catch {
      // A aba continua funcionando durante esta visita se o armazenamento falhar.
    }
  }, [abaSelecionada]);

  return (
    <div>
      <div>
        <button
          className="botao"
          type="button"
          aria-pressed={abaSelecionada === "elementos"}
          aria-controls="painel-elementos"
          onClick={() => setAbaSelecionada("elementos")}
        >
          Elementos
        </button>
        <button
          className="botao"
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
        <Elm07 />
      </section>
      <section
        id="painel-componentes"
        aria-label="Componentes"
        hidden={abaSelecionada !== "componentes"}
      >
        <Cmp001 />
        <Cmp002 />
        <Cmp028 />
        <Cmp038 />
        <Cmp039 />
      </section>
    </div>
  );
}
