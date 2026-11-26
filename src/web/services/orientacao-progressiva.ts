import { catalogoOrientacoes, resolverOrientacao, type ContextoOrientacao, type Orientacao } from "@web/services/catalogo-orientacoes";
import { FalhaHttp, requisitar } from "@web/services/http";

export class FalhaOrientacao extends Error {
  constructor(public readonly tipo: "contextoDesconhecido" | "nivelInvalido", mensagem: string) {
    super(mensagem);
    this.name = "FalhaOrientacao";
  }
}

export async function consultarOrientacao(contexto: ContextoOrientacao, signal?: AbortSignal): Promise<Orientacao | null> {
  if (!Object.hasOwn(catalogoOrientacoes, contexto)) {
    throw new FalhaOrientacao("contextoDesconhecido", "Contexto de orientação desconhecido.");
  }

  const { status, dados } = await requisitar<{ nivel?: unknown }>("/api/orientacao-progressiva", { signal }, [], { protegida: true });
  if (status !== 200) {
    throw new FalhaHttp("http", status, "Não foi possível concluir a operação. Tente novamente.");
  }

  const nivel = dados?.nivel;
  if (nivel !== "iniciante" && nivel !== "intermediario" && nivel !== "avancado") {
    throw new FalhaOrientacao("nivelInvalido", "Nível de orientação inválido.");
  }

  return resolverOrientacao(catalogoOrientacoes[contexto], nivel);
}
