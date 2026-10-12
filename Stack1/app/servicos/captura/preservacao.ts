import type { CapturaLocal } from "../local/capturas.ts"
import type { ResultadoPreservacao } from "./contratos.ts"

/** Uma captura sem origem remota precisa de ao menos uma memória para preservar. */
export function podePreservarCaptura(captura: Pick<CapturaLocal, "memorias" | "origemPreservada">): boolean {
    return captura.memorias.length > 0 || captura.origemPreservada
}

/** Compara a revisão atual com o snapshot do qual o workspace foi aberto. */
export function detectarConflitoPreservacao(
    captura: Pick<CapturaLocal, "origemPreservada" | "revisaoOrigem">,
    atual: { status: "found"; revision: string } | { status: "absent" }
): boolean {
    if (!captura.origemPreservada) return atual.status === "found"
    return atual.status !== "found" || atual.revision !== captura.revisaoOrigem
}

/** Só tenta remover o workspace após resposta remota inequívoca; falha local não repete a preservação. */
export async function finalizarPreservacao(
    preservar: () => Promise<ResultadoPreservacao>,
    removerWorkspace: () => Promise<void>
): Promise<"success" | "local-failure"> {
    const resposta = await preservar()
    if (resposta.status !== "success" || !resposta.revision.trim()) throw new Error("Confirmação remota inválida")
    try {
        await removerWorkspace()
        return "success"
    } catch {
        return "local-failure"
    }
}
