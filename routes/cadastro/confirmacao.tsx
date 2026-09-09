import { define } from "../../utils.ts"
import { pendingKey, session } from "../../app/services/auth.ts"
import KeyConfirmation from "../../islands/KeyConfirmation.tsx"
import { registrationPendingStorage } from "../../app/utils/pendingKey.ts"

const home = () => new Response(null, { status: 303, headers: { Location: "/" } })

export const handler = define.handlers({
    async POST(ctx) {
        const form = await ctx.req.formData()
        const pendingId = form.get("pendingId")
        if (typeof pendingId !== "string") return home()
        if (form.get("intent") === "read") {
            const key = await pendingKey.read(pendingId, "registration")
            return key ? Response.json({ key }) : home()
        }
        if (form.get("intent") !== "confirm" || !await pendingKey.consume(pendingId, "registration")) return home()
        const headers = new Headers()
        await session.establish(ctx.req, headers)
        return new Response(null, { status: 204, headers })
    }
})

export default define.page(function ConfirmacaoCadastro() {
    return (
        <KeyConfirmation
            title="Conta criada"
            endpoint="/cadastro/confirmacao"
            storageKey={registrationPendingStorage}
            message="Sua conta foi criada. Guarde esta chave: ela será necessária caso você precise redefinir sua senha no futuro."
        />
    )
})
