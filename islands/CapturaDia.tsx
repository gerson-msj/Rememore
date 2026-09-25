import MensagemPopup from "../components/MensagemPopup.tsx"
import { orientar } from "../app/servicos/orientacao.ts"
import {
    abrirComplemento,
    abrirEdicao,
    confirmarComplemento,
    confirmarMemoria,
    type EdicaoMemoria,
    excluirUltimoElemento,
    moverMemoria,
    RascunhoMemoria
} from "../app/servicos/captura/edicao.ts"
import { useEffect, useRef, useState } from "preact/hooks"
import EstruturaCaptura from "../components/EstruturaCaptura.tsx"
import PainelCaptura, { type AbaCaptura } from "../components/PainelCaptura.tsx"
import { bancoLocal } from "../app/servicos/local/banco.ts"
import { type AssociacaoCategoria, type CapturaLocal, capturasLocais } from "../app/servicos/local/capturas.ts"
import { prepararCaptura } from "../app/servicos/captura.ts"
import { ehDataCaptura } from "../app/utilitarios/dataCaptura.ts"
import { adquirirBloqueioCaptura, type PosseCaptura } from "../app/servicos/captura/bloqueio.ts"
import { SessaoCapturaAberta } from "../app/servicos/captura/sessaoAberta.ts"
import Memoria from "../components/Memoria.tsx"
import InclusaoMemoria from "../components/InclusaoMemoria.tsx"
import EdicaoCategorizacao from "../components/EdicaoCategorizacao.tsx"
import {
    abrirCategorizacao,
    apresentarCategoria,
    type EdicaoCategorias,
    salvarCategorias,
    SessaoCategorizacao
} from "../app/servicos/captura/categorizacao.ts"
import { prepararCatalogo } from "../app/servicos/categorias.ts"
import type { CatalogoCategorias } from "../app/servicos/local/catalogoCategorias.ts"

