import {
    avancarOrdenacaoPanorama,
    type CategoriaOrdenavelPanorama,
    estadoInicialOrdenacaoPanorama,
    ordenarCategoriasPanorama
} from "./ordenacaoPanorama.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

interface CategoriaTeste extends CategoriaOrdenavelPanorama {
    identificador: string
}

const categorias: CategoriaTeste[] = [
    { identificador: "b", nome: "Beta", representatividade: 0.5, tom: 40 },
    { identificador: "ausente-2", nome: "Casa", representatividade: 0.2, tom: null },
    { identificador: "neutro", nome: "Neutro", representatividade: 0.9, tom: 0 },
    { identificador: "a", nome: "Alfa", representatividade: 0.5, tom: 40 },
    { identificador: "negativo", nome: "Negativo", representatividade: 0.7, tom: -40 },
    { identificador: "ausente-1", nome: "Ausência", representatividade: 0.8, tom: null },
    { identificador: "positivo", nome: "Positivo", representatividade: 0.3, tom: 80 }
]

function ids(estado = estadoInicialOrdenacaoPanorama): string[] {
    return ordenarCategoriasPanorama(categorias, estado).map((categoria) => categoria.identificador)
}

Deno.test("Representatividade começa em +, alterna e retorna para +", () => {
    let estado = estadoInicialOrdenacaoPanorama
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    igual(estado.ordemRepresentatividade, "crescente")
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    igual(estado.ordemRepresentatividade, "decrescente")
})

Deno.test("Tom começa em + e percorre +, −, ∅, +", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "tom")
    igual(estado.ordemTom, "decrescente")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(estado.ordemTom, "crescente")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(estado.ordemTom, "ausentes-primeiro")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(estado.ordemTom, "decrescente")
})

Deno.test("trocar o critério reinicia os subestados em +", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "representatividade")
    igual(estado.ordemRepresentatividade, "crescente")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(estado.ordemRepresentatividade, "decrescente")
    igual(estado.ordemTom, "decrescente")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    estado = avancarOrdenacaoPanorama(estado, "representatividade")
    igual(estado.ordemTom, "decrescente")
    igual(estado.ordemRepresentatividade, "decrescente")
})

Deno.test("Representatividade ordena em ambas as direções e desempata alfabeticamente", () => {
    igual(ids(), ["neutro", "ausente-1", "negativo", "a", "b", "positivo", "ausente-2"])
    const estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "representatividade")
    igual(ids(estado), ["ausente-2", "positivo", "a", "b", "negativo", "ausente-1", "neutro"])
})

Deno.test("Tom + ordena valores decrescentes, zero normalmente e ausentes ao final", () => {
    const estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "tom")
    igual(ids(estado), ["positivo", "a", "b", "neutro", "negativo", "ausente-1", "ausente-2"])
})

Deno.test("Tom − ordena valores crescentes e ausentes ao final", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "tom")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(ids(estado), ["negativo", "neutro", "a", "b", "positivo", "ausente-1", "ausente-2"])
})

Deno.test("Tom ∅ põe ausentes primeiro e ordena ambos os grupos por representatividade", () => {
    let estado = avancarOrdenacaoPanorama(estadoInicialOrdenacaoPanorama, "tom")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    estado = avancarOrdenacaoPanorama(estado, "tom")
    igual(ids(estado), ["ausente-1", "ausente-2", "neutro", "negativo", "a", "b", "positivo"])
})
