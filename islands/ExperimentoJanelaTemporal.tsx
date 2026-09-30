import { useEffect, useMemo, useState } from "preact/hooks"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import { type EstadoJanelaTemporal, restaurarEstadoJanela } from "../app/utilitarios/janelaTemporal.ts"

type DistribuicaoDias = "consecutivos" | "espacados" | "irregulares"

function gerarDias(quantidade: number, distribuicao: DistribuicaoDias): string[] {
    const intervalos = distribuicao === "consecutivos"
        ? Array(quantidade).fill(1)
        : distribuicao === "espacados"
        ? Array(quantidade).fill(17)
        : Array.from({ length: quantidade }, (_, indice) => [1, 5, 2, 19, 3, 11][indice % 6])
    let dia = new Date("2025-01-01T00:00:00Z")
    return intervalos.map((intervalo, indice) => {
        if (indice > 0) dia = new Date(dia.getTime() + intervalo * 24 * 60 * 60 * 1000)
        return dia.toISOString().slice(0, 10)
    })
}

function formatarDia(data: string): string {
    const [ano, mes, dia] = data.split("-")
    return `${dia}/${mes}/${ano}`
}

export default function ExperimentoJanelaTemporal() {
    const [quantidadeTexto, definirQuantidadeTexto] = useState("5")
    const quantidadeInformada = Number.parseInt(quantidadeTexto, 10)
    const quantidade = Number.isInteger(quantidadeInformada) ? Math.max(2, quantidadeInformada) : 2
    const [distribuicao, definirDistribuicao] = useState<DistribuicaoDias>("irregulares")
    const [largura, definirLargura] = useState(100)
    const [marcadoresPlenosAte, definirMarcadoresPlenosAte] = useState(5)
    const [marcadoresEsmaecidosAte, definirMarcadoresEsmaecidosAte] = useState(7)
    const [preservarPosicoes, definirPreservarPosicoes] = useState(false)
    const [preferenciaLida, definirPreferenciaLida] = useState(false)
    const [chaveLida, definirChaveLida] = useState<string | null>(null)
    const [restauracao, definirRestauracao] = useState<{ chave: string; estado: EstadoJanelaTemporal } | null>(null)
    const [novaJornada, definirNovaJornada] = useState(0)
    const [avisoMemoria, definirAvisoMemoria] = useState("")
    const dias = useMemo(() => gerarDias(quantidade, distribuicao), [quantidade, distribuicao])
    const mostrarDias = dias.length <= 12 ? dias : [...dias.slice(0, 6), "…", ...dias.slice(-5)]
    const chaveCenario = `${quantidade}-${distribuicao}`
    const chaveMemoria = `rememore:lab:janela-temporal:v1:${chaveCenario}`
    const chavePreferencia = "rememore:lab:janela-temporal:preservar:v1"
    const estadoInicial = restauracao?.chave === chaveMemoria ? restauracao.estado : null
    const inicializacaoPronta = preferenciaLida && (!preservarPosicoes || chaveLida === chaveMemoria)

    useEffect(() => {
        try {
            definirPreservarPosicoes(sessionStorage.getItem(chavePreferencia) === "sim")
        } catch {
            definirAvisoMemoria("Não foi possível ler a preferência de estado neste navegador.")
        }
        definirPreferenciaLida(true)
    }, [])

    useEffect(() => {
        if (!preferenciaLida) return
        if (!preservarPosicoes) {
            definirRestauracao(null)
            definirChaveLida(chaveMemoria)
            return
        }
        try {
            const guardado = sessionStorage.getItem(chaveMemoria)
            const estado = guardado ? restaurarEstadoJanela(JSON.parse(guardado), dias) : null
            definirRestauracao(estado ? { chave: chaveMemoria, estado } : null)
            definirChaveLida(chaveMemoria)
            definirAvisoMemoria(guardado && !estado ? "Estado salvo incompatível com este cenário; será iniciada uma seleção nova." : "")
        } catch {
            definirRestauracao(null)
            definirChaveLida(chaveMemoria)
            definirAvisoMemoria("Não foi possível ler o estado de sessão neste navegador.")
        }
    }, [chaveMemoria, dias, preferenciaLida, preservarPosicoes])

    function alterarPreservacao(ativar: boolean) {
        definirPreservarPosicoes(ativar)
        try {
            sessionStorage.setItem(chavePreferencia, ativar ? "sim" : "nao")
            if (!ativar) {
                sessionStorage.removeItem(chaveMemoria)
            }
        } catch {
            definirAvisoMemoria("Não foi possível atualizar a preferência de estado neste navegador.")
        }
    }

    function guardarEstado(estado: EstadoJanelaTemporal) {
        if (!preservarPosicoes) return
        try {
            sessionStorage.setItem(chaveMemoria, JSON.stringify(estado))
            definirAvisoMemoria("")
        } catch {
            definirAvisoMemoria("Não foi possível guardar o estado de sessão neste navegador.")
        }
    }

    function iniciarNovaJornada() {
        try {
            sessionStorage.removeItem(chaveMemoria)
            definirAvisoMemoria("")
        } catch {
            definirAvisoMemoria("Não foi possível limpar o estado de sessão neste navegador.")
        }
        definirRestauracao(null)
        definirNovaJornada((atual) => atual + 1)
    }

    return (
        <section class="lab-janela-temporal" aria-labelledby="titulo-experimento-janela-temporal">
            <div class="lab-controles">
                <div class="field">
                    <label class="label" for="janela-quantidade-dias">Quantidade de dias preservados</label>
                    <div class="control">
                        <input
                            class="input"
                            id="janela-quantidade-dias"
                            type="number"
                            min="2"
                            step="1"
                            value={quantidadeTexto}
                            onInput={(evento) => definirQuantidadeTexto(evento.currentTarget.value)}
                            onBlur={() => definirQuantidadeTexto(String(quantidade))}
                        />
                    </div>
                </div>
                <div class="field">
                    <label class="label" for="janela-distribuicao-dias">Distribuição no calendário</label>
                    <div class="control">
                        <select
                            class="select"
                            id="janela-distribuicao-dias"
                            value={distribuicao}
                            onChange={(evento) => definirDistribuicao(evento.currentTarget.value as DistribuicaoDias)}
                        >
                            <option value="consecutivos">Consecutivos</option>
                            <option value="espacados">Muito espaçados</option>
                            <option value="irregulares">Irregulares</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label" for="janela-largura-laboratorio">Largura da área (%)</label>
                    <div class="control">
                        <input
                            class="slider is-fullwidth"
                            id="janela-largura-laboratorio"
                            type="range"
                            min="35"
                            max="100"
                            step="1"
                            value={largura}
                            onInput={(evento) => definirLargura(Number(evento.currentTarget.value))}
                        />
                    </div>
                    <p class="help">{largura}% da largura disponível</p>
                </div>
                <div class="field">
                    <label class="label" for="janela-limiar-marcadores-visiveis">Densidade máxima dos marcadores visíveis</label>
                    <div class="control">
                        <input
                            class="input"
                            id="janela-limiar-marcadores-visiveis"
                            type="number"
                            min="0.1"
                            max="20"
                            step="0.1"
                            value={marcadoresPlenosAte}
                            onInput={(evento) => {
                                const valor = Number(evento.currentTarget.value)
                                definirMarcadoresPlenosAte(valor)
                                if (valor >= marcadoresEsmaecidosAte) definirMarcadoresEsmaecidosAte(valor + 0.5)
                            }}
                        />
                    </div>
                    <p class="help">Dias por 100 px</p>
                </div>
                <div class="field">
                    <label class="label" for="janela-limiar-marcadores-esmaecidos">Densidade máxima dos marcadores esmaecidos</label>
                    <div class="control">
                        <input
                            class="input"
                            id="janela-limiar-marcadores-esmaecidos"
                            type="number"
                            min="0.2"
                            max="40"
                            step="0.1"
                            value={marcadoresEsmaecidosAte}
                            onInput={(evento) => {
                                const valor = Number(evento.currentTarget.value)
                                definirMarcadoresEsmaecidosAte(valor)
                                if (valor <= marcadoresPlenosAte) definirMarcadoresPlenosAte(Math.max(0.1, valor - 0.5))
                            }}
                        />
                    </div>
                    <p class="help">Dias por 100 px</p>
                </div>
            </div>

            <section
                class="lab-superficie lab-janela-temporal-dados"
                aria-labelledby="titulo-experimento-janela-temporal"
                style={{ maxWidth: `${largura}%` }}
            >
                <h3 class="title is-5" id="titulo-experimento-janela-temporal">Cenário controlado</h3>
                <p>{dias.length} dias preservados · {distribuicao}</p>
                <JanelaTemporal
                    key={`${chaveCenario}-${novaJornada}`}
                    id="janela-temporal-laboratorio"
                    dias={dias}
                    estadoInicial={estadoInicial}
                    inicializacaoPronta={inicializacaoPronta}
                    marcadoresPlenosAte={marcadoresPlenosAte}
                    marcadoresEsmaecidosAte={marcadoresEsmaecidosAte}
                    mostrarDiagnostico
                    aoAlterarPosicoes={guardarEstado}
                />
                <ol class="lab-janela-temporal-datas">
                    {mostrarDias.map((dia, indice) => <li key={`${dia}-${indice}`}>{dia === "…" ? dia : formatarDia(dia)}</li>)}
                </ol>
            </section>
            <div class="lab-janela-temporal-memoria">
                <label class="checkbox">
                    <input
                        type="checkbox"
                        checked={preservarPosicoes}
                        onChange={(evento) => alterarPreservacao(evento.currentTarget.checked)}
                    />
                    Preservar e restaurar posições e intervalo após recarregar esta sessão
                </label>
                <button class="button is-small mt-3" type="button" onClick={iniciarNovaJornada}>Iniciar nova jornada</button>
                {avisoMemoria && <p class="help" role="status">{avisoMemoria}</p>}
            </div>
        </section>
    )
}
