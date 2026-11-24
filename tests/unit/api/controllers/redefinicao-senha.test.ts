import { describe, expect, it } from "bun:test";
import { redefinirSenha } from "@api/controllers/usuarios";
import { consultarSessao } from "@api/controllers/sessao";

const chaveTeste = "550e8400-e29b-41d4-a716-446655440000";

function criarRequest(body: string, url = "http://localhost/api/usuarios/redefinicao-senha") {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });
}

describe("POST /api/usuarios/redefinicao-senha simulado", () => {
  it("retorna perfil, chave e cookie de sessão para a chave de teste", async () => {
    const response = await redefinirSenha(criarRequest(JSON.stringify({
      nomeUsuario: "usuario",
      chaveRedefinicao: chaveTeste,
      novaSenha: "usuario",
    })));

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ perfil: "admin", chaveRedefinicao: chaveTeste });
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("rememore_sessao=01ARZ3NDEKTSV4RRFFQ69G5FAV");
    expect(cookie).toContain("Path=/api");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=Lax");
    expect(cookie).toContain("Max-Age=31536000");
    expect(cookie).not.toContain("Secure");

    const consulta = await consultarSessao(new Request("http://localhost/api/sessao", {
      headers: { Cookie: cookie.split(";")[0] ?? "" },
    }));
    expect(consulta.status).toBe(200);
    expect(await consulta.json()).toEqual({ perfil: "admin" });
  });

  it("rejeita outra chave com erro geral sem devolver chave ou cookie", async () => {
    const response = await redefinirSenha(criarRequest(JSON.stringify({
      nomeUsuario: "usuario",
      chaveRedefinicao: "outra-chave",
      novaSenha: "senha-diferente",
    })));

    expect(response.status).toBe(422);
    expect(await response.json()).toEqual({
      tipo: "erroAplicacao",
      mensagem: "Não foi possível redefinir a senha. Confira as informações e tente novamente.",
    });
    expect(response.headers.has("set-cookie")).toBe(false);
  });

  it("retorna 400 sem corpo para JSON inválido ou campos ausentes e de tipo incorreto", async () => {
    const requests = [
      criarRequest("{"),
      criarRequest(JSON.stringify({ nomeUsuario: "usuario", chaveRedefinicao: chaveTeste })),
      criarRequest(JSON.stringify({ nomeUsuario: "usuario", chaveRedefinicao: 42, novaSenha: "usuario" })),
    ];
    for (const request of requests) {
      const response = await redefinirSenha(request);
      expect(response.status).toBe(400);
      expect(response.body).toBeNull();
      expect(response.headers.has("set-cookie")).toBe(false);
    }
  });
});
