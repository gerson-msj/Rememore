export const STORE_CAPTURAS = "capturas"
export const INDICE_CAPTURAS_POR_CONTA = "porConta"
export const STORE_DIAGNOSTICO = "_diagnostico"
export const STORE_CATALOGOS_CATEGORIAS = "catalogosCategorias"

export interface MigracaoLocal {
    versao: number
    // Enfileira requisições IndexedDB sincronamente; a migração não aguarda trabalho externo.
    migrar(banco: IDBDatabase, transacao: IDBTransaction): void
}

export const migracoesLocais: readonly MigracaoLocal[] = [
    {
        versao: 1,
        migrar(banco) {
            banco.createObjectStore("_health")
            const capturas = banco.createObjectStore("captures", { keyPath: ["accountId", "date"] })
            capturas.createIndex("byAccount", "accountId")
        }
    },
    {
        versao: 2,
        migrar(_banco, transacao) {
            // Registros experimentais anteriores à V1 não têm estado de trabalho nem metadados de origem.
            transacao.objectStore("captures").clear()
        }
    },
    {
        versao: 3,
        migrar(_banco, transacao) {
            // Operador autorizou substituir as capturas experimentais anteriores à 07 em 14/09/2026.
            transacao.objectStore("captures").clear()
        }
    },
    {
        versao: 4,
        migrar(banco) {
            // Nacionalização aprovada em 15/09/2026, com dispensa dos dados experimentais anteriores.
            banco.deleteObjectStore("captures")
            banco.deleteObjectStore("_health")
            banco.createObjectStore(STORE_DIAGNOSTICO)
            const capturas = banco.createObjectStore(STORE_CAPTURAS, { keyPath: ["idConta", "dataCaptura"] })
            capturas.createIndex(INDICE_CAPTURAS_POR_CONTA, "idConta")
        }
    },
    {
        versao: 5,
        migrar(banco) {
            // O catálogo é independente da composição; as capturas existentes permanecem intactas.
            banco.createObjectStore(STORE_CATALOGOS_CATEGORIAS, { keyPath: "idConta" })
        }
    },
    {
        versao: 6,
        migrar(_banco, transacao) {
            // Spec 10: descarte dos workspaces experimentais autorizado pelo operador em 23/09/2026.
            transacao.objectStore(STORE_CAPTURAS).clear()
        }
    }
]
