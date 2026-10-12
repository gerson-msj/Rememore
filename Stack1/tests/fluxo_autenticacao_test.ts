// Executar após deno task build: deno test -A tests/fluxo_autenticacao_test.ts
import servidor from "../_fresh/server.js"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

const origem = "http://localhost"
function requisicao(caminho: string, cookie = "", formulario?: URLSearchParams) {
    return servidor.fetch(
        new Request(origem + caminho, {
            method: formulario ? "POST" : "GET",
            headers: { Cookie: cookie },
            body: formulario
        })
    ) as Promise<Response>
}

async function verificarRedirecionamento(resposta: Response, alvo: string) {
    verificarIgualdade(resposta.status, 303)
    verificarIgualdade(resposta.headers.get("location"), alvo)
    await resposta.body?.cancel()
}

Deno.test("HTTP: entrada, falha, proteção, recarregamento e saída", async () => {
    for (const caminho of ["/", "/entrar"]) {
        const resposta = await requisicao(caminho)
        verificarIgualdade(resposta.status, 200)
        verificarIgualdade(resposta.headers.get("cache-control"), "no-store")
        await resposta.text()
    }
    await verificarRedirecionamento(await requisicao("/principal"), "/entrar")

    const falhou = await requisicao("/entrar", "", new URLSearchParams({ username: "outro", password: "senha-de-teste" }))
    verificarIgualdade(falhou.status, 200)
    verificarIgualdade(falhou.headers.get("set-cookie"), null)
    const html = await falhou.text()
    verificarIgualdade(html.includes("Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente."), true)
    verificarIgualdade(html.includes('value="outro"'), true)
    verificarIgualdade(html.includes('value="senha-de-teste"'), true)
    verificarIgualdade(/<button[^>]*type="submit"[^>]*disabled/.test(html), true)

    for (const nomeUsuario of ["usuario", "USUARIO", "  Usuario  "]) {
        const aceito = await requisicao("/entrar", "", new URLSearchParams({ username: nomeUsuario, password: "x" }))
        const cookie = aceito.headers.get("set-cookie")!.split(";")[0]
        await verificarRedirecionamento(aceito, "/principal")
        for (let recarregamento = 0; recarregamento < 2; recarregamento++) {
            const principal = await requisicao("/principal", cookie)
            verificarIgualdade(principal.status, 200)
            verificarIgualdade((await principal.text()).includes('aria-label="Sair"'), true)
        }
        await verificarRedirecionamento(await requisicao("/", cookie), "/principal")
        await verificarRedirecionamento(await requisicao("/entrar", cookie), "/principal")
        const saida = await requisicao("/principal", cookie, new URLSearchParams())
        verificarIgualdade(saida.headers.get("set-cookie")!.includes("Max-Age=0"), true)
        await verificarRedirecionamento(saida, "/")
        await verificarRedirecionamento(await requisicao("/principal"), "/entrar")
    }

    for (const [nomeUsuario, senha] of [["usu ario", "x"], ["usuario", "   "], ["   ", "x"]]) {
        const resposta = await requisicao("/entrar", "", new URLSearchParams({ username: nomeUsuario, password: senha }))
        verificarIgualdade(resposta.headers.get("set-cookie"), null)
        verificarIgualdade((await resposta.text()).includes("Não foi possível entrar."), true)
    }
})
