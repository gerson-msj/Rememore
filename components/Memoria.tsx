import { aparenciaTom } from "../app/utilitarios/aparenciaTom.ts"

export type ContextoMemoria = "registrar" | "categorizar" | "revisar"
type PropriedadesMemoria =
    & {
        conteudo: string
        categorias: string[]
        tom: number | null
        aoAcionar: () => void
        inativa?: boolean
    }
    & (
        | {
            contexto: "registrar"
            primeira: boolean
            ultima: boolean
            aoElevar: (botao: HTMLButtonElement) => void
            aoRebaixar: (botao: HTMLButtonElement) => void
        }
        | { contexto: "categorizar" | "revisar" }
    )

export default function Memoria(propriedades: PropriedadesMemoria) {
    const { conteudo, categorias, tom, contexto, aoAcionar, inativa = false } = propriedades
    const completa = contexto === "revisar"
    const mostrarCategoria = categorias.length > 0 || contexto !== "registrar"
    const categoria = categorias.length ? (completa ? categorias.join(", ") : categorias[0]) : "Sem categoria"
    const aparencia = aparenciaTom(tom)
    return (
        <article
            class={`memoria ${aparencia.className}${inativa ? " memoria-inativa" : ""}${
                completa ? " memoria-completa" : " memoria-compacta"
            }`}
            style={aparencia.style}
        >
            <fieldset
                class="memoria-moldura"
                onClick={(evento) => {
                    // A legenda também aciona a memória; botões já têm suas próprias ações.
                    if (inativa || !(evento.target instanceof Element) || evento.target.closest("button")) return
                    aoAcionar()
                }}
            >
                {mostrarCategoria && (
                    <legend class={`memoria-categoria${categorias.length ? "" : " memoria-sem-categoria"}`}>
                        <span class="memoria-categoria-nome" title={categoria}>{categoria}</span>
                        {!completa && categorias.length > 1 && <span class="memoria-categoria-excedente">e +{categorias.length - 1}</span>}
                    </legend>
                )}
                <button
                    type="button"
                    class="memoria-acionamento"
                    disabled={inativa}
                    onClick={() => {
                        if (!inativa) aoAcionar()
                    }}
                    aria-label={`Abrir memória: ${conteudo}`}
                />
                <div class="memoria-conteudo">
                    <div class="memoria-texto">
                        <div>{conteudo}</div>
                    </div>
                    {propriedades.contexto === "registrar" && (
                        <div class="memoria-ordenacao">
                            <button
                                type="button"
                                title="Elevar"
                                aria-label="Elevar memória"
                                disabled={inativa || propriedades.primeira}
                                onClick={(evento) => {
                                    if (!inativa) propriedades.aoElevar(evento.currentTarget)
                                }}
                            >
                                <i class="fas fa-chevron-up" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                title="Rebaixar"
                                aria-label="Rebaixar memória"
                                disabled={inativa || propriedades.ultima}
                                onClick={(evento) => {
                                    if (!inativa) propriedades.aoRebaixar(evento.currentTarget)
                                }}
                            >
                                <i class="fas fa-chevron-down" aria-hidden="true" />
                            </button>
                        </div>
                    )}
                </div>
            </fieldset>
        </article>
    )
}
