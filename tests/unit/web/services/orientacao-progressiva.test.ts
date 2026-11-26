import { afterEach, describe, expect, it, spyOn } from "bun:test";
import { resolverOrientacao, type ContextoOrientacao } from "@web/services/catalogo-orientacoes";
import { consultarOrientacao } from "@web/services/orientacao-progressiva";
import { observarSessaoInvalidada } from "@web/services/sessao-http";

afterEach(() => { spyOnFetch?.mockRestore(); spyOnFetch = undefined; });

let spyOnFetch: ReturnType<typeof espionarFetch> | undefined;

function espionarFetch() {
  return spyOn(globalThis, "fetch");
}

describe("serviço CMP-005", () => {
  it("consulta o endpoint sem parâmetros e resolve os três níveis", async () => {
    spyOnFetch = espionarFetch()
      .mockResolvedValueOnce(Response.json({ nivel: "iniciante" }))
      .mockResolvedValueOnce(Response.json({ nivel: "intermediario" }))
      .mockResolvedValueOnce(Response.json({ nivel: "avancado" }));

    expect(await consultarOrientacao("capturar.selecao")).toEqual({
      conteudo: "Você pode capturar qualquer dia até hoje.\nEscolha uma data para começar.",
      formato: "texto",
    });
    expect(await consultarOrientacao("capturar.selecao")).toEqual({
      conteudo: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
      formato: "texto",
    });
    expect(await consultarOrientacao("capturar.selecao")).toBeNull();
    expect(spyOnFetch.mock.calls).toEqual(Array.from({ length: 3 }, () => [
      "/api/orientacao-progressiva", { credentials: "include", headers: {} },
    ]));
  });

  it("rejeita um contexto desconhecido antes de consultar a API", async () => {
    spyOnFetch = espionarFetch();
    await expect(consultarOrientacao("toString" as ContextoOrientacao)).rejects.toMatchObject({ tipo: "contextoDesconhecido" });
    expect(spyOnFetch).not.toHaveBeenCalled();
  });

  it("distingue nível inválido ou ausente de uma orientação ausente", async () => {
    spyOnFetch = espionarFetch();
    for (const corpo of [{ nivel: "outro" }, { nivel: 1 }, {}]) {
      spyOnFetch.mockResolvedValueOnce(Response.json(corpo));
      await expect(consultarOrientacao("capturar.selecao")).rejects.toMatchObject({ tipo: "nivelInvalido" });
    }
  });

  it("propaga a falha de comunicação", async () => {
    spyOnFetch = espionarFetch().mockRejectedValueOnce(new Error("rede indisponível"));
    await expect(consultarOrientacao("capturar.selecao")).rejects.toMatchObject({ tipo: "comunicacao", status: null });
  });

  it("usa o tratamento de sessão do HTTP protegido", async () => {
    spyOnFetch = espionarFetch().mockResolvedValueOnce(new Response(null, { status: 401 }));
    let invalidacoes = 0;
    const remover = observarSessaoInvalidada(() => { invalidacoes += 1; });
    try {
      await expect(consultarOrientacao("capturar.selecao")).rejects.toMatchObject({ tipo: "http", status: 401 });
      expect(invalidacoes).toBe(1);
    } finally {
      remover();
    }
  });
});

describe("resolução das mensagens do catálogo", () => {
  it("preserva texto, quebras de linha e cor semântica com formato padrão", () => {
    const conteudo = "Primeira linha\nSegunda linha com <strong>texto literal</strong>";
    const orientacao = resolverOrientacao({ iniciante: { conteudo, cor: "info" } }, "iniciante");
    expect(orientacao).toEqual({ conteudo, formato: "texto", cor: "info" });
  });

  it("preserva HTML e o formato declarado", () => {
    const conteudo = "<p>Leia <strong>com atenção</strong>.</p>\n<ul><li>Um item</li></ul>";
    const orientacao = resolverOrientacao({ intermediario: { conteudo, formato: "html" } }, "intermediario");
    expect(orientacao).toEqual({ conteudo, formato: "html" });
  });
});
