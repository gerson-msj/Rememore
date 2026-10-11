import { useMemo, useState } from "preact/hooks"
import { transformarTomVisual } from "../app/utilitarios/curvaTom.ts"
import CategoriaPanorama from "../components/CategoriaPanorama.tsx"
import Memoria from "../components/Memoria.tsx"

const tonsDeReferencia = [100, 80, 60, 40, 20, 10, 0, -10, -20, -40, -60, -80, -100]

function rotuloTom(tom: number | null): string {
    return tom === null ? "Sem Tom" : tom === 0 ? "Tom neutro (0)" : `Tom ${tom > 0 ? "+" : ""}${tom}`
}

export default function ExperimentoCurvaTom() {
    const [tomTeste, definirTomTeste] = useState(65)
    const [limiar, definirLimiar] = useState(20)
    const [intensidadeNoLimiar, definirIntensidadeNoLimiar] = useState(50)
    const curvaExperimental = useMemo(
        () => (tom: number | null) => transformarTomVisual(tom, limiar, intensidadeNoLimiar),
        [limiar, intensidadeNoLimiar]
    )

    function compararAmostras(transformarTom?: (tom: number | null) => number | null) {
        return (
            <>
                <section aria-label="Usos de Tom em componentes">
                    <h4 class="title is-6">Tom selecionado</h4>
                    <CategoriaPanorama
                        identificador="curva-tom-selecionada"
                        nome={rotuloTom(tomTeste)}
                        representatividade={0.72}
                        tom={tomTeste}
                        transformarTom={transformarTom}
                        aoSelecionar={() => {}}
                    />
                    <Memoria
                        conteudo={`Uma conversa em família avaliada como ${rotuloTom(tomTeste).toLowerCase()}.`}
                        categorias={["Família"]}
                        tom={tomTeste}
                        contexto="categorizar"
                        transformarTom={transformarTom}
                        aoAcionar={() => {}}
                    />
                </section>
                <section class="curva-tom-escala" aria-label="Amostras da escala no CMP-009">
                    <h4 class="title is-6">Escala do Tom no CMP-009</h4>
                    <ul class="categorias-panorama-lista">
                        {tonsDeReferencia.map((tom) => (
                            <li key={tom}>
                                <CategoriaPanorama
                                    identificador={`curva-${tom}`}
                                    nome={rotuloTom(tom)}
                                    representatividade={0.72}
                                    tom={tom}
                                    transformarTom={transformarTom}
                                    aoSelecionar={() => {}}
                                />
                            </li>
                        ))}
                    </ul>
                    <div class="curva-tom-ausencia">
                        <h5 class="title is-6">Tom ausente — fora da escala</h5>
                        <CategoriaPanorama
                            identificador="curva-ausente"
                            nome="Sem Tom"
                            representatividade={0.72}
                            tom={null}
                            transformarTom={transformarTom}
                            aoSelecionar={() => {}}
                        />
                        <Memoria
                            conteudo="Uma conversa em família sem Tom informado."
                            categorias={["Família"]}
                            tom={null}
                            contexto="categorizar"
                            transformarTom={transformarTom}
                            aoAcionar={() => {}}
                        />
                    </div>
                </section>
            </>
        )
    }

    return (
        <section class="experimento-curva-tom" aria-labelledby="titulo-experimento-curva-tom">
            <h3 class="title is-5" id="titulo-experimento-curva-tom">Curva cromática</h3>
            <p class="mb-4">
                Ajuste a curva e compare a aparência linear com a experimental. A transformação afeta somente as amostras visuais; o Tom
                funcional continua igual ao valor selecionado.
            </p>
            <div class="lab-controles">
                <div class="field">
                    <label class="label" for="curva-tom-seletor">Tom de teste</label>
                    <input
                        class="slider is-fullwidth"
                        id="curva-tom-seletor"
                        type="range"
                        min="-100"
                        max="100"
                        step="1"
                        value={tomTeste}
                        onInput={(evento) => definirTomTeste(Number(evento.currentTarget.value))}
                    />
                    <p class="help">{rotuloTom(tomTeste)}</p>
                </div>
                <div class="field">
                    <label class="label" for="curva-tom-limiar">Limiar: {limiar}</label>
                    <input
                        class="slider is-fullwidth"
                        id="curva-tom-limiar"
                        type="range"
                        min="1"
                        max="99"
                        step="1"
                        value={limiar}
                        onInput={(evento) => definirLimiar(Number(evento.currentTarget.value))}
                    />
                </div>
                <div class="field">
                    <label class="label" for="curva-tom-intensidade">Intensidade no limiar: {intensidadeNoLimiar}</label>
                    <input
                        class="slider is-fullwidth"
                        id="curva-tom-intensidade"
                        type="range"
                        min="0"
                        max="100"
                        step="1"
                        value={intensidadeNoLimiar}
                        onInput={(evento) => definirIntensidadeNoLimiar(Number(evento.currentTarget.value))}
                    />
                </div>
            </div>
            <div class="curva-tom-comparacao">
                <section aria-labelledby="curva-tom-linear-titulo">
                    <h3 class="title is-5" id="curva-tom-linear-titulo">Linear</h3>
                    <p class="help">Tom {limiar} → intensidade {limiar}</p>
                    {compararAmostras()}
                </section>
                <section aria-labelledby="curva-tom-experimental-titulo">
                    <h3 class="title is-5" id="curva-tom-experimental-titulo">Experimental</h3>
                    <p class="help">Tom {limiar} → intensidade {intensidadeNoLimiar}</p>
                    {compararAmostras(curvaExperimental)}
                </section>
            </div>
        </section>
    )
}
