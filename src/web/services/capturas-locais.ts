import { aguardarRequisicao, operarNoBanco } from "@web/services/indexeddb/banco";

export type MemoriaLocal = {
  idLocal: string;
  texto: string;
  ordem: number;
};

export type CapturaLocal = {
  idUsuario: string;
  data: string;
  alterada: boolean;
  memorias: MemoriaLocal[];
  origemRemota: "desconhecida" | "ausente" | "presente";
  revisaoOrigem?: string;
};

function validarIdUsuario(idUsuario: string) {
  if (!idUsuario.trim()) throw new Error("Uma identidade de conta é necessária para acessar capturas locais.");
}

function chaveCaptura(idUsuario: string, data: string): [string, string] {
  validarIdUsuario(idUsuario);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    throw new Error("A data da captura deve estar no formato YYYY-MM-DD.");
  }
  return [idUsuario, data];
}

export async function salvarCapturaLocal(idUsuario: string, captura: Omit<CapturaLocal, "idUsuario">): Promise<void> {
  chaveCaptura(idUsuario, captura.data);
  const registro: CapturaLocal = {
    ...captura,
    idUsuario,
    memorias: [...captura.memorias].sort((anterior, seguinte) => anterior.ordem - seguinte.ordem),
  };
  await operarNoBanco("capturas", "readwrite", (repositorio) => aguardarRequisicao(repositorio.put(registro)));
}

export async function recuperarCapturaLocal(idUsuario: string, data: string): Promise<CapturaLocal | undefined> {
  const chave = chaveCaptura(idUsuario, data);
  return operarNoBanco("capturas", "readonly", (repositorio) => aguardarRequisicao<CapturaLocal | undefined>(repositorio.get(chave)));
}

export async function removerCapturaLocal(idUsuario: string, data: string): Promise<void> {
  const chave = chaveCaptura(idUsuario, data);
  await operarNoBanco("capturas", "readwrite", (repositorio) => aguardarRequisicao(repositorio.delete(chave)));
}

export async function removerCapturaLocalPendente(
  idUsuario: string,
  data: string,
  origemConfirmada: CapturaLocal["origemRemota"],
): Promise<void> {
  const chave = chaveCaptura(idUsuario, data);
  await operarNoBanco("capturas", "readwrite", async (repositorio) => {
    const captura = await aguardarRequisicao<CapturaLocal | undefined>(repositorio.get(chave));
    if (!captura?.alterada || captura.origemRemota !== origemConfirmada) {
      throw new Error("A captura pendente mudou desde a confirmação.");
    }
    await aguardarRequisicao(repositorio.delete(chave));
  });
}

export async function listarCapturasLocais(idUsuario: string): Promise<CapturaLocal[]> {
  validarIdUsuario(idUsuario);
  return operarNoBanco("capturas", "readonly", (repositorio) => aguardarRequisicao<CapturaLocal[]>(repositorio.index("por-conta").getAll(idUsuario)));
}

export async function listarCapturasLocaisPendentes(idUsuario: string): Promise<CapturaLocal[]> {
  return (await listarCapturasLocais(idUsuario)).filter((captura) => captura.alterada);
}

export async function existemCapturasLocaisPendentes(idUsuario: string): Promise<boolean> {
  return (await listarCapturasLocaisPendentes(idUsuario)).length > 0;
}
