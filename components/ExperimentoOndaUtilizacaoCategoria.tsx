import { useState } from "preact/hooks"
import OndaUtilizacaoCategoria from "./OndaUtilizacaoCategoria.tsx"
import OndaUtilizacaoCategoriaB from "./OndaUtilizacaoCategoriaB.tsx"
import { calcularOndaUtilizacaoCategoria, calcularOndaUtilizacaoCategoriaB } from "../app/utilitarios/ondaUtilizacaoCategoria.ts"

const cenarios = [
    { id: "sem-dados", nome: "Ausência de dados", serie: [] },
    { id: "unica", nome: "Uma ocorrência", serie: [5] },
    { id: "duas-subindo", nome: "Duas ocorrências em crescimento", serie: [1, 7] },
    { id: "duas-caindo", nome: "Duas ocorrências em queda", serie: [7, 1] },
    { id: "tres", nome: "Três ocorrências", serie: [2, 8, 5] },
    { id: "quatro", nome: "Quatro ocorrências", serie: [2, 8, 4, 10] },
    { id: "constante", nome: "Série constante", serie: [4, 4, 4, 4, 4, 4] },
    { id: "crescimento", nome: "Crescimento progressivo", serie: [1, 2, 3, 5, 8, 13] },
    { id: "queda", nome: "Queda progressiva", serie: [13, 8, 5, 3, 2, 1] },
    { id: "oscilacao", nome: "Oscilação", serie: [2, 9, 3, 8, 2, 7, 3] },
    { id: "pico", nome: "Pico isolado em série longa", serie: [2, 3, 4, 5, 40, 5, 4, 3, 2, 3, 4, 5, 6] },
    {
        id: "referencia",
        nome: "Série longa — referência da planilha",
        serie: [1, 2, 3, 2, 20, 5, 6, 7, 6, 8, 9, 8, 11, 10, 12, 14, 15]
    },
    { id: "zeros", nome: "Dias sem ocorrência intercalados", serie: [3, 0, 7, 0, 4] }
] as const

export default function ExperimentoOndaUtilizacaoCategoria() {
    const [cenarioId, definirCenarioId] = useState<string>(cenarios[0].id)
    const [tom, definirTom] = useState<number | null>(65)
    const [largura, definirLargura] = useState(560)
    const cenario = cenarios.find(({ id }) => id === cenarioId) ?? cenarios[0]
    const resultado = calcularOndaUtilizacaoCategoria(cenario.serie)
    const resultadoB = calcularOndaUtilizacaoCategoriaB(cenario.serie)

    return (
        <section class="experimento-onda-utilizacao" aria-labelledby="titulo-onda-utilizacao">
            <h3 class="title is-5" id="titulo-onda-utilizacao">Componente isolado</h3>
            <p class="mb-4">Escolha uma série e ajuste o Tom e a largura para observar a onda nos temas claro e escuro.</p>
            <div class="lab-controles mb-5">
                <div class="field">
                    <label class="label" for="onda-utilizacao-cenario">Série determinística</label>
                    <div class="select is-fullwidth">
                        <select
                            id="onda-utilizacao-cenario"
                            value={cenarioId}
                            onChange={(evento) => definirCenarioId(evento.currentTarget.value)}
                        >
                            {cenarios.map(({ id, nome }) => <option key={id} value={id}>{nome}</option>)}
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label" for="onda-utilizacao-tom">Tom fornecido</label>
                    <div class="select is-fullwidth">
                        <select
                            id="onda-utilizacao-tom"
                            value={tom === null ? "nulo" : String(tom)}
                            onChange={(evento) => {
                                const valor = evento.currentTarget.value
                                definirTom(valor === "nulo" ? null : Number(valor))
                            }}
                        >
                            <option value="65">Positivo (+65)</option>
                            <option value="-65">Negativo (-65)</option>
                            <option value="0">Tom 0</option>
                            <option value="nulo">Tom nulo</option>
                        </select>
                    </div>
                </div>
                <div class="field">
                    <label class="label" for="onda-utilizacao-largura">Largura máxima: {largura}px</label>
                    <input
                        class="slider is-fullwidth"
                        id="onda-utilizacao-largura"
                        type="range"
                        min="120"
                        max="900"
                        step="10"
                        value={largura}
                        onInput={(evento) => definirLargura(Number(evento.currentTarget.value))}
                    />
                </div>
            </div>
            <section class="experimento-onda-utilizacao-comparacao" aria-label="Comparação das versões CMP-011">
                <div class="experimento-onda-utilizacao-amostra" style={{ maxWidth: `${largura}px` }}>
                    <h4 class="title is-6">CMP-011 — quatro pontos</h4>
                    <OndaUtilizacaoCategoria serie={cenario.serie} tom={tom} />
                </div>
                <div class="experimento-onda-utilizacao-amostra" style={{ maxWidth: `${largura}px` }}>
                    <h4 class="title is-6">CMP-011-B — sete pontos (validação visual)</h4>
                    <OndaUtilizacaoCategoriaB serie={cenario.serie} tom={tom} />
                </div>
            </section>
            <dl class="experimento-onda-utilizacao-diagnostico mt-4">
                <div>
                    <dt>Série de origem</dt>
                    <dd>{resultado.serie.length ? `[${resultado.serie.join(", ")}]` : "Sem ocorrências"}</dd>
                </div>
                <div>
                    <dt>Valores amostrados por CMP-011 (quatro)</dt>
                    <dd>[{resultado.valoresAmostrados.map((valor) => Number(valor.toFixed(3))).join(", ")}]</dd>
                </div>
                <div>
                    <dt>Valores amostrados por CMP-011-B (sete)</dt>
                    <dd>[{resultadoB.valoresAmostrados.map((valor) => Number(valor.toFixed(3))).join(", ")}]</dd>
                </div>
            </dl>
        </section>
    )
}
