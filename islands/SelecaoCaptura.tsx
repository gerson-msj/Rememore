import { useEffect, useState } from "preact/hooks"
import EstruturaCaptura from "../components/EstruturaCaptura.tsx"
import SeletorData from "../components/SeletorData.tsx"
import MensagemPopup from "../components/MensagemPopup.tsx"
import { orientar } from "../app/servicos/orientacao.ts"
import { type CapturaLocal, capturasLocais } from "../app/servicos/local/capturas.ts"
import { ehDataCaptura, formatarDataCaptura, hoje } from "../app/utilitarios/dataCaptura.ts"
import { adquirirBloqueioCaptura, type PosseCaptura } from "../app/servicos/captura/bloqueio.ts"

export default function SelecaoCaptura({ accountId: idConta }: { accountId: string }) {
    const [dataCaptura, definirDataCaptura] = useState("")
    const [atual, definirAtual] = useState("")
    const [pendentes, definirPendentes] = useState<CapturaLocal[]>([])
    const [erro, definirErro] = useState("")
    const [invalido, definirInvalido] = useState(false)
    const [excluindo, definirExcluindo] = useState<CapturaLocal | null>(null)
    const [ocupado, definirOcupado] = useState(false)
    const mensagem = orientar("captureSelection")

    useEffect(() => {
        let ativo = true
        const atualizar = async () => {
            definirAtual(hoje())
            try {
                const capturas = await capturasLocais.listarPendentes(idConta)
                if (ativo) {
                    definirPendentes(capturas)
                    definirErro("")
                }
            } catch {
                if (ativo) definirErro("Não foi possível verificar as capturas pendentes neste dispositivo.")
            }
        }
        definirDataCaptura(hoje())
        definirInvalido(new URLSearchParams(location.search).has("data-invalida"))
        void atualizar()
        globalThis.addEventListener("pageshow", atualizar)
        globalThis.addEventListener("focus", atualizar)
        return () => {
            ativo = false
            globalThis.removeEventListener("pageshow", atualizar)
            globalThis.removeEventListener("focus", atualizar)
        }
    }, [idConta])

    async function remover(captura: CapturaLocal) {
        definirOcupado(true)
        definirErro("")
        let posse: PosseCaptura | null = null
        try {
            posse = await adquirirBloqueioCaptura(idConta, captura.dataCaptura)
            if (!posse) {
                definirErro("Esta captura está aberta em outra aba ou janela. Feche-a antes de apagar suas alterações.")
                return
            }
            await posse.executar(() => capturasLocais.remover(idConta, captura.dataCaptura))
            definirPendentes((itens) => itens.filter((item) => item.dataCaptura !== captura.dataCaptura))
        } catch {
            definirErro("Não foi possível apagar as alterações. Tente novamente.")
        } finally {
            await posse?.liberar()
            definirOcupado(false)
        }
    }

    return (
        <EstruturaCaptura>
            {mensagem && <p class="captura-orientacao">{mensagem}</p>}
            {invalido && (
                <p class="notification is-warning" role="alert">
                    Data inválida. Escolha uma data completa, existente e até hoje.
                </p>
            )}
            <form
                class="captura-formulario-selecao"
                onSubmit={(evento) => {
                    evento.preventDefault()
                    definirAtual(hoje())
                    if (ehDataCaptura(dataCaptura)) location.assign(`/capturar/${dataCaptura}`)
                    else definirInvalido(true)
                }}
            >
                <SeletorData value={dataCaptura} max={atual} onChange={definirDataCaptura} />
                <button class="button is-primary" type="submit" disabled={!ehDataCaptura(dataCaptura, atual)}>Capturar</button>
            </form>
            {erro && <p class="notification is-warning" role="alert">{erro}</p>}
            {pendentes.length > 0 && (
                <section class="captura-pendencias" aria-labelledby="pending-title">
                    <h3 id="pending-title" class="title is-5">Capturas pendentes</h3>
                    <ul>
                        {pendentes.map((captura) => (
                            <li key={captura.dataCaptura}>
                                <a href={`/capturar/${captura.dataCaptura}`}>{formatarDataCaptura(captura.dataCaptura)}</a>
                                <button
                                    type="button"
                                    class="button is-ghost"
                                    disabled={ocupado}
                                    onClick={() => definirExcluindo(captura)}
                                    aria-label={`Apagar captura de ${formatarDataCaptura(captura.dataCaptura)}`}
                                >
                                    <i class="fas fa-trash-can" aria-hidden="true" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
            <MensagemPopup
                aberto={excluindo !== null}
                acoes="okCancel"
                rotuloConfirmacao="Apagar"
                rotuloCancelamento="Cancelar"
                titulo={excluindo
                    ? `Apagar ${excluindo.origemPreservada ? "as alterações" : "as memórias"} de ${
                        formatarDataCaptura(excluindo.dataCaptura)
                    }?`
                    : ""}
                mensagem={excluindo?.origemPreservada
                    ? "As alterações ainda não preservadas serão removidas. As memórias já preservadas desse dia serão mantidas."
                    : "As memórias desta captura ainda não foram preservadas e serão removidas."}
                aoResponder={(resultado) => {
                    const captura = excluindo
                    definirExcluindo(null)
                    if (resultado === "confirm" && captura) void remover(captura)
                }}
            />
        </EstruturaCaptura>
    )
}
