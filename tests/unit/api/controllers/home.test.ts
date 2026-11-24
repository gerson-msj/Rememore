import { describe, expect, it, spyOn } from "bun:test";
import { consultarHome } from "@api/controllers/home";
import { criarConta } from "@api/controllers/usuarios";
import { perfilSimulado } from "@api/simulacao";

describe("GET /api/home simulado", () => {
  it("rejeita cookies ausentes, inválidos e malformados", () => {
    for (const cookie of ["", "outro=valor", "rememore_sessao=inválido", "rememore_sessao=%ZZ"]) {
      const resposta = consultarHome(new Request("http://localhost/api/home", { headers: { Cookie: cookie } }));
      expect(resposta.status).toBe(401);
      expect(resposta.body).toBeNull();
      expect(resposta.headers.has("set-cookie")).toBe(false);
    }
  });

  it("aceita cookie emitido pelo cadastro e devolve somente perfil/disponibilidades", async () => {
    const cadastro = await criarConta(new Request("http://localhost/api/usuarios", {
      method: "POST", body: JSON.stringify({ convite: "usuario", nomeUsuario: "usuario", senha: "usuario" }),
    }));
    expect(cadastro.status).toBe(201);
    expect(await cadastro.json()).toMatchObject({ perfil: perfilSimulado });
    const resposta = consultarHome(new Request("http://localhost/api/home", {
      headers: { Cookie: `outro=valor; ${cadastro.headers.get("set-cookie")!.split(";")[0]}` },
    }));
    expect(resposta.status).toBe(200);
    expect(await resposta.json()).toEqual({
      perfil: "admin", encontrarMemorias: true, reverUmDia: true, rememorar: true,
    });
  });

  it("retorna 500 sem detalhes em falha interna", () => {
    const request = new Request("http://localhost/api/home");
    const leitura = spyOn(request.headers, "get").mockImplementation(() => { throw new Error("falha interna"); });
    try {
      const resposta = consultarHome(request);
      expect(resposta.status).toBe(500);
      expect(resposta.body).toBeNull();
    } finally { leitura.mockRestore(); }
  });
});
