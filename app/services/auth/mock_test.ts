import { mockAuthentication, mockSession } from "./mock.ts"
import { hasLoginContent, normalizeUsername } from "../../utils/login.ts"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Esperado ${expected}, recebido ${actual}`)
}

Deno.test("Login: normalização, espaços e senha sem comprimento mínimo", async () => {
    for (const username of ["usuario", "USUARIO", "Usuario", "  Usuario  "]) {
        equal(normalizeUsername(username), "usuario")
        equal(await mockAuthentication.authenticate({ username: normalizeUsername(username), password: "x" }), "accepted")
    }
    for (const username of ["", "   ", "outro", "usu ario", "usu\tario"]) {
        equal(await mockAuthentication.authenticate({ username: normalizeUsername(username), password: "x" }), "invalid")
    }
    for (const password of ["", "   ", "\t\n"]) {
        equal(hasLoginContent("usuario", password), false)
        equal(await mockAuthentication.authenticate({ username: "usuario", password }), "invalid")
    }
    equal(hasLoginContent("   ", "senha"), false)
    equal(hasLoginContent("usuario", " x "), true)
})

Deno.test("Sessão simulada: requisições independentes, escopo e remoção", async () => {
    const request = new Request("https://rememore.test/entrar")
    equal(await mockSession.isAuthenticated(request), false)
    const headers = new Headers()
    await mockSession.establish(request, headers)
    const cookie = headers.get("set-cookie")!
    equal(cookie.includes("HttpOnly"), true)
    equal(cookie.includes("Secure"), true)
    equal(cookie.includes("Path=/"), true)
    equal(cookie.includes("Max-Age"), false)
    equal(cookie.includes("Expires"), false)
    const authenticated = new Request("https://rememore.test/principal", { headers: { Cookie: cookie.split(";")[0] } })
    equal(await mockSession.isAuthenticated(authenticated), true)
    equal(
        await mockSession.isAuthenticated(
            new Request("https://rememore.test/principal", {
                headers: { Cookie: "other_rememore_mock_auth=authenticated; rememore_mock_auth=invalid" }
            })
        ),
        false
    )
    const logout = new Headers()
    await mockSession.end(authenticated, logout)
    equal(logout.get("set-cookie")!.includes("Max-Age=0"), true)
    equal(
        await mockSession.isAuthenticated(
            new Request("https://rememore.test/principal", {
                headers: { Cookie: logout.get("set-cookie")!.split(";")[0] }
            })
        ),
        false
    )
})
