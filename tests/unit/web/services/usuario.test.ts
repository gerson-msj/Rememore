import { describe, expect, it, spyOn } from "bun:test";
import { FalhaHttp } from "@web/services/http";
import { consultarSessao, entrar } from "@web/services/usuario";

describe("serviço de entrada", () => {
  it("envia as credenciais à API e valida perfil e identidade", async () => {
    const sessao = { perfil: "usuario", idUsuario: "conta-de-teste" } as const;
    let opcoesRecebidas: RequestInit | undefined;
    const resposta: typeof fetch = Object.assign(async (_caminho: RequestInfo | URL, opcoes?: RequestInit) => {
      opcoesRecebidas = opcoes;
      return Response.json(sessao, { status: 200 });
    }, { preconnect: fetch.preconnect });
    const requisicao = spyOn(globalThis, "fetch").mockImplementation(resposta);

    try {
      await expect(entrar({ nomeUsuario: "usuario", senha: "usuario" }))
        .resolves.toEqual(sessao);
      expect(opcoesRecebidas?.method).toBe("POST");
      expect(opcoesRecebidas?.credentials).toBe("include");
      expect(opcoesRecebidas?.body).toBe(JSON.stringify({ nomeUsuario: "usuario", senha: "usuario" }));
    } finally {
      requisicao.mockRestore();
    }
  });

  it("rejeita a sessão autenticada sem identidade válida", async () => {
    const requisicao = spyOn(globalThis, "fetch");
    try {
      for (const idUsuario of [undefined, " ", 42]) {
        requisicao.mockResolvedValueOnce(Response.json({ perfil: "usuario", idUsuario }));
        await expect(consultarSessao()).rejects.toMatchObject({ tipo: "http", status: 200 });
      }
    } finally {
      requisicao.mockRestore();
    }
  });

  it("classifica credenciais rejeitadas como erro de aplicação", async () => {
    const requisicao = spyOn(globalThis, "fetch").mockResolvedValueOnce(Response.json({
      tipo: "erroAplicacao",
      mensagem: "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.",
    }, { status: 401 }));

    try {
      await expect(entrar({ nomeUsuario: "usuario", senha: "errada" })).rejects
        .toMatchObject({
          tipo: "aplicacao",
          status: 401,
          message: "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.",
        });
    } finally {
      requisicao.mockRestore();
    }
  });

  it("simula falha de comunicação sem enviar uma requisição", async () => {
    const requisicao = spyOn(globalThis, "fetch");

    try {
      await expect(entrar({ nomeUsuario: " REDE ", senha: "usuario" })).rejects
        .toBeInstanceOf(FalhaHttp);
      await expect(entrar({ nomeUsuario: "rede", senha: "usuario" })).rejects
        .toMatchObject({ tipo: "comunicacao", status: null });
      expect(requisicao).not.toHaveBeenCalled();
    } finally {
      requisicao.mockRestore();
    }
  });
});
