export function normalizarNomeUsuario(valor: string): string {
    return valor.trim().toLowerCase()
}

export function temConteudoEntrada(nomeUsuario: string, senha: string): boolean {
    return normalizarNomeUsuario(nomeUsuario).length > 0 && senha.trim().length > 0
}
