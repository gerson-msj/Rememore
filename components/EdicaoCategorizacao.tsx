import { useEffect, useState } from "preact/hooks"
import Categorizacao from "./Categorizacao.tsx"
import SeletorCategoria from "./SeletorCategoria.tsx"
import PesquisaCategoriaPopup from "./PesquisaCategoriaPopup.tsx"
import { orientar } from "../app/servicos/orientacao.ts"
import { normalizarPesquisa } from "../app/utilitarios/pesquisaTexto.ts"
import type { AssociacaoCategoria, CapturaLocal } from "../app/servicos/local/capturas.ts"
import type { CatalogoCategorias } from "../app/servicos/local/catalogoCategorias.ts"
import {
    apresentarCategoria,
    categoriasDisponiveis,
    chaveCategoria,
    type EdicaoCategorias,
    pesquisarCategorias
} from "../app/servicos/captura/categorizacao.ts"

export default function EdicaoCategorizacao({ captura, edicao, catalogo, ocupado, aoSelecionar, aoNavegar }: {
    captura: CapturaLocal
    edicao: EdicaoCategorias
    catalogo?: CatalogoCategorias
    ocupado: boolean
    aoSelecionar: (selecionadas: AssociacaoCategoria[]) => void
    aoNavegar: (idMemoria: string) => void
}) {
    const [aberto, definirAberto] = useState(false)
    const [consulta, definirConsulta] = useState("")
    const [pesquisa, definirPesquisa] = useState("")
    useEffect(() => {
        const temporizador = setTimeout(() => definirPesquisa(consulta), 180)
        return () => clearTimeout(temporizador)
    }, [consulta])
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)!
    const selecionadas = (memoria.categorias ?? []).map((item) => apresentarCategoria(item, catalogo))
    const disponiveis = categoriasDisponiveis(captura, catalogo)
    const resultado = consulta === pesquisa
        ? pesquisarCategorias(disponiveis, pesquisa)
        : { resultados: [], aproximados: false, novaCategoria: undefined }
    const ordenadas = [...captura.memorias].sort((a, b) => a.ordem - b.ordem)
    const indice = ordenadas.findIndex((item) => item.id === memoria.id)
    const anterior = ordenadas[indice - 1]
    const proxima = ordenadas[indice + 1]

    function incluir(categoria: AssociacaoCategoria) {
        if (
            !edicao.autorizada || ocupado || selecionadas.some((item) => item.chave === chaveCategoria(categoria)) ||
            (categoria.idCategoria === null &&
                selecionadas.some((item) => normalizarPesquisa(item.nome) === normalizarPesquisa(categoria.nome)))
        ) return
        definirAberto(false)
        aoSelecionar([...(memoria.categorias ?? []), { idCategoria: categoria.idCategoria, nome: categoria.nome }])
    }
    return (
        <>
            <fieldset disabled={ocupado} class="categorizacao-controles">
                <Categorizacao
                    conteudo={memoria.conteudo}
                    complementos={memoria.complementos}
                    selecionadas={selecionadas}
                    editavel={edicao.autorizada}
                    orientacao={orientar("categorizacao")}
                    aoPesquisar={() => {
                        if (!edicao.autorizada || ocupado) return
                        definirConsulta("")
                        definirPesquisa("")
                        definirAberto(true)
                    }}
                    aoRemover={(opcao) => {
                        if (!edicao.autorizada || ocupado) return
                        aoSelecionar((memoria.categorias ?? []).filter((item) => chaveCategoria(item) !== opcao.chave))
                    }}
                />
                <nav class="categorizacao-navegacao buttons has-addons" aria-label="Navegação entre memórias">
                    <button
                        type="button"
                        class="button"
                        aria-label="Memória anterior"
                        title="Memória anterior"
                        disabled={ocupado || !anterior}
                        onClick={() => {
                            if (anterior && !ocupado) aoNavegar(anterior.id)
                        }}
                    >
                        <span class="icon">
                            <i class="fas fa-chevron-left" aria-hidden="true" />
                        </span>
                        <span>Anterior</span>
                    </button>
                    <button
                        type="button"
                        class="button"
                        aria-label="Próxima memória"
                        title="Próxima memória"
                        disabled={ocupado || !proxima}
                        onClick={() => {
                            if (proxima && !ocupado) aoNavegar(proxima.id)
                        }}
                    >
                        <span>Próxima</span>
                        <span class="icon">
                            <i class="fas fa-chevron-right" aria-hidden="true" />
                        </span>
                    </button>
                </nav>
            </fieldset>
            <PesquisaCategoriaPopup aberto={aberto && edicao.autorizada} aoFechar={() => definirAberto(false)}>
                <SeletorCategoria
                    consulta={consulta}
                    selecionadas={selecionadas}
                    {...resultado}
                    pesquisando={consulta !== pesquisa}
                    aoPesquisar={definirConsulta}
                    aoAlternar={(opcao) => {
                        const categoria = disponiveis.find((item) => item.chave === opcao.chave)
                        if (categoria) incluir(categoria)
                    }}
                    aoCriar={(nome) => incluir({ idCategoria: null, nome })}
                />
            </PesquisaCategoriaPopup>
        </>
    )
}
