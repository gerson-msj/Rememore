import type { Signal } from "@preact/signals"
import { Botao } from "../components/Botao.tsx"

interface PropriedadesContador {
    contagem: Signal<number>
}

export default function Contador(propriedades: PropriedadesContador) {
    return (
        <div class="flex gap-8 py-6">
            <Botao id="decrement" onClick={() => propriedades.contagem.value -= 1}>-1</Botao>
            <p class="text-3xl tabular-nums">{propriedades.contagem}</p>
            <Botao id="increment" onClick={() => propriedades.contagem.value += 1}>+1</Botao>
        </div>
    )
}
