import { useRef, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import Rememorar from "./Rememorar.tsx"
import MensagemPopup, { type ResultadoPopup } from "../components/MensagemPopup.tsx"
import { encerrarJornadaRememorar } from "../app/servicos/rememorar/jornada.ts"

interface PropriedadesEstruturaProtegida {
    titulo: string
    regiaoPrincipal?: "rememorar"
    accountId?: string
}

export default function EstruturaProtegida({ titulo, regiaoPrincipal, accountId }: PropriedadesEstruturaProtegida) {
    const [confirmarSaida, definirConfirmarSaida] = useState(false)
    const [tituloCabecalho, definirTituloCabecalho] = useState(titulo)
    const formulario = useRef<HTMLFormElement>(null)
    const acaoVoltar = useRef<() => void>(() => globalThis.location.assign("/principal"))

    function voltarAoInicio() {
        definirTituloCabecalho(titulo)
        acaoVoltar.current = () => globalThis.location.assign("/principal")
    }

    function atualizarCabecalho(novoTitulo: string, aoVoltar: () => void) {
        definirTituloCabecalho(novoTitulo)
        acaoVoltar.current = aoVoltar
    }

    async function receberResultadoSaida(resultado: ResultadoPopup) {
        definirConfirmarSaida(false)
        if (resultado === "confirm") {
            try {
                if (accountId) await encerrarJornadaRememorar(accountId)
            } catch {
                // O encerramento da sessão deve prosseguir mesmo se o armazenamento local estiver indisponível.
            }
            formulario.current!.requestSubmit()
        }
    }

    return (
        <>
            <CabecalhoPagina
                titulo={tituloCabecalho}
                aoVoltar={() => acaoVoltar.current()}
                aoSair={() => definirConfirmarSaida(true)}
            />
            <main
                class={`rememore-conteiner pagina-com-cabecalho${regiaoPrincipal ? ` pagina-${regiaoPrincipal}` : ""}`}
                id={regiaoPrincipal ? `pagina-${regiaoPrincipal}` : undefined}
            >
                {regiaoPrincipal === "rememorar" && accountId && (
                    <Rememorar accountId={accountId} aoAtualizarCabecalho={atualizarCabecalho} aoRestaurarCabecalho={voltarAoInicio} />
                )}
            </main>
            <form ref={formulario} method="post" action="/principal" hidden />
            <MensagemPopup
                aberto={confirmarSaida}
                mensagem="Deseja realmente sair?"
                acoes="yesNo"
                aoResponder={receberResultadoSaida}
            />
        </>
    )
}
