import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { usePopup } from "@web/components/popup/PopupContext";
import { SeletorData } from "@web/components/seletor-data/seletor-data";
import { useSessao } from "@web/contexts/SessaoContext";
import { useExecutorOperacao } from "@web/hooks/useExecutorOperacao";
import type { Orientacao } from "@web/services/catalogo-orientacoes";
import { listarCapturasLocaisPendentes, removerCapturaLocalPendente, type CapturaLocal } from "@web/services/capturas-locais";
import { mensagemFalhaConsultaPendencias } from "@web/services/capturas";
import { FalhaHttp } from "@web/services/http";
import { consultarOrientacao } from "@web/services/orientacao-progressiva";
import { RespostaSessaoObsoleta } from "@web/services/sessao-http";
import { formatarDataLocal, rotularDataCaptura, validarDataCaptura } from "./data-captura";
import "./capturar.css";

const confirmacoesExclusao = {
  ausente: {
    titulo: "Apagar as memórias de",
    mensagem: "As memórias desta captura ainda não foram preservadas e serão removidas.",
  },
  presente: {
    titulo: "Apagar as alterações de",
    mensagem: "As alterações ainda não preservadas serão removidas. As memórias já preservadas desse dia serão mantidas.",
  },
  desconhecida: {
    titulo: "Apagar o trabalho local de",
    mensagem: "O trabalho ainda não preservado desta captura será removido. Qualquer conteúdo já preservado será mantido.",
  },
};

function OrientacaoCapturar() {
  const executar = useExecutorOperacao();
  const [orientacao, setOrientacao] = useState<Orientacao | null>(null);

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    async function carregar() {
      if (signal.aborted) return;
      await executar({
        signal,
        operacao: async () => {
          try {
            const resultado = await consultarOrientacao("capturar.selecao", signal);
            if (!signal.aborted) setOrientacao(resultado);
          } catch (falha) {
            if (falha instanceof RespostaSessaoObsoleta || (falha instanceof FalhaHttp && falha.status === 401)) return;
            throw falha;
          }
        },
      });
    }

    queueMicrotask(() => void carregar());
    return () => controlador.abort();
  }, [executar]);

  if (!orientacao) return null;
  const classe = orientacao.cor ? `orientacao texto-cor-selecionada cor-${orientacao.cor}` : "orientacao";
  // O HTML vem do catálogo local. A API fornece apenas o nível.
  return orientacao.formato === "html"
    ? <div className={classe} dangerouslySetInnerHTML={{ __html: orientacao.conteudo }} />
    : <div className={classe}><p className="orientacao-texto">{orientacao.conteudo}</p></div>;
}

