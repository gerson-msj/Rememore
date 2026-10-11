import type { ServicoAutenticacao, ServicoSessao } from "./contratos.ts"
import { normalizarNomeUsuario, temConteudoEntrada } from "../../utilitarios/entrada.ts"

// Marcador deliberadamente simulado: não representa credencial ou política real de sessão.
const nomeCookie = "rememore_mock_auth"
const valorCookie = "authenticated"

function atributosCookie(requisicao: Request): string {
    return "; Path=/; HttpOnly; SameSite=Lax" + (new URL(requisicao.url).protocol === "https:" ? "; Secure" : "")
}

export const autenticacaoSimulada: ServicoAutenticacao = {
    authenticate({ username: nomeUsuario, password: senha }) {
        const aceito = temConteudoEntrada(nomeUsuario, senha) && normalizarNomeUsuario(nomeUsuario) === "usuario"
        return Promise.resolve(aceito ? "accepted" : "invalid")
    }
}

export const sessaoSimulada: ServicoSessao = {
    async accountId(requisicao) {
        return await sessaoSimulada.isAuthenticated(requisicao) ? "01K4Z5J6M7N8P9Q0R1S2T3V4W5" : null
    },
    isAuthenticated(requisicao) {
        const cookies = (requisicao.headers.get("cookie") ?? "").split(";")
        return Promise.resolve(cookies.some((cookie) => cookie.trim() === nomeCookie + "=" + valorCookie))
    },
    establish(requisicao, cabecalhos) {
        cabecalhos.append("Set-Cookie", nomeCookie + "=" + valorCookie + atributosCookie(requisicao))
        return Promise.resolve()
    },
    end(requisicao, cabecalhos) {
        cabecalhos.append("Set-Cookie", nomeCookie + "=" + atributosCookie(requisicao) + "; Max-Age=0")
        return Promise.resolve()
    }
}
