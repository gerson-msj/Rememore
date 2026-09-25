import type { ComponentChildren } from "preact"
import { useEffect, useId, useRef } from "preact/hooks"

export default function PesquisaCategoriaPopup({ aberto, aoFechar, children }: {
    aberto: boolean
    aoFechar: () => void
    children: ComponentChildren
}) {
    const dialogo = useRef<HTMLDialogElement>(null)
    const titulo = useId()
    useEffect(() => {
        const elemento = dialogo.current!
        if (aberto) {
            if (!elemento.open) elemento.showModal()
            elemento.querySelector<HTMLInputElement>('input[type="search"]')?.focus()
        } else if (elemento.open) elemento.close()
    }, [aberto])
    return (
        <dialog
            ref={dialogo}
            class="pesquisa-categoria-popup"
            aria-labelledby={titulo}
            onCancel={(evento) => {
                evento.preventDefault()
                aoFechar()
            }}
            onClick={(evento) => {
                if (evento.target !== evento.currentTarget) return
                const caixa = evento.currentTarget.getBoundingClientRect()
                if (
                    evento.clientX < caixa.left || evento.clientX > caixa.right || evento.clientY < caixa.top ||
                    evento.clientY > caixa.bottom
                ) aoFechar()
            }}
        >
            <div class="pesquisa-categoria-cabecalho">
                <h2 id={titulo} class="title is-5 mb-0">Pesquisar categoria</h2>
                <button type="button" class="delete" aria-label="Fechar pesquisa de categoria" title="Fechar pesquisa" onClick={aoFechar} />
            </div>
            {aberto && children}
        </dialog>
    )
}
