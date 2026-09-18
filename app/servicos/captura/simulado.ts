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
// Cenário direto para validar a leitura contínua de dois complementos históricos.
const cenarioComplementosHistoricos: CenarioCapturaSimulada = {
    status: "found",
    revision: "complementos-historicos-E-1",
    editWindowDays: 3,
    memories: [{
        id: "historica-E-memoria",
        content: "Uma caminhada no fim da tarde me fez recordar as conversas que tínhamos no caminho de casa.",
        order: 0,
        firstPreservedAt: "2026-09-13T12:00:00.000Z",
        complements: [
            {
                id: "historica-E-complemento-1",
                content: "Depois percebi que o que mais ficou daquela caminhada foi a tranquilidade de poder conversar sem pressa.",
                firstPreservedAt: "2026-09-13T13:00:00.000Z"
            },
            {
                id: "historica-E-complemento-2",
                content: "Ao lembrar novamente, reconheci também o quanto aquele encontro me ajudou a olhar a semana com mais serenidade.",
                firstPreservedAt: "2026-09-14T03:00:00.000Z"
            }
        ]
    }]
}
// Composição longa para o operador validar a estrutura em computador e celular.
const cenarioVisual: CenarioCapturaSimulada = {
    status: "found",
    revision: "layout-B",
    editWindowDays: 3,
    memories: Array.from({ length: 18 }, (_, ordem) => ({
        id: `layout-memory-${ordem + 1}`,
        content: `Lembrança ${ordem + 1}. ` + (
            "Uma conversa ao fim da tarde trouxe de volta detalhes de um dia especial. " +
            "Lembrei da luz entrando pela janela, do café na mesa e das histórias que contamos sem pressa. "
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
            : desenvolvimento && dataCaptura === "2026-09-13"
            ? cenarioComplementosHistoricos
            : inicial
    },
    (operacao, _idConta, dataCaptura) => {
        if (desenvolvimento) console.info(`[Capturar mock] ${operacao}: ${dataCaptura}`)
    }
)
