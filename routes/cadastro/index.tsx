import { define } from "../../utils.ts"
import Registration from "../../islands/Registration.tsx"
import { registration } from "../../app/services/auth.ts"
import { normalizeUsername } from "../../app/utils/login.ts"

export const handler = define.handlers({
    GET(ctx) {
        return { data: { invitation: ctx.url.searchParams.get("convite") ?? "", readonly: ctx.url.searchParams.has("convite") } }
    },
    async POST(ctx) {
        const form = await ctx.req.formData()
        const value = (name: string) => typeof form.get(name) === "string" ? form.get(name) as string : ""
        return Response.json(
            await registration.register({
                invitation: ctx.url.searchParams.get("convite") ?? value("invitation"),
                username: normalizeUsername(value("username")),
                password: value("password")
            })
        )
    }
})

export default define.page<typeof handler>(function Cadastro({ data }) {
    return <Registration invitation={data.invitation} readonly={data.readonly} />
})
