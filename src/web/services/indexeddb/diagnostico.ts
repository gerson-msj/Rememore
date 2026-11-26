import { aguardarRequisicao, operarNoBanco } from "./banco";

export type ResultadoDiagnosticoIndexedDB = "operacional" | "naoSuportado" | "falhaOperacional";

export async function diagnosticarIndexedDB(): Promise<ResultadoDiagnosticoIndexedDB> {
  try {
    const fabrica = globalThis.indexedDB;
    if (!fabrica) return "naoSuportado";

    await operarNoBanco("diagnostico", "readwrite", async (repositorio) => {
      const chave = "verificacao";
      const valor = "rememore";
      await aguardarRequisicao(repositorio.add(valor, chave));
      const lido: unknown = await aguardarRequisicao(repositorio.get(chave));
      if (lido !== valor) throw new Error("A leitura do diagnóstico divergiu da escrita.");
      await aguardarRequisicao(repositorio.delete(chave));
    }, fabrica);
    return "operacional";
  } catch {
    return "falhaOperacional";
  }
}
