import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { SeletorData } from "@web/components/seletor-data/seletor-data";
import "./capturar.css";

const orientacoesSimuladas = {
  iniciante: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
  intermediario: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
  avancado: null,
};

type NivelSimulado = keyof typeof orientacoesSimuladas;

function formatarDataLocal(data: Date) {
  const ano = String(data.getFullYear()).padStart(4, "0");
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function listarDatasSimuladas(hoje: Date, quantidade: number) {
  return Array.from({ length: quantidade }, (_, indice) => {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - quantidade + indice);
    return formatarDataLocal(data);
  });
}

export default function Capturar() {
  const navigate = useNavigate();
  const { setConfiguracao } = useHeader();
  const [hoje] = useState(() => new Date());
  const [dataValida, setDataValida] = useState(false);
  const [nivelSimulado, setNivelSimulado] = useState<NivelSimulado>("iniciante");
  const [quantidadeSimulada, setQuantidadeSimulada] = useState(0);

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Capturar", voltar: () => void navigate("/home") });
  }, [navigate, setConfiguracao]);

  const dataDeHoje = formatarDataLocal(hoje);
  const orientacao = orientacoesSimuladas[nivelSimulado];
  const datasPendentes = listarDatasSimuladas(hoje, quantidadeSimulada);

  return (
    <section className="pagina-capturar" aria-label="Selecionar data para capturar">
      {orientacao && (
        <div className="orientacao">
          <p className="orientacao-texto">{orientacao}</p>
        </div>
      )}

      <SeletorData
        dataInicial={dataDeHoje}
        dataMaxima={dataDeHoje}
        aoSelecionar={({ valida }) => setDataValida(valida)}
      />
      <button className="botao" type="button" disabled={!dataValida}>Capturar</button>

      {datasPendentes.length > 0 && (
        <section className="capturar-pendencias" aria-labelledby="capturar-pendencias-titulo">
          <h2 className="subtitulo" id="capturar-pendencias-titulo">Capturas pendentes</h2>
          <ul className="lista-acoes" role="list">
            {datasPendentes.map((data) => {
              const [ano, mes, dia] = data.split("-");
              const rotulo = `${dia}/${mes}/${ano}`;

              return (
                <li key={data}>
                  <button className="lista-acoes-texto link" type="button">
                    <time dateTime={data}>{rotulo}</time>
                  </button>
                  <div className="lista-acoes-botoes">
                    <button className="lista-acoes-acao link cor-perigo" type="button" aria-label={`Excluir captura de ${rotulo}`}>
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <fieldset className="capturar-controles-teste">
        <legend>Controles de teste</legend>
        <div className="campo-texto">
          <label htmlFor="capturar-nivel-simulado">Nível de orientação</label>
          <select id="capturar-nivel-simulado" className="controle-com-borda" value={nivelSimulado} onChange={(evento) => setNivelSimulado(evento.currentTarget.value as NivelSimulado)}>
            <option value="iniciante">Iniciante</option>
            <option value="intermediario">Intermediário</option>
            <option value="avancado">Avançado</option>
          </select>
        </div>
        <div className="campo-texto">
          <label htmlFor="capturar-quantidade-simulada">Capturas pendentes simuladas</label>
          <select id="capturar-quantidade-simulada" className="controle-com-borda" value={quantidadeSimulada} onChange={(evento) => setQuantidadeSimulada(Number(evento.currentTarget.value))}>
            {Array.from({ length: 11 }, (_, quantidade) => <option key={quantidade} value={quantidade}>{quantidade}</option>)}
          </select>
        </div>
      </fieldset>
    </section>
  );
}
