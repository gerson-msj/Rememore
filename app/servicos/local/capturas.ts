import { BancoLocal, bancoLocal } from "./banco.ts"
import { INDICE_CAPTURAS_POR_CONTA, STORE_CAPTURAS } from "./esquema.ts"

export interface ComplementoLocal {
    id: string
    conteudo: string
    /** Instante ISO da primeira preservação remota; null significa nunca preservado. */
    primeiraPreservacaoEm: string | null
}

export interface AssociacaoCategoria {
    idCategoria: string | null
    nome: string
}

export interface MemoriaLocal {
    /** Atribuído uma única vez, independentemente do conteúdo e da ordem física. */
    id: string
    conteudo: string
    ordem: number
    primeiraPreservacaoEm: string | null
    /** Do mais antigo ao mais recente; cada complemento conserva sua primeira preservação. */
    complementos: ComplementoLocal[]
    /** Ausência em capturas anteriores à categorização equivale a nenhuma associação. */
    categorias?: AssociacaoCategoria[]
}

export interface CapturaLocal {
    idConta: string
    /** Data civil fornecida pelo consumidor no formato YYYY-MM-DD. */
    dataCaptura: string
    memorias: MemoriaLocal[]
    alterada: boolean
    origemPreservada: boolean
    /** Revisão remota opaca de origem; null somente quando a ausência foi confirmada. */
    revisaoOrigem: string | null
    /** Identifica a materialização para impedir que uma sessão antiga retome outra área de trabalho. */
    idAreaTrabalho: string
    prazoEdicaoDias: number
}

/** Apenas persiste; não decide quando nasce uma pendência nem como editar memórias. */
export class RepositorioCapturasLocais {
    constructor(private readonly banco: BancoLocal = bancoLocal) {}

    async gravar(captura: CapturaLocal): Promise<void> {
        await this.banco.transacao(
            [STORE_CAPTURAS],
            "readwrite",
            "write",
            (transacao) => transacao.objectStore(STORE_CAPTURAS).put(captura)
        )
    }

    obter(idConta: string, dataCaptura: string): Promise<CapturaLocal | undefined> {
        return this.banco.transacao(
            [STORE_CAPTURAS],
            "readonly",
            "read",
            (transacao) => transacao.objectStore(STORE_CAPTURAS).get([idConta, dataCaptura]) as IDBRequest<CapturaLocal | undefined>
        )
    }

    async remover(idConta: string, dataCaptura: string): Promise<void> {
        await this.banco.transacao(
            [STORE_CAPTURAS],
            "readwrite",
            "remove",
            (transacao) => transacao.objectStore(STORE_CAPTURAS).delete([idConta, dataCaptura])
        )
    }

    listarPorConta(idConta: string): Promise<CapturaLocal[]> {
        return this.banco.transacao(
            [STORE_CAPTURAS],
            "readonly",
            "query",
            (transacao) =>
                transacao.objectStore(STORE_CAPTURAS).index(INDICE_CAPTURAS_POR_CONTA).getAll(idConta) as IDBRequest<CapturaLocal[]>
        )
    }

    async listarPendentes(idConta: string): Promise<CapturaLocal[]> {
        return (await this.listarPorConta(idConta)).filter((captura) => captura.alterada)
            .sort((a, b) => a.dataCaptura.localeCompare(b.dataCaptura))
    }

    async marcarAlterada(idConta: string, dataCaptura: string): Promise<void> {
        await this.banco.transacao([STORE_CAPTURAS], "readwrite", "write", (transacao) => {
            const store = transacao.objectStore(STORE_CAPTURAS)
            const requisicao = store.get([idConta, dataCaptura]) as IDBRequest<CapturaLocal | undefined>
            requisicao.onsuccess = () => {
                if (!requisicao.result) transacao.abort()
                else store.put({ ...requisicao.result, alterada: true })
            }
            return requisicao
        })
    }
}

export const capturasLocais = new RepositorioCapturasLocais()
