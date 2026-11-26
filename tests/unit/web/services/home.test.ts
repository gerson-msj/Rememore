import { afterEach, describe, expect, it } from "bun:test";
import type { HomeResponse } from "@shared/home";
import { consultarHome } from "@web/services/home";
import { requisitar } from "@web/services/http";
import { consultarSessao, criarConta, entrar, redefinirSenha } from "@web/services/usuario";
import {
  invalidarSessaoHttp, observarSessaoInvalidada, obterGeracaoSessao,
  renovarGeracaoSessao, RespostaSessaoObsoleta,
} from "@web/services/sessao-http";

const fetchOriginal = globalThis.fetch;
const dadosHome: HomeResponse = { perfil: "admin", encontrarMemorias: true, reverUmDia: false, rememorar: true };
afterEach(() => { globalThis.fetch = fetchOriginal; renovarGeracaoSessao(); });

function simularFetch(operacao: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>) {
  globalThis.fetch = Object.assign(operacao, { preconnect: fetchOriginal.preconnect });
}

function adiar<T>() {
  let resolver!: (valor: T) => void;
  const promessa = new Promise<T>((resolve) => { resolver = resolve; });
  return { promessa, resolver };
}

describe("serviços da Home e HTTP protegido", () => {
  it("consulta uma vez com credenciais e sem parâmetros", async () => {
    const chamadas: Array<[RequestInfo | URL, RequestInit | undefined]> = [];
    simularFetch(async (input, init) => { chamadas.push([input, init]); return Response.json(dadosHome); });
    expect(await consultarHome()).toEqual(dadosHome);
    expect(chamadas).toHaveLength(1);
    expect(chamadas[0]?.[0]).toBe("/api/home");
    expect(chamadas[0]?.[1]?.credentials).toBe("include");
    expect(chamadas[0]?.[1]?.body).toBeUndefined();
  });

  it("rejeita contratos de sucesso inválidos", async () => {
    for (const dados of [null, {}, { ...dadosHome, perfil: "outro" },
      { ...dadosHome, encontrarMemorias: 1 }, { ...dadosHome, reverUmDia: null },
      { ...dadosHome, rememorar: undefined }]) {
      simularFetch(async () => Response.json(dados));
      await expect(consultarHome()).rejects.toMatchObject({ tipo: "http", status: 200 });
    }
  });

  it("invalida uma só vez em 401 simultâneos e não retorna dados", async () => {
    let invalidacoes = 0;
    const remover = observarSessaoInvalidada(() => { invalidacoes += 1; });
    const resposta = adiar<Response>();
    simularFetch(() => resposta.promessa);
    const operacoes = Promise.allSettled([consultarHome(), consultarHome(), consultarHome()]);
    resposta.resolver(new Response(null, { status: 401 }));
    try {
      const resultados = await operacoes;
      expect(invalidacoes).toBe(1);
      expect(resultados.every((item) => item.status === "rejected")).toBe(true);
      expect(resultados[0]).toMatchObject({ reason: { status: 401 } });
      expect(resultados[1]).toMatchObject({ reason: expect.any(RespostaSessaoObsoleta) });
    } finally { remover(); }
  });

  it("descarta sucesso e 401 antigos após saída e nova autenticação", async () => {
    let invalidacoes = 0;
    const remover = observarSessaoInvalidada(() => { invalidacoes += 1; });
    try {
      for (const status of [200, 401]) {
        const resposta = adiar<Response>();
        simularFetch(() => resposta.promessa);
        const operacao = consultarHome();
        const resultado = Promise.allSettled([operacao]);
        renovarGeracaoSessao(); // Saída concluída.
        renovarGeracaoSessao(); // Autenticação posterior.
        resposta.resolver(status === 200 ? Response.json(dadosHome) : new Response(null, { status }));
        expect((await resultado)[0]).toMatchObject({ status: "rejected", reason: expect.any(RespostaSessaoObsoleta) });
      }
      expect(invalidacoes).toBe(0);
    } finally { remover(); }
  });

  it("descarta o corpo que terminou de ser lido depois do fim da sessão", async () => {
    const corpo = adiar<unknown>();
    const leituraIniciada = adiar<void>();
    const resposta = Response.json(dadosHome);
    resposta.json = () => { leituraIniciada.resolver(); return corpo.promessa; };
    simularFetch(async () => resposta);
    const operacao = consultarHome();
    const resultado = Promise.allSettled([operacao]);
    await leituraIniciada.promessa;
    invalidarSessaoHttp(obterGeracaoSessao());
    corpo.resolver(dadosHome);
    expect((await resultado)[0]).toMatchObject({ status: "rejected", reason: expect.any(RespostaSessaoObsoleta) });
  });

  it("não invalida a sessão se um 401 chega após o cancelamento da consulta", async () => {
    const resposta = adiar<Response>();
    simularFetch(() => resposta.promessa);
    const controlador = new AbortController();
    const geracao = obterGeracaoSessao();
    const resultado = Promise.allSettled([consultarHome(controlador.signal)]);
    controlador.abort();
    resposta.resolver(new Response(null, { status: 401 }));

    expect((await resultado)[0]).toMatchObject({ status: "rejected", reason: { name: "AbortError" } });
    expect(obterGeracaoSessao()).toBe(geracao);
  });

  it("preserva sessão em 403, 500 e falha de comunicação", async () => {
    let invalidacoes = 0;
    const remover = observarSessaoInvalidada(() => { invalidacoes += 1; });
    try {
      const geracao = obterGeracaoSessao();
      for (const status of [403, 500]) {
        simularFetch(async () => new Response(null, { status }));
        await expect(consultarHome()).rejects.toMatchObject({ tipo: "http", status });
      }
      simularFetch(async () => { throw new Error("sem rede"); });
      await expect(consultarHome()).rejects.toMatchObject({ tipo: "comunicacao", status: null });
      expect(invalidacoes).toBe(0);
      expect(obterGeracaoSessao()).toBe(geracao);
    } finally { remover(); }
  });

  it("preserva o 401 inicial de sessão e o erro de credenciais do login", async () => {
    let invalidacoes = 0;
    const remover = observarSessaoInvalidada(() => { invalidacoes += 1; });
    simularFetch(async () => Response.json({ tipo: "erroAplicacao", mensagem: "Credenciais inválidas." }, { status: 401 }));
    try {
      expect(await consultarSessao()).toBeNull();
      await expect(entrar({ nomeUsuario: "usuario", senha: "errada" })).rejects
        .toMatchObject({ tipo: "aplicacao", status: 401, message: "Credenciais inválidas." });
      expect(invalidacoes).toBe(0);
    } finally { remover(); }
  });

  it("preserva contratos de cadastro e redefinição e erros por campo", async () => {
    const dados = { perfil: "admin", idUsuario: "conta-de-teste", chaveRedefinicao: "chave" } as const;
    simularFetch(async () => Response.json(dados, { status: 201 }));
    expect(await criarConta({ convite: "usuario", nomeUsuario: "usuario", senha: "usuario" }))
      .toEqual(dados);
    simularFetch(async () => Response.json(dados));
    expect(await redefinirSenha({ nomeUsuario: "usuario", chaveRedefinicao: "chave", novaSenha: "nova" }))
      .toEqual(dados);
    simularFetch(async () => Response.json({ tipo: "erroAplicacao", errosCampos: { convite: "Inválido" } }, { status: 422 }));
    await expect(criarConta({ convite: "outro", nomeUsuario: "usuario", senha: "usuario" })).rejects
      .toMatchObject({ tipo: "aplicacao", status: 422, errosCampos: { convite: "Inválido" } });
  });

  it("401 protegido não pode ser liberado por statusPermitidos", async () => {
    simularFetch(async () => new Response(null, { status: 401 }));
    await expect(requisitar("/api/home", {}, [401], { protegida: true })).rejects.toMatchObject({ status: 401 });
  });
});
