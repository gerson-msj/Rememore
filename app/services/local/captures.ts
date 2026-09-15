import { LocalDatabase, localDatabase } from "./database.ts"
import { CAPTURES_ACCOUNT_INDEX, CAPTURES_STORE } from "./schema.ts"

export interface LocalComplement {
    id: string
    content: string
    /** ISO instant of the first remote preservation; null means never preserved. */
    firstPreservedAt: string | null
}

export interface LocalMemory {
    /** Assigned once and retained independently of content and physical order. */
    id: string
    content: string
    order: number
    firstPreservedAt: string | null
    /** Oldest to newest; each complement retains its own first preservation. */
    complements: LocalComplement[]
}

export interface LocalCapture {
    accountId: string
    /** Calendar date supplied by the consumer, in YYYY-MM-DD form. */
    date: string
    memories: LocalMemory[]
    changed: boolean
    preservedOrigin: boolean
    /** Opaque remote baseline; null only when absence was confirmed. */
    originRevision: string | null
    /** Identifies this materialization, so an old session cannot resume a replacement. */
    workspaceId: string
    editWindowDays: number
}

/** Persistence only: does not decide when pending work begins or how memories are edited. */
export class LocalCapturesRepository {
    constructor(private readonly database: LocalDatabase = localDatabase) {}

    async put(capture: LocalCapture): Promise<void> {
        await this.database.transaction(
            [CAPTURES_STORE],
            "readwrite",
            "write",
            (transaction) => transaction.objectStore(CAPTURES_STORE).put(capture)
        )
    }

    get(accountId: string, date: string): Promise<LocalCapture | undefined> {
        return this.database.transaction(
            [CAPTURES_STORE],
            "readonly",
            "read",
            (transaction) => transaction.objectStore(CAPTURES_STORE).get([accountId, date]) as IDBRequest<LocalCapture | undefined>
        )
    }

    async remove(accountId: string, date: string): Promise<void> {
        await this.database.transaction(
            [CAPTURES_STORE],
            "readwrite",
            "remove",
            (transaction) => transaction.objectStore(CAPTURES_STORE).delete([accountId, date])
        )
    }

    listByAccount(accountId: string): Promise<LocalCapture[]> {
        return this.database.transaction(
            [CAPTURES_STORE],
            "readonly",
            "query",
            (transaction) =>
                transaction.objectStore(CAPTURES_STORE).index(CAPTURES_ACCOUNT_INDEX).getAll(accountId) as IDBRequest<LocalCapture[]>
        )
    }

    async listPending(accountId: string): Promise<LocalCapture[]> {
        return (await this.listByAccount(accountId)).filter((capture) => capture.changed)
            .sort((a, b) => a.date.localeCompare(b.date))
    }

    async markChanged(accountId: string, date: string): Promise<void> {
        await this.database.transaction([CAPTURES_STORE], "readwrite", "write", (transaction) => {
            const store = transaction.objectStore(CAPTURES_STORE)
            const request = store.get([accountId, date]) as IDBRequest<LocalCapture | undefined>
            request.onsuccess = () => {
                if (!request.result) transaction.abort()
                else store.put({ ...request.result, changed: true })
            }
            return request
        })
    }
}

export const localCaptures = new LocalCapturesRepository()
