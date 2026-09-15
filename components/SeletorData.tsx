import { useEffect, useRef, useState } from "preact/hooks"
import { ehDataCaptura } from "../app/utilitarios/dataCaptura.ts"

/** CMP-003: o campo nativo continua utilizável quando showPicker não está disponível. */
export default function SeletorData(
    { value: valor, max: maximo, onChange: aoAlterar }: { value: string; max: string; onChange: (valor: string) => void }
) {
    const entrada = useRef<HTMLInputElement>(null)
    const [calendarioPersonalizado, definirCalendarioPersonalizado] = useState(false)
    useEffect(() => {
        definirCalendarioPersonalizado(typeof entrada.current?.showPicker === "function")
    }, [])
    function abrirCalendario() {
        try {
            if (entrada.current?.showPicker) entrada.current.showPicker()
            else entrada.current?.focus()
        } catch {
            definirCalendarioPersonalizado(false)
            entrada.current?.focus()
        }
    }
    return (
        <div class="field">
            <label class="label" for="capture-date">Data</label>
            <div class={`captura-controle-data${calendarioPersonalizado ? " com-calendario-personalizado" : ""}`}>
                <input
                    ref={entrada}
                    id="capture-date"
                    class={`input${ehDataCaptura(valor, maximo) ? "" : " com-texto-provisorio"}`}
                    type="date"
                    lang="pt-BR"
                    required
                    min="0001-01-01"
                    max={maximo}
                    value={valor}
                    onInput={(evento) => aoAlterar(evento.currentTarget.value)}
                />
                {calendarioPersonalizado && (
                    <button type="button" class="captura-calendario" aria-label="Abrir calendário" onClick={abrirCalendario}>
                        <i class="fas fa-calendar" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    )
}
