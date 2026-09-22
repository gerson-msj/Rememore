import type { CapturaLocal } from "../local/capturas.ts"

export interface EdicaoMemoria {
    idAreaTrabalho: string
    idMemoria: string
    /** Ausente nos rascunhos anteriores e nas edições do texto principal. */
    idComplemento?: string
    idsComplementosBase?: string[]
    nova: boolean
    autorizada: boolean
    original: string
    texto: string
    suja: boolean
    rolagem: number
}

export function abrirEdicao(captura: CapturaLocal, id: string | null, rolagem: number, agora = Date.now()): EdicaoMemoria {
    const memoria = captura.memorias.find((item) => item.id === id)
    if (id !== null && !memoria) throw new Error("Memória ausente")
    const edicao = {
        idAreaTrabalho: captura.idAreaTrabalho,
        idMemoria: memoria?.id ?? crypto.randomUUID(),
        nova: id === null,
        autorizada: permiteEdicao(memoria?.primeiraPreservacaoEm ?? null, captura.prazoEdicaoDias, agora),
        original: memoria?.conteudo ?? "",
        texto: memoria?.conteudo ?? "",
        suja: false,
        rolagem
    }
    const ultimo = memoria?.complementos.at(-1)
    if (!edicao.autorizada && ultimo && permiteEdicao(ultimo.primeiraPreservacaoEm, captura.prazoEdicaoDias, agora)) {
        return {
            ...edicao,
            idComplemento: ultimo.id,
            idsComplementosBase: memoria!.complementos.map((item) => item.id),
            autorizada: true,
            original: ultimo.conteudo,
            texto: ultimo.conteudo
        }
    }
    return edicao
}

export function permiteEdicao(primeiraPreservacaoEm: string | null, prazoDias: number, agora: number) {
    return primeiraPreservacaoEm === null || agora < Date.parse(primeiraPreservacaoEm) + prazoDias * 86400000
}

export function abrirComplemento(captura: CapturaLocal, idMemoria: string, rolagem: number, agora = Date.now()): EdicaoMemoria {
    const leitura = abrirEdicao(captura, idMemoria, rolagem, agora)
    if (leitura.autorizada) throw new Error("Já existe conteúdo editável")
    const memoria = captura.memorias.find((item) => item.id === idMemoria)!
    return {
        ...leitura,
        idComplemento: crypto.randomUUID(),
        idsComplementosBase: memoria.complementos.map((item) => item.id),
        nova: true,
        autorizada: true,
        original: "",
        texto: ""
    }
}

/** O chamador mantém a posse durante toda a gravação e publica o resultado somente após commit. */
export async function confirmarMemoria(captura: CapturaLocal, edicao: EdicaoMemoria, gravar: (captura: CapturaLocal) => Promise<void>) {
    if (edicao.idComplemento !== undefined) throw new Error("Alvo não é memória")
    if (!edicao.autorizada || !edicao.texto.trim() || !edicaoCompativel(captura, edicao)) throw new Error("Edição inválida")
    if (!edicao.nova && edicao.texto === edicao.original) return captura
    const memorias = edicao.nova
        ? [...captura.memorias, {
            id: edicao.idMemoria,
            conteudo: edicao.texto,
            ordem: Math.max(-1, ...captura.memorias.map((item) => item.ordem)) + 1,
            primeiraPreservacaoEm: null,
            complementos: []
        }]
        : captura.memorias.map((item) => item.id === edicao.idMemoria ? { ...item, conteudo: edicao.texto } : item)
    const proxima = { ...captura, memorias, alterada: true }
    await gravar(proxima)
    return proxima
}

export async function confirmarComplemento(captura: CapturaLocal, edicao: EdicaoMemoria, gravar: (captura: CapturaLocal) => Promise<void>) {
    if (!edicao.idComplemento || !edicao.autorizada || !edicao.texto.trim() || !edicaoCompativel(captura, edicao)) {
        throw new Error("Edição de complemento inválida")
    }
    if (!edicao.nova && edicao.texto === edicao.original) return captura
    const idComplemento = edicao.idComplemento
    const memorias = captura.memorias.map((memoria) =>
        memoria.id !== edicao.idMemoria ? memoria : {
            ...memoria,
            complementos: edicao.nova
                ? [...memoria.complementos, { id: idComplemento, conteudo: edicao.texto, primeiraPreservacaoEm: null }]
                : memoria.complementos.map((item) => item.id === idComplemento ? { ...item, conteudo: edicao.texto } : item)
        }
    )
    const proxima = { ...captura, memorias, alterada: true }
    await gravar(proxima)
    return proxima
}

