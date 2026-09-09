// Executar após deno task build: deno test -A tests/password_flows_test.ts
import server from "../_fresh/server.js"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Esperado ${expected}, recebido ${actual}`)
}

function request(path: string, form?: Record<string, string>, cookie = "") {
    return server.fetch(
        new Request("http://localhost" + path, {
            method: form ? "POST" : "GET",
            headers: { Cookie: cookie },
            body: form ? new URLSearchParams(form) : undefined
        })
    ) as Promise<Response>
}

async function redirect(response: Response, target: string) {
    equal(response.status, 303)
    equal(response.headers.get("location"), target)
    await response.body?.cancel()
}

Deno.test("HTTP: Cadastro e Redefinição, confirmação pendente e regimes de acesso", async () => {
    const short = await request("/redefinir-senha", { username: "usuario", key: "usuario", password: "123" })
    equal(short.headers.get("set-cookie"), null)
    equal((await short.json()).status, "invalidPassword")

    const opaque = await request("/redefinir-senha", { username: "usuario", key: "texto sem formato UUID", password: "123456" })
    equal(JSON.stringify(await opaque.json()), JSON.stringify({ status: "invalid" }))

    const fixedInvitation = await request("/cadastro?convite=invalido", { invitation: "usuario", username: "usuario", password: "123456" })
    const invalid = await fixedInvitation.json()
    equal(invalid.status, "invalid")
    equal(invalid.errors.invitation, true)

    const prefilled = await request("/redefinir-senha?chave=usuario")
    equal(prefilled.status, 200)
    equal((await prefilled.text()).includes('value="usuario"'), true)

    const routes = ["/cadastro", "/cadastro/confirmacao", "/redefinir-senha", "/redefinir-senha/confirmacao"]
    for (const path of ["/cadastro", "/redefinir-senha"]) {
        const confirmation = path + "/confirmacao"
        await redirect(await request(confirmation, { intent: "read", pendingId: "inexistente" }), "/")
        await redirect(await request(confirmation, { intent: "confirm", pendingId: "inexistente" }), "/")

        const accepted = await request(path, { invitation: "usuario", username: " USUARIO ", key: "usuario", password: "123456" })
        equal(accepted.status, 200)
        equal(accepted.headers.get("cache-control"), "no-store")
        equal(accepted.headers.get("set-cookie"), null)
        const { status, pendingId } = await accepted.json()
        equal(status, "accepted")
        await redirect(await request("/principal"), "/entrar")

        const read = await request(confirmation, { intent: "read", pendingId })
        equal(read.headers.get("cache-control"), "no-store")
        equal(read.headers.get("set-cookie"), null)
        const { key } = await read.json()
        equal(typeof key, "string")
        const reload = await request(confirmation, { intent: "read", pendingId })
        equal((await reload.json()).key, key)

        const other = path === "/cadastro" ? "/redefinir-senha/confirmacao" : "/cadastro/confirmacao"
        await redirect(await request(other, { intent: "confirm", pendingId }), "/")

        const confirmed = await request(confirmation, { intent: "confirm", pendingId })
        equal(confirmed.status, 204)
        const cookie = confirmed.headers.get("set-cookie")!.split(";")[0]
        const principal = await request("/principal", undefined, cookie)
        equal(principal.status, 200)
        await principal.text()
        for (const route of routes) {
            await redirect(await request(route, undefined, cookie), "/principal")
            await redirect(await request(route, {}, cookie), "/principal")
        }
        await redirect(await request("/principal", {}, cookie), "/")
        await redirect(await request(confirmation, { intent: "read", pendingId }), "/")
        await redirect(await request(confirmation, { intent: "confirm", pendingId }), "/")
    }
})
