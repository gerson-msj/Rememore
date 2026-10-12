export interface ExperienciaUsuario {
    /** Número de datas civis distintas com preservação confirmada para a conta. */
    diasPreservadosDistintos: number
}

export interface ServicoExperienciaUsuario {
    read(requisicao: Request): Promise<ExperienciaUsuario>
}
