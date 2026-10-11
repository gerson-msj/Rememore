import { useState } from "preact/hooks"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"

export const categoriasDemonstrativas = [
    { identificador: "convivencia", nome: "Convivência", representatividade: 1, tom: 82 },
    { identificador: "rituais", nome: "Pequenos rituais de manhã", representatividade: 0.64, tom: 28 },
    { identificador: "despedidas", nome: "Mudanças e despedidas", representatividade: 0.42, tom: -68 },
    { identificador: "viagens", nome: "Viagens", representatividade: 0.42, tom: 78 },
    { identificador: "trabalho", nome: "Trabalho", representatividade: 0.78, tom: 34 },
    {
        identificador: "tarde-longa",
        nome: "Uma conversa que começou depois do almoço e atravessou a tarde",
        representatividade: 0.08,
        tom: 34
    },
    { identificador: "saude", nome: "Saúde", representatividade: 0.025, tom: -8 },
    { identificador: "leituras", nome: "Leituras", representatividade: 0.2, tom: 0 },
    { identificador: "casa", nome: "Casa", representatividade: 0.2, tom: null }
] as const

export default function ExperimentoCategoriaPanorama() {
    const [nome, definirNome] = useState("Família")
    const [representatividade, definirRepresentatividade] = useState(0.72)
    const [tom, definirTom] = useState<number | null>(65)
    const [largura, definirLargura] = useState(480)
    const [selecionada, definirSelecionada] = useState<string | null>(null)

    return (
        <section class="experimento-categoria-panorama" aria-labelledby="titulo-categoria-panorama">
            <h3 class="title is-5" id="titulo-categoria-panorama">Componente isolado</h3>
            <p class="mb-4">
                Altere os dados de entrada e a largura para observar a categoria. Use Tab e Enter ou Espaço para conferir o foco e a
                seleção.
            </p>
            <div class="lab-grade mb-5">
                <div class="lab-controles">
                    <div class="field">
                        <label class="label" for="categoria-panorama-nome">Nome da categoria</label>
                        <input
                            class="input"
                            id="categoria-panorama-nome"
                            value={nome}
                            onInput={(evento) => definirNome(evento.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="categoria-panorama-representatividade">Representatividade</label>
                        <input
                            class="slider is-fullwidth"
                            id="categoria-panorama-representatividade"
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={representatividade}
                            onInput={(evento) => definirRepresentatividade(Number(evento.currentTarget.value))}
                        />
                        <p class="help">{Math.round(representatividade * 100)}% da largura disponível</p>
                    </div>
                    <div class="field">
                        <label class="label" for="categoria-panorama-tom">Tom agregado</label>
                        <div class="select is-fullwidth">
                            <select
                                id="categoria-panorama-tom"
                                value={tom === null ? "ausente" : String(tom)}
                                onChange={(evento) => {
                                    const valor = evento.currentTarget.value
                                    definirTom(valor === "ausente" ? null : Number(valor))
                                }}
                            >
                                <option value="ausente">Ausência de Tom</option>
                                <option value="-100">Negativo intenso (-100)</option>
                                <option value="-55">Negativo moderado (-55)</option>
                                <option value="0">Neutro (0)</option>
                                <option value="55">Positivo moderado (55)</option>
                                <option value="100">Positivo intenso (100)</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="categoria-panorama-largura">Largura disponível</label>
                        <input
                            class="slider is-fullwidth"
                            id="categoria-panorama-largura"
                            type="range"
                            min="20"
                            max="100"
                            step="1"
                            value={largura}
                            onInput={(evento) => definirLargura(Number(evento.currentTarget.value))}
                        />
                        <p class="help">{largura}% da largura da área disponível</p>
                    </div>
                </div>
                <div class="experimento-categoria-panorama-amostra" style={{ maxWidth: `${largura}%` }}>
                    <CategoriaPanorama
                        identificador="categoria-experimento"
                        nome={nome}
                        representatividade={representatividade}
                        tom={tom}
                        aoSelecionar={definirSelecionada}
                    />
                </div>
            </div>
            <p class="help" role="status" aria-live="polite">
                {selecionada === null
                    ? "Selecione a categoria para observar o retorno do identificador."
                    : `Identificador acionado: ${selecionada}`}
            </p>
        </section>
    )
}
