import { describe, expect, it } from "bun:test";
import { FalhaHttp } from "@web/services/http";
import { entrar } from "@web/services/usuario";

describe("serviço de entrada", () => {
  it("envia as credenciais à API e valida a resposta de perfil", async () => {
    const requisicaoOriginal = globalThis.fetch;
    let opcoesRecebidas: RequestInit | undefined;
    globalThis.fetch = async (_caminho, opcoes) => {
      opcoesRecebidas = opcoes;
      return Response.json({ perfil: "usuario" }, { status: 200 });
    };

    try {
      await expect(entrar({ nomeUsuario: "usuario", senha: "usuario" }))
        .resolves.toEqual({ perfil: "usuario" });
      expect(opcoesRecebidas?.method).toBe("POST");
      expect(opcoesRecebidas?.credentials).toBe("include");
      expect(opcoesRecebidas?.body).toBe(JSON.stringify({ nomeUsuario: "usuario", senha: "usuario" }));
    } finally {
      globalThis.fetch = requisicaoOriginal;
    }
  });

  it("classifica credenciais rejeitadas como erro de aplicação", async () => {
    const requisicaoOriginal = globalThis.fetch;
    globalThis.fetch = async () => Response.json({
      tipo: "erroAplicacao",
      mensagem: "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.",
    }, { status: 401 });

    try {
      await expect(entrar({ nomeUsuario: "usuario", senha: "errada" })).rejects
        .toMatchObject({
          tipo: "aplicacao",
          status: 401,
          message: "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.",
        });
    } finally {
      globalThis.fetch = requisicaoOriginal;
    }
  });

  it("simula falha de comunicação sem enviar uma requisição", async () => {
    const requisicaoOriginal = globalThis.fetch;
    let chamadas = 0;
    globalThis.fetch = async () => {
      chamadas += 1;
      throw new Error("A simulação de rede não deveria chamar fetch.");
    };

    try {
      await expect(entrar({ nomeUsuario: " REDE ", senha: "usuario" })).rejects
        .toBeInstanceOf(FalhaHttp);
      await expect(entrar({ nomeUsuario: "rede", senha: "usuario" })).rejects
        .toMatchObject({ tipo: "comunicacao", status: null });
      expect(chamadas).toBe(0);
    } finally {
      globalThis.fetch = requisicaoOriginal;
    }
  });
});
