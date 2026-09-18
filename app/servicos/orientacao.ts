export type ContextoOrientacao = "captureSelection" | "inicioCaptura"
export type NivelOrientacao = "beginner" | "intermediate" | "advanced"

// Nível simulado temporariamente; alterar aqui para validação do operador.
const nivelSimulado: NivelOrientacao = "beginner"
const mensagens: Record<ContextoOrientacao, Record<NivelOrientacao, string | null>> = {
    captureSelection: {
        beginner: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
        intermediate: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
        advanced: null
    },
    inicioCaptura: {
        beginner: "Comece pelo que vier à memória. Pode ser uma frase curta, um detalhe ou algo que aconteceu hoje.",
        intermediate: "Registre uma lembrança por vez. Memórias mais focadas ajudam a reencontrar melhor cada contexto depois.",
        advanced: "Observe detalhes que normalmente passariam despercebidos: uma conversa, uma sensação, uma pequena mudança."
    }
}

/** CMP-005: resolve o nível do usuário fora da página. */
export function orientar(contexto: ContextoOrientacao): string | null {
    return mensagens[contexto][nivelSimulado]
}
