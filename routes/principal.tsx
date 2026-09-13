import { define } from "../utils.ts"
import Principal from "../islands/Principal.tsx"
import { session } from "../app/services/auth.ts"
import { principalCapabilities } from "../app/services/principal.ts"

export const handler = define.handlers({
    async GET(ctx) {
        const accountId = await session.accountId(ctx.req)
        if (!accountId) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        return { data: { capabilities: await principalCapabilities.read(ctx.req), accountId } }
    },
    async POST(ctx) {
        const headers = new Headers({ Location: "/" })
        await session.end(ctx.req, headers)
        return new Response(null, { status: 303, headers })
    }
})

export default define.page<typeof handler>(function PrincipalPage({ data }) {
    return <Principal {...data} />
})
