import type { AssociacaoCategoria, CapturaLocal } from "../local/capturas.ts"
import type { CatalogoCategorias } from "../local/catalogoCategorias.ts"
import { permiteEdicao } from "./edicao.ts"
import { correspondeAproximadamente, normalizarPesquisa } from "../../utilitarios/pesquisaTexto.ts"

export interface CategoriaDisponivel extends AssociacaoCategoria {
    chave: string
}

export interface EdicaoCategorias {
    idAreaTrabalho: string
    idMemoria: string
    autorizada: boolean
    originais: AssociacaoCategoria[]
    selecionadas: AssociacaoCategoria[]
    rolagem: number
}

export function chaveCategoria(categoria: AssociacaoCategoria): string {
    return categoria.idCategoria === null ? `local:${normalizarPesquisa(categoria.nome)}` : `servidor:${categoria.idCategoria}`
}

export function apresentarCategoria(categoria: AssociacaoCategoria, catalogo?: CatalogoCategorias): CategoriaDisponivel {
    const preservada = catalogo?.categorias.find((item) => item.id === categoria.idCategoria)
    return { ...categoria, nome: preservada?.nome ?? categoria.nome, chave: chaveCategoria(categoria) }
}

export function categoriasDisponiveis(captura: CapturaLocal, catalogo?: CatalogoCategorias): CategoriaDisponivel[] {
    const disponiveis = new Map<string, CategoriaDisponivel>()
    for (const categoria of catalogo?.categorias ?? []) {
        if (!categoria.ativa) continue
        const opcao = apresentarCategoria({ idCategoria: categoria.id, nome: categoria.nome }, catalogo)
        disponiveis.set(opcao.chave, opcao)
    }
    for (const memoria of captura.memorias) {
        for (const categoria of memoria.categorias ?? []) {
            const opcao = apresentarCategoria(categoria, catalogo)
            disponiveis.set(opcao.chave, opcao)
        }
    }
    return [...disponiveis.values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
}

export function pesquisarCategorias(disponiveis: CategoriaDisponivel[], consulta: string) {
    const normalizada = normalizarPesquisa(consulta)
    const simples = disponiveis.filter((item) => normalizarPesquisa(item.nome).includes(normalizada))
    if (!normalizada || simples.length) return { resultados: simples, aproximados: false, novaCategoria: undefined }
    return {
        resultados: disponiveis.filter((item) => correspondeAproximadamente(consulta, item.nome)),
        aproximados: true,
        novaCategoria: consulta.trim()
    }
}

/** A regra de salvamento compara conjuntos; desmarcar e remarcar não cria pendência artificial. */
export function mesmasCategorias(a: AssociacaoCategoria[], b: AssociacaoCategoria[]): boolean {
    const chavesA = new Set(a.map(chaveCategoria))
    const chavesB = new Set(b.map(chaveCategoria))
    return chavesA.size === chavesB.size && [...chavesA].every((chave) => chavesB.has(chave))
}

export function abrirCategorizacao(captura: CapturaLocal, idMemoria: string, rolagem: number, agora = Date.now()): EdicaoCategorias {
    const memoria = captura.memorias.find((item) => item.id === idMemoria)
    if (!memoria) throw new Error("Memória ausente")
    const originais = structuredClone(memoria.categorias ?? [])
    return {
        idAreaTrabalho: captura.idAreaTrabalho,
        idMemoria,
        autorizada: permiteEdicao(memoria.primeiraPreservacaoEm, captura.prazoEdicaoDias, agora),
        originais,
        selecionadas: structuredClone(originais),
        rolagem
    }
}

function compativel(captura: CapturaLocal, edicao: EdicaoCategorias): boolean {
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)
    return edicao.idAreaTrabalho === captura.idAreaTrabalho && Boolean(memoria) &&
        mesmasCategorias(memoria?.categorias ?? [], edicao.originais)
}

export async function salvarCategorias(
    captura: CapturaLocal,
    edicao: EdicaoCategorias,
    gravar: (captura: CapturaLocal) => Promise<void>
): Promise<CapturaLocal> {
    if (!edicao.autorizada || !compativel(captura, edicao)) throw new Error("Categorização indisponível")
    if (mesmasCategorias(edicao.originais, edicao.selecionadas)) return captura
    const categorias = edicao.selecionadas.map(({ idCategoria, nome }) => ({ idCategoria, nome: nome.trim() }))
    if (categorias.some((item) => !item.nome) || new Set(categorias.map(chaveCategoria)).size !== categorias.length) {
        throw new Error("Associações inválidas")
    }
    const proxima = {
        ...captura,
        alterada: true,
        memorias: captura.memorias.map((item) => item.id === edicao.idMemoria ? { ...item, categorias } : item)
    }
    await gravar(proxima)
    return proxima
}

/** Guarda somente o contexto autorizado. Um reload descarta seleções transitórias, conforme a unidade. */
export class SessaoCategorizacao {
    private readonly chave: string
    constructor(idConta: string, data: string, private readonly armazenamento: Storage) {
        this.chave = `rememore:categorizacao:v1:${JSON.stringify([idConta, data])}`
    }
    gravar({ selecionadas: _selecionadas, ...contexto }: EdicaoCategorias) {
        this.armazenamento.setItem(this.chave, JSON.stringify(contexto))
    }
    limpar() {
        this.armazenamento.removeItem(this.chave)
    }
    retomar(captura: CapturaLocal, mesmaSessao: boolean): EdicaoCategorias | null {
        const bruto = this.armazenamento.getItem(this.chave)
        if (bruto && mesmaSessao) {
            const contexto = JSON.parse(bruto)
            if (
                typeof contexto.idMemoria === "string" && typeof contexto.autorizada === "boolean" &&
                Number.isFinite(contexto.rolagem) && Array.isArray(contexto.originais) &&
                contexto.originais.every((item: AssociacaoCategoria) =>
                    item && typeof item.nome === "string" && (item.idCategoria === null || typeof item.idCategoria === "string")
                )
            ) {
                const edicao = { ...contexto, selecionadas: structuredClone(contexto.originais) }
                if (compativel(captura, edicao)) return edicao
            }
        }
        this.limpar()
        return null
    }
}
