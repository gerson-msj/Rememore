import { useEffect, useMemo, useState } from "preact/hooks"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import JanelaTemporal from "../components/JanelaTemporal.tsx"
import { type EstadoPreparacaoRememorar, prepararDadosRememorar } from "../app/servicos/rememorar.ts"
import type { IntervaloJanela } from "../app/utilitarios/janelaTemporal.ts"
import { derivarPanoramaRememorar } from "../app/utilitarios/panoramaRememorar.ts"
import { type CenarioRememorar, selecionarCenarioRememorar } from "../app/servicos/rememorar/simulado.ts"

interface PropriedadesRememorar {
    accountId: string
}

export default function Rememorar({ accountId }: PropriedadesRememorar) {
    const [preparacao, definirPreparacao] = useState<EstadoPreparacaoRememorar | null>(null)
    const [intervalo, definirIntervalo] = useState<IntervaloJanela | null>(null)
    const [carregandoCenario, definirCarregandoCenario] = useState(false)
    const [geracaoJanela, definirGeracaoJanela] = useState(0)

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
                {categorias.map((categoria) => (
                    <li key={categoria.identificador}>
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
