import type { LocalMemory } from "../local/captures.ts"

export type PreservedCaptureResult =
    | { status: "found"; memories: LocalMemory[] }
    | { status: "absent" }
    | { status: "failed" }

export interface PreservedCapturesService {
    read(accountId: string, date: string): Promise<PreservedCaptureResult>
}
