import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import { avancarSeletor, type CurvaRespostaSeletor, type RespostaSeletor } from "../app/utilitarios/respostaSeletor.ts"
import { aparenciaTom } from "../app/utilitarios/aparenciaTom.ts"
import {
    avaliarPosicoesJanela,
    criarIntervaloJanela,
    type EstadoJanelaTemporal,
    type IntervaloJanela,
    limitarPosicaoAlca,
    limitarPosicaoContinua,
    moverAlcaSemCruzamento,
    moverJanelaPorFaixa,
    posicaoDiscreta,
    posicaoDivisoria,
    type PosicoesJanela
} from "../app/utilitarios/janelaTemporal.ts"

interface PropriedadesJanelaTemporal {
    id: string
    dias: readonly string[]
    estadoInicial?: EstadoJanelaTemporal | null
    inicializacaoPronta?: boolean
    densidadeMaximaMarcadores?: number
    mostrarDiagnostico?: boolean
    mostrarDatasExtremas?: boolean
    respostaSeletor?: RespostaSeletor
    movimentoReduzido?: boolean
    tomAparencia?: number | null
    aoAlterarIntervalo?: (intervalo: IntervaloJanela) => void
    aoAlterarPosicoes?: (estado: EstadoJanelaTemporal) => void
}

export type { CurvaRespostaSeletor }

type Arraste =
    | { tipo: "alca"; lado: "esquerda" | "direita"; deslocamentoPx: number }
    | { tipo: "faixa"; inicioX: number; estado: EstadoJanelaTemporal; largura: number }

type AlvoAproximacao =
    | { tipo: "alca"; lado: "esquerda" | "direita"; posicao: number }
    | { tipo: "faixa"; posicoes: PosicoesJanela }

function formatarData(data: string): string {
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
}

function mesmoIntervalo(a: IntervaloJanela | null, b: IntervaloJanela | null): boolean {
    return a?.primeiraPosicao === b?.primeiraPosicao && a?.ultimaPosicao === b?.ultimaPosicao
}

