import { afterEach, beforeEach, describe, expect, it } from "bun:test";
import { IDBFactory } from "fake-indexeddb";
import { existemCapturasPendentes, FalhaConsultaPendencias } from "@web/services/capturas";
import {
  existemCapturasLocaisPendentes, listarCapturasLocais, listarCapturasLocaisPendentes,
  recuperarCapturaLocal, removerCapturaLocal, removerCapturaLocalPendente, salvarCapturaLocal, type CapturaLocal,
} from "@web/services/capturas-locais";
import { aguardarRequisicao, operarNoBanco } from "@web/services/indexeddb/banco";
import { diagnosticarIndexedDB } from "@web/services/indexeddb/diagnostico";
import { renovarGeracaoSessao, RespostaSessaoObsoleta } from "@web/services/sessao-http";

const descritorOriginal = Object.getOwnPropertyDescriptor(globalThis, "indexedDB");

function definirFabrica(fabrica: IDBFactory | undefined) {
  Object.defineProperty(globalThis, "indexedDB", { configurable: true, value: fabrica });
}

beforeEach(() => definirFabrica(new IDBFactory()));
afterEach(() => {
  renovarGeracaoSessao();
  if (descritorOriginal) Object.defineProperty(globalThis, "indexedDB", descritorOriginal);
  else Reflect.deleteProperty(globalThis, "indexedDB");
});

const captura: Omit<CapturaLocal, "idUsuario"> = {
  data: "2026-11-24",
  alterada: true,
  origemRemota: "presente",
  revisaoOrigem: "rev-1",
  memorias: [
    { idLocal: "mem-2", ordem: 2, texto: "Segunda memória" },
    { idLocal: "mem-1", ordem: 1, texto: "Primeira memória" },
  ],
};

describe("capturas locais", () => {
  it("cria, lê em nova conexão, atualiza e remove uma captura", async () => {
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toBeUndefined();
    await salvarCapturaLocal("conta-a", captura);
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toEqual({
      ...captura, idUsuario: "conta-a", memorias: captura.memorias.toReversed(),
    });

    await salvarCapturaLocal("conta-a", { ...captura, alterada: false, revisaoOrigem: "rev-2" });
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toMatchObject({ alterada: false, revisaoOrigem: "rev-2" });
    await removerCapturaLocal("conta-a", captura.data);
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toBeUndefined();
  });

  it("isola contas com a mesma data e distingue capturas limpas de pendências", async () => {
    const outraData = "2026-11-25";
    await Promise.all([
      salvarCapturaLocal("conta-a", captura),
      salvarCapturaLocal("conta-a", { ...captura, data: outraData, alterada: false }),
      salvarCapturaLocal("conta-b", { ...captura, alterada: false, origemRemota: "ausente" }),
    ]);

    expect((await listarCapturasLocais("conta-a")).map(({ data }) => data)).toEqual([captura.data, outraData]);
    expect(await listarCapturasLocais("conta-b")).toHaveLength(1);
    expect((await listarCapturasLocaisPendentes("conta-a")).map(({ idUsuario, data }) => [idUsuario, data]))
      .toEqual([["conta-a", captura.data]]);
    expect(await listarCapturasLocaisPendentes("conta-b")).toEqual([]);
    expect(await existemCapturasLocaisPendentes("conta-a")).toBe(true);
    expect(await existemCapturasLocaisPendentes("conta-b")).toBe(false);
    expect(await recuperarCapturaLocal("conta-b", outraData)).toBeUndefined();
    await removerCapturaLocal("conta-a", captura.data);
    expect(await existemCapturasLocaisPendentes("conta-a")).toBe(false);
    expect(await recuperarCapturaLocal("conta-b", captura.data)).toMatchObject({ idUsuario: "conta-b", origemRemota: "ausente" });
  });

  it("propaga falhas de abertura sem convertê-las em ausência", async () => {
    const banco = await aguardarRequisicao(indexedDB.open("rememore", 3));
    banco.close();
    await expect(recuperarCapturaLocal("conta-a", captura.data)).rejects.toMatchObject({ name: "VersionError" });
    await expect(existemCapturasLocaisPendentes("conta-a")).rejects.toMatchObject({ name: "VersionError" });
    const versaoPosterior = await aguardarRequisicao(indexedDB.open("rememore"));
    try { expect(versaoPosterior.version).toBe(3); } finally { versaoPosterior.close(); }
  });

  it("exclui somente a pendência da conta confirmada e com a origem confirmada", async () => {
    const limpa = { ...captura, data: "2026-11-25", alterada: false };
    await salvarCapturaLocal("conta-a", captura);
    await salvarCapturaLocal("conta-a", limpa);
    await salvarCapturaLocal("conta-b", captura);

    await expect(removerCapturaLocalPendente("conta-a", limpa.data, "presente")).rejects.toThrow();
    await expect(removerCapturaLocalPendente("conta-a", captura.data, "ausente")).rejects.toThrow();
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toMatchObject({ alterada: true });
    await removerCapturaLocalPendente("conta-a", captura.data, "presente");

    expect(await recuperarCapturaLocal("conta-a", captura.data)).toBeUndefined();
    expect(await recuperarCapturaLocal("conta-a", limpa.data)).toMatchObject({ alterada: false });
    expect(await recuperarCapturaLocal("conta-b", captura.data)).toMatchObject({ alterada: true });
  });

  it("faz a Home consultar a conta corrente e rejeita leituras obsoletas ou indisponíveis", async () => {
    await salvarCapturaLocal("conta-a", captura);
    await salvarCapturaLocal("conta-b", { ...captura, alterada: false });
    renovarGeracaoSessao("conta-a");
    expect(await existemCapturasPendentes()).toBe(true);

    const consultaAnterior = existemCapturasPendentes();
    renovarGeracaoSessao("conta-b");
    await expect(consultaAnterior).rejects.toBeInstanceOf(RespostaSessaoObsoleta);
    expect(await existemCapturasPendentes()).toBe(false);

    definirFabrica(undefined);
    await expect(existemCapturasPendentes()).rejects.toBeInstanceOf(FalhaConsultaPendencias);
    renovarGeracaoSessao();
    await expect(existemCapturasPendentes()).rejects.toBeInstanceOf(FalhaConsultaPendencias);
  });
});

