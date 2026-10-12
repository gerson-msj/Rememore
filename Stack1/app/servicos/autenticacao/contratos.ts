export interface Credenciais {
    username: string
    password: string
}

export type ResultadoAutenticacao = "accepted" | "invalid"

export interface ServicoAutenticacao {
    authenticate(credenciais: Credenciais): Promise<ResultadoAutenticacao>
}

export interface ServicoSessao {
    accountId(requisicao: Request): Promise<string | null>
    isAuthenticated(requisicao: Request): Promise<boolean>
    establish(requisicao: Request, cabecalhos: Headers): Promise<void>
    end(requisicao: Request, cabecalhos: Headers): Promise<void>
}

export type ErrosCadastro = Partial<Record<"invitation" | "username" | "password", boolean>>
export interface ServicoCadastro {
    register(entrada: Credenciais & { invitation: string }): Promise<
        { status: "accepted"; pendingId: string } | { status: "invalid"; errors: ErrosCadastro }
    >
}

export interface ServicoChavePendente {
    read(idPendente: string, operacao: OperacaoChave): Promise<string | null>
    consume(idPendente: string, operacao: OperacaoChave): Promise<boolean>
}

export type OperacaoChave = "registration" | "passwordReset"

export interface ServicoRedefinicaoSenha {
    reset(entrada: Credenciais & { key: string }): Promise<
        { status: "accepted"; pendingId: string } | { status: "invalid" }
    >
}
