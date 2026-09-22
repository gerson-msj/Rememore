import { useEffect, useState } from "preact/hooks"
import Categorizacao from "../components/Categorizacao.tsx"
import EstruturaCaptura from "../components/EstruturaCaptura.tsx"
import PainelCaptura from "../components/PainelCaptura.tsx"
import Memoria from "../components/Memoria.tsx"
import SeletorCategoria, { type OpcaoCategoria } from "../components/SeletorCategoria.tsx"
import { orientar } from "../app/servicos/orientacao.ts"
import { correspondeAproximadamente, normalizarPesquisa } from "../app/utilitarios/pesquisaTexto.ts"

const nomes = [
    "Amizades",
    "Aprendizado",
    "Casa",
    "Cinema",
    "Culinária",
    "Cultura",
    "Esportes",
    "Estudos",
    "Faculdade",
    "Família",
    "Fotografia",
    "Leitura",
    "Música",
    "Natureza",
    "Projetos pessoais",
    "Saúde",
    "Trabalho",
    "Viagens",
    "Voluntariado",
    "Encontros e descobertas que quero guardar para os próximos anos"
]
const catalogo = nomes.map((nome) => ({ chave: nome, nome }))
const textoLongo =
    "Hoje voltei à casa onde passei tantas tardes com minha família. A conversa começou na cozinha, enquanto preparávamos o café, e logo foi tomando caminhos que ninguém havia planejado. Lembramos de viagens, das pequenas confusões dos almoços de domingo e de pessoas que fizeram parte daqueles anos.\n\nNo fim da tarde, caminhamos pelo bairro e encontramos uma antiga colega da faculdade. Foi bom perceber como um encontro simples pode aproximar partes tão diferentes da nossa história."
const complementos = [{
    id: "complemento-amostra",
    conteudo:
        "Depois lembrei de outro detalhe: levamos algumas fotografias para a mesa e ficamos tentando reconhecer os lugares e as datas. Quero guardar também a alegria dessa descoberta compartilhada."
}]
const amostras = [
    { conteudo: "Caminhei pelo parque ao fim da tarde.", categorias: [] as OpcaoCategoria[] },
    { conteudo: textoLongo, categorias: [catalogo[9]] },
    {
        conteudo: "Encontrei colegas da faculdade e conversamos sobre nossos projetos.",
        categorias: [catalogo[8], catalogo[16], catalogo[0]]
    }
]

