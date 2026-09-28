export type ContextoOrientacao =
    | "captureSelection"
    | "inicioCaptura"
    | "revisao"
    | "categorizacao"
    | "inclusaoMemoria"
    | "tom"
    | "balancoSentimental"
export type NivelOrientacao = "beginner" | "intermediate" | "advanced"

// Nível simulado temporariamente; alterar aqui para validação do operador.
const nivelSimulado: NivelOrientacao = "beginner"
const mensagens: Record<ContextoOrientacao, Record<NivelOrientacao, string | null>> = {
    inclusaoMemoria: {
        beginner: "Enter cria uma nova linha. Shift+Enter inclui a memória. Ctrl+Enter inclui e permite registrar outra. Esc cancela.",
        intermediate: null,
        advanced: null
    },
    categorizacao: {
        beginner: "Escolha uma categoria que represente esta memória. Se ela ainda não existir, basta escrever o nome.",
        intermediate: "Escolha a categoria que melhor representa o contexto desta memória.",
        advanced: "Categorias consistentes tornam mais perceptíveis os temas que atravessam suas memórias."
    },
    tom: {
        beginner: null,
        intermediate:
            "O Tom registra a impressão geral que esta memória deixa em você. Ative-o para indicar essa percepção entre negativo, neutro e positivo.",
        advanced: "Use o Tom para registrar a impressão geral que esta memória deixa em você."
    },
    balancoSentimental: {
        beginner: null,
        intermediate:
            "O balanço sentimental é uma extensão opcional da memória para registrar, em palavras, os sentimentos que ela despertou em você, positivos e negativos.",
        advanced: "Use o balanço sentimental para registrar os sentimentos que esta memória despertou em você."
    },
    captureSelection: {
        beginner: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar.",
        intermediate: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.",
        advanced: null
    },
    inicioCaptura: {
        beginner: "Comece pelo que vier à memória. Pode ser uma frase curta, um detalhe ou algo que aconteceu hoje.",
        intermediate: "Registre uma lembrança por vez. Memórias mais focadas ajudam a reencontrar melhor cada contexto depois.",
        advanced: "Observe detalhes que normalmente passariam despercebidos: uma conversa, uma sensação, uma pequena mudança."
    },
    revisao: {
        beginner:
            "Revise suas memórias antes de preservar. Confira o texto, as categorias e os demais detalhes. Se precisar, você ainda pode ajustar qualquer memória.",
        intermediate: "Confira se esta composição representa bem o seu dia. Você ainda pode ajustar qualquer memória antes de preservar.",
        advanced: "Revise se esta composição representa bem o que você quer preservar deste dia."
    }
}

/** CMP-005: resolve o nível do usuário fora da página. */
export function nivelDaExperiencia(diasPreservadosDistintos: number, diaAtualPreservado = false): NivelOrientacao {
    const quantidade = Number.isFinite(diasPreservadosDistintos) ? Math.max(0, Math.trunc(diasPreservadosDistintos)) : 0
    const anteriores = Math.max(0, quantidade - Number(diaAtualPreservado))
    if (anteriores < 2) return "beginner"
    if (anteriores < 4) return "intermediate"
    return "advanced"
}

export function orientar(contexto: ContextoOrientacao, nivel = nivelSimulado): string | null {
    return mensagens[contexto][nivel]
}
