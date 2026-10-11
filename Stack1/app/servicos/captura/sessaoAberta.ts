interface RegistroSessaoCapturaAberta {
    workspaceId: string
}

/** O marcador não é pendência; somente o recarregamento o consome, nunca uma nova navegação. */
export class SessaoCapturaAberta {
    private readonly chave: string

    constructor(idConta: string, dataCaptura: string, private readonly armazenamento: Storage) {
        this.chave = `rememore:capture:open:v1:${JSON.stringify([idConta, dataCaptura])}`
    }

    retomar(tipoNavegacao: string): string | undefined {
        if (tipoNavegacao !== "reload") {
            this.encerrar()
            return undefined
        }
        const bruto = this.armazenamento.getItem(this.chave)
        if (!bruto) return undefined
        const sessao = JSON.parse(bruto) as RegistroSessaoCapturaAberta
        return typeof sessao.workspaceId === "string" ? sessao.workspaceId : undefined
    }

    iniciar(idAreaTrabalho: string): void {
        this.armazenamento.setItem(this.chave, JSON.stringify({ workspaceId: idAreaTrabalho }))
    }

    encerrar(): void {
        this.armazenamento.removeItem(this.chave)
    }
}
