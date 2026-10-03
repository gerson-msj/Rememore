import type { CatalogoCategorias } from "./local/catalogoCategorias.ts"
import { type BlocoProjecaoRememorar, type MetadadosProjecaoRememorar, projecaoRememorarLocal } from "./local/projecaoRememorar.ts"
import { prepararCatalogo } from "./categorias.ts"
import { prepararCatalogoReferenciaSimulado } from "./categorias/simulado.ts"
import { catalogoReferenciaRememorar } from "./rememorar/acervo.ts"
import { projecaoRemotaSimulada } from "./rememorar/simulado.ts"
import { sincronizarProjecaoRememorar } from "./rememorar/projecao.ts"

export interface EstadoPreparacaoRememorar {
    projecao: { status: "ready" | "failed"; metadados?: MetadadosProjecaoRememorar; blocos: BlocoProjecaoRememorar[] }
    catalogo: { status: "ready" | "failed"; dados?: CatalogoCategorias }
}

/** Mantém a ordem funcional e deixa falhas independentes sem transformar caches em conteúdo vazio. */
export async function executarPreparacaoRememorar<TProjecao, TCatalogo>(
    prepararProjecao: () => Promise<TProjecao>,
    prepararCategorias: () => Promise<TCatalogo>
) {
    let projecao: { status: "ready"; dados: TProjecao } | { status: "failed" }
    try {
        projecao = { status: "ready", dados: await prepararProjecao() }
    } catch {
        projecao = { status: "failed" }
    }
    let catalogo: { status: "ready"; dados: TCatalogo } | { status: "failed" }
    try {
        catalogo = { status: "ready", dados: await prepararCategorias() }
    } catch {
        catalogo = { status: "failed" }
    }
    return { projecao, catalogo }
}

export async function prepararDadosRememorar(idConta: string): Promise<EstadoPreparacaoRememorar> {
    const resultado = await executarPreparacaoRememorar(
        async () => {
            await navigator.locks.request(
                `rememore:projecao-rememorar:${idConta}`,
                () => sincronizarProjecaoRememorar(idConta, projecaoRememorarLocal, projecaoRemotaSimulada)
            )
            const [metadados, blocos] = await Promise.all([
                projecaoRememorarLocal.obterMetadados(idConta),
                projecaoRememorarLocal.listar(idConta)
            ])
            return { metadados, blocos }
        },
        async () => {
            prepararCatalogoReferenciaSimulado(idConta, catalogoReferenciaRememorar)
            return await prepararCatalogo(idConta)
        }
    )

    let projecao: EstadoPreparacaoRememorar["projecao"]
    if (resultado.projecao.status === "ready") {
        projecao = { status: "ready", ...resultado.projecao.dados }
    } else {
        try {
            const [metadados, blocos] = await Promise.all([
                projecaoRememorarLocal.obterMetadados(idConta),
                projecaoRememorarLocal.listar(idConta)
            ])
            projecao = { status: "failed", metadados, blocos }
        } catch {
            projecao = { status: "failed", blocos: [] }
        }
    }

    const dadosCatalogo = resultado.catalogo.status === "ready" ? resultado.catalogo.dados : undefined
    return {
        projecao,
        catalogo: dadosCatalogo?.catalogo
            ? { status: dadosCatalogo.falhou ? "failed" : "ready", dados: dadosCatalogo.catalogo }
            : { status: "failed" }
    }
}
