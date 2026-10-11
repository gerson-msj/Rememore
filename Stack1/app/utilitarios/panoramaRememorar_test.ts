import type { CatalogoCategorias } from "../servicos/local/catalogoCategorias.ts"
import type { BlocoProjecaoRememorar } from "../servicos/local/projecaoRememorar.ts"
import { obterCenarioAcervoRememorar, projetarDiaAcervoRememorar } from "../servicos/rememorar/acervo.ts"
import { calcularTomMedioCategoria, calcularTomMedioPanorama, derivarPanoramaRememorar } from "./panoramaRememorar.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

const catalogo: CatalogoCategorias = {
    idConta: "conta",
    revisao: "1",
    categorias: [
        { id: "casa", nome: "Casa", versao: 1, ativa: true },
        { id: "amigos", nome: "Amigos", versao: 1, ativa: false },
        { id: "trabalho", nome: "Trabalho", versao: 1, ativa: true }
    ]
}

const blocos: BlocoProjecaoRememorar[] = [
    {
        idConta: "conta",
        data: "2025-01-01",
        categorias: [{ idCategoria: "casa", tons: [30, null, -10, 0] }, { idCategoria: "amigos", tons: [null] }]
    },
    {
        idConta: "conta",
        data: "2025-01-06",
        categorias: [{ idCategoria: "amigos", tons: [-20] }, { idCategoria: "trabalho", tons: [null, null] }]
    },
    { idConta: "conta", data: "2025-01-08", categorias: [{ idCategoria: "trabalho", tons: [20] }] },
    { idConta: "conta", data: "2025-01-27", categorias: [{ idCategoria: "casa", tons: [100, 100] }] }
]
const dias = ["2025-01-01", "2025-01-06", "2025-01-08", "2025-01-27"]

Deno.test("Panorama: conta associações com Tom nulo e zero, média exclui nulos e distingue ausência de neutralidade", () => {
    const resultado = derivarPanoramaRememorar(dias, 0, 2, blocos, catalogo)
    igual(resultado.map(({ identificador, quantidade, tom }) => [identificador, quantidade, tom]), [
        ["casa", 4, 20 / 3],
        ["trabalho", 3, 20],
        ["amigos", 2, -20]
    ])
    igual(resultado.find(({ identificador }) => identificador === "trabalho")?.tom, 20)
    igual(resultado.find(({ identificador }) => identificador === "casa")?.representatividade, 1)
    igual(resultado.find(({ identificador }) => identificador === "amigos")?.representatividade, Math.sqrt(0.5))
})

Deno.test("Panorama: recorte inclui extremos e remove contribuições externas, recalculando qMax", () => {
    const resultado = derivarPanoramaRememorar(dias, 1, 2, blocos, catalogo)
    igual(
        resultado.map(({ identificador, quantidade, tom, representatividade }) => [identificador, quantidade, tom, representatividade]),
        [
            ["trabalho", 3, 20, 1],
            ["amigos", 1, -20, Math.sqrt(1 / 3)]
        ]
    )
    igual(derivarPanoramaRememorar(dias, 2, 3, blocos, catalogo).map(({ identificador }) => identificador), ["casa", "trabalho"])
})

Deno.test("Panorama: empates têm ordem determinística por identificador e categorias inativas continuam presentes", () => {
    const empate: BlocoProjecaoRememorar[] = [
        { idConta: "conta", data: dias[0], categorias: [{ idCategoria: "amigos", tons: [10] }, { idCategoria: "casa", tons: [0] }] }
    ]
    const primeira = derivarPanoramaRememorar(dias, 0, 1, empate, catalogo)
    const segunda = derivarPanoramaRememorar(dias, 0, 1, [...empate].reverse(), catalogo)
    igual(primeira.map(({ identificador }) => identificador), ["amigos", "casa"])
    igual(segunda.map(({ identificador }) => identificador), primeira.map(({ identificador }) => identificador))
    igual(primeira.map(({ representatividade }) => representatividade), [1, 1])
})

Deno.test("Panorama: média global pondera Tons definidos, inclui zero e ignora categorias sem Tom", () => {
    const categorias = derivarPanoramaRememorar(dias, 0, 1, blocos, catalogo)
    igual(categorias.map(({ identificador, quantidadeTons }) => [identificador, quantidadeTons]), [
        ["casa", 3],
        ["amigos", 1],
        ["trabalho", 0]
    ])
    igual(calcularTomMedioPanorama(categorias), 0)
    igual(calcularTomMedioPanorama([]), null)
    igual(calcularTomMedioPanorama([{ ...categorias[1], quantidadeTons: 0 }]), null)
})

Deno.test("Detalhe: média simples inclui zero e exclui Tons nulos", () => {
    igual(calcularTomMedioCategoria([null, 0, 30, null]), 15)
    igual(calcularTomMedioCategoria([null, null]), null)
})

Deno.test("Panorama: cenários de 2, 7, 30 e 300 dias derivam sem limites artificiais de categorias", () => {
    for (const quantidade of [2, 7, 30, 300] as const) {
        const cenario = obterCenarioAcervoRememorar(quantidade)
        const blocosCenario = cenario.dias.map((dia) => projetarDiaAcervoRememorar("conta", cenario, dia))
        const diasOrdenados = [...cenario.dias].sort()
        const resultado = derivarPanoramaRememorar(diasOrdenados, 0, diasOrdenados.length - 1, blocosCenario, {
            ...catalogo,
            categorias: Array.from({ length: 40 }, (_, indice) => ({
                id: `categoria-${String(indice + 1).padStart(2, "0")}`,
                nome: `Categoria ${indice + 1}`,
                versao: 1,
                ativa: indice !== 36 && indice !== 38
            }))
        })
        igual(resultado.length > 0, true)
        igual(resultado.every(({ representatividade }) => representatividade > 0 && representatividade <= 1), true)
        igual(resultado.length <= 40, true)
        if (quantidade === 300) igual(resultado.length, 40)
    }
})

Deno.test("Panorama: representatividade original da única categoria é 1", () => {
    const blocosUnicos: BlocoProjecaoRememorar[] = [
        { idConta: "conta", data: dias[0], categorias: [{ idCategoria: "casa", tons: [10] }] },
        { idConta: "conta", data: dias[1], categorias: [{ idCategoria: "casa", tons: [20] }] }
    ]
    igual(derivarPanoramaRememorar(dias, 0, 1, blocosUnicos, catalogo)[0].representatividade, 1)
})

Deno.test("Panorama: janela inválida ou com menos de dois dias não produz modelos", () => {
    igual(derivarPanoramaRememorar(dias, 1, 1, blocos, catalogo), [])
    igual(derivarPanoramaRememorar(dias, -1, 2, blocos, catalogo), [])
    igual(derivarPanoramaRememorar(dias, 0, 8, blocos, catalogo), [])
})
