import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import OndaUtilizacaoCategoria from "../components/OndaUtilizacaoCategoria.tsx"
import VariacaoTomCategoria from "../components/VariacaoTomCategoria.tsx"
import { RESPOSTA_JANELA_PADRAO } from "../app/utilitarios/respostaSeletor.ts"
import { type EstadoPreparacaoRememorar, prepararDadosRememorar } from "../app/servicos/rememorar.ts"
import type { BlocoProjecaoRememorar } from "../app/servicos/local/projecaoRememorar.ts"
import type { EstadoJanelaTemporal, IntervaloJanela } from "../app/utilitarios/janelaTemporal.ts"
import { calcularTomMedioPanorama, type CategoriaPanoramaDerivada, derivarPanoramaRememorar } from "../app/utilitarios/panoramaRememorar.ts"
import { derivarSinteseCategoriaRememorar } from "../app/utilitarios/sinteseCategoriaRememorar.ts"
import { chaveJornadaRememorar, lerJornadaRememorar, serializarJornadaRememorar } from "../app/utilitarios/jornadaRememorar.ts"
import {
    avancarOrdenacaoPanorama,
    lerOrdenacaoPanorama,
    ORDENACAO_PANORAMA_PADRAO,
    type OrdenacaoPanorama,
    ordenarCategoriasPanorama,
    salvarOrdenacaoPanorama
} from "../app/utilitarios/ordenacaoPanorama.ts"
import {
    type CenarioRememorar,
    definirTonsForcadosRememorar,
    lerTonsForcadosRememorar,
    selecionarCenarioRememorar
} from "../app/servicos/rememorar/simulado.ts"

interface PropriedadesRememorar {
    accountId: string
    aoAtualizarCabecalho: (titulo: string, aoVoltar: () => void) => void
    aoRestaurarCabecalho: () => void
}

interface CategoriaPanoramaAnimada extends CategoriaPanoramaDerivada {
    animacao: "entrando" | "saindo" | null
}

function reconciliarCategoriasAnimadas(
    atuais: readonly CategoriaPanoramaAnimada[],
    desejadas: readonly CategoriaPanoramaDerivada[]
): CategoriaPanoramaAnimada[] {
    const idsDesejados = new Set(desejadas.map(({ identificador }) => identificador))
    const existentes = new Map(atuais.map((categoria) => [categoria.identificador, categoria] as const))
    const proximas: CategoriaPanoramaAnimada[] = desejadas.map((categoria) => {
        const existente = existentes.get(categoria.identificador)
        return {
            ...categoria,
            animacao: !existente || existente.animacao === "saindo" ? "entrando" : existente.animacao
        }
    })
    for (const categoria of atuais) {
        if (!idsDesejados.has(categoria.identificador)) {
            proximas.push(categoria.animacao === "saindo" ? categoria : { ...categoria, animacao: "saindo" })
        }
    }
    return proximas
}

