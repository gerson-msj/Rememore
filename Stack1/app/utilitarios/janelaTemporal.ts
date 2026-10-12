export interface PosicoesJanela {
    esquerda: number
    direita: number
}

export interface EstadoJanelaTemporal {
    posicoes: PosicoesJanela
    intervaloValido: IntervaloJanela
    intervaloDeslocado?: boolean
}

export interface IntervaloJanela {
    primeiraPosicao: number
    ultimaPosicao: number
    primeiroDia: string
    ultimoDia: string
    quantidadeDias: number
}

export interface AvaliacaoJanela {
    posicaoEsquerda: number
    posicaoDireita: number
    intervaloAtual: IntervaloJanela | null
    intervaloPublicado: IntervaloJanela | null
    valido: boolean
}

export function limitarPosicaoContinua(posicao: number): number {
    if (!Number.isFinite(posicao)) return 0
    return Math.min(1, Math.max(0, posicao))
}

export function restaurarPosicoesJanela(valor: unknown): PosicoesJanela | null {
    if (typeof valor !== "object" || valor === null) return null
    const posicoes = valor as Partial<PosicoesJanela>
    if (
        typeof posicoes.esquerda !== "number" || !Number.isFinite(posicoes.esquerda) ||
        typeof posicoes.direita !== "number" || !Number.isFinite(posicoes.direita) ||
        posicoes.esquerda < 0 || posicoes.direita > 1 || posicoes.esquerda > posicoes.direita
    ) return null
    return { esquerda: posicoes.esquerda, direita: posicoes.direita }
}

export function restaurarEstadoJanela(valor: unknown, dias: readonly string[]): EstadoJanelaTemporal | null {
    if (typeof valor !== "object" || valor === null) return null
    const estado = valor as Partial<EstadoJanelaTemporal>
    if (estado.intervaloDeslocado !== undefined && typeof estado.intervaloDeslocado !== "boolean") return null
    const posicoes = restaurarPosicoesJanela(estado.posicoes)
    const intervaloArmazenado = estado.intervaloValido
    if (!posicoes || typeof intervaloArmazenado !== "object" || intervaloArmazenado === null) return null
    const intervalo = criarIntervaloJanela(
        dias,
        intervaloArmazenado.primeiraPosicao,
        intervaloArmazenado.ultimaPosicao
    )
    if (
        !intervalo ||
        intervalo.primeiraPosicao !== intervaloArmazenado.primeiraPosicao ||
        intervalo.ultimaPosicao !== intervaloArmazenado.ultimaPosicao ||
        intervalo.primeiroDia !== intervaloArmazenado.primeiroDia ||
        intervalo.ultimoDia !== intervaloArmazenado.ultimoDia ||
        intervalo.quantidadeDias !== intervaloArmazenado.quantidadeDias
    ) return null
    const intervaloFisico = avaliarPosicoesJanela(dias, posicoes, null).intervaloAtual
    if (
        estado.intervaloDeslocado !== true &&
        intervaloFisico && (
            intervaloFisico.primeiraPosicao !== intervalo.primeiraPosicao ||
            intervaloFisico.ultimaPosicao !== intervalo.ultimaPosicao
        )
    ) return null
    return {
        posicoes,
        intervaloValido: intervalo,
        ...(estado.intervaloDeslocado === true ? { intervaloDeslocado: true } : {})
    }
}

export function posicaoDiscreta(posicao: number, quantidade: number): number {
    if (quantidade <= 1) return 0
    return Math.round(limitarPosicaoContinua(posicao) * (quantidade - 1))
}

export function posicaoDivisoria(indiceAnterior: number, quantidade: number): number | null {
    if (!Number.isInteger(indiceAnterior) || quantidade < 2 || indiceAnterior < 0 || indiceAnterior >= quantidade - 1) return null
    return (indiceAnterior + 0.5) / (quantidade - 1)
}

export function limitarPosicaoAlca(posicao: number, outraAlca: number, lado: "esquerda" | "direita"): number {
    const limitada = limitarPosicaoContinua(posicao)
    const outra = limitarPosicaoContinua(outraAlca)
    return lado === "esquerda" ? Math.min(limitada, outra) : Math.max(limitada, outra)
}

