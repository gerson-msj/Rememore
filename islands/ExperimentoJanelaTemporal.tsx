import { useMemo, useState } from "preact/hooks"

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
    const [quantidade, definirQuantidade] = useState(5)
    const [distribuicao, definirDistribuicao] = useState<DistribuicaoDias>("irregulares")
    const [largura, definirLargura] = useState(100)
    const dias = useMemo(() => gerarDias(quantidade, distribuicao), [quantidade, distribuicao])
    const mostrarDias = dias.length <= 12 ? dias : [...dias.slice(0, 6), "…", ...dias.slice(-5)]

    return (
        <section class="lab-janela-temporal" aria-labelledby="titulo-experimento-janela-temporal">
            <div class="lab-controles">
                <div class="field">
                    <label class="label" for="janela-quantidade-dias">Quantidade de dias preservados</label>
                    <div class="control">
                        <select
                            class="select"
                            id="janela-quantidade-dias"
                            value={quantidade}
                            onChange={(evento) => definirQuantidade(Number(evento.currentTarget.value))}
                        >
                            {[2, 3, 4, 5, 10, 30, 100].map((valor) => <option key={valor} value={valor}>{valor}</option>)}
                        </select>
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
            </div>

            <section class="lab-superficie lab-janela-temporal-dados" aria-labelledby="titulo-experimento-janela-temporal">
                <h3 class="title is-5" id="titulo-experimento-janela-temporal">Cenário controlado</h3>
                <p>{dias.length} dias preservados · {distribuicao}</p>
                <ol class="lab-janela-temporal-datas" style={{ maxWidth: `${largura}%` }}>
                    {mostrarDias.map((dia, indice) => <li key={`${dia}-${indice}`}>{dia === "…" ? dia : formatarDia(dia)}</li>)}
                </ol>
            </section>
            <p class="help mt-3">CMP-008 será incorporado a esta área após a implementação do núcleo do componente.</p>
        </section>
    )
}
