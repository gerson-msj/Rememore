export function normalizeUsername(value: string): string {
    return value.trim().toLowerCase()
}

export function hasLoginContent(username: string, password: string): boolean {
    return normalizeUsername(username).length > 0 && password.trim().length > 0
}
