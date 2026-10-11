import type { ErrosCadastro, OperacaoChave, ServicoCadastro, ServicoChavePendente, ServicoRedefinicaoSenha } from "./contratos.ts"
import { normalizarNomeUsuario } from "../../utilitarios/entrada.ts"

// Contextos transitórios do mock: não são contas nem um repositório de chaves recuperáveis.
const pendentes = new Map<string, { key: string; operation: OperacaoChave }>()

function emitirChavePendente(operacao: OperacaoChave): string {
    const idPendente = crypto.randomUUID()
    pendentes.set(idPendente, { key: crypto.randomUUID(), operation: operacao })
    return idPendente
}

export const cadastroSimulado: ServicoCadastro = {
    register({ invitation: convite, username: nomeUsuario, password: senha }) {
        const erros: ErrosCadastro = {}
        if (convite !== "usuario") erros.invitation = true
        if (normalizarNomeUsuario(nomeUsuario) !== "usuario") erros.username = true
        if (senha.length < 6) erros.password = true
        if (Object.keys(erros).length) return Promise.resolve({ status: "invalid", errors: erros })
        const idPendente = emitirChavePendente("registration")
        return Promise.resolve({ status: "accepted", pendingId: idPendente })
    }
}

export const chavePendenteSimulada: ServicoChavePendente = {
    read(idPendente, operacao) {
        const contexto = pendentes.get(idPendente)
        return Promise.resolve(contexto?.operation === operacao ? contexto.key : null)
    },
    consume(idPendente, operacao) {
        return Promise.resolve(pendentes.get(idPendente)?.operation === operacao && pendentes.delete(idPendente))
    }
}

export const redefinicaoSenhaSimulada: ServicoRedefinicaoSenha = {
    reset({ username: nomeUsuario, key: chave }) {
        if (normalizarNomeUsuario(nomeUsuario) !== "usuario" || chave !== "usuario") return Promise.resolve({ status: "invalid" })
        return Promise.resolve({ status: "accepted", pendingId: emitirChavePendente("passwordReset") })
    }
}
