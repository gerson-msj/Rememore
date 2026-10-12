import type { ServicoAutenticacao, ServicoSessao } from "./autenticacao/contratos.ts"
import { autenticacaoSimulada, sessaoSimulada } from "./autenticacao/simulado.ts"
import type { ServicoCadastro, ServicoChavePendente, ServicoRedefinicaoSenha } from "./autenticacao/contratos.ts"
import { cadastroSimulado, chavePendenteSimulada, redefinicaoSenhaSimulada } from "./autenticacao/cadastroSimulado.ts"

// Ponto de composição: páginas e middleware dependem dos contratos, não dos mocks.
export const autenticacao: ServicoAutenticacao = autenticacaoSimulada
export const sessao: ServicoSessao = sessaoSimulada
export const cadastro: ServicoCadastro = cadastroSimulado
export const chavePendente: ServicoChavePendente = chavePendenteSimulada
export const redefinicaoSenha: ServicoRedefinicaoSenha = redefinicaoSenhaSimulada
