import type { KeyOperation, PasswordResetService, PendingKeyService, RegistrationErrors, RegistrationService } from "./contracts.ts"
import { normalizeUsername } from "../../utils/login.ts"

// Contextos transitórios do mock: não são contas nem um repositório de chaves recuperáveis.
const pending = new Map<string, { key: string; operation: KeyOperation }>()

function issue(operation: KeyOperation): string {
    const pendingId = crypto.randomUUID()
    pending.set(pendingId, { key: crypto.randomUUID(), operation })
    return pendingId
}

export const mockRegistration: RegistrationService = {
    register({ invitation, username, password }) {
        const errors: RegistrationErrors = {}
        if (invitation !== "usuario") errors.invitation = true
        if (normalizeUsername(username) !== "usuario") errors.username = true
        if (password.length < 6) errors.password = true
        if (Object.keys(errors).length) return Promise.resolve({ status: "invalid", errors })
        const pendingId = issue("registration")
        return Promise.resolve({ status: "accepted", pendingId })
    }
}

export const mockPendingKey: PendingKeyService = {
    read(pendingId, operation) {
        const context = pending.get(pendingId)
        return Promise.resolve(context?.operation === operation ? context.key : null)
    },
    consume(pendingId, operation) {
        return Promise.resolve(pending.get(pendingId)?.operation === operation && pending.delete(pendingId))
    }
}

export const mockPasswordReset: PasswordResetService = {
    reset({ username, key }) {
        if (normalizeUsername(username) !== "usuario" || key !== "usuario") return Promise.resolve({ status: "invalid" })
        return Promise.resolve({ status: "accepted", pendingId: issue("passwordReset") })
    }
}
