// Executar após deno task build: deno test -A tests/estruturas_principal_test.ts
import servidor from "../_fresh/server.js"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

function requisicao(caminho: string, cookie = "") {
    return servidor.fetch(new Request("http://localhost" + caminho, { headers: { Cookie: cookie } })) as Promise<Response>
}

async function verificarRedirecionamento(resposta: Response, alvo: string) {
    verificarIgualdade(resposta.status, 303)
    verificarIgualdade(resposta.headers.get("location"), alvo)
    await resposta.body?.cancel()
}

Deno.test("HTTP: cascas da Principal respeitam sessão e autorização administrativa do cenário", async () => {
    const estruturas = [
        ["/capturar", "Capturar"],
        ["/capturar/2026-09-01", "Capturar"],
        ["/encontrar", "Encontrar Memórias"],
        ["/rever", "Rever um Dia"],
        ["/rememorar", "Rememorar"],
        ["/conta", "Minha Conta e Meus Dados"],
        ["/admin", "Administração"]
    ] as const

    for (const [caminho] of estruturas) {
        await verificarRedirecionamento(await requisicao(caminho), "/entrar")
    }

    const entrada = await servidor.fetch(
        new Request("http://localhost/entrar", {
            method: "POST",
            body: new URLSearchParams({ username: "usuario", password: "x" })
        })
    ) as Response
    const cookie = entrada.headers.get("set-cookie")!.split(";")[0]
    await verificarRedirecionamento(entrada, "/principal")

    for (const [caminho, titulo] of estruturas) {
        const resposta = await requisicao(caminho, cookie)
        verificarIgualdade(resposta.status, 200)
        verificarIgualdade(resposta.headers.get("cache-control"), "no-store")
        const html = await resposta.text()
        verificarIgualdade(html.includes(`>${titulo}</h2>`), true)
        verificarIgualdade(html.includes('aria-label="Voltar"'), true)
        verificarIgualdade(html.includes('aria-label="Sair"'), true)
    }

    const principal = await requisicao("/principal", cookie)
    verificarIgualdade(principal.status, 200)
    verificarIgualdade((await principal.text()).includes("Minha Conta e Meus Dados"), true)
    for (const dataCaptura of ["2026-02-29", "2026-09", "invalida"]) {
        await verificarRedirecionamento(await requisicao(`/capturar/${dataCaptura}`, cookie), "/capturar?data-invalida")
    }
    const dia = await requisicao("/capturar/2026-09-01", cookie)
    const html = await dia.text()
    verificarIgualdade(html.includes("Preparando captura"), true)
    verificarIgualdade(html.includes(">Marcar como alterada</button>"), false)
})
