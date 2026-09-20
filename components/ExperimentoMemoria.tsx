import { useState } from "preact/hooks"

type Tema = "light" | "dark"
const modelos = [
    ["ampla", "Colorização ampla"],
    ["faixa-borda-sombra", "Faixa + borda + sombra"],
    ["faixa-borda", "Faixa + borda"],
    ["faixa-sombra", "Faixa + sombra"],
    ["borda", "Somente borda"],
    ["faixa", "Somente faixa"],
    ["faixa-categoria", "Faixa + categoria"]
] as const

type CoresTom = Record<Tema, { negativa: string; positiva: string }>

const sugestoes = [
    {
        nome: "Escolha inicial",
        descricao: "O par escolhido anteriormente, para referência.",
        light: { negativa: "#007bff", positiva: "#00ffaa" },
        dark: { negativa: "#cc0000", positiva: "#ffea00" }
    },
    {
        nome: "Ameixa e jade",
        descricao: "Violeta avermelhado e verde jade: uma combinação sóbria, com contraste entre os polos.",
        light: { negativa: "#945078", positiva: "#25836F" },
        dark: { negativa: "#D99AC3", positiva: "#79D5B7" }
    },
    {
        nome: "Ardósia e mel",
        descricao: "Azul acinzentado e dourado: do recolhimento ao acolhimento, com menos saturação.",
        light: { negativa: "#586D94", positiva: "#B17B22" },
        dark: { negativa: "#99B1DF", positiva: "#EBC779" }
    },
    {
        nome: "Terracota e petróleo",
        descricao: "Um polo quente e outro frio, em cores terrosas e contidas.",
        light: { negativa: "#B45F4D", positiva: "#237F88" },
        dark: { negativa: "#E99E89", positiva: "#79CBD1" }
    },
    {
        nome: "Índigo e damasco",
        descricao: "Azul violeta e laranja suave: uma alternativa mais expressiva e luminosa.",
        light: { negativa: "#6B5CA5", positiva: "#C27A3D" },
        dark: { negativa: "#B4A1EB", positiva: "#F1BF8F" }
    },
    {
        nome: "Rosa antigo e oliva",
        descricao: "Rosa e verde amarelado suaves, para uma aparência mais orgânica.",
        light: { negativa: "#A45F77", positiva: "#75833C" },
        dark: { negativa: "#DFA3B8", positiva: "#BECE87" }
    },
    {
        nome: "Orquídea e turquesa",
        descricao: "Magenta e turquesa mais vivos, para explorar uma presença cromática maior.",
        light: { negativa: "#AD469C", positiva: "#008B88" },
        dark: { negativa: "#E48AD3", positiva: "#5EDBCB" }
    }
]

