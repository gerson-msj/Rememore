import { useLayoutEffect, useState } from "react";
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
  const [diasPreservados, setDiasPreservados] = useState(0);
  const [categoriasDistintas, setCategoriasDistintas] = useState(0);
  const [administrador, setAdministrador] = useState(false);
  const [capturasPendentes, setCapturasPendentes] = useState(false);

  const jornadas = [
    {
      id: "capturar", titulo: "Capturar", icone: "feather-pointed", disponivel: true,
      descricao: "Preserve as memórias de um dia.",
    },
    {
      id: "encontrar", titulo: "Encontrar Memórias", icone: "magnifying-glass",
      descricao: "Localize memórias preservadas usando diferentes critérios.",
      disponivel: diasPreservados >= 1,
      aviso: "Disponível depois que você capturar seu primeiro dia.",
      paragrafos: mensagensIndisponibilidade.encontrar,
    },
    {
      id: "rever", titulo: "Rever um Dia", icone: "location-crosshairs",
      descricao: "Volte às memórias preservadas de uma data específica.",
      disponivel: diasPreservados >= 1,
      aviso: "Disponível depois que você capturar seu primeiro dia.",
      paragrafos: mensagensIndisponibilidade.rever,
    },
    {
      id: "rememorar", titulo: "Rememorar", icone: "book-open",
      descricao: "Explore suas memórias por categorias e períodos.",
      disponivel: diasPreservados >= 2 && categoriasDistintas >= 2,
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
        {capturasPendentes && (
          <button className="card-clicavel card-botao controle-com-borda cor-alerta" type="button">
            <i className="card-clicavel-icone fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>Capturas pendentes</span>
          </button>
        )}
        <button className="card-clicavel card-botao controle-com-borda cor-info" type="button">
          <i className="card-clicavel-icone fa-solid fa-user-gear" aria-hidden="true" />
          <span>Minha Conta e Meus Dados</span>
        </button>
        {administrador && (
          <button className="card-clicavel card-botao controle-com-borda cor-info" type="button">
            <i className="card-clicavel-icone fa-solid fa-wrench" aria-hidden="true" />
            <span>Administração</span>
          </button>
        )}
      </div>

      <fieldset className="home-testes">
        <legend>Painel temporário de testes</legend>
        <div className="home-testes-controles">
          <div className="campo-texto">
            <label htmlFor="home-dias">Dias preservados</label>
            <div className="select-com-icone">
              <select id="home-dias" className="controle-com-borda" value={diasPreservados}
                onChange={(evento) => setDiasPreservados(Number(evento.currentTarget.value))}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
          <div className="campo-texto">
            <label htmlFor="home-categorias">Categorias distintas no acervo preservado</label>
            <div className="select-com-icone">
              <select id="home-categorias" className="controle-com-borda" value={categoriasDistintas}
                onChange={(evento) => setCategoriasDistintas(Number(evento.currentTarget.value))}>
                <option value={0}>0</option>
                <option value={1}>1</option>
                <option value={2}>2</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
          <div className="campo-texto">
            <label htmlFor="home-administrador">Usuário administrador</label>
            <div className="select-com-icone">
              <select id="home-administrador" className="controle-com-borda" value={administrador ? "sim" : "nao"}
                onChange={(evento) => setAdministrador(evento.currentTarget.value === "sim")}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
          <div className="campo-texto">
            <label htmlFor="home-pendentes">Capturas pendentes locais</label>
            <div className="select-com-icone">
              <select id="home-pendentes" className="controle-com-borda" value={capturasPendentes ? "sim" : "nao"}
                onChange={(evento) => setCapturasPendentes(evento.currentTarget.value === "sim")}>
                <option value="nao">Não</option>
                <option value="sim">Sim</option>
              </select>
              <i className="fa-solid fa-caret-down icone-selecao" aria-hidden="true" />
            </div>
          </div>
        </div>
      </fieldset>
    </section>
  );
}
