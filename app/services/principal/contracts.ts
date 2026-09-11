export interface PrincipalCapabilities {
    canFindMemories: boolean
    canReviewDay: boolean
    canReminisce: boolean
    canAdminister: boolean
}

export interface PrincipalCapabilitiesService {
    read(request: Request): Promise<PrincipalCapabilities>
}
