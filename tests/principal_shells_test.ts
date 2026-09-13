// Executar após deno task build: deno test -A tests/principal_shells_test.ts
import server from "../_fresh/server.js"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Esperado ${expected}, recebido ${actual}`)
}

function request(path: string, cookie = "") {
    return server.fetch(new Request("http://localhost" + path, { headers: { Cookie: cookie } })) as Promise<Response>
}

async function redirect(response: Response, target: string) {
    equal(response.status, 303)
    equal(response.headers.get("location"), target)
    await response.body?.cancel()
}

Deno.test("HTTP: cascas da Principal respeitam sessão e autorização administrativa do cenário", async () => {
    const shells = [
        ["/capturar", "Capturar"],
        ["/capturar/2026-09-01", "Capturar"],
        ["/encontrar", "Encontrar Memórias"],
        ["/rever", "Rever um Dia"],
        ["/rememorar", "Rememorar"],
        ["/conta", "Minha Conta e Meus Dados"],
        ["/admin", "Administração"]
    ] as const

    for (const [path] of shells) {
        await redirect(await request(path), "/entrar")
    }

    const login = await server.fetch(
        new Request("http://localhost/entrar", {
            method: "POST",
            body: new URLSearchParams({ username: "usuario", password: "x" })
        })
    ) as Response
    const cookie = login.headers.get("set-cookie")!.split(";")[0]
    await redirect(login, "/principal")

    for (const [path, title] of shells) {
        const response = await request(path, cookie)
        equal(response.status, 200)
        equal(response.headers.get("cache-control"), "no-store")
        const html = await response.text()
        equal(html.includes(`>${title}</h2>`), true)
        equal(html.includes('aria-label="Voltar"'), true)
        equal(html.includes('aria-label="Sair"'), true)
    }

    const principal = await request("/principal", cookie)
    equal(principal.status, 200)
    equal((await principal.text()).includes("Minha Conta e Meus Dados"), true)
    for (const date of ["2026-02-29", "2026-09", "invalida"]) {
        await redirect(await request(`/capturar/${date}`, cookie), "/capturar?data-invalida")
    }
    const day = await request("/capturar/2026-09-01", cookie)
    const html = await day.text()
    equal(html.includes("Preparando captura"), true)
    equal(html.includes(">Marcar como alterada</button>"), false)
})
