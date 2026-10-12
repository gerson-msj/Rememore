import type { CategoriaPreservada } from "../local/catalogoCategorias.ts"

export interface DeltaCatalogo {
    revisao: string
    alteracoes: CategoriaPreservada[]
}

export interface ServicoCatalogoCategorias {
    consultar(idConta: string, revisaoConhecida: string | null): Promise<DeltaCatalogo>
}
