import type { CategoriaPreservada } from "../local/catalogoCategorias.ts"
import type { ServicoCatalogoCategorias } from "./contratos.ts"

interface EstadoSimulado {
    eventos: CategoriaPreservada[]
    falhar?: boolean
}
const desenvolvimento = import.meta.env?.DEV && typeof window !== "undefined"
const chave = (idConta: string) => `rememore:dev:categorias:${idConta}`
function ler(idConta: string): EstadoSimulado {
    const salvo = desenvolvimento ? localStorage.getItem(chave(idConta)) : null
    return salvo ? JSON.parse(salvo) : { eventos: [] }
}

/** Cada evento é uma nova revisão do catálogo mockado, independente da revisão de uma captura. */
export function criarCatalogoSimulado(obter: (idConta: string) => EstadoSimulado): ServicoCatalogoCategorias {
    return {
        consultar(idConta, revisaoConhecida) {
            const estado = obter(idConta)
            if (estado.falhar) return Promise.reject(new Error("Catálogo simulado indisponível"))
            const inicio = revisaoConhecida === null ? 0 : Number(revisaoConhecida)
            if (!Number.isSafeInteger(inicio) || inicio < 0 || inicio > estado.eventos.length) {
                return Promise.reject(new Error("Revisão desconhecida"))
            }
            const alteracoes = [...new Map(estado.eventos.slice(inicio).map((item) => [item.id, item])).values()]
            return Promise.resolve({ revisao: String(estado.eventos.length), alteracoes: structuredClone(alteracoes) })
        }
    }
}

export const catalogoSimulado = criarCatalogoSimulado(ler)

if (desenvolvimento) {
    Object.assign(globalThis, {
        rememoreCategoriasMock: {
            alterar(idConta: string, id: string, nome: string, ativa = true) {
                const estado = ler(idConta)
                const anterior = estado.eventos.findLast((item) => item.id === id)
                estado.eventos.push({ id, nome, ativa, versao: (anterior?.versao ?? 0) + 1 })
                localStorage.setItem(chave(idConta), JSON.stringify(estado))
            },
            falhar(idConta: string, falhar = true) {
                localStorage.setItem(chave(idConta), JSON.stringify({ ...ler(idConta), falhar }))
            }
        }
    })
}
