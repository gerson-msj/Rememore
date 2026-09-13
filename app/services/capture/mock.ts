import type { PreservedCapturesService } from "./contracts.ts"

// No preserved content in the initial scenario. Other responses can be forged here for validation.
export const mockPreservedCaptures: PreservedCapturesService = {
    read(_accountId, _date) {
        return Promise.resolve({ status: "absent" })
    }
}
