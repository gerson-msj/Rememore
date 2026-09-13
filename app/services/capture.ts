import { localCaptures, type LocalCapturesRepository } from "./local/captures.ts"
import type { PreservedCapturesService } from "./capture/contracts.ts"
import { mockPreservedCaptures } from "./capture/mock.ts"

export const preservedCaptures: PreservedCapturesService = mockPreservedCaptures

/** Called only after browser date validation and an operational local diagnostic. */
export async function prepareCapture(
    accountId: string,
    date: string,
    repository: LocalCapturesRepository = localCaptures,
    remote: PreservedCapturesService = preservedCaptures
) {
    const existing = await repository.get(accountId, date)
    if (existing?.changed) return existing
    // Rebuild unchanged workspaces on each opening so they never mask newer preserved content.
    const result = await remote.read(accountId, date)
    if (result.status !== "found" && result.status !== "absent") throw new Error("Preserved capture unavailable")
    const capture = {
        accountId,
        date,
        memories: result.status === "found" ? result.memories : [],
        preservedOrigin: result.status === "found",
        changed: false
    }
    await repository.put(capture)
    return capture
}
