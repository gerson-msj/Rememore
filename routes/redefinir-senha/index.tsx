import { define } from "../../utils.ts"
import ResetPassword from "../../islands/ResetPassword.tsx"
import { passwordReset } from "../../app/services/auth.ts"
import { normalizeUsername } from "../../app/utils/login.ts"

export const handler = define.handlers({
    GET(ctx) {
        return { data: { resetKey: ctx.url.searchParams.get("chave") ?? "" } }
    },
    async POST(ctx) {
        const form = await ctx.req.formData()
        const value = (name: string) => typeof form.get(name) === "string" ? form.get(name) as string : ""
        const password = value("password")
        // A mesma validação protege requisições diretas sem chamar o mock.
        if (password.length < 6) return Response.json({ status: "invalidPassword" })
        return Response.json(
            await passwordReset.reset({
                username: normalizeUsername(value("username")),
                key: value("key"),
                password
            })
        )
    }
})

export default define.page<typeof handler>(function RedefinirSenha({ data }) {
    return <ResetPassword resetKey={data.resetKey} />
})
