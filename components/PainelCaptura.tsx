import type { ComponentChildren } from "preact"
import { useRef } from "preact/hooks"
import { formatarDataCapturaPorExtenso } from "../app/utilitarios/dataCaptura.ts"

export const abasCaptura = ["Memorar", "Categorizar", "Revisar"] as const
export type AbaCaptura = typeof abasCaptura[number]

interface PropriedadesPainelCaptura {
    dataCaptura: string
    aba: AbaCaptura
    aoMudarAba: (aba: AbaCaptura) => void
    memoriaAberta: boolean
    abasInativas?: boolean
    acoes: ComponentChildren
    children: ComponentChildren
}

/** A barra e as abas permanecem no topo enquanto o conteúdo abaixo acompanha a rolagem do documento. */
export default function PainelCaptura(
    { dataCaptura, aba, aoMudarAba, memoriaAberta, abasInativas = false, acoes, children: conteudoFilho }: PropriedadesPainelCaptura
) {
    const botoes = useRef<(HTMLButtonElement | null)[]>([])
    const indice = abasCaptura.indexOf(aba)
    return (
        <>
            <div class="captura-dia-controles">
                <div class="captura-dia-barra">
                    <time class="captura-dia-data" dateTime={dataCaptura}>{formatarDataCapturaPorExtenso(dataCaptura)}</time>
                    <div class="buttons has-addons captura-dia-acoes" role="group" aria-label="Ações da captura">{acoes}</div>
                </div>
                {!memoriaAberta && (
                    <div class="captura-dia-abas" role="tablist" aria-label="Etapas da captura">
                        {abasCaptura.map((rotulo, posicao) => (
                            <button
                                ref={(elemento) => {
                                    botoes.current[posicao] = elemento
                                }}
                                key={rotulo}
                                id={`capture-tab-${posicao}`}
                                type="button"
                                role="tab"
                                aria-selected={aba === rotulo}
                                aria-controls={`capture-panel-${posicao}`}
                                tabIndex={aba === rotulo ? 0 : -1}
                                disabled={abasInativas}
                                onClick={() => {
                                    if (!abasInativas) aoMudarAba(rotulo)
                                }}
                                onKeyDown={(evento) => {
                                    if (abasInativas) return
                                    let proximo = posicao
                                    if (evento.key === "ArrowRight") proximo = (posicao + 1) % abasCaptura.length
                                    else if (evento.key === "ArrowLeft") proximo = (posicao + abasCaptura.length - 1) % abasCaptura.length
                                    else if (evento.key === "Home") proximo = 0
                                    else if (evento.key === "End") proximo = abasCaptura.length - 1
                                    else return
                                    evento.preventDefault()
                                    aoMudarAba(abasCaptura[proximo])
                                    botoes.current[proximo]?.focus()
                                }}
                            >
                                {rotulo}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {memoriaAberta
                ? <section class="captura-dia-conteudo" aria-label="Memória">{conteudoFilho}</section>
                : abasCaptura.map((rotulo, posicao) => (
                    <section
                        key={rotulo}
                        id={`capture-panel-${posicao}`}
                        role="tabpanel"
                        aria-labelledby={`capture-tab-${posicao}`}
                        tabIndex={0}
                        hidden={indice !== posicao}
                        class="captura-dia-conteudo"
                    >
                        {indice === posicao && conteudoFilho}
                    </section>
                ))}
        </>
    )
}
