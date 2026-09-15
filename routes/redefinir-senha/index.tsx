import { definir } from "../../utilitarios.ts"
import RedefinicaoSenha from "../../islands/RedefinicaoSenha.tsx"
import { redefinicaoSenha } from "../../app/servicos/autenticacao.ts"
import { normalizarNomeUsuario } from "../../app/utilitarios/entrada.ts"

export const handler = definir.handlers({
    GET(contexto) {
        return { data: { resetKey: contexto.url.searchParams.get("chave") ?? "" } }
    },
    async POST(contexto) {
        const formulario = await contexto.req.formData()
        const valor = (nome: string) => typeof formulario.get(nome) === "string" ? formulario.get(nome) as string : ""
        const senha = valor("password")
        // A mesma validação protege requisições diretas sem chamar o mock.
        if (senha.length < 6) return Response.json({ status: "invalidPassword" })
        return Response.json(
            await redefinicaoSenha.reset({
                username: normalizarNomeUsuario(valor("username")),
                key: valor("key"),
                password: senha
            })
        )
    }
})

export default definir.page<typeof handler>(function RedefinirSenha({ data: dados }) {
    return <RedefinicaoSenha resetKey={dados.resetKey} />
})
