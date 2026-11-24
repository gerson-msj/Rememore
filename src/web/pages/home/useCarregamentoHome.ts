import { useEffect, useState } from "react";
import type { HomeResponse } from "@shared/home";
import { usePopup } from "@web/components/popup/PopupContext";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext";
import { existemCapturasPendentes } from "@web/services/capturas";
import { consultarHome } from "@web/services/home";
import { FalhaHttp, falhaDesconhecida } from "@web/services/http";
import { obterGeracaoSessao, RespostaSessaoObsoleta } from "@web/services/sessao-http";

type EstadoHome =
  | { tipo: "carregando" | "falha" }
  | { tipo: "pronta"; home: HomeResponse; capturasPendentes: boolean };

function aguardarFimDaCobertura(signal: AbortSignal) {
  const raiz = document.documentElement;
  if (signal.aborted || !raiz.hasAttribute("data-processamento-ativo")) return;

  return new Promise<void>((resolver) => {
    const finalizar = () => {
      observador.disconnect();
      signal.removeEventListener("abort", finalizar);
      resolver();
    };
    // O CMP-039 mantém o bloqueio durante sua animação de saída.
    const observador = new MutationObserver(() => {
      if (!raiz.hasAttribute("data-processamento-ativo")) finalizar();
    });
    observador.observe(raiz, { attributes: true, attributeFilter: ["data-processamento-ativo"] });
    signal.addEventListener("abort", finalizar, { once: true });
  });
}

function mensagemSegura(falha: unknown) {
  const mensagem = falhaDesconhecida(falha).message || "Não foi possível concluir a operação. Tente novamente.";
  const paragrafo = document.createElement("p");
  paragrafo.textContent = mensagem;
  return paragrafo.outerHTML;
}

export function useCarregamentoHome() {
  const { abrirPopup } = usePopup();
  const { processar } = useProcessamento();
  const [estado, setEstado] = useState<EstadoHome>({ tipo: "carregando" });
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const { signal } = controlador;
    const geracao = obterGeracaoSessao();
    const aindaAtual = () => !signal.aborted && geracao === obterGeracaoSessao();

    async function carregar() {
      if (!aindaAtual()) return;
      try {
        const [home, pendencias] = await processar(() => Promise.allSettled([
          consultarHome(signal),
          existemCapturasPendentes(),
        ]));
        if (!aindaAtual()) return;
        if (home.status === "rejected") throw home.reason;
        if (pendencias.status === "rejected") throw pendencias.reason;
        setEstado({ tipo: "pronta", home: home.value, capturasPendentes: pendencias.value });
      } catch (falha) {
        if (!aindaAtual() || falha instanceof RespostaSessaoObsoleta ||
            (falha instanceof FalhaHttp && falha.status === 401)) return;
        await aguardarFimDaCobertura(signal);
        if (!aindaAtual()) return;
        const acao = await abrirPopup({
          titulo: "Não foi possível carregar a Home.",
          mensagemHtml: mensagemSegura(falha),
          botoes: { ok: { texto: "Tentar novamente" }, cancelar: { texto: "Fechar" } },
        }, signal);
        if (!aindaAtual()) return;
        if (acao === "OK") setTentativa((atual) => atual + 1);
        else setEstado({ tipo: "falha" });
      }
    }

    // Deixa o primeiro ciclo de efeitos do Strict Mode cancelar antes do fetch.
    queueMicrotask(() => void carregar());
    return () => controlador.abort();
  }, [abrirPopup, processar, tentativa]);

  function tentarNovamente() {
    if (estado.tipo !== "falha") return;
    setEstado({ tipo: "carregando" });
    setTentativa((atual) => atual + 1);
  }

  return { estado, tentarNovamente };
}
