// Executar após deno task build: deno test -A tests/auth_flow_test.ts
import server from "../_fresh/server.js"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Esperado ${expected}, recebido ${actual}`)
}

const origin = "http://localhost"
function request(path: string, cookie = "", form?: URLSearchParams) {
    return server.fetch(
        new Request(origin + path, {
            method: form ? "POST" : "GET",
            headers: { Cookie: cookie },
            body: form
        })
    ) as Promise<Response>
}

async function redirect(response: Response, target: string) {
    equal(response.status, 303)
    equal(response.headers.get("location"), target)
    await response.body?.cancel()
}

Deno.test("HTTP: entrada, falha, proteção, recarregamento e logout", async () => {
    for (const path of ["/", "/entrar"]) {
        const response = await request(path)
        equal(response.status, 200)
        equal(response.headers.get("cache-control"), "no-store")
        await response.text()
    }
    await redirect(await request("/principal"), "/entrar")

    const failed = await request("/entrar", "", new URLSearchParams({ username: "outro", password: "senha-de-teste" }))
    equal(failed.status, 200)
    equal(failed.headers.get("set-cookie"), null)
    const html = await failed.text()
    equal(html.includes("Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente."), true)
    equal(html.includes('value="outro"'), true)
    equal(html.includes('value="senha-de-teste"'), true)
    equal(/<button[^>]*type="submit"[^>]*disabled/.test(html), true)

    for (const username of ["usuario", "USUARIO", "  Usuario  "]) {
        const accepted = await request("/entrar", "", new URLSearchParams({ username, password: "x" }))
        const cookie = accepted.headers.get("set-cookie")!.split(";")[0]
        await redirect(accepted, "/principal")
        for (let reload = 0; reload < 2; reload++) {
            const principal = await request("/principal", cookie)
            equal(principal.status, 200)
            equal((await principal.text()).includes('aria-label="Sair"'), true)
        }
        await redirect(await request("/", cookie), "/principal")
        await redirect(await request("/entrar", cookie), "/principal")
        const logout = await request("/principal", cookie, new URLSearchParams())
        equal(logout.headers.get("set-cookie")!.includes("Max-Age=0"), true)
        await redirect(logout, "/")
        await redirect(await request("/principal"), "/entrar")
    }

    for (const [username, password] of [["usu ario", "x"], ["usuario", "   "], ["   ", "x"]]) {
        const response = await request("/entrar", "", new URLSearchParams({ username, password }))
        equal(response.headers.get("set-cookie"), null)
        equal((await response.text()).includes("Não foi possível entrar."), true)
    }
})
