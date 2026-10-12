import { useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import CampoSenha from "../components/CampoSenha.tsx"
import type { ErrosCadastro, ServicoCadastro } from "../app/servicos/autenticacao/contratos.ts"
import { temConteudoEntrada } from "../app/utilitarios/entrada.ts"
import { chaveArmazenamentoCadastroPendente } from "../app/utilitarios/chavePendente.ts"

const mensagens = {
    invitation: "Não foi possível usar este convite. Confira o código recebido e tente novamente.",
    username: "Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.",
    password: "A senha deve ter pelo menos 6 caracteres."
}

export default function Cadastro(propriedades: { invitation: string; readonly: boolean }) {
    const [valores, definirValores] = useState({ invitation: propriedades.invitation, username: "", password: "" })
    const [erros, definirErros] = useState<ErrosCadastro>({})
    const [ocupado, definirOcupado] = useState(false)
    const disponivel = temConteudoEntrada(valores.username, valores.password) && valores.invitation.trim().length > 0 && !ocupado
    function alterar(campo: keyof typeof valores, valor: string) {
        if (valores[campo] !== valor) definirErros((anterior) => ({ ...anterior, [campo]: false }))
        definirValores((anterior) => ({ ...anterior, [campo]: valor }))
    }
    return (
        <>
            <CabecalhoPagina titulo="Criar conta" aoVoltar={() => globalThis.location.assign("/")} />
            <main class="rememore-conteiner pagina-com-cabecalho">
                <form
                    class="entrada-formulario"
                    method="post"
                    onSubmit={async (evento) => {
                        evento.preventDefault()
                        if (!disponivel) return
                        const formulario = new FormData(evento.currentTarget)
                        definirOcupado(true)
                        try {
                            const resposta = await fetch(globalThis.location.pathname + globalThis.location.search, {
                                method: "POST",
                                body: formulario
                            })
                            if (resposta.redirected) {
                                globalThis.location.assign(resposta.url)
                                return
                            }
                            if (!resposta.ok) throw new Error("Cadastro: resposta inesperada")
                            const resultado: Awaited<ReturnType<ServicoCadastro["register"]>> = await resposta.json()
                            if (resultado.status === "invalid") definirErros(resultado.errors)
                            else {
                                sessionStorage.setItem(chaveArmazenamentoCadastroPendente, resultado.pendingId)
                                globalThis.location.assign("/cadastro/confirmacao")
                            }
                        } finally {
                            definirOcupado(false)
                        }
                    }}
                >
                    {(["invitation", "username"] as const).map((campo) => (
                        <div class="field" key={campo}>
                            <label class="label" for={`registration-${campo}`}>
                                {campo === "invitation" ? "Convite" : "Nome de usuário"}
                            </label>
                            <input
                                class={`input${erros[campo] ? " is-danger" : ""}`}
                                id={`registration-${campo}`}
                                name={campo}
                                value={valores[campo]}
                                readOnly={campo === "invitation" && propriedades.readonly}
                                autoComplete={campo === "username" ? "username" : "off"}
                                autoCapitalize="none"
                                spellcheck={false}
                                aria-invalid={!!erros[campo]}
                                aria-describedby={erros[campo] ? `registration-${campo}-error` : undefined}
                                onInput={(evento) => alterar(campo, evento.currentTarget.value)}
                            />
                            {erros[campo] && (
                                <p class="help is-danger" role="alert" id={`registration-${campo}-error`}>{mensagens[campo]}</p>
                            )}
                        </div>
                    ))}
                    <div class="field">
                        <label class="label" for="registration-password">Senha</label>
                        <CampoSenha
                            id="registration-password"
                            name="password"
                            value={valores.password}
                            autoComplete="new-password"
                            aoAlterarValor={(valor) => alterar("password", valor)}
                            descritoPor={erros.password ? "registration-password-error" : undefined}
                        />
                        {erros.password && <p class="help is-danger" role="alert" id="registration-password-error">{mensagens.password}</p>}
                    </div>
                    <div class="cadastro-avisos content">
                        <p>
                            Esta é uma versão experimental do Rememore. O sistema já pode ser utilizado, mas ainda está em desenvolvimento e
                            não podemos garantir a manutenção permanente dos dados nesta fase.
                        </p>
                        <p>
                            Suas memórias são pessoais. O conteúdo que você registra não fica disponível para leitura por outras pessoas nem
                            pelo administrador do Rememore.
                        </p>
                    </div>
                    <div class="entrada-acoes">
                        <button class="button is-primary" type="submit" disabled={!disponivel}>Criar conta</button>
                    </div>
                </form>
            </main>
        </>
    )
}
