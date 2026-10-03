import type { BlocoProjecaoRememorar } from "../local/projecaoRememorar.ts"
import { type CenarioAcervoRememorar, obterCenarioAcervoRememorar, projetarDiaAcervoRememorar } from "./acervo.ts"
import type { ServicoProjecaoRemota } from "./contratos.ts"

interface EstadoSimulado {
    revisao: number
    blocos: Record<string, BlocoProjecaoRememorar>
    ultimaRevisao: Record<string, number>
    cenario?: 2 | 7 | 30 | 300
    falhar?: boolean
}

export type CenarioRememorar = 2 | 7 | 30 | 300

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
        const quantidadeDias = armazenamento.cenario()
        if (existente.revisao > 0 && existente.cenario === quantidadeDias) return existente
        const cenario = obterCenarioAcervoRememorar(quantidadeDias)
        const revisao = existente.revisao + 1
        const blocos: Record<string, BlocoProjecaoRememorar> = {}
        for (const data of cenario.dias) blocos[data] = projetarDiaAcervoRememorar(idConta, cenario, data)
        const inicial: EstadoSimulado = {
            revisao,
            blocos,
            cenario: quantidadeDias,
            ultimaRevisao: Object.fromEntries(
                [...new Set([...Object.keys(existente.blocos), ...cenario.dias])].map((data) => [data, revisao])
            )
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
        const valor = desenvolvimento ? Number(localStorage.getItem(chaveCenario) ?? "300") : 30
        return valor === 2 || valor === 7 || valor === 30 || valor === 300 ? valor : desenvolvimento ? 300 : 30
    }
}

export const projecaoRemotaSimulada = criarProjecaoRemotaSimulada(armazenamentoNavegador)

export function selecionarCenarioRememorar(quantidade: CenarioRememorar) {
    if (desenvolvimento) localStorage.setItem(chaveCenario, String(quantidade))
}

function alterarEstado(idConta: string, alterar: (estado: EstadoSimulado) => void) {
    const estado = armazenamentoNavegador.ler(idConta)
    if (estado.revisao === 0) {
        const quantidadeDias = armazenamentoNavegador.cenario()
        const cenario: CenarioAcervoRememorar = obterCenarioAcervoRememorar(quantidadeDias)
        estado.revisao = 1
        estado.cenario = quantidadeDias
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
                selecionarCenarioRememorar(quantidade)
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
