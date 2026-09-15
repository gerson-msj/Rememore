import { cadastroSimulado, chavePendenteSimulada, redefinicaoSenhaSimulada } from "./cadastroSimulado.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

Deno.test("Cadastro: erros coexistem e nomes são normalizados", async () => {
    const invalido = await cadastroSimulado.register({ invitation: "outro", username: "usu ario", password: "123" })
    verificarIgualdade(invalido.status, "invalid")
    if (invalido.status !== "invalid") throw new Error("Cadastro deveria falhar")
    verificarIgualdade(invalido.errors.invitation, true)
    verificarIgualdade(invalido.errors.username, true)
    verificarIgualdade(invalido.errors.password, true)

    const aceito = await cadastroSimulado.register({ invitation: "usuario", username: "  USUARIO  ", password: "123456" })
    if (aceito.status !== "accepted") throw new Error("Cadastro deveria aceitar nome normalizado")
    verificarIgualdade(await chavePendenteSimulada.consume(aceito.pendingId, "registration"), true)
})

Deno.test("Confirmação: origem isolada, leitura repetível e consumo único", async () => {
    const resultado = await redefinicaoSenhaSimulada.reset({ username: " USUARIO ", key: "usuario", password: "123456" })
    if (resultado.status !== "accepted") throw new Error("Redefinição deveria ser aceita")
    const chave = await chavePendenteSimulada.read(resultado.pendingId, "passwordReset")
    verificarIgualdade(typeof chave, "string")
    verificarIgualdade(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(chave!), true)
    verificarIgualdade(await chavePendenteSimulada.read(resultado.pendingId, "passwordReset"), chave)
    verificarIgualdade(await chavePendenteSimulada.read(resultado.pendingId, "registration"), null)
    verificarIgualdade(await chavePendenteSimulada.consume(resultado.pendingId, "registration"), false)
    verificarIgualdade(await chavePendenteSimulada.read(resultado.pendingId, "passwordReset"), chave)
    verificarIgualdade(await chavePendenteSimulada.consume(resultado.pendingId, "passwordReset"), true)
    verificarIgualdade(await chavePendenteSimulada.consume(resultado.pendingId, "passwordReset"), false)
    verificarIgualdade(await chavePendenteSimulada.read(resultado.pendingId, "passwordReset"), null)

    const novamente = await redefinicaoSenhaSimulada.reset({ username: "usuario", key: "usuario", password: "abcdef" })
    if (novamente.status !== "accepted") throw new Error("Cenário deve continuar aceitando nova tentativa")
    verificarIgualdade(await chavePendenteSimulada.read(novamente.pendingId, "passwordReset") === chave, false)
    verificarIgualdade(await chavePendenteSimulada.consume(novamente.pendingId, "passwordReset"), true)
})

Deno.test("Redefinição: comparação textual exata e falha sem motivo específico", async () => {
    for (
        const entrada of [
            { username: "usuario", key: " usuario" },
            { username: "usuario", key: "USUARIO" },
            { username: "usuario", key: "qualquer texto / ? 🔑" },
            { username: "outro", key: "usuario" },
            { username: "usu ario", key: "usuario" }
        ]
    ) {
        const resultado = await redefinicaoSenhaSimulada.reset({ ...entrada, password: "123456" })
        verificarIgualdade(JSON.stringify(resultado), JSON.stringify({ status: "invalid" }))
    }
})
