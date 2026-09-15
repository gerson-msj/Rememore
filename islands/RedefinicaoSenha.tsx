import { useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import CampoSenha from "../components/CampoSenha.tsx"
import type { ServicoRedefinicaoSenha } from "../app/servicos/autenticacao/contratos.ts"
import { temConteudoEntrada } from "../app/utilitarios/entrada.ts"
import { chaveArmazenamentoRedefinicaoPendente } from "../app/utilitarios/chavePendente.ts"

export default function RedefinicaoSenha({ resetKey: chaveRedefinicao }: { resetKey: string }) {
    const [nomeUsuario, definirNomeUsuario] = useState("")
    const [chave, definirChave] = useState(chaveRedefinicao)
    const [senha, definirSenha] = useState("")
    const [senhaInvalida, definirSenhaInvalida] = useState(false)
    const [rejeitado, definirRejeitado] = useState(false)
    const [ocupado, definirOcupado] = useState(false)
    const disponivel = temConteudoEntrada(nomeUsuario, senha) && chave.length > 0 && !ocupado

    return (
        <>
            <CabecalhoPagina titulo="Redefinir senha" aoVoltar={() => globalThis.location.assign("/entrar")} />
            <main class="rememore-conteiner pagina-com-cabecalho">
                <form
                    class="entrada-formulario"
                    method="post"
                    action="/redefinir-senha"
                    onSubmit={async (evento) => {
                        evento.preventDefault()
                        if (!disponivel) return
                        if (senha.length < 6) {
                            definirSenhaInvalida(true)
                            return
                        }
                        const formulario = new FormData(evento.currentTarget)
                        definirOcupado(true)
                        try {
                            const resposta = await fetch("/redefinir-senha", { method: "POST", body: formulario })
                            if (resposta.redirected) {
                                globalThis.location.assign(resposta.url)
                                return
                            }
                            if (!resposta.ok) throw new Error("Redefinição: resposta inesperada")
                            const resultado: Awaited<ReturnType<ServicoRedefinicaoSenha["reset"]>> | { status: "invalidPassword" } =
                                await resposta.json()
                            if (resultado.status === "invalidPassword") definirSenhaInvalida(true)
                            else if (resultado.status === "invalid") definirRejeitado(true)
                            else {
                                sessionStorage.setItem(chaveArmazenamentoRedefinicaoPendente, resultado.pendingId)
                                globalThis.location.assign("/redefinir-senha/confirmacao")
                            }
                        } finally {
                            definirOcupado(false)
                        }
                    }}
                >
                    <div class="field">
                        <label class="label" for="reset-username">Nome de usuário</label>
                        <input
                            class="input"
                            id="reset-username"
                            name="username"
                            value={nomeUsuario}
                            autoComplete="username"
                            autoCapitalize="none"
                            spellcheck={false}
                            aria-describedby={rejeitado ? "reset-error" : undefined}
                            onInput={(evento) => {
                                const valor = evento.currentTarget.value
                                if (valor !== nomeUsuario) definirRejeitado(false)
                                definirNomeUsuario(valor)
                            }}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="reset-key">Chave de redefinição</label>
                        <input
                            class="input"
                            id="reset-key"
                            name="key"
                            value={chave}
                            autoComplete="off"
                            autoCapitalize="none"
                            spellcheck={false}
                            aria-describedby={rejeitado ? "reset-error" : undefined}
                            onInput={(evento) => {
                                const valor = evento.currentTarget.value
                                if (valor !== chave) definirRejeitado(false)
                                definirChave(valor)
                            }}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="reset-password">Nova senha</label>
                        <CampoSenha
                            id="reset-password"
                            name="password"
                            value={senha}
                            autoComplete="new-password"
                            descritoPor={senhaInvalida ? "reset-password-error" : undefined}
                            aoAlterarValor={(valor) => {
                                if (valor !== senha) definirSenhaInvalida(false)
                                definirSenha(valor)
                            }}
                        />
                        {senhaInvalida && (
                            <p class="help is-danger" role="alert" id="reset-password-error">
                                A senha deve ter pelo menos 6 caracteres.
                            </p>
                        )}
                    </div>
                    <div class="entrada-acoes">
                        <button class="button is-primary" type="submit" disabled={!disponivel}>Redefinir senha</button>
                    </div>
                    {rejeitado && (
                        <p class="help is-danger entrada-erro" role="alert" id="reset-error">
                            Não foi possível redefinir a senha. Confira as informações e tente novamente.
                        </p>
                    )}
                </form>
            </main>
        </>
    )
}
