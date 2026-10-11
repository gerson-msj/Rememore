import { definir } from "../../utilitarios.ts"
import Cadastro from "../../islands/Cadastro.tsx"
import { cadastro } from "../../app/servicos/autenticacao.ts"
import { normalizarNomeUsuario } from "../../app/utilitarios/entrada.ts"

export const handler = definir.handlers({
    GET(contexto) {
        return { data: { invitation: contexto.url.searchParams.get("convite") ?? "", readonly: contexto.url.searchParams.has("convite") } }
    },
    async POST(contexto) {
        const formulario = await contexto.req.formData()
        const valor = (nome: string) => typeof formulario.get(nome) === "string" ? formulario.get(nome) as string : ""
        return Response.json(
            await cadastro.register({
                invitation: contexto.url.searchParams.get("convite") ?? valor("invitation"),
                username: normalizarNomeUsuario(valor("username")),
                password: valor("password")
            })
        )
    }
})

export default definir.page<typeof handler>(function PaginaCadastro({ data: dados }) {
    return <Cadastro invitation={dados.invitation} readonly={dados.readonly} />
})
