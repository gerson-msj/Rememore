export const CAPTURES_STORE = "captures"
export const CAPTURES_ACCOUNT_INDEX = "byAccount"
export const HEALTH_STORE = "_health"

export interface LocalMigration {
    version: number
    // Enqueue IndexedDB requests synchronously; never await external work in an upgrade.
    upgrade(database: IDBDatabase, transaction: IDBTransaction): void
}

export const localMigrations: readonly LocalMigration[] = [
    {
        version: 1,
        upgrade(database) {
            database.createObjectStore(HEALTH_STORE)
            const captures = database.createObjectStore(CAPTURES_STORE, { keyPath: ["accountId", "date"] })
            captures.createIndex(CAPTURES_ACCOUNT_INDEX, "accountId")
        }
    },
    {
        version: 2,
        upgrade(_database, transaction) {
            // Pre-V1 experimental records have no workspace state or origin metadata.
            transaction.objectStore(CAPTURES_STORE).clear()
        }
    },
    {
        version: 3,
        upgrade(_database, transaction) {
            // Operator authorized replacing all pre-07 experimental captures (14/09/2026).
            transaction.objectStore(CAPTURES_STORE).clear()
        }
    }
]
