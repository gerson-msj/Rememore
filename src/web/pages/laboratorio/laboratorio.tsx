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
import { Elm08 } from "./elementos/elm08";
import { Elm09 } from "./elementos/elm09";
import { Cmp001 } from "./componentes/cmp001";
import { Cmp002 } from "./componentes/cmp002";
import { Cmp003 } from "./componentes/cmp003";
import { Cmp028 } from "./componentes/cmp028";
import { Cmp038 } from "./componentes/cmp038";
import { Cmp039 } from "./componentes/cmp039";
import "./laboratorio.css";

export default function Laboratorio() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [tema, setTema] = useState(() => document.documentElement.dataset.theme ?? "light");
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
    const raiz = document.documentElement;
    const temaAnterior = raiz.dataset.theme;
    raiz.dataset.theme = tema;

    return () => {
      if (temaAnterior === undefined) delete raiz.dataset.theme;
      else raiz.dataset.theme = temaAnterior;
    };
  }, [tema]);

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

      <details className="bloco-teste">
        <summary className="bloco-teste-titulo link">Tema</summary>
        <div className="bloco-teste-conteudo">
          <select className="controle-com-borda" aria-label="Tema" value={tema} onChange={(evento) => setTema(evento.currentTarget.value)}>
            <option value="light">Claro</option>
            <option value="dark">Escuro</option>
          </select>
        </div>
      </details>

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
        <Elm08 />
        <Elm09 />
      </section>
      <section
        id="painel-componentes"
        aria-label="Componentes"
        hidden={abaSelecionada !== "componentes"}
      >
        <Cmp001 />
        <Cmp002 />
        <Cmp003 />
        <Cmp028 />
        <Cmp038 />
        <Cmp039 />
      </section>
    </div>
  );
}
