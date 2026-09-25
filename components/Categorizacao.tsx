import type { OpcaoCategoria } from "./SeletorCategoria.tsx"

interface PropriedadesCategorizacao {
    conteudo: string
    complementos: { id: string; conteudo: string }[]
    selecionadas: OpcaoCategoria[]
    editavel: boolean
    orientacao: string | null
    aoRemover: (categoria: OpcaoCategoria) => void
    aoPesquisar: () => void
}

export default function Categorizacao(
    { conteudo, complementos, selecionadas, editavel, orientacao, aoRemover, aoPesquisar }: PropriedadesCategorizacao
) {
    return (
        <div class="categorizacao">
            {editavel && orientacao && <p class="captura-orientacao">{orientacao}</p>}
            <div class="categorizacao-contexto" role="region" aria-label="Memória e complementos" tabIndex={0}>
                <p>{conteudo}</p>
                {complementos.map((item) => <p class="categorizacao-complemento" key={item.id}>{item.conteudo}</p>)}
            </div>
            <div class={`categorias-associadas${editavel ? " editavel" : ""}`}>
                <div
                    class={`categorias-selecionadas${editavel ? " acionavel" : ""}`}
                    role={editavel ? "button" : "region"}
                    aria-label={editavel ? "Pesquisar ou adicionar categoria" : "Categorias selecionadas"}
                    tabIndex={editavel ? 0 : 0}
                    onClick={editavel ? aoPesquisar : undefined}
                    onKeyDown={editavel ? (evento) => {
                        if (evento.key === "Enter" || evento.key === " ") {
                            evento.preventDefault()
                            aoPesquisar()
                        }
                    } : undefined}
                >
                    <ul class="categorias-etiquetas">
                        {selecionadas.map((categoria) => (
                            <li key={categoria.chave} class="categoria-etiqueta">
                                <span title={categoria.nome}>{categoria.nome}</span>
                                {editavel && (
                                    <button
                                        type="button"
                                        aria-label={`Remover categoria ${categoria.nome}`}
                                        title={`Remover categoria ${categoria.nome}`}
                                        onClick={(evento) => {
                                            evento.stopPropagation()
                                            aoRemover(categoria)
                                        }}
                                    >
                                        <i class="fas fa-xmark" aria-hidden="true" />
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                {editavel && (
                    <button
                        type="button"
                        class="button categorias-pesquisar"
                        title="Adicionar/pesquisar categoria"
                        aria-label="Adicionar/pesquisar categoria"
                        tabIndex={-1}
                        onClick={(evento) => {
                            evento.stopPropagation()
                            aoPesquisar()
                        }}
                    >
                        <span class="icon">
                            <i class="fas fa-magnifying-glass" aria-hidden="true" />
                        </span>
                    </button>
                )}
            </div>
            {editavel && selecionadas.length > 1 && (
                <p class="categorizacao-aviso-multipla">
                    Tente representar esta memória com uma única categoria sempre que possível. Use mais de uma apenas quando isso fizer
                    diferença para você.
                </p>
            )}
            {!editavel && (
                <p class="categorizacao-historica">
                    As categorias desta memória não podem mais ser alteradas porque o período de edição já terminou.
                </p>
            )}
        </div>
    )
}
