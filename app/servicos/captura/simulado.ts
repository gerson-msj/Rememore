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
// Spec 10: composição histórica para testar rolagem e inclusão de complementos em 10/09/2026.
const cenarioRolagemComplementos: CenarioCapturaSimulada = {
    status: "found",
    revision: "spec10-rolagem-complementos-1",
    editWindowDays: 3,
    memories: [
        "Abri a janela cedo e fiquei alguns minutos observando a rua acordar. O café ainda estava quente quando ouvi os primeiros pássaros.",
        "No caminho da padaria, encontrei uma vizinha que não via havia semanas. Conversamos sobre as pequenas mudanças do bairro.",
        "Separei algumas fotografias antigas. Uma delas trouxe de volta o cheiro da casa onde passávamos as férias e as conversas ao redor da mesa.",
        "Consegui terminar uma tarefa que vinha adiando. A sensação de alívio foi maior do que eu esperava.",
        "Recebi uma mensagem de um amigo distante. Bastaram poucas palavras para lembrar como nossas conversas sempre foram fáceis.",
        "Preparei o almoço sem pressa. Experimentei um tempero diferente e anotei mentalmente o que gostaria de repetir na próxima vez.",
        "Uma música no rádio me fez parar por alguns instantes. Lembrei de uma viagem e de como cantávamos juntos, mesmo errando a letra.",
        "Passei parte da tarde organizando livros. Encontrei uma anotação esquecida entre as páginas e reli o trecho que a acompanhava.",
        "Fiz uma caminhada pelo parque. Observei a luz entre as árvores, o movimento das pessoas e o barulho dos passos no caminho de pedras.",
        "Durante uma conversa, percebi que tinha entendido uma situação de maneira diferente. Ouvir com calma mudou minha impressão inicial.",
        "Reservei um tempo para cuidar das plantas. Uma muda pequena já tinha folhas novas, quase imperceptíveis na semana anterior.",
        "Lembrei de uma receita da família e procurei os ingredientes. Quero registrar depois os detalhes que ainda preciso perguntar.",
        "O céu mudou de cor no fim da tarde. Fiquei olhando pela janela até as primeiras luzes das casas se acenderem.",
        "Conversei com minha família sobre os planos para o fim de semana. Surgiram ideias simples que deixaram todos animados.",
        "Voltei a um projeto pessoal por alguns minutos. Não avancei muito, mas retomar o contato com ele já fez diferença.",
        "Na hora do jantar, uma história antiga apareceu na conversa. Cada pessoa lembrava de um detalhe diferente do mesmo acontecimento.",
        "Antes de dormir, deixei o telefone de lado e li algumas páginas. Foi bom terminar o dia com menos pressa.",
        "Ao recordar o dia, percebi quantos pequenos encontros fizeram parte dele. Quero acrescentar outras lembranças quando elas voltarem."
    ].map((conteudo, ordem) => ({
        id: `spec10-historica-20260910-${ordem + 1}`,
        content: `Memória ${ordem + 1}. ${conteudo}`,
        order: ordem,
        firstPreservedAt: "2026-09-10T23:00:00.000Z",
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
            : desenvolvimento && dataCaptura === "2026-09-10"
            ? cenarioRolagemComplementos
            : desenvolvimento && dataCaptura === "2026-09-13"
            ? cenarioComplementosHistoricos
            : inicial
    },
    (operacao, _idConta, dataCaptura) => {
        if (desenvolvimento) console.info(`[Capturar mock] ${operacao}: ${dataCaptura}`)
    }
)
