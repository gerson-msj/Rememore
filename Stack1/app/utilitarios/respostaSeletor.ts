export type CurvaRespostaSeletor = "linear" | "ease-in" | "ease-out" | "ease-in-out"

export interface RespostaSeletor {
    atrasoMs: number
    curva: CurvaRespostaSeletor
}

export const RESPOSTA_JANELA_PADRAO: RespostaSeletor = { atrasoMs: 1000, curva: "ease-out" }
export const RESPOSTA_TOM_PADRAO: RespostaSeletor = { atrasoMs: 1000, curva: "ease-out" }

const DISTANCIA_CONCLUSAO = 0.001

export function avancarSeletor(
    atual: number,
    alvo: number,
    velocidadeAnterior: number,
    decorrido: number,
    resposta: RespostaSeletor
): { valor: number; velocidade: number; concluido: boolean } {
    if (resposta.atrasoMs <= 0) return { valor: alvo, velocidade: 0, concluido: true }

    const distancia = alvo - atual
    const distanciaAbsoluta = Math.abs(distancia)
    if (distanciaAbsoluta < DISTANCIA_CONCLUSAO) return { valor: alvo, velocidade: 0, concluido: true }

    if (resposta.curva === "ease-out") {
        // Aproximação exponencial: 99,9% do percurso ocorre em aproximadamente o atraso configurado.
        const progresso = 1 - Math.exp(-6.9 * decorrido / (resposta.atrasoMs / 1000))
        const valor = atual + distancia * progresso
        const concluido = Math.abs(alvo - valor) < DISTANCIA_CONCLUSAO
        return {
            valor: concluido ? alvo : valor,
            velocidade: decorrido > 0 ? (valor - atual) / decorrido : 0,
            concluido
        }
    }

    const velocidadeMaxima = 1 / (resposta.atrasoMs / 1000)
    const aceleracao = velocidadeMaxima / 0.3
    const sentido = Math.sign(distancia)
    let velocidadeDesejada = sentido * velocidadeMaxima
    if (resposta.curva === "ease-in-out") {
        velocidadeDesejada = sentido * Math.min(velocidadeMaxima, Math.sqrt(2 * aceleracao * distanciaAbsoluta))
    }
    const velocidade = resposta.curva === "linear" ? velocidadeDesejada : velocidadeAnterior + Math.min(
        aceleracao * decorrido,
        Math.max(-aceleracao * decorrido, velocidadeDesejada - velocidadeAnterior)
    )
    const deslocamento = velocidade * decorrido
    const proximoValor = Math.abs(deslocamento) >= distanciaAbsoluta ? alvo : atual + deslocamento
    return { valor: proximoValor, velocidade, concluido: proximoValor === alvo }
}
