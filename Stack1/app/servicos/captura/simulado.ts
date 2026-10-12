import type { MemoriaPreservada, ServicoCapturasPreservadas } from "./contratos.ts"
import { normalizarPesquisa } from "../../utilitarios/pesquisaTexto.ts"

export interface CenarioCapturaSimulada {
    status: "absent" | "found" | "failed"
    revision: string
    editWindowDays: number
    memories: MemoriaPreservada[]
    failRead?: boolean
}

export function criarCapturaSimulada(
    cenario: (idConta: string, dataCaptura: string) => CenarioCapturaSimulada,
    observar: (operacao: "metadata" | "download" | "preserve", idConta: string, dataCaptura: string) => void = () => {},
    preservar: (idConta: string, dataCaptura: string, memories: MemoriaPreservada[]) => Promise<{
        status: "success"
        revision: string
        categoriasCriadas: { id: string; nome: string; versao: number }[]
    }> = (_idConta, _dataCaptura, _memories) => Promise.resolve({ status: "success", revision: "1", categoriasCriadas: [] })
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
        },
        preserve(idConta, dataCaptura, memories) {
            observar("preserve", idConta, dataCaptura)
            return preservar(idConta, dataCaptura, structuredClone(memories))
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
const chaveRemota = (idConta: string) => `rememore:dev:server:${idConta}`
interface CategoriaRemotaSimulada {
    id: string
    nome: string
    versao: number
    ativa: boolean
}
interface EstadoRemotoSimulado {
    revision: string
    editWindowDays: number
    memories: MemoriaPreservada[]
}
export interface EstadoContaSimulada {
    categorias: CategoriaRemotaSimulada[]
    capturas: Record<string, EstadoRemotoSimulado>
}
const controles = { falharPreservacao: false, falharCategoria: false, latencia: 0 }

export function prepararEstadoPreservadoSimulado(
    estadoAtual: EstadoContaSimulada,
    dataCaptura: string,
    cenario: CenarioCapturaSimulada,
    memorias: MemoriaPreservada[],
    agora: () => string = () => new Date().toISOString(),
    novoId: () => string = () => crypto.randomUUID()
) {
    const estado = structuredClone(estadoAtual)
    const anterior = estado.capturas[dataCaptura]
    const base = anterior?.memories ?? cenario.memories
    const porId = new Map(base.map((memoria) => [memoria.id, memoria]))
    for (const memoria of base) {
        for (const categoria of memoria.categories ?? []) {
            if (!categoria.id || estado.categorias.some((item) => item.id === categoria.id)) continue
            estado.categorias.push({ id: categoria.id, nome: categoria.name, versao: 1, ativa: true })
        }
    }
    const criadas: { id: string; nome: string; versao: number }[] = []
    const normalizadas = new Map(estado.categorias.map((categoria) => [normalizarPesquisa(categoria.nome), categoria]))
    const preservadas = memorias.map((memoria) => ({
        ...memoria,
        tom: memoria.tom ?? null,
        balancoSentimental: memoria.balancoSentimental ?? null,
        firstPreservedAt: porId.get(memoria.id)?.firstPreservedAt ?? memoria.firstPreservedAt ?? agora(),
        categories: (memoria.categories ?? []).map((categoria) => {
            const nome = categoria.name.trim()
            let encontrada = normalizadas.get(normalizarPesquisa(nome))
            if (!encontrada) {
                encontrada = { id: novoId(), nome, versao: 1, ativa: true }
                estado.categorias.push(encontrada)
                normalizadas.set(normalizarPesquisa(nome), encontrada)
                criadas.push({ id: encontrada.id, nome, versao: encontrada.versao })
            } else if (!encontrada.ativa) {
                encontrada.ativa = true
                encontrada.versao++
                criadas.push({ id: encontrada.id, nome: encontrada.nome, versao: encontrada.versao })
            }
            return { id: encontrada.id, name: encontrada.nome }
        }),
        complements: memoria.complements.map((complemento) => {
            const previo = porId.get(memoria.id)?.complements.find((item) => item.id === complemento.id)
            return { ...complemento, firstPreservedAt: previo?.firstPreservedAt ?? complemento.firstPreservedAt ?? agora() }
        })
    }))
    const revisao = Number(anterior?.revision ?? cenario.revision.replace(/\D/g, "")) || 0
    const captura: EstadoRemotoSimulado = {
        revision: String(revisao + 1),
        editWindowDays: anterior?.editWindowDays ?? cenario.editWindowDays,
        memories: preservadas
    }
    estado.capturas[dataCaptura] = captura
    return { estado, resultado: { status: "success" as const, revision: captura.revision, categoriasCriadas: criadas } }
}

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
            },
            falharPreservacao(falhar = true) {
                controles.falharPreservacao = falhar
            },
            falharResolucaoCategoria(falhar = true) {
                controles.falharCategoria = falhar
            },
            definirLatencia(milissegundos = 0) {
                controles.latencia = Math.max(0, milissegundos)
            },
            configureRemoto(idConta: string, dataCaptura: string, cenario: CenarioCapturaSimulada) {
                const chave = chaveRemota(idConta)
                const estado = JSON.parse(localStorage.getItem(chave) ?? '{"categorias":[],"capturas":{}}') as {
                    categorias: CategoriaRemotaSimulada[]
                    capturas: Record<string, EstadoRemotoSimulado>
                }
                if (cenario.status === "found") {
                    estado.capturas[dataCaptura] = {
                        revision: cenario.revision,
                        editWindowDays: cenario.editWindowDays,
                        memories: structuredClone(cenario.memories)
                    }
                } else delete estado.capturas[dataCaptura]
                localStorage.setItem(chave, JSON.stringify(estado))
                localStorage.setItem(chaveSimulacao(dataCaptura), JSON.stringify(cenario))
            },
            configurarCategoria(idConta: string, id: string, nome: string, ativa = true, versao = 1) {
                const chave = chaveRemota(idConta)
                const estado = JSON.parse(localStorage.getItem(chave) ?? '{"categorias":[],"capturas":{}}') as {
                    categorias: CategoriaRemotaSimulada[]
                    capturas: Record<string, EstadoRemotoSimulado>
                }
                const existente = estado.categorias.find((categoria) => categoria.id === id)
                const categoria = { id, nome, ativa, versao }
                if (existente) Object.assign(existente, categoria)
                else estado.categorias.push(categoria)
                localStorage.setItem(chave, JSON.stringify(estado))
            },
            resetarEstadoRemoto(idConta: string) {
                localStorage.removeItem(chaveRemota(idConta))
            }
        }
    })
}

