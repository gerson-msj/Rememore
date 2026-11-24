import { afterEach, describe, expect, it } from "bun:test";
import { renderToString } from "react-dom/server";
import { SessaoProvider, useSessao } from "@web/contexts/SessaoContext";
import { obterGeracaoSessao, renovarGeracaoSessao } from "@web/services/sessao-http";

const fetchOriginal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchOriginal; renovarGeracaoSessao(); });

// Captura a operação real do provider sem DOM ou execução da consulta inicial.
// Este teste verifica o retorno e a geração, não a renderização após setState.
function obterSaida() {
  let sair!: ReturnType<typeof useSessao>["sair"];
  function Consumidor() {
    sair = useSessao().sair;
    return null;
  }
  renderToString(<SessaoProvider><Consumidor /></SessaoProvider>);
  return sair;
}

function simularFetch(operacao: () => Promise<Response>) {
  globalThis.fetch = Object.assign(operacao, { preconnect: fetchOriginal.preconnect });
}

describe("resultado de saída do provider", () => {
  it("confirma a saída normal e encerra a geração", async () => {
    simularFetch(async () => new Response(null, { status: 204 }));
    const geracao = obterGeracaoSessao();
    expect(await obterSaida()()).toBe(true);
    expect(obterGeracaoSessao()).toBe(geracao + 1);
  });

  it("descarta sucesso ou falha de saída antiga sem encerrar a nova geração", async () => {
    for (const status of [204, 500]) {
      let resolver!: (resposta: Response) => void;
      simularFetch(() => new Promise<Response>((resolve) => { resolver = resolve; }));
      const operacao = obterSaida()();
      renovarGeracaoSessao(); // Invalidação da sessão anterior.
      renovarGeracaoSessao(); // Nova autenticação antes da conclusão da saída.
      const geracaoPosterior = obterGeracaoSessao();
      resolver(new Response(null, { status }));
      expect(await operacao).toBe(false);
      expect(obterGeracaoSessao()).toBe(geracaoPosterior);
    }
  });

  it("preserva a falha real de saída da sessão atual", async () => {
    simularFetch(async () => new Response(null, { status: 500 }));
    const geracao = obterGeracaoSessao();
    await expect(obterSaida()()).rejects.toMatchObject({ tipo: "http", status: 500 });
    expect(obterGeracaoSessao()).toBe(geracao);
  });
});
