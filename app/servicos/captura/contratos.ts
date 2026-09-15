/** Formato remoto preservado independentemente dos campos do IndexedDB. */
export interface ComplementoPreservado {
    id: string
    content: string
    firstPreservedAt: string | null
}

export interface MemoriaPreservada {
    id: string
    content: string
    order: number
    firstPreservedAt: string | null
    complements: ComplementoPreservado[]
}

export type ResultadoMetadadosCaptura =
    | { status: "found"; revision: string; editWindowDays: number }
    | { status: "absent"; editWindowDays: number }
    | { status: "failed" }

export type ResultadoCapturaPreservada =
    | { status: "found"; revision: string; memories: MemoriaPreservada[]; editWindowDays: number }
    | { status: "absent" }
    | { status: "failed" }

export interface ServicoCapturasPreservadas {
    /** Consulta leve de existência, revisão e parâmetros operacionais; não transmite memórias. */
    inspect(idConta: string, dataCaptura: string): Promise<ResultadoMetadadosCaptura>
    /** Retorna uma composição consistente com a revisão e os parâmetros da mesma leitura. */
    read(idConta: string, dataCaptura: string): Promise<ResultadoCapturaPreservada>
}
