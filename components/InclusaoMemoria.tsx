import { useEffect, useRef } from "preact/hooks"

export default function InclusaoMemoria({ id, texto, ocupado, dica, aoEscrever, aoConfirmar, aoCancelar }: {
    id: string
    texto: string
    ocupado: boolean
    dica: string | null
    aoEscrever: (texto: string) => void
    aoConfirmar: (continuar: boolean) => void
    aoCancelar: () => void
}) {
    const campo = useRef<HTMLTextAreaElement>(null)
    useEffect(() => {
        if (!ocupado) campo.current?.focus({ preventScroll: true })
    }, [id, ocupado])
    return (
        <div class="captura-inclusao" role="group" aria-label="Incluir memória">
            <textarea
                ref={campo}
                class="textarea captura-campo-memoria"
                rows={5}
                aria-label="Texto da nova memória"
                aria-describedby={dica ? "captura-dica-inclusao" : undefined}
                value={texto}
                disabled={ocupado}
                onInput={(evento) => aoEscrever(evento.currentTarget.value)}
                onKeyDown={(evento) => {
                    if (evento.isComposing || ocupado) return
                    if (evento.key === "Escape") {
                        evento.preventDefault()
                        aoCancelar()
                    } else if (evento.key === "Enter" && (evento.ctrlKey || evento.shiftKey)) {
                        evento.preventDefault()
                        if (texto.trim()) aoConfirmar(evento.ctrlKey)
                    }
                }}
            />
            <div class="buttons has-addons captura-acoes-texto mt-3" role="group" aria-label="Ações da inclusão">
                <button
                    type="button"
                    class="button is-primary"
                    title="Incluir memória"
                    aria-label="Incluir memória"
                    disabled={ocupado || !texto.trim()}
                    onClick={() => aoConfirmar(false)}
                >
                    <span class="icon">
                        <i class="fas fa-bookmark" aria-hidden="true" />
                    </span>
                    <span>Incluir memória</span>
                </button>
                <button
                    type="button"
                    class="button"
                    title="Cancelar inclusão"
                    aria-label="Cancelar inclusão"
                    disabled={ocupado}
                    onClick={aoCancelar}
                >
                    <span class="icon">
                        <i class="fas fa-xmark" aria-hidden="true" />
                    </span>
                    <span>Cancelar inclusão</span>
                </button>
            </div>
            {dica && <p id="captura-dica-inclusao" class="is-size-7 mt-2">{dica}</p>}
        </div>
    )
}
