import { useEffect, useRef, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import MensagemPopup, { type ResultadoPopup } from "../components/MensagemPopup.tsx"
import type { CapacidadesPrincipal } from "../app/servicos/principal/contratos.ts"
import { capturasLocais } from "../app/servicos/local/capturas.ts"

interface PropriedadesPrincipal {
    accountId: string
    capabilities: CapacidadesPrincipal
}

interface Jornada {
    titulo: string
    descricao: string
    indisponivel?: string
    explicacao?: string
    icone: string
    href: string
    disponivel: boolean
}

interface Explicacao {
    titulo: string
    mensagem: string
    icone: string
}

export default function Principal({ capabilities: capacidades, accountId: idConta }: PropriedadesPrincipal) {
    const [pendentes, definirPendentes] = useState<boolean | null>(null)
    const [erroPendencias, definirErroPendencias] = useState(false)
    useEffect(() => {
        let ativo = true
        async function atualizar() {
            try {
                const capturas = await capturasLocais.listarPendentes(idConta)
                if (ativo) {
                    definirPendentes(capturas.length > 0)
                    definirErroPendencias(false)
                }
            } catch {
                if (ativo) {
                    definirPendentes(null)
                    definirErroPendencias(true)
                }
            }
        }
        void atualizar()
        globalThis.addEventListener("pageshow", atualizar)
        globalThis.addEventListener("focus", atualizar)
        return () => {
            ativo = false
            globalThis.removeEventListener("pageshow", atualizar)
            globalThis.removeEventListener("focus", atualizar)
        }
    }, [idConta])
    const [confirmarSaida, definirConfirmarSaida] = useState(false)
    const [explicacao, definirExplicacao] = useState<Explicacao | null>(null)
    const formulario = useRef<HTMLFormElement>(null)

    const jornadas: Jornada[] = [
        {
            titulo: "Capturar",
            descricao: "Preserve as memórias de um dia.",
            icone: "fas fa-feather-pointed",
            href: "/capturar",
            disponivel: true
        },
        {
            titulo: "Encontrar Memórias",
            descricao: "Localize memórias preservadas usando diferentes critérios.",
            indisponivel: "Disponível depois que você capturar seu primeiro dia.",
            explicacao:
                "Encontre memórias já preservadas usando diferentes critérios de busca.\n\nPara começar a utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
            icone: "fas fa-magnifying-glass",
            href: "/encontrar",
            disponivel: capacidades.canFindMemories
        },
        {
            titulo: "Rever um Dia",
            descricao: "Volte às memórias preservadas de uma data específica.",
            indisponivel: "Disponível depois que você capturar seu primeiro dia.",
            explicacao:
                "Reveja as memórias que você preservou em uma data específica.\n\nPara utilizar este recurso, primeiro capture e preserve as memórias de pelo menos um dia.",
            icone: "fas fa-location-crosshairs",
            href: "/rever",
            disponivel: capacidades.canReviewDay
        },
        {
            titulo: "Rememorar",
            descricao: "Explore suas memórias por categorias e períodos.",
            indisponivel: "Disponível quando houver mais memórias preservadas.",
            explicacao:
                "Rememorar permite explorar suas memórias por categorias e períodos, ajudando a perceber relações ao longo do tempo.\n\nPara que essa exploração faça sentido, é preciso ter memórias preservadas em pelo menos dois dias e distribuídas entre pelo menos duas categorias.\n\nContinue capturando suas memórias e o recurso ficará disponível conforme seu acervo crescer.",
            icone: "fas fa-book-open",
            href: "/rememorar",
            disponivel: capacidades.canReminisce
        }
    ]

    function receberResultadoSaida(resultado: ResultadoPopup) {
        definirConfirmarSaida(false)
        if (resultado === "confirm") formulario.current!.requestSubmit()
    }

    function abrirJornada(jornada: Jornada) {
        if (!jornada.explicacao) return
        definirExplicacao({ titulo: jornada.titulo, mensagem: jornada.explicacao, icone: jornada.icone })
    }

    return (
        <>
            <CabecalhoPagina titulo="Rememore" aoSair={() => definirConfirmarSaida(true)} />
            <main class="rememore-conteiner pagina-com-cabecalho principal-pagina">
                <section class="principal-jornadas" aria-label="Jornadas">
                    {jornadas.map((jornada) => {
                        const conteudo = (
                            <>
                                <div class="principal-jornada-visual">
                                    <i class={jornada.icone} aria-hidden="true" />
                                </div>
                                <div class="card-content principal-jornada-conteudo">
                                    <h2 class="title is-3">{jornada.titulo}</h2>
                                    <p>{jornada.descricao}</p>
                                    {!jornada.disponivel && <p class="principal-disponibilidade">{jornada.indisponivel}</p>}
                                </div>
                            </>
                        )

                        return jornada.disponivel
                            ? (
                                <a class="card principal-jornada" href={jornada.href}>
                                    {conteudo}
                                </a>
                            )
                            : (
                                <button type="button" class="card principal-jornada" onClick={() => abrirJornada(jornada)}>
                                    {conteudo}
                                </button>
                            )
                    })}
                </section>

                <nav class="principal-secundario" aria-label="Continuidade, conta e sistema">
                    {pendentes && (
                        <a class="principal-item-secundario principal-pendencias" href="/capturar">
                            <i class="fas fa-triangle-exclamation" aria-hidden="true" />
                            <span>Capturas pendentes</span>
                        </a>
                    )}
                    <a class="principal-item-secundario" href="/conta">
                        <i class="fas fa-user-gear" aria-hidden="true" />
                        <span>Minha Conta e Meus Dados</span>
                    </a>
                    {capacidades.canAdminister && (
                        <a class="principal-item-secundario" href="/admin">
                            <i class="fas fa-wrench" aria-hidden="true" />
                            <span>Administração</span>
                        </a>
                    )}
                </nav>
                {erroPendencias && (
                    <p class="notification is-warning" role="alert">Não foi possível verificar as capturas pendentes neste dispositivo.</p>
                )}
            </main>

            <form ref={formulario} method="post" action="/principal" hidden />
            <MensagemPopup
                aberto={confirmarSaida}
                mensagem="Deseja realmente sair?"
                acoes="yesNo"
                aoResponder={receberResultadoSaida}
            />
            <MensagemPopup
                aberto={explicacao !== null}
                titulo={explicacao?.titulo}
                mensagem={explicacao?.mensagem ?? ""}
                icone={explicacao?.icone}
                acoes="ok"
                aoResponder={() => definirExplicacao(null)}
            />
        </>
    )
}
