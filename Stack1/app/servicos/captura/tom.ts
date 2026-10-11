import type { CapturaLocal } from "../local/capturas.ts"
import { permiteEdicao } from "./edicao.ts"

export async function salvarTom(
    captura: CapturaLocal,
    idMemoria: string,
    tom: number | null,
    gravar: (captura: CapturaLocal) => Promise<void>,
    agora = Date.now()
): Promise<CapturaLocal> {
    const memoria = captura.memorias.find((item) => item.id === idMemoria)
    if (!memoria || !permiteEdicao(memoria.primeiraPreservacaoEm, captura.prazoEdicaoDias, agora)) {
        throw new Error("Tom indisponível para esta memória")
    }
    if (tom !== null && (!Number.isInteger(tom) || tom < -100 || tom > 100)) {
        throw new Error("Tom inválido")
    }
    if ((memoria.tom ?? null) === tom) return captura

    const memorias = captura.memorias.map((item) => {
        if (item.id !== idMemoria) return item
        if (tom !== null) return { ...item, tom }
        const { tom: _tom, ...semTom } = item
        return semTom
    })
    const proxima = { ...captura, memorias, alterada: true, alteracoesOutras: true }
    await gravar(proxima)
    return proxima
}
