export type GuidanceContext = "captureSelection"
export type GuidanceLevel = "beginner" | "intermediate" | "advanced"

// Temporary user-level mock; change here for operator validation.
const mockLevel: GuidanceLevel = "beginner"
const messages: Record<GuidanceContext, Record<GuidanceLevel, string | null>> = {
    captureSelection: {
        beginner: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
        intermediate: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
        advanced: null
    }
}

/** CMP-005: resolves the user's level outside the page. */
export function guidance(context: GuidanceContext): string | null {
    return messages[context][mockLevel]
}
