import { definir } from "../utilitarios.ts"
import SelecaoCaptura from "../islands/SelecaoCaptura.tsx"
import { sessao } from "../app/servicos/autenticacao.ts"

export const handler = definir.handlers({
    async GET(contexto) {
        const idConta = await sessao.accountId(contexto.req)
        if (!idConta) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        return { data: { accountId: idConta } }
    }
})

export default definir.page<typeof handler>(function PaginaCapturar({ data: dados }) {
    return <SelecaoCaptura accountId={dados.accountId} />
})
