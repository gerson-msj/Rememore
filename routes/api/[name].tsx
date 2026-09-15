import { definir } from "../../utilitarios.ts"

export const handler = definir.handlers({
    GET(contexto) {
        const nome = contexto.params.name
        return new Response(
            `Hello, ${nome.charAt(0).toUpperCase() + nome.slice(1)}!`
        )
    }
})