export default function CapturaDia({ accountId: idConta, date: dataCaptura }: { accountId: string; date: string }) {
    const [areaTrabalho, definirAreaTrabalho] = useState<CapturaLocal | null>(null)
    const [falha, definirFalha] = useState("")
    const [erroAlteracao, definirErroAlteracao] = useState("")
    const [ocupado, definirOcupado] = useState(false)
    const alterando = useRef(false)
    const posse = useRef<PosseCaptura | null>(null)
    const sessaoAberta = useRef<SessaoCapturaAberta | null>(null)
    const [avisoSessao, definirAvisoSessao] = useState(false)
    const [aba, definirAba] = useState<AbaCaptura>("Memorar")
    const [edicao, definirEdicao] = useState<EdicaoMemoria | null>(null)
    const edicaoAtual = useRef<EdicaoMemoria | null>(null)
    const rascunho = useRef<RascunhoMemoria | null>(null)
    const [categorizacao, definirCategorizacao] = useState<EdicaoCategorias | null>(null)
    const categorizacaoAtual = useRef<EdicaoCategorias | null>(null)
    const sessaoCategorizacao = useRef<SessaoCategorizacao | null>(null)
    const [catalogo, definirCatalogo] = useState<CatalogoCategorias | undefined>(undefined)
    const [avisoCatalogo, definirAvisoCatalogo] = useState(false)
    const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const [abandono, definirAbandono] = useState(false)
    const [exclusao, definirExclusao] = useState(false)
    const [resultadoOperacao, definirResultadoOperacao] = useState("")
    const continuarSaida = useRef<(() => void) | null>(null)
    const caixas = useRef(new Map<string, HTMLLIElement>())
    const campoMemoria = useRef<HTMLTextAreaElement>(null)
    const memoria = areaTrabalho?.memorias.find((item) => item.id === edicao?.idMemoria)
    const incluindo = Boolean(edicao?.nova && !edicao.idComplemento)
    const editandoComplemento = edicao?.idComplemento !== undefined
    const rotuloConfirmacao = editandoComplemento ? "Confirmar Complemento" : "Confirmar Memória"
    const excluirComplemento = Boolean(memoria?.complementos.length)
    const rotuloExclusao = excluirComplemento ? "Excluir último complemento" : "Excluir Memória"
    const podeExcluir = Boolean(memoria && edicao && !edicao.nova && !edicao.suja && !ocupado)

    useEffect(() => {
        if (edicao?.autorizada) campoMemoria.current?.focus()
    }, [edicao?.idMemoria, edicao?.idComplemento, edicao?.autorizada])

    useEffect(() => {
        if (!incluindo || !areaTrabalho) return
        const quadro = requestAnimationFrame(() => {
            const ultima = [...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem).at(-1)
            const alvo = ultima ? caixas.current.get(ultima.id) : document.querySelector(".captura-orientacao, .captura-inclusao")
            if (!alvo) return
            const topo = (document.querySelector(".captura-dia-controles")?.getBoundingClientRect().bottom ?? 0) + 12
            scrollBy({ top: alvo.getBoundingClientRect().top - topo, behavior: "instant" })
        })
        return () => cancelAnimationFrame(quadro)
    }, [incluindo, edicao?.idMemoria, areaTrabalho?.idAreaTrabalho])

    function escrever(texto: string) {
        const atual = edicaoAtual.current
        if (!atual || alterando.current) return
        atualizarEdicao({ ...atual, texto, suja: true })
        clearTimeout(temporizador.current)
        temporizador.current = setTimeout(protegerEdicao, 200)
    }

    function cancelarInclusao() {
        solicitarSaida(() => retornarLista())
    }

    function protegerEdicao() {
        clearTimeout(temporizador.current)
        try {
            if (edicaoAtual.current) rascunho.current?.gravar(edicaoAtual.current)
        } catch {
            definirAvisoSessao(true)
        }
    }

    function atualizarEdicao(proxima: EdicaoMemoria | null) {
        edicaoAtual.current = proxima
        definirEdicao(proxima)
    }

    function atualizarCategorizacao(proxima: EdicaoCategorias | null) {
        categorizacaoAtual.current = proxima
        definirCategorizacao(proxima)
    }

    function limparCategorizacao() {
        try {
            sessaoCategorizacao.current?.limpar()
        } catch {
            definirAvisoSessao(true)
        }
        atualizarCategorizacao(null)
        definirErroAlteracao("")
    }

    function categorizar(idMemoria: string) {
        if (!areaTrabalho || alterando.current) return
        const proxima = abrirCategorizacao(areaTrabalho, idMemoria, scrollY)
        atualizarCategorizacao(proxima)
        try {
            sessaoCategorizacao.current?.gravar(proxima)
        } catch {
            definirAvisoSessao(true)
        }
        definirErroAlteracao("")
        scrollTo(0, 0)
    }

    function retornarCategorizacao() {
        const atual = categorizacaoAtual.current
        limparCategorizacao()
        definirAba("Categorizar")
        requestAnimationFrame(() => {
            scrollTo(0, atual?.rolagem ?? 0)
            if (atual) acompanharRetorno(atual.idMemoria, true)
        })
    }

    async function confirmarCategorias(selecionadas: AssociacaoCategoria[]) {
        const atual = categorizacaoAtual.current
        if (!areaTrabalho || !atual || alterando.current || !posse.current) return
        alterando.current = true
        definirOcupado(true)
        definirErroAlteracao("")
        try {
            const proxima = await posse.current.executar(() =>
                salvarCategorias(areaTrabalho, { ...atual, selecionadas }, (captura) => capturasLocais.gravar(captura))
            )
            definirAreaTrabalho(proxima)
            const confirmadas = proxima.memorias.find((item) => item.id === atual.idMemoria)!.categorias ?? []
            atualizarCategorizacao({ ...atual, originais: structuredClone(confirmadas), selecionadas: structuredClone(confirmadas) })
        } catch {
            definirErroAlteracao("Não foi possível atualizar as categorias. As associações anteriores foram mantidas. Tente novamente.")
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }

    function limparEdicao() {
        clearTimeout(temporizador.current)
        try {
            rascunho.current?.limpar()
        } catch {
            definirAvisoSessao(true)
        }
        atualizarEdicao(null)
        definirErroAlteracao("")
    }

    function acompanharRetorno(id: string, alinharTopo = false) {
        requestAnimationFrame(() => {
            const elemento = caixas.current.get(id)
            if (!elemento) return
            const barra = document.querySelector(".captura-dia-controles")?.getBoundingClientRect().bottom ?? 0
            const alvo = elemento.getBoundingClientRect()
            if (alinharTopo || alvo.top < barra + 12) scrollBy(0, alvo.top - barra - 12)
            else if (alvo.bottom > innerHeight - 12) scrollBy(0, alvo.bottom - innerHeight + 12)
        })
    }

    function acompanharReordenacao(
        id: string,
        idAnterior: string | undefined,
        idSeguinte: string | undefined,
        botao: HTMLButtonElement,
        topoBotaoAnterior: number
    ) {
        requestAnimationFrame(() => {
            const elemento = caixas.current.get(id)
            if (!elemento || !botao.isConnected) return
            const elementosContexto = [idAnterior, id, idSeguinte]
                .map((idContexto) => idContexto ? caixas.current.get(idContexto) : undefined)
                .filter((item): item is HTMLLIElement => Boolean(item))
            const retangulos = elementosContexto.map((item) => item.getBoundingClientRect())
            const limiteSuperior = (document.querySelector(".captura-dia-controles")?.getBoundingClientRect().bottom ?? 0) + 12
            const limiteInferior = innerHeight - 12
            const deslocamentoFoco = botao.getBoundingClientRect().top - topoBotaoAnterior
            const rolagemMaxima = Math.max(0, document.documentElement.scrollHeight - innerHeight)
            const destinoFoco = scrollY + deslocamentoFoco
            const contextoVisivelComFoco = destinoFoco > 0 && destinoFoco < rolagemMaxima &&
                retangulos.every((retangulo) =>
                    retangulo.top - deslocamentoFoco >= limiteSuperior && retangulo.bottom - deslocamentoFoco <= limiteInferior
                )

            if (contextoVisivelComFoco) {
                scrollBy({ top: deslocamentoFoco, behavior: "instant" })
                return
            }

            const topoContexto = Math.min(...retangulos.map((retangulo) => retangulo.top))
            const fundoContexto = Math.max(...retangulos.map((retangulo) => retangulo.bottom))
            if (fundoContexto - topoContexto <= limiteInferior - limiteSuperior) {
                if (topoContexto < limiteSuperior) scrollBy({ top: topoContexto - limiteSuperior, behavior: "instant" })
                else if (fundoContexto > limiteInferior) scrollBy({ top: fundoContexto - limiteInferior, behavior: "instant" })
            } else {
                const alvo = elemento.getBoundingClientRect()
                if (alvo.top < limiteSuperior) scrollBy({ top: alvo.top - limiteSuperior, behavior: "instant" })
                else if (alvo.bottom > limiteInferior) scrollBy({ top: alvo.bottom - limiteInferior, behavior: "instant" })
            }
        })
    }

    function abrirMemoria(id: string | null) {
        if (!areaTrabalho || alterando.current || edicaoAtual.current) return
        atualizarEdicao(abrirEdicao(areaTrabalho, id, scrollY))
        protegerEdicao()
        definirErroAlteracao("")
        if (id !== null) scrollTo(0, 0)
    }

    function retornarLista(id?: string) {
        const rolagem = edicaoAtual.current?.rolagem ?? 0
        limparEdicao()
        definirAba("Memorar")
        requestAnimationFrame(() => {
            scrollTo(0, rolagem)
            if (id) acompanharRetorno(id)
        })
    }

    function adicionarComplemento() {
        if (!areaTrabalho || !edicao || alterando.current) return
        atualizarEdicao(abrirComplemento(areaTrabalho, edicao.idMemoria, edicao.rolagem))
        protegerEdicao()
        definirErroAlteracao("")
    }

    function solicitarSaida(continuar: () => void) {
        if (alterando.current) return
        if (temTrabalhoNaoConfirmado()) {
            continuarSaida.current = continuar
            definirAbandono(true)
        } else continuar()
    }

    function voltarCabecalho() {
        if (categorizacaoAtual.current) {
            if (!alterando.current) retornarCategorizacao()
            return
        }
        const atual = edicaoAtual.current
        if (atual?.nova && !atual.idComplemento) {
            solicitarSaida(() => {
                encerrarSessao()
                location.assign("/capturar")
            })
            return
        }
        if (atual) {
            solicitarSaida(() => retornarLista(atual.nova && !atual.idComplemento ? undefined : atual.idMemoria))
            return
        }
        encerrarSessao()
        location.assign("/capturar")
    }

    function temTrabalhoNaoConfirmado() {
        const atual = edicaoAtual.current
        return atual !== null && ((atual.nova && !atual.idComplemento) || (atual.suja && (!atual.nova || atual.texto.trim().length > 0)))
    }

    useEffect(() => {
        const antesDeDescarregar = (evento: BeforeUnloadEvent) => {
            protegerEdicao()
            if (temTrabalhoNaoConfirmado() || alterando.current) {
                evento.preventDefault()
                evento.returnValue = ""
            }
        }
        const aoOcultar = () => protegerEdicao()
        globalThis.addEventListener("beforeunload", antesDeDescarregar)
        globalThis.addEventListener("pagehide", aoOcultar)
        return () => {
            clearTimeout(temporizador.current)
            globalThis.removeEventListener("beforeunload", antesDeDescarregar)
            globalThis.removeEventListener("pagehide", aoOcultar)
        }
    }, [])
    function encerrarSessao() {
        limparEdicao()
        limparCategorizacao()
        try {
            sessaoAberta.current?.encerrar()
        } catch {
            definirAvisoSessao(true)
        }
    }

    useEffect(() => {
        let ativo = true
        let posseAtual: PosseCaptura | null = null
        const ocultar = () => {
            ativo = false
            posse.current = null
            void posseAtual?.liberar()
        }
        const exibir = (evento: PageTransitionEvent) => {
            // A página restaurada pelo BFCache perdeu a posse do bloqueio; precisa reabrir antes de aceitar operações.
            if (evento.persisted) {
                encerrarSessao()
                location.replace(location.href)
            }
        }
        globalThis.addEventListener("pagehide", ocultar)
        globalThis.addEventListener("pageshow", exibir)
        async function abrir() {
            if (!ehDataCaptura(dataCaptura)) {
                location.replace("/capturar?data-invalida")
                return
            }
            const disponibilidade = await bancoLocal.diagnosticar()
            if (!ativo) return
            if (disponibilidade.status !== "operational") {
                definirFalha(
                    disponibilidade.status === "unsupported"
                        ? "Não é possível iniciar uma captura neste navegador. O Rememore precisa do armazenamento local do navegador para proteger suas memórias enquanto você trabalha. Tente utilizar uma versão atualizada de um navegador compatível."
                        : "Não foi possível acessar o armazenamento local. O Rememore precisa desse recurso para proteger suas memórias enquanto você trabalha. Verifique as configurações de privacidade do navegador ou tente novamente em uma janela de navegação normal."
                )
                return
            }
            try {
                let idAreaTrabalhoRetomada: string | undefined
                try {
                    sessaoAberta.current = new SessaoCapturaAberta(idConta, dataCaptura, sessionStorage)
                    const navegacao = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
                    idAreaTrabalhoRetomada = sessaoAberta.current.retomar(navegacao?.type ?? "navigate")
                } catch {
                    if (ativo) definirAvisoSessao(true)
                }
                posseAtual = await adquirirBloqueioCaptura(idConta, dataCaptura)
                if (!ativo) {
                    await posseAtual?.liberar()
                    return
                }
                if (!posseAtual) {
                    definirFalha("Esta captura está aberta em outra aba ou janela. Continue o trabalho na aba ou janela original.")
                    return
                }
                posse.current = posseAtual
                const captura = await posseAtual.executar(() =>
                    prepararCaptura(idConta, dataCaptura, undefined, undefined, idAreaTrabalhoRetomada)
                )
                if (ativo) {
                    try {
                        sessaoAberta.current?.iniciar(captura.idAreaTrabalho)
                    } catch {
                        definirAvisoSessao(true)
                    }
                    if (import.meta.env.DEV) {
                        console.info("[Capturar local]", {
                            date: dataCaptura,
                            revision: captura.revisaoOrigem,
                            editWindowDays: captura.prazoEdicaoDias,
                            changed: captura.alterada,
                            memories: captura.memorias.length,
                            workspaceId: captura.idAreaTrabalho
                        })
                    }
                    definirAreaTrabalho(captura)
                    try {
                        rascunho.current = new RascunhoMemoria(idConta, dataCaptura, sessionStorage)
                        atualizarEdicao(rascunho.current.retomar(captura, idAreaTrabalhoRetomada === captura.idAreaTrabalho))
                    } catch {
                        definirAvisoSessao(true)
                    }
                    try {
                        sessaoCategorizacao.current = new SessaoCategorizacao(idConta, dataCaptura, sessionStorage)
                        const retomada = sessaoCategorizacao.current.retomar(captura, idAreaTrabalhoRetomada === captura.idAreaTrabalho)
                        if (retomada && !edicaoAtual.current) {
                            atualizarCategorizacao(retomada)
                            definirAba("Categorizar")
                        }
                    } catch {
                        definirAvisoSessao(true)
                    }
                    const resultadoCatalogo = await prepararCatalogo(idConta)
                    if (ativo) {
                        definirCatalogo(resultadoCatalogo.catalogo)
                        definirAvisoCatalogo(resultadoCatalogo.falhou)
                    }
                }
            } catch {
                posse.current = null
                await posseAtual?.liberar()
                if (ativo) definirFalha("Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.")
            }
        }
        void abrir()
        return () => {
            ocultar()
            globalThis.removeEventListener("pagehide", ocultar)
            globalThis.removeEventListener("pageshow", exibir)
        }
    }, [idConta, dataCaptura])

    async function confirmar(continuar = false) {
        if (!areaTrabalho || !edicao || !edicao.texto.trim() || alterando.current || !posse.current) return
        alterando.current = true
        definirOcupado(true)
        definirErroAlteracao("")
        protegerEdicao()
        try {
            const proxima = await posse.current.executar(() =>
                (edicao.idComplemento ? confirmarComplemento : confirmarMemoria)(
                    areaTrabalho,
                    edicao,
                    (captura) => capturasLocais.gravar(captura)
                )
            )
            definirAreaTrabalho(proxima)
            if (incluindo && continuar) {
                limparEdicao()
                atualizarEdicao(abrirEdicao(proxima, null, scrollY))
                protegerEdicao()
            } else if (incluindo) retornarLista(edicao.idMemoria)
            else {
                // Mantém a autorização da edição aberta e passa a usar o conteúdo confirmado como base limpa.
                atualizarEdicao({
                    ...edicao,
                    nova: false,
                    original: edicao.texto,
                    suja: false,
                    ...(edicao.idComplemento
                        ? {
                            idsComplementosBase: proxima.memorias.find((item) => item.id === edicao.idMemoria)!.complementos.map((item) =>
                                item.id
                            )
                        }
                        : {})
                })
                protegerEdicao()
                if (proxima !== areaTrabalho) {
                    definirResultadoOperacao(
                        edicao.idComplemento ? edicao.nova ? "Complemento incluído." : "Complemento alterado." : "Memória alterada."
                    )
                }
            }
        } catch {
            definirErroAlteracao(
                edicao.idComplemento
                    ? "Não foi possível confirmar o complemento. Seu texto continua nesta tela. Tente novamente."
                    : "Não foi possível confirmar a memória. Seu texto continua nesta tela. Tente novamente."
            )
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }

    async function mover(id: string, direcao: -1 | 1, botao: HTMLButtonElement) {
        if (!areaTrabalho || edicaoAtual.current || alterando.current || !posse.current) return
        const topoAnterior = botao.getBoundingClientRect().top
        alterando.current = true
        definirOcupado(true)
        definirErroAlteracao("")
        try {
            const proxima = await posse.current.executar(() =>
                moverMemoria(areaTrabalho, id, direcao, (captura) => capturasLocais.gravar(captura))
            )
            definirAreaTrabalho(proxima)
            const memoriasOrdenadas = [...proxima.memorias].sort((a, b) => a.ordem - b.ordem)
            const indice = memoriasOrdenadas.findIndex((item) => item.id === id)
            acompanharReordenacao(id, memoriasOrdenadas[indice - 1]?.id, memoriasOrdenadas[indice + 1]?.id, botao, topoAnterior)
        } catch {
            definirErroAlteracao("Não foi possível alterar a ordem das memórias. A ordem anterior foi mantida. Tente novamente.")
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }

    async function excluir() {
        if (!areaTrabalho || !edicao || !podeExcluir || alterando.current || !posse.current) return
        alterando.current = true
        definirOcupado(true)
        definirErroAlteracao("")
        const ordenadas = [...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem)
        const indice = ordenadas.findIndex((item) => item.id === edicao.idMemoria)
        const idRetorno = (ordenadas[indice + 1] ?? ordenadas[indice - 1])?.id
        try {
            const proxima = await posse.current.executar(() =>
                excluirUltimoElemento(areaTrabalho, edicao, (captura) => capturasLocais.gravar(captura))
            )
            definirAreaTrabalho(proxima)
            if (excluirComplemento) {
                atualizarEdicao(edicao.idComplemento ? abrirEdicao(proxima, edicao.idMemoria, edicao.rolagem) : edicao)
                protegerEdicao()
            } else retornarLista(idRetorno)
            definirResultadoOperacao(excluirComplemento ? "Último complemento excluído." : "Memória excluída.")
        } catch {
            definirErroAlteracao("Não foi possível excluir. O conteúdo da captura foi mantido. Tente novamente.")
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }
    return (
        <EstruturaCaptura
            titulo={categorizacao ? "Categorização" : edicao && !incluindo ? "Editar Memória" : "Capturar"}
            retorno="/capturar"
            aoVoltar={voltarCabecalho}
            aoDeixar={encerrarSessao}
            antesDeSair={solicitarSaida}
            dia
        >
            {avisoSessao && (
                <p class="notification is-warning" role="alert">
                    Não foi possível proteger o rascunho contra recarregamento. Seu texto continua nesta tela. Confirme a edição antes de
                    sair ou recarregar.
                </p>
            )}
            {falha
                ? (
                    <>
                        <p class="notification is-warning" role="alert">{falha}</p>
                        <a class="button" href="/principal">Voltar à Principal</a>
                    </>
                )
                : areaTrabalho
                ? (
                    <PainelCaptura
                        dataCaptura={dataCaptura}
                        aba={aba}
                        aoMudarAba={(proximo) => {
                            if (incluindo || alterando.current) return
                            definirAba(proximo)
                            globalThis.scrollTo(0, 0)
                        }}
                        memoriaAberta={(edicao !== null && !incluindo) || categorizacao !== null}
                        abasInativas={incluindo || ocupado}
                        acoes={null}
                    >
                        {erroAlteracao && <p class="notification is-warning" role="alert">{erroAlteracao}</p>}
                        {avisoCatalogo && aba === "Categorizar" && (
                            <p class="notification is-warning" role="status">
                                Não foi possível atualizar o catálogo de categorias. Você pode continuar com as categorias disponíveis nesta
                                captura.
                            </p>
                        )}
                        {categorizacao && (
                            <EdicaoCategorizacao
                                key={categorizacao.idMemoria}
                                captura={areaTrabalho}
                                edicao={categorizacao}
                                catalogo={catalogo}
                                ocupado={ocupado}
                                aoSelecionar={confirmarCategorias}
                                aoNavegar={categorizar}
                            />
                        )}
                        {!categorizacao && aba === "Categorizar" && (
                            <ul class="captura-lista-memorias">
                                {[...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem).map((item) => (
                                    <li
                                        key={item.id}
                                        ref={(elemento) => {
                                            if (elemento) caixas.current.set(item.id, elemento)
                                            else caixas.current.delete(item.id)
                                        }}
                                    >
                                        <Memoria
                                            conteudo={item.conteudo}
                                            categorias={(item.categorias ?? []).map((categoria) =>
                                                apresentarCategoria(categoria, catalogo).nome
                                            )}
                                            contexto="categorizar"
                                            tom={null}
                                            aoAcionar={() => categorizar(item.id)}
                                        />
                                    </li>
                                ))}
                            </ul>
                        )}
                        {(!edicao || incluindo) && aba === "Memorar" && !areaTrabalho.origemPreservada &&
                            !areaTrabalho.alterada && areaTrabalho.memorias.length === 0 && (
                            <p class="captura-orientacao">{orientar("inicioCaptura")}</p>
                        )}
                        {edicao && !incluindo
                            ? (
                                <>
                                    {(!edicao.autorizada || editandoComplemento) && (
                                        <div class="captura-texto-memoria">
                                            <p>{memoria?.conteudo}</p>
                                        </div>
                                    )}
                                    {memoria?.complementos.filter((item) => item.id !== edicao.idComplemento).map((item) => (
                                        <section key={item.id} class="mt-5">
                                            {item.primeiraPreservacaoEm && (
                                                <p class="is-size-7 mb-2">
                                                    Complemento adicionado em{" "}
                                                    {new Date(item.primeiraPreservacaoEm).toLocaleDateString("pt-BR")}
                                                </p>
                                            )}
                                            <div class="captura-texto-memoria">
                                                <p>{item.conteudo}</p>
                                            </div>
                                        </section>
                                    ))}
                                    {edicao.autorizada && (
                                        <textarea
                                            ref={campoMemoria}
                                            class={`textarea captura-campo-memoria${
                                                editandoComplemento ? " captura-campo-complemento mt-5" : ""
                                            }`}
                                            rows={editandoComplemento ? 4 : 5}
                                            aria-label={editandoComplemento ? "Texto do complemento" : "Texto da memória"}
                                            value={edicao.texto}
                                            disabled={ocupado}
                                            onInput={(evento) => {
                                                atualizarEdicao({ ...edicao, texto: evento.currentTarget.value, suja: true })
                                                clearTimeout(temporizador.current)
                                                temporizador.current = setTimeout(protegerEdicao, 200)
                                            }}
                                        />
                                    )}
                                    <div class="buttons has-addons captura-acoes-texto mt-3" role="group" aria-label="Ações da edição">
                                        {edicao.autorizada
                                            ? (
                                                <button
                                                    type="button"
                                                    class="button is-success"
                                                    title={rotuloConfirmacao}
                                                    aria-label={rotuloConfirmacao}
                                                    disabled={ocupado || !edicao.texto.trim()}
                                                    onClick={() => confirmar()}
                                                >
                                                    <span class="icon">
                                                        <i class="fas fa-bookmark" aria-hidden="true" />
                                                    </span>
                                                    <span>{rotuloConfirmacao}</span>
                                                </button>
                                            )
                                            : (
                                                <button
                                                    type="button"
                                                    class="button is-primary"
                                                    title="Adicionar complemento"
                                                    aria-label="Adicionar complemento"
                                                    disabled={ocupado}
                                                    onClick={adicionarComplemento}
                                                >
                                                    <span class="icon">
                                                        <i class="fas fa-plus" aria-hidden="true" />
                                                    </span>
                                                    <span>Adicionar complemento</span>
                                                </button>
                                            )}
                                        <button
                                            type="button"
                                            class="button is-danger"
                                            title={rotuloExclusao}
                                            aria-label={rotuloExclusao}
                                            disabled={!podeExcluir}
                                            onClick={() => definirExclusao(true)}
                                        >
                                            <span class="icon">
                                                <i class="fas fa-trash" aria-hidden="true" />
                                            </span>
                                            <span>{rotuloExclusao}</span>
                                        </button>
                                    </div>
                                </>
                            )
                            : aba === "Memorar" && (
                                <>
                                    <ul class="captura-lista-memorias">
                                        {[...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem).map((item, indice, lista) => (
                                            <li
                                                key={item.id}
                                                ref={(elemento) => {
                                                    if (elemento) caixas.current.set(item.id, elemento)
                                                    else caixas.current.delete(item.id)
                                                }}
                                            >
                                                <Memoria
                                                    conteudo={item.conteudo}
                                                    categorias={(item.categorias ?? []).map((categoria) =>
                                                        apresentarCategoria(categoria, catalogo).nome
                                                    )}
                                                    tom={null}
                                                    contexto="registrar"
                                                    primeira={indice === 0}
                                                    ultima={indice === lista.length - 1}
                                                    inativa={incluindo || ocupado}
                                                    aoAcionar={() => abrirMemoria(item.id)}
                                                    aoElevar={(botao) => mover(item.id, -1, botao)}
                                                    aoRebaixar={(botao) => mover(item.id, 1, botao)}
                                                />
                                            </li>
                                        ))}
                                        <li>
                                            {incluindo && edicao
                                                ? (
                                                    <InclusaoMemoria
                                                        id={edicao.idMemoria}
                                                        texto={edicao.texto}
                                                        ocupado={ocupado}
                                                        dica={!areaTrabalho.primeiraMemoriaConfirmada ? orientar("inclusaoMemoria") : null}
                                                        aoEscrever={escrever}
                                                        aoConfirmar={confirmar}
                                                        aoCancelar={cancelarInclusao}
                                                    />
                                                )
                                                : (
                                                    <button
                                                        type="button"
                                                        class="button is-primary"
                                                        title="Incluir memória"
                                                        aria-label="Incluir memória"
                                                        disabled={ocupado}
                                                        onClick={() => abrirMemoria(null)}
                                                    >
                                                        <span class="icon">
                                                            <i class="fas fa-plus" aria-hidden="true" />
                                                        </span>
                                                        <span>Incluir memória</span>
                                                    </button>
                                                )}
                                        </li>
                                    </ul>
                                </>
                            )}
                    </PainelCaptura>
                )
                : <p role="status">Preparando captura…</p>}
            <MensagemPopup
                aberto={Boolean(resultadoOperacao)}
                mensagem={resultadoOperacao}
                acoes="ok"
                cor="success"
                icone="fas fa-circle-check"
                aoResponder={() => definirResultadoOperacao("")}
            />
            <MensagemPopup
                aberto={exclusao}
                titulo={excluirComplemento ? "Excluir o último complemento?" : "Excluir esta memória?"}
                mensagem={excluirComplemento
                    ? "O complemento mais recente será removido desta captura. A memória e os complementos anteriores serão mantidos. A versão já preservada, se existir, só será alterada quando você preservar este dia."
                    : "Esta memória será removida desta captura. A versão já preservada, se existir, só será alterada quando você preservar este dia."}
                acoes="okCancel"
                rotuloConfirmacao={excluirComplemento ? "Excluir complemento" : "Excluir memória"}
                rotuloCancelamento="Cancelar"
                cor="danger"
                icone="fas fa-trash"
                aoResponder={(resultado) => {
                    definirExclusao(false)
                    if (resultado === "confirm") void excluir()
                }}
            />
            <MensagemPopup
                aberto={abandono}
                titulo={incluindo ? "Cancelar a inclusão?" : "Descartar a edição não confirmada?"}
                mensagem={incluindo
                    ? "A inclusão em andamento será cancelada e o texto ainda não incluído será perdido. O conteúdo já confirmado da captura será mantido."
                    : "As alterações desta edição serão descartadas. O conteúdo já confirmado da captura será mantido."}
                acoes="okCancel"
                rotuloConfirmacao={incluindo ? "Cancelar inclusão" : "Descartar edição"}
                rotuloCancelamento={incluindo ? "Continuar escrevendo" : "Continuar editando"}
                aoResponder={(resultado) => {
                    definirAbandono(false)
                    if (resultado === "confirm") continuarSaida.current?.()
                    continuarSaida.current = null
                }}
            />
        </EstruturaCaptura>
    )
}
