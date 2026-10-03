import { useRef, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import Rememorar from "./Rememorar.tsx"
import MensagemPopup, { type ResultadoPopup } from "../components/MensagemPopup.tsx"

interface PropriedadesEstruturaProtegida {
    titulo: string
    regiaoPrincipal?: "rememorar"
    accountId?: string
}

export default function EstruturaProtegida({ titulo, regiaoPrincipal, accountId }: PropriedadesEstruturaProtegida) {
    const [confirmarSaida, definirConfirmarSaida] = useState(false)
    const formulario = useRef<HTMLFormElement>(null)

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
                {regiaoPrincipal === "rememorar" && accountId && <Rememorar accountId={accountId} />}
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