export default function JanelaTemporal({
    id,
    dias,
    estadoInicial = null,
    inicializacaoPronta = true,
    densidadeMaximaMarcadores = 7,
    mostrarDiagnostico = false,
    mostrarDatasExtremas = false,
    respostaSeletor,
    movimentoReduzido = false,
    tomAparencia = null,
    aoAlterarIntervalo,
    aoAlterarPosicoes
}: PropriedadesJanelaTemporal) {
    const iniciais: PosicoesJanela = estadoInicial?.posicoes ?? { esquerda: 0, direita: 1 }
    const [posicoes, definirPosicoes] = useState<PosicoesJanela>(iniciais)
    const [intervaloDaFaixa, definirIntervaloDaFaixa] = useState<IntervaloJanela | null>(
        estadoInicial?.intervaloDeslocado && !avaliarPosicoesJanela(dias, estadoInicial.posicoes, null).valido
            ? estadoInicial.intervaloValido
            : null
    )
    const [largura, definirLargura] = useState(0)
    const [dpr, definirDpr] = useState(1)
    const [movimentoReduzidoSistema, definirMovimentoReduzidoSistema] = useState(false)
    const trilho = useRef<HTMLDivElement>(null)
    const arraste = useRef<Arraste | null>(null)
    const posicoesRef = useRef(posicoes)
    const alvoAproximacao = useRef<AlvoAproximacao | null>(null)
    const quadroAproximacao = useRef<number | null>(null)
    const instanteAproximacao = useRef<number | null>(null)
    const velocidadeAlca = useRef(0)
    const respostaSeletorRef = useRef(respostaSeletor)
    respostaSeletorRef.current = respostaSeletor
    const atualizarPosicoesRef = useRef<
        (proximas: PosicoesJanela, ladoAtivo?: "esquerda" | "direita", intervaloDeslocado?: boolean) => void
    >(() => {})
    const intervaloValido = useRef(estadoInicial?.intervaloValido ?? criarIntervaloJanela(dias, 0, Math.max(1, dias.length - 1)))
    const callbackIntervalo = useRef(aoAlterarIntervalo)
    callbackIntervalo.current = aoAlterarIntervalo

    useEffect(() => {
        const elemento = trilho.current
        if (!elemento) return
        const observar = new ResizeObserver((entradas) => definirLargura(entradas[0]?.contentRect.width ?? 0))
        observar.observe(elemento)
        definirLargura(elemento.getBoundingClientRect().width)
        definirDpr(globalThis.devicePixelRatio || 1)
        return () => observar.disconnect()
    }, [])

    useEffect(() => {
        if (typeof matchMedia === "undefined") return
        const consulta = matchMedia("(prefers-reduced-motion: reduce)")
        const atualizar = () => definirMovimentoReduzidoSistema(consulta.matches)
        atualizar()
        consulta.addEventListener("change", atualizar)
        return () => consulta.removeEventListener("change", atualizar)
    }, [])

    useEffect(() => () => {
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        velocidadeAlca.current = 0
    }, [])

    useEffect(() => {
        if (!movimentoReduzido && !movimentoReduzidoSistema) return
        const alvo = alvoAproximacao.current
        if (!alvo) return
        alvoAproximacao.current = null
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        quadroAproximacao.current = null
        instanteAproximacao.current = null
        velocidadeAlca.current = 0
        atualizarPosicoesRef.current(
            alvo.tipo === "alca"
                ? alvo.lado === "esquerda"
                    ? { ...posicoesRef.current, esquerda: alvo.posicao }
                    : { ...posicoesRef.current, direita: alvo.posicao }
                : alvo.posicoes,
            alvo.tipo === "alca" ? alvo.lado : undefined,
            alvo.tipo === "faixa"
        )
    }, [movimentoReduzido, movimentoReduzidoSistema])

    useEffect(() => {
        if (!inicializacaoPronta) return
        if (estadoInicial) {
            const restauradas = {
                esquerda: limitarPosicaoAlca(estadoInicial.posicoes.esquerda, estadoInicial.posicoes.direita, "esquerda"),
                direita: limitarPosicaoAlca(estadoInicial.posicoes.direita, estadoInicial.posicoes.esquerda, "direita")
            }
            posicoesRef.current = restauradas
            definirPosicoes(restauradas)
            const avaliacaoRestaurada = avaliarPosicoesJanela(dias, restauradas, null)
            const intervaloRestaurado = avaliacaoRestaurada.intervaloAtual ?? estadoInicial.intervaloValido
            intervaloValido.current = intervaloRestaurado
            definirIntervaloDaFaixa(avaliacaoRestaurada.valido ? null : intervaloRestaurado)
        }
        if (intervaloValido.current) callbackIntervalo.current?.(intervaloValido.current)
    }, [dias, estadoInicial, inicializacaoPronta])

    const avaliacao = avaliarPosicoesJanela(dias, posicoes, intervaloValido.current)
    const intervaloAtual = intervaloDaFaixa ?? avaliacao.intervaloAtual
    const intervaloPublicado = intervaloDaFaixa ?? avaliacao.intervaloPublicado
    const geometriaValida = avaliacao.valido
    const orientacao = dias.length < 2
        ? ""
        : geometriaValida
        ? `${intervaloAtual!.quantidadeDias} dias preservados, entre ${formatarData(intervaloAtual!.primeiroDia)} e ${
            formatarData(intervaloAtual!.ultimoDia)
        }`
        : "Amplie o intervalo para incluir pelo menos dois dias preservados."
    const densidade = largura > 0 ? dias.length / (largura / 100) : Number.POSITIVE_INFINITY
    const estadoMarcadores = densidade <= densidadeMaximaMarcadores ? "visiveis" : "ausentes"
    const porcentagemEsquerda = posicoes.esquerda * 100
    const porcentagemDireita = posicoes.direita * 100
    const aparencia = aparenciaTom(tomAparencia)
    const marcadores = useMemo(() =>
        estadoMarcadores === "visiveis"
            ? dias.slice(0, -1).map((_, indice) => {
                const posicao = posicaoDivisoria(indice, dias.length) ?? 0
                return <i key={indice} style={{ left: `${posicao * 100}%` }} />
            })
            : null, [dias, estadoMarcadores])

    function atualizarPosicoes(
        proximas: PosicoesJanela,
        ladoAtivo?: "esquerda" | "direita",
        intervaloDeslocado = false
    ) {
        if (intervaloDaFaixa) definirIntervaloDaFaixa(null)
        const ordenadas = ladoAtivo ? moverAlcaSemCruzamento(posicoesRef.current, ladoAtivo, proximas[ladoAtivo]) : proximas
        const antes = posicoesRef.current
        posicoesRef.current = ordenadas
        definirPosicoes(ordenadas)
        const resultado = avaliarPosicoesJanela(dias, ordenadas, intervaloValido.current)
        if (resultado.intervaloAtual) {
            const mudouIntervalo = !mesmoIntervalo(intervaloValido.current, resultado.intervaloAtual)
            intervaloValido.current = resultado.intervaloAtual
            if (mudouIntervalo) aoAlterarIntervalo?.(resultado.intervaloAtual)
        }
        if (antes.esquerda !== ordenadas.esquerda || antes.direita !== ordenadas.direita) {
            if (intervaloValido.current) {
                aoAlterarPosicoes?.({
                    posicoes: ordenadas,
                    intervaloValido: intervaloValido.current,
                    ...(intervaloDeslocado ? { intervaloDeslocado: true } : {})
                })
            }
        }
    }

    atualizarPosicoesRef.current = atualizarPosicoes

    function aproximarAlca(instante: number) {
        quadroAproximacao.current = null
        const alvo = alvoAproximacao.current
        if (!alvo) return
        const resposta = respostaSeletorRef.current
        if (!resposta || resposta.atrasoMs <= 0) {
            alvoAproximacao.current = null
            atualizarPosicoesRef.current(
                alvo.tipo === "alca"
                    ? alvo.lado === "esquerda"
                        ? { ...posicoesRef.current, esquerda: alvo.posicao }
                        : { ...posicoesRef.current, direita: alvo.posicao }
                    : alvo.posicoes,
                alvo.tipo === "alca" ? alvo.lado : undefined,
                alvo.tipo === "faixa"
            )
            instanteAproximacao.current = null
            velocidadeAlca.current = 0
            return
        }

        const anterior = instanteAproximacao.current ?? instante
        const decorrido = Math.min(64, Math.max(0, instante - anterior)) / 1000
        instanteAproximacao.current = instante
        const lado = alvo.tipo === "alca" ? alvo.lado : null
        const atual = lado ? posicoesRef.current[lado] : posicoesRef.current.esquerda
        const posicaoAlvo = alvo.tipo === "alca" ? alvo.posicao : alvo.posicoes.esquerda
        const avancamento = avancarSeletor(atual, posicaoAlvo, velocidadeAlca.current, decorrido, resposta)
        const proximaPosicao = avancamento.valor
        const proximas = alvo.tipo === "alca"
            ? alvo.lado === "esquerda"
                ? { ...posicoesRef.current, esquerda: proximaPosicao }
                : { ...posicoesRef.current, direita: proximaPosicao }
            : {
                esquerda: proximaPosicao,
                direita: proximaPosicao + (alvo.posicoes.direita - alvo.posicoes.esquerda)
            }
        atualizarPosicoesRef.current(
            proximas,
            lado ?? undefined,
            alvo.tipo === "faixa"
        )

        const posicaoAtual = lado ? posicoesRef.current[lado] : posicoesRef.current.esquerda
        if (avancamento.concluido || posicaoAtual === posicaoAlvo) {
            alvoAproximacao.current = null
            instanteAproximacao.current = null
            velocidadeAlca.current = 0
            return
        }
        velocidadeAlca.current = avancamento.velocidade
        quadroAproximacao.current = requestAnimationFrame(aproximarAlca)
    }

    function definirAlvoComResposta(alvo: AlvoAproximacao) {
        const lado = alvo.tipo === "alca" ? alvo.lado : null
        const proximas = alvo.tipo === "alca"
            ? alvo.lado === "esquerda"
                ? { ...posicoesRef.current, esquerda: alvo.posicao }
                : { ...posicoesRef.current, direita: alvo.posicao }
            : alvo.posicoes
        if (movimentoReduzido || movimentoReduzidoSistema || !respostaSeletor || respostaSeletor.atrasoMs <= 0) {
            alvoAproximacao.current = null
            if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
            quadroAproximacao.current = null
            instanteAproximacao.current = null
            velocidadeAlca.current = 0
            atualizarPosicoes(proximas, lado ?? undefined, alvo.tipo === "faixa")
            return
        }
        alvoAproximacao.current = alvo
        if (quadroAproximacao.current === null) {
            instanteAproximacao.current = null
            quadroAproximacao.current = requestAnimationFrame(aproximarAlca)
        }
    }

    function moverAlcaComResposta(lado: "esquerda" | "direita", posicao: number) {
        const outraPosicao = posicoesRef.current[lado === "esquerda" ? "direita" : "esquerda"]
        const limitada = limitarPosicaoAlca(posicao, outraPosicao, lado)
        definirAlvoComResposta({ tipo: "alca", lado, posicao: limitada })
    }

    function moverFaixaComResposta(posicoesAlvo: PosicoesJanela) {
        definirAlvoComResposta({ tipo: "faixa", posicoes: posicoesAlvo })
    }

    function coordenadaContinua(evento: PointerEvent, deslocamentoPx = 0): number {
        const caixa = trilho.current?.getBoundingClientRect()
        if (!caixa || caixa.width <= 0) return 0
        return limitarPosicaoContinua((evento.clientX - caixa.left + deslocamentoPx) / caixa.width)
    }

    function iniciarAlca(evento: PointerEvent, lado: "esquerda" | "direita") {
        evento.stopPropagation()
        alvoAproximacao.current = null
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        quadroAproximacao.current = null
        instanteAproximacao.current = null
        velocidadeAlca.current = 0
        const posicao = posicoesRef.current[lado]
        const caixa = trilho.current?.getBoundingClientRect()
        const pontoLogico = caixa ? caixa.left + posicao * caixa.width : evento.clientX
        arraste.current = { tipo: "alca", lado, deslocamentoPx: pontoLogico - evento.clientX }
        trilho.current?.setPointerCapture(evento.pointerId)
    }

    function iniciarFaixa(evento: PointerEvent) {
        evento.stopPropagation()
        const caixa = trilho.current?.getBoundingClientRect()
        const intervalo = intervaloDaFaixa ?? avaliacao.intervaloAtual ?? intervaloValido.current
        if (!caixa || caixa.width <= 0 || !intervalo) return
        alvoAproximacao.current = null
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        quadroAproximacao.current = null
        instanteAproximacao.current = null
        velocidadeAlca.current = 0
        arraste.current = {
            tipo: "faixa",
            inicioX: evento.clientX,
            estado: { posicoes: posicoesRef.current, intervaloValido: intervalo },
            largura: caixa.width
        }
        trilho.current?.setPointerCapture(evento.pointerId)
    }

    function iniciarTrilho(evento: PointerEvent) {
        if (evento.target !== evento.currentTarget || dias.length < 2) return
        const ponto = coordenadaContinua(evento)
        alvoAproximacao.current = null
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        quadroAproximacao.current = null
        instanteAproximacao.current = null
        velocidadeAlca.current = 0
        const esquerdaX = posicoesRef.current.esquerda * largura
        const direitaX = posicoesRef.current.direita * largura
        const lado = Math.abs(ponto * largura - esquerdaX) <= Math.abs(ponto * largura - direitaX) ? "esquerda" : "direita"
        arraste.current = { tipo: "alca", lado, deslocamentoPx: 0 }
        trilho.current?.setPointerCapture(evento.pointerId)
        moverAlcaComResposta(lado, ponto)
    }

    function moverPonteiro(evento: PointerEvent) {
        const atual = arraste.current
        if (!atual || largura <= 0) return
        if (atual.tipo === "alca") {
            const posicao = coordenadaContinua(evento, atual.deslocamentoPx)
            moverAlcaComResposta(atual.lado, posicao)
            return
        }
        const deslocamento = (evento.clientX - atual.inicioX) / atual.largura
        const proximo = moverJanelaPorFaixa(dias, atual.estado, deslocamento)
        moverFaixaComResposta(proximo.posicoes)
    }

    function finalizarArraste() {
        arraste.current = null
    }

    function operarTeclado(evento: KeyboardEvent, lado: "esquerda" | "direita") {
        alvoAproximacao.current = null
        if (quadroAproximacao.current !== null) cancelAnimationFrame(quadroAproximacao.current)
        quadroAproximacao.current = null
        instanteAproximacao.current = null
        velocidadeAlca.current = 0
        const passos: Record<string, number> = {
            ArrowLeft: -0.01,
            ArrowDown: -0.01,
            ArrowRight: 0.01,
            ArrowUp: 0.01,
            PageDown: -0.1,
            PageUp: 0.1
        }
        if (evento.key === "Home" || evento.key === "End") {
            evento.preventDefault()
            const posicao = evento.key === "Home" ? 0 : 1
            atualizarPosicoes(
                lado === "esquerda" ? { ...posicoesRef.current, esquerda: posicao } : { ...posicoesRef.current, direita: posicao },
                lado
            )
            return
        }
        const passo = passos[evento.key]
        if (passo === undefined) return
        evento.preventDefault()
        const posicao = limitarPosicaoContinua(posicoesRef.current[lado] + passo)
        atualizarPosicoes(
            lado === "esquerda" ? { ...posicoesRef.current, esquerda: posicao } : { ...posicoesRef.current, direita: posicao },
            lado
        )
    }

    function descricaoAlca(lado: "esquerda" | "direita") {
        const intervalo = intervaloDaFaixa
        const indice = intervalo
            ? (lado === "esquerda" ? intervalo.primeiraPosicao : intervalo.ultimaPosicao)
            : posicaoDiscreta(posicoes[lado], dias.length)
        const dia = dias[indice]
        return dia ? `${formatarData(dia)}; posição contínua ${Math.round(posicoes[lado] * 100)}%` : "Sem dia disponível"
    }

    return (
        <section
            class={`janela-temporal ${aparencia.className}${tomAparencia === 0 ? " tom-neutro" : ""}${mostrarDatasExtremas ? " janela-temporal-com-datas" : ""}`}
            style={aparencia.style}
            aria-labelledby={mostrarDatasExtremas ? `${id}-rotulo` : `${id}-orientacao`}
        >
            {mostrarDatasExtremas && <p class="janela-temporal-rotulo" id={`${id}-rotulo`}>Período</p>}
            {!mostrarDatasExtremas && (
                <p
                    class={`janela-temporal-orientacao${geometriaValida ? "" : " has-text-warning"}`}
                    id={`${id}-orientacao`}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {orientacao}
                </p>
            )}
            <div
                class="janela-temporal-trilho"
                id={`${id}-trilho`}
                ref={trilho}
                data-marcadores={estadoMarcadores}
                onPointerDown={iniciarTrilho}
                onPointerMove={moverPonteiro}
                onPointerUp={finalizarArraste}
                onPointerCancel={finalizarArraste}
                onLostPointerCapture={finalizarArraste}
            >
                <span
                    class="janela-temporal-faixa"
                    aria-hidden="true"
                    style={{ left: `${porcentagemEsquerda}%`, width: `${porcentagemDireita - porcentagemEsquerda}%` }}
                />
                <span class="janela-temporal-marcadores" aria-hidden="true">
                    {marcadores}
                </span>
                <span
                    class="janela-temporal-selecao"
                    aria-hidden="true"
                    style={{ left: `${porcentagemEsquerda}%`, width: `${porcentagemDireita - porcentagemEsquerda}%` }}
                    onPointerDown={iniciarFaixa}
                />
                <button
                    type="button"
                    class="janela-temporal-alca janela-temporal-alca-esquerda"
                    role="slider"
                    aria-label="Limite esquerdo do intervalo"
                    aria-describedby={`${id}-orientacao`}
                    aria-controls={`${id}-trilho`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(posicoes.esquerda * 100)}
                    aria-valuetext={descricaoAlca("esquerda")}
                    style={{ left: `${porcentagemEsquerda}%` }}
                    onPointerDown={(evento) => iniciarAlca(evento, "esquerda")}
                    onKeyDown={(evento) => operarTeclado(evento, "esquerda")}
                />
                <button
                    type="button"
                    class="janela-temporal-alca janela-temporal-alca-direita"
                    role="slider"
                    aria-label="Limite direito do intervalo"
                    aria-describedby={`${id}-orientacao`}
                    aria-controls={`${id}-trilho`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(posicoes.direita * 100)}
                    aria-valuetext={descricaoAlca("direita")}
                    style={{ left: `${porcentagemDireita}%` }}
                    onPointerDown={(evento) => iniciarAlca(evento, "direita")}
                    onKeyDown={(evento) => operarTeclado(evento, "direita")}
                />
            </div>
            {mostrarDatasExtremas && (
                <p
                    class={`janela-temporal-datas${geometriaValida ? "" : " has-text-warning"}`}
                    id={`${id}-orientacao`}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {geometriaValida
                        ? (
                            <>
                                <span>{formatarData(intervaloAtual!.primeiroDia)}</span>
                                <span>{formatarData(intervaloAtual!.ultimoDia)}</span>
                            </>
                        )
                        : "Inclua pelo menos dois dias no período."}
                </p>
            )}
            {mostrarDiagnostico && (
                <dl class="janela-temporal-diagnostico">
                    <div>
                        <dt>Posições contínuas</dt>
                        <dd>{posicoes.esquerda.toFixed(4)} / {posicoes.direita.toFixed(4)}</dd>
                    </div>
                    <div>
                        <dt>Posições discretas</dt>
                        <dd>{avaliacao.posicaoEsquerda} / {avaliacao.posicaoDireita}</dd>
                    </div>
                    <div>
                        <dt>Intervalo publicado</dt>
                        <dd>
                            {intervaloPublicado
                                ? `${intervaloPublicado.primeiraPosicao}–${intervaloPublicado.ultimaPosicao} (${intervaloPublicado.quantidadeDias} dias)`
                                : "indisponível"}
                        </dd>
                    </div>
                    <div>
                        <dt>Estado geométrico</dt>
                        <dd>{geometriaValida ? "válido" : "inválido"}</dd>
                    </div>
                    <div>
                        <dt>Resolução física aproximada</dt>
                        <dd>{Math.round(largura * dpr)} px</dd>
                    </div>
                    <div>
                        <dt>Densidade</dt>
                        <dd>{densidade.toFixed(2)} dias / 100 px · marcadores {estadoMarcadores}</dd>
                    </div>
                </dl>
            )}
        </section>
    )
}
