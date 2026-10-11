import { aparenciaTom } from "../app/utilitarios/aparenciaTom.ts"

interface PropriedadesCategoriaPanorama {
    identificador: string
    nome: string
    representatividade: number
    tom: number | null
    aoSelecionar: (identificador: string) => void
    transformarTom?: (tom: number | null) => number | null
}

export default function CategoriaPanorama({
    identificador,
    nome,
    representatividade,
    tom,
    aoSelecionar,
    transformarTom
}: PropriedadesCategoriaPanorama) {
    const aparencia = aparenciaTom(tom, transformarTom)
    const estilo = {
        ...aparencia.style,
        "--categoria-panorama-representatividade": `${representatividade * 100}%`
    }

    return (
        <button
            class={`categoria-panorama ${aparencia.className}${tom === null ? " categoria-panorama-sem-tom" : " tom-categoria"}`}
            style={estilo}
            type="button"
            onClick={() => aoSelecionar(identificador)}
        >
            <span class="categoria-panorama-barra" aria-hidden="true" />
            <span class="categoria-panorama-nome">{nome}</span>
        </button>
    )
}
