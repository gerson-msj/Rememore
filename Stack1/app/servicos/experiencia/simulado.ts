import type { ExperienciaUsuario, ServicoExperienciaUsuario } from "./contratos.ts"

// Cenário com dois dias já preservados para expor o nível intermediário na próxima data.
export const experienciaUsuarioSimulada: ExperienciaUsuario = { diasPreservadosDistintos: 2 }

export const servicoExperienciaUsuarioSimulado: ServicoExperienciaUsuario = {
    read() {
        return Promise.resolve(experienciaUsuarioSimulada)
    }
}
