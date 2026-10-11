import { memoriasRememorarLocal } from "../local/memoriasRememorar.ts"
import { chaveJornadaRememorar } from "../../utilitarios/jornadaRememorar.ts"

const prefixoJornada = "rememore:rememorar:jornada:v1:"

export async function encerrarJornadaRememorar(idConta: string, armazenamento?: Storage): Promise<void> {
    const sessao = armazenamento ?? (typeof sessionStorage === "undefined" ? undefined : sessionStorage)
    try {
        await memoriasRememorarLocal.remover(idConta)
    } finally {
        sessao?.removeItem(chaveJornadaRememorar(idConta))
    }
}

export async function limparJornadasRememorarSemSessao(armazenamento?: Storage): Promise<void> {
    const sessao = armazenamento ?? (typeof sessionStorage === "undefined" ? undefined : sessionStorage)
    if (!sessao) return
    for (let indice = 0; indice < sessao.length;) {
        const chave = sessao.key(indice)
        if (!chave?.startsWith(prefixoJornada)) {
            indice++
            continue
        }
        let idConta: unknown
        try {
            idConta = JSON.parse(sessao.getItem(chave) ?? "null")?.conta
        } catch {
            idConta = null
        }
        try {
            if (typeof idConta === "string" && idConta) await memoriasRememorarLocal.remover(idConta)
        } finally {
            sessao.removeItem(chave)
        }
    }
}
