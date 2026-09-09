import { define } from "../../utils.ts"
import { pendingKey, session } from "../../app/services/auth.ts"
import KeyConfirmation from "../../islands/KeyConfirmation.tsx"
import { passwordResetPendingStorage } from "../../app/utils/pendingKey.ts"

const home = () => new Response(null, { status: 303, headers: { Location: "/" } })

export const handler = define.handlers({
    async POST(ctx) {
        const form = await ctx.req.formData()
        const pendingId = form.get("pendingId")
        if (typeof pendingId !== "string") return home()
        if (form.get("intent") === "read") {
            const key = await pendingKey.read(pendingId, "passwordReset")
            return key ? Response.json({ key }) : home()
        }
        if (form.get("intent") !== "confirm" || !await pendingKey.consume(pendingId, "passwordReset")) return home()
        const headers = new Headers()
        await session.establish(ctx.req, headers)
        return new Response(null, { status: 204, headers })
    }
})

export default define.page(function ConfirmacaoRedefinicao() {
    return (
        <KeyConfirmation
            title="Senha redefinida"
            endpoint="/redefinir-senha/confirmacao"
            storageKey={passwordResetPendingStorage}
            message="Sua senha foi redefinida. Guarde esta nova chave: ela será necessária caso você precise redefinir sua senha novamente no futuro."
        />
    )
})
