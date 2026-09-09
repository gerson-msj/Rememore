import { define } from "../utils.ts"
import Login from "../islands/Login.tsx"
import { authentication, session } from "../app/services/auth.ts"
import { normalizeUsername } from "../app/utils/login.ts"

export const handler = define.handlers({
    GET() {
        return { data: { username: "", password: "", failed: false } }
    },
    async POST(ctx) {
        const form = await ctx.req.formData()
        const username = typeof form.get("username") === "string" ? form.get("username") as string : ""
        const password = typeof form.get("password") === "string" ? form.get("password") as string : ""
        const result = await authentication.authenticate({ username: normalizeUsername(username), password })
        if (result === "invalid") return { data: { username, password, failed: true } }

        const headers = new Headers({ Location: "/principal" })
        await session.establish(ctx.req, headers)
        return new Response(null, { status: 303, headers })
    }
})

export default define.page<typeof handler>(function Entrar({ data }) {
    return <Login {...data} />
})