function obterCenario(_idConta: string, dataCaptura: string): CenarioCapturaSimulada {
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
}

export const capturasPreservadasSimuladas = criarCapturaSimulada(
    (idConta, dataCaptura) => {
        if (!desenvolvimento) return inicial
        const salvo = localStorage.getItem(chaveRemota(idConta))
        const estado = salvo ? JSON.parse(salvo) as { capturas: Record<string, EstadoRemotoSimulado> } : undefined
        const captura = estado?.capturas?.[dataCaptura]
        return captura ? { status: "found", ...captura } : obterCenario(idConta, dataCaptura)
    },
    (operacao, _idConta, dataCaptura) => {
        if (desenvolvimento) console.info(`[Capturar mock] ${operacao}: ${dataCaptura}`)
    },
    async (idConta, dataCaptura, memorias) => {
        if (controles.latencia) await new Promise((resolver) => setTimeout(resolver, controles.latencia))
        if (controles.falharPreservacao) throw new Error("Falha simulada na preservação")
        if (controles.falharCategoria && memorias.some((memoria) => memoria.categories?.length)) {
            throw new Error("Falha simulada na resolução de categorias")
        }
        const chave = chaveRemota(idConta)
        const estadoConta = JSON.parse(localStorage.getItem(chave) ?? '{"categorias":[],"capturas":{}}') as EstadoContaSimulada
        const cenario = obterCenario(idConta, dataCaptura)
        const { estado, resultado } = prepararEstadoPreservadoSimulado(estadoConta, dataCaptura, cenario, memorias)
        // Um único registro publica composição e categorias como uma transação indivisível.
        localStorage.setItem(chave, JSON.stringify(estado))
        return resultado
    }
)
