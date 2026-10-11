import { aparenciaTom } from "../app/utilitarios/aparenciaTom.ts"

export type ContextoMemoria = "registrar" | "categorizar" | "revisar" | "rememorarDetalheCategoria"
type PropriedadesComuns = {
    conteudo: string
    categorias: string[]
    tom: number | null
    inativa?: boolean
    categoriaEmAtencao?: boolean
    transformarTom?: (tom: number | null) => number | null
}
type PropriedadesMemoria =
    & PropriedadesComuns
    & (
        | {
            contexto: "registrar"
            aoAcionar: () => void
            primeira: boolean
            ultima: boolean
            aoElevar: (botao: HTMLButtonElement) => void
            aoRebaixar: (botao: HTMLButtonElement) => void
        }
        | { contexto: "categorizar" | "revisar"; aoAcionar: () => void }
        | { contexto: "rememorarDetalheCategoria"; aoAcionar?: () => void }
    )

export default function Memoria(propriedades: PropriedadesMemoria) {
    const { conteudo, categorias, tom, contexto, inativa = false, transformarTom } = propriedades
    const completa = contexto === "revisar"
    const semAcao = contexto === "rememorarDetalheCategoria" && !propriedades.aoAcionar
    const mostrarCategoria = contexto !== "rememorarDetalheCategoria" && (categorias.length > 0 || contexto !== "registrar")
    const categoria = categorias.length ? (completa ? categorias.join(", ") : categorias[0]) : "Sem categoria"
    const aparencia = aparenciaTom(tom, transformarTom)
    return (
        <article
            class={`memoria ${aparencia.className}${
                contexto === "rememorarDetalheCategoria" ? " memoria-rememorar-detalhe-categoria" : ""
            }${inativa ? " memoria-inativa" : ""}${semAcao ? " memoria-sem-acao" : ""}${
                completa ? " memoria-completa" : " memoria-compacta"
            }`}
            style={aparencia.style}
        >
            <fieldset
                class="memoria-moldura"
                onClick={(evento) => {
                    // A legenda também aciona a memória; botões já têm suas próprias ações.
                    if (inativa || !propriedades.aoAcionar || !(evento.target instanceof Element) || evento.target.closest("button")) return
                    propriedades.aoAcionar()
                }}
            >
                {mostrarCategoria && (
                    <legend
                        class={`memoria-categoria${categorias.length ? "" : " memoria-sem-categoria"}${
                            propriedades.categoriaEmAtencao ? " memoria-categoria-atencao" : ""
                        }`}
                    >
                        <span class="memoria-categoria-nome" title={categoria}>{categoria}</span>
                        {!completa && categorias.length > 1 && <span class="memoria-categoria-excedente">e +{categorias.length - 1}</span>}
                    </legend>
                )}
                {!semAcao && (
                    <button
                        type="button"
                        class="memoria-acionamento"
                        disabled={inativa}
                        onClick={() => {
                            if (!inativa) propriedades.aoAcionar?.()
                        }}
                        aria-label={`Abrir memória: ${conteudo}`}
                    />
                )}
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
