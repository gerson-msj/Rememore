import { mockPasswordReset, mockPendingKey, mockRegistration } from "./registrationMock.ts"

function equal(actual: unknown, expected: unknown) {
    if (actual !== expected) throw new Error(`Esperado ${expected}, recebido ${actual}`)
}

Deno.test("Cadastro: erros coexistem e nomes são normalizados", async () => {
    const invalid = await mockRegistration.register({ invitation: "outro", username: "usu ario", password: "123" })
    equal(invalid.status, "invalid")
    if (invalid.status !== "invalid") throw new Error("Cadastro deveria falhar")
    equal(invalid.errors.invitation, true)
    equal(invalid.errors.username, true)
    equal(invalid.errors.password, true)

    const accepted = await mockRegistration.register({ invitation: "usuario", username: "  USUARIO  ", password: "123456" })
    if (accepted.status !== "accepted") throw new Error("Cadastro deveria aceitar nome normalizado")
    equal(await mockPendingKey.consume(accepted.pendingId, "registration"), true)
})

Deno.test("Confirmação: origem isolada, leitura repetível e consumo único", async () => {
    const result = await mockPasswordReset.reset({ username: " USUARIO ", key: "usuario", password: "123456" })
    if (result.status !== "accepted") throw new Error("Redefinição deveria ser aceita")
    const key = await mockPendingKey.read(result.pendingId, "passwordReset")
    equal(typeof key, "string")
    equal(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(key!), true)
    equal(await mockPendingKey.read(result.pendingId, "passwordReset"), key)
    equal(await mockPendingKey.read(result.pendingId, "registration"), null)
    equal(await mockPendingKey.consume(result.pendingId, "registration"), false)
    equal(await mockPendingKey.read(result.pendingId, "passwordReset"), key)
    equal(await mockPendingKey.consume(result.pendingId, "passwordReset"), true)
    equal(await mockPendingKey.consume(result.pendingId, "passwordReset"), false)
    equal(await mockPendingKey.read(result.pendingId, "passwordReset"), null)

    const again = await mockPasswordReset.reset({ username: "usuario", key: "usuario", password: "abcdef" })
    if (again.status !== "accepted") throw new Error("Fixture deve continuar aceitando nova tentativa")
    equal(await mockPendingKey.read(again.pendingId, "passwordReset") === key, false)
    equal(await mockPendingKey.consume(again.pendingId, "passwordReset"), true)
})

Deno.test("Redefinição: comparação textual exata e falha sem motivo específico", async () => {
    for (
        const input of [
            { username: "usuario", key: " usuario" },
            { username: "usuario", key: "USUARIO" },
            { username: "usuario", key: "qualquer texto / ? 🔑" },
            { username: "outro", key: "usuario" },
            { username: "usu ario", key: "usuario" }
        ]
    ) {
        const result = await mockPasswordReset.reset({ ...input, password: "123456" })
        equal(JSON.stringify(result), JSON.stringify({ status: "invalid" }))
    }
})
