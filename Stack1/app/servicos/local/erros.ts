export type OperacaoLocal = "open" | "upgrade" | "diagnose" | "read" | "write" | "remove" | "query" | "transaction"
export type CodigoFalhaLocal = "unsupported" | "blocked" | "failed"

/** O consumidor define mensagens, navegação e recuperação desta falha técnica. */
export class ErroArmazenamentoLocal extends Error {
    constructor(
        public readonly operation: OperacaoLocal,
        public readonly code: CodigoFalhaLocal,
        causa?: unknown
    ) {
        super(`Armazenamento local: ${operation} ${code}`, { cause: causa })
        this.name = "LocalStorageError"
    }
}

export function falhaLocal(operacao: OperacaoLocal, causa: unknown): ErroArmazenamentoLocal {
    return causa instanceof ErroArmazenamentoLocal ? causa : new ErroArmazenamentoLocal(operacao, "failed", causa)
}
