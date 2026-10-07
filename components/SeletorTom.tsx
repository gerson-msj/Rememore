import { useEffect, useLayoutEffect, useRef, useState } from "preact/hooks"
import { avancarSeletor, RESPOSTA_TOM_PADRAO, type RespostaSeletor } from "../app/utilitarios/respostaSeletor.ts"

interface PropriedadesSeletorTom {
    id: string
    valor: number
    desabilitado?: boolean
    aoAlterar: (valor: number) => void
    aoConcluir?: () => void
    respostaSeletor?: RespostaSeletor
}

export default function SeletorTom({
    id,
    valor,
    desabilitado = false,
    aoAlterar,
    aoConcluir,
    respostaSeletor = RESPOSTA_TOM_PADRAO
}: PropriedadesSeletorTom) {
    const [valorVisual, definirValorVisual] = useState(valor)
    const valorVisualRef = useRef(valor)
    const alvoRef = useRef(valor)
    const velocidadeRef = useRef(0)
    const instanteRef = useRef<number | null>(null)
    const quadroRef = useRef<number | null>(null)
    const ultimoValorPublicadoRef = useRef(valor)
    const concluirPendenteRef = useRef(false)
    const callbackAlterarRef = useRef(aoAlterar)
    const callbackConcluirRef = useRef(aoConcluir)
    const respostaRef = useRef(respostaSeletor)
    const trilho = useRef<HTMLDivElement>(null)
    const ponteiroAtivoRef = useRef<number | null>(null)
    callbackAlterarRef.current = aoAlterar
    callbackConcluirRef.current = aoConcluir
    respostaRef.current = respostaSeletor

    useLayoutEffect(() => {
        if (valor === ultimoValorPublicadoRef.current) return
        ultimoValorPublicadoRef.current = valor
        alvoRef.current = valor
        valorVisualRef.current = valor
        velocidadeRef.current = 0
        instanteRef.current = null
        if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current)
        quadroRef.current = null
        definirValorVisual(valor)
    }, [valor])

    useEffect(() => () => {
        if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current)
    }, [])

    function publicarValor(proximo: number) {
        valorVisualRef.current = proximo
        definirValorVisual(proximo)
        const valorArredondado = Math.round(proximo)
        if (valorArredondado !== ultimoValorPublicadoRef.current) {
            ultimoValorPublicadoRef.current = valorArredondado
            callbackAlterarRef.current(valorArredondado)
        }
    }

    function concluir() {
        if (quadroRef.current !== null) {
            concluirPendenteRef.current = true
            return
        }
        concluirPendenteRef.current = false
        callbackConcluirRef.current?.()
    }

    function animar(instante: number) {
        quadroRef.current = null
        const resposta = respostaRef.current
        const atualNormalizado = (valorVisualRef.current + 100) / 200
        const alvoNormalizado = (alvoRef.current + 100) / 200
        const anterior = instanteRef.current ?? instante
        const decorrido = Math.min(64, Math.max(0, instante - anterior)) / 1000
        instanteRef.current = instante
        const avancamento = avancarSeletor(atualNormalizado, alvoNormalizado, velocidadeRef.current, decorrido, resposta)
        const valor = avancamento.valor * 200 - 100
        publicarValor(avancamento.concluido ? alvoRef.current : valor)

        if (avancamento.concluido) {
            alvoRef.current = valorVisualRef.current = alvoRef.current
            velocidadeRef.current = 0
            instanteRef.current = null
            if (concluirPendenteRef.current) {
                concluirPendenteRef.current = false
                callbackConcluirRef.current?.()
            }
            return
        }
        velocidadeRef.current = avancamento.velocidade
        quadroRef.current = requestAnimationFrame(animar)
    }

    function alterarAlvo(proximo: number) {
        alvoRef.current = proximo
        concluirPendenteRef.current = false
        const movimentoReduzido = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
        if (respostaRef.current.atrasoMs <= 0 || movimentoReduzido) {
            if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current)
            quadroRef.current = null
            instanteRef.current = null
            velocidadeRef.current = 0
            publicarValor(proximo)
            if (ultimoValorPublicadoRef.current !== proximo) {
                ultimoValorPublicadoRef.current = proximo
                callbackAlterarRef.current(proximo)
            }
            return
        }
        if (quadroRef.current === null) {
            instanteRef.current = null
            quadroRef.current = requestAnimationFrame(animar)
        }
    }

    function posicaoPonteiro(evento: PointerEvent): number {
        const caixa = trilho.current?.getBoundingClientRect()
        if (!caixa || caixa.width <= 0) return alvoRef.current
        const fracao = Math.min(1, Math.max(0, (evento.clientX - caixa.left) / caixa.width))
        return Math.round(fracao * 200 - 100)
    }

    function iniciarArraste(evento: PointerEvent) {
        if (desabilitado || evento.button !== 0) return
        const alvo = evento.target as HTMLElement | null
        if (!alvo?.closest(".seletor-tom-superficie-ponteiro")) return
        evento.preventDefault()
        ponteiroAtivoRef.current = evento.pointerId
        const superficie = evento.currentTarget as HTMLElement
        superficie.setPointerCapture(evento.pointerId)
        alterarAlvo(posicaoPonteiro(evento))
    }

    function moverArraste(evento: PointerEvent) {
        if (ponteiroAtivoRef.current !== evento.pointerId) return
        alterarAlvo(posicaoPonteiro(evento))
    }

    function finalizarArraste(evento: PointerEvent) {
        if (ponteiroAtivoRef.current !== evento.pointerId) return
        ponteiroAtivoRef.current = null
        concluir()
        const superficie = evento.currentTarget as HTMLElement
        if (superficie.hasPointerCapture(evento.pointerId)) superficie.releasePointerCapture(evento.pointerId)
    }

    useEffect(() => {
        if (typeof matchMedia === "undefined") return
        const consulta = matchMedia("(prefers-reduced-motion: reduce)")
        const atualizar = () => {
            if (!consulta.matches || quadroRef.current === null) return
            if (quadroRef.current !== null) cancelAnimationFrame(quadroRef.current)
            quadroRef.current = null
            instanteRef.current = null
            velocidadeRef.current = 0
            publicarValor(alvoRef.current)
            if (concluirPendenteRef.current) {
                concluirPendenteRef.current = false
                callbackConcluirRef.current?.()
            }
        }
        atualizar()
        consulta.addEventListener("change", atualizar)
        return () => consulta.removeEventListener("change", atualizar)
    }, [])

    const tomVisivel = valorVisual
    const intensidade = Math.abs(tomVisivel)
    const larguraRevelada = `${intensidade / 2}%`
    const estilo = {
        "--seletor-tom-largura": larguraRevelada,
        "--seletor-tom-inicio": tomVisivel < 0 ? `calc(50% - ${larguraRevelada})` : "50%",
        "--seletor-tom-extremo": `var(--tom-${tomVisivel < 0 ? "negativo" : "positivo"})`,
        "--seletor-tom-intensidade": `${intensidade}%`,
        "--seletor-tom-alca": tomVisivel === 0
            ? "var(--bulma-text-strong)"
            : `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`,
        "--seletor-tom-cor-inicial": tomVisivel < 0
            ? `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`
            : "var(--bulma-text-weak)",
        "--seletor-tom-cor-final": tomVisivel < 0
            ? "var(--bulma-text-weak)"
            : `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`,
        "--seletor-tom-posicao": `${((tomVisivel + 100) / 2)}%`
    }
    const tomAcessivel = Math.round(tomVisivel)
    const descricao = tomAcessivel === 0 ? "Neutro" : tomAcessivel < 0 ? "Negativo" : "Positivo"

    return (
        <div
            class="seletor-tom"
            style={estilo}
            onPointerDown={iniciarArraste}
            onPointerMove={moverArraste}
            onPointerUp={finalizarArraste}
            onPointerCancel={finalizarArraste}
            onLostPointerCapture={finalizarArraste}
        >
            <div class="seletor-tom-trilha" ref={trilho} aria-hidden="true">
                <span class="seletor-tom-revelado" />
                <span class="seletor-tom-centro" />
            </div>
            <span class="seletor-tom-alcas" aria-hidden="true">
                <span class="seletor-tom-alca-visual" />
            </span>
            <label class="is-sr-only" for={id}>Tom: Negativo, Neutro ou Positivo</label>
            <input
                id={id}
                class="seletor-tom-controle"
                type="range"
                min={-100}
                max={100}
                step={1}
                value={tomAcessivel}
                disabled={desabilitado}
                aria-valuetext={desabilitado ? "Sem Tom" : descricao}
                aria-valuenow={tomAcessivel}
                onInput={(evento) => alterarAlvo(Number(evento.currentTarget.value))}
                onKeyUp={(evento) => {
                    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(evento.key)) {
                        concluir()
                    }
                }}
                onBlur={concluir}
            />
            <span
                class="seletor-tom-superficie-ponteiro"
                aria-hidden="true"
            />
            <div class="seletor-tom-referencias" aria-hidden="true">
                <span>Negativo</span>
                <span>Neutro</span>
                <span>Positivo</span>
            </div>
        </div>
    )
}
