import { describe, expect, it } from "bun:test";
import { consultarOrientacaoProgressiva } from "@api/controllers/orientacao-progressiva";
import { entrar } from "@api/controllers/sessao";

const endpoint = "http://localhost/api/orientacao-progressiva";

describe("GET /api/orientacao-progressiva", () => {
  it("rejeita cookies ausentes, inválidos e malformados", () => {
    const cabecalhos = [undefined, { Cookie: "rememore_sessao=invalido" }, { Cookie: "rememore_sessao=%ZZ" }];
    for (const headers of cabecalhos) {
      const resposta = consultarOrientacaoProgressiva(new Request(endpoint, { headers }));
      expect(resposta.status).toBe(401);
      expect(resposta.body).toBeNull();
    }
  });

  it("aceita a sessão emitida pelo login e retorna somente o nível simulado", async () => {
    const sessao = await entrar(new Request("http://localhost/api/sessao", {
      method: "POST",
      body: JSON.stringify({ nomeUsuario: "usuario", senha: "usuario" }),
    }));
    expect(sessao.status).toBe(200);
    const cookie = sessao.headers.get("set-cookie")?.split(";")[0];
    expect(cookie).toBeDefined();

    const resposta = consultarOrientacaoProgressiva(new Request(endpoint, { headers: { Cookie: cookie! } }));
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({ nivel: "iniciante" });
  });
});
