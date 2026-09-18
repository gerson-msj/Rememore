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
import { type CapturaLocal, capturasLocais } from "../app/servicos/local/capturas.ts"
import { prepararCaptura } from "../app/servicos/captura.ts"
import { ehDataCaptura } from "../app/utilitarios/dataCaptura.ts"
import { adquirirBloqueioCaptura, type PosseCaptura } from "../app/servicos/captura/bloqueio.ts"
import { SessaoCapturaAberta } from "../app/servicos/captura/sessaoAberta.ts"

export default function CapturaDia({ accountId: idConta, date: dataCaptura }: { accountId: string; date: string }) {
    const [areaTrabalho, definirAreaTrabalho] = useState<CapturaLocal | null>(null)
    const [falha, definirFalha] = useState("")
    const [erroAlteracao, definirErroAlteracao] = useState("")
    const [ocupado, definirOcupado] = useState(false)
    const alterando = useRef(false)
    const posse = useRef<PosseCaptura | null>(null)
    const sessaoAberta = useRef<SessaoCapturaAberta | null>(null)
    const [avisoSessao, definirAvisoSessao] = useState(false)
    const [aba, definirAba] = useState<AbaCaptura>("Registrar e organizar")
    const [edicao, definirEdicao] = useState<EdicaoMemoria | null>(null)
    const edicaoAtual = useRef<EdicaoMemoria | null>(null)
    const rascunho = useRef<RascunhoMemoria | null>(null)
    const temporizador = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const [abandono, definirAbandono] = useState(false)
    const [exclusao, definirExclusao] = useState(false)
    const continuarSaida = useRef<(() => void) | null>(null)
    const caixas = useRef(new Map<string, HTMLLIElement>())
    const campoMemoria = useRef<HTMLTextAreaElement>(null)
    const memoria = areaTrabalho?.memorias.find((item) => item.id === edicao?.idMemoria)
    const editandoComplemento = edicao?.idComplemento !== undefined
    const rotuloConfirmacao = editandoComplemento ? "Confirmar Complemento" : "Confirmar Memória"
    const excluirComplemento = Boolean(memoria?.complementos.length)
    const rotuloExclusao = excluirComplemento ? "Excluir último complemento" : "Excluir Memória"
    const podeExcluir = Boolean(memoria && edicao && !edicao.nova && !edicao.suja && !ocupado)

    useEffect(() => {
        if (edicao?.autorizada) campoMemoria.current?.focus()
    }, [edicao?.idMemoria, edicao?.idComplemento, edicao?.autorizada])

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

    function acompanharRetorno(id: string) {
        requestAnimationFrame(() => {
            const elemento = caixas.current.get(id)
            if (!elemento) return
            const barra = document.querySelector(".captura-dia-controles")?.getBoundingClientRect().bottom ?? 0
            const alvo = elemento.getBoundingClientRect()
            if (alvo.top < barra + 12) scrollBy(0, alvo.top - barra - 12)
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
        if (!areaTrabalho || alterando.current) return
        atualizarEdicao(abrirEdicao(areaTrabalho, id, scrollY))
        protegerEdicao()
        definirErroAlteracao("")
        scrollTo(0, 0)
    }

    function retornarLista(id?: string) {
        const rolagem = edicaoAtual.current?.rolagem ?? 0
        limparEdicao()
        definirAba("Registrar e organizar")
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
        const atual = edicaoAtual.current
        if (atual) {
            solicitarSaida(() => retornarLista(atual.nova && !atual.idComplemento ? undefined : atual.idMemoria))
            return
        }
        encerrarSessao()
        location.assign("/capturar")
    }

    function temTrabalhoNaoConfirmado() {
        const atual = edicaoAtual.current
        return atual !== null && atual.suja && (!atual.nova || atual.texto.trim().length > 0)
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

    async function confirmar() {
        if (!areaTrabalho || !edicao || alterando.current || !posse.current) return
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
            retornarLista(edicao.idMemoria)
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
        if (!areaTrabalho || alterando.current || !posse.current) return
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
        } catch {
            definirErroAlteracao("Não foi possível excluir. O conteúdo da captura foi mantido. Tente novamente.")
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }
    return (
        <EstruturaCaptura
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
                            definirAba(proximo)
                            globalThis.scrollTo(0, 0)
                        }}
                        memoriaAberta={edicao !== null}
                        acoes={edicao !== null
                            ? (
                                <>
                                    {edicao.autorizada
                                        ? (
                                            <button
                                                type="button"
                                                class="button is-success"
                                                title={rotuloConfirmacao}
                                                aria-label={rotuloConfirmacao}
                                                disabled={ocupado || !edicao.texto.trim()}
                                                onClick={confirmar}
                                            >
                                                <span class="icon">
                                                    <i class="fas fa-bookmark" aria-hidden="true" />
                                                </span>
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
                                    </button>
                                </>
                            )
                            : aba === "Registrar e organizar"
                            ? (
                                <button
                                    type="button"
                                    class="button is-primary"
                                    title="Adicionar memória"
                                    aria-label="Adicionar memória"
                                    disabled={ocupado}
                                    onClick={() => abrirMemoria(null)}
                                >
                                    <span class="icon">
                                        <i class="fas fa-plus" aria-hidden="true" />
                                    </span>
                                </button>
                            )
                            : null}
                    >
                        {erroAlteracao && <p class="notification is-warning" role="alert">{erroAlteracao}</p>}
                        {!edicao && aba === "Registrar e organizar" && !areaTrabalho.origemPreservada &&
                            !areaTrabalho.alterada && areaTrabalho.memorias.length === 0 && (
                            <p class="captura-orientacao">{orientar("inicioCaptura")}</p>
                        )}
                        {edicao
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
                                </>
                            )
                            : aba === "Registrar e organizar" && (
                                <ul class="captura-lista-memorias">
                                    {[...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem).map((item, indice, lista) => (
                                        <li
                                            key={item.id}
                                            class="box captura-item-memoria"
                                            ref={(elemento) => {
                                                if (elemento) caixas.current.set(item.id, elemento)
                                                else caixas.current.delete(item.id)
                                            }}
                                        >
                                            <button
                                                type="button"
                                                class="captura-previa-memoria"
                                                disabled={ocupado}
                                                onClick={() => abrirMemoria(item.id)}
                                            >
                                                <span>{item.conteudo}</span>
                                            </button>
                                            <div
                                                class="buttons has-addons captura-ordem-memoria"
                                                role="group"
                                                aria-label="Ordem da memória"
                                            >
                                                <button
                                                    type="button"
                                                    class="button"
                                                    title="Elevar memória"
                                                    aria-label="Elevar memória"
                                                    disabled={ocupado || indice === 0}
                                                    onClick={(evento) => mover(item.id, -1, evento.currentTarget)}
                                                >
                                                    <span class="icon">
                                                        <i class="fas fa-chevron-up" aria-hidden="true" />
                                                    </span>
                                                </button>
                                                <button
                                                    type="button"
                                                    class="button"
                                                    title="Rebaixar memória"
                                                    aria-label="Rebaixar memória"
                                                    disabled={ocupado || indice === lista.length - 1}
                                                    onClick={(evento) => mover(item.id, 1, evento.currentTarget)}
                                                >
                                                    <span class="icon">
                                                        <i class="fas fa-chevron-down" aria-hidden="true" />
                                                    </span>
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                    </PainelCaptura>
                )
                : <p role="status">Preparando captura…</p>}
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
                titulo="Descartar a edição não confirmada?"
                mensagem="As alterações desta edição serão descartadas. O conteúdo já confirmado da captura será mantido."
                acoes="okCancel"
                rotuloConfirmacao="Descartar edição"
                rotuloCancelamento="Continuar editando"
                aoResponder={(resultado) => {
                    definirAbandono(false)
                    if (resultado === "confirm") continuarSaida.current?.()
                    continuarSaida.current = null
                }}
            />
        </EstruturaCaptura>
    )
}
