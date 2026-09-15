import { type CapturaLocal, capturasLocais, type RepositorioCapturasLocais } from "./local/capturas.ts"
import type { ServicoCapturasPreservadas } from "./captura/contratos.ts"
import { capturasPreservadasSimuladas } from "./captura/simulado.ts"

export const capturasPreservadas: ServicoCapturasPreservadas = capturasPreservadasSimuladas

export function validarPrazoEdicao(dias: number): number {
    if (!Number.isFinite(dias) || dias <= 0) throw new Error("Prazo de edição da captura inválido")
    return dias
}

function revisao(valor: string): string {
    if (typeof valor !== "string" || !valor.trim()) throw new Error("Revisão da captura inválida")
    return valor
}

/** O chamador detém o bloqueio da captura, com data validada e diagnóstico local operacional. */
export async function prepararCaptura(
    idConta: string,
    dataCaptura: string,
    repositorio: RepositorioCapturasLocais = capturasLocais,
    remoto: ServicoCapturasPreservadas = capturasPreservadas,
    idAreaTrabalhoRetomada?: string
): Promise<CapturaLocal> {
    const existente = await repositorio.obter(idConta, dataCaptura)
    if (existente && (existente.alterada || existente.idAreaTrabalho === idAreaTrabalhoRetomada)) {
        validarPrazoEdicao(existente.prazoEdicaoDias)
        return existente
    }
    const metadados = await remoto.inspect(idConta, dataCaptura)
    if (metadados.status !== "found" && metadados.status !== "absent") throw new Error("Metadados da captura indisponíveis")
    const prazoEdicaoDias = validarPrazoEdicao(metadados.editWindowDays)
    const revisaoOrigem = metadados.status === "found" ? revisao(metadados.revision) : null
    if (existente && existente.origemPreservada === (metadados.status === "found") && existente.revisaoOrigem === revisaoOrigem) {
        // Na entrada normal, atualiza somente o prazo; reutiliza as memórias sem transferência integral.
        if (existente.prazoEdicaoDias === prazoEdicaoDias) return existente
        const atualizado = { ...existente, prazoEdicaoDias }
        await repositorio.gravar(atualizado)
        return atualizado
    }
    const captura: CapturaLocal = {
        idConta,
        dataCaptura,
        memorias: [],
        origemPreservada: metadados.status === "found",
        revisaoOrigem,
        alterada: false,
        idAreaTrabalho: crypto.randomUUID(),
        prazoEdicaoDias
    }
    if (metadados.status === "found") {
        const resultado = await remoto.read(idConta, dataCaptura)
        // Se a existência mudar durante a transferência, preserva a área de trabalho até uma nova abertura.
        if (resultado.status !== "found") throw new Error("Captura preservada indisponível")
        captura.memorias = resultado.memories.map((memoria) => ({
            id: memoria.id,
            conteudo: memoria.content,
            ordem: memoria.order,
            primeiraPreservacaoEm: memoria.firstPreservedAt,
            complementos: memoria.complements.map((complemento) => ({
                id: complemento.id,
                conteudo: complemento.content,
                primeiraPreservacaoEm: complemento.firstPreservedAt
            }))
        }))
        captura.revisaoOrigem = revisao(resultado.revision)
        captura.prazoEdicaoDias = validarPrazoEdicao(resultado.editWindowDays)
    }
    await repositorio.gravar(captura)
    return captura
}
