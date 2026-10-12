import { adquirirBloqueioCaptura } from "../app/servicos/captura/bloqueio.ts"
import { SessaoCapturaAberta } from "../app/servicos/captura/sessaoAberta.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (obtido !== esperado) throw new Error(`Esperado ${esperado}, recebido ${obtido}`)
}

async function verificarRejeicao(operacao: () => Promise<unknown>) {
    let rejeitado = false
    try {
        await operacao()
    } catch {
        rejeitado = true
    }
    verificarIgualdade(rejeitado, true)
}

function gerenciadorBloqueios(): LockManager {
    const retido = new Set<string>()
    return {
        async request(nome: string, _opcoes: LockOptions, retorno: LockGrantedCallback<unknown>) {
            if (retido.has(nome)) return await retorno(null)
            retido.add(nome)
            try {
                return await retorno({ name: nome, mode: "exclusive" })
            } finally {
                retido.delete(nome)
            }
        }
    } as unknown as LockManager
}

Deno.test("bloqueio: mesma conta/data impedida; outras permitidas; liberação permite reabertura", async () => {
    const gerenciador = gerenciadorBloqueios()
    const primeiro = await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador)
    if (!primeiro) throw new Error("Bloqueio esperado")
    verificarIgualdade(await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador), null)
    const outraData = await adquirirBloqueioCaptura("a", "2026-09-02", gerenciador)
    const outraConta = await adquirirBloqueioCaptura("b", "2026-09-01", gerenciador)
    if (!outraData || !outraConta) throw new Error("Capturas independentes devem continuar disponíveis")
    await primeiro.liberar()
    const retomado = await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador)
    if (!retomado) throw new Error("Captura liberada deve reabrir")
    await retomado.liberar()
    await outraData.liberar()
    await outraConta.liberar()
})

Deno.test("bloqueio: liberação aguarda operação em curso e rejeita gravações da página encerrada", async () => {
    const gerenciador = gerenciadorBloqueios()
    const posse = await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador)
    if (!posse) throw new Error("Bloqueio esperado")
    let finalizar!: () => void
    const pendentes = new Promise<void>((resolver) => finalizar = resolver)
    let gravacoes = 0
    const operacao = posse.executar(async () => {
        await pendentes
        gravacoes++
    })
    const liberando = posse.liberar()
    await verificarRejeicao(() => posse.executar(() => Promise.resolve(gravacoes++)))
    verificarIgualdade(await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador), null)
    finalizar()
    await operacao
    await liberando
    verificarIgualdade(gravacoes, 1)
    const proximo = await adquirirBloqueioCaptura("a", "2026-09-01", gerenciador)
    if (!proximo) throw new Error("Bloqueio esperado após confirmar a transação")
    await verificarRejeicao(() => proximo.executar(() => Promise.reject(new Error("Transação rejeitada"))))
    await proximo.liberar()
})

Deno.test("bloqueio: indisponibilidade ou recusa do gerenciador nativo impede gravações desprotegidas", async () => {
    await verificarRejeicao(() =>
        adquirirBloqueioCaptura("a", "2026-09-01", { request: () => Promise.reject(new Error("Acesso negado")) } as unknown as LockManager)
    )
    await verificarRejeicao(() =>
        adquirirBloqueioCaptura("a", "2026-09-01", {
            request: () => {
                throw new Error("Acesso negado")
            }
        } as unknown as LockManager)
    )
})

class ArmazenamentoEmMemoria implements Storage {
    private itens = new Map<string, string>()
    get length() {
        return this.itens.size
    }
    clear() {
        this.itens.clear()
    }
    getItem(chave: string) {
        return this.itens.get(chave) ?? null
    }
    key(indice: number) {
        return [...this.itens.keys()][indice] ?? null
    }
    removeItem(chave: string) {
        this.itens.delete(chave)
    }
    setItem(chave: string, valor: string) {
        this.itens.set(chave, valor)
    }
}

Deno.test("sessão aberta: recarregamento retoma; entrada pela seleção e retorno do navegador encerram a anterior", () => {
    const armazenamento = new ArmazenamentoEmMemoria()
    const sessao = new SessaoCapturaAberta("a", "2026-09-01", armazenamento)
    verificarIgualdade(sessao.retomar("reload"), undefined)
    sessao.iniciar("workspace-X")
    verificarIgualdade(new SessaoCapturaAberta("a", "2026-09-01", armazenamento).retomar("reload"), "workspace-X")
    verificarIgualdade(new SessaoCapturaAberta("a", "2026-09-02", armazenamento).retomar("reload"), undefined)
    verificarIgualdade(new SessaoCapturaAberta("b", "2026-09-01", armazenamento).retomar("reload"), undefined)
    verificarIgualdade(sessao.retomar("navigate"), undefined)
    verificarIgualdade(sessao.retomar("reload"), undefined)
    sessao.iniciar("workspace-X")
    verificarIgualdade(sessao.retomar("back_forward"), undefined)
    verificarIgualdade(sessao.retomar("reload"), undefined)
    sessao.iniciar("workspace-X")
    sessao.encerrar()
    verificarIgualdade(sessao.retomar("reload"), undefined)
})

Deno.test("sessão aberta: armazenamento inacessível propaga falha e não alega proteção", async () => {
    const armazenamento = new ArmazenamentoEmMemoria()
    armazenamento.setItem = () => {
        throw new Error("Falha de quota")
    }
    const sessao = new SessaoCapturaAberta("a", "2026-09-01", armazenamento)
    await verificarRejeicao(() => Promise.resolve(sessao.iniciar("workspace-X")))
    verificarIgualdade(sessao.retomar("reload"), undefined)
})
