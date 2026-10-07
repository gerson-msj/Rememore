export function transformarTomVisual(tom: number | null, limiar = 20, intensidadeNoLimiar = 50): number | null {
    if (tom === null) return null
    const magnitude = Math.max(0, Math.min(100, Math.abs(tom)))
    const limiarAjustado = Math.max(1, Math.min(99, limiar))
    const intensidadeAjustada = Math.max(0, Math.min(100, intensidadeNoLimiar))
    const intensidade = magnitude <= limiarAjustado
        ? magnitude / limiarAjustado * intensidadeAjustada
        : intensidadeAjustada + (magnitude - limiarAjustado) / (100 - limiarAjustado) * (100 - intensidadeAjustada)
    return tom < 0 ? -intensidade : tom > 0 ? intensidade : 0
}
