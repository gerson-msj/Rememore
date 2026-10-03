import type { BlocoProjecaoRememorar } from "../local/projecaoRememorar.ts"
import { type CenarioAcervoRememorar, obterCenarioAcervoRememorar, projetarDiaAcervoRememorar } from "./acervo.ts"
import type { ServicoProjecaoRemota } from "./contratos.ts"

interface EstadoSimulado {
    revisao: number
    blocos: Record<string, BlocoProjecaoRememorar>
    ultimaRevisao: Record<string, number>
    falhar?: boolean
}

type ArmazenamentoSimulado = {
    ler(idConta: string): EstadoSimulado
    gravar(idConta: string, estado: EstadoSimulado): void
    cenario(): 2 | 7 | 30 | 300
}

function clonar<T>(valor: T): T {
    return structuredClone(valor)
}

export function criarProjecaoRemotaSimulada(armazenamento: ArmazenamentoSimulado): ServicoProjecaoRemota {
    function lerEstado(idConta: string): EstadoSimulado {
        const existente = armazenamento.ler(idConta)
        if (existente.revisao > 0) return existente
        const cenario = obterCenarioAcervoRememorar(armazenamento.cenario())
        const blocos: Record<string, BlocoProjecaoRememorar> = {}
        for (const data of cenario.dias) blocos[data] = projetarDiaAcervoRememorar(idConta, cenario, data)
        const inicial: EstadoSimulado = {
            revisao: 1,
            blocos,
            ultimaRevisao: Object.fromEntries(cenario.dias.map((data) => [data, 1]))
        }
        armazenamento.gravar(idConta, inicial)
        return inicial
    }

    return {
        consultar(idConta, revisaoConhecida) {
            return Promise.resolve().then(() => {
                const estado = lerEstado(idConta)
                if (estado.falhar) throw new Error("Projeção remota simulada indisponível")
                if (revisaoConhecida === null) {
                    return { tipo: "completa", revisao: String(estado.revisao), blocos: clonar(Object.values(estado.blocos)) }
                }
                const conhecida = Number(revisaoConhecida)
                if (!Number.isSafeInteger(conhecida) || conhecida < 0 || conhecida > estado.revisao) {
                    throw new Error("Revisão de projeção desconhecida")
                }
                if (conhecida === estado.revisao) return { tipo: "atualizada", revisao: String(estado.revisao) }
                const alteradas: BlocoProjecaoRememorar[] = []
                const removidas: string[] = []
                for (const [data, revisao] of Object.entries(estado.ultimaRevisao)) {
                    if (revisao <= conhecida) continue
                    const bloco = estado.blocos[data]
                    if (bloco) alteradas.push(clonar(bloco))
                    else removidas.push(data)
                }
                return { tipo: "incremental", revisao: String(estado.revisao), blocos: alteradas, removidas }
            })
        },
        reconstruir(idConta) {
            return Promise.resolve().then(() => {
                const estado = lerEstado(idConta)
                if (estado.falhar) throw new Error("Projeção remota simulada indisponível")
                return { revisao: String(estado.revisao), blocos: clonar(Object.values(estado.blocos)) }
            })
        }
    }
}

const desenvolvimento = import.meta.env?.DEV && typeof window !== "undefined"
const chaveEstado = (idConta: string) => `rememore:dev:projecao:${idConta}`
const chaveCenario = "rememore:dev:projecao:cenario"
const armazenamentoNavegador: ArmazenamentoSimulado = {
    ler(idConta) {
        const salvo = desenvolvimento ? localStorage.getItem(chaveEstado(idConta)) : null
        return salvo ? JSON.parse(salvo) : { revisao: 0, blocos: {}, ultimaRevisao: {} }
    },
    gravar(idConta, estado) {
        if (desenvolvimento) localStorage.setItem(chaveEstado(idConta), JSON.stringify(estado))
    },
    cenario() {
        const valor = desenvolvimento ? Number(localStorage.getItem(chaveCenario)) : 30
        return valor === 2 || valor === 7 || valor === 30 || valor === 300 ? valor : 30
    }
}

export const projecaoRemotaSimulada = criarProjecaoRemotaSimulada(armazenamentoNavegador)

function alterarEstado(idConta: string, alterar: (estado: EstadoSimulado) => void) {
    const estado = armazenamentoNavegador.ler(idConta)
    if (estado.revisao === 0) {
        const cenario: CenarioAcervoRememorar = obterCenarioAcervoRememorar(armazenamentoNavegador.cenario())
        estado.revisao = 1
        for (const data of cenario.dias) {
            estado.blocos[data] = projetarDiaAcervoRememorar(idConta, cenario, data)
            estado.ultimaRevisao[data] = 1
        }
    }
    alterar(estado)
    armazenamentoNavegador.gravar(idConta, estado)
}

if (desenvolvimento) {
    Object.assign(globalThis, {
        rememoreRememorarMock: {
            selecionarCenario(quantidade: 2 | 7 | 30 | 300) {
                localStorage.setItem(chaveCenario, String(quantidade))
                const chavesEstado = Object.keys(localStorage).filter((chave) => chave.startsWith("rememore:dev:projecao:"))
                for (const chave of chavesEstado) localStorage.removeItem(chave)
            },
            alterarData(idConta: string, data: string, bloco?: BlocoProjecaoRememorar) {
                alterarEstado(idConta, (estado) => {
                    estado.revisao++
                    estado.ultimaRevisao[data] = estado.revisao
                    if (bloco) estado.blocos[data] = { ...clonar(bloco), idConta, data }
                    else if (estado.blocos[data]) {
                        estado.blocos[data] = { ...estado.blocos[data], categorias: structuredClone(estado.blocos[data].categorias) }
                    } else {
                        estado.blocos[data] = { idConta, data, categorias: [{ idCategoria: "categoria-01", tons: [null] }] }
                    }
                })
            },
            removerData(idConta: string, data: string) {
                alterarEstado(idConta, (estado) => {
                    estado.revisao++
                    estado.ultimaRevisao[data] = estado.revisao
                    delete estado.blocos[data]
                })
            },
            falhar(idConta: string, falhar = true) {
                alterarEstado(idConta, (estado) => estado.falhar = falhar)
            }
        }
    })
}
