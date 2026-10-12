import { ErroArmazenamentoLocal, falhaLocal, type OperacaoLocal } from "./erros.ts"
import { type MigracaoLocal, migracoesLocais, STORE_DIAGNOSTICO } from "./esquema.ts"

export type DisponibilidadeLocal =
    | { status: "operational" }
    | { status: "unsupported" | "unavailable"; error: ErroArmazenamentoLocal }

interface OpcoesBancoLocal {
    nome?: string
    migracoes?: readonly MigracaoLocal[]
    fabrica?: () => IDBFactory | undefined
}

/** Acesso ao armazenamento adiado para permitir importação segura durante a renderização no servidor. */
export class BancoLocal {
    private readonly nome: string
    private readonly migracoes: readonly MigracaoLocal[]
    private readonly fabrica: () => IDBFactory | undefined

    constructor(opcoes: OpcoesBancoLocal = {}) {
        this.nome = opcoes.nome ?? "rememore-local"
        this.migracoes = opcoes.migracoes ?? migracoesLocais
        this.fabrica = opcoes.fabrica ?? (() => globalThis.indexedDB)
        if (!this.migracoes.length || this.migracoes.some((migracao, indice) => migracao.versao !== indice + 1)) {
            throw new ErroArmazenamentoLocal("upgrade", "failed", new Error("As migrações devem ser consecutivas a partir da versão 1"))
        }
    }

    private abrir(): Promise<IDBDatabase> {
        return new Promise((resolver, rejeitar) => {
            let abandonado = false
            let falhaMigracao: ErroArmazenamentoLocal | undefined
            try {
                const fabrica = this.fabrica()
                if (!fabrica) throw new ErroArmazenamentoLocal("open", "unsupported")
                const requisicao = fabrica.open(this.nome, this.migracoes.length)
                requisicao.onblocked = () => {
                    abandonado = true
                    rejeitar(new ErroArmazenamentoLocal("open", "blocked"))
                }
                requisicao.onupgradeneeded = (evento) => {
                    const transacao = requisicao.transaction!
                    if (abandonado) {
                        transacao.abort()
                        return
                    }
                    transacao.addEventListener("error", (evento) => {
                        falhaMigracao = falhaLocal("upgrade", (evento.target as IDBRequest).error)
                    })
                    transacao.addEventListener("abort", () => {
                        falhaMigracao ??= falhaLocal("upgrade", transacao.error)
                    })
                    try {
                        for (const migracao of this.migracoes) {
                            if (migracao.versao > evento.oldVersion) migracao.migrar(requisicao.result, transacao)
                        }
                    } catch (causa) {
                        falhaMigracao = falhaLocal("upgrade", causa)
                        transacao.abort()
                    }
                }
                requisicao.onerror = () => rejeitar(falhaMigracao ?? falhaLocal("open", requisicao.error))
                requisicao.onsuccess = () => {
                    const banco = requisicao.result
                    // Libera a conexão quando outra aba pede atualização, permitindo concluir transações em curso.
                    banco.onversionchange = () => banco.close()
                    if (abandonado) banco.close()
                    else resolver(banco)
                }
            } catch (causa) {
                rejeitar(falhaLocal("open", causa))
            }
        })
    }

    /**
     * Enfileira requisições sincronamente e retorna aquela cujo resultado interessa ao chamador.
     * Os stores compartilham uma transação atômica; o retorno não pode aguardar trabalho externo.
     * O resultado só fica disponível ao chamador depois de transacao.oncomplete.
     */
    async transacao<T>(
        stores: string[],
        modo: IDBTransactionMode,
        operacao: OperacaoLocal,
        enfileirar: (transacao: IDBTransaction) => IDBRequest<T>
    ): Promise<T> {
        const banco = await this.abrir()
        try {
            return await new Promise<T>((resolver, rejeitar) => {
                let transacao: IDBTransaction
                try {
                    transacao = banco.transaction(stores, modo)
                } catch (causa) {
                    rejeitar(falhaLocal(operacao, causa))
                    return
                }
                let requisicao: IDBRequest<T>
                let falha: ErroArmazenamentoLocal | undefined
                transacao.oncomplete = () => {
                    try {
                        if (falha) rejeitar(falha)
                        else resolver(requisicao.result)
                    } catch (causa) {
                        rejeitar(falhaLocal(operacao, causa))
                    }
                }
                transacao.onabort = () => rejeitar(falha ?? falhaLocal(operacao, transacao.error))
                transacao.onerror = (evento) => {
                    falha ??= falhaLocal(operacao, (evento.target as IDBRequest).error ?? transacao.error)
                }
                try {
                    requisicao = enfileirar(transacao)
                    if (!requisicao || !("readyState" in requisicao)) {
                        throw new Error("O enfileiramento deve retornar uma requisição IndexedDB sincronamente")
                    }
                } catch (causa) {
                    falha = falhaLocal(operacao, causa)
                    transacao.abort()
                }
            })
        } finally {
            // Nenhuma conexão em cache sobrevive à operação nem oculta a exclusão do banco.
            banco.close()
        }
    }

    async diagnosticar(): Promise<DisponibilidadeLocal> {
        try {
            const token = crypto.randomUUID()
            const valor = await this.transacao([STORE_DIAGNOSTICO], "readwrite", "diagnose", (transacao) => {
                const store = transacao.objectStore(STORE_DIAGNOSTICO)
                store.put(token, "sonda")
                const leitura = store.get("sonda") as IDBRequest<string | undefined>
                store.delete("sonda")
                return leitura
            })
            if (valor !== token) {
                throw new ErroArmazenamentoLocal("diagnose", "failed", new Error("A leitura do diagnóstico diverge do valor gravado"))
            }
            return { status: "operational" }
        } catch (causa) {
            const erro = falhaLocal("diagnose", causa)
            return { status: erro.code === "unsupported" ? "unsupported" : "unavailable", error: erro }
        }
    }
}

export const bancoLocal = new BancoLocal()
