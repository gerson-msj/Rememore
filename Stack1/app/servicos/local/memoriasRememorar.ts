import { BancoLocal, bancoLocal } from "./banco.ts"
import { STORE_MEMORIAS_REMEMORAR } from "./esquema.ts"
import type { MemoriaConsultaRememorar } from "../rememorar/consultaMemorias.ts"

export interface PontoLeituraMemoriasRememorar {
    idMemoria: string | null
    deslocamentoPx: number
    rolagemY: number
}

export interface ConsultaMemoriasEmCache {
    idConta: string
    idJornada: string
    idConsulta: string
    idCategoria: string
    primeiroDia: string
    ultimoDia: string
    ordenacao: "data-ordem-id"
    memorias: MemoriaConsultaRememorar[]
    lotesCompletos: number
    registrosCobertos: number
    proximoOffset: number | null
    total: number | null
    fim: boolean
    pontoLeitura: PontoLeituraMemoriasRememorar
}

export class RepositorioMemoriasRememorar {
    constructor(private readonly banco: BancoLocal = bancoLocal) {}

    obter(idConta: string): Promise<ConsultaMemoriasEmCache | undefined> {
        return this.banco.transacao(
            [STORE_MEMORIAS_REMEMORAR],
            "readonly",
            "read",
            (transacao) => transacao.objectStore(STORE_MEMORIAS_REMEMORAR).get(idConta)
        )
    }

    async iniciar(cache: ConsultaMemoriasEmCache): Promise<void> {
        await this.banco.transacao(
            [STORE_MEMORIAS_REMEMORAR],
            "readwrite",
            "write",
            (transacao) => transacao.objectStore(STORE_MEMORIAS_REMEMORAR).put(cache)
        )
    }

    async anexarLote(
        idConta: string,
        idConsulta: string,
        offsetSolicitado: number,
        lote: {
            memorias: MemoriaConsultaRememorar[]
            proximoOffset: number | null
            total: number
        }
    ): Promise<boolean> {
        let anexado = false
        await this.banco.transacao(
            [STORE_MEMORIAS_REMEMORAR],
            "readwrite",
            "write",
            (transacao) => {
                const store = transacao.objectStore(STORE_MEMORIAS_REMEMORAR)
                const leitura = store.get(idConta) as IDBRequest<ConsultaMemoriasEmCache | undefined>
                leitura.onsuccess = () => {
                    const atual = leitura.result
                    if (!atual || atual.idConsulta !== idConsulta || atual.proximoOffset !== offsetSolicitado || atual.fim) return
                    anexado = true
                    store.put(
                        {
                            ...atual,
                            memorias: [...atual.memorias, ...lote.memorias],
                            lotesCompletos: atual.lotesCompletos + 1,
                            registrosCobertos: atual.registrosCobertos + lote.memorias.length,
                            proximoOffset: lote.proximoOffset,
                            total: lote.total,
                            fim: lote.proximoOffset === null
                        } satisfies ConsultaMemoriasEmCache
                    )
                }
                return leitura
            }
        )
        return anexado
    }

    async salvarPonto(
        idConta: string,
        idConsulta: string,
        pontoLeitura: PontoLeituraMemoriasRememorar
    ): Promise<void> {
        await this.banco.transacao(
            [STORE_MEMORIAS_REMEMORAR],
            "readwrite",
            "write",
            (transacao) => {
                const store = transacao.objectStore(STORE_MEMORIAS_REMEMORAR)
                const leitura = store.get(idConta) as IDBRequest<ConsultaMemoriasEmCache | undefined>
                leitura.onsuccess = () => {
                    if (leitura.result?.idConsulta === idConsulta) {
                        store.put({ ...leitura.result, pontoLeitura } satisfies ConsultaMemoriasEmCache)
                    }
                }
                return leitura
            }
        )
    }

    async remover(idConta: string): Promise<void> {
        await this.banco.transacao(
            [STORE_MEMORIAS_REMEMORAR],
            "readwrite",
            "remove",
            (transacao) => transacao.objectStore(STORE_MEMORIAS_REMEMORAR).delete(idConta)
        )
    }
}

export const memoriasRememorarLocal = new RepositorioMemoriasRememorar()
