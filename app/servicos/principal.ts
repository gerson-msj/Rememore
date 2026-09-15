import type { ServicoCapacidadesPrincipal } from "./principal/contratos.ts"
import { servicoCapacidadesPrincipalSimulado } from "./principal/simulado.ts"

// Ponto de composição substituível pela futura implementação do backend.
export const capacidadesPrincipal: ServicoCapacidadesPrincipal = servicoCapacidadesPrincipalSimulado
