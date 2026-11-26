import { describe, expect, it } from "bun:test";
import { consultarSessao, entrar, sair } from "@api/controllers/sessao";
import { consultarHome } from "@api/controllers/home";
import { consultarOrientacaoProgressiva } from "@api/controllers/orientacao-progressiva";
import { criarConta } from "@api/controllers/usuarios";

function criarRequest(body: string) {
  return new Request("http://localhost/api/sessao", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/sessao simulado", () => {
  it("rejeita JSON inválido e campos ausentes ou de tipo incorreto sem corpo", async () => {
    const requests = [
      criarRequest("{"),
      criarRequest("null"),
      criarRequest(JSON.stringify({ senha: "usuario" })),
      criarRequest(JSON.stringify({ nomeUsuario: "usuario" })),
      criarRequest(JSON.stringify({ nomeUsuario: 42, senha: "usuario" })),
      criarRequest(JSON.stringify({ nomeUsuario: "usuario", senha: false })),
    ];

    for (const request of requests) {
      const response = await entrar(request);
      expect(response.status).toBe(400);
      expect(response.body).toBeNull();
      expect(response.headers.has("set-cookie")).toBe(false);
    }
  });

  it("normaliza o usuário, retorna perfil e emite o cookie simulado no sucesso", async () => {
    const response = await entrar(criarRequest(JSON.stringify({
      nomeUsuario: " USUARIO ",
      senha: "usuario",
    })));

    expect(response.status).toBe(200);
    const sessao = await response.json();
    expect(sessao).toEqual({ perfil: "admin", idUsuario: expect.any(String) });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/^rememore_sessao=[^;]+;/);
    expect(cookie).toContain("Path=/api");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=31536000");
    expect(cookie).not.toContain("Secure");
    expect(cookie).not.toContain(sessao.idUsuario);

    const consulta = await consultarSessao(new Request("http://localhost/api/sessao", {
      headers: { Cookie: cookie.split(";")[0] ?? "" },
    }));
    expect(consulta.status).toBe(200);
    expect(await consulta.json()).toEqual(sessao);

    const novoLogin = await entrar(criarRequest(JSON.stringify({ nomeUsuario: "usuario", senha: "usuario" })));
    expect(await novoLogin.json()).toEqual(sessao);

    const cadastro = await criarConta(criarRequest(JSON.stringify({ convite: "usuario", nomeUsuario: "usuario", senha: "usuario" })));
    expect(cadastro.status).toBe(201);
    expect(await cadastro.json()).toMatchObject(sessao);
  });

  it("não aceita o identificador público do usuário como credencial nos endpoints protegidos", async () => {
    const login = await entrar(criarRequest(JSON.stringify({ nomeUsuario: "usuario", senha: "usuario" })));
    expect(login.status).toBe(200);
    const { idUsuario } = await login.json();
    for (const consultar of [consultarSessao, consultarHome, consultarOrientacaoProgressiva]) {
      const resposta = consultar(new Request("http://localhost/api/sessao", {
        headers: { Cookie: `rememore_sessao=${idUsuario}` },
      }));
      expect(resposta.status).toBe(401);
    }
  });

  it("retorna erro geral invariável para credenciais inválidas sem emitir cookie", async () => {
    const response = await entrar(criarRequest(JSON.stringify({
      nomeUsuario: "desconhecido",
      senha: "incorreta",
    })));

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      tipo: "erroAplicacao",
      mensagem: "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.",
    });
    expect(response.headers.has("set-cookie")).toBe(false);

    const senhaComEspacos = await entrar(criarRequest(JSON.stringify({
      nomeUsuario: "usuario",
      senha: " usuario ",
    })));
    expect(senhaComEspacos.status).toBe(401);
    expect(senhaComEspacos.headers.has("set-cookie")).toBe(false);
  });

  it("mantém o cenário de falha HTTP sem corpo nem cookie", async () => {
    const response = await entrar(criarRequest(JSON.stringify({
      nomeUsuario: "API",
      senha: "usuario",
    })));

    expect(response.status).toBe(500);
    expect(response.body).toBeNull();
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it("preserva a consulta sem sessão e a remoção do cookie existentes", async () => {
    const semSessao = await consultarSessao(new Request("http://localhost/api/sessao"));
    expect(semSessao.status).toBe(401);
    expect(semSessao.body).toBeNull();

    const respostaSaida = await sair(new Request("http://localhost/api/sessao", {
      method: "DELETE",
    }));
    expect(respostaSaida.status).toBe(204);
    expect(respostaSaida.headers.get("set-cookie")).toContain("rememore_sessao=;");
    expect(respostaSaida.headers.get("set-cookie")).toContain("Max-Age=0");
  });
});
