import type { ComponentChildren } from "preact"
import { useEffect, useRef, useState } from "preact/hooks"
import CabecalhoPagina from "./CabecalhoPagina.tsx"
import MensagemPopup from "./MensagemPopup.tsx"

export default function EstruturaCaptura(
    { children: conteudoFilho, retorno = "/principal", aoVoltar, aoDeixar, antesDeSair, dia = false, titulo = "Capturar" }: {
        children: ComponentChildren
        retorno?: string
        aoVoltar?: () => void
        aoDeixar?: () => void
        antesDeSair?: (continuar: () => void) => void
        dia?: boolean
        titulo?: string
    }
) {
    const [saida, definirSaida] = useState(false)
    const formulario = useRef<HTMLFormElement>(null)
    const estrutura = useRef<HTMLDivElement>(null)
    const cabecalho = useRef<HTMLDivElement>(null)
    useEffect(() => {
        if (!dia || !cabecalho.current) return
        const medir = () =>
            estrutura.current?.style.setProperty("--captura-altura-cabecalho", `${cabecalho.current!.getBoundingClientRect().height}px`)
        medir()
        const observador = new ResizeObserver(medir)
        observador.observe(cabecalho.current)
        return () => observador.disconnect()
    }, [dia])
    return (
        <div ref={estrutura} class={dia ? "captura-dia-estrutura" : undefined}>
            <div ref={cabecalho} class={dia ? "captura-dia-cabecalho" : undefined}>
                <CabecalhoPagina
                    titulo={titulo}
                    aoVoltar={() => {
                        if (aoVoltar) {
                            aoVoltar()
                            return
                        }
                        const continuar = () => {
                            aoDeixar?.()
                            location.assign(retorno)
                        }
                        if (antesDeSair) antesDeSair(continuar)
                        else continuar()
                    }}
                    aoSair={() => definirSaida(true)}
                />
            </div>
            <main class={`rememore-conteiner pagina-com-cabecalho captura-pagina${dia ? " captura-dia-pagina" : ""}`}>{conteudoFilho}</main>
            <form ref={formulario} method="post" action="/principal" hidden />
            <MensagemPopup
                aberto={saida}
                mensagem="Deseja realmente sair?"
                acoes="yesNo"
                aoResponder={(resultado) => {
                    definirSaida(false)
                    if (resultado === "confirm") {
                        const continuar = () => {
                            aoDeixar?.()
                            formulario.current!.requestSubmit()
                        }
                        if (antesDeSair) antesDeSair(continuar)
                        else continuar()
                    }
                }}
            />
        </div>
    )
}
