import { useEffect, useMemo, useState } from "preact/hooks"
import JanelaTemporal, { type CurvaRespostaSeletor } from "../components/JanelaTemporal.tsx"
import type { RespostaSeletor } from "../app/utilitarios/respostaSeletor.ts"
import { type EstadoJanelaTemporal, restaurarEstadoJanela } from "../app/utilitarios/janelaTemporal.ts"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import {
    avancarOrdenacaoPanorama,
    estadoInicialOrdenacaoPanorama,
    ordenarCategoriasPanorama
} from "../app/utilitarios/ordenacaoPanorama.ts"
import { categoriasDemonstrativas } from "./ExperimentoCategoriaPanorama.tsx"

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

export default function ExperimentoJanelaTemporal({ respostaSeletor, definirRespostaSeletor }: {
    respostaSeletor: RespostaSeletor
    definirRespostaSeletor: (resposta: RespostaSeletor) => void
}) {
    const [quantidadeTexto, definirQuantidadeTexto] = useState("5")
    const quantidadeInformada = Number.parseInt(quantidadeTexto, 10)
    const quantidade = Number.isInteger(quantidadeInformada) ? Math.max(2, quantidadeInformada) : 2
    const [distribuicao, definirDistribuicao] = useState<DistribuicaoDias>("irregulares")
    const [largura, definirLargura] = useState(100)
    const [simularLarguraMovel, definirSimularLarguraMovel] = useState(false)
    const [densidadeMaximaMarcadores, definirDensidadeMaximaMarcadores] = useState(7)
    const [preservarPosicoes, definirPreservarPosicoes] = useState(false)
    const [preferenciaLida, definirPreferenciaLida] = useState(false)
    const [chaveLida, definirChaveLida] = useState<string | null>(null)
    const [restauracao, definirRestauracao] = useState<{ chave: string; estado: EstadoJanelaTemporal } | null>(null)
    const [novaJornada, definirNovaJornada] = useState(0)
    const [avisoMemoria, definirAvisoMemoria] = useState("")
    const [ordenacao, definirOrdenacao] = useState(estadoInicialOrdenacaoPanorama)
    const [categoriaSelecionada, definirCategoriaSelecionada] = useState<string | null>(null)
    const [variacaoCenario, definirVariacaoCenario] = useState(0)
    const [simularMovimentoReduzido, definirSimularMovimentoReduzido] = useState(false)
    const [tomMedioDemonstrativo, definirTomMedioDemonstrativo] = useState<number | null>(35)
    const dias = useMemo(() => gerarDias(quantidade, distribuicao), [quantidade, distribuicao])
    const categoriasVariadas = useMemo(() =>
        categoriasDemonstrativas.map((categoria, indice) => {
            const intensidade = variacaoCenario / 100
            const fase = indice * 1.73 + intensidade * Math.PI * 2
            const representatividade = Math.max(0.025, Math.min(1, categoria.representatividade + Math.sin(fase) * intensidade * 0.24))
            const tom = categoria.tom === null
                ? null
                : Math.max(-100, Math.min(100, categoria.tom + Math.cos(fase * 1.3) * intensidade * 75))
            return { ...categoria, representatividade, tom }
        }), [variacaoCenario])
    const categoriasOrdenadas = useMemo(() => ordenarCategoriasPanorama(categoriasVariadas, ordenacao), [categoriasVariadas, ordenacao])
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
                    <label class="label" for="janela-limiar-marcadores">Densidade máxima dos marcadores</label>
                    <div class="control">
                        <input
                            class="input"
                            id="janela-limiar-marcadores"
                            type="number"
                            min="0.1"
                            max="40"
                            step="0.1"
                            value={densidadeMaximaMarcadores}
                            onInput={(evento) => definirDensidadeMaximaMarcadores(Number(evento.currentTarget.value))}
                        />
                    </div>
                    <p class="help">Dias por 100 px</p>
                </div>
                <div class="field">
                    <label class="label" for="janela-atraso-seletor">Atraso de resposta: {respostaSeletor.atrasoMs} ms</label>
                    <input
                        class="slider is-fullwidth"
                        id="janela-atraso-seletor"
                        type="range"
                        min="0"
                        max="2400"
                        step="10"
                        value={respostaSeletor.atrasoMs}
                        onInput={(evento) => definirRespostaSeletor({ ...respostaSeletor, atrasoMs: Number(evento.currentTarget.value) })}
                    />
                    <p class="help">
                        Tempo maior deixa as alças mais lentas; zero move imediatamente. Datas e categorias acompanham a posição efetiva da
                        janela. O Tom possui controles próprios de atraso e curva no experimento da escala.
                    </p>
                </div>
                <div class="field">
                    <label class="label" for="janela-curva-seletor">Curva de aproximação</label>
                    <div class="control">
                        <div class="select">
                            <select
                                id="janela-curva-seletor"
                                value={respostaSeletor.curva}
                                onChange={(evento) =>
                                    definirRespostaSeletor({
                                        ...respostaSeletor,
                                        curva: evento.currentTarget.value as CurvaRespostaSeletor
                                    })}
                            >
                                <option value="linear">Linear</option>
                                <option value="ease-in">Acelera ao longo do movimento</option>
                                <option value="ease-out">Desacelera ao se aproximar</option>
                                <option value="ease-in-out">Acelera e depois desacelera</option>
                            </select>
                        </div>
                    </div>
                </div>
                <label class="checkbox">
                    <input
                        type="checkbox"
                        checked={simularLarguraMovel}
                        onChange={(evento) => definirSimularLarguraMovel(evento.currentTarget.checked)}
                    />
                    Simular largura móvel (390 px)
                </label>
            </div>

            <section
                class="lab-superficie lab-janela-temporal-dados"
                aria-labelledby="titulo-experimento-janela-temporal"
                style={{ maxWidth: simularLarguraMovel ? "390px" : `${largura}%`, width: "100%" }}
            >
                <h3 class="title is-5" id="titulo-experimento-janela-temporal">Cenário controlado</h3>
                <p>{dias.length} dias preservados · {distribuicao}</p>
                <div class="field">
                    <label class="label" for="janela-tom-medio">
                        Tom médio da vista: {tomMedioDemonstrativo === null ? "Sem Tom" : tomMedioDemonstrativo}
                    </label>
                    <input
                        class="slider is-fullwidth"
                        id="janela-tom-medio"
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={tomMedioDemonstrativo ?? 0}
                        disabled={tomMedioDemonstrativo === null}
                        onInput={(evento) => definirTomMedioDemonstrativo(Number(evento.currentTarget.value))}
                    />
                    <label class="checkbox">
                        <input
                            type="checkbox"
                            checked={tomMedioDemonstrativo === null}
                            onChange={(evento) => definirTomMedioDemonstrativo(evento.currentTarget.checked ? null : 0)}
                        />
                        Vista sem categorias ou sem Tons definidos
                    </label>
                </div>
                <div class="lab-panorama-regiao-fixa">
                    <JanelaTemporal
                        key={`${chaveCenario}-${novaJornada}`}
                        id="janela-temporal-laboratorio"
                        dias={dias}
                        estadoInicial={estadoInicial}
                        inicializacaoPronta={inicializacaoPronta}
                        densidadeMaximaMarcadores={densidadeMaximaMarcadores}
                        respostaSeletor={respostaSeletor}
                        tomAparencia={tomMedioDemonstrativo}
                        movimentoReduzido={simularMovimentoReduzido}
                        mostrarDatasExtremas
                        aoAlterarPosicoes={guardarEstado}
                    />
                    <div class="panorama-ordenacao" role="group" aria-label="Ordenação das categorias">
                        <span>Ordenar por</span>
                        <div class="panorama-ordenacao-botoes">
                            <button
                                type="button"
                                class="panorama-ordenacao-opcao"
                                aria-pressed={ordenacao.criterio === "representatividade"}
                                aria-label={ordenacao.criterio === "representatividade"
                                    ? `Representatividade: ${
                                        ordenacao.ordemRepresentatividade === "decrescente" ? "maior primeiro" : "menor primeiro"
                                    }`
                                    : "Representatividade"}
                                onClick={() => definirOrdenacao((atual) => avancarOrdenacaoPanorama(atual, "representatividade"))}
                            >
                                Representatividade{ordenacao.criterio === "representatividade" && (
                                    <>
                                        {" "}
                                        <span class="panorama-ordenacao-sinal" aria-hidden="true">
                                            {ordenacao.ordemRepresentatividade === "decrescente" ? "+" : "−"}
                                        </span>
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                class="panorama-ordenacao-opcao"
                                aria-pressed={ordenacao.criterio === "tom"}
                                aria-label={ordenacao.criterio === "tom"
                                    ? ordenacao.ordemTom === "decrescente"
                                        ? "Tom: mais positivo primeiro"
                                        : ordenacao.ordemTom === "crescente"
                                        ? "Tom: mais negativo primeiro"
                                        : "Tom: Sem Tom primeiro"
                                    : "Tom"}
                                onClick={() => definirOrdenacao((atual) => avancarOrdenacaoPanorama(atual, "tom"))}
                            >
                                Tom{ordenacao.criterio === "tom" && (
                                    <>
                                        {" "}
                                        <span class="panorama-ordenacao-sinal" aria-hidden="true">
                                            {ordenacao.ordemTom === "decrescente" ? "+" : ordenacao.ordemTom === "crescente" ? "−" : "×"}
                                        </span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
                <section class="categorias-panorama-demonstracao" aria-labelledby="titulo-lista-categorias-panorama">
                    <h3 class="title is-5" id="titulo-lista-categorias-panorama">Composição demonstrativa</h3>
                    <p class="mb-4">
                        Varie os valores fictícios e a ordenação para observar poucas ou muitas categorias trocando de posição.
                    </p>
                    <div class="lab-controles">
                        <div class="field">
                            <label class="label" for="panorama-variacao-cenario">Variação dos valores de cenário</label>
                            <input
                                class="slider is-fullwidth"
                                id="panorama-variacao-cenario"
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={variacaoCenario}
                                onInput={(evento) => definirVariacaoCenario(Number(evento.currentTarget.value))}
                            />
                            <p class="help">{variacaoCenario}% · dados fictícios para provocar reordenações</p>
                        </div>
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                checked={simularMovimentoReduzido}
                                onChange={(evento) => definirSimularMovimentoReduzido(evento.currentTarget.checked)}
                            />
                            Simular movimento reduzido
                        </label>
                    </div>
                    <ul
                        class="categorias-panorama-lista"
                        data-movimento-reduzido={simularMovimentoReduzido}
                    >
                        {categoriasOrdenadas.map((categoria) => (
                            <li key={categoria.identificador} class="categoria-panorama-item">
                                <CategoriaPanorama
                                    identificador={categoria.identificador}
                                    nome={categoria.nome}
                                    representatividade={categoria.representatividade}
                                    tom={categoria.tom}
                                    aoSelecionar={definirCategoriaSelecionada}
                                />
                            </li>
                        ))}
                    </ul>
                    <p class="help" role="status" aria-live="polite">
                        {categoriaSelecionada === null ? "" : `Categoria acionada: ${categoriaSelecionada}`}
                    </p>
                </section>
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
