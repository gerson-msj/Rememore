import { definir } from "../utilitarios.ts"
import Principal from "../islands/Principal.tsx"
import { sessao } from "../app/servicos/autenticacao.ts"
import { capacidadesPrincipal } from "../app/servicos/principal.ts"

export const handler = definir.handlers({
    async GET(contexto) {
        const idConta = await sessao.accountId(contexto.req)
        if (!idConta) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        return { data: { capabilities: await capacidadesPrincipal.read(contexto.req), accountId: idConta } }
    },
    async POST(contexto) {
        const cabecalhos = new Headers({ Location: "/" })
        await sessao.end(contexto.req, cabecalhos)
        return new Response(null, { status: 303, headers: cabecalhos })
    }
})

export default definir.page<typeof handler>(function PaginaPrincipal({ data: dados }) {
    return <Principal {...dados} />
})
