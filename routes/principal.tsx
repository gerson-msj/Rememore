import { define } from "../utils.ts"
import Principal from "../islands/Principal.tsx"
import { session } from "../app/services/auth.ts"

export const handler = define.handlers({
    async POST(ctx) {
        const headers = new Headers({ Location: "/" })
        await session.end(ctx.req, headers)
        return new Response(null, { status: 303, headers })
    }
})

export default define.page(function PrincipalPage() {
    return <Principal />
})
