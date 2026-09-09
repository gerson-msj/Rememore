import type { AuthenticationService, SessionService } from "./auth/contracts.ts"
import { mockAuthentication, mockSession } from "./auth/mock.ts"

// Ponto de composição: páginas e middleware dependem dos contratos, não dos mocks.
export const authentication: AuthenticationService = mockAuthentication
export const session: SessionService = mockSession