describe("infraestrutura IndexedDB", () => {
  it("rejeita uma escrita cuja requisição teve sucesso antes de a transação abortar", async () => {
    await expect(operarNoBanco("capturas", "readwrite", async (repositorio) => {
      await aguardarRequisicao(repositorio.put({ ...captura, idUsuario: "conta-a" }));
      repositorio.transaction.abort();
    })).rejects.toThrow();
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toBeUndefined();
  });

  it("desfaz uma escrita anterior quando outra requisição falha na mesma transação", async () => {
    await expect(operarNoBanco("capturas", "readwrite", async (repositorio) => {
      const registro = { ...captura, idUsuario: "conta-a" };
      await aguardarRequisicao(repositorio.add(registro));
      await aguardarRequisicao(repositorio.add(registro));
    })).rejects.toMatchObject({ name: "ConstraintError" });
    expect(await listarCapturasLocais("conta-a")).toEqual([]);
  });

  it("migra a versão 1 sem apagar os dados existentes e mantém o índice por conta", async () => {
    const requisicao = indexedDB.open("rememore", 1);
    requisicao.onupgradeneeded = () => {
      requisicao.result.createObjectStore("capturas", { keyPath: ["idUsuario", "data"] }).createIndex("por-conta", "idUsuario");
    };
    const anterior = await aguardarRequisicao(requisicao);
    const registroAnterior = { ...captura, idUsuario: "conta-a" };
    try {
      const transacao = anterior.transaction("capturas", "readwrite");
      const conclusao = new Promise<void>((resolver, rejeitar) => {
        transacao.oncomplete = () => resolver();
        transacao.onabort = () => rejeitar(transacao.error);
      });
      await Promise.all([aguardarRequisicao(transacao.objectStore("capturas").add(registroAnterior)), conclusao]);
    } finally {
      anterior.close();
    }

    expect(await diagnosticarIndexedDB()).toBe("operacional");
    expect(await listarCapturasLocais("conta-a")).toEqual([registroAnterior]);
    const atualizado = await aguardarRequisicao(indexedDB.open("rememore"));
    try {
      expect(atualizado.version).toBe(2);
      expect(Array.from(atualizado.objectStoreNames)).toEqual(["capturas", "diagnostico"]);
    } finally {
      atualizado.close();
    }
  });
});

describe("diagnóstico IndexedDB", () => {
  it("faz verificações consecutivas sem deixar resíduos nem alterar capturas", async () => {
    await salvarCapturaLocal("conta-a", captura);
    const antes = await recuperarCapturaLocal("conta-a", captura.data);
    expect(await Promise.all([diagnosticarIndexedDB(), diagnosticarIndexedDB()])).toEqual(["operacional", "operacional"]);
    expect(await operarNoBanco("diagnostico", "readonly", (repositorio) => aguardarRequisicao(repositorio.count()))).toBe(0);
    expect(await recuperarCapturaLocal("conta-a", captura.data)).toEqual(antes);
  });

  it("distingue falta de suporte de falha operacional", async () => {
    definirFabrica(undefined);
    expect(await diagnosticarIndexedDB()).toBe("naoSuportado");
    definirFabrica(new IDBFactory());
    const banco = await aguardarRequisicao(indexedDB.open("rememore", 3));
    banco.close();
    expect(await diagnosticarIndexedDB()).toBe("falhaOperacional");
  });
});
