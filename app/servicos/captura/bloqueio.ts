export class BloqueioCapturaIndisponivel extends Error {
    constructor() {
        super("Bloqueio da captura indisponível")
    }
}

/** A página detém a posse até sair; operações em curso terminam antes da liberação explícita. */
export class PosseCaptura {
    private encerrando = false
    private emExecucao = 0

    constructor(private readonly desbloquear: () => void, private readonly liberado: Promise<void>) {}

    async executar<T>(operacao: () => Promise<T>): Promise<T> {
        if (this.encerrando) throw new BloqueioCapturaIndisponivel()
        this.emExecucao++
        try {
            return await operacao()
        } finally {
            this.emExecucao--
            if (this.encerrando && this.emExecucao === 0) this.desbloquear()
        }
    }

    liberar(): Promise<void> {
        this.encerrando = true
        if (this.emExecucao === 0) this.desbloquear()
        return this.liberado
    }
}

/** Sem fila de espera nem tomada forçada: a tentativa concorrente recebe null. */
export function adquirirBloqueioCaptura(
    idConta: string,
    dataCaptura: string,
    gerenciador: LockManager | undefined = globalThis.navigator?.locks
): Promise<PosseCaptura | null> {
    if (!gerenciador) return Promise.reject(new BloqueioCapturaIndisponivel())
    return new Promise((resolver, rejeitar) => {
        let desbloqueado!: () => void
        let finalizado!: () => void
        const retido = new Promise<void>((concluir) => desbloqueado = concluir)
        const liberado = new Promise<void>((concluir) => finalizado = concluir)
        try {
            void gerenciador.request(
                `rememore:capture:${JSON.stringify([idConta, dataCaptura])}`,
                { ifAvailable: true },
                async (bloqueio) => {
                    if (!bloqueio) {
                        resolver(null)
                        return
                    }
                    resolver(new PosseCaptura(desbloqueado, liberado))
                    await retido
                }
            ).then(finalizado, (erro) => {
                finalizado()
                rejeitar(erro)
            })
        } catch (erro) {
            finalizado()
            rejeitar(erro)
        }
    })
}
