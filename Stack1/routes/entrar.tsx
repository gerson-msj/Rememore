import { definir } from "../utilitarios.ts"
import Entrada from "../islands/Entrada.tsx"
import { autenticacao, sessao } from "../app/servicos/autenticacao.ts"
import { normalizarNomeUsuario } from "../app/utilitarios/entrada.ts"

export const handler = definir.handlers({
    GET() {
        return { data: { username: "", password: "", failed: false } }
    },
    async POST(contexto) {
        const formulario = await contexto.req.formData()
        const nomeUsuario = typeof formulario.get("username") === "string" ? formulario.get("username") as string : ""
        const senha = typeof formulario.get("password") === "string" ? formulario.get("password") as string : ""
        const resultado = await autenticacao.authenticate({ username: normalizarNomeUsuario(nomeUsuario), password: senha })
        if (resultado === "invalid") return { data: { username: nomeUsuario, password: senha, failed: true } }

        const cabecalhos = new Headers({ Location: "/principal" })
        await sessao.establish(contexto.req, cabecalhos)
        return new Response(null, { status: 303, headers: cabecalhos })
    }
})

export default definir.page<typeof handler>(function Entrar({ data: dados }) {
    return <Entrada {...dados} />
})
