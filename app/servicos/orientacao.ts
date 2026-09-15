export type ContextoOrientacao = "captureSelection"
export type NivelOrientacao = "beginner" | "intermediate" | "advanced"

// Nível simulado temporariamente; alterar aqui para validação do operador.
const nivelSimulado: NivelOrientacao = "beginner"
const mensagens: Record<ContextoOrientacao, Record<NivelOrientacao, string | null>> = {
    captureSelection: {
        beginner: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
        intermediate: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
        advanced: null
    }
}

/** CMP-005: resolve o nível do usuário fora da página. */
export function orientar(contexto: ContextoOrientacao): string | null {
    return mensagens[contexto][nivelSimulado]
}
