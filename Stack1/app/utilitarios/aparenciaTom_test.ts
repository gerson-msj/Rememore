import { aparenciaTom } from "./aparenciaTom.ts"

Deno.test("aparência comum aplica a curva 20/50 aos Tons positivos e negativos", () => {
    const positivo = aparenciaTom(20)
    const negativo = aparenciaTom(-20)
    if (positivo.style["--tom-peso"] !== "50%" || positivo.style["--tom-extremo"] !== "var(--tom-positivo)") {
        throw new Error("Tom positivo no limiar deve usar intensidade 50 e família positiva")
    }
    if (negativo.style["--tom-peso"] !== "50%" || negativo.style["--tom-extremo"] !== "var(--tom-negativo)") {
        throw new Error("Tom negativo no limiar deve usar intensidade 50 e família negativa")
    }
})

Deno.test("aparência comum mantém Tom nulo fora da escala", () => {
    const aparencia = aparenciaTom(null)
    if (aparencia.style["--tom-peso"] !== undefined) throw new Error("Tom nulo não deve receber intensidade cromática")
})
