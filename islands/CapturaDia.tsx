import { useEffect, useRef, useState } from "preact/hooks"
import EstruturaCaptura from "../components/EstruturaCaptura.tsx"
import PainelCaptura, { type AbaCaptura } from "../components/PainelCaptura.tsx"
import { bancoLocal } from "../app/servicos/local/banco.ts"
import { type CapturaLocal, capturasLocais } from "../app/servicos/local/capturas.ts"
import { prepararCaptura } from "../app/servicos/captura.ts"
import { ehDataCaptura } from "../app/utilitarios/dataCaptura.ts"
import { adquirirBloqueioCaptura, type PosseCaptura } from "../app/servicos/captura/bloqueio.ts"
import { SessaoCapturaAberta } from "../app/servicos/captura/sessaoAberta.ts"

export default function CapturaDia({ accountId: idConta, date: dataCaptura }: { accountId: string; date: string }) {
    const [areaTrabalho, definirAreaTrabalho] = useState<CapturaLocal | null>(null)
    const [falha, definirFalha] = useState("")
    const [erroAlteracao, definirErroAlteracao] = useState("")
    const [ocupado, definirOcupado] = useState(false)
    const alterando = useRef(false)
    const posse = useRef<PosseCaptura | null>(null)
    const sessaoAberta = useRef<SessaoCapturaAberta | null>(null)
    const [avisoSessao, definirAvisoSessao] = useState(false)
    const [aba, definirAba] = useState<AbaCaptura>("Registrar e organizar")
    // undefined mantém as abas; null abre uma memória nova; string identifica a memória existente.
    const [idMemoria, definirIdMemoria] = useState<string | null | undefined>(undefined)
    const rolagemLista = useRef(0)
    const memoria = areaTrabalho?.memorias.find((item) => item.id === idMemoria)

    function abrirMemoria(id: string | null) {
        rolagemLista.current = globalThis.scrollY
        definirIdMemoria(id)
        globalThis.scrollTo(0, 0)
    }

    function voltarCaptura() {
        definirIdMemoria(undefined)
        definirAba("Registrar e organizar")
        requestAnimationFrame(() => globalThis.scrollTo(0, rolagemLista.current))
    }

    function encerrarSessao() {
        try {
            sessaoAberta.current?.encerrar()
        } catch {
            definirAvisoSessao(true)
        }
    }

    useEffect(() => {
        let ativo = true
        let posseAtual: PosseCaptura | null = null
        const ocultar = () => {
            ativo = false
            posse.current = null
            void posseAtual?.liberar()
        }
        const exibir = (evento: PageTransitionEvent) => {
            // A página restaurada pelo BFCache perdeu a posse do bloqueio; precisa reabrir antes de aceitar operações.
            if (evento.persisted) {
                encerrarSessao()
                location.replace(location.href)
            }
        }
        globalThis.addEventListener("pagehide", ocultar)
        globalThis.addEventListener("pageshow", exibir)
        async function abrir() {
            if (!ehDataCaptura(dataCaptura)) {
                location.replace("/capturar?data-invalida")
                return
            }
            const disponibilidade = await bancoLocal.diagnosticar()
            if (!ativo) return
            if (disponibilidade.status !== "operational") {
                definirFalha(
                    disponibilidade.status === "unsupported"
                        ? "Não é possível iniciar uma captura neste navegador. O Rememore precisa do armazenamento local do navegador para proteger suas memórias enquanto você trabalha. Tente utilizar uma versão atualizada de um navegador compatível."
                        : "Não foi possível acessar o armazenamento local. O Rememore precisa desse recurso para proteger suas memórias enquanto você trabalha. Verifique as configurações de privacidade do navegador ou tente novamente em uma janela de navegação normal."
                )
                return
            }
            try {
                let idAreaTrabalhoRetomada: string | undefined
                try {
                    sessaoAberta.current = new SessaoCapturaAberta(idConta, dataCaptura, sessionStorage)
                    const navegacao = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
                    idAreaTrabalhoRetomada = sessaoAberta.current.retomar(navegacao?.type ?? "navigate")
                } catch {
                    if (ativo) definirAvisoSessao(true)
                }
                posseAtual = await adquirirBloqueioCaptura(idConta, dataCaptura)
                if (!ativo) {
                    await posseAtual?.liberar()
                    return
                }
                if (!posseAtual) {
                    definirFalha("Esta captura está aberta em outra aba ou janela. Continue o trabalho na aba ou janela original.")
                    return
                }
                posse.current = posseAtual
                const captura = await posseAtual.executar(() =>
                    prepararCaptura(idConta, dataCaptura, undefined, undefined, idAreaTrabalhoRetomada)
                )
                if (ativo) {
                    try {
                        sessaoAberta.current?.iniciar(captura.idAreaTrabalho)
                    } catch {
                        definirAvisoSessao(true)
                    }
                    if (import.meta.env.DEV) {
                        console.info("[Capturar local]", {
                            date: dataCaptura,
                            revision: captura.revisaoOrigem,
                            editWindowDays: captura.prazoEdicaoDias,
                            changed: captura.alterada,
                            memories: captura.memorias.length,
                            workspaceId: captura.idAreaTrabalho
                        })
                    }
                    definirAreaTrabalho(captura)
                }
            } catch {
                posse.current = null
                await posseAtual?.liberar()
                if (ativo) definirFalha("Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.")
            }
        }
        void abrir()
        return () => {
            ocultar()
            globalThis.removeEventListener("pagehide", ocultar)
            globalThis.removeEventListener("pageshow", exibir)
        }
    }, [idConta, dataCaptura])

    async function marcarAlterada() {
        if (!areaTrabalho || alterando.current || !posse.current) return
        alterando.current = true
        definirOcupado(true)
        definirErroAlteracao("")
        try {
            await posse.current.executar(() => capturasLocais.marcarAlterada(idConta, dataCaptura))
            definirAreaTrabalho({ ...areaTrabalho, alterada: true })
        } catch {
            definirErroAlteracao("Não foi possível marcar a captura como alterada. Tente novamente.")
        } finally {
            alterando.current = false
            definirOcupado(false)
        }
    }

    return (
        <EstruturaCaptura retorno="/capturar" aoDeixar={encerrarSessao} dia>
            {avisoSessao && (
                <p class="notification is-warning" role="alert">
                    Não foi possível proteger o rascunho contra recarregamento. Seu texto continua nesta tela. Confirme a edição antes de
                    sair ou recarregar.
                </p>
            )}
            {falha
                ? (
                    <>
                        <p class="notification is-warning" role="alert">{falha}</p>
                        <a class="button" href="/principal">Voltar à Principal</a>
                    </>
                )
                : areaTrabalho
                ? (
                    <PainelCaptura
                        dataCaptura={dataCaptura}
                        aba={aba}
                        aoMudarAba={(proximo) => {
                            definirAba(proximo)
                            globalThis.scrollTo(0, 0)
                        }}
                        memoriaAberta={idMemoria !== undefined}
                        acoes={idMemoria !== undefined
                            ? (
                                <>
                                    <button
                                        type="button"
                                        class="button"
                                        title="Voltar à captura"
                                        aria-label="Voltar à captura"
                                        onClick={voltarCaptura}
                                    >
                                        <span class="icon">
                                            <i class="fas fa-chevron-left" aria-hidden="true" />
                                        </span>
                                    </button>
                                    {idMemoria === null && (
                                        <button
                                            type="button"
                                            class="button is-success"
                                            title="Confirmar Memória"
                                            aria-label="Confirmar Memória"
                                            disabled
                                        >
                                            <span class="icon">
                                                <i class="fas fa-bookmark" aria-hidden="true" />
                                            </span>
                                        </button>
                                    )}
                                </>
                            )
                            : aba === "Registrar e organizar"
                            ? (
                                <button
                                    type="button"
                                    class="button is-primary"
                                    title="Adicionar memória"
                                    aria-label="Adicionar memória"
                                    onClick={() => abrirMemoria(null)}
                                >
                                    <span class="icon">
                                        <i class="fas fa-plus" aria-hidden="true" />
                                    </span>
                                </button>
                            )
                            : null}
                    >
                        {idMemoria !== undefined
                            ? idMemoria === null
                                ? <textarea class="textarea captura-campo-memoria" rows={5} aria-label="Texto da memória" disabled />
                                : <p class="captura-texto-memoria">{memoria?.conteudo}</p>
                            : aba === "Registrar e organizar" && (
                                <>
                                    <ul class="captura-lista-memorias">
                                        {[...areaTrabalho.memorias].sort((a, b) => a.ordem - b.ordem).map((item) => (
                                            <li key={item.id}>
                                                <button
                                                    type="button"
                                                    class="captura-previa-memoria"
                                                    onClick={() => abrirMemoria(item.id)}
                                                >
                                                    <span>{item.conteudo}</span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                    <div class="captura-andaime-desenvolvimento">
                                        <p class="mb-4">Controle temporário de desenvolvimento</p>
                                        <button type="button" class="button" disabled={ocupado} onClick={marcarAlterada}>
                                            Marcar como alterada
                                        </button>
                                        <p class="mt-4" role="status">
                                            {areaTrabalho.alterada ? "Captura com alterações pendentes." : "Captura sem alterações."}
                                        </p>
                                        {erroAlteracao && <p class="notification is-warning mt-4" role="alert">{erroAlteracao}</p>}
                                    </div>
                                </>
                            )}
                    </PainelCaptura>
                )
                : <p role="status">Preparando captura…</p>}
        </EstruturaCaptura>
    )
}
