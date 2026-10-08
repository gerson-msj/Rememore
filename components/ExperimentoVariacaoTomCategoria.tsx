import { useState } from "preact/hooks"
import OndaUtilizacaoCategoria from "./OndaUtilizacaoCategoria.tsx"
import VariacaoTomCategoria from "./VariacaoTomCategoria.tsx"
import { calcularVariacaoTomCategoria } from "../app/utilitarios/variacaoTomCategoria.ts"

const cenarios: { id: string; nome: string; tons: readonly (number | null)[] }[] = [
    { id: "nenhum", nome: "Nenhum Tom", tons: [] },
    { id: "zero", nome: "Somente Tom 0", tons: [0] },
    { id: "negativo", nome: "Somente um Tom negativo", tons: [-65] },
    { id: "positivo", nome: "Somente um Tom positivo", tons: [65] },
    { id: "negativos", nome: "Vários negativos", tons: [-80, -20, -50] },
    { id: "positivos", nome: "Vários positivos", tons: [20, 60, 90] },
    { id: "equilibrados", nome: "Negativos e positivos equilibrados", tons: [-60, -40, 40, 60] },
    { id: "negativos-fortes", nome: "Negativos fortes e positivos leves", tons: [-90, -70, 10, 20] },
    { id: "positivos-fortes", nome: "Negativos leves e positivos fortes", tons: [-10, -20, 70, 90] },
    { id: "extremos", nome: "Extremos −100 e +100", tons: [-100, 100] },
    { id: "centro", nome: "Valores próximos ao centro", tons: [-2, -8, 3, 9] },
    { id: "nulos", nome: "Mistura com Tons nulos", tons: [-30, null, 50, null] },
    { id: "completo", nome: "Negativo, zero, positivo e nulo", tons: [-70, 0, 45, null] },
    { id: "troca", nome: "Troca brusca de predominância", tons: [-90, -80, 10, 20] },
    { id: "sem-tom", nome: "Mudança para estado sem Tom", tons: [null, null] },
    { id: "neutro", nome: "Mudança para apenas neutro", tons: [0, 0] }
]

export default function ExperimentoVariacaoTomCategoria() {
    const [cenarioId, definirCenarioId] = useState(cenarios[0].id)
    const [largura, definirLargura] = useState(560)
    const cenario = cenarios.find(({ id }) => id === cenarioId) ?? cenarios[0]
    const resultado = calcularVariacaoTomCategoria(cenario.tons)
    const serieComparativa = [2, 8, 4, 10]

    return (
        <section class="experimento-variacao-tom" aria-labelledby="titulo-variacao-tom">
            <p class="mb-4">Explore os cenários e a largura. O tema segue a seleção de tema do laboratório.</p>
            <div class="lab-controles mb-5">
                <div class="field">
                    <label class="label" for="variacao-tom-cenario">Conjunto determinístico</label>
                    <div class="select is-fullwidth">
                        <select
                            id="variacao-tom-cenario"
                            value={cenarioId}
                            onChange={(evento) => definirCenarioId(evento.currentTarget.value)}
                        >
                            {cenarios.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label" for="variacao-tom-largura">Largura máxima: {largura}px</label>
                    <input
                        class="slider is-fullwidth"
                        id="variacao-tom-largura"
                        type="range"
                        min="120"
                        max="900"
                        step="10"
                        value={largura}
                        onInput={(evento) => definirLargura(Number(evento.currentTarget.value))}
                    />
                </div>
            </div>
            <section class="experimento-variacao-comparacao" aria-label="Comparação de CMP-011 e CMP-012">
                <div class="experimento-variacao-amostra" style={{ maxWidth: `${largura}px` }}>
                    <h3 class="title is-6">CMP-011 — Onda de Utilização da Categoria</h3>
                    <OndaUtilizacaoCategoria
                        serie={serieComparativa}
                        tom={resultado.possuiTomDefinido ? resultado.mediaPositiva ?? resultado.mediaNegativa : null}
                    />
                </div>
                <div class="experimento-variacao-amostra" style={{ maxWidth: `${largura}px` }}>
                    <h3 class="title is-6" id="titulo-variacao-tom">CMP-012 — Variação do Tom da Categoria</h3>
                    <VariacaoTomCategoria tons={cenario.tons} />
                </div>
            </section>
            <dl class="experimento-variacao-diagnostico mt-4">
                <div>
                    <dt>Tons de origem</dt>
                    <dd>
                        {cenario.tons.length ? `[${cenario.tons.map((tom) => tom === null ? "nulo" : tom).join(", ")}]` : "Conjunto vazio"}
                    </dd>
                </div>
                <div>
                    <dt>Média negativa</dt>
                    <dd>{resultado.mediaNegativa === null ? "Sem extensão" : resultado.mediaNegativa.toFixed(2)}</dd>
                </div>
                <div>
                    <dt>Média positiva</dt>
                    <dd>{resultado.mediaPositiva === null ? "Sem extensão" : resultado.mediaPositiva.toFixed(2)}</dd>
                </div>
                <div>
                    <dt>Tom definido</dt>
                    <dd>{resultado.possuiTomDefinido ? `Sim (${resultado.quantidadeDefinida})` : "Não"}</dd>
                </div>
            </dl>
        </section>
    )
}
