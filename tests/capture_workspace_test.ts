import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { LocalDatabase } from "../app/services/local/database.ts"
import { LocalCapturesRepository } from "../app/services/local/captures.ts"
import { prepareCapture } from "../app/services/capture.ts"
import { formatCaptureDate, isCaptureDate } from "../app/utils/captureDate.ts"
import { mockSession } from "../app/services/auth/mock.ts"

function equal(actual: unknown, expected: unknown) {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
    }
}

async function rejects(operation: () => Promise<unknown>) {
    let failed = false
    try {
        await operation()
    } catch {
        failed = true
    }
    equal(failed, true)
}

Deno.test("capture dates: real calendar, complete dates, and no future", () => {
    for (const value of ["2026-02-29", "2026-04-31", "2026-00-10", "2026-09", "2026-09-14", "0000-01-01"]) {
        equal(isCaptureDate(value, "2026-09-13"), false)
    }
    equal(isCaptureDate("2024-02-29", "2026-09-13"), true)
    equal(isCaptureDate("1900-02-29", "2026-09-13"), false)
    equal(isCaptureDate("2000-02-29", "2026-09-13"), true)
    equal(formatCaptureDate("2026-09-13"), "13/09/2026")
})

Deno.test("workspace: isolation, origin, protection, ascending pending dates, and confirmed removal", async () => {
    const factory = new IDBFactory()
    const repository = new LocalCapturesRepository(new LocalDatabase({ factory: () => factory }))
    const first = await prepareCapture("a", "2026-09-01", repository, { read: () => Promise.resolve({ status: "absent" }) })
    equal(first.changed, false)
    equal(await repository.listPending("a"), [])
    const memories = [{ id: "m1", content: "Preservada", order: 0 }]
    await prepareCapture("a", "2026-09-02", repository, { read: () => Promise.resolve({ status: "found", memories }) })
    await repository.markChanged("a", "2026-09-02")
    await repository.markChanged("a", "2026-09-01")
    await repository.markChanged("a", "2026-09-01")
    equal((await repository.listPending("a")).map((item) => item.date), ["2026-09-01", "2026-09-02"])
    equal(await repository.listPending("b"), [])
    const resumed = await prepareCapture("a", "2026-09-02", repository, {
        read: () => {
            throw new Error("must not query remote")
        }
    })
    equal(resumed.memories, memories)
    equal(resumed.preservedOrigin, true)
    await repository.remove("a", "2026-09-01")
    equal((await repository.listPending("a")).length, 1)
    await rejects(() => repository.markChanged("a", "2026-09-01"))
})

Deno.test("workspace: remote failures never create empty records; intact workspaces can refresh", async () => {
    const repository = new LocalCapturesRepository(new LocalDatabase({ factory: () => factory }))
    const factory = new IDBFactory()
    await rejects(() => prepareCapture("a", "2026-09-01", repository, { read: () => Promise.resolve({ status: "failed" }) }))
    equal(await repository.get("a", "2026-09-01"), undefined)
    await prepareCapture("a", "2026-09-01", repository, { read: () => Promise.resolve({ status: "absent" }) })
    const refreshed = await prepareCapture("a", "2026-09-01", repository, {
        read: () => Promise.resolve({ status: "found", memories: [] })
    })
    equal(refreshed.preservedOrigin, true)
    equal(refreshed.changed, false)
    const unavailable = new LocalCapturesRepository(new LocalDatabase({ factory: () => undefined }))
    await rejects(() =>
        prepareCapture("a", "2026-09-01", unavailable, {
            read: () => {
                throw new Error("must not query remote")
            }
        })
    )
})

Deno.test("session identity: absent outside the authenticated mock session", async () => {
    equal(await mockSession.accountId(new Request("http://localhost")), null)
    equal(
        await mockSession.accountId(new Request("http://localhost", { headers: { cookie: "rememore_mock_auth=authenticated" } })),
        "01K4Z5J6M7N8P9Q0R1S2T3V4W5"
    )
})

Deno.test("workspace: failed writes and removals reject without reporting success or losing pending work", async () => {
    const factory = new IDBFactory()
    const database = new LocalDatabase({ factory: () => factory })
    const repository = new LocalCapturesRepository(database)
    await prepareCapture("a", "2026-09-01", repository, { read: () => Promise.resolve({ status: "absent" }) })
    const transaction = database.transaction.bind(database)
    database.transaction = () => Promise.reject(new Error("Simulated storage failure"))
    await rejects(() => repository.markChanged("a", "2026-09-01"))
    await rejects(() => prepareCapture("a", "2026-09-02", repository))
    database.transaction = transaction
    equal((await repository.get("a", "2026-09-01"))?.changed, false)
    await repository.markChanged("a", "2026-09-01")
    database.transaction = () => Promise.reject(new Error("Simulated storage failure"))
    await rejects(() => repository.remove("a", "2026-09-01"))
    await rejects(() => repository.listPending("a"))
    database.transaction = transaction
    equal((await repository.listPending("a")).length, 1)
    const put = repository.put.bind(repository)
    repository.put = () => Promise.reject(new Error("Simulated workspace creation failure"))
    await rejects(() => prepareCapture("a", "2026-09-02", repository))
    repository.put = put
    equal(await repository.get("a", "2026-09-02"), undefined)
})