function SelecaoCaptura({ idUsuario }: { idUsuario: string }) {
  const navigate = useNavigate();
  const { setConfiguracao } = useHeader();
  const { abrirPopup } = usePopup();
  const executar = useExecutorOperacao();
  const cicloPagina = useRef<AbortController | null>(null);
  const exclusaoEmCurso = useRef(false);
  const [dataInicial] = useState(() => formatarDataLocal(new Date()));
  const [dataDeHoje, setDataDeHoje] = useState(dataInicial);
  const [dataSelecionada, setDataSelecionada] = useState("");
  const [pendencias, setPendencias] = useState<CapturaLocal[]>([]);

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Capturar", voltar: () => void navigate("/home") });
  }, [navigate, setConfiguracao]);

  useLayoutEffect(() => {
    const controlador = new AbortController();
    cicloPagina.current = controlador;
    return () => controlador.abort();
  }, []);

  useEffect(() => {
    let temporizador: number;

    function sincronizarDiaLocal() {
      window.clearTimeout(temporizador);
      const agora = new Date();
      setDataDeHoje(formatarDataLocal(agora));
      const proximaMeiaNoite = new Date(agora);
      proximaMeiaNoite.setHours(24, 0, 0, 0);
      temporizador = window.setTimeout(sincronizarDiaLocal, proximaMeiaNoite.getTime() - agora.getTime());
    }

    function aoExibirAba() {
      if (document.visibilityState === "visible") sincronizarDiaLocal();
    }

    sincronizarDiaLocal();
    window.addEventListener("focus", sincronizarDiaLocal);
    document.addEventListener("visibilitychange", aoExibirAba);
    return () => {
      window.clearTimeout(temporizador);
      window.removeEventListener("focus", sincronizarDiaLocal);
      document.removeEventListener("visibilitychange", aoExibirAba);
    };
  }, []);

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;

    async function carregar() {
      if (signal.aborted) return;
      try {
        const resultado = await listarCapturasLocaisPendentes(idUsuario);
        if (!signal.aborted) {
          setPendencias(resultado.sort((a, b) => a.data.localeCompare(b.data)));
        }
      } catch {
        if (!signal.aborted) {
          await abrirPopup({
            mensagemHtml: `<p>${mensagemFalhaConsultaPendencias}</p>`,
            botoes: { ok: { texto: "Entendi" }, cancelar: { apresentar: false } },
          }, signal);
        }
      }
    }

    queueMicrotask(() => void carregar());
    return () => controlador.abort();
  }, [abrirPopup, idUsuario]);

  async function excluirCaptura(captura: CapturaLocal) {
    const signal = cicloPagina.current?.signal;
    if (!signal || signal.aborted || exclusaoEmCurso.current) return;
    exclusaoEmCurso.current = true;

    try {
      const confirmacao = confirmacoesExclusao[captura.origemRemota];
      const acao = await abrirPopup({
        titulo: `${confirmacao.titulo} ${rotularDataCaptura(captura.data)}?`,
        mensagemHtml: `<p>${confirmacao.mensagem}</p>`,
        botoes: { ok: { texto: "Apagar", tema: "perigo" }, cancelar: { texto: "Cancelar" } },
      }, signal);
      if (acao !== "OK" || signal.aborted) return;

      await executar({
        signal,
        operacao: async () => {
          await removerCapturaLocalPendente(idUsuario, captura.data, captura.origemRemota);
          if (signal.aborted) return;
          setPendencias((atuais) => atuais.filter(({ data }) => data !== captura.data));
        },
        aoFalhar: async () => {
          await abrirPopup({
            mensagemHtml: "<p>Não foi possível apagar as alterações. Tente novamente.</p>",
            botoes: { ok: { texto: "Entendi" }, cancelar: { apresentar: false } },
          }, signal);
        },
      });
    } finally {
      exclusaoEmCurso.current = false;
    }
  }

  const selecaoValida = validarDataCaptura(dataSelecionada);

  return (
    <section className="pagina-capturar" aria-label="Selecionar data para capturar">
      <OrientacaoCapturar />
      <SeletorData
        dataInicial={dataInicial}
        dataMaxima={dataDeHoje}
        aoSelecionar={({ valida, valor }) => setDataSelecionada(valida ? valor : "")}
      />
      <button className="botao" type="button" disabled={!selecaoValida} onClick={() => {
        if (validarDataCaptura(dataSelecionada)) void navigate(`/capturar/${dataSelecionada}`);
      }}>Capturar</button>

      {pendencias.length > 0 && (
        <section className="capturar-pendencias" aria-labelledby="capturar-pendencias-titulo">
          <h2 className="subtitulo" id="capturar-pendencias-titulo">Capturas pendentes</h2>
          <ul className="lista-acoes" role="list">
            {pendencias.map((captura) => {
              const { data } = captura;
              const rotulo = rotularDataCaptura(data);

              return (
                <li key={data}>
                  <Link className="lista-acoes-texto link" to={`/capturar/${data}`}>
                    <time dateTime={data}>{rotulo}</time>
                  </Link>
                  <div className="lista-acoes-botoes">
                    <button className="lista-acoes-acao link cor-perigo" type="button" aria-label={`Excluir captura de ${rotulo}`} onClick={() => void excluirCaptura(captura)}>
                      <i className="fa-solid fa-trash" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </section>
  );
}

export default function Capturar() {
  const { idUsuario } = useSessao();
  return idUsuario === null ? null : <SelecaoCaptura key={idUsuario} idUsuario={idUsuario} />;
}
