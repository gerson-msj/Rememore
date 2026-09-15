import { useRef, useState } from "preact/hooks"
import CabecalhoPagina from "../components/CabecalhoPagina.tsx"
import MensagemPopup, { type ResultadoPopup } from "../components/MensagemPopup.tsx"

interface PropriedadesEstruturaProtegida {
    titulo: string
}

export default function EstruturaProtegida({ titulo }: PropriedadesEstruturaProtegida) {
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
            <main class="rememore-conteiner pagina-com-cabecalho" />
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
