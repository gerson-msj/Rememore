import { type LocalCapture, localCaptures, type LocalCapturesRepository } from "./local/captures.ts"
import type { PreservedCapturesService } from "./capture/contracts.ts"
import { mockPreservedCaptures } from "./capture/mock.ts"

export const preservedCaptures: PreservedCapturesService = mockPreservedCaptures

export function validateEditWindow(days: number): number {
    if (!Number.isFinite(days) || days <= 0) throw new Error("Invalid capture editing window")
    return days
}

function revision(value: string): string {
    if (typeof value !== "string" || !value.trim()) throw new Error("Invalid capture revision")
    return value
}

/** Caller holds the capture lock, after date validation and an operational local diagnostic. */
export async function prepareCapture(
    accountId: string,
    date: string,
    repository: LocalCapturesRepository = localCaptures,
    remote: PreservedCapturesService = preservedCaptures,
    resumeWorkspaceId?: string
): Promise<LocalCapture> {
    const existing = await repository.get(accountId, date)
    if (existing && (existing.changed || existing.workspaceId === resumeWorkspaceId)) {
        validateEditWindow(existing.editWindowDays)
        return existing
    }
    const metadata = await remote.inspect(accountId, date)
    if (metadata.status !== "found" && metadata.status !== "absent") throw new Error("Capture metadata unavailable")
    const editWindowDays = validateEditWindow(metadata.editWindowDays)
    const originRevision = metadata.status === "found" ? revision(metadata.revision) : null
    if (existing && existing.preservedOrigin === (metadata.status === "found") && existing.originRevision === originRevision) {
        // Refresh only the setting on normal entry. Memory content is reused without a full download.
        if (existing.editWindowDays === editWindowDays) return existing
        const refreshed = { ...existing, editWindowDays }
        await repository.put(refreshed)
        return refreshed
    }
    const capture: LocalCapture = {
        accountId,
        date,
        memories: [],
        preservedOrigin: metadata.status === "found",
        originRevision,
        changed: false,
        workspaceId: crypto.randomUUID(),
        editWindowDays
    }
    if (metadata.status === "found") {
        const result = await remote.read(accountId, date)
        // If existence changes during the download, leave the old workspace untouched and retry on a new opening.
        if (result.status !== "found") throw new Error("Preserved capture unavailable")
        capture.memories = result.memories
        capture.originRevision = revision(result.revision)
        capture.editWindowDays = validateEditWindow(result.editWindowDays)
    }
    await repository.put(capture)
    return capture
}
