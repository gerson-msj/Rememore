import { useState } from "preact/hooks"
import Memoria, { type ContextoMemoria } from "./Memoria.tsx"

export default function MemoriaLaboratorio() {
    const [contexto, definirContexto] = useState<ContextoMemoria>("registrar")
    const [texto, definirTexto] = useState("Uma conversa em família no fim da tarde.")
    const [categorias, definirCategorias] = useState("Família\nEncontros\nCotidiano")
    const [habilitado, definirHabilitado] = useState(true)
    const [tom, definirTom] = useState(65)
    const [primeira, definirPrimeira] = useState(false)
    const [ultima, definirUltima] = useState(false)
    const [largura, definirLargura] = useState(560)
    const [evento, definirEvento] = useState({ numero: 0, texto: "Nenhuma ação acionada." })
    const nomes = categorias.split("\n").map((nome) => nome.trim()).filter(Boolean)
    function receber(texto: string) {
        definirEvento((atual) => ({ numero: atual.numero + 1, texto }))
    }
    function amostra(id: string, conteudo: string, categorias: string[], valor: number | null, inicio: boolean, fim: boolean) {
        const comum = { conteudo, categorias, tom: valor, aoAcionar: () => receber(`${id}: acionamento geral`) }
        return contexto === "registrar"
            ? (
                <Memoria
                    {...comum}
                    contexto="registrar"
                    primeira={inicio}
                    ultima={fim}
                    aoElevar={() => receber(`${id}: Elevar`)}
                    aoRebaixar={() => receber(`${id}: Rebaixar`)}
                />
            )
            : <Memoria {...comum} contexto={contexto} />
    }
    return (
        <div class="lab-experimento-memoria">
            <p class="mb-4">
                Componente real com colorização ampla. As cores são compartilhadas com os controles de extremos do bloco de experimentação.
                Os acionamentos aparecem abaixo, sem navegar ou reordenar dados.
            </p>
            <div class="lab-grade mb-5">
                <div>
                    <div class="field">
                        <label class="label" for="memoria-contexto">Contexto</label>
                        <div class="select">
                            <select
                                id="memoria-contexto"
                                value={contexto}
                                onChange={(e) => definirContexto(e.currentTarget.value as ContextoMemoria)}
                            >
                                <option value="registrar">Memorar</option>
                                <option value="categorizar">Categorizar</option>
                                <option value="revisar">Revisar</option>
                            </select>
                        </div>
                    </div>
                    <div class="field">
                        <label class="label" for="memoria-texto">Texto integral</label>
                        <textarea
                            id="memoria-texto"
                            class="textarea"
                            rows={3}
                            value={texto}
                            onInput={(e) => definirTexto(e.currentTarget.value)}
                        />
                    </div>
                    <div class="field">
                        <label class="label" for="memoria-categorias">Categorias — um nome por linha</label>
                        <textarea
                            id="memoria-categorias"
                            class="textarea"
                            rows={3}
                            value={categorias}
                            onInput={(e) => definirCategorias(e.currentTarget.value)}
                        />
                        <p class="help">
                            Apague todas para testar ausência. Digite Sem categoria para testar uma categoria real com esse nome.
                        </p>
                    </div>
                </div>
                <div>
                    <div class="field">
                        <label class="checkbox">
                            <input type="checkbox" checked={habilitado} onChange={(e) => definirHabilitado(e.currentTarget.checked)} />{" "}
                            Tom informado
                        </label>
                    </div>
                    <div class="field">
                        <label class="label" for="memoria-tom">Tom: {habilitado ? tom : "sem Tom"}</label>
                        <input
                            id="memoria-tom"
                            type="range"
                            min={-100}
                            max={100}
                            value={tom}
                            disabled={!habilitado}
                            onInput={(e) => definirTom(Number(e.currentTarget.value))}
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
                                    {valor}
                                </button>
                            ))}
                        </div>
                    </div>
                    <fieldset class="field" disabled={contexto !== "registrar"}>
                        <legend class="label">Posição da amostra isolada</legend>
                        <label class="checkbox mr-4">
                            <input type="checkbox" checked={primeira} onChange={(e) => definirPrimeira(e.currentTarget.checked)} /> Primeira
                        </label>
                        <label class="checkbox">
                            <input type="checkbox" checked={ultima} onChange={(e) => definirUltima(e.currentTarget.checked)} /> Última
                        </label>
                        <p class="help">Marque ambas para testar memória única.</p>
                    </fieldset>
                    <div class="field">
                        <label class="label" for="memoria-largura">Largura máxima: {largura}px</label>
                        <input
                            id="memoria-largura"
                            type="range"
                            min={220}
                            max={900}
                            step={10}
                            value={largura}
                            onInput={(e) => definirLargura(Number(e.currentTarget.value))}
                        />
                    </div>
                </div>
            </div>
            <p role="status" aria-live="polite" class="mb-4">Ações recebidas: {evento.numero}. {evento.texto}</p>
            <div style={{ maxWidth: `${largura}px` }}>
                <h3 class="title is-5">Amostra isolada</h3>
                {amostra("Amostra", texto, nomes, habilitado ? tom : null, primeira, ultima)}
                <h3 class="title is-5 mt-5">Comparação direta: ausência e neutro</h3>
                <div class="lab-lista-memorias">
                    <div>
                        <p class="help mb-2">Sem Tom</p>
                        {amostra("Sem Tom", texto, nomes, null, true, true)}
                    </div>
                    <div>
                        <p class="help mb-2">Tom 0</p>
                        {amostra("Tom 0", texto, nomes, 0, true, true)}
                    </div>
                </div>
                <h3 class="title is-5 mt-5">Lista de observação</h3>
                <div class="lab-lista-memorias">
                    {amostra("Primeira", "Uma lembrança breve.", [], -100, true, false)}
                    {amostra(
                        "Intermediária 1",
                        "Primeira linha da lembrança.\nSegunda linha da lembrança.",
                        ["Sem categoria"],
                        -1,
                        false,
                        false
                    )}
                    {amostra(
                        "Intermediária 2",
                        "Uma memória sem Tom e com três linhas.\nUma conversa inesperada.\nO caminho de volta para casa.",
                        ["Uma categoria com nome muito longo para testar a abreviação", "Amizades", "Viagens"],
                        null,
                        false,
                        false
                    )}
                    {amostra(
                        "Intermediária 3",
                        "A manhã foi tranquila e cheia de pequenos encontros. ".repeat(12),
                        ["Família", "Lembranças de viagens e encontros ao longo dos anos", "Cotidiano", "Celebrações"],
                        0,
                        false,
                        false
                    )}
                    {amostra("Última", "Um detalhe que quero guardar.", ["Descobertas"], 100, false, true)}
                </div>
            </div>
        </div>
    )
}
