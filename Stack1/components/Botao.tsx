import type { ComponentChildren } from "preact"

export interface PropriedadesBotao {
    id?: string
    onClick?: () => void
    children?: ComponentChildren
    disabled?: boolean
}

export function Botao(propriedades: PropriedadesBotao) {
    return (
        <button
            {...propriedades}
            class="px-2 py-1 border-gray-500 border-2 rounded-sm bg-white hover:bg-gray-200 transition-colors"
        />
    )
}
