import { useEffect, useState } from "preact/hooks"
import Categorizacao from "./Categorizacao.tsx"
import SeletorCategoria from "./SeletorCategoria.tsx"
import { orientar } from "../app/servicos/orientacao.ts"
import type { AssociacaoCategoria, CapturaLocal } from "../app/servicos/local/capturas.ts"
import type { CatalogoCategorias } from "../app/servicos/local/catalogoCategorias.ts"
import {
    apresentarCategoria,
    categoriasDisponiveis,
    chaveCategoria,
    type EdicaoCategorias,
    pesquisarCategorias
} from "../app/servicos/captura/categorizacao.ts"

export default function EdicaoCategorizacao({ captura, edicao, catalogo, ocupado, aoSelecionar }: {
    captura: CapturaLocal
    edicao: EdicaoCategorias
    catalogo?: CatalogoCategorias
    ocupado: boolean
    aoSelecionar: (selecionadas: AssociacaoCategoria[]) => void
}) {
    const [consulta, definirConsulta] = useState("")
    const [pesquisa, definirPesquisa] = useState("")
    useEffect(() => {
        const temporizador = setTimeout(() => definirPesquisa(consulta), 180)
        return () => clearTimeout(temporizador)
    }, [consulta])
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)!
    const selecionadas = edicao.selecionadas.map((item) => apresentarCategoria(item, catalogo))
    const disponiveis = [...new Map([
        ...categoriasDisponiveis(captura, catalogo),
        ...selecionadas
    ].map((item) => [item.chave, item])).values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    const resultado = pesquisarCategorias(disponiveis, pesquisa)
    function alternar(categoria: AssociacaoCategoria) {
        if (!edicao.autorizada || ocupado) return
        const chave = chaveCategoria(categoria)
        aoSelecionar(
            edicao.selecionadas.some((item) => chaveCategoria(item) === chave)
                ? edicao.selecionadas.filter((item) => chaveCategoria(item) !== chave)
                : [...edicao.selecionadas, { idCategoria: categoria.idCategoria, nome: categoria.nome }]
        )
    }
    return (
        <fieldset disabled={ocupado} class="categorizacao-controles">
            <Categorizacao
                conteudo={memoria.conteudo}
                complementos={memoria.complementos}
                selecionadas={selecionadas}
                editavel={edicao.autorizada}
                orientacao={orientar("categorizacao")}
                aoRemover={(opcao) => {
                    const categoria = selecionadas.find((item) => item.chave === opcao.chave)
                    if (categoria) alternar(categoria)
                }}
            >
                <SeletorCategoria
                    consulta={consulta}
                    selecionadas={selecionadas}
                    {...resultado}
                    aoPesquisar={definirConsulta}
                    aoAlternar={(opcao) => {
                        const categoria = disponiveis.find((item) => item.chave === opcao.chave)
                        if (categoria) alternar(categoria)
                    }}
                    aoCriar={(nome) => alternar({ idCategoria: null, nome })}
                />
            </Categorizacao>
        </fieldset>
    )
}
