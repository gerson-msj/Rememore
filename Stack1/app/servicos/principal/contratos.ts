export interface CapacidadesPrincipal {
    canFindMemories: boolean
    canReviewDay: boolean
    canReminisce: boolean
    canAdminister: boolean
}

export interface ServicoCapacidadesPrincipal {
    read(requisicao: Request): Promise<CapacidadesPrincipal>
}
