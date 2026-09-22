export interface OpcaoCategoria {
    chave: string
    nome: string
}

interface PropriedadesSeletorCategoria {
    consulta: string
    resultados: OpcaoCategoria[]
    selecionadas: OpcaoCategoria[]
    novaCategoria?: string
    aproximados?: boolean
    aoPesquisar: (consulta: string) => void
    aoAlternar: (categoria: OpcaoCategoria) => void
    aoCriar: (nome: string) => void
}

/** A origem do catálogo e a política de pesquisa pertencem ao consumidor. */
export default function SeletorCategoria(
    { consulta, resultados, selecionadas, novaCategoria, aproximados, aoPesquisar, aoAlternar, aoCriar }: PropriedadesSeletorCategoria
) {
    return (
        <section class="seletor-categoria" aria-label="Seletor de categoria">
            <label class="label" for="pesquisa-categoria">Pesquisar categoria</label>
            <div class="control has-icons-left">
                <input
                    id="pesquisa-categoria"
                    class="input"
                    type="search"
                    autoComplete="off"
                    value={consulta}
                    onInput={(evento) => aoPesquisar(evento.currentTarget.value)}
                />
                <span class="icon is-left">
                    <i class="fas fa-magnifying-glass" aria-hidden="true" />
                </span>
            </div>
            <ul class="categoria-resultados" aria-label="Categorias disponíveis">
                {novaCategoria && (
                    <li>
                        <button type="button" class="categoria-resultado categoria-criar" onClick={() => aoCriar(novaCategoria)}>
                            <i class="fas fa-plus" aria-hidden="true" />
                            <span class="categoria-resultado-nome">{novaCategoria}</span>
                            <span class="categoria-resultado-indicacao">Criar nova categoria</span>
                        </button>
                    </li>
                )}
                {resultados.map((categoria) => {
                    const selecionada = selecionadas.some((item) => item.chave === categoria.chave)
                    return (
                        <li key={categoria.chave}>
                            <button
                                type="button"
                                class="categoria-resultado"
                                aria-pressed={selecionada}
                                onClick={() => aoAlternar(categoria)}
                            >
                                <i class={`fas ${selecionada ? "fa-check-square" : "fa-square"}`} aria-hidden="true" />
                                <span class="categoria-resultado-nome">{categoria.nome}</span>
                                {aproximados && <span class="categoria-resultado-indicacao">Semelhante</span>}
                            </button>
                        </li>
                    )
                })}
            </ul>
        </section>
    )
}
