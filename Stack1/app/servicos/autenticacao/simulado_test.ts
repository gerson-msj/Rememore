import { autenticacaoSimulada, sessaoSimulada } from "./simulado.ts"
import { normalizarNomeUsuario, temConteudoEntrada } from "../../utilitarios/entrada.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

Deno.test("Entrada: normalização, espaços e senha sem comprimento mínimo", async () => {
    for (const nomeUsuario of ["usuario", "USUARIO", "Usuario", "  Usuario  "]) {
        verificarIgualdade(normalizarNomeUsuario(nomeUsuario), "usuario")
        verificarIgualdade(
            await autenticacaoSimulada.authenticate({ username: normalizarNomeUsuario(nomeUsuario), password: "x" }),
            "accepted"
        )
    }
    for (const nomeUsuario of ["", "   ", "outro", "usu ario", "usu\tario"]) {
        verificarIgualdade(
            await autenticacaoSimulada.authenticate({ username: normalizarNomeUsuario(nomeUsuario), password: "x" }),
            "invalid"
        )
    }
    for (const senha of ["", "   ", "\t\n"]) {
        verificarIgualdade(temConteudoEntrada("usuario", senha), false)
        verificarIgualdade(await autenticacaoSimulada.authenticate({ username: "usuario", password: senha }), "invalid")
    }
    verificarIgualdade(temConteudoEntrada("   ", "senha"), false)
    verificarIgualdade(temConteudoEntrada("usuario", " x "), true)
})

Deno.test("Sessão simulada: requisições independentes, escopo e remoção", async () => {
    const requisicao = new Request("https://rememore.test/entrar")
    verificarIgualdade(await sessaoSimulada.isAuthenticated(requisicao), false)
    const cabecalhos = new Headers()
    await sessaoSimulada.establish(requisicao, cabecalhos)
    const cookie = cabecalhos.get("set-cookie")!
    verificarIgualdade(cookie.includes("HttpOnly"), true)
    verificarIgualdade(cookie.includes("Secure"), true)
    verificarIgualdade(cookie.includes("Path=/"), true)
    verificarIgualdade(cookie.includes("Max-Age"), false)
    verificarIgualdade(cookie.includes("Expires"), false)
    const autenticado = new Request("https://rememore.test/principal", { headers: { Cookie: cookie.split(";")[0] } })
    verificarIgualdade(await sessaoSimulada.isAuthenticated(autenticado), true)
    verificarIgualdade(
        await sessaoSimulada.isAuthenticated(
            new Request("https://rememore.test/principal", {
                headers: { Cookie: "other_rememore_mock_auth=authenticated; rememore_mock_auth=invalid" }
            })
        ),
        false
    )
    const saida = new Headers()
    await sessaoSimulada.end(autenticado, saida)
    verificarIgualdade(saida.get("set-cookie")!.includes("Max-Age=0"), true)
    verificarIgualdade(
        await sessaoSimulada.isAuthenticated(
            new Request("https://rememore.test/principal", {
                headers: { Cookie: saida.get("set-cookie")!.split(";")[0] }
            })
        ),
        false
    )
})
