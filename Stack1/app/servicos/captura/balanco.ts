import type { CapturaLocal } from "../local/capturas.ts"
import { permiteEdicao } from "./edicao.ts"

export interface RascunhoBalanco {
    idAreaTrabalho: string
    idMemoria: string
    original: string
    texto: string
}

/** Guarda somente a edição efêmera; o balanço confirmado permanece no workspace IndexedDB. */
export class ProtecaoRascunhoBalanco {
    private readonly chave: string

    constructor(idConta: string, dataCaptura: string, private readonly armazenamento: Storage) {
        this.chave = `rememore:rascunho-balanco:v1:${JSON.stringify([idConta, dataCaptura])}`
    }

    gravar(rascunho: RascunhoBalanco): void {
        this.armazenamento.setItem(this.chave, JSON.stringify(rascunho))
    }

    limpar(): void {
        this.armazenamento.removeItem(this.chave)
    }

    retomar(captura: CapturaLocal, mesmaSessao: boolean): RascunhoBalanco | null {
        const bruto = this.armazenamento.getItem(this.chave)
        if (bruto && mesmaSessao) {
            try {
                const rascunho = JSON.parse(bruto) as RascunhoBalanco
                const memoria = captura.memorias.find((item) => item.id === rascunho.idMemoria)
                const original = memoria?.balancoSentimental ?? ""
                if (
                    rascunho.idAreaTrabalho === captura.idAreaTrabalho && Boolean(memoria) &&
                    rascunho.original === original && typeof rascunho.texto === "string"
                ) return rascunho
            } catch {
                // Um rascunho inválido não pode impedir a abertura do workspace confirmado.
            }
        }
        this.limpar()
        return null
    }
}

async function salvar(
    captura: CapturaLocal,
    idMemoria: string,
    texto: string | null,
    gravar: (captura: CapturaLocal) => Promise<void>,
    agora: number
): Promise<CapturaLocal> {
    const memoria = captura.memorias.find((item) => item.id === idMemoria)
    if (!memoria || !permiteEdicao(memoria.primeiraPreservacaoEm, captura.prazoEdicaoDias, agora)) {
        throw new Error("Balanço sentimental indisponível para esta memória")
    }
    if (texto !== null && (typeof texto !== "string" || !texto.trim())) throw new Error("Balanço sentimental inválido")
    if ((memoria.balancoSentimental ?? null) === texto) return captura

    const memorias = captura.memorias.map((item) => {
        if (item.id !== idMemoria) return item
        if (texto !== null) return { ...item, balancoSentimental: texto }
        const { balancoSentimental: _balancoSentimental, ...semBalanco } = item
        return semBalanco
    })
    const proxima = { ...captura, memorias, alterada: true, alteracoesOutras: true }
    await gravar(proxima)
    return proxima
}

export function salvarBalancoSentimental(
    captura: CapturaLocal,
    idMemoria: string,
    texto: string,
    gravar: (captura: CapturaLocal) => Promise<void>,
    agora = Date.now()
): Promise<CapturaLocal> {
    return salvar(captura, idMemoria, texto, gravar, agora)
}

export function excluirBalancoSentimental(
    captura: CapturaLocal,
    idMemoria: string,
    gravar: (captura: CapturaLocal) => Promise<void>,
    agora = Date.now()
): Promise<CapturaLocal> {
    return salvar(captura, idMemoria, null, gravar, agora)
}
