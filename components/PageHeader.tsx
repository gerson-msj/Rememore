export interface PageHeaderProps {
    title: string
    onBack?: () => void
    onLogout?: () => void
}

export default function PageHeader({ title, onBack, onLogout }: PageHeaderProps) {
    return (
        <header class="page-header">
            <div class="page-header-side">
                {onBack
                    ? (
                        <button type="button" class="page-header-action" aria-label="Voltar" onClick={onBack}>
                            <i class="fas fa-chevron-left" aria-hidden="true" />
                        </button>
                    )
                    : (
                        <span class="page-header-action">
                            <i class="fas fa-book-open" aria-hidden="true" />
                        </span>
                    )}
            </div>
            <h2 class="title is-2 page-header-title">{title}</h2>
            <div class="page-header-side">
                {onLogout && (
                    <button type="button" class="page-header-action" aria-label="Sair" onClick={onLogout}>
                        <i class="fas fa-arrow-right-from-bracket" aria-hidden="true" />
                    </button>
                )}
            </div>
        </header>
    )
}
