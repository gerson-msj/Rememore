import { definir } from "../utilitarios.ts"
import EstruturaProtegida from "../islands/EstruturaProtegida.tsx"
import { sessao } from "../app/servicos/autenticacao.ts"

export const handler = definir.handlers({
    async GET(contexto) {
        const idConta = await sessao.accountId(contexto.req)
        if (!idConta) return new Response(null, { status: 303, headers: { Location: "/entrar" } })
        return { data: { accountId: idConta } }
    }
})

const DIAS_PRESERVADOS_MOCK = [
    "2025-01-01",
    "2025-01-06",
    "2025-01-08",
    "2025-01-27",
    "2025-01-30"
]

export default definir.page<typeof handler>(function PaginaRememorar({ data: dados }) {
    return (
        <EstruturaProtegida
            titulo="Rememorar"
            regiaoPrincipal="rememorar"
            diasPreservadosMock={DIAS_PRESERVADOS_MOCK}
            accountId={dados.accountId}
        />
    )
})
