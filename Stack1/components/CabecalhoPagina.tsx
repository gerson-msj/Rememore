export interface PropriedadesCabecalhoPagina {
    titulo: string
    aoVoltar?: () => void
    aoSair?: () => void
}

export default function CabecalhoPagina({ titulo, aoVoltar, aoSair }: PropriedadesCabecalhoPagina) {
    return (
        <header class="cabecalho-pagina">
            <div class="cabecalho-lateral">
                {aoVoltar
                    ? (
                        <button type="button" class="cabecalho-acao" aria-label="Voltar" onClick={aoVoltar}>
                            <i class="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                    )
                    : (
                        <span class="cabecalho-acao">
                            <i class="fas fa-book-open" aria-hidden="true" />
                        </span>
                    )}
            </div>
            <h2 class="title is-2 cabecalho-titulo">{titulo}</h2>
            <div class="cabecalho-lateral">
                {aoSair && (
                    <button type="button" class="cabecalho-acao" aria-label="Sair" onClick={aoSair}>
                        <i class="fas fa-arrow-right-from-bracket" aria-hidden="true" />
                    </button>
                )}
            </div>
        </header>
    )
}
