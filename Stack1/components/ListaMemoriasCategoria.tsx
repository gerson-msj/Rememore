import { useEffect, useRef } from "preact/hooks"
import type { MemoriaConsultaRememorar } from "../app/servicos/rememorar/consultaMemorias.ts"
import Memoria from "./Memoria.tsx"

interface PropriedadesListaMemoriasCategoria {
    memorias: readonly MemoriaConsultaRememorar[]
    carregando: boolean
    erro: string | null
    fim: boolean
    houveCargaIncremental: boolean
    pausarAvanco: boolean
    mostrarVoltarAoTopo: boolean
    aoCarregarProximo: () => void
    aoTentarNovamente: () => void
    aoVoltarAoTopo: () => void
}

export default function ListaMemoriasCategoria({
    memorias,
    carregando,
    erro,
    fim,
    houveCargaIncremental,
    pausarAvanco,
    mostrarVoltarAoTopo,
    aoCarregarProximo,
    aoTentarNovamente,
    aoVoltarAoTopo
}: PropriedadesListaMemoriasCategoria) {
    const sentinela = useRef<HTMLLIElement>(null)

    useEffect(() => {
        const alvo = sentinela.current
        if (pausarAvanco || !alvo || carregando || erro || fim || memorias.length === 0 || typeof IntersectionObserver === "undefined") {
            return
        }
        const observar = new IntersectionObserver((entradas) => {
            if (entradas.some((entrada) => entrada.isIntersecting)) aoCarregarProximo()
        }, { rootMargin: "320px 0px" })
        observar.observe(alvo)
        return () => observar.disconnect()
    }, [aoCarregarProximo, carregando, erro, fim, memorias.length, pausarAvanco])

    if (carregando && memorias.length === 0) {
        return <p class="lista-memorias-mensagem" role="status">Carregando...</p>
    }

    if (!carregando && !erro && fim && memorias.length === 0) {
        return <p class="lista-memorias-mensagem">Nenhuma memória nesta categoria para o período selecionado.</p>
    }

    return (
        <section class="lista-memorias-categoria" aria-label="Memórias da categoria" aria-busy={carregando}>
            {memorias.length > 0 && (
                <ol class="lista-memorias-categoria-itens">
                    {memorias.map((memoria) => (
                        <li key={memoria.id} data-memoria-id={memoria.id}>
                            <Memoria
                                conteudo={memoria.conteudo}
                                categorias={memoria.categorias.map(({ nome }) => nome)}
                                tom={memoria.tom}
                                contexto="rememorarDetalheCategoria"
                            />
                        </li>
                    ))}
                    <li ref={sentinela} class="lista-memorias-sentinela" aria-hidden="true" />
                </ol>
            )}
            {erro && (
                <div class="lista-memorias-mensagem lista-memorias-erro" role="alert">
                    <p>{erro}</p>
                    <button class="button is-text" type="button" onClick={aoTentarNovamente}>Tentar novamente</button>
                </div>
            )}
            {carregando && memorias.length > 0 && <p class="lista-memorias-mensagem" role="status">Carregando...</p>}
            {!carregando && !erro && fim && houveCargaIncremental && memorias.length > 0 && (
                <p class="lista-memorias-mensagem">Não há mais memórias.</p>
            )}
            {fim && houveCargaIncremental && mostrarVoltarAoTopo && (
                <button class="button is-text lista-memorias-voltar-topo" type="button" onClick={aoVoltarAoTopo}>
                    Voltar ao topo
                </button>
            )}
        </section>
    )
}
