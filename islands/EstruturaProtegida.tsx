import { useEffect, useRef, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import MensagemPopup, { type ResultadoPopup } from "../components/MensagemPopup.tsx"
import { prepararDadosRememorar } from "../app/servicos/rememorar.ts"

interface PropriedadesEstruturaProtegida {
    titulo: string
    regiaoPrincipal?: "rememorar"
    diasPreservadosMock?: readonly string[]
    accountId?: string
}

export default function EstruturaProtegida({ titulo, regiaoPrincipal, diasPreservadosMock, accountId }: PropriedadesEstruturaProtegida) {
    const [confirmarSaida, definirConfirmarSaida] = useState(false)
    const formulario = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (regiaoPrincipal === "rememorar" && accountId) void prepararDadosRememorar(accountId)
    }, [accountId, regiaoPrincipal])

    function receberResultadoSaida(resultado: ResultadoPopup) {
        definirConfirmarSaida(false)
        if (resultado === "confirm") formulario.current!.requestSubmit()
    }

    return (
        <>
            <CabecalhoPagina
                titulo={titulo}
                aoVoltar={() => globalThis.location.assign("/principal")}
                aoSair={() => definirConfirmarSaida(true)}
            />
            <main
                class={`rememore-conteiner pagina-com-cabecalho${regiaoPrincipal ? ` pagina-${regiaoPrincipal}` : ""}`}
                id={regiaoPrincipal ? `pagina-${regiaoPrincipal}` : undefined}
            >
                {regiaoPrincipal === "rememorar" && diasPreservadosMock && diasPreservadosMock.length >= 2 && (
                    <>
                        <p class="help">Cenário de desenvolvimento com datas simuladas.</p>
                        <JanelaTemporal id="janela-temporal-rememorar" dias={diasPreservadosMock} />
                    </>
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