export default function Rememorar({ accountId, aoAtualizarCabecalho, aoRestaurarCabecalho }: PropriedadesRememorar) {
    const [preparacao, definirPreparacao] = useState<EstadoPreparacaoRememorar | null>(null)
    const [intervalo, definirIntervalo] = useState<IntervaloJanela | null>(null)
    const [carregandoCenario, definirCarregandoCenario] = useState(false)
    const [tonsForcados, definirTonsForcados] = useState(false)
    const [geracaoJanela, definirGeracaoJanela] = useState(0)
    const [categoriasAnimadas, definirCategoriasAnimadas] = useState<CategoriaPanoramaAnimada[]>([])
    const [ordenacao, definirOrdenacao] = useState<OrdenacaoPanorama>(ORDENACAO_PANORAMA_PADRAO)
    const [contaPreferenciaLida, definirContaPreferenciaLida] = useState<string | null>(null)
    const [estadoPanorama, definirEstadoPanorama] = useState<EstadoJanelaTemporal | null>(null)
    const [categoriaSelecionada, definirCategoriaSelecionada] = useState<string | null>(null)
    const [estadoDetalhe, definirEstadoDetalhe] = useState<EstadoJanelaTemporal | null>(null)
    const [intervaloDetalhe, definirIntervaloDetalhe] = useState<IntervaloJanela | null>(null)
    const [contaJornadaRestaurada, definirContaJornadaRestaurada] = useState<string | null>(null)
    const callbacksCabecalho = useRef({ aoAtualizarCabecalho, aoRestaurarCabecalho })
    callbacksCabecalho.current = { aoAtualizarCabecalho, aoRestaurarCabecalho }

    useEffect(() => {
        definirOrdenacao(lerOrdenacaoPanorama(accountId))
        definirContaPreferenciaLida(accountId)
    }, [accountId])

    useEffect(() => definirTonsForcados(lerTonsForcadosRememorar()), [])

    useEffect(() => {
        if (contaPreferenciaLida === accountId) salvarOrdenacaoPanorama(accountId, ordenacao)
    }, [accountId, ordenacao, contaPreferenciaLida])

    useEffect(() => {
        let ativa = true
        void prepararDadosRememorar(accountId).then((resultado) => {
            if (ativa) definirPreparacao(resultado)
        })
        return () => {
            ativa = false
        }
    }, [accountId])

    const dadosProntos = preparacao?.projecao.status === "ready" && preparacao.catalogo.status === "ready"
    const dias = useMemo(() => dadosProntos ? [...new Set(preparacao.projecao.blocos.map((bloco) => bloco.data))].sort() : [], [
        dadosProntos,
        preparacao
    ])
    const blocosPorData = useMemo(() => {
        const indice = new Map<string, BlocoProjecaoRememorar[]>()
        if (dadosProntos) {
            for (const bloco of preparacao.projecao.blocos) {
                const blocosDaData = indice.get(bloco.data) ?? []
                blocosDaData.push(bloco)
                indice.set(bloco.data, blocosDaData)
            }
        }
        return indice
    }, [dadosProntos, preparacao])
    const categoriasDerivadas = useMemo(() => {
        if (!dadosProntos || !preparacao.catalogo.dados || !intervalo) return []
        return derivarPanoramaRememorar(
            dias,
            intervalo.primeiraPosicao,
            intervalo.ultimaPosicao,
            preparacao.projecao.blocos,
            preparacao.catalogo.dados,
            blocosPorData
        )
    }, [blocosPorData, dadosProntos, dias, intervalo, preparacao])
    const categorias = useMemo(
        () => ordenarCategoriasPanorama(categoriasDerivadas, ordenacao),
        [categoriasDerivadas, ordenacao]
    )
    const tomPanorama = useMemo(() => calcularTomMedioPanorama(categoriasDerivadas), [categoriasDerivadas])
    const sinteseDetalhe = useMemo(() => {
        return derivarSinteseCategoriaRememorar(
            accountId,
            categoriaSelecionada ?? "",
            dias,
            intervaloDetalhe,
            blocosPorData
        )
    }, [accountId, blocosPorData, categoriaSelecionada, dias, intervaloDetalhe])

    useEffect(() => {
        const catalogo = preparacao?.catalogo.dados
        if (!dadosProntos || !catalogo) return
        let valor: string | null = null
        try {
            const navegacao = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined
            if (navegacao?.type === "reload") valor = sessionStorage.getItem(chaveJornadaRememorar(accountId))
        } catch {
            valor = null
        }
        const jornada = lerJornadaRememorar(accountId, dias, valor)
        definirCategoriaSelecionada(null)
        definirIntervalo(null)
        definirEstadoPanorama(jornada?.estadoPanorama ?? null)
        definirEstadoDetalhe(null)
        definirIntervaloDetalhe(null)
        if (jornada?.tela === "detalhe" && jornada.categoria) {
            const categoria = catalogo.categorias.find(({ id }) => id === jornada.categoria)
            if (categoria) {
                definirCategoriaSelecionada(categoria.id)
                definirEstadoDetalhe(jornada.estadoDetalhe)
                callbacksCabecalho.current.aoAtualizarCabecalho(categoria.nome, voltarAoPanorama)
            }
        }
        definirContaJornadaRestaurada(accountId)
    }, [accountId, dadosProntos, dias, preparacao])

    useEffect(() => {
        if (contaJornadaRestaurada !== accountId || !dadosProntos) return
        const jornada = {
            tela: categoriaSelecionada ? "detalhe" as const : "panorama" as const,
            categoria: categoriaSelecionada,
            estadoPanorama,
            estadoDetalhe
        }
        try {
            sessionStorage.setItem(
                chaveJornadaRememorar(accountId),
                serializarJornadaRememorar(accountId, jornada)
            )
        } catch {
            // O estado em memória continua disponível se o navegador bloquear o armazenamento da sessão.
        }
    }, [accountId, categoriaSelecionada, contaJornadaRestaurada, dadosProntos, estadoDetalhe, estadoPanorama])

    useEffect(() => {
        definirCategoriasAnimadas((atuais) => reconciliarCategoriasAnimadas(atuais, categorias))
    }, [categorias])

    function finalizarAnimacaoCategoria(identificador: string, animacao: CategoriaPanoramaAnimada["animacao"]) {
        if (!animacao) return
        if (animacao === "saindo") {
            definirCategoriasAnimadas((atuais) => atuais.filter((categoria) => categoria.identificador !== identificador))
            return
        }
        definirCategoriasAnimadas((atuais) =>
            atuais.map((categoria) => categoria.identificador === identificador ? { ...categoria, animacao: null } : categoria)
        )
    }

    async function trocarCenario(quantidade: CenarioRememorar, forcarTons = tonsForcados) {
        if (carregandoCenario) return
        definirCarregandoCenario(true)
        definirTonsForcadosRememorar(forcarTons)
        selecionarCenarioRememorar(quantidade)
        try {
            const resultado = await prepararDadosRememorar(accountId)
            definirPreparacao(resultado)
            definirIntervalo(null)
            definirGeracaoJanela((atual) => atual + 1)
        } finally {
            definirCarregandoCenario(false)
        }
    }

    if (
        !dadosProntos || dias.length < 2 || contaPreferenciaLida !== accountId ||
        contaJornadaRestaurada !== accountId
    ) return null

    const direcaoAcessivel = ordenacao.criterio === "representatividade"
        ? ordenacao.direcao === "decrescente" ? "maior primeiro" : "menor primeiro"
        : ordenacao.direcao === "positivo"
        ? "mais positivo primeiro"
        : ordenacao.direcao === "negativo"
        ? "mais negativo primeiro"
        : "categorias sem Tom primeiro"

    function selecionarCriterio(criterio: OrdenacaoPanorama["criterio"]) {
        definirOrdenacao((atual) => avancarOrdenacaoPanorama(atual, criterio))
    }

    function abrirCategoria(identificador: string) {
        const estado = estadoPanorama ?? (intervalo
            ? {
                posicoes: {
                    esquerda: intervalo.primeiraPosicao / Math.max(1, dias.length - 1),
                    direita: intervalo.ultimaPosicao / Math.max(1, dias.length - 1)
                },
                intervaloValido: intervalo
            }
            : null)
        if (!estado) return
        definirEstadoPanorama(estado)
        definirEstadoDetalhe(estado)
        definirIntervaloDetalhe(estado.intervaloValido)
        definirCategoriaSelecionada(identificador)
        const nome = categoriasDerivadas.find((categoria) => categoria.identificador === identificador)?.nome ?? "Categoria"
        aoAtualizarCabecalho(nome, voltarAoPanorama)
    }

    function voltarAoPanorama() {
        aoRestaurarCabecalho()
        definirCategoriaSelecionada(null)
        definirEstadoDetalhe(null)
        definirIntervaloDetalhe(null)
    }

    if (categoriaSelecionada) {
        return (
            <section class="rememorar-detalhe-categoria">
                <div class="rememorar-detalhe-periodo-fixo">
                    <JanelaTemporal
                        id="janela-temporal-detalhe-categoria"
                        dias={dias}
                        estadoInicial={estadoDetalhe}
                        respostaSeletor={RESPOSTA_JANELA_PADRAO}
                        tomAparencia={sinteseDetalhe.tom}
                        mostrarDatasExtremas
                        aoAlterarIntervalo={definirIntervaloDetalhe}
                        aoAlterarPosicoes={definirEstadoDetalhe}
                    />
                </div>
                <div class="rememorar-detalhe-sinteses">
                    <OndaUtilizacaoCategoria serie={sinteseDetalhe.serie} tom={sinteseDetalhe.tom} />
                    <VariacaoTomCategoria tons={sinteseDetalhe.tons} />
                </div>
            </section>
        )
    }

    return (
        <>
            <div class="rememorar-regiao-fixa">
                <JanelaTemporal
                    respostaSeletor={RESPOSTA_JANELA_PADRAO}
                    key={geracaoJanela}
                    id="janela-temporal-rememorar"
                    dias={dias}
                    mostrarDatasExtremas
                    estadoInicial={estadoPanorama}
                    tomAparencia={tomPanorama}
                    aoAlterarIntervalo={definirIntervalo}
                    aoAlterarPosicoes={definirEstadoPanorama}
                />
                <div class="panorama-ordenacao" role="group" aria-label="Ordenação das categorias">
                    <span>Ordenar por</span>
                    <div class="panorama-ordenacao-botoes">
                        <button
                            class="panorama-ordenacao-opcao"
                            type="button"
                            aria-pressed={ordenacao.criterio === "representatividade"}
                            aria-label={`Representatividade, ${
                                ordenacao.criterio === "representatividade" ? direcaoAcessivel : "selecionar critério"
                            }`}
                            onClick={() => selecionarCriterio("representatividade")}
                        >
                            Representatividade{ordenacao.criterio === "representatividade" && (
                                <>
                                    {" "}
                                    <span class="panorama-ordenacao-sinal" aria-hidden="true">
                                        {ordenacao.direcao === "decrescente" ? "+" : "−"}
                                    </span>
                                </>
                            )}
                        </button>
                        <button
                            class="panorama-ordenacao-opcao"
                            type="button"
                            aria-pressed={ordenacao.criterio === "tom"}
                            aria-label={`Tom, ${ordenacao.criterio === "tom" ? direcaoAcessivel : "selecionar critério"}`}
                            onClick={() => selecionarCriterio("tom")}
                        >
                            Tom{ordenacao.criterio === "tom" && (
                                <>
                                    {" "}
                                    <span class="panorama-ordenacao-sinal" aria-hidden="true">
                                        {ordenacao.direcao === "positivo" ? "+" : ordenacao.direcao === "negativo" ? "−" : "×"}
                                    </span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            <ul class="categorias-panorama-lista">
                {categoriasAnimadas.map(({ animacao, ...categoria }) => (
                    <li
                        key={categoria.identificador}
                        class={`categoria-panorama-item${animacao ? ` categoria-panorama-item-${animacao}` : ""}`}
                        onAnimationEnd={() => finalizarAnimacaoCategoria(categoria.identificador, animacao)}
                    >
                        <CategoriaPanorama
                            identificador={categoria.identificador}
                            nome={categoria.nome}
                            representatividade={categoria.representatividade}
                            tom={categoria.tom}
                            aoSelecionar={abrirCategoria}
                        />
                    </li>
                ))}
            </ul>
            {import.meta.env?.DEV && (
                <div class="rememorar-cenarios" aria-label="Cenários de desenvolvimento">
                    {([2, 7, 30, 300] as const).map((quantidade) => (
                        <button
                            key={quantidade}
                            class="button is-small is-ghost"
                            type="button"
                            aria-pressed={dias.length === quantidade}
                            disabled={carregandoCenario}
                            onClick={() => void trocarCenario(quantidade)}
                        >
                            {quantidade} dias
                        </button>
                    ))}
                    <button
                        class="button is-small is-ghost"
                        type="button"
                        aria-pressed={tonsForcados}
                        disabled={carregandoCenario}
                        onClick={() => {
                            const novaForcagem = !tonsForcados
                            definirTonsForcados(novaForcagem)
                            void trocarCenario(dias.length as CenarioRememorar, novaForcagem)
                        }}
                    >
                        {tonsForcados ? "Tons de teste ativos: 7− / 30+" : "Forçar cores: 7− / 30+"}
                    </button>
                </div>
            )}
        </>
    )
}
