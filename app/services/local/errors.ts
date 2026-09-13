export type LocalOperation = "open" | "upgrade" | "diagnose" | "read" | "write" | "remove" | "query" | "transaction"
export type LocalFailureCode = "unsupported" | "blocked" | "failed"

/** Technical failure; consumers own messages, navigation and recovery policy. */
export class LocalStorageError extends Error {
    constructor(
        public readonly operation: LocalOperation,
        public readonly code: LocalFailureCode,
        cause?: unknown
    ) {
        super(`Local storage: ${operation} ${code}`, { cause })
        this.name = "LocalStorageError"
    }
}

export function localFailure(operation: LocalOperation, cause: unknown): LocalStorageError {
    return cause instanceof LocalStorageError ? cause : new LocalStorageError(operation, "failed", cause)
}
