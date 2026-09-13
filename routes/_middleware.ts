import { define } from "../utils.ts"
import { session } from "../app/services/auth.ts"
import { principalCapabilities } from "../app/services/principal.ts"

export default define.middleware(async (ctx) => {
    const path = ctx.url.pathname.replace(/\/$/, "") || "/"
    const openArea = ["/", "/entrar", "/cadastro", "/cadastro/confirmacao", "/redefinir-senha", "/redefinir-senha/confirmacao"].includes(
        path
    )
    const protectedArea = path.startsWith("/capturar/") ||
        ["/principal", "/capturar", "/encontrar", "/rever", "/rememorar", "/conta", "/admin"].includes(path)
    if (!openArea && !protectedArea) return await ctx.next()

    const authenticated = await session.isAuthenticated(ctx.req)
    if ((openArea && authenticated) || (protectedArea && !authenticated)) {
        return new Response(null, {
            status: 303,
            headers: { Location: authenticated ? "/principal" : "/entrar", "Cache-Control": "no-store" }
        })
    }

    if (path === "/admin" && !(await principalCapabilities.read(ctx.req)).canAdminister) {
        return new Response(null, { status: 303, headers: { Location: "/principal", "Cache-Control": "no-store" } })
    }

    const response = await ctx.next()
    response.headers.set("Cache-Control", "no-store")
    return response
})
