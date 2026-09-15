import { definir } from "../../utilitarios.ts"
import { sessao } from "../../app/servicos/autenticacao.ts"
import { ehDataCaptura } from "../../app/utilitarios/dataCaptura.ts"
import CapturaDia from "../../islands/CapturaDia.tsx"

export const handler = definir.handlers({
    async GET(contexto) {
        const idConta = await sessao.accountId(contexto.req)
        if (!idConta) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        const dataCaptura = contexto.params.data
        // O servidor valida o calendário; a data de hoje pertence ao calendário civil do navegador.
        if (!ehDataCaptura(dataCaptura, "9999-12-31")) {
            return new Response(null, { status: 303, headers: { Location: "/capturar?data-invalida" } })
        }
        return { data: { accountId: idConta, date: dataCaptura } }
    }
})

export default definir.page<typeof handler>(function PaginaCapturaDia({ data: dados }) {
    return <CapturaDia {...dados} />
})
