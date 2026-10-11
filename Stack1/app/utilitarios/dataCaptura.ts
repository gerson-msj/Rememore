export function hoje(dataCaptura = new Date()): string {
    return `${dataCaptura.getFullYear().toString().padStart(4, "0")}-${(dataCaptura.getMonth() + 1).toString().padStart(2, "0")}-${
        dataCaptura.getDate().toString().padStart(2, "0")
    }`
}

export function ehDataCaptura(valor: string, atual = hoje()): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor < "0001-01-01" || valor > atual) return false
    const [ano, mes, dia] = valor.split("-").map(Number)
    const bissexto = ano % 4 === 0 && (ano % 100 !== 0 || ano % 400 === 0)
    const dias = [31, bissexto ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return mes >= 1 && mes <= 12 && dia >= 1 && dia <= dias[mes - 1]
}

export function formatarDataCaptura(valor: string): string {
    return valor.split("-").reverse().join("/")
}

/** Preserva a data civil sem deslocá-la para outro dia pelo fuso do navegador. */
export function formatarDataCapturaPorExtenso(valor: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(`${valor}T12:00:00Z`))
}
