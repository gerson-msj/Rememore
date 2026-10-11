// Executar após deno task build: deno test -A tests/fluxos_senha_test.ts
import servidor from "../_fresh/server.js"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

function requisicao(caminho: string, formulario?: Record<string, string>, cookie = "") {
    return servidor.fetch(
        new Request("http://localhost" + caminho, {
            method: formulario ? "POST" : "GET",
            headers: { Cookie: cookie },
            body: formulario ? new URLSearchParams(formulario) : undefined
        })
    ) as Promise<Response>
}

async function verificarRedirecionamento(resposta: Response, alvo: string) {
    verificarIgualdade(resposta.status, 303)
    verificarIgualdade(resposta.headers.get("location"), alvo)
    await resposta.body?.cancel()
}

Deno.test("HTTP: Cadastro e Redefinição, confirmação pendente e regimes de acesso", async () => {
    const curta = await requisicao("/redefinir-senha", { username: "usuario", key: "usuario", password: "123" })
    verificarIgualdade(curta.headers.get("set-cookie"), null)
    verificarIgualdade((await curta.json()).status, "invalidPassword")

    const opaca = await requisicao("/redefinir-senha", { username: "usuario", key: "texto sem formato UUID", password: "123456" })
    verificarIgualdade(JSON.stringify(await opaca.json()), JSON.stringify({ status: "invalid" }))

    const conviteFixo = await requisicao("/cadastro?convite=invalido", { invitation: "usuario", username: "usuario", password: "123456" })
    const invalido = await conviteFixo.json()
    verificarIgualdade(invalido.status, "invalid")
    verificarIgualdade(invalido.errors.invitation, true)

    const preenchida = await requisicao("/redefinir-senha?chave=usuario")
    verificarIgualdade(preenchida.status, 200)
    verificarIgualdade((await preenchida.text()).includes('value="usuario"'), true)

    const rotas = ["/cadastro", "/cadastro/confirmacao", "/redefinir-senha", "/redefinir-senha/confirmacao"]
    for (const caminho of ["/cadastro", "/redefinir-senha"]) {
        const confirmacao = caminho + "/confirmacao"
        await verificarRedirecionamento(await requisicao(confirmacao, { intent: "read", pendingId: "inexistente" }), "/")
        await verificarRedirecionamento(await requisicao(confirmacao, { intent: "confirm", pendingId: "inexistente" }), "/")

        const aceito = await requisicao(caminho, { invitation: "usuario", username: " USUARIO ", key: "usuario", password: "123456" })
        verificarIgualdade(aceito.status, 200)
        verificarIgualdade(aceito.headers.get("cache-control"), "no-store")
        verificarIgualdade(aceito.headers.get("set-cookie"), null)
        const { status: estado, pendingId: idPendente } = await aceito.json()
        verificarIgualdade(estado, "accepted")
        await verificarRedirecionamento(await requisicao("/principal"), "/entrar")

        const leitura = await requisicao(confirmacao, { intent: "read", pendingId: idPendente })
        verificarIgualdade(leitura.headers.get("cache-control"), "no-store")
        verificarIgualdade(leitura.headers.get("set-cookie"), null)
        const { key: chave } = await leitura.json()
        verificarIgualdade(typeof chave, "string")
        const recarregamento = await requisicao(confirmacao, { intent: "read", pendingId: idPendente })
        verificarIgualdade((await recarregamento.json()).key, chave)

        const outro = caminho === "/cadastro" ? "/redefinir-senha/confirmacao" : "/cadastro/confirmacao"
        await verificarRedirecionamento(await requisicao(outro, { intent: "confirm", pendingId: idPendente }), "/")

        const confirmado = await requisicao(confirmacao, { intent: "confirm", pendingId: idPendente })
        verificarIgualdade(confirmado.status, 204)
        const cookie = confirmado.headers.get("set-cookie")!.split(";")[0]
        const principal = await requisicao("/principal", undefined, cookie)
        verificarIgualdade(principal.status, 200)
        await principal.text()
        for (const rota of rotas) {
            await verificarRedirecionamento(await requisicao(rota, undefined, cookie), "/principal")
            await verificarRedirecionamento(await requisicao(rota, {}, cookie), "/principal")
        }
        await verificarRedirecionamento(await requisicao("/principal", {}, cookie), "/")
        await verificarRedirecionamento(await requisicao(confirmacao, { intent: "read", pendingId: idPendente }), "/")
        await verificarRedirecionamento(await requisicao(confirmacao, { intent: "confirm", pendingId: idPendente }), "/")
    }
})
