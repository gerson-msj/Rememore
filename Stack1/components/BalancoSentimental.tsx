import { useEffect, useRef, useState } from "preact/hooks"
import type { RascunhoBalanco } from "../app/servicos/captura/balanco.ts"

interface PropriedadesBalancoSentimental {
    idAreaTrabalho: string
    idMemoria: string
    textoConfirmado?: string
    orientacao: string
    editavel: boolean
    desabilitado: boolean
    rascunhoRetomado: RascunhoBalanco | null
    erro: string
    aoRascunhar: (rascunho: RascunhoBalanco | null) => void
    aoSalvar: (texto: string) => Promise<boolean>
    aoExcluir: () => Promise<boolean>
    aoRegistrarProtecaoSaida: (proteger: ((continuar: () => void) => void) | null) => void
}

type Confirmacao = "descarte" | "exclusao" | null

export default function BalancoSentimental({
    idAreaTrabalho,
    idMemoria,
    textoConfirmado,
    orientacao,
    editavel,
    desabilitado,
    rascunhoRetomado,
    erro,
    aoRascunhar,
    aoSalvar,
    aoExcluir,
    aoRegistrarProtecaoSaida
}: PropriedadesBalancoSentimental) {
    const dialogo = useRef<HTMLDialogElement>(null)
    const campo = useRef<HTMLTextAreaElement>(null)
    const previa = useRef<HTMLParagraphElement>(null)
    const continuacaoFechamento = useRef<(() => void) | null>(null)
    const [aberto, definirAberto] = useState(Boolean(rascunhoRetomado))
    const [somenteLeitura, definirSomenteLeitura] = useState(false)
    const [confirmacao, definirConfirmacao] = useState<Confirmacao>(null)
    const [original, definirOriginal] = useState(rascunhoRetomado?.original ?? textoConfirmado ?? "")
    const [texto, definirTexto] = useState(rascunhoRetomado?.texto ?? textoConfirmado ?? "")
    const [ocupado, definirOcupado] = useState(false)
    const [conteudoContinua, definirConteudoContinua] = useState(false)
    const possuiBalanco = typeof textoConfirmado === "string"
    const textoAlterado = texto !== original

    useEffect(() => {
        const elemento = dialogo.current!
        if (aberto) {
            if (!elemento.open) elemento.showModal()
            if (!somenteLeitura && !confirmacao) requestAnimationFrame(() => campo.current?.focus())
        } else if (elemento.open) elemento.close()
    }, [aberto, somenteLeitura, confirmacao])

    useEffect(() => {
        const elemento = previa.current
        if (!elemento || !possuiBalanco) {
            definirConteudoContinua(false)
            return
        }
        const medir = () => definirConteudoContinua(elemento.scrollHeight > elemento.clientHeight + 1)
        medir()
        const observador = new ResizeObserver(medir)
        observador.observe(elemento)
        return () => observador.disconnect()
    }, [textoConfirmado])

    function gravarRascunho(proximoTexto: string) {
        definirTexto(proximoTexto)
        aoRascunhar({ idAreaTrabalho, idMemoria, original, texto: proximoTexto })
    }

    function abrirEdicao() {
        if (!editavel || desabilitado) return
        const base = textoConfirmado ?? ""
        definirOriginal(base)
        definirTexto(base)
        definirSomenteLeitura(false)
        definirConfirmacao(null)
        aoRascunhar({ idAreaTrabalho, idMemoria, original: base, texto: base })
        definirAberto(true)
    }

    function abrirLeitura() {
        if (editavel || !possuiBalanco || !conteudoContinua) return
        definirTexto(textoConfirmado!)
        definirOriginal(textoConfirmado!)
        definirSomenteLeitura(true)
        definirConfirmacao(null)
        definirAberto(true)
    }

    function fecharEditor() {
        definirAberto(false)
        definirSomenteLeitura(false)
        definirConfirmacao(null)
        continuacaoFechamento.current = null
        aoRascunhar(null)
    }

    function tentarFechar() {
        if (somenteLeitura) {
            definirAberto(false)
            definirSomenteLeitura(false)
            return
        }
        if (textoAlterado) definirConfirmacao("descarte")
        else fecharEditor()
    }

    function protegerSaida(continuar: () => void) {
        if (!aberto || somenteLeitura) {
            fecharEditor()
            continuar()
            return
        }
        if (textoAlterado) {
            continuacaoFechamento.current = continuar
            definirConfirmacao("descarte")
            return
        }
        fecharEditor()
        continuar()
    }

    useEffect(() => {
        aoRegistrarProtecaoSaida(protegerSaida)
        return () => aoRegistrarProtecaoSaida(null)
    }, [aoRegistrarProtecaoSaida, aberto, somenteLeitura, textoAlterado])

    function descartar() {
        const continuar = continuacaoFechamento.current
        fecharEditor()
        continuar?.()
    }

    async function salvar() {
        if (ocupado || !texto.trim()) return
        definirOcupado(true)
        if (await aoSalvar(texto)) fecharEditor()
        definirOcupado(false)
    }

    async function excluir() {
        if (ocupado) return
        definirOcupado(true)
        if (await aoExcluir()) fecharEditor()
        else definirConfirmacao(null)
        definirOcupado(false)
    }

    return (
        <section class="categorizacao-balanco" aria-labelledby="categorizacao-balanco-titulo">
            <h2 id="categorizacao-balanco-titulo" class="title is-5">Balanço sentimental</h2>
            {orientacao && <p class="captura-orientacao categorizacao-balanco-orientacao">{orientacao}</p>}
            <div
                class={`balanco-previa${possuiBalanco ? " preenchida" : " vazia"}${
                    (editavel && !desabilitado) || (!editavel && conteudoContinua) ? " acionavel" : ""
                }`}
                role={(editavel && !desabilitado) || (!editavel && conteudoContinua) ? "button" : "region"}
                tabIndex={(editavel && !desabilitado) || (!editavel && conteudoContinua) ? 0 : undefined}
                aria-label={possuiBalanco ? "Prévia do balanço sentimental" : "Sem balanço sentimental"}
                onClick={editavel && !desabilitado ? abrirEdicao : abrirLeitura}
                onKeyDown={(evento) => {
                    if (evento.key !== "Enter" && evento.key !== " ") return
                    evento.preventDefault()
                    if (editavel && !desabilitado) abrirEdicao()
                    else abrirLeitura()
                }}
            >
                {possuiBalanco
                    ? (
                        <>
                            <p ref={previa} class="balanco-previa-texto">{textoConfirmado}</p>
                            {conteudoContinua && <span class="balanco-previa-esmaecida" aria-hidden="true" />}
                        </>
                    )
                    : null}
            </div>
            <div class="balanco-acao-container">
                {editavel && (
                    <button
                        type="button"
                        class="button is-link is-light balanco-acao"
                        disabled={desabilitado}
                        onClick={abrirEdicao}
                    >
                        {possuiBalanco ? "Editar balanço sentimental" : "Adicionar balanço sentimental"}
                    </button>
                )}
            </div>
            <dialog
                ref={dialogo}
                class="balanco-popup"
                aria-labelledby="balanco-popup-titulo"
                onCancel={(evento) => {
                    evento.preventDefault()
                    if (!confirmacao) tentarFechar()
                }}
                onClick={(evento) => {
                    if (evento.target !== evento.currentTarget) return
                    const caixa = evento.currentTarget.getBoundingClientRect()
                    if (
                        evento.clientX < caixa.left || evento.clientX > caixa.right || evento.clientY < caixa.top ||
                        evento.clientY > caixa.bottom
                    ) tentarFechar()
                }}
            >
                {somenteLeitura
                    ? (
                        <>
                            <div class="balanco-popup-cabecalho">
                                <h2 id="balanco-popup-titulo" class="title is-4">Balanço sentimental</h2>
                            </div>
                            <div class="balanco-leitura-integral">{textoConfirmado}</div>
                            <div class="balanco-popup-acoes">
                                <button type="button" class="button is-link" onClick={tentarFechar}>Fechar</button>
                            </div>
                        </>
                    )
                    : confirmacao === "descarte"
                    ? (
                        <>
                            <h2 id="balanco-popup-titulo" class="title is-4 balanco-popup-titulo">Descartar as alterações?</h2>
                            <p>As alterações feitas no balanço sentimental ainda não foram salvas e serão perdidas.</p>
                            <div class="balanco-popup-acoes">
                                <button type="button" class="button is-danger" onClick={descartar}>Descartar alterações</button>
                                <button type="button" class="button" onClick={() => definirConfirmacao(null)}>Continuar editando</button>
                            </div>
                        </>
                    )
                    : confirmacao === "exclusao"
                    ? (
                        <>
                            <h2 id="balanco-popup-titulo" class="title is-4 balanco-popup-titulo">Excluir o balanço sentimental?</h2>
                            <p>O balanço sentimental desta memória será removido desta captura.</p>
                            {erro && <p class="notification is-warning" role="alert">{erro}</p>}
                            <div class="balanco-popup-acoes balanco-popup-acoes-iguais">
                                <button type="button" class="button is-danger" disabled={ocupado} onClick={() => void excluir()}>
                                    Excluir
                                </button>
                                <button type="button" class="button" disabled={ocupado} onClick={() => definirConfirmacao(null)}>
                                    Manter
                                </button>
                            </div>
                        </>
                    )
                    : (
                        <>
                            <h2 id="balanco-popup-titulo" class="title is-4 balanco-popup-titulo">
                                {possuiBalanco ? "Editar balanço sentimental" : "Adicionar balanço sentimental"}
                            </h2>
                            <textarea
                                ref={campo}
                                class="textarea balanco-campo"
                                rows={5}
                                aria-label="Balanço sentimental"
                                placeholder="Registre os sentimentos que esta memória despertou em você…"
                                value={texto}
                                disabled={ocupado}
                                onInput={(evento) => gravarRascunho(evento.currentTarget.value)}
                            />
                            {erro && <p class="notification is-warning" role="alert">{erro}</p>}
                            <div class="balanco-popup-acoes balanco-popup-acoes-iguais">
                                <button
                                    type="button"
                                    class="button is-success"
                                    disabled={ocupado || !texto.trim()}
                                    onClick={() => void salvar()}
                                >
                                    Salvar
                                </button>
                                <button type="button" class="button" disabled={ocupado} onClick={tentarFechar}>Cancelar</button>
                                {possuiBalanco && (
                                    <button
                                        type="button"
                                        class="button is-danger"
                                        disabled={ocupado}
                                        onClick={() => definirConfirmacao("exclusao")}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </>
                    )}
            </dialog>
        </section>
    )
}
