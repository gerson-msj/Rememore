import { define } from "../utils.ts"
import { session } from "../app/services/auth.ts"

export default define.middleware(async (ctx) => {
    const path = ctx.url.pathname.replace(/\/$/, "") || "/"
    const openArea = ["/", "/entrar", "/cadastro", "/cadastro/confirmacao", "/redefinir-senha", "/redefinir-senha/confirmacao"].includes(
        path
    )
    if (!openArea && path !== "/principal") return await ctx.next()

    const authenticated = await session.isAuthenticated(ctx.req)
    if ((openArea && authenticated) || (path === "/principal" && !authenticated)) {
        return new Response(null, {
            status: 303,
            headers: { Location: authenticated ? "/principal" : "/entrar", "Cache-Control": "no-store" }
        })
    }

    const response = await ctx.next()
    response.headers.set("Cache-Control", "no-store")
    return response
})
