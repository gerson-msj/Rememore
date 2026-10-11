import { BancoLocal, bancoLocal } from "./banco.ts"
import { STORE_METADADOS_PROJECAO_REMEMORAR, STORE_PROJECAO_REMEMORAR } from "./esquema.ts"

export interface BlocoProjecaoRememorar {
    idConta: string
    data: string
    categorias: { idCategoria: string; tons: (number | null)[] }[]
}

export interface MetadadosProjecaoRememorar {
    idConta: string
    revisao: string
    inicializada: true
}

export class RepositorioProjecaoRememorar {
    constructor(private readonly banco: BancoLocal = bancoLocal) {}

    obterMetadados(idConta: string): Promise<MetadadosProjecaoRememorar | undefined> {
        return this.banco.transacao(
            [STORE_METADADOS_PROJECAO_REMEMORAR],
            "readonly",
            "read",
            (transacao) => transacao.objectStore(STORE_METADADOS_PROJECAO_REMEMORAR).get(idConta)
        )
    }

    listar(idConta: string): Promise<BlocoProjecaoRememorar[]> {
        return this.banco.transacao(
            [STORE_PROJECAO_REMEMORAR],
            "readonly",
            "query",
            (transacao) => transacao.objectStore(STORE_PROJECAO_REMEMORAR).index("porConta").getAll(idConta)
        )
    }

    obter(idConta: string, data: string): Promise<BlocoProjecaoRememorar | undefined> {
        return this.banco.transacao(
            [STORE_PROJECAO_REMEMORAR],
            "readonly",
            "read",
            (transacao) => transacao.objectStore(STORE_PROJECAO_REMEMORAR).get([idConta, data])
        )
    }

    async reconciliar(
        idConta: string,
        revisao: string,
        blocos: BlocoProjecaoRememorar[],
        removidas: string[],
        reconstruir = false
    ): Promise<void> {
        await this.banco.transacao(
            [STORE_PROJECAO_REMEMORAR, STORE_METADADOS_PROJECAO_REMEMORAR],
            "readwrite",
            "write",
            (transacao) => {
                const store = transacao.objectStore(STORE_PROJECAO_REMEMORAR)
                const metadados = transacao.objectStore(STORE_METADADOS_PROJECAO_REMEMORAR)
                if (reconstruir) {
                    const chaves = store.index("porConta").getAllKeys(idConta)
                    chaves.onsuccess = () => {
                        for (const chave of chaves.result) store.delete(chave)
                        for (const bloco of blocos) store.put({ ...bloco, idConta })
                    }
                    return metadados.put({ idConta, revisao, inicializada: true })
                } else {
                    for (const data of removidas) store.delete([idConta, data])
                }
                for (const bloco of blocos) store.put({ ...bloco, idConta })
                return metadados.put({ idConta, revisao, inicializada: true })
            }
        )
    }
}

export const projecaoRememorarLocal = new RepositorioProjecaoRememorar()
