import { acquireCaptureLock } from "../app/services/capture/lock.ts"
import { CaptureOpenSession } from "../app/services/capture/openSession.ts"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Expected ${expected}, got ${actual}`)
}

async function rejects(operation: () => Promise<unknown>) {
    let rejected = false
    try {
        await operation()
    } catch {
        rejected = true
    }
    equal(rejected, true)
}

function lockManager(): LockManager {
    const held = new Set<string>()
    return {
        async request(name: string, _options: LockOptions, callback: LockGrantedCallback<unknown>) {
            if (held.has(name)) return await callback(null)
            held.add(name)
            try {
                return await callback({ name, mode: "exclusive" })
            } finally {
                held.delete(name)
            }
        }
    } as unknown as LockManager
}

Deno.test("capture lock: same account/date blocked; other dates and accounts allowed; release permits reopening", async () => {
    const manager = lockManager()
    const first = await acquireCaptureLock("a", "2026-09-01", manager)
    if (!first) throw new Error("Expected lock")
    equal(await acquireCaptureLock("a", "2026-09-01", manager), null)
    const anotherDate = await acquireCaptureLock("a", "2026-09-02", manager)
    const anotherAccount = await acquireCaptureLock("b", "2026-09-01", manager)
    if (!anotherDate || !anotherAccount) throw new Error("Unrelated captures must remain available")
    await first.release()
    const resumed = await acquireCaptureLock("a", "2026-09-01", manager)
    if (!resumed) throw new Error("Released capture must reopen")
    await resumed.release()
    await anotherDate.release()
    await anotherAccount.release()
})

Deno.test("capture lock: release waits for current operation and rejects writes from the departed page", async () => {
    const manager = lockManager()
    const lease = await acquireCaptureLock("a", "2026-09-01", manager)
    if (!lease) throw new Error("Expected lock")
    let finish!: () => void
    const pending = new Promise<void>((resolve) => finish = resolve)
    let writes = 0
    const operation = lease.run(async () => {
        await pending
        writes++
    })
    const releasing = lease.release()
    await rejects(() => lease.run(() => Promise.resolve(writes++)))
    equal(await acquireCaptureLock("a", "2026-09-01", manager), null)
    finish()
    await operation
    await releasing
    equal(writes, 1)
    const next = await acquireCaptureLock("a", "2026-09-01", manager)
    if (!next) throw new Error("Expected lock after commit")
    await rejects(() => next.run(() => Promise.reject(new Error("Failed transaction"))))
    await next.release()
})

Deno.test("capture lock: unavailable/refused native manager never permits unprotected writes", async () => {
    await rejects(() =>
        acquireCaptureLock("a", "2026-09-01", { request: () => Promise.reject(new Error("Denied")) } as unknown as LockManager)
    )
    await rejects(() =>
        acquireCaptureLock("a", "2026-09-01", {
            request: () => {
                throw new Error("Denied")
            }
        } as unknown as LockManager)
    )
})

class MemoryStorage implements Storage {
    private items = new Map<string, string>()
    get length() {
        return this.items.size
    }
    clear() {
        this.items.clear()
    }
    getItem(key: string) {
        return this.items.get(key) ?? null
    }
    key(index: number) {
        return [...this.items.keys()][index] ?? null
    }
    removeItem(key: string) {
        this.items.delete(key)
    }
    setItem(key: string, value: string) {
        this.items.set(key, value)
    }
}

Deno.test("open session: reload resumes; selection entry and browser back terminate the former session", () => {
    const storage = new MemoryStorage()
    const session = new CaptureOpenSession("a", "2026-09-01", storage)
    equal(session.resume("reload"), undefined)
    session.begin("workspace-X")
    equal(new CaptureOpenSession("a", "2026-09-01", storage).resume("reload"), "workspace-X")
    equal(new CaptureOpenSession("a", "2026-09-02", storage).resume("reload"), undefined)
    equal(new CaptureOpenSession("b", "2026-09-01", storage).resume("reload"), undefined)
    equal(session.resume("navigate"), undefined)
    equal(session.resume("reload"), undefined)
    session.begin("workspace-X")
    equal(session.resume("back_forward"), undefined)
    equal(session.resume("reload"), undefined)
    session.begin("workspace-X")
    session.end()
    equal(session.resume("reload"), undefined)
})

Deno.test("open session: inaccessible storage propagates failure for caller to warn, never claims protection", async () => {
    const storage = new MemoryStorage()
    storage.setItem = () => {
        throw new Error("Quota failure")
    }
    const session = new CaptureOpenSession("a", "2026-09-01", storage)
    await rejects(() => Promise.resolve(session.begin("workspace-X")))
    equal(session.resume("reload"), undefined)
})
