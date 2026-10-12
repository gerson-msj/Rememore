import { useEffect, useRef, useState } from "preact/hooks"
import { transformarTomVisual } from "../app/utilitarios/curvaTom.ts"
import { calcularVariacaoTomCategoria } from "../app/utilitarios/variacaoTomCategoria.ts"

export interface VariacaoTomCategoriaProps {
    tons: readonly (number | null)[]
}

export default function VariacaoTomCategoria({ tons }: VariacaoTomCategoriaProps) {
    const resultado = calcularVariacaoTomCategoria(tons)
    const assinatura = `${resultado.mediaNegativa}:${resultado.mediaPositiva}:${resultado.possuiTomDefinido}`
    const inicial = useRef(assinatura)
    const [animar, definirAnimar] = useState(false)

    useEffect(() => {
        if (inicial.current !== assinatura) definirAnimar(true)
        inicial.current = assinatura
    }, [assinatura])

    const pesoNegativo = Math.abs(transformarTomVisual(resultado.mediaNegativa) ?? 0)
    const pesoPositivo = Math.abs(transformarTomVisual(resultado.mediaPositiva) ?? 0)
    const descricao = resultado.possuiTomDefinido
        ? `Variação do Tom no período selecionado. Negativo: ${
            resultado.mediaNegativa === null ? "sem extensão" : resultado.mediaNegativa.toFixed(1)
        }. Neutro: centro. Positivo: ${resultado.mediaPositiva === null ? "sem extensão" : resultado.mediaPositiva.toFixed(1)}.`
        : "Variação do Tom no período selecionado, sem Tons definidos. Negativo à esquerda, neutro ao centro e positivo à direita."

    return (
        <div
            class={`variacao-tom-categoria${resultado.possuiTomDefinido ? " variacao-tom-definida" : " variacao-tom-ausente"}${
                animar ? " variacao-tom-animada" : ""
            }`}
            style={{
                "--variacao-tom-largura-negativa": `${resultado.extensaoNegativa}%`,
                "--variacao-tom-largura-positiva": `${resultado.extensaoPositiva}%`,
                "--variacao-tom-cor-negativa": `color-mix(in oklab, var(--tom-negativo) ${pesoNegativo}%, var(--bulma-text-weak))`,
                "--variacao-tom-cor-positiva": `color-mix(in oklab, var(--tom-positivo) ${pesoPositivo}%, var(--bulma-text-weak))`
            }}
            role="img"
            aria-label={descricao}
        >
            <span class="variacao-tom-identificacao" aria-hidden="true">Variação do Tom</span>
            <span class="variacao-tom-trilha" aria-hidden="true">
                <span class="variacao-tom-lado variacao-tom-lado-negativo" />
                <span class="variacao-tom-lado variacao-tom-lado-positivo" />
                <span class="variacao-tom-centro" />
            </span>
        </div>
    )
}
