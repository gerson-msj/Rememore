import { useEffect, useMemo, useRef, useState } from "preact/hooks"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import ListaMemoriasCategoria from "../components/ListaMemoriasCategoria.tsx"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import OndaUtilizacaoCategoria from "../components/OndaUtilizacaoCategoria.tsx"
import VariacaoTomCategoria from "../components/VariacaoTomCategoria.tsx"
import { RESPOSTA_JANELA_PADRAO } from "../app/utilitarios/respostaSeletor.ts"
import { type EstadoPreparacaoRememorar, prepararDadosRememorar } from "../app/servicos/rememorar.ts"
import { consultaMemoriasRememorar } from "../app/servicos/rememorar/consultaMemorias.ts"
import {
    type ConsultaMemoriasEmCache,
    memoriasRememorarLocal,
    type PontoLeituraMemoriasRememorar
} from "../app/servicos/local/memoriasRememorar.ts"
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

function criarIdentidadeConsulta(
    idConta: string,
    idJornada: string,
    idCategoria: string,
    intervalo: IntervaloJanela
): string {
    return JSON.stringify([idConta, idJornada, idCategoria, intervalo.primeiroDia, intervalo.ultimoDia, "data-ordem-id"])
}

function mesmoIntervalo(a: IntervaloJanela | null, b: IntervaloJanela | null): boolean {
    return a?.primeiraPosicao === b?.primeiraPosicao && a?.ultimaPosicao === b?.ultimaPosicao
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
    const [intervaloConfirmado, definirIntervaloConfirmado] = useState<IntervaloJanela | null>(null)
    const [intervaloGraficos, definirIntervaloGraficos] = useState<IntervaloJanela | null>(null)
    const [idConsultaAguardandoVisual, definirIdConsultaAguardandoVisual] = useState<string | null>(null)
    const [idJornada, definirIdJornada] = useState<string>(() => crypto.randomUUID())
    const [contaJornadaRestaurada, definirContaJornadaRestaurada] = useState<string | null>(null)
    const [cacheLista, definirCacheLista] = useState<ConsultaMemoriasEmCache | null>(null)
    const [carregandoLista, definirCarregandoLista] = useState(false)
    const [erroLista, definirErroLista] = useState<string | null>(null)
    const [mostrarVoltarAoTopo, definirMostrarVoltarAoTopo] = useState(false)
    const [restaurandoRolagem, definirRestaurandoRolagem] = useState(false)
    const [tentativaConsulta, definirTentativaConsulta] = useState(0)
    const cacheListaRef = useRef(cacheLista)
    cacheListaRef.current = cacheLista
    const consultaAtivaRef = useRef<string | null>(null)
    const controladorConsultaRef = useRef<AbortController | null>(null)
    const pedidoAtivoRef = useRef<string | null>(null)
    const restauracaoPendenteRef = useRef<{ idConsulta: string; ponto: PontoLeituraMemoriasRememorar } | null>(null)
    const requisitarLoteRef = useRef<
        (
            idConsulta: string,
            intervalo: IntervaloJanela,
            categoria: string,
            offset: number
        ) => Promise<void>
    >(async () => {})
    const idConsulta = categoriaSelecionada && intervaloConfirmado
        ? criarIdentidadeConsulta(accountId, idJornada, categoriaSelecionada, intervaloConfirmado)
        : null
    consultaAtivaRef.current = idConsulta
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
            intervaloGraficos,
            blocosPorData
        )
    }, [accountId, blocosPorData, categoriaSelecionada, dias, intervaloGraficos])

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
        definirIdJornada(jornada?.idJornada ?? crypto.randomUUID())
        definirCategoriaSelecionada(null)
        definirIntervalo(null)
        definirIntervaloConfirmado(null)
        definirIntervaloGraficos(null)
        definirIdConsultaAguardandoVisual(null)
        definirEstadoPanorama(jornada?.estadoPanorama ?? null)
        definirEstadoDetalhe(null)
        definirIntervaloDetalhe(null)
        if (jornada?.tela === "detalhe" && jornada.categoria) {
            const categoria = catalogo.categorias.find(({ id }) => id === jornada.categoria)
            if (categoria) {
                definirCategoriaSelecionada(categoria.id)
                definirEstadoDetalhe(jornada.estadoDetalhe)
                definirIntervaloDetalhe(jornada.estadoDetalhe!.intervaloValido)
                definirIntervaloConfirmado(jornada.estadoDetalhe!.intervaloValido)
                definirIntervaloGraficos(jornada.estadoDetalhe!.intervaloValido)
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
            idJornada,
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
    }, [accountId, categoriaSelecionada, contaJornadaRestaurada, dadosProntos, estadoDetalhe, estadoPanorama, idJornada])

    requisitarLoteRef.current = async (consultaId, intervalo, categoria, offset) => {
        const controlador = controladorConsultaRef.current
        if (!controlador || controlador.signal.aborted || consultaAtivaRef.current !== consultaId) return
        const chavePedido = `${consultaId}:${offset}`
        if (pedidoAtivoRef.current) return
        pedidoAtivoRef.current = chavePedido
        definirCarregandoLista(true)
        definirErroLista(null)
        try {
            const lote = await consultaMemoriasRememorar.consultar({
                idConta: accountId,
                idCategoria: categoria,
                primeiroDia: intervalo.primeiroDia,
                ultimoDia: intervalo.ultimoDia,
                offset,
                signal: controlador.signal
            })
            if (controlador.signal.aborted || consultaAtivaRef.current !== consultaId) return
            const anexado = await memoriasRememorarLocal.anexarLote(accountId, consultaId, offset, lote)
            if (!anexado) return
            const recuperada = await memoriasRememorarLocal.obter(accountId)
            if (!controlador.signal.aborted && consultaAtivaRef.current === consultaId && recuperada?.idConsulta === consultaId) {
                definirCacheLista(recuperada)
                definirCarregandoLista(false)
            }
        } catch (causa) {
            if (!controlador.signal.aborted && consultaAtivaRef.current === consultaId) {
                definirErroLista(
                    causa instanceof Error && causa.message === "Consulta de memórias simulada indisponível" ? "consulta" : "armazenamento"
                )
                definirCarregandoLista(false)
            }
        } finally {
            if (pedidoAtivoRef.current === chavePedido) pedidoAtivoRef.current = null
        }
    }

    useEffect(() => {
        if (!idConsulta || !categoriaSelecionada || !intervaloConfirmado) return
        const idConsultaAtiva = idConsulta
        const controlador = new AbortController()
        controladorConsultaRef.current?.abort()
        controladorConsultaRef.current = controlador
        pedidoAtivoRef.current = null
        definirCacheLista(null)
        definirCarregandoLista(true)
        definirErroLista(null)
        const intervalo = intervaloConfirmado
        const categoria = categoriaSelecionada

        async function prepararConsulta() {
            try {
                const cache = await memoriasRememorarLocal.obter(accountId)
                if (controlador.signal.aborted || consultaAtivaRef.current !== idConsultaAtiva) return
                if (cache?.idConsulta === idConsultaAtiva) {
                    definirCacheLista(cache)
                    definirCarregandoLista(false)
                    restauracaoPendenteRef.current = cache.memorias.length > 0
                        ? { idConsulta: idConsultaAtiva, ponto: cache.pontoLeitura }
                        : null
                    if (cache.lotesCompletos === 0 && !cache.fim && cache.proximoOffset !== null) {
                        await requisitarLoteRef.current(idConsultaAtiva, intervalo, categoria, cache.proximoOffset)
                    }
                    return
                }
                const vazio: ConsultaMemoriasEmCache = {
                    idConta: accountId,
                    idJornada,
                    idConsulta: idConsultaAtiva,
                    idCategoria: categoria,
                    primeiroDia: intervalo.primeiroDia,
                    ultimoDia: intervalo.ultimoDia,
                    ordenacao: "data-ordem-id",
                    memorias: [],
                    lotesCompletos: 0,
                    registrosCobertos: 0,
                    proximoOffset: 0,
                    total: null,
                    fim: false,
                    pontoLeitura: { idMemoria: null, deslocamentoPx: 0, rolagemY: 0 }
                }
                restauracaoPendenteRef.current = null
                await memoriasRememorarLocal.iniciar(vazio)
                if (controlador.signal.aborted || consultaAtivaRef.current !== idConsultaAtiva) return
                definirCacheLista(vazio)
                await requisitarLoteRef.current(idConsultaAtiva, intervalo, categoria, 0)
            } catch {
                if (!controlador.signal.aborted && consultaAtivaRef.current === idConsultaAtiva) {
                    definirErroLista("armazenamento")
                    definirCarregandoLista(false)
                }
            }
        }
        void prepararConsulta()
        return () => controlador.abort()
    }, [accountId, categoriaSelecionada, idConsulta, idJornada, intervaloConfirmado, tentativaConsulta])

    useEffect(() => {
        if (!idConsulta || cacheLista?.idConsulta !== idConsulta || !restauracaoPendenteRef.current) return
        const pendente = restauracaoPendenteRef.current
        if (pendente.idConsulta !== idConsulta || idConsultaAguardandoVisual === idConsulta) return
        if (!mesmoIntervalo(intervaloDetalhe, intervaloConfirmado)) return
        definirRestaurandoRolagem(true)
        const quadro = requestAnimationFrame(() => {
            const ponto = pendente.ponto
            const cabecalho = document.querySelector<HTMLElement>(".cabecalho-pagina")
            const alturaCabecalho = cabecalho?.getBoundingClientRect().height ?? 72
            const alvo = ponto.idMemoria
                ? [...document.querySelectorAll<HTMLElement>("[data-memoria-id]")]
                    .find((elemento) => elemento.dataset.memoriaId === ponto.idMemoria)
                : null
            if (alvo) {
                const topoDesejado = alturaCabecalho + ponto.deslocamentoPx
                globalThis.scrollTo({ top: Math.max(0, globalThis.scrollY + alvo.getBoundingClientRect().top - topoDesejado) })
            } else globalThis.scrollTo({ top: ponto.rolagemY })
            requestAnimationFrame(() => {
                restauracaoPendenteRef.current = null
                definirRestaurandoRolagem(false)
            })
        })
        return () => cancelAnimationFrame(quadro)
    }, [cacheLista, idConsulta, idConsultaAguardandoVisual, intervaloConfirmado, intervaloDetalhe])

    useEffect(() => {
        if (!idConsulta || cacheLista?.idConsulta !== idConsulta) return
        let temporizador: number | undefined
        const capturarPonto = (): PontoLeituraMemoriasRememorar => {
            const cabecalho = document.querySelector<HTMLElement>(".cabecalho-pagina")
            const alturaCabecalho = cabecalho?.getBoundingClientRect().height ?? 72
            const itens = [...document.querySelectorAll<HTMLElement>("[data-memoria-id]")]
            const visivel = itens.find((elemento) => elemento.getBoundingClientRect().bottom > alturaCabecalho)
            return {
                idMemoria: visivel?.dataset.memoriaId ?? null,
                deslocamentoPx: visivel ? visivel.getBoundingClientRect().top - alturaCabecalho : 0,
                rolagemY: globalThis.scrollY
            }
        }
        const salvarPonto = () => {
            if (temporizador !== undefined) clearTimeout(temporizador)
            temporizador = globalThis.setTimeout(() => {
                void memoriasRememorarLocal.salvarPonto(accountId, idConsulta, capturarPonto()).catch(() => {})
            }, 220)
        }
        const salvarAntesDeSair = () => {
            if (temporizador !== undefined) clearTimeout(temporizador)
            void memoriasRememorarLocal.salvarPonto(accountId, idConsulta, capturarPonto()).catch(() => {})
        }
        const atualizarRolagem = () => {
            definirMostrarVoltarAoTopo(globalThis.scrollY > globalThis.innerHeight * 0.6)
            salvarPonto()
        }
        globalThis.addEventListener("scroll", atualizarRolagem, { passive: true })
        globalThis.addEventListener("pagehide", salvarAntesDeSair)
        atualizarRolagem()
        return () => {
            globalThis.removeEventListener("scroll", atualizarRolagem)
            globalThis.removeEventListener("pagehide", salvarAntesDeSair)
            if (temporizador !== undefined) clearTimeout(temporizador)
        }
    }, [accountId, cacheLista?.idConsulta, idConsulta])

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

    function prepararConsultaNoAlvo(intervalo: IntervaloJanela) {
        if (mesmoIntervalo(intervaloConfirmado, intervalo)) return
        if (categoriaSelecionada) {
            definirIdConsultaAguardandoVisual(criarIdentidadeConsulta(accountId, idJornada, categoriaSelecionada, intervalo))
            definirMostrarVoltarAoTopo(false)
            globalThis.scrollTo({ top: 0 })
        }
    }

    function atualizarGraficosAoAlcancarAlvo(intervalo: IntervaloJanela) {
        definirIntervaloGraficos(intervalo)
        definirIntervaloConfirmado(intervalo)
        const consultaAlcancada = categoriaSelecionada
            ? criarIdentidadeConsulta(accountId, idJornada, categoriaSelecionada, intervalo)
            : null
        definirIdConsultaAguardandoVisual((atual) => atual === consultaAlcancada ? null : atual)
    }

    function carregarProximoLote() {
        const cache = cacheListaRef.current
        if (!idConsulta || !intervaloConfirmado || !categoriaSelecionada || !cache || cache.idConsulta !== idConsulta) return
        if (cache.proximoOffset === null || cache.fim) return
        void requisitarLoteRef.current(idConsulta, intervaloConfirmado, categoriaSelecionada, cache.proximoOffset)
    }

    function tentarNovamente() {
        const cache = cacheListaRef.current
        if (idConsulta && intervaloConfirmado && categoriaSelecionada && cache?.idConsulta === idConsulta) {
            const offset = cache.fim ? null : cache.proximoOffset ?? 0
            if (offset !== null) void requisitarLoteRef.current(idConsulta, intervaloConfirmado, categoriaSelecionada, offset)
            return
        }
        definirTentativaConsulta((atual) => atual + 1)
    }

    function voltarAoTopoDaPagina() {
        const movimentoReduzido = typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches
        globalThis.scrollTo({ top: 0, behavior: movimentoReduzido ? "auto" : "smooth" })
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
        definirIntervaloConfirmado(estado.intervaloValido)
        definirIntervaloGraficos(estado.intervaloValido)
        definirIdConsultaAguardandoVisual(null)
        definirCategoriaSelecionada(identificador)
        globalThis.scrollTo({ top: 0 })
        const nome = categoriasDerivadas.find((categoria) => categoria.identificador === identificador)?.nome ?? "Categoria"
        aoAtualizarCabecalho(nome, voltarAoPanorama)
    }

    function voltarAoPanorama() {
        aoRestaurarCabecalho()
        definirCategoriaSelecionada(null)
        definirEstadoDetalhe(null)
        definirIntervaloDetalhe(null)
        definirIntervaloConfirmado(null)
        definirIntervaloGraficos(null)
        definirIdConsultaAguardandoVisual(null)
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
                        aoConcluirAlteracao={prepararConsultaNoAlvo}
                        aoAlcancarAlvoLiberado={atualizarGraficosAoAlcancarAlvo}
                    />
                </div>
                <div class="rememorar-detalhe-sinteses">
                    <OndaUtilizacaoCategoria serie={sinteseDetalhe.serie} tom={sinteseDetalhe.tom} />
                    <VariacaoTomCategoria tons={sinteseDetalhe.tons} />
                </div>
                <ListaMemoriasCategoria
                    memorias={cacheLista?.idConsulta === idConsulta && idConsultaAguardandoVisual === null ? cacheLista.memorias : []}
                    carregando={carregandoLista || idConsultaAguardandoVisual !== null}
                    erro={cacheLista?.idConsulta === idConsulta && idConsultaAguardandoVisual === null
                        ? erroLista ? "Não foi possível carregar as memórias." : null
                        : null}
                    fim={cacheLista?.idConsulta === idConsulta && idConsultaAguardandoVisual === null && cacheLista.fim}
                    houveCargaIncremental={(cacheLista?.idConsulta === idConsulta && cacheLista.lotesCompletos > 1) ?? false}
                    pausarAvanco={restaurandoRolagem}
                    mostrarVoltarAoTopo={mostrarVoltarAoTopo}
                    aoCarregarProximo={carregarProximoLote}
                    aoTentarNovamente={tentarNovamente}
                    aoVoltarAoTopo={voltarAoTopoDaPagina}
                />
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
