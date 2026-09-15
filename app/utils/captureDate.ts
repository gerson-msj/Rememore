export function today(date = new Date()): string {
    return `${date.getFullYear().toString().padStart(4, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${
        date.getDate().toString().padStart(2, "0")
    }`
}

export function isCaptureDate(value: string, current = today()): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value < "0001-01-01" || value > current) return false
    const [year, month, day] = value.split("-").map(Number)
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]
}

export function formatCaptureDate(value: string): string {
    return value.split("-").reverse().join("/")
}

/** Format a civil date without letting the browser timezone move it to another calendar day. */
export function formatCaptureDateLong(value: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC"
    }).format(new Date(`${value}T12:00:00Z`))
}
