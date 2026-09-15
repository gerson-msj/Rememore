import type { LocalMemory } from "../local/captures.ts"

export type CaptureMetadataResult =
    | { status: "found"; revision: string; editWindowDays: number }
    | { status: "absent"; editWindowDays: number }
    | { status: "failed" }

export type PreservedCaptureResult =
    | { status: "found"; revision: string; memories: LocalMemory[]; editWindowDays: number }
    | { status: "absent" }
    | { status: "failed" }

export interface PreservedCapturesService {
    /** Lightweight existence/revision and operational settings; never transmits memories. */
    inspect(accountId: string, date: string): Promise<CaptureMetadataResult>
    /** Returns a self-consistent snapshot, including its own revision and settings. */
    read(accountId: string, date: string): Promise<PreservedCaptureResult>
}
