import { useEffect, useRef, useState } from "preact/hooks"
import Categorizacao from "./Categorizacao.tsx"
import SeletorCategoria from "./SeletorCategoria.tsx"
import PesquisaCategoriaPopup from "./PesquisaCategoriaPopup.tsx"
import MensagemPopup from "./MensagemPopup.tsx"
import SeletorTom from "./SeletorTom.tsx"
import BalancoSentimental from "./BalancoSentimental.tsx"
import { nivelDaExperiencia, orientar } from "../app/servicos/orientacao.ts"
import { normalizarPesquisa } from "../app/utilitarios/pesquisaTexto.ts"
import type { AssociacaoCategoria, CapturaLocal } from "../app/servicos/local/capturas.ts"
import type { CatalogoCategorias } from "../app/servicos/local/catalogoCategorias.ts"
import type { RascunhoBalanco } from "../app/servicos/captura/balanco.ts"
import {
    apresentarCategoria,
    categoriasDisponiveis,
    chaveCategoria,
    type EdicaoCategorias,
    pesquisarCategorias
} from "../app/servicos/captura/categorizacao.ts"

export default function EdicaoCategorizacao({
    captura,
    edicao,
    catalogo,
    ocupado,
    diasPreservadosDistintos,
    aoSelecionar,
    aoAlterarTom,
    aoNavegar,
    rascunhoBalanco,
    erroBalanco,
    aoRascunharBalanco,
    aoSalvarBalanco,
    aoExcluirBalanco,
    aoRegistrarProtecaoSaida
}: {
    captura: CapturaLocal
    edicao: EdicaoCategorias
    catalogo?: CatalogoCategorias
    ocupado: boolean
    diasPreservadosDistintos: number
    aoSelecionar: (selecionadas: AssociacaoCategoria[]) => void
    aoAlterarTom: (tom: number | null) => Promise<boolean>
    aoNavegar: (idMemoria: string) => void
    rascunhoBalanco: RascunhoBalanco | null
    erroBalanco: string
    aoRascunharBalanco: (rascunho: RascunhoBalanco | null) => void
    aoSalvarBalanco: (texto: string) => Promise<boolean>
    aoExcluirBalanco: () => Promise<boolean>
    aoRegistrarProtecaoSaida: (proteger: ((continuar: () => void) => void) | null) => void
}) {
    const memoria = captura.memorias.find((item) => item.id === edicao.idMemoria)!
    const tomInicial = memoria.tom ?? 0
    const [aberto, definirAberto] = useState(false)
    const [consulta, definirConsulta] = useState("")
    const [pesquisa, definirPesquisa] = useState("")
    const [tomTransitório, definirTomTransitório] = useState(tomInicial)
    const tomAtual = useRef(tomInicial)
    const tomConfirmado = useRef<number | null>(memoria.tom ?? null)
    const commitTom = useRef<Promise<boolean> | null>(null)
    const [confirmarDesativacao, definirConfirmarDesativacao] = useState(false)
    const protecaoBalanco = useRef<((continuar: () => void) => void) | null>(null)
    useEffect(() => {
        const temporizador = setTimeout(() => definirPesquisa(consulta), 180)
        return () => clearTimeout(temporizador)
    }, [consulta])
    const nivel = nivelDaExperiencia(diasPreservadosDistintos, captura.origemPreservada)
    const tomAtualConfirmado = memoria.tom ?? null
    useEffect(() => {
        const valor = memoria.tom ?? 0
        tomAtual.current = valor
        tomConfirmado.current = memoria.tom ?? null
        definirTomTransitório(valor)
    }, [memoria.id, memoria.tom])
    const selecionadas = (memoria.categorias ?? []).map((item) => apresentarCategoria(item, catalogo))
    const disponiveis = categoriasDisponiveis(captura, catalogo)
    const resultado = consulta === pesquisa
        ? pesquisarCategorias(disponiveis, pesquisa)
        : { resultados: [], aproximados: false, novaCategoria: undefined }
    const ordenadas = [...captura.memorias].sort((a, b) => a.ordem - b.ordem)
    const indice = ordenadas.findIndex((item) => item.id === memoria.id)
    const anterior = ordenadas[indice - 1]
    const proxima = ordenadas[indice + 1]

    function registrarProtecaoBalanco(proteger: ((continuar: () => void) => void) | null) {
        protecaoBalanco.current = proteger
        aoRegistrarProtecaoSaida(proteger)
    }

    function navegar(id: string) {
        if (protecaoBalanco.current) protecaoBalanco.current(() => aoNavegar(id))
        else aoNavegar(id)
    }

    function incluir(categoria: AssociacaoCategoria) {
        if (
            !edicao.autorizada || ocupado || selecionadas.some((item) => item.chave === chaveCategoria(categoria)) ||
            (categoria.idCategoria === null &&
                selecionadas.some((item) => normalizarPesquisa(item.nome) === normalizarPesquisa(categoria.nome)))
        ) return
        definirAberto(false)
        aoSelecionar([...(memoria.categorias ?? []), { idCategoria: categoria.idCategoria, nome: categoria.nome }])
    }

    async function finalizarTom() {
        if (commitTom.current) return await commitTom.current
        const valor = tomAtual.current
        if (!edicao.autorizada || ocupado || tomAtualConfirmado === null || valor === tomConfirmado.current) return
        const operacao = aoAlterarTom(valor)
        commitTom.current = operacao
        const salvo = await operacao
        commitTom.current = null
        if (salvo) tomConfirmado.current = valor
        else {
            const confirmado = tomConfirmado.current ?? 0
            tomAtual.current = confirmado
            definirTomTransitório(confirmado)
        }
    }

    async function ativarTom() {
        if (!edicao.autorizada || ocupado || tomAtualConfirmado !== null) return
        if (await aoAlterarTom(0)) {
            tomAtual.current = 0
            tomConfirmado.current = 0
            definirTomTransitório(0)
        }
    }

    function responderDesativacao(resultado: "confirm" | "cancel") {
        definirConfirmarDesativacao(false)
        if (resultado === "confirm" && edicao.autorizada && !ocupado) {
            void aoAlterarTom(null).then((salvo) => {
                if (!salvo) return
                tomAtual.current = 0
                tomConfirmado.current = null
                definirTomTransitório(0)
            })
        }
    }
    return (
        <>
            <fieldset disabled={ocupado} class="categorizacao-controles">
                <Categorizacao
                    conteudo={memoria.conteudo}
                    complementos={memoria.complementos}
                    selecionadas={selecionadas}
                    editavel={edicao.autorizada}
                    orientacao={orientar("categorizacao", nivel)}
                    tom={tomTransitório}
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
                {nivel !== "beginner" && (
                    <section class="categorizacao-tom" aria-labelledby="categorizacao-tom-titulo">
                        <h2 id="categorizacao-tom-titulo" class="title is-5">Tom</h2>
                        {edicao.autorizada && <p class="captura-orientacao">{orientar("tom", nivel)}</p>}
                        {edicao.autorizada && (
                            <label class="seletor-tom-ativacao">
                                <input
                                    type="checkbox"
                                    role="switch"
                                    checked={tomAtualConfirmado !== null}
                                    disabled={ocupado}
                                    onChange={(evento) => {
                                        if (evento.currentTarget.checked) void ativarTom()
                                        else definirConfirmarDesativacao(true)
                                    }}
                                />
                                <span class="seletor-tom-interruptor" aria-hidden="true" />
                                Registrar Tom
                            </label>
                        )}
                        <SeletorTom
                            id="categorizacao-tom"
                            valor={tomAtualConfirmado === null ? 0 : tomTransitório}
                            desabilitado={!edicao.autorizada || ocupado || tomAtualConfirmado === null}
                            aoAlterar={(valor) => {
                                tomAtual.current = valor
                                definirTomTransitório(valor)
                            }}
                            aoConcluir={() => void finalizarTom()}
                        />
                    </section>
                )}
            </fieldset>
            {nivel !== "beginner" && (
                <BalancoSentimental
                    idAreaTrabalho={captura.idAreaTrabalho}
                    idMemoria={memoria.id}
                    textoConfirmado={memoria.balancoSentimental}
                    orientacao={orientar("balancoSentimental", nivel) ?? ""}
                    editavel={edicao.autorizada}
                    desabilitado={ocupado}
                    rascunhoRetomado={rascunhoBalanco}
                    erro={erroBalanco}
                    aoRascunhar={aoRascunharBalanco}
                    aoSalvar={aoSalvarBalanco}
                    aoExcluir={aoExcluirBalanco}
                    aoRegistrarProtecaoSaida={registrarProtecaoBalanco}
                />
            )}
            <nav class="categorizacao-navegacao buttons has-addons" aria-label="Navegação entre memórias">
                <button
                    type="button"
                    class="button"
                    aria-label="Memória anterior"
                    title="Memória anterior"
                    disabled={ocupado || !anterior}
                    onClick={() => {
                        if (anterior && !ocupado) navegar(anterior.id)
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
                        if (proxima && !ocupado) navegar(proxima.id)
                    }}
                >
                    <span>Próxima</span>
                    <span class="icon">
                        <i class="fas fa-chevron-right" aria-hidden="true" />
                    </span>
                </button>
            </nav>
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
            <MensagemPopup
                aberto={confirmarDesativacao}
                titulo="Desativar o Tom?"
                mensagem="O Tom selecionado será apagado. Deseja continuar?"
                acoes="okCancel"
                rotuloConfirmacao="Desativar"
                rotuloCancelamento="Cancelar"
                cor="warning"
                aoResponder={responderDesativacao}
            />
        </>
    )
}
