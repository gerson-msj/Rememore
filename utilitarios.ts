import { createDefine } from "fresh"

// Estado compartilhado pelos intermediários de requisição, estruturas de página e rotas.
export interface Estado {
    compartilhado: string
}

export const definir = createDefine<Estado>()
