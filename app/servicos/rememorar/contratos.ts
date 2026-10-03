import type { BlocoProjecaoRememorar } from "../local/projecaoRememorar.ts"

export type RespostaProjecaoRemota =
    | { tipo: "completa"; revisao: string; blocos: BlocoProjecaoRememorar[] }
    | { tipo: "incremental"; revisao: string; blocos: BlocoProjecaoRememorar[]; removidas: string[] }
    | { tipo: "atualizada"; revisao: string }

export interface ServicoProjecaoRemota {
    consultar(idConta: string, revisaoConhecida: string | null): Promise<RespostaProjecaoRemota>
    reconstruir(idConta: string): Promise<{ revisao: string; blocos: BlocoProjecaoRememorar[] }>
}
