import { useRef, useState } from "preact/hooks"
import PageHeader from "../components/PageHeader.tsx"
import MessagePopup, { type PopupResult } from "../components/MessagePopup.tsx"
import type { PrincipalCapabilities } from "../app/services/principal/contracts.ts"
import { mockHasPendingCaptures } from "../app/services/principal/localMock.ts"

interface PrincipalProps {
    capabilities: PrincipalCapabilities
}

interface Journey {
    title: string
    description: string
    unavailable?: string
    explanation?: string
    icon: string
    href: string
    available: boolean
}

interface Explanation {
    title: string
    message: string
    icon: string
}

export default function Principal({ capabilities }: PrincipalProps) {
    const [confirmLogout, setConfirmLogout] = useState(false)
    const [explanation, setExplanation] = useState<Explanation | null>(null)
    const form = useRef<HTMLFormElement>(null)

    const journeys: Journey[] = [
        {
            title: "Capturar",
            description: "Preserve as memórias de um dia.",
            icon: "fas fa-feather-pointed",
            href: "/capturar",
            available: true
        },
        {
            title: "Encontrar Memórias",
            description: "Localize memórias preservadas usando diferentes critérios.",
            unavailable: "Disponível depois que você capturar seu primeiro dia.",
            explanation:
                "Encontre memórias já preservadas usando diferentes critérios de busca.\n\nPara começar a utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
            icon: "fas fa-magnifying-glass",
            href: "/encontrar",
            available: capabilities.canFindMemories
        },
        {
            title: "Rever um Dia",
            description: "Volte às memórias preservadas de uma data específica.",
            unavailable: "Disponível depois que você capturar seu primeiro dia.",
            explanation:
                "Reveja as memórias que você preservou em uma data específica.\n\nPara utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
            icon: "fas fa-location-crosshairs",
            href: "/rever",
            available: capabilities.canReviewDay
        },
        {
            title: "Rememorar",
            description: "Explore suas memórias por categorias e períodos.",
            unavailable: "Disponível quando houver mais memórias preservadas.",
            explanation:
                "Rememorar permite explorar suas memórias por categorias e períodos, ajudando a perceber relações ao longo do tempo.\n\nPara que essa exploração faça sentido, é preciso ter memórias preservadas em pelo menos dois dias e distribuídas entre pelo menos duas categorias.\n\nContinue capturando suas memórias e o recurso ficará disponível conforme seu acervo crescer.",
            icon: "fas fa-book-open",
            href: "/rememorar",
            available: capabilities.canReminisce
        }
    ]

    function receiveLogoutResult(result: PopupResult) {
        setConfirmLogout(false)
        if (result === "confirm") form.current!.requestSubmit()
    }

    function openJourney(journey: Journey) {
        if (!journey.explanation) return
        setExplanation({ title: journey.title, message: journey.explanation, icon: journey.icon })
    }

    return (
        <>
            <PageHeader title="Rememore" onLogout={() => setConfirmLogout(true)} />
            <main class="rememore-container page-with-header principal-page">
                <section class="principal-journeys" aria-label="Jornadas">
                    {journeys.map((journey) => {
                        const content = (
                            <>
                                <div class="principal-journey-visual">
                                    <i class={journey.icon} aria-hidden="true" />
                                </div>
                                <div class="card-content principal-journey-content">
                                    <h2 class="title is-3">{journey.title}</h2>
                                    <p>{journey.description}</p>
                                    {!journey.available && <p class="principal-availability">{journey.unavailable}</p>}
                                </div>
                            </>
                        )

                        return journey.available
                            ? (
                                <a class="card principal-journey" href={journey.href}>
                                    {content}
                                </a>
                            )
                            : (
                                <button type="button" class="card principal-journey" onClick={() => openJourney(journey)}>
                                    {content}
                                </button>
                            )
                    })}
                </section>

                <nav class="principal-secondary" aria-label="Continuidade, conta e sistema">
                    {mockHasPendingCaptures && (
                        <a class="principal-secondary-item principal-pending" href="/capturar">
                            <i class="fas fa-triangle-exclamation" aria-hidden="true" />
                            <span>Capturas pendentes</span>
                        </a>
                    )}
                    <a class="principal-secondary-item" href="/conta">
                        <i class="fas fa-user-gear" aria-hidden="true" />
                        <span>Minha Conta e Meus Dados</span>
                    </a>
                    {capabilities.canAdminister && (
                        <a class="principal-secondary-item" href="/admin">
                            <i class="fas fa-wrench" aria-hidden="true" />
                            <span>Administração</span>
                        </a>
                    )}
                </nav>
            </main>

            <form ref={form} method="post" action="/principal" hidden />
            <MessagePopup
                open={confirmLogout}
                message="Deseja realmente sair?"
                actions="yesNo"
                onResult={receiveLogoutResult}
            />
            <MessagePopup
                open={explanation !== null}
                title={explanation?.title}
                message={explanation?.message ?? ""}
                icon={explanation?.icon}
                actions="ok"
                onResult={() => setExplanation(null)}
            />
        </>
    )
}
