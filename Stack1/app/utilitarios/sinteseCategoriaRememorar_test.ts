import type { BlocoProjecaoRememorar } from "../servicos/local/projecaoRememorar.ts"
import { obterCenarioAcervoRememorar, projetarDiaAcervoRememorar } from "../servicos/rememorar/acervo.ts"
import type { IntervaloJanela } from "./janelaTemporal.ts"
import { derivarSinteseCategoriaRememorar } from "./sinteseCategoriaRememorar.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

const dias = ["2025-01-01", "2025-01-06", "2025-01-08", "2025-01-27"]
const intervalo: IntervaloJanela = {
    primeiraPosicao: 0,
    ultimaPosicao: 2,
    quantidadeDias: 3,
    primeiroDia: dias[0],
    ultimoDia: dias[2]
}
const blocos: BlocoProjecaoRememorar[] = [
    {
        idConta: "conta-a",
        data: dias[0],
        categorias: [
            { idCategoria: "casa", tons: [-80, 0, null] },
            { idCategoria: "outra", tons: [100, 100] }
        ]
    },
    { idConta: "conta-a", data: dias[1], categorias: [{ idCategoria: "casa", tons: [60, null] }] },
    { idConta: "conta-a", data: dias[2], categorias: [{ idCategoria: "outra", tons: [20] }] },
    { idConta: "conta-a", data: dias[3], categorias: [{ idCategoria: "casa", tons: [100] }] },
    { idConta: "conta-b", data: dias[1], categorias: [{ idCategoria: "casa", tons: [100, 100, 100] }] }
]

Deno.test("Detalhe: série conta associações por dia e omite dias sem a categoria", () => {
    const sintese = derivarSinteseCategoriaRememorar(
        "conta-a",
        "casa",
        dias,
        intervalo,
        new Map(dias.map((data) => [data, blocos.filter((bloco) => bloco.data === data)]))
    )
    igual(sintese.serie, [3, 2])
    igual(sintese.tons, [-80, 0, null, 60, null])
    igual(sintese.tom, -20 / 3)
})

Deno.test("Detalhe: associação múltipla conta uma vez em cada categoria e conta é isolada", () => {
    const multiplas: BlocoProjecaoRememorar[] = [
        {
            idConta: "conta-a",
            data: dias[0],
            categorias: [{ idCategoria: "casa", tons: [30] }, { idCategoria: "outra", tons: [30] }]
        },
        { idConta: "conta-b", data: dias[0], categorias: [{ idCategoria: "casa", tons: [80, 90] }] }
    ]
    const indice = new Map([[dias[0], multiplas]])
    igual(derivarSinteseCategoriaRememorar("conta-a", "casa", dias, intervalo, indice).serie, [1])
    igual(derivarSinteseCategoriaRememorar("conta-a", "outra", dias, intervalo, indice).serie, [1])
})

Deno.test("Detalhe: ausência no recorte mantém série e Tons vazios sem inventar Tom", () => {
    const sintese = derivarSinteseCategoriaRememorar("conta-a", "ausente", dias, intervalo, new Map())
    igual(sintese, { serie: [], tons: [], tom: null })
})

Deno.test("Detalhe: série constante preserva associações e separa ausência de Tons definidos", () => {
    const cenario: BlocoProjecaoRememorar[] = dias.slice(0, 2).map((data) => ({
        idConta: "conta-a",
        data,
        categorias: [{ idCategoria: "casa", tons: [null, null] }]
    }))
    const sintese = derivarSinteseCategoriaRememorar(
        "conta-a",
        "casa",
        dias,
        { ...intervalo, ultimaPosicao: 1, quantidadeDias: 2, ultimoDia: dias[1] },
        new Map(cenario.map((bloco) => [bloco.data, [bloco]]))
    )
    igual(sintese, { serie: [2, 2], tons: [null, null, null, null], tom: null })
})

Deno.test("Detalhe: geometria de um dia não publica síntese de intervalo inválido", () => {
    const sintese = derivarSinteseCategoriaRememorar(
        "conta-a",
        "casa",
        dias,
        { ...intervalo, ultimaPosicao: intervalo.primeiraPosicao, quantidadeDias: 1 },
        new Map(dias.map((data) => [data, blocos.filter((bloco) => bloco.data === data)]))
    )
    igual(sintese, { serie: [], tons: [], tom: null })
})

Deno.test("Detalhe: intervalos de 2, 7, 30 e 300 dias derivam somente da projeção local", () => {
    for (const quantidade of [2, 7, 30, 300] as const) {
        const cenario = obterCenarioAcervoRememorar(quantidade)
        const diasDoCenario = [...cenario.dias].sort()
        const blocosCenario = cenario.dias.map((data) => projetarDiaAcervoRememorar("conta-a", cenario, data))
        const indice = new Map(blocosCenario.map((bloco) => [bloco.data, [bloco]]))
        const intervaloCenario: IntervaloJanela = {
            primeiraPosicao: 0,
            ultimaPosicao: diasDoCenario.length - 1,
            quantidadeDias: diasDoCenario.length,
            primeiroDia: diasDoCenario[0],
            ultimoDia: diasDoCenario[diasDoCenario.length - 1]
        }
        const sintese = derivarSinteseCategoriaRememorar(
            "conta-a",
            "categoria-01",
            diasDoCenario,
            intervaloCenario,
            indice
        )
        const esperadasPorDia = diasDoCenario.map((data) =>
            cenario.memorias.filter((memoria) => memoria.data === data && memoria.categorias.includes("categoria-01")).length
        ).filter((quantidadeDoDia) => quantidadeDoDia > 0)
        const tonsEsperados = diasDoCenario.flatMap((data) =>
            cenario.memorias
                .filter((memoria) => memoria.data === data && memoria.categorias.includes("categoria-01"))
                .map((memoria) => memoria.tom)
        )
        igual(sintese.serie, esperadasPorDia)
        igual(sintese.tons, tonsEsperados)
    }
})
