import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { LocalDatabase } from "../app/services/local/database.ts"
import { LocalCapturesRepository } from "../app/services/local/captures.ts"
import { localMigrations } from "../app/services/local/schema.ts"
import { prepareCapture } from "../app/services/capture.ts"
import { type CaptureMockScenario, createCaptureMock } from "../app/services/capture/mock.ts"
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

function setup() {
    const factory = new IDBFactory()
    const database = new LocalDatabase({ factory: () => factory })
    const repository = new LocalCapturesRepository(database)
    const scenario: CaptureMockScenario = { status: "absent", revision: "X", editWindowDays: 3, memories: [] }
    const calls: string[] = []
    const remote = createCaptureMock(() => scenario, (operation) => calls.push(operation))
    const open = (date = "2026-09-01", resume?: string, account = "a") => prepareCapture(account, date, repository, remote, resume)
    const found = (revision = "X") => {
        scenario.status = "found"
        scenario.revision = revision
        scenario.memories = [{
            id: "stable-memory-id",
            content: `Revision ${revision}`,
            order: 0,
            firstPreservedAt: "2026-09-01T12:00:00.000Z",
            complements: [{ id: "stable-complement-id", content: "Complemento", firstPreservedAt: "2026-09-02T12:00:00.000Z" }]
        }]
    }
    return { database, repository, scenario, calls, open, found }
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

Deno.test("cache: absence is materialized once and revalidated without a full download", async () => {
    const { open, calls, repository } = setup()
    const first = await open()
    equal(first.changed, false)
    equal(first.preservedOrigin, false)
    equal(first.originRevision, null)
    equal(first.editWindowDays, 3)
    equal(first.memories, [])
    equal(await repository.get("a", first.date), first)
    equal(await repository.listPending("a"), [])
    equal(await open(), first)
    equal(calls, ["metadata", "metadata"])
})

Deno.test("cache: same revision reuses all memories, refreshes only settings; changed revision downloads once", async () => {
    const { open, calls, found, scenario } = setup()
    found()
    const first = await open()
    equal(calls, ["metadata", "download"])
    equal(first.originRevision, "X")
    // Same revision cannot retransmit or replace the already downloaded content.
    scenario.memories = []
    scenario.editWindowDays = 4
    const second = await open()
    equal(second.memories, first.memories)
    equal(second.workspaceId, first.workspaceId)
    equal(second.editWindowDays, 4)
    equal(second.changed, false)
    equal(calls, ["metadata", "download", "metadata"])
    found("Y")
    const third = await open()
    equal(third.originRevision, "Y")
    equal(third.memories[0].content, "Revision Y")
    equal(third.workspaceId === first.workspaceId, false)
    equal(calls, ["metadata", "download", "metadata", "metadata", "download"])
})

Deno.test("cache: absent -> found -> absent reconstructs clean state only on conclusive responses", async () => {
    const { open, calls, found, scenario } = setup()
    await open()
    found()
    const existing = await open()
    equal(existing.preservedOrigin, true)
    scenario.status = "absent"
    const empty = await open()
    equal(empty.preservedOrigin, false)
    equal(empty.originRevision, null)
    equal(empty.memories, [])
    equal(empty.changed, false)
    equal(calls, ["metadata", "metadata", "download", "metadata"])
})

Deno.test("pending: local work and original window prevail without any remote call, isolated by account/date", async () => {
    const { open, calls, found, scenario, repository } = setup()
    found()
    const first = await open("2026-09-02")
    await open()
    await repository.markChanged("a", "2026-09-02")
    await repository.markChanged("a", "2026-09-01")
    await repository.markChanged("a", "2026-09-01")
    equal((await repository.listPending("a")).map((capture) => capture.date), ["2026-09-01", "2026-09-02"])
    equal(await repository.listPending("b"), [])
    const before = calls.length
    scenario.status = "failed"
    scenario.editWindowDays = 8
    const resumed = await open("2026-09-02")
    equal(resumed, { ...first, changed: true })
    equal(calls.length, before)
    await rejects(() => open("2026-09-02", undefined, "b"))
    await repository.remove("a", "2026-09-01")
    equal((await repository.listPending("a")).length, 1)
    await rejects(() => repository.markChanged("a", "2026-09-01"))
})

Deno.test("reload: open clean session keeps version and window; new normal entry revalidates", async () => {
    const { open, calls, found, scenario } = setup()
    found()
    const first = await open()
    found("Y")
    scenario.editWindowDays = 6
    equal(await open(first.date, first.workspaceId), first)
    equal(calls, ["metadata", "download"])
    const next = await open()
    equal(next.originRevision, "Y")
    equal(next.editWindowDays, 6)
    found("Z")
    // A marker referencing a replaced/deleted workspace cannot resurrect its former base.
    equal((await open(first.date, first.workspaceId)).originRevision, "Z")
})

Deno.test("failures: metadata/download/configuration errors do not erase cache or create empty workspaces", async () => {
    const { open, found, scenario, repository } = setup()
    scenario.status = "failed"
    await rejects(() => open())
    equal(await repository.get("a", "2026-09-01"), undefined)
    found()
    const first = await open()
    scenario.status = "failed"
    await rejects(() => open())
    found("Y")
    scenario.failRead = true
    await rejects(() => open())
    scenario.failRead = false
    for (const invalid of [NaN, Infinity, 0, -1, "3" as unknown as number]) {
        scenario.editWindowDays = invalid
        await rejects(() => open())
    }
    equal(await repository.get("a", first.date), first)
    equal(await repository.listPending("a"), [])
})

Deno.test("download: response carries its own consistent revision and settings if remote changes after metadata", async () => {
    const { repository, found, scenario } = setup()
    found("Y")
    const remote = createCaptureMock(() => scenario)
    remote.inspect = () => Promise.resolve({ status: "found", revision: "X", editWindowDays: 3 })
    scenario.editWindowDays = 4
    const result = await prepareCapture("a", "2026-09-01", repository, remote)
    equal(result.originRevision, "Y")
    equal(result.editWindowDays, 4)
    equal(result.memories[0].content, "Revision Y")
    scenario.status = "absent"
    await rejects(() => prepareCapture("a", "2026-09-01", repository, remote))
    equal(await repository.get("a", result.date), result)
})

Deno.test("local failures: failed commits preserve confirmed content, baseline, identities and first preservation", async () => {
    const { open, found, repository, database } = setup()
    found()
    const first = await open()
    const transaction = database.transaction.bind(database)
    database.transaction = () => Promise.reject(new Error("Simulated storage failure"))
    await rejects(() => repository.markChanged("a", first.date))
    await rejects(() => repository.remove("a", first.date))
    await rejects(() => repository.listPending("a"))
    await rejects(() => open("2026-09-02"))
    database.transaction = transaction
    equal(await repository.get("a", first.date), first)
    await repository.markChanged("a", first.date)
    equal(await repository.get("a", first.date), { ...first, changed: true })
    const put = repository.put.bind(repository)
    repository.put = () => Promise.reject(new Error("Simulated failed commit"))
    await rejects(() => open("2026-09-02"))
    repository.put = put
    equal(await repository.get("a", "2026-09-02"), undefined)
})

Deno.test("migration 3: clears authorized pre-07 experimental captures only once", async () => {
    const factory = new IDBFactory()
    const legacy = new LocalDatabase({ factory: () => factory, migrations: localMigrations.slice(0, 2) })
    await legacy.transaction(
        ["captures"],
        "readwrite",
        "write",
        (tx) => tx.objectStore("captures").put({ accountId: "a", date: "2026-09-01", changed: true, memories: [] })
    )
    const repository = new LocalCapturesRepository(new LocalDatabase({ factory: () => factory }))
    equal(await repository.listByAccount("a"), [])
    const remote = createCaptureMock(() => ({ status: "absent", revision: "X", editWindowDays: 3, memories: [] }))
    const first = await prepareCapture("a", "2026-09-01", repository, remote)
    equal(await repository.get("a", first.date), first)
})

Deno.test("session identity: absent outside the authenticated mock session", async () => {
    equal(await mockSession.accountId(new Request("http://localhost")), null)
    equal(
        await mockSession.accountId(new Request("http://localhost", { headers: { cookie: "rememore_mock_auth=authenticated" } })),
        "01K4Z5J6M7N8P9Q0R1S2T3V4W5"
    )
})
