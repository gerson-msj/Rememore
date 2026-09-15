export class CaptureLockUnavailable extends Error {
    constructor() {
        super("Capture locking unavailable")
    }
}

/** A page owns the lease until it leaves. In-flight operations finish before explicit release. */
export class CaptureLease {
    private closing = false
    private running = 0

    constructor(private readonly unlock: () => void, private readonly released: Promise<void>) {}

    async run<T>(operation: () => Promise<T>): Promise<T> {
        if (this.closing) throw new CaptureLockUnavailable()
        this.running++
        try {
            return await operation()
        } finally {
            this.running--
            if (this.closing && this.running === 0) this.unlock()
        }
    }

    release(): Promise<void> {
        this.closing = true
        if (this.running === 0) this.unlock()
        return this.released
    }
}

/** No waiting queue or forced takeover: a competing editor receives null. */
export function acquireCaptureLock(
    accountId: string,
    date: string,
    manager: LockManager | undefined = globalThis.navigator?.locks
): Promise<CaptureLease | null> {
    if (!manager) return Promise.reject(new CaptureLockUnavailable())
    return new Promise((resolve, reject) => {
        let unlocked!: () => void
        let finished!: () => void
        const held = new Promise<void>((done) => unlocked = done)
        const released = new Promise<void>((done) => finished = done)
        try {
            void manager.request(`rememore:capture:${JSON.stringify([accountId, date])}`, { ifAvailable: true }, async (lock) => {
                if (!lock) {
                    resolve(null)
                    return
                }
                resolve(new CaptureLease(unlocked, released))
                await held
            }).then(finished, (error) => {
                finished()
                reject(error)
            })
        } catch (error) {
            finished()
            reject(error)
        }
    })
}
