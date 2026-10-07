import type { CategoriaPanoramaDerivada } from "./panoramaRememorar.ts"
import {
    avancarOrdenacaoPanorama,
    type CategoriaOrdenavelPanorama,
    estadoInicialOrdenacaoPanorama,
    lerOrdenacaoPanorama,
    ORDENACAO_PANORAMA_PADRAO,
    type OrdenacaoPanorama,
    ordenarCategoriasPanorama,
    salvarOrdenacaoPanorama
} from "./ordenacaoPanorama.ts"

function verificarIgualdade(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

function categoria(nome: string, representatividade: number, tom: number | null): CategoriaPanoramaDerivada {
    return { identificador: nome, nome, quantidade: 1, representatividade, tom }
}

function armazenamentoMemoria(): Storage {
    const valores = new Map<string, string>()
    return {
        getItem: (chave: string) => valores.get(chave) ?? null,
        setItem: (chave: string, valor: string) => void valores.set(chave, valor),
        removeItem: (chave: string) => void valores.delete(chave),
        clear: () => valores.clear(),
        key: (indice: number) => [...valores.keys()][indice] ?? null,
        get length() {
            return valores.size
        }
    } as Storage
}

interface CategoriaLaboratorio extends CategoriaOrdenavelPanorama {
    identificador: string
}

const categoriasLaboratorio: CategoriaLaboratorio[] = [
    { identificador: "b", nome: "Beta", representatividade: 0.5, tom: 40 },
    { identificador: "ausente-2", nome: "Casa", representatividade: 0.2, tom: null },
    { identificador: "neutro", nome: "Neutro", representatividade: 0.9, tom: 0 },
    { identificador: "a", nome: "Alfa", representatividade: 0.5, tom: 40 },
    { identificador: "negativo", nome: "Negativo", representatividade: 0.7, tom: -40 },
    { identificador: "ausente-1", nome: "Ausência", representatividade: 0.8, tom: null },
    { identificador: "positivo", nome: "Positivo", representatividade: 0.3, tom: 80 }
]

function idsLaboratorio(ordenacao = estadoInicialOrdenacaoPanorama): string[] {
    return ordenarCategoriasPanorama(categoriasLaboratorio, ordenacao).map(({ identificador }) => identificador)
}

Deno.test("Representatividade do laboratório mantém alternância e desempate aprovado", () => {
    let estado = estadoInicialOrdenacaoPanorama
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    verificarIgualdade(estado.ordemRepresentatividade, "crescente")
    verificarIgualdade(idsLaboratorio(), ["neutro", "ausente-1", "negativo", "a", "b", "positivo", "ausente-2"])
    verificarIgualdade(idsLaboratorio(estado), ["ausente-2", "positivo", "a", "b", "negativo", "ausente-1", "neutro"])
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    verificarIgualdade(estado.ordemRepresentatividade, "decrescente")
})

Deno.test("Tom do laboratório mantém ciclo, ordenação de sinais e tratamento de ausência", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "tom")
    verificarIgualdade(estado.ordemTom, "decrescente")
    verificarIgualdade(idsLaboratorio(estado), ["positivo", "a", "b", "neutro", "negativo", "ausente-1", "ausente-2"])
    estado = avancarOrdenacaoPanorama(estado, "tom")
    verificarIgualdade(estado.ordemTom, "crescente")
    verificarIgualdade(idsLaboratorio(estado), ["negativo", "neutro", "a", "b", "positivo", "ausente-1", "ausente-2"])
    estado = avancarOrdenacaoPanorama(estado, "tom")
    verificarIgualdade(estado.ordemTom, "ausentes-primeiro")
    verificarIgualdade(idsLaboratorio(estado), ["ausente-1", "ausente-2", "neutro", "negativo", "a", "b", "positivo"])
    estado = avancarOrdenacaoPanorama(estado, "tom")
    verificarIgualdade(estado.ordemTom, "decrescente")
})

Deno.test("trocar critério no estado legado reinicia em positivo", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "representatividade")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    verificarIgualdade(estado.ordemRepresentatividade, "decrescente")
    verificarIgualdade(estado.ordemTom, "decrescente")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    verificarIgualdade(estado.ordemTom, "decrescente")
    verificarIgualdade(estado.ordemRepresentatividade, "decrescente")
})

Deno.test("ordenação padrão e preferência persistida são isoladas por conta", () => {
    const armazenamento = armazenamentoMemoria()
    verificarIgualdade(lerOrdenacaoPanorama("conta-a", armazenamento), ORDENACAO_PANORAMA_PADRAO)
    const tomNegativo: OrdenacaoPanorama = { criterio: "tom", direcao: "negativo" }
    salvarOrdenacaoPanorama("conta-a", tomNegativo, armazenamento)
    verificarIgualdade(lerOrdenacaoPanorama("conta-a", armazenamento), tomNegativo)
    verificarIgualdade(lerOrdenacaoPanorama("conta-b", armazenamento), ORDENACAO_PANORAMA_PADRAO)
})

Deno.test("trocar critério reinicia e o mesmo critério percorre seus estados", () => {
    let ordenacao: OrdenacaoPanorama = { criterio: "representatividade", direcao: "crescente" }
    ordenacao = avancarOrdenacaoPanorama(ordenacao, "tom")
    verificarIgualdade(ordenacao, { criterio: "tom", direcao: "positivo" })
    ordenacao = avancarOrdenacaoPanorama(ordenacao, "tom")
    verificarIgualdade(ordenacao, { criterio: "tom", direcao: "negativo" })
    ordenacao = avancarOrdenacaoPanorama(ordenacao, "tom")
    verificarIgualdade(ordenacao, { criterio: "tom", direcao: "ausentePrimeiro" })
    ordenacao = avancarOrdenacaoPanorama(ordenacao, "representatividade")
    verificarIgualdade(ordenacao, { criterio: "representatividade", direcao: "decrescente" })
})

Deno.test("representatividade ordena os empates pelo nome crescente", () => {
    const resultado = ordenarCategoriasPanorama([
        categoria("Gama", 0.5, null),
        categoria("Alfa", 0.5, null),
        categoria("Beta", 0.8, null)
    ], ORDENACAO_PANORAMA_PADRAO)
    verificarIgualdade(resultado.map(({ nome }) => nome), ["Beta", "Alfa", "Gama"])
})

Deno.test("Tom positivo e negativo ordenam valores definidos antes da ausência", () => {
    const itens = [categoria("Nulo", 0.9, null), categoria("Zero", 0.2, 0), categoria("Positivo", 0.3, 40), categoria("Negativo", 0.4, -30)]
    verificarIgualdade(ordenarCategoriasPanorama(itens, { criterio: "tom", direcao: "positivo" }).map(({ nome }) => nome), [
        "Positivo",
        "Zero",
        "Negativo",
        "Nulo"
    ])
    verificarIgualdade(ordenarCategoriasPanorama(itens, { criterio: "tom", direcao: "negativo" }).map(({ nome }) => nome), [
        "Negativo",
        "Zero",
        "Positivo",
        "Nulo"
    ])
})

Deno.test("Tom sem valor fica primeiro sem ordenar por Tom os valores definidos", () => {
    const itens = [
        categoria("Zero", 0.3, 0),
        categoria("Nulo B", 0.2, null),
        categoria("Nulo A", 0.2, null),
        categoria("Positivo", 0.9, 50)
    ]
    verificarIgualdade(ordenarCategoriasPanorama(itens, { criterio: "tom", direcao: "ausentePrimeiro" }).map(({ nome }) => nome), [
        "Nulo A",
        "Nulo B",
        "Positivo",
        "Zero"
    ])
})
