// Política visual comum aos consumidores de Tom; desligar uma região restaura o tema.
export const configuracaoTom = {
    categoria: true,
    borda: true,
    sombra: true,
    fundo: true,
    faixa: false,
    setas: true
}

export function aparenciaTom(tom: number | null) {
    if (tom === null) return { className: "aparencia-tom", style: {} }
    const valor = Math.max(-100, Math.min(100, tom))
    return {
        className: "aparencia-tom tom-informado " + Object.entries(configuracaoTom)
            .filter(([, ativa]) => ativa).map(([regiao]) => `tom-${regiao}`).join(" "),
        style: {
            "--tom-extremo": `var(--tom-${valor < 0 ? "negativo" : "positivo"})`,
            "--tom-peso": `${Math.abs(valor)}%`
        }
    }
}
