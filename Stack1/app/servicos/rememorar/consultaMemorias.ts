import { catalogoReferenciaRememorar, obterCenarioAcervoRememorar } from "./acervo.ts"
import { lerTonsForcadosRememorar } from "./simulado.ts"

export interface MemoriaConsultaRememorar {
    id: string
    data: string
    ordem: number
    conteudo: string
    tom: number | null
    categorias: { id: string; nome: string }[]
    complementos: { id: string; conteudo: string }[]
    balancoSentimental?: string
}

export interface ConsultaMemoriasRememorar {
    idConta: string
    idCategoria: string
    primeiroDia: string
    ultimoDia: string
    offset: number
    signal?: AbortSignal
}

export interface LoteMemoriasRememorar {
    memorias: MemoriaConsultaRememorar[]
    tamanhoLote: number
    proximoOffset: number | null
    total: number
}

export interface ServicoConsultaMemoriasRememorar {
    consultar(consulta: ConsultaMemoriasRememorar): Promise<LoteMemoriasRememorar>
}

export function criarServicoConsultaMemoriasRememorar(
    cenario: () => 2 | 7 | 30 | 300,
    esperar: (idConta: string, signal?: AbortSignal) => Promise<void> = async () => {}
): ServicoConsultaMemoriasRememorar {
    return {
        async consultar(consulta) {
            if (!Number.isSafeInteger(consulta.offset) || consulta.offset < 0) throw new RangeError("Offset inválido")
            await esperar(consulta.idConta, consulta.signal)
            consulta.signal?.throwIfAborted()
            const nomes = new Map(catalogoReferenciaRememorar.map(({ id, nome }) => [id, nome]))
            const quantidadeDias = cenario()
            const tonsForcados = (quantidadeDias === 7 || quantidadeDias === 30) && lerTonsForcadosRememorar()
            const tomForcado = quantidadeDias === 7 ? -55 : 55
            const memorias = obterCenarioAcervoRememorar(quantidadeDias).memorias
                .filter((memoria) => memoria.categorias.includes(consulta.idCategoria))
                .filter((memoria) => memoria.data >= consulta.primeiroDia && memoria.data <= consulta.ultimoDia)
                .sort((a, b) => a.data.localeCompare(b.data) || a.ordem - b.ordem || a.id.localeCompare(b.id))
                .map((memoria): MemoriaConsultaRememorar => ({
                    ...memoria,
                    tom: tonsForcados ? tomForcado : memoria.tom,
                    categorias: memoria.categorias.map((id) => ({ id, nome: nomes.get(id) ?? id }))
                }))
            const tamanhoLote = 30
            const pagina = memorias.slice(consulta.offset, consulta.offset + tamanhoLote)
            const proximoOffset = consulta.offset + pagina.length < memorias.length ? consulta.offset + pagina.length : null
            return { memorias: pagina, tamanhoLote, proximoOffset, total: memorias.length }
        }
    }
}

const desenvolvimento = import.meta.env?.DEV && typeof window !== "undefined"
const chaveFalhas = "rememore:dev:consulta-memorias:falhas:v1"
const chaveAtrasos = "rememore:dev:consulta-memorias:atrasos:v1"

function esperarMock(idConta: string, signal?: AbortSignal): Promise<void> {
    if (!desenvolvimento) return Promise.resolve()
    const falhas = JSON.parse(localStorage.getItem(chaveFalhas) ?? "{}") as Record<string, boolean>
    if (falhas[idConta]) return Promise.reject(new Error("Consulta de memórias simulada indisponível"))
    const atrasos = JSON.parse(localStorage.getItem(chaveAtrasos) ?? "{}") as Record<string, number>
    const atraso = Math.min(30_000, Math.max(0, Number(atrasos[idConta]) || 0))
    if (!atraso) return Promise.resolve()
    return new Promise((resolver, rejeitar) => {
        const temporizador = setTimeout(resolver, atraso)
        signal?.addEventListener("abort", () => {
            clearTimeout(temporizador)
            rejeitar(signal.reason ?? new DOMException("Consulta cancelada", "AbortError"))
        }, { once: true })
    })
}

const cenarioAtivo = () => {
    if (!desenvolvimento) return 30 as const
    const valor = Number(localStorage.getItem("rememore:dev:projecao:cenario") ?? "300")
    return valor === 2 || valor === 7 || valor === 30 || valor === 300 ? valor : 300
}

export const consultaMemoriasRememorar = criarServicoConsultaMemoriasRememorar(cenarioAtivo, esperarMock)

if (desenvolvimento) {
    Object.assign(globalThis, {
        rememoreMemoriasMock: {
            falhar(idConta: string, falhar = true) {
                const falhas = JSON.parse(localStorage.getItem(chaveFalhas) ?? "{}") as Record<string, boolean>
                falhas[idConta] = falhar
                localStorage.setItem(chaveFalhas, JSON.stringify(falhas))
            },
            definirLatencia(idConta: string, atrasoMs: number) {
                const atrasos = JSON.parse(localStorage.getItem(chaveAtrasos) ?? "{}") as Record<string, number>
                atrasos[idConta] = atrasoMs
                localStorage.setItem(chaveAtrasos, JSON.stringify(atrasos))
            }
        }
    })
}
