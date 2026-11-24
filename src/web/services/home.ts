import type { HomeResponse } from "@shared/home";
import { FalhaHttp, requisitar } from "@web/services/http";

export async function consultarHome(signal?: AbortSignal): Promise<HomeResponse> {
  const { status, dados } = await requisitar<HomeResponse>("/api/home", { signal }, [], { protegida: true });
  if (status !== 200 || !dados || (dados.perfil !== "usuario" && dados.perfil !== "admin") ||
      typeof dados.encontrarMemorias !== "boolean" || typeof dados.reverUmDia !== "boolean" ||
      typeof dados.rememorar !== "boolean") {
    throw new FalhaHttp("http", status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return dados;
}
