import { useEffect, useMemo, useState } from "preact/hooks"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import { type EstadoPreparacaoRememorar, prepararDadosRememorar } from "../app/servicos/rememorar.ts"
import type { IntervaloJanela } from "../app/utilitarios/janelaTemporal.ts"
import { derivarPanoramaRememorar, type CategoriaPanoramaDerivada } from "../app/utilitarios/panoramaRememorar.ts"
import { type CenarioRememorar, selecionarCenarioRememorar } from "../app/servicos/rememorar/simulado.ts"

interface PropriedadesRememorar {
    accountId: string
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

export default function Rememorar({ accountId }: PropriedadesRememorar) {
    const [preparacao, definirPreparacao] = useState<EstadoPreparacaoRememorar | null>(null)
    const [intervalo, definirIntervalo] = useState<IntervaloJanela | null>(null)
    const [carregandoCenario, definirCarregandoCenario] = useState(false)
    const [geracaoJanela, definirGeracaoJanela] = useState(0)
    const [categoriasAnimadas, definirCategoriasAnimadas] = useState<CategoriaPanoramaAnimada[]>([])

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
    const categorias = useMemo(() => {
        if (!dadosProntos || !preparacao.catalogo.dados || !intervalo) return []
        return derivarPanoramaRememorar(
            dias,
            intervalo.primeiraPosicao,
            intervalo.ultimaPosicao,
            preparacao.projecao.blocos,
            preparacao.catalogo.dados
        )
    }, [dadosProntos, dias, intervalo, preparacao])

    useEffect(() => {
        definirCategoriasAnimadas((atuais) => reconciliarCategoriasAnimadas(atuais, categorias))
    }, [categorias])

    function finalizarAnimacaoCategoria(identificador: string, animacao: CategoriaPanoramaAnimada["animacao"]) {
        if (!animacao) return
        if (animacao === "saindo") {
            definirCategoriasAnimadas((atuais) => atuais.filter((categoria) => categoria.identificador !== identificador))
            return
        }
        definirCategoriasAnimadas((atuais) => atuais.map((categoria) => categoria.identificador === identificador
            ? { ...categoria, animacao: null }
            : categoria))
    }

    async function trocarCenario(quantidade: CenarioRememorar) {
        if (carregandoCenario) return
        definirCarregandoCenario(true)
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

    if (!dadosProntos || dias.length < 2) return null

    return (
        <>
            <JanelaTemporal
                key={geracaoJanela}
                id="janela-temporal-rememorar"
                dias={dias}
                aoAlterarIntervalo={definirIntervalo}
            />
            {import.meta.env?.DEV && (
                <div aria-label="Cenários de desenvolvimento">
                    {([2, 7, 30, 300] as const).map((quantidade) => (
                        <button
                            key={quantidade}
                            type="button"
                            aria-pressed={dias.length === quantidade}
                            disabled={carregandoCenario}
                            onClick={() => void trocarCenario(quantidade)}
                        >
                            {quantidade} dias
                        </button>
                    ))}
                </div>
            )}
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
                            aoSelecionar={() => {}}
                        />
                    </li>
                ))}
            </ul>
        </>
    )
}
