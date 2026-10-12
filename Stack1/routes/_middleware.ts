import { definir } from "../utilitarios.ts"
import { sessao } from "../app/servicos/autenticacao.ts"
import { capacidadesPrincipal } from "../app/servicos/principal.ts"

export default definir.middleware(async (contexto) => {
    const caminho = contexto.url.pathname.replace(/\/$/, "") || "/"
    const areaAberta = ["/", "/entrar", "/cadastro", "/cadastro/confirmacao", "/redefinir-senha", "/redefinir-senha/confirmacao"].includes(
        caminho
    )
    const areaProtegida = caminho.startsWith("/capturar/") ||
        ["/principal", "/capturar", "/encontrar", "/rever", "/rememorar", "/conta", "/admin"].includes(caminho)
    if (!areaAberta && !areaProtegida) return await contexto.next()

    const autenticado = await sessao.isAuthenticated(contexto.req)
    if ((areaAberta && autenticado) || (areaProtegida && !autenticado)) {
        return new Response(null, {
            status: 303,
            headers: { Location: autenticado ? "/principal" : "/entrar", "Cache-Control": "no-store" }
        })
    }

    if (caminho === "/admin" && !(await capacidadesPrincipal.read(contexto.req)).canAdminister) {
        return new Response(null, { status: 303, headers: { Location: "/principal", "Cache-Control": "no-store" } })
    }

    const resposta = await contexto.next()
    resposta.headers.set("Cache-Control", "no-store")
    return resposta
})
