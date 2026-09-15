import type { MemoriaPreservada, ServicoCapturasPreservadas } from "./contratos.ts"

export interface CenarioCapturaSimulada {
    status: "absent" | "found" | "failed"
    revision: string
    editWindowDays: number
    memories: MemoriaPreservada[]
    failRead?: boolean
}

export function criarCapturaSimulada(
    cenario: (idConta: string, dataCaptura: string) => CenarioCapturaSimulada,
    observar: (operacao: "metadata" | "download", idConta: string, dataCaptura: string) => void = () => {}
): ServicoCapturasPreservadas {
    return {
        inspect(idConta, dataCaptura) {
            observar("metadata", idConta, dataCaptura)
            const atual = cenario(idConta, dataCaptura)
            if (atual.status === "failed") return Promise.resolve({ status: "failed" })
            return Promise.resolve(
                atual.status === "found"
                    ? { status: "found", revision: atual.revision, editWindowDays: atual.editWindowDays }
                    : { status: "absent", editWindowDays: atual.editWindowDays }
            )
        },
        read(idConta, dataCaptura) {
            observar("download", idConta, dataCaptura)
            const atual = cenario(idConta, dataCaptura)
            if (atual.failRead || atual.status === "failed") return Promise.resolve({ status: "failed" })
            if (atual.status === "absent") return Promise.resolve({ status: "absent" })
            return Promise.resolve({
                status: "found",
                revision: atual.revision,
                editWindowDays: atual.editWindowDays,
                memories: structuredClone(atual.memories)
            })
        }
    }
}

const inicial: CenarioCapturaSimulada = { status: "absent", revision: "X", editWindowDays: 3, memories: [] }
// Composição longa para o operador validar a estrutura em computador e celular.
const cenarioVisual: CenarioCapturaSimulada = {
    status: "found",
    revision: "layout-B",
    editWindowDays: 3,
    memories: Array.from({ length: 18 }, (_, ordem) => ({
        id: `layout-memory-${ordem + 1}`,
        content: `Lembrança ${ordem + 1}. ` + (
            "Uma conversa ao fim da tarde trouxe de volta detalhes de um dia especial. " +
            "Lembrei da luz entrando pela janela, do café na mesa e das histórias que contamos sem pressa.\n\n"
        ).repeat(ordem === 0 ? 18 : 2),
        order: ordem,
        firstPreservedAt: "2026-09-01T12:00:00.000Z",
        complements: []
    }))
}
const desenvolvimento = import.meta.env?.DEV && typeof window !== "undefined"
const chaveSimulacao = (dataCaptura: string) => `rememore:dev:capture:${dataCaptura}`

// Cenários acessíveis pelo console somente em desenvolvimento.
if (desenvolvimento) {
    Object.assign(globalThis, {
        rememoreCaptureMock: {
            set(dataCaptura: string, estado: CenarioCapturaSimulada["status"], revisao = "X", prazoEdicaoDias = 3) {
                const cenario: CenarioCapturaSimulada = {
                    status: estado,
                    revision: revisao,
                    editWindowDays: prazoEdicaoDias,
                    memories: [{
                        id: `mock-memory:${dataCaptura}`,
                        content: `Memória de teste — revisão ${revisao}`,
                        order: 0,
                        firstPreservedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                        complements: []
                    }]
                }
                localStorage.setItem(chaveSimulacao(dataCaptura), JSON.stringify(cenario))
            },
            configure(dataCaptura: string, cenario: CenarioCapturaSimulada) {
                localStorage.setItem(chaveSimulacao(dataCaptura), JSON.stringify(cenario))
            },
            reset(dataCaptura: string) {
                localStorage.removeItem(chaveSimulacao(dataCaptura))
            }
        }
    })
}

export const capturasPreservadasSimuladas = criarCapturaSimulada(
    (_idConta, dataCaptura) => {
        const configurado = desenvolvimento ? localStorage.getItem(chaveSimulacao(dataCaptura)) : null
        return configurado
            ? JSON.parse(configurado) as CenarioCapturaSimulada
            : desenvolvimento && dataCaptura === "2026-09-08"
            ? cenarioVisual
            : inicial
    },
    (operacao, _idConta, dataCaptura) => {
        if (desenvolvimento) console.info(`[Capturar mock] ${operacao}: ${dataCaptura}`)
    }
)