export function moverAlcaSemCruzamento(
    posicoes: PosicoesJanela,
    lado: "esquerda" | "direita",
    posicao: number
): PosicoesJanela {
    const novaPosicao = limitarPosicaoContinua(posicao)
    return lado === "esquerda"
        ? { esquerda: Math.min(novaPosicao, posicoes.direita), direita: posicoes.direita }
        : { esquerda: posicoes.esquerda, direita: Math.max(novaPosicao, posicoes.esquerda) }
}

export function criarIntervaloJanela(dias: readonly string[], primeiraPosicao: number, ultimaPosicao: number): IntervaloJanela | null {
    if (dias.length < 2 || !Number.isFinite(primeiraPosicao) || !Number.isFinite(ultimaPosicao)) return null
    const primeira = Math.min(dias.length - 1, Math.max(0, Math.round(primeiraPosicao)))
    const ultima = Math.min(dias.length - 1, Math.max(0, Math.round(ultimaPosicao)))
    if (ultima - primeira < 1) return null
    return {
        primeiraPosicao: primeira,
        ultimaPosicao: ultima,
        primeiroDia: dias[primeira],
        ultimoDia: dias[ultima],
        quantidadeDias: ultima - primeira + 1
    }
}

export function avaliarPosicoesJanela(
    dias: readonly string[],
    posicoes: PosicoesJanela,
    ultimoIntervaloValido: IntervaloJanela | null
): AvaliacaoJanela {
    const esquerda = limitarPosicaoContinua(posicoes.esquerda)
    const direita = limitarPosicaoContinua(posicoes.direita)
    const intervaloAtual = esquerda <= direita
        ? criarIntervaloJanela(dias, posicaoDiscreta(esquerda, dias.length), posicaoDiscreta(direita, dias.length))
        : null
    return {
        posicaoEsquerda: posicaoDiscreta(esquerda, dias.length),
        posicaoDireita: posicaoDiscreta(direita, dias.length),
        intervaloAtual,
        intervaloPublicado: intervaloAtual ?? ultimoIntervaloValido,
        valido: intervaloAtual !== null
    }
}

export function deslocarIntervaloJanela(
    dias: readonly string[],
    intervalo: IntervaloJanela,
    deslocamento: number
): IntervaloJanela | null {
    const quantidadeDiasDisponiveis = dias.length
    if (quantidadeDiasDisponiveis < 2) return null
    const quantidade = intervalo.quantidadeDias
    if (quantidade < 2 || quantidade > quantidadeDiasDisponiveis) return null
    const inicioDesejado = intervalo.primeiraPosicao + Math.round(deslocamento)
    const primeiro = Math.min(quantidadeDiasDisponiveis - quantidade, Math.max(0, inicioDesejado))
    const ultima = primeiro + quantidade - 1
    return {
        primeiraPosicao: primeiro,
        ultimaPosicao: ultima,
        primeiroDia: dias[primeiro],
        ultimoDia: dias[ultima],
        quantidadeDias: quantidade
    }
}

export function moverJanelaPorFaixa(
    dias: readonly string[],
    estado: EstadoJanelaTemporal,
    deslocamento: number
): EstadoJanelaTemporal {
    const total = dias.length - 1
    if (total < 1) return estado

    const deslocamentoMinimo = -estado.posicoes.esquerda
    const deslocamentoMaximo = 1 - estado.posicoes.direita
    const aplicado = Math.min(deslocamentoMaximo, Math.max(deslocamentoMinimo, deslocamento))
    const posicoes = {
        esquerda: estado.posicoes.esquerda + aplicado,
        direita: estado.posicoes.direita + aplicado
    }
    const avaliacao = avaliarPosicoesJanela(dias, posicoes, estado.intervaloValido)
    const intervaloValido = avaliacao.intervaloAtual ?? estado.intervaloValido
    return { posicoes, intervaloValido, intervaloDeslocado: true }
}
