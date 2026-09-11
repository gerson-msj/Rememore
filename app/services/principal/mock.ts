import type { PrincipalCapabilities, PrincipalCapabilitiesService } from "./contracts.ts"

// Cenário de validação atual: usuário administrador com condições suficientes para Rememorar.
export const mockPrincipalCapabilities: PrincipalCapabilities = {
    canFindMemories: true,
    canReviewDay: true,
    canReminisce: true,
    canAdminister: true
}

export const mockPrincipalCapabilitiesService: PrincipalCapabilitiesService = {
    read() {
        return Promise.resolve(mockPrincipalCapabilities)
    }
}
