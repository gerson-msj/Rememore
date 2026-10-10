import { type EstadoJanelaTemporal, restaurarEstadoJanela } from "./janelaTemporal.ts"

export interface JornadaRememorar {
    tela: "panorama" | "detalhe"
    categoria: string | null
    estadoPanorama: EstadoJanelaTemporal | null
    estadoDetalhe: EstadoJanelaTemporal | null
}

interface JornadaRememorarPersistida extends JornadaRememorar {
    versao: 1
    conta: string
}

export function chaveJornadaRememorar(idConta: string): string {
    return `rememore:rememorar:jornada:v1:${encodeURIComponent(idConta)}`
}

export function lerJornadaRememorar(idConta: string, dias: readonly string[], valor: string | null): JornadaRememorar | null {
    if (!valor) return null
    let persistida: Partial<JornadaRememorarPersistida>
    try {
        persistida = JSON.parse(valor)
    } catch {
        return null
    }
    if (
        persistida.versao !== 1 || persistida.conta !== idConta ||
        (persistida.tela !== "panorama" && persistida.tela !== "detalhe") ||
        (persistida.tela === "detalhe" && (typeof persistida.categoria !== "string" || !persistida.categoria)) ||
        (persistida.tela === "panorama" && persistida.categoria !== null)
    ) return null

    const restaurar = (estado: unknown): EstadoJanelaTemporal | null | undefined => {
        if (estado === null) return null
        return restaurarEstadoJanela(estado, dias) ?? undefined
    }
    const estadoPanorama = restaurar(persistida.estadoPanorama)
    const estadoDetalhe = restaurar(persistida.estadoDetalhe)
    if (
        estadoPanorama === undefined || estadoDetalhe === undefined ||
        (persistida.tela === "detalhe" && (!estadoPanorama || !estadoDetalhe))
    ) return null
    return {
        tela: persistida.tela,
        categoria: persistida.categoria ?? null,
        estadoPanorama,
        estadoDetalhe
    }
}

export function serializarJornadaRememorar(idConta: string, jornada: JornadaRememorar): string {
    const persistida: JornadaRememorarPersistida = { versao: 1, conta: idConta, ...jornada }
    return JSON.stringify(persistida)
}
