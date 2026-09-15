import { definir } from "../../utilitarios.ts"
import { chavePendente, sessao } from "../../app/servicos/autenticacao.ts"
import ConfirmacaoChave from "../../islands/ConfirmacaoChave.tsx"
import { chaveArmazenamentoRedefinicaoPendente } from "../../app/utilitarios/chavePendente.ts"

const inicio = () => new Response(null, { status: 303, headers: { Location: "/" } })

export const handler = definir.handlers({
    async POST(contexto) {
        const formulario = await contexto.req.formData()
        const idPendente = formulario.get("pendingId")
        if (typeof idPendente !== "string") return inicio()
        if (formulario.get("intent") === "read") {
            const chave = await chavePendente.read(idPendente, "passwordReset")
            return chave ? Response.json({ key: chave }) : inicio()
        }
        if (formulario.get("intent") !== "confirm" || !await chavePendente.consume(idPendente, "passwordReset")) return inicio()
        const cabecalhos = new Headers()
        await sessao.establish(contexto.req, cabecalhos)
        return new Response(null, { status: 204, headers: cabecalhos })
    }
})

export default definir.page(function ConfirmacaoRedefinicao() {
    return (
        <ConfirmacaoChave
            titulo="Senha redefinida"
            endereco="/redefinir-senha/confirmacao"
            chaveArmazenamento={chaveArmazenamentoRedefinicaoPendente}
            mensagem="Sua senha foi redefinida. Guarde esta nova chave: ela será necessária caso você precise redefinir sua senha novamente no futuro."
        />
    )
})
