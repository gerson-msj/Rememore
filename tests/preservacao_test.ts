import { detectarConflitoPreservacao, finalizarPreservacao, podePreservarCaptura } from "../app/servicos/captura/preservacao.ts"
import {
    type CenarioCapturaSimulada,
    type EstadoContaSimulada,
    prepararEstadoPreservadoSimulado
} from "../app/servicos/captura/simulado.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

Deno.test("preservação não conflita quando a ausência remota continua ausente", () => {
    verificarIgualdade(detectarConflitoPreservacao({ origemPreservada: false, revisaoOrigem: null }, { status: "absent" }), false)
})

Deno.test("preservação detecta conteúdo criado desde a abertura da captura", () => {
    verificarIgualdade(
        detectarConflitoPreservacao({ origemPreservada: false, revisaoOrigem: null }, { status: "found", revision: "1" }),
        true
    )
})

Deno.test("preservação mantém compatibilidade com a revisão de origem", () => {
    verificarIgualdade(
        detectarConflitoPreservacao({ origemPreservada: true, revisaoOrigem: "rev-a" }, { status: "found", revision: "rev-a" }),
        false
    )
})

Deno.test("preservação detecta revisão alterada ou conteúdo removido remotamente", () => {
    const origem = { origemPreservada: true, revisaoOrigem: "rev-a" }
    verificarIgualdade(detectarConflitoPreservacao(origem, { status: "found", revision: "rev-b" }), true)
    verificarIgualdade(detectarConflitoPreservacao(origem, { status: "absent" }), true)
})

Deno.test("captura nova vazia não pode ser preservada, mesmo após inclusão local anterior", () => {
    verificarIgualdade(podePreservarCaptura({ memorias: [], origemPreservada: false }), false)
})

Deno.test("preservação vazia só fica disponível para uma origem remota", () => {
    verificarIgualdade(podePreservarCaptura({ memorias: [], origemPreservada: true }), true)
    verificarIgualdade(
        podePreservarCaptura({
            memorias: [{ id: "m", conteudo: "", ordem: 0, primeiraPreservacaoEm: null, complementos: [] }],
            origemPreservada: false
        }),
        true
    )
})

Deno.test("mock mantém historicidade e resolve categorias na composição substituída", () => {
    const data = "2026-09-29"
    const instanteOriginal = "2026-09-01T12:00:00.000Z"
    const instanteNovo = "2026-09-29T15:00:00.000Z"
    const estado: EstadoContaSimulada = {
        categorias: [{ id: "categoria-afeto", nome: "Afeto", versao: 4, ativa: false }],
        capturas: {
            [data]: {
                revision: "8",
                editWindowDays: 3,
                memories: [{
                    id: "memoria-antiga",
                    content: "Texto anterior",
                    order: 0,
                    firstPreservedAt: instanteOriginal,
                    complements: [{ id: "complemento-antigo", content: "Anterior", firstPreservedAt: instanteOriginal }]
                }]
            }
        }
    }
    const cenario: CenarioCapturaSimulada = { status: "found", revision: "8", editWindowDays: 3, memories: [] }
    const memoriaPreservada = {
        id: "memoria-antiga",
        content: "Texto atualizado",
        order: 0,
        firstPreservedAt: null,
        tom: 0,
        balancoSentimental: null,
        categories: [{ id: null, name: "afeto" }, { id: null, name: "Saudade" }],
        complements: [
            { id: "complemento-antigo", content: "Atualizado", firstPreservedAt: null },
            { id: "complemento-novo", content: "Novo", firstPreservedAt: null }
        ]
    }
    const novoId = (() => {
        let sequencia = 0
        return () => `categoria-nova-${++sequencia}`
    })()
    const { estado: proximo, resultado } = prepararEstadoPreservadoSimulado(
        estado,
        data,
        cenario,
        [memoriaPreservada, {
            ...memoriaPreservada,
            id: "memoria-nova",
            categories: [{ id: null, name: "SAUDADE" }],
            complements: []
        }],
        () => instanteNovo,
        novoId
    )
    verificarIgualdade(estado.capturas[data].revision, "8")
    verificarIgualdade(proximo.capturas[data].revision, "9")
    verificarIgualdade(proximo.capturas[data].memories[0].firstPreservedAt, instanteOriginal)
    verificarIgualdade(proximo.capturas[data].memories[0].complements[0].firstPreservedAt, instanteOriginal)
    verificarIgualdade(proximo.capturas[data].memories[0].complements[1].firstPreservedAt, instanteNovo)
    verificarIgualdade(proximo.capturas[data].memories[0].tom, 0)
    verificarIgualdade(proximo.capturas[data].memories[0].balancoSentimental, null)
    verificarIgualdade(proximo.capturas[data].memories[1].firstPreservedAt, instanteNovo)
    verificarIgualdade(proximo.capturas[data].memories[0].categories?.[1].id, proximo.capturas[data].memories[1].categories?.[0].id)
    verificarIgualdade(proximo.categorias.length, 2)
    verificarIgualdade(proximo.categorias[0], { id: "categoria-afeto", nome: "Afeto", versao: 5, ativa: true })
    verificarIgualdade(resultado.categoriasCriadas.length, 2)
})

Deno.test("mock prepara a exclusão vazia sem mutar o estado até a gravação", () => {
    const data = "2026-09-29"
    const estado: EstadoContaSimulada = {
        categorias: [],
        capturas: {
            [data]: {
                revision: "2",
                editWindowDays: 3,
                memories: [{
                    id: "m",
                    content: "Memória",
                    order: 0,
                    firstPreservedAt: "2026-09-01T00:00:00.000Z",
                    complements: []
                }]
            }
        }
    }
    const cenario: CenarioCapturaSimulada = { status: "found", revision: "2", editWindowDays: 3, memories: [] }
    const { estado: proximo, resultado } = prepararEstadoPreservadoSimulado(estado, data, cenario, [])
    verificarIgualdade(estado.capturas[data].memories.length, 1)
    verificarIgualdade(proximo.capturas[data].memories, [])
    verificarIgualdade(resultado.revision, "3")
})

Deno.test("falha remota não tenta remover o workspace", async () => {
    let remocoes = 0
    let falhou = false
    try {
        await finalizarPreservacao(
            () => Promise.reject(new Error("sem confirmação")),
            () => {
                remocoes++
                return Promise.resolve()
            }
        )
    } catch {
        falhou = true
    }
    verificarIgualdade(falhou, true)
    verificarIgualdade(remocoes, 0)
})

Deno.test("falha ao remover após sucesso remoto não repete a preservação", async () => {
    let preservacoes = 0
    const resultado = await finalizarPreservacao(
        () => {
            preservacoes++
            return Promise.resolve({ status: "success", revision: "3", categoriasCriadas: [] })
        },
        () => Promise.reject(new Error("IndexedDB indisponível"))
    )
    verificarIgualdade(resultado, "local-failure")
    verificarIgualdade(preservacoes, 1)
})

Deno.test("remoção local ocorre depois da confirmação remota", async () => {
    const ordem: string[] = []
    const resultado = await finalizarPreservacao(
        () => {
            ordem.push("remoto")
            return Promise.resolve({ status: "success", revision: "3", categoriasCriadas: [] })
        },
        () => {
            ordem.push("local")
            return Promise.resolve()
        }
    )
    verificarIgualdade(resultado, "success")
    verificarIgualdade(ordem, ["remoto", "local"])
})
