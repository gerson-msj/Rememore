import { useEffect, useRef, useState } from "preact/hooks"
import { aparenciaTom } from "../app/utilitarios/aparenciaTom.ts"
import { calcularOndaUtilizacaoCategoria, calcularTangentesOnda } from "../app/utilitarios/ondaUtilizacaoCategoria.ts"

export interface OndaUtilizacaoCategoriaProps {
    serie: readonly number[]
    tom: number | null
}

function gerarCaminhoSvg(pontos: readonly number[]): string {
    const tangentes = calcularTangentesOnda(pontos)
    const passoX = 100 / 3
    const coordenadaY = (ponto: number) => 50 - ponto * 40
    const trechos = pontos.slice(0, -1).map((ponto, indice) => {
        const xInicial = indice * passoX
        const xFinal = (indice + 1) * passoX
        const yInicial = coordenadaY(ponto)
        const yFinal = coordenadaY(pontos[indice + 1])
        const derivadaInicial = -40 * tangentes[indice]
        const derivadaFinal = -40 * tangentes[indice + 1]
        return `C ${xInicial + passoX / 3},${yInicial + derivadaInicial / 3} ${xFinal - passoX / 3},${
            yFinal - derivadaFinal / 3
        } ${xFinal},${yFinal}`
    })
    return `M 0,${coordenadaY(pontos[0])} ${trechos.join(" ")}`
}

export default function OndaUtilizacaoCategoria({ serie, tom }: OndaUtilizacaoCategoriaProps) {
    const resultado = calcularOndaUtilizacaoCategoria(serie)
    const assinatura = resultado.pontos.join(",")
    const [pontos, definirPontos] = useState(resultado.pontos)
    const [movimentoReduzido, definirMovimentoReduzido] = useState(false)
    const pontosAtuais = useRef(pontos)

    useEffect(() => {
        const consulta = matchMedia("(prefers-reduced-motion: reduce)")
        const atualizar = () => definirMovimentoReduzido(consulta.matches)
        atualizar()
        consulta.addEventListener("change", atualizar)
        return () => consulta.removeEventListener("change", atualizar)
    }, [])

    useEffect(() => {
        const destino = resultado.pontos
        const inicio = pontosAtuais.current
        if (movimentoReduzido || inicio.every((ponto, indice) => ponto === destino[indice])) {
            pontosAtuais.current = destino
            definirPontos(destino)
            return
        }

        let quadro = 0
        const iniciadoEm = performance.now()
        const duracao = 180
        function animar(agora: number) {
            const progresso = Math.min(1, (agora - iniciadoEm) / duracao)
            const suavizado = 1 - (1 - progresso) ** 3
            const atuais = inicio.map((ponto, indice) => ponto + (destino[indice] - ponto) * suavizado)
            pontosAtuais.current = atuais
            definirPontos(atuais)
            if (progresso < 1) quadro = requestAnimationFrame(animar)
        }
        quadro = requestAnimationFrame(animar)
        return () => cancelAnimationFrame(quadro)
    }, [assinatura, movimentoReduzido])

    const aparencia = aparenciaTom(resultado.serie.length === 0 ? null : tom)
    return (
        <div class={`onda-utilizacao ${aparencia.className}`} style={aparencia.style} aria-hidden="true">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false">
                <path d={gerarCaminhoSvg(pontos)} />
            </svg>
        </div>
    )
}
