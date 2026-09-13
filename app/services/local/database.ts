import { localFailure, type LocalOperation, LocalStorageError } from "./errors.ts"
import { HEALTH_STORE, type LocalMigration, localMigrations } from "./schema.ts"

export type LocalAvailability =
    | { status: "operational" }
    | { status: "unsupported" | "unavailable"; error: LocalStorageError }

interface LocalDatabaseOptions {
    name?: string
    migrations?: readonly LocalMigration[]
    factory?: () => IDBFactory | undefined
}

/** Browser-only persistence, lazy enough to import safely during SSR. */
export class LocalDatabase {
    private readonly name: string
    private readonly migrations: readonly LocalMigration[]
    private readonly factory: () => IDBFactory | undefined

    constructor(options: LocalDatabaseOptions = {}) {
        this.name = options.name ?? "rememore-local"
        this.migrations = options.migrations ?? localMigrations
        this.factory = options.factory ?? (() => globalThis.indexedDB)
        if (!this.migrations.length || this.migrations.some((migration, index) => migration.version !== index + 1)) {
            throw new LocalStorageError("upgrade", "failed", new Error("Migrations must be consecutive, starting at version 1"))
        }
    }

    private open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            let abandoned = false
            let upgradeFailure: LocalStorageError | undefined
            try {
                const factory = this.factory()
                if (!factory) throw new LocalStorageError("open", "unsupported")
                const request = factory.open(this.name, this.migrations.length)
                request.onblocked = () => {
                    abandoned = true
                    reject(new LocalStorageError("open", "blocked"))
                }
                request.onupgradeneeded = (event) => {
                    const transaction = request.transaction!
                    if (abandoned) {
                        transaction.abort()
                        return
                    }
                    transaction.addEventListener("error", (event) => {
                        upgradeFailure = localFailure("upgrade", (event.target as IDBRequest).error)
                    })
                    transaction.addEventListener("abort", () => {
                        upgradeFailure ??= localFailure("upgrade", transaction.error)
                    })
                    try {
                        for (const migration of this.migrations) {
                            if (migration.version > event.oldVersion) migration.upgrade(request.result, transaction)
                        }
                    } catch (cause) {
                        upgradeFailure = localFailure("upgrade", cause)
                        transaction.abort()
                    }
                }
                request.onerror = () => reject(upgradeFailure ?? localFailure("open", request.error))
                request.onsuccess = () => {
                    const database = request.result
                    // Release promptly when another tab requests an upgrade; active transactions may finish.
                    database.onversionchange = () => database.close()
                    if (abandoned) database.close()
                    else resolve(database)
                }
            } catch (cause) {
                reject(localFailure("open", cause))
            }
        })
    }

    /**
     * Enqueue requests synchronously, returning the request whose result is needed.
     * Multiple stores/requests share one atomic transaction. No async callback or external await.
     * The result becomes visible to the caller only after transaction.oncomplete.
     */
    async transaction<T>(
        stores: string[],
        mode: IDBTransactionMode,
        operation: LocalOperation,
        enqueue: (transaction: IDBTransaction) => IDBRequest<T>
    ): Promise<T> {
        const database = await this.open()
        try {
            return await new Promise<T>((resolve, reject) => {
                let transaction: IDBTransaction
                try {
                    transaction = database.transaction(stores, mode)
                } catch (cause) {
                    reject(localFailure(operation, cause))
                    return
                }
                let request: IDBRequest<T>
                let failure: LocalStorageError | undefined
                transaction.oncomplete = () => {
                    try {
                        if (failure) reject(failure)
                        else resolve(request.result)
                    } catch (cause) {
                        reject(localFailure(operation, cause))
                    }
                }
                transaction.onabort = () => reject(failure ?? localFailure(operation, transaction.error))
                transaction.onerror = (event) => {
                    failure ??= localFailure(operation, (event.target as IDBRequest).error ?? transaction.error)
                }
                try {
                    request = enqueue(transaction)
                    if (!request || !("readyState" in request)) {
                        throw new Error("Enqueue must return an IndexedDB request synchronously")
                    }
                } catch (cause) {
                    failure = localFailure(operation, cause)
                    transaction.abort()
                }
            })
        } finally {
            // No cached connection survives an operation or hides deletion of the database.
            database.close()
        }
    }

    async diagnose(): Promise<LocalAvailability> {
        try {
            const token = crypto.randomUUID()
            const value = await this.transaction([HEALTH_STORE], "readwrite", "diagnose", (transaction) => {
                const store = transaction.objectStore(HEALTH_STORE)
                store.put(token, "probe")
                const read = store.get("probe") as IDBRequest<string | undefined>
                store.delete("probe")
                return read
            })
            if (value !== token) throw new LocalStorageError("diagnose", "failed", new Error("Persistence probe mismatch"))
            return { status: "operational" }
        } catch (cause) {
            const error = localFailure("diagnose", cause)
            return { status: error.code === "unsupported" ? "unsupported" : "unavailable", error }
        }
    }
}

export const localDatabase = new LocalDatabase()
