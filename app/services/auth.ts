import type { AuthenticationService, SessionService } from "./auth/contracts.ts"
import { mockAuthentication, mockSession } from "./auth/mock.ts"
import type { PasswordResetService, PendingKeyService, RegistrationService } from "./auth/contracts.ts"
import { mockPasswordReset, mockPendingKey, mockRegistration } from "./auth/registrationMock.ts"

// Ponto de composição: páginas e middleware dependem dos contratos, não dos mocks.
export const authentication: AuthenticationService = mockAuthentication
export const session: SessionService = mockSession
export const registration: RegistrationService = mockRegistration
export const pendingKey: PendingKeyService = mockPendingKey
export const passwordReset: PasswordResetService = mockPasswordReset
