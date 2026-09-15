import { App, staticFiles } from "fresh"
import { definir, type Estado } from "./utilitarios.ts"

export const app = new App<Estado>()

app.use(staticFiles())

// Estado compartilhado entre os intermediários de requisição e as rotas.
app.use(async (contexto) => {
    contexto.state.compartilhado = "hello"
    return await contexto.next()
})

// Mantém a rota de exemplo equivalente à rota definida em arquivo.
app.get("/api2/:name", (contexto) => {
    const nome = contexto.params.name
    return new Response(
        `Hello, ${nome.charAt(0).toUpperCase() + nome.slice(1)}!`
    )
})

// O registro das requisições também cobre as rotas declaradas em arquivo.
const registrarRequisicao = definir.middleware((contexto) => {
    console.log(`${contexto.req.method} ${contexto.req.url}`)
    return contexto.next()
})
app.use(registrarRequisicao)

// As rotas em arquivo compartilham os intermediários registrados acima.
app.fsRoutes()
