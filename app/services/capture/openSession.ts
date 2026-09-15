interface OpenCaptureSession {
    workspaceId: string
}

/** A marker is not a pending change. Only reload consumes it, never a new navigation. */
export class CaptureOpenSession {
    private readonly key: string

    constructor(accountId: string, date: string, private readonly storage: Storage) {
        this.key = `rememore:capture:open:v1:${JSON.stringify([accountId, date])}`
    }

    resume(navigationType: string): string | undefined {
        if (navigationType !== "reload") {
            this.end()
            return undefined
        }
        const raw = this.storage.getItem(this.key)
        if (!raw) return undefined
        const session = JSON.parse(raw) as OpenCaptureSession
        return typeof session.workspaceId === "string" ? session.workspaceId : undefined
    }

    begin(workspaceId: string): void {
        this.storage.setItem(this.key, JSON.stringify({ workspaceId }))
    }

    end(): void {
        this.storage.removeItem(this.key)
    }
}
