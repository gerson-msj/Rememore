import { LocalDatabase, localDatabase } from "./database.ts"
import { CAPTURES_ACCOUNT_INDEX, CAPTURES_STORE } from "./schema.ts"

export interface LocalMemory {
    /** Assigned once by the future creation flow (e.g. crypto.randomUUID()). */
    id: string
    content: string
    order: number
}

export interface LocalCapture {
    accountId: string
    /** Calendar date supplied by the consumer, in YYYY-MM-DD form. */
    date: string
    memories: LocalMemory[]
    changed: boolean
    preservedOrigin: boolean
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