/** Cenários do marco visual. Salvar altera somente estas amostras em memória, sem acesso ao workspace. */
export default function LaboratorioCategorizacao() {
    const [memorias, definirMemorias] = useState(amostras)
    const [indice, definirIndice] = useState<number | null>(1)
    const [selecionadas, definirSelecionadas] = useState<OpcaoCategoria[]>(amostras[1].categorias)
    const [consulta, definirConsulta] = useState("")
    const [pesquisa, definirPesquisa] = useState("")
    const [historica, definirHistorica] = useState(false)
    const [curta, definirCurta] = useState(false)
    const [semCatalogo, definirSemCatalogo] = useState(false)
    useEffect(() => {
        const temporizador = setTimeout(() => definirPesquisa(consulta), 180)
        return () => clearTimeout(temporizador)
    }, [consulta])

    const disponiveis = [...new Map([
        ...(semCatalogo ? [] : catalogo),
        ...memorias.flatMap((item) => item.categorias),
        ...selecionadas
    ].map((item) => [item.chave, item])).values()].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
    const normalizada = normalizarPesquisa(pesquisa)
    const simples = disponiveis.filter((item) => normalizarPesquisa(item.nome).includes(normalizada))
    const aproximados = normalizada.length > 0 && simples.length === 0
    const resultados = aproximados ? disponiveis.filter((item) => correspondeAproximadamente(pesquisa, item.nome)) : simples

    function alternar(categoria: OpcaoCategoria) {
        definirSelecionadas((atuais) =>
            atuais.some((item) => item.chave === categoria.chave)
                ? atuais.filter((item) => item.chave !== categoria.chave)
                : [...atuais, categoria]
        )
    }
    function abrir(posicao: number) {
        definirIndice(posicao)
        definirSelecionadas(memorias[posicao].categorias)
        definirConsulta("")
        definirPesquisa("")
        definirCurta(false)
        globalThis.scrollTo(0, 0)
    }
    function voltar() {
        definirIndice(null)
        globalThis.scrollTo(0, 0)
    }
    function salvarAmostra() {
        definirMemorias((atuais) => atuais.map((item, posicao) => posicao === indice ? { ...item, categorias: selecionadas } : item))
        voltar()
    }
    const memoria = indice === null ? null : memorias[indice]
    return (
        <EstruturaCaptura
            titulo={memoria ? "Categorização" : "Capturar"}
            dia
            aoVoltar={memoria ? voltar : () => location.assign("/laboratorio")}
        >
            <PainelCaptura
                dataCaptura="2026-09-22"
                aba="Categorizar e Tom"
                aoMudarAba={() => {}}
                memoriaAberta={memoria !== null}
                acoes={memoria && !historica && (
                    <button type="button" class="button is-primary" title="Salvar" aria-label="Salvar" onClick={salvarAmostra}>
                        <span class="icon">
                            <i class="fas fa-check" aria-hidden="true" />
                        </span>
                    </button>
                )}
            >
                {memoria
                    ? (
                        <Categorizacao
                            conteudo={curta ? amostras[0].conteudo : memoria.conteudo}
                            complementos={curta || indice !== 1 ? [] : complementos}
                            selecionadas={selecionadas}
                            editavel={!historica}
                            orientacao={orientar("categorizacao")}
                            aoRemover={alternar}
                        >
                            <SeletorCategoria
                                consulta={consulta}
                                resultados={resultados}
                                selecionadas={selecionadas}
                                aproximados={aproximados}
                                novaCategoria={aproximados ? pesquisa.trim() : undefined}
                                aoPesquisar={definirConsulta}
                                aoAlternar={alternar}
                                aoCriar={(nome) => alternar({ chave: nome, nome })}
                            />
                        </Categorizacao>
                    )
                    : (
                        <ul class="captura-lista-memorias">
                            {memorias.map((item, posicao) => (
                                <li key={posicao}>
                                    <Memoria
                                        conteudo={item.conteudo}
                                        categorias={item.categorias.map((categoria) => categoria.nome)}
                                        contexto="categorizar"
                                        tom={null}
                                        aoAcionar={() => abrir(posicao)}
                                    />
                                </li>
                            ))}
                        </ul>
                    )}
                <aside class="laboratorio-categorizacao-controles" aria-label="Controles do laboratório">
                    <p class="has-text-weight-semibold">Laboratório · Categorização</p>
                    <p class="is-size-7 mt-2">
                        Amostras para validação visual. Salvar atualiza apenas esta demonstração até recarregar a página. As abas e a data
                        representam a estrutura da captura; a navegação real e a proteção de abandono serão integradas após o batimento.
                    </p>
                    {memoria && (
                        <>
                            <div class="buttons">
                                <button
                                    type="button"
                                    class="button is-small"
                                    onClick={() => {
                                        definirMemorias((atuais) => atuais.map((item) => ({ ...item, categorias: [] })))
                                        definirSelecionadas([])
                                        definirSemCatalogo(true)
                                        definirConsulta("")
                                        definirPesquisa("")
                                        definirHistorica(false)
                                    }}
                                >
                                    Primeiro uso
                                </button>
                                <button type="button" class="button is-small" onClick={() => definirSelecionadas([])}>Nenhuma</button>
                                <button type="button" class="button is-small" onClick={() => definirSelecionadas([catalogo[9]])}>
                                    Uma
                                </button>
                                <button type="button" class="button is-small" onClick={() => definirSelecionadas(catalogo.slice(0, 9))}>
                                    Duas linhas ou mais
                                </button>
                                <button type="button" class="button is-small" onClick={() => definirSelecionadas(catalogo)}>Muitas</button>
                            </div>
                            <div class="buttons">
                                <button type="button" class="button is-small" aria-pressed={curta} onClick={() => definirCurta(!curta)}>
                                    {curta ? "Mostrar texto completo" : "Mostrar texto curto"}
                                </button>
                                <button
                                    type="button"
                                    class="button is-small"
                                    aria-pressed={historica}
                                    onClick={() => definirHistorica(!historica)}
                                >
                                    {historica ? "Modo editável" : "Modo histórico"}
                                </button>
                                <button
                                    type="button"
                                    class="button is-small"
                                    aria-pressed={semCatalogo}
                                    onClick={() => definirSemCatalogo(!semCatalogo)}
                                >
                                    {semCatalogo ? "Com catálogo" : "Somente locais"}
                                </button>
                            </div>
                            <p class="is-size-7">
                                Pesquise “f” ou “FAMILIA” para busca simples, “famlia” para criação com sugestão e “Astronomia” para criação
                                sem sugestão. Limpe a pesquisa para ver a lista completa.
                            </p>
                        </>
                    )}
                </aside>
            </PainelCaptura>
        </EstruturaCaptura>
    )
}
