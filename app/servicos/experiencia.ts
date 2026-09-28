import type { ServicoExperienciaUsuario } from "./experiencia/contratos.ts"
import { servicoExperienciaUsuarioSimulado } from "./experiencia/simulado.ts"

// Fronteira substituível pela leitura real da experiência persistida da conta.
export const experienciaUsuario: ServicoExperienciaUsuario = servicoExperienciaUsuarioSimulado
