import type { CategoriaPreservada } from "../local/catalogoCategorias.ts"
import type { BlocoProjecaoRememorar } from "../local/projecaoRememorar.ts"

export interface MemoriaReferenciaRememorar {
    id: string
    data: string
    conteudo: string
    categorias: string[]
    tom: number | null
    complementos: { id: string; conteudo: string }[]
}

export interface CenarioAcervoRememorar {
    dias: string[]
    memorias: MemoriaReferenciaRememorar[]
}

const NOMES_CATEGORIAS = [
    "Família",
    "Amizade",
    "Trabalho",
    "Aprendizado",
    "Saúde",
    "Viagem",
    "Casa",
    "Natureza",
    "Conquista",
    "Desafio",
    "Infância",
    "Relacionamento",
    "Criatividade",
    "Descanso",
    "Mudança",
    "Comunidade",
    "Espiritualidade",
    "Lazer",
    "Finanças",
    "Rotina",
    "Animais",
    "Comida",
    "Estudo",
    "Projetos",
    "Autocuidado",
    "Cultura",
    "Medos",
    "Gratidão",
    "Perdas",
    "Celebrações",
    "Esportes",
    "Tecnologia",
    "Voluntariado",
    "Música",
    "Leitura",
    "Saudade",
    "Recomeços",
    "Pequenos gestos",
    "Viagens antigas",
    "Outros temas"
]

export const catalogoReferenciaRememorar: CategoriaPreservada[] = NOMES_CATEGORIAS.map((nome, indice) => ({
    id: `categoria-${String(indice + 1).padStart(2, "0")}`,
    nome,
    versao: 1,
    ativa: indice !== 36 && indice !== 38
}))

function dataReferencia(indice: number): string {
    const data = new Date(Date.UTC(2026, 0, 1))
    data.setUTCDate(data.getUTCDate() - indice * (indice % 5 === 0 ? 2 : 1))
    return data.toISOString().slice(0, 10)
}

function categoriaReferencia(indiceDia: number, indiceMemoria: number): string {
    const faixa = (indiceDia * 19 + indiceMemoria * 23) % 100
    const categoria = faixa < 35
        ? 0
        : faixa < 52
        ? 1
        : faixa < 65
        ? 2
        : faixa < 74
        ? 3
        : faixa < 82
        ? 4
        : faixa < 88
        ? 5
        : faixa < 93
        ? 6
        : faixa < 97
        ? 7
        : (indiceDia + indiceMemoria) % 32 + 8
    return catalogoReferenciaRememorar[categoria % catalogoReferenciaRememorar.length].id
}

function criarUniverso(): CenarioAcervoRememorar {
    const dias: string[] = []
    const memorias: MemoriaReferenciaRememorar[] = []
    const tons: (number | null)[] = [null, -85, -55, -25, 0, 18, 47, 82, null, 35]
    for (let indiceDia = 0; indiceDia < 300; indiceDia++) {
        const data = dataReferencia(indiceDia)
        dias.push(data)
        const quantidade = 1 + ((indiceDia * 7 + Math.floor(indiceDia / 3)) % 15)
        for (let indiceMemoria = 0; indiceMemoria < quantidade; indiceMemoria++) {
            const id = `memoria-${String(indiceDia + 1).padStart(3, "0")}-${String(indiceMemoria + 1).padStart(2, "0")}`
            const categorias = [categoriaReferencia(indiceDia, indiceMemoria)]
            if ((indiceDia * 11 + indiceMemoria) % 17 === 0) {
                categorias.push(catalogoReferenciaRememorar[(indiceDia * 3 + indiceMemoria * 5 + 9) % 40].id)
            }
            const quantidadeAdendos = (indiceDia + indiceMemoria * 2) % 4
            memorias.push({
                id,
                data,
                conteudo: `Memória ${indiceDia + 1}.${indiceMemoria + 1}`,
                categorias,
                tom: tons[(indiceDia * 3 + indiceMemoria * 7) % tons.length],
                complementos: Array.from({ length: quantidadeAdendos }, (_, indiceAdendo) => ({
                    id: `${id}-adendo-${indiceAdendo + 1}`,
                    conteudo: `Adendo ${indiceAdendo + 1}`
                }))
            })
        }
    }
    return { dias, memorias }
}

const universo = criarUniverso()

export function obterCenarioAcervoRememorar(quantidadeDias: 2 | 7 | 30 | 300): CenarioAcervoRememorar {
    const dias = universo.dias.slice(0, quantidadeDias)
    const conjuntoDias = new Set(dias)
    return {
        dias: [...dias],
        memorias: universo.memorias.filter((memoria) => conjuntoDias.has(memoria.data)).map((memoria) => structuredClone(memoria))
    }
}

export function projetarDiaAcervoRememorar(idConta: string, cenario: CenarioAcervoRememorar, data: string): BlocoProjecaoRememorar {
    const porCategoria = new Map<string, (number | null)[]>()
    for (const memoria of cenario.memorias) {
        if (memoria.data !== data) continue
        for (const idCategoria of memoria.categorias) {
            const tons = porCategoria.get(idCategoria) ?? []
            tons.push(memoria.tom)
            porCategoria.set(idCategoria, tons)
        }
    }
    return {
        idConta,
        data,
        categorias: [...porCategoria].map(([idCategoria, tons]) => ({ idCategoria, tons }))
    }
}
