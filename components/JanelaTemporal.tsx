import { useEffect, useRef, useState } from "preact/hooks"
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
    marcadoresPlenosAte?: number
    marcadoresEsmaecidosAte?: number
    mostrarDiagnostico?: boolean
    aoAlterarIntervalo?: (intervalo: IntervaloJanela) => void
    aoAlterarPosicoes?: (estado: EstadoJanelaTemporal) => void
}

type Arraste =
    | { tipo: "alca"; lado: "esquerda" | "direita"; deslocamentoPx: number }
    | { tipo: "faixa"; inicioX: number; estado: EstadoJanelaTemporal; largura: number }

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
    marcadoresPlenosAte = 5,
    marcadoresEsmaecidosAte = 7,
    mostrarDiagnostico = false,
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
    const trilho = useRef<HTMLDivElement>(null)
    const arraste = useRef<Arraste | null>(null)
    const posicoesRef = useRef(posicoes)
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
    const estadoMarcadores = densidade <= marcadoresPlenosAte
        ? "visiveis"
        : densidade <= marcadoresEsmaecidosAte
        ? "esmaecidos"
        : "ausentes"
    const porcentagemEsquerda = posicoes.esquerda * 100
    const porcentagemDireita = posicoes.direita * 100
    const numeroMarcadores = estadoMarcadores === "ausentes" ? [] : dias.slice(0, -1).map((_, indice) => indice)

    function atualizarPosicoes(proximas: PosicoesJanela, ladoAtivo?: "esquerda" | "direita") {
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
                aoAlterarPosicoes?.({ posicoes: ordenadas, intervaloValido: intervaloValido.current })
            }
        }
    }

    function coordenadaContinua(evento: PointerEvent, deslocamentoPx = 0): number {
        const caixa = trilho.current?.getBoundingClientRect()
        if (!caixa || caixa.width <= 0) return 0
        return limitarPosicaoContinua((evento.clientX - caixa.left + deslocamentoPx) / caixa.width)
    }

    function iniciarAlca(evento: PointerEvent, lado: "esquerda" | "direita") {
        evento.stopPropagation()
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
        const esquerdaX = posicoesRef.current.esquerda * largura
        const direitaX = posicoesRef.current.direita * largura
        const lado = Math.abs(ponto * largura - esquerdaX) <= Math.abs(ponto * largura - direitaX) ? "esquerda" : "direita"
        const outras = posicoesRef.current[lado === "esquerda" ? "direita" : "esquerda"]
        const novas = lado === "esquerda"
            ? { ...posicoesRef.current, esquerda: Math.min(ponto, outras) }
            : { ...posicoesRef.current, direita: Math.max(ponto, outras) }
        arraste.current = { tipo: "alca", lado, deslocamentoPx: 0 }
        trilho.current?.setPointerCapture(evento.pointerId)
        atualizarPosicoes(novas, lado)
    }

    function moverPonteiro(evento: PointerEvent) {
        const atual = arraste.current
        if (!atual || largura <= 0) return
        if (atual.tipo === "alca") {
            const posicao = coordenadaContinua(evento, atual.deslocamentoPx)
            atualizarPosicoes(
                atual.lado === "esquerda" ? { ...posicoesRef.current, esquerda: posicao } : { ...posicoesRef.current, direita: posicao },
                atual.lado
            )
            return
        }
        const deslocamento = (evento.clientX - atual.inicioX) / atual.largura
        const proximo = moverJanelaPorFaixa(dias, atual.estado, deslocamento)
        const avaliacaoProxima = avaliarPosicoesJanela(dias, proximo.posicoes, proximo.intervaloValido)
        const antes = posicoesRef.current
        posicoesRef.current = proximo.posicoes
        definirPosicoes(proximo.posicoes)
        definirIntervaloDaFaixa(avaliacaoProxima.valido ? null : proximo.intervaloValido)
        const mudouIntervalo = !mesmoIntervalo(intervaloValido.current, proximo.intervaloValido)
        if (mudouIntervalo) aoAlterarIntervalo?.(proximo.intervaloValido)
        intervaloValido.current = proximo.intervaloValido
        if (antes.esquerda !== proximo.posicoes.esquerda || antes.direita !== proximo.posicoes.direita) {
            aoAlterarPosicoes?.(proximo)
        }
    }

    function finalizarArraste() {
        arraste.current = null
    }

    function operarTeclado(evento: KeyboardEvent, lado: "esquerda" | "direita") {
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
        <section class="janela-temporal" aria-labelledby={`${id}-orientacao`}>
            <p
                class={`janela-temporal-orientacao${geometriaValida ? "" : " has-text-warning"}`}
                id={`${id}-orientacao`}
                aria-live="polite"
                aria-atomic="true"
            >
                {orientacao}
            </p>
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
                    {numeroMarcadores.map((indice) => {
                        const posicao = posicaoDivisoria(indice, dias.length) ?? 0
                        return <i key={indice} style={{ left: `${posicao * 100}%` }} />
                    })}
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
