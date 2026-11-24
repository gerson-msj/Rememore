import { useLayoutEffect } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";
import { usePopup } from "@web/components/popup/PopupContext";
import "./home.css";

const mensagensIndisponibilidade = {
  encontrar: [
    "Encontre memórias já preservadas usando diferentes critérios de busca.",
    "Para começar a utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
  ],
  rever: [
    "Reveja as memórias que você preservou em uma data específica.",
    "Para utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
  ],
  rememorar: [
    "Rememorar permite explorar suas memórias por categorias e períodos, ajudando a perceber relações ao longo do tempo.",
    "Para que essa exploração faça sentido, é preciso ter memórias preservadas em pelo menos dois dias e distribuídas entre pelo menos duas categorias.",
    "Continue capturando suas memórias e o recurso ficará disponível conforme seu acervo crescer.",
  ],
};

export default function Home() {
  const { setConfiguracao } = useHeader();
  const { abrirPopup } = usePopup();
  // Referência estática da composição aprovada; integração reservada à E5.
  const jornadas = [
    {
      id: "capturar", titulo: "Capturar", icone: "feather-pointed", disponivel: true,
      descricao: "Preserve as memórias de um dia.",
    },
    {
      id: "encontrar", titulo: "Encontrar Memórias", icone: "magnifying-glass",
      descricao: "Localize memórias preservadas usando diferentes critérios.",
      disponivel: false,
      aviso: "Disponível depois que você capturar seu primeiro dia.",
      paragrafos: mensagensIndisponibilidade.encontrar,
    },
    {
      id: "rever", titulo: "Rever um Dia", icone: "location-crosshairs",
      descricao: "Volte às memórias preservadas de uma data específica.",
      disponivel: false,
      aviso: "Disponível depois que você capturar seu primeiro dia.",
      paragrafos: mensagensIndisponibilidade.rever,
    },
    {
      id: "rememorar", titulo: "Rememorar", icone: "book-open",
      descricao: "Explore suas memórias por categorias e períodos.",
      disponivel: false,
      aviso: "Disponível quando houver mais memórias preservadas.",
      paragrafos: mensagensIndisponibilidade.rememorar,
    },
  ];

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Rememore" });
  }, [setConfiguracao]);

  return (
    <section className="pagina-home" aria-label="Home">
      <div className="home-jornadas" aria-label="Jornadas">
        {jornadas.map((jornada) => (
          <button
            key={jornada.id}
            className="card-clicavel controle-com-borda"
            type="button"
            onClick={() => {
              if (jornada.disponivel || !jornada.paragrafos) return;
              void abrirPopup({
                titulo: jornada.titulo,
                icone: `fa-solid fa-${jornada.icone}`,
                mensagemHtml: jornada.paragrafos.map((texto) => `<p>${texto}</p>`).join(""),
                botoes: { ok: { texto: "OK" }, cancelar: { apresentar: false } },
              });
            }}
          >
            <i className={`card-clicavel-icone fa-solid fa-${jornada.icone} cor-info texto-cor-selecionada`} aria-hidden="true" />
            <span className="card-clicavel-textos">
              <span className="card-clicavel-titulo">{jornada.titulo}</span>
              <span className="card-clicavel-descricao">
                <span role="paragraph">{jornada.descricao}</span>
                {!jornada.disponivel && (
                  <span role="paragraph" className="card-clicavel-complemento">{jornada.aviso}</span>
                )}
              </span>
            </span>
          </button>
        ))}
      </div>
      <div className="home-acoes" aria-label="Ações da conta e capturas">
        <button className="card-clicavel card-botao controle-com-borda cor-alerta" type="button">
          <i className="card-clicavel-icone fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>Capturas pendentes</span>
        </button>
        <button className="card-clicavel card-botao controle-com-borda cor-info" type="button">
          <i className="card-clicavel-icone fa-solid fa-user-gear" aria-hidden="true" />
          <span>Minha Conta e Meus Dados</span>
        </button>
        <button className="card-clicavel card-botao controle-com-borda cor-info" type="button">
          <i className="card-clicavel-icone fa-solid fa-wrench" aria-hidden="true" />
          <span>Administração</span>
        </button>
      </div>

    </section>
  );
}
