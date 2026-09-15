import type { CapacidadesPrincipal, ServicoCapacidadesPrincipal } from "./contratos.ts"

// Cenário de validação atual: usuário administrador com condições suficientes para Rememorar.
export const capacidadesPrincipalSimuladas: CapacidadesPrincipal = {
    canFindMemories: true,
    canReviewDay: true,
    canReminisce: true,
    canAdminister: true
}

export const servicoCapacidadesPrincipalSimulado: ServicoCapacidadesPrincipal = {
    read() {
        return Promise.resolve(capacidadesPrincipalSimuladas)
    }
}
