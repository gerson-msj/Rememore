import { useEffect, useEffectEvent, useLayoutEffect, useState } from "react";
import { Outlet } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { usePopup, type AcaoPopup, type OpcoesPopup } from "@web/components/popup/PopupContext";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext";
import { useSessao } from "@web/contexts/SessaoContext";
import { useExecutorOperacao } from "@web/hooks/useExecutorOperacao";
import { useSaidaSessao } from "@web/hooks/useSaidaSessao";
import { diagnosticarIndexedDB } from "@web/services/indexeddb/diagnostico";

const popupIndisponibilidade: OpcoesPopup = {
  titulo: "Armazenamento local indisponível",
  mensagemHtml: "<p>O Rememore precisa do armazenamento local do navegador para funcionar e proteger suas memórias.</p>" +
    "<p>Verifique as configurações de privacidade e armazenamento do navegador e tente novamente.</p>",
  tema: "alerta",
  impedirDispensa: true,
  botoes: {
    ok: { texto: "Verificar novamente" },
    cancelar: { texto: "Sair", tema: "perigo" },
  },
};

function VerificacaoArmazenamento() {
  const [liberado, setLiberado] = useState(false);
  const { setConfiguracao } = useHeader();
  const { processar } = useProcessamento();
  const { abrirPopup } = usePopup();
  const executarOperacao = useExecutorOperacao();
  const sairDaSessao = useSaidaSessao();
  const executarSaida = useEffectEvent(() => executarOperacao({ operacao: sairDaSessao }));

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Rememore", apresentarSair: false });
  }, [setConfiguracao]);

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;
    const cancelamento = new Promise<null>((resolver) => {
      signal.addEventListener("abort", () => resolver(null), { once: true });
    });

    async function verificar() {
      while (!signal.aborted) {
        const resultado = await processar(
          () => Promise.race([diagnosticarIndexedDB(), cancelamento]),
          "Verificando armazenamento local...",
        );
        if (signal.aborted) return;
        if (resultado === "operacional") {
          setLiberado(true);
          return;
        }

        let acao: AcaoPopup;
        do {
          acao = await abrirPopup(popupIndisponibilidade, signal);
          if (signal.aborted) return;
          if (acao === "Cancelar" && await executarSaida()) return;
        } while (acao === "Cancelar" && !signal.aborted);
      }
    }

    // Só inicia depois da montagem efetiva no Strict Mode.
    queueMicrotask(() => void verificar());
    return () => controlador.abort();
  }, [abrirPopup, processar]);

  return liberado ? <Outlet /> : null;
}

export function AcessoArmazenamentoLocal() {
  const { idUsuario } = useSessao();
  return idUsuario === null ? null : <VerificacaoArmazenamento key={idUsuario} />;
}
