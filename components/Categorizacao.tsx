import type { ComponentChildren } from "preact"
import type { OpcaoCategoria } from "./SeletorCategoria.tsx"

interface PropriedadesCategorizacao {
    conteudo: string
    complementos: { id: string; conteudo: string }[]
    selecionadas: OpcaoCategoria[]
    editavel: boolean
    orientacao: string | null
    aoRemover: (categoria: OpcaoCategoria) => void
    children?: ComponentChildren
}

export default function Categorizacao(
    { conteudo, complementos, selecionadas, editavel, orientacao, aoRemover, children: seletor }: PropriedadesCategorizacao
) {
    return (
        <div class="categorizacao">
            {editavel && orientacao && <p class="captura-orientacao">{orientacao}</p>}
            <div class="categorizacao-contexto" role="region" aria-label="Memória e complementos" tabIndex={0}>
                <p>{conteudo}</p>
                {complementos.map((item) => <p class="categorizacao-complemento" key={item.id}>{item.conteudo}</p>)}
            </div>
            <div class="categorias-selecionadas" role="region" aria-label="Categorias selecionadas" tabIndex={0}>
                <ul class="categorias-etiquetas">
                    {selecionadas.map((categoria) => (
                        <li key={categoria.chave} class="categoria-etiqueta">
                            <span title={categoria.nome}>{categoria.nome}</span>
                            {editavel && (
                                <button
                                    type="button"
                                    aria-label={`Remover categoria ${categoria.nome}`}
                                    title={`Remover categoria ${categoria.nome}`}
                                    onClick={() => aoRemover(categoria)}
                                >
                                    <i class="fas fa-xmark" aria-hidden="true" />
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            {editavel && selecionadas.length > 1 && (
                <p class="categorizacao-aviso-multipla">
                    Tente representar esta memória com uma única categoria sempre que possível. Use mais de uma apenas quando isso fizer
                    diferença para você.
                </p>
            )}
            {editavel ? seletor : (
                <p class="categorizacao-historica">
                    As categorias desta memória não podem mais ser alteradas porque o período de edição já terminou.
                </p>
            )}
        </div>
    )
}
