import type { AuthenticationService, SessionService } from "./contracts.ts"
import { hasLoginContent, normalizeUsername } from "../../utils/login.ts"

// Marcador deliberadamente simulado: não representa credencial ou política real de sessão.
const cookieName = "rememore_mock_auth"
const cookieValue = "authenticated"

function cookieAttributes(request: Request): string {
    return "; Path=/; HttpOnly; SameSite=Lax" + (new URL(request.url).protocol === "https:" ? "; Secure" : "")
}

export const mockAuthentication: AuthenticationService = {
    authenticate({ username, password }) {
        const accepted = hasLoginContent(username, password) && normalizeUsername(username) === "usuario"
        return Promise.resolve(accepted ? "accepted" : "invalid")
    }
}

export const mockSession: SessionService = {
    isAuthenticated(request) {
        const cookies = (request.headers.get("cookie") ?? "").split(";")
        return Promise.resolve(cookies.some((cookie) => cookie.trim() === cookieName + "=" + cookieValue))
    },
    establish(request, headers) {
        headers.append("Set-Cookie", cookieName + "=" + cookieValue + cookieAttributes(request))
        return Promise.resolve()
    },
    end(request, headers) {
        headers.append("Set-Cookie", cookieName + "=" + cookieAttributes(request) + "; Max-Age=0")
        return Promise.resolve()
    }
}
