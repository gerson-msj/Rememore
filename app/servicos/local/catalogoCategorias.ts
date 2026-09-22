import { BancoLocal, bancoLocal } from "./banco.ts"
import { STORE_CATALOGOS_CATEGORIAS } from "./esquema.ts"

export interface CategoriaPreservada {
    id: string
    nome: string
    versao: number
    ativa: boolean
}

export interface CatalogoCategorias {
    idConta: string
    revisao: string
    categorias: CategoriaPreservada[]
}

export class RepositorioCatalogoCategorias {
    constructor(private readonly banco: BancoLocal = bancoLocal) {}

    obter(idConta: string): Promise<CatalogoCategorias | undefined> {
        return this.banco.transacao(
            [STORE_CATALOGOS_CATEGORIAS],
            "readonly",
            "read",
            (transacao) => transacao.objectStore(STORE_CATALOGOS_CATEGORIAS).get(idConta)
        )
    }

    async gravar(catalogo: CatalogoCategorias): Promise<void> {
        await this.banco.transacao(
            [STORE_CATALOGOS_CATEGORIAS],
            "readwrite",
            "write",
            (transacao) => transacao.objectStore(STORE_CATALOGOS_CATEGORIAS).put(catalogo)
        )
    }
}

export const catalogosCategorias = new RepositorioCatalogoCategorias()
