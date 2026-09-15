import { definir } from "../../utilitarios.ts"
import { chavePendente, sessao } from "../../app/servicos/autenticacao.ts"
import ConfirmacaoChave from "../../islands/ConfirmacaoChave.tsx"
import { chaveArmazenamentoCadastroPendente } from "../../app/utilitarios/chavePendente.ts"

const inicio = () => new Response(null, { status: 303, headers: { Location: "/" } })

export const handler = definir.handlers({
    async POST(contexto) {
        const formulario = await contexto.req.formData()
        const idPendente = formulario.get("pendingId")
        if (typeof idPendente !== "string") return inicio()
        if (formulario.get("intent") === "read") {
            const chave = await chavePendente.read(idPendente, "registration")
            return chave ? Response.json({ key: chave }) : inicio()
        }
        if (formulario.get("intent") !== "confirm" || !await chavePendente.consume(idPendente, "registration")) return inicio()
        const cabecalhos = new Headers()
        await sessao.establish(contexto.req, cabecalhos)
        return new Response(null, { status: 204, headers: cabecalhos })
    }
})

export default definir.page(function ConfirmacaoCadastro() {
    return (
        <ConfirmacaoChave
            titulo="Conta criada"
            endereco="/cadastro/confirmacao"
            chaveArmazenamento={chaveArmazenamentoCadastroPendente}
            mensagem="Sua conta foi criada. Guarde esta chave: ela será necessária caso você precise redefinir sua senha no futuro."
        />
    )
})
