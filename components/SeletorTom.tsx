interface PropriedadesSeletorTom {
    id: string
    valor: number
    desabilitado?: boolean
    aoAlterar: (valor: number) => void
    aoConcluir?: () => void
}

export default function SeletorTom({ id, valor, desabilitado = false, aoAlterar, aoConcluir }: PropriedadesSeletorTom) {
    const intensidade = Math.abs(valor)
    const larguraRevelada = `${intensidade / 2}%`
    const estilo = {
        "--seletor-tom-largura": larguraRevelada,
        "--seletor-tom-inicio": valor < 0 ? `calc(50% - ${larguraRevelada})` : "50%",
        "--seletor-tom-extremo": `var(--tom-${valor < 0 ? "negativo" : "positivo"})`,
        "--seletor-tom-intensidade": `${intensidade}%`,
        "--seletor-tom-alca": valor === 0
            ? "var(--bulma-text-strong)"
            : `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`,
        "--seletor-tom-cor-inicial": valor < 0
            ? `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`
            : "var(--bulma-text-weak)",
        "--seletor-tom-cor-final": valor < 0
            ? "var(--bulma-text-weak)"
            : `color-mix(in oklab, var(--seletor-tom-extremo) ${intensidade}%, var(--bulma-text-weak))`
    }
    const descricao = valor === 0 ? "Neutro" : valor < 0 ? "Negativo" : "Positivo"

    return (
        <div class="seletor-tom" style={estilo}>
            <div class="seletor-tom-trilha" aria-hidden="true">
                <span class="seletor-tom-revelado" />
                <span class="seletor-tom-centro" />
            </div>
            <label class="is-sr-only" for={id}>Tom: Negativo, Neutro ou Positivo</label>
            <input
                id={id}
                class="seletor-tom-controle"
                type="range"
                min={-100}
                max={100}
                step={1}
                value={valor}
                disabled={desabilitado}
                aria-valuetext={desabilitado ? "Sem Tom" : descricao}
                onInput={(evento) => aoAlterar(Number(evento.currentTarget.value))}
                onPointerUp={() => aoConcluir?.()}
                onPointerCancel={() => aoConcluir?.()}
                onKeyUp={(evento) => {
                    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"].includes(evento.key)) {
                        aoConcluir?.()
                    }
                }}
                onBlur={() => aoConcluir?.()}
            />
            <div class="seletor-tom-referencias" aria-hidden="true">
                <span>Negativo</span>
                <span>Neutro</span>
                <span>Positivo</span>
            </div>
        </div>
    )
}