export default function ExperimentoMemoria({ tema, cores, definirCores }: {
    tema: Tema
    cores: CoresTom
    definirCores: (cores: CoresTom) => void
}) {
    const [habilitado, definirHabilitado] = useState(true)
    const [tom, definirTom] = useState(65)
    const [texto, definirTexto] = useState(
        "Uma conversa demorada em família, o café ainda quente e a luz do fim da tarde entrando pela janela. Ficamos lembrando histórias antigas e rindo dos pequenos detalhes que cada um guardou daquele dia."
    )
    const [categoria, definirCategoria] = useState("Família")
    const [largura, definirLargura] = useState(480)
    const indiceSugestao = sugestoes.findIndex((sugestao) =>
        sugestao[tema].negativa.toLowerCase() === cores[tema].negativa.toLowerCase() &&
        sugestao[tema].positiva.toLowerCase() === cores[tema].positiva.toLowerCase()
    )
    const cor = tom < 0 ? cores[tema].negativa : cores[tema].positiva
    const estilo = {
        "--lab-tom-extremo": cor,
        "--lab-tom-peso": `${Math.abs(tom)}%`,
        "--lab-amostra-largura": `${largura}px`
    }
    return (
        <div class="lab-experimento-memoria" style={estilo}>
            <p class="mb-4">
                Compare as sete estratégias usando os mesmos dados. Estas amostras são experimentais; as cores iniciais são provisórias. A
                direção escolhida é a colorização ampla; as alternativas permanecem para comparação.
            </p>
            <div class="lab-grade mb-5">
                <div>
                    <div class="field">
                        <label class="checkbox">
                            <input
                                type="checkbox"
                                checked={habilitado}
                                onChange={(evento) => definirHabilitado(evento.currentTarget.checked)}
                            />{" "}
                            Tom informado
                        </label>
                    </div>
                    <div class="field">
                        <label class="label" for="lab-tom">Tom: {habilitado ? (tom > 0 ? `+${tom}` : tom) : "sem Tom"}</label>
                        <input
                            id="lab-tom"
                            type="range"
                            min={-100}
                            max={100}
                            step={1}
                            value={tom}
                            disabled={!habilitado}
                            onInput={(evento) => definirTom(Number(evento.currentTarget.value))}
                        />
                        <div class="buttons mt-2">
                            {[-100, -50, -1, 0, 1, 50, 100].map((valor) => (
                                <button
                                    type="button"
                                    class="button is-small"
                                    disabled={!habilitado}
                                    onClick={() => definirTom(valor)}
                                    key={valor}
                                >
                                    {valor > 0 ? `+${valor}` : valor}
                                </button>
                            ))}
                        </div>
                        <p class="help">
                            Tom informado em 0 mantém a faixa neutra nos modelos que usam faixa. Sem Tom remove toda a tonalização.
                        </p>
                    </div>
                    <fieldset class="field">
                        <legend class="label">Extremos do tema {tema === "light" ? "claro" : "escuro"}</legend>
                        <div class="field">
                            <label class="label" for="lab-combinacao-tom">
                                Combinações sugeridas — tema {tema === "light" ? "claro" : "escuro"}
                            </label>
                            <div class="select is-fullwidth">
                                <select
                                    id="lab-combinacao-tom"
                                    value={indiceSugestao}
                                    onChange={(evento) => {
                                        const sugestao = sugestoes[Number(evento.currentTarget.value)]
                                        if (sugestao) definirCores({ ...cores, [tema]: { ...sugestao[tema] } })
                                    }}
                                >
                                    <option value={-1} disabled>Personalizada</option>
                                    {sugestoes.map((sugestao, indice) => <option key={sugestao.nome} value={indice}>{sugestao.nome}
                                    </option>)}
                                </select>
                            </div>
                            <p class="help">
                                {indiceSugestao < 0 ? "Combinação ajustada manualmente." : sugestoes[indiceSugestao].descricao}
                            </p>
                            <p class="help">
                                O primeiro nome corresponde ao negativo; o segundo, ao positivo. Cada opção tem cores próprias para claro e
                                escuro. A escolha altera somente o tema ativo; os seletores abaixo continuam livres.
                            </p>
                        </div>
                        <div class="lab-linha-amostras">
                            {(["negativa", "positiva"] as const).map((polo) => (
                                <label key={polo}>
                                    Cor {polo}
                                    <input
                                        type="color"
                                        value={cores[tema][polo]}
                                        onInput={(evento) =>
                                            definirCores({ ...cores, [tema]: { ...cores[tema], [polo]: evento.currentTarget.value } })}
                                    />
                                    <code>{cores[tema][polo]}</code>
                                </label>
                            ))}
                        </div>
                        <p class="help">
                            Alterne o tema no primeiro bloco para calibrar o outro par. Estas cores ficam somente nesta abertura do
                            laboratório.
                        </p>
                    </fieldset>
                </div>
                <div>
                    <div class="field">
                        <label class="label" for="lab-memoria-texto">Texto comum às amostras</label>
                        <textarea
                            id="lab-memoria-texto"
                            class="textarea"
                            rows={3}
                            value={texto}
                            onInput={(evento) => definirTexto(evento.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="lab-memoria-categoria">Categoria (vazio para omitir)</label>
                        <input
                            id="lab-memoria-categoria"
                            class="input"
                            value={categoria}
                            onInput={(evento) => definirCategoria(evento.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="lab-memoria-largura">Largura máxima da amostra: {largura}px</label>
                        <input
                            id="lab-memoria-largura"
                            type="range"
                            min={220}
                            max={760}
                            step={10}
                            value={largura}
                            onInput={(evento) => definirLargura(Number(evento.currentTarget.value))}
                        />
                        <p class="help">A largura também se ajusta ao espaço disponível na janela.</p>
                    </div>
                </div>
            </div>
            <div class="lab-modelos-tom">
                {modelos.map(([modelo, titulo], indice) => (
                    <section key={modelo}>
                        <h3 class="title is-6">{indice + 1}. {titulo}</h3>
                        <div class={`lab-memoria-fake lab-tom-${modelo}${habilitado ? " lab-com-tom" : ""}`}>
                            {categoria && (
                                <div class="lab-memoria-legenda">
                                    <span title={categoria}>{categoria}</span>
                                </div>
                            )}
                            <div class="lab-memoria-previa">
                                <div>{texto}</div>
                            </div>
                        </div>
                    </section>
                ))}
            </div>
            <p class="help mt-4">
                A direção escolhida para o componente real é a colorização ampla com faixa desligada. As amostras preservam as faixas para
                comparação; os extremos de cor também se aplicam ao componente real no próximo bloco.
            </p>
        </div>
    )
}
