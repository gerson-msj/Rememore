import type { EstadoJanelaTemporal } from "./janelaTemporal.ts"
import { chaveJornadaRememorar, lerJornadaRememorar, serializarJornadaRememorar } from "./jornadaRememorar.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}

const dias = ["2025-01-01", "2025-01-06", "2025-01-08", "2025-01-27"]
const estado: EstadoJanelaTemporal = {
    posicoes: { esquerda: 0.25, direita: 0.75 },
    intervaloValido: {
        primeiraPosicao: 1,
        ultimaPosicao: 2,
        primeiroDia: dias[1],
        ultimoDia: dias[2],
        quantidadeDias: 2
    }
}

Deno.test("Jornada de Rememorar: chave é isolada por conta", () => {
    igual(chaveJornadaRememorar("conta / um"), "rememore:rememorar:jornada:v1:conta%20%2F%20um")
})

Deno.test("Jornada de Rememorar: recarga restaura detalhe e janelas validadas", () => {
    const jornada = {
        tela: "detalhe" as const,
        categoria: "familia",
        estadoPanorama: estado,
        estadoDetalhe: { ...estado, intervaloDeslocado: true }
    }
    const restaurada = lerJornadaRememorar(
        "conta-a",
        dias,
        serializarJornadaRememorar("conta-a", jornada)
    )
    igual(restaurada, jornada)
})

Deno.test("Jornada de Rememorar: rejeita conta, categoria, versão e intervalo inválidos", () => {
    const salvo = serializarJornadaRememorar("conta-a", {
        tela: "detalhe",
        categoria: "familia",
        estadoPanorama: estado,
        estadoDetalhe: estado
    })
    const objeto = JSON.parse(salvo)
    igual(lerJornadaRememorar("conta-b", dias, salvo), null)
    igual(lerJornadaRememorar("conta-a", dias, JSON.stringify({ ...objeto, categoria: null })), null)
    igual(lerJornadaRememorar("conta-a", dias, JSON.stringify({ ...objeto, versao: 2 })), null)
    igual(
        lerJornadaRememorar(
            "conta-a",
            dias,
            JSON.stringify({
                ...objeto,
                estadoDetalhe: { ...estado, intervaloValido: { ...estado.intervaloValido, primeiroDia: "2020-01-01" } }
            })
        ),
        null
    )
})

Deno.test("Jornada de Rememorar: estado do Panorama pode ser reconstruído sem categoria", () => {
    const jornada = { tela: "panorama" as const, categoria: null, estadoPanorama: estado, estadoDetalhe: null }
    igual(
        lerJornadaRememorar("conta-a", dias, serializarJornadaRememorar("conta-a", jornada)),
        jornada
    )
})
