/** A grafia apresentada permanece com o chamador; esta forma serve somente à comparação. */
export function normalizarPesquisa(texto: string): string {
    return texto.trim().normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR")
}

/** Distância de edição limitada a erros pequenos; não deve substituir a busca textual simples. */
export function correspondeAproximadamente(consulta: string, candidato: string): boolean {
    const origem = Array.from(normalizarPesquisa(consulta))
    const destino = Array.from(normalizarPesquisa(candidato))
    if (origem.length < 3 || destino.length < 3) return false
    const limite = Math.min(2, Math.floor(Math.max(origem.length, destino.length) / 4))
    if (Math.abs(origem.length - destino.length) > limite) return false
    let anterior = destino.map((_, indice) => indice + 1)
    anterior.unshift(0)
    for (let linha = 1; linha <= origem.length; linha++) {
        const atual = [linha]
        for (let coluna = 1; coluna <= destino.length; coluna++) {
            atual[coluna] = Math.min(
                atual[coluna - 1] + 1,
                anterior[coluna] + 1,
                anterior[coluna - 1] + (origem[linha - 1] === destino[coluna - 1] ? 0 : 1)
            )
        }
        anterior = atual
    }
    return anterior[destino.length] <= limite
}