/** A cadeia confirmada determina o alvo; nunca remove memória e complementos em cascata. */
export async function excluirUltimoElemento(
    captura: CapturaLocal,
    edicao: EdicaoMemoria,
    gravar: (captura: CapturaLocal) => Promise<void>
) {
    if (edicao.nova || edicao.suja || edicao.texto !== edicao.original || !edicaoCompativel(captura, edicao)) {
        throw new Error("Exclusão indisponível durante esta edição")
    }
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)
    if (!memoria) throw new Error("Memória ausente")
    const memorias = memoria.complementos.length
        ? captura.memorias.map((item) => item.id === memoria.id ? { ...item, complementos: item.complementos.slice(0, -1) } : item)
        : captura.memorias.filter((item) => item.id !== memoria.id)
    const proxima = { ...captura, memorias, alterada: true }
    await gravar(proxima)
    return proxima
}

export async function moverMemoria(captura: CapturaLocal, id: string, direcao: -1 | 1, gravar: (captura: CapturaLocal) => Promise<void>) {
    const memorias = [...captura.memorias].sort((a, b) => a.ordem - b.ordem)
    const indice = memorias.findIndex((item) => item.id === id)
    const destino = indice + direcao
    if (indice < 0 || destino < 0 || destino >= memorias.length) return captura
    ;[memorias[indice], memorias[destino]] = [memorias[destino], memorias[indice]]
    const proxima = { ...captura, alterada: true, memorias: memorias.map((item, ordem) => ({ ...item, ordem })) }
    await gravar(proxima)
    return proxima
}

export function edicaoCompativel(captura: CapturaLocal, edicao: EdicaoMemoria): boolean {
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)
    if (edicao.idAreaTrabalho !== captura.idAreaTrabalho) return false
    if (edicao.idComplemento !== undefined) {
        if (
            !memoria || !Array.isArray(edicao.idsComplementosBase) ||
            JSON.stringify(memoria.complementos.map((item) => item.id)) !== JSON.stringify(edicao.idsComplementosBase)
        ) return false
        const ultimo = memoria.complementos.at(-1)
        return edicao.nova
            ? !memoria.complementos.some((item) => item.id === edicao.idComplemento)
            : ultimo?.id === edicao.idComplemento && ultimo.conteudo === edicao.original
    }
    return edicao.idAreaTrabalho === captura.idAreaTrabalho &&
        (edicao.nova ? !memoria : memoria?.conteudo === edicao.original)
}

export class RascunhoMemoria {
    private readonly chave: string
    constructor(idConta: string, data: string, private readonly armazenamento: Storage) {
        this.chave = `rememore:rascunho-memoria:v1:${JSON.stringify([idConta, data])}`
    }
    gravar(edicao: EdicaoMemoria) {
        this.armazenamento.setItem(this.chave, JSON.stringify(edicao))
    }
    limpar() {
        this.armazenamento.removeItem(this.chave)
    }
    retomar(captura: CapturaLocal, mesmaSessao: boolean): EdicaoMemoria | null {
        const bruto = this.armazenamento.getItem(this.chave)
        if (bruto && mesmaSessao) {
            const edicao = JSON.parse(bruto) as EdicaoMemoria
            if (
                typeof edicao.idMemoria === "string" && typeof edicao.nova === "boolean" &&
                typeof edicao.autorizada === "boolean" && typeof edicao.original === "string" &&
                typeof edicao.texto === "string" && typeof edicao.suja === "boolean" &&
                (edicao.idComplemento === undefined || typeof edicao.idComplemento === "string") &&
                Number.isFinite(edicao.rolagem) && edicaoCompativel(captura, edicao)
            ) return edicao
        }
        this.limpar()
        return null
    }
}
