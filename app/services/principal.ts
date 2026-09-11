import type { PrincipalCapabilitiesService } from "./principal/contracts.ts"
import { mockPrincipalCapabilitiesService } from "./principal/mock.ts"

// Ponto de composição substituível pela futura implementação do backend.
export const principalCapabilities: PrincipalCapabilitiesService = mockPrincipalCapabilitiesService
