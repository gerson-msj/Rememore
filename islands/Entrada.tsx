import { useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import CampoSenha from "../components/CampoSenha.tsx"
import { temConteudoEntrada } from "../app/utilitarios/entrada.ts"

export interface PropriedadesEntrada {
    username: string
    password: string
    failed: boolean
}

export default function Entrada({ username: nomeUsuarioInicial, password: senhaInicial, failed: falhou }: PropriedadesEntrada) {
    const [nomeUsuario, definirNomeUsuario] = useState(nomeUsuarioInicial)
    const [senha, definirSenha] = useState(senhaInicial)
    const [invalido, definirInvalido] = useState(falhou)
    const disponivel = !invalido && temConteudoEntrada(nomeUsuario, senha)

    function alterarNomeUsuario(valor: string) {
        if (valor !== nomeUsuario) definirInvalido(false)
        definirNomeUsuario(valor)
    }

    function alterarSenha(valor: string) {
        if (valor !== senha) definirInvalido(false)
        definirSenha(valor)
    }

    return (
        <>
            <CabecalhoPagina titulo="Entrar" aoVoltar={() => globalThis.location.assign("/")} />
            <main class="rememore-conteiner pagina-com-cabecalho">
                <form
                    class="entrada-formulario"
                    method="post"
                    action="/entrar"
                    onSubmit={(evento) => {
                        if (!disponivel) evento.preventDefault()
                    }}
                >
                    <div class="field">
                        <label class="label" for="login-username">Nome de usuário</label>
                        <input
                            class="input"
                            id="login-username"
                            name="username"
                            autoComplete="username"
                            autoCapitalize="none"
                            spellcheck={false}
                            value={nomeUsuario}
                            aria-describedby={invalido ? "login-error" : undefined}
                            onInput={(evento) => alterarNomeUsuario(evento.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="login-password">Senha</label>
                        <CampoSenha
                            id="login-password"
                            name="password"
                            value={senha}
                            aoAlterarValor={alterarSenha}
                            descritoPor={invalido ? "login-error" : undefined}
                        />
                    </div>
                    <div class="entrada-acoes">
                        <button class="button is-primary" type="submit" disabled={!disponivel}>Entrar</button>
                        <a href="/redefinir-senha">Redefinir senha</a>
                    </div>
                    {invalido && (
                        <p id="login-error" class="help is-danger entrada-erro" role="alert">
                            Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.
                        </p>
                    )}
                </form>
            </main>
        </>
    )
}
