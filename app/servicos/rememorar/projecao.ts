import { projecaoRememorarLocal, type RepositorioProjecaoRememorar } from "../local/projecaoRememorar.ts"
import type { RespostaProjecaoRemota, ServicoProjecaoRemota } from "./contratos.ts"

function validarResposta(resposta: RespostaProjecaoRemota) {
    if (!resposta.revisao.trim()) throw new Error("Revisão remota de Rememorar inválida")
    if (resposta.tipo !== "atualizada") {
        for (const bloco of resposta.blocos) {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(bloco.data) || !bloco.categorias.every((categoria) => categoria.idCategoria)) {
                throw new Error("Bloco remoto da projeção de Rememorar inválido")
            }
            for (const categoria of bloco.categorias) {
                if (categoria.tons.some((tom) => tom !== null && (!Number.isSafeInteger(tom) || tom < -100 || tom > 100))) {
                    throw new Error("Tom inválido na projeção de Rememorar")
                }
            }
        }
    }
}

export async function sincronizarProjecaoRememorar(
    idConta: string,
    repositorio: Pick<RepositorioProjecaoRememorar, "obterMetadados" | "reconciliar"> = projecaoRememorarLocal,
    remoto: ServicoProjecaoRemota
) {
    const metadados = await repositorio.obterMetadados(idConta)
    const resposta = await remoto.consultar(idConta, metadados?.revisao ?? null)
    validarResposta(resposta)
    if (resposta.tipo === "atualizada") return metadados!
    if (resposta.tipo === "completa") {
        await repositorio.reconciliar(idConta, resposta.revisao, resposta.blocos, [], true)
        return { idConta, revisao: resposta.revisao, inicializada: true as const }
    }
    await repositorio.reconciliar(idConta, resposta.revisao, resposta.blocos, resposta.removidas)
    return { idConta, revisao: resposta.revisao, inicializada: true as const }
}

export async function reconstruirProjecaoRememorar(
    idConta: string,
    repositorio: Pick<RepositorioProjecaoRememorar, "reconciliar"> = projecaoRememorarLocal,
    remoto: ServicoProjecaoRemota
) {
    const resposta = await remoto.reconstruir(idConta)
    if (!resposta.revisao.trim()) throw new Error("Revisão de reconstrução inválida")
    await repositorio.reconciliar(idConta, resposta.revisao, resposta.blocos, [], true)
    return { idConta, revisao: resposta.revisao, inicializada: true as const }
}
