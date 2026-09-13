import { useEffect, useRef, useState } from "preact/hooks"
import { isCaptureDate } from "../app/utils/captureDate.ts"

/** CMP-003: the native field remains usable when showPicker is unavailable. */
export default function DateSelector({ value, max, onChange }: { value: string; max: string; onChange: (value: string) => void }) {
    const input = useRef<HTMLInputElement>(null)
    const [customPicker, setCustomPicker] = useState(false)
    useEffect(() => {
        setCustomPicker(typeof input.current?.showPicker === "function")
    }, [])
    function openPicker() {
        try {
            if (input.current?.showPicker) input.current.showPicker()
            else input.current?.focus()
        } catch {
            setCustomPicker(false)
            input.current?.focus()
        }
    }
    return (
        <div class="field">
            <label class="label" for="capture-date">Data</label>
            <div class={`capture-date-control${customPicker ? " has-custom-picker" : ""}`}>
                <input
                    ref={input}
                    id="capture-date"
                    class={`input${isCaptureDate(value, max) ? "" : " is-placeholder"}`}
                    type="date"
                    lang="pt-BR"
                    required
                    min="0001-01-01"
                    max={max}
                    value={value}
                    onInput={(event) => onChange(event.currentTarget.value)}
                />
                {customPicker && (
                    <button type="button" class="capture-date-picker" aria-label="Abrir calendário" onClick={openPicker}>
                        <i class="fas fa-calendar" aria-hidden="true" />
                    </button>
                )}
            </div>
        </div>
    )
}
