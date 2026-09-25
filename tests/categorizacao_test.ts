import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { BancoLocal } from "../app/servicos/local/banco.ts"
import { type AssociacaoCategoria, type CapturaLocal, RepositorioCapturasLocais } from "../app/servicos/local/capturas.ts"
import { type CatalogoCategorias, RepositorioCatalogoCategorias } from "../app/servicos/local/catalogoCategorias.ts"
import { migracoesLocais } from "../app/servicos/local/esquema.ts"
import {
    abrirCategorizacao,
    categoriasDisponiveis,
    mesmasCategorias,
    pesquisarCategorias,
    salvarCategorias,
    SessaoCategorizacao
} from "../app/servicos/captura/categorizacao.ts"
import { aplicarDeltaCatalogo, sincronizarCatalogo } from "../app/servicos/categorias.ts"
import { criarCatalogoSimulado } from "../app/servicos/categorias/simulado.ts"
import { prepararCaptura } from "../app/servicos/captura.ts"
import { criarCapturaSimulada } from "../app/servicos/captura/simulado.ts"

function igual(obtido: unknown, esperado: unknown) {
    if (JSON.stringify(obtido) !== JSON.stringify(esperado)) {
        throw new Error(`Esperado ${JSON.stringify(esperado)}, recebido ${JSON.stringify(obtido)}`)
    }
}
async function rejeita(operacao: () => Promise<unknown>) {
    let falhou = false
    try {
        await operacao()
    } catch {
        falhou = true
    }
    igual(falhou, true)
}
const familia = { idCategoria: "familia", nome: "Família" }
const local = { idCategoria: null, nome: "Jardim" }
function captura(): CapturaLocal {
    return {
        idConta: "a",
        dataCaptura: "2026-09-22",
        idAreaTrabalho: "area",
        prazoEdicaoDias: 3,
        origemPreservada: false,
        revisaoOrigem: null,
        alterada: false,
        alteracoesOutras: false,
        categoriasOrigem: {},
        primeiraMemoriaConfirmada: true,
        memorias: [{ id: "m", conteudo: "Memória", ordem: 0, primeiraPreservacaoEm: null, complementos: [], categorias: [] }]
    }
}
function catalogo(ativa = true): CatalogoCategorias {
    return { idConta: "a", revisao: "1", categorias: [{ id: "familia", nome: "Família", versao: 1, ativa }] }
}
function armazenamento(): Storage {
    const dados = new Map<string, string>()
    return {
        getItem: (chave: string) => dados.get(chave) ?? null,
        setItem: (chave: string, valor: string) => dados.set(chave, valor),
        removeItem: (chave: string) => dados.delete(chave)
    } as unknown as Storage
}

Deno.test("categorias: confirmação aguarda gravação sem mutar a base e mantém ordem de seleção", async () => {
    const base = captura()
    const edicao = abrirCategorizacao(base, "m", 350)
    edicao.selecionadas = [local, familia]
    let liberar!: () => void
    let concluida = false
    const gravacao = new Promise<void>((resolver) => liberar = resolver)
    const operacao = salvarCategorias(base, edicao, () => gravacao).then((salva) => {
        concluida = true
        return salva
    })
    await Promise.resolve()
    igual(concluida, false)
    igual(base.memorias[0].categorias, [])
    liberar()
    const salva = await operacao
    igual(salva.memorias[0].categorias, [local, familia])
    igual(salva.alterada, true)
    igual(salva.revisaoOrigem, base.revisaoOrigem)
    igual(salva.memorias[0].primeiraPreservacaoEm, null)
})

Deno.test("categorias: conjunto idêntico não grava; falha mantém base e edição", async () => {
    const base = captura()
    base.memorias[0].categorias = [familia, local]
    const edicao = abrirCategorizacao(base, "m", 0)
    edicao.selecionadas = [local, familia]
    igual(
        await salvarCategorias(base, edicao, () => {
            throw new Error("Não deveria gravar")
        }),
        base
    )
    edicao.selecionadas = []
    await rejeita(() => salvarCategorias(base, edicao, () => Promise.reject(new Error("Falha de disco"))))
    igual(base.memorias[0].categorias, [familia, local])
    igual(edicao.selecionadas, [])
    igual(base.alterada, false)
})

Deno.test("categorias: existência local depende apenas das associações da captura aberta", async () => {
    const base = captura()
    base.memorias[0].categorias = [local]
    base.memorias.push({ ...base.memorias[0], id: "n", categorias: [local] })
    const editar = abrirCategorizacao(base, "m", 0)
    editar.selecionadas = []
    const primeira = await salvarCategorias(base, editar, () => Promise.resolve())
    igual(categoriasDisponiveis(primeira).map((item) => item.nome), ["Jardim"])
    const ultima = abrirCategorizacao(primeira, "n", 0)
    ultima.selecionadas = []
    const semUso = await salvarCategorias(primeira, ultima, () => Promise.resolve())
    igual(categoriasDisponiveis(semUso), [])
    igual(categoriasDisponiveis(captura()), [])
})

Deno.test("categorias: preservadas ativas independem de uso; inativas só entram quando usadas nesta captura", () => {
    const base = captura()
    igual(categoriasDisponiveis(base, catalogo()).map((item) => item.nome), ["Família"])
    igual(categoriasDisponiveis(base, catalogo(false)), [])
    base.alterada = true
    base.memorias[0].categorias = [familia]
    igual(categoriasDisponiveis(base, catalogo(false)).map((item) => item.nome), ["Família"])
    igual(categoriasDisponiveis(captura(), catalogo(false)), [])
})

Deno.test("categorias: busca simples precede aproximações e criação; somente espaços não cria", () => {
    const base = captura()
    base.memorias[0].categorias = [familia, { idCategoria: "faculdade", nome: "Faculdade" }]
    const disponiveis = categoriasDisponiveis(base)
    igual(pesquisarCategorias(disponiveis, " f ").resultados.map((item) => item.nome), ["Faculdade", "Família"])
    const simples = pesquisarCategorias(disponiveis, " FAMILIA ")
    igual(simples.aproximados, false)
    igual(simples.novaCategoria, undefined)
    const aproximada = pesquisarCategorias(disponiveis, "famlia")
    igual(aproximada.novaCategoria, "famlia")
    igual(aproximada.resultados.map((item) => item.nome), ["Família"])
    igual(pesquisarCategorias(disponiveis, "Astronomia").resultados, [])
    igual(pesquisarCategorias(disponiveis, "   ").novaCategoria, undefined)
    igual(mesmasCategorias([{ idCategoria: null, nome: " Família " }], [{ idCategoria: null, nome: "familia" }]), true)
})

Deno.test("categorias: prazo considera memória original, autoriza até fechar e reavalia nova abertura", async () => {
    const base = captura()
    base.memorias[0].primeiraPreservacaoEm = "2026-09-01T12:00:00Z"
    base.memorias[0].complementos = [{ id: "c", conteudo: "Recente", primeiraPreservacaoEm: null }]
    const antes = Date.parse("2026-09-04T11:59:59Z")
    const depois = Date.parse("2026-09-04T12:00:00Z")
    const autorizada = abrirCategorizacao(base, "m", 0, antes)
    igual(autorizada.autorizada, true)
    autorizada.selecionadas = [local]
    igual((await salvarCategorias(base, autorizada, () => Promise.resolve())).alterada, true)
    const historica = abrirCategorizacao(base, "m", 0, depois)
    igual(historica.autorizada, false)
    await rejeita(() => salvarCategorias(base, historica, () => Promise.resolve()))
})

Deno.test("categorias: reload conserva autorização e associações já confirmadas", async () => {
    const base = captura()
    const sessao = new SessaoCategorizacao("a", base.dataCaptura, armazenamento())
    const edicao = abrirCategorizacao(base, "m", 410)
    edicao.selecionadas = [local]
    const confirmada = await salvarCategorias(base, edicao, () => Promise.resolve())
    sessao.gravar(edicao)
    const retomada = sessao.retomar(confirmada, true)!
    igual(retomada.autorizada, true)
    igual(retomada.rolagem, 410)
    igual(retomada.selecionadas, [local])
    igual(sessao.retomar({ ...confirmada, idAreaTrabalho: "outra" }, true), null)
    sessao.gravar(edicao)
    igual(sessao.retomar(confirmada, false), null)
})

Deno.test("catálogo: delta mantém demais categorias e ignora versão individual antiga", () => {
    const inicial = catalogo()
    const alterado = aplicarDeltaCatalogo("a", inicial, {
        revisao: "2",
        alteracoes: [{ id: "familia", nome: "Família ampliada", versao: 2, ativa: false }, {
            id: "saude",
            nome: "Saúde",
            versao: 1,
            ativa: true
        }]
    })
    igual(inicial.categorias[0].ativa, true)
    igual(alterado.categorias[0].ativa, false)
    const reativado = aplicarDeltaCatalogo("a", alterado, {
        revisao: "3",
        alteracoes: [{ id: "familia", nome: "Família ampliada", versao: 3, ativa: true }]
    })
    igual(reativado.categorias.length, 2)
    igual(reativado.categorias[0].ativa, true)
    const antigo = aplicarDeltaCatalogo("a", reativado, { revisao: "4", alteracoes: inicial.categorias })
    igual(antigo.categorias[0].versao, 3)
})

Deno.test("catálogo: consulta incremental transmite somente deltas e não grava revisão igual", async () => {
    const eventos = [...catalogo().categorias]
    const remoto = criarCatalogoSimulado(() => ({ eventos }))
    let salvo: CatalogoCategorias | undefined
    let gravacoes = 0
    const repositorio = {
        obter: () => Promise.resolve(salvo),
        gravar: (valor: CatalogoCategorias) => {
            salvo = valor
            gravacoes++
            return Promise.resolve()
        }
    }
    await sincronizarCatalogo("a", repositorio, remoto)
    igual(gravacoes, 1)
    igual((await remoto.consultar("a", "1")).alteracoes, [])
    await sincronizarCatalogo("a", repositorio, remoto)
    igual(gravacoes, 1)
    eventos.push({ id: "saude", nome: "Saúde", versao: 1, ativa: true })
    igual((await remoto.consultar("a", "1")).alteracoes.map((item) => item.id), ["saude"])
    await sincronizarCatalogo("a", repositorio, remoto)
    igual(salvo?.categorias.length, 2)
    await rejeita(() => sincronizarCatalogo("a", repositorio, { consultar: () => Promise.reject(new Error("Sem rede")) }))
    igual(salvo?.revisao, "2")
})

Deno.test("schema 5: conserva captura v4 e isola catálogo por conta", async () => {
    const fabrica = new IDBFactory()
    const anterior = new RepositorioCapturasLocais(new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 4) }))
    const base = captura()
    delete base.memorias[0].categorias
    await anterior.gravar(base)
    const banco = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 5) })
    const capturas = new RepositorioCapturasLocais(banco)
    const catalogos = new RepositorioCatalogoCategorias(banco)
    igual(await capturas.obter("a", base.dataCaptura), base)
    await catalogos.gravar(catalogo())
    igual(await catalogos.obter("a"), catalogo())
    igual(await catalogos.obter("b"), undefined)
    igual(await capturas.obter("a", base.dataCaptura), base)
    const edicao = abrirCategorizacao(base, "m", 0)
    edicao.selecionadas = [local]
    await salvarCategorias(base, edicao, (valor) => capturas.gravar(valor))
    igual((await capturas.obter("a", base.dataCaptura))?.memorias[0].categorias, [local])
})

Deno.test("categorias: converte associações remotas preservando identidade sem alterar payload", async () => {
    const remoto = criarCapturaSimulada(() => ({
        status: "found",
        revision: "cat-1",
        editWindowDays: 3,
        memories: [{
            id: "m",
            content: "Texto",
            order: 0,
            firstPreservedAt: null,
            complements: [],
            categories: [{ id: "familia", name: "Família" }]
        }]
    }))
    const fabrica = new IDBFactory()
    const repositorio = new RepositorioCapturasLocais(new BancoLocal({ fabrica: () => fabrica }))
    const preparada = await prepararCaptura("a", "2026-09-22", repositorio, remoto)
    igual(preparada.memorias[0].categorias, [familia] satisfies AssociacaoCategoria[])
})

Deno.test("categorias: reversão após reabrir o workspace remove somente a pendência de categorias", async () => {
    const fabrica = new IDBFactory()
    const repositorio = new RepositorioCapturasLocais(new BancoLocal({ fabrica: () => fabrica }))
    const base = captura()
    base.memorias[0].categorias = [familia]
    base.categoriasOrigem = { m: [familia] }
    const edicao = abrirCategorizacao(base, "m", 0)
    edicao.selecionadas = [local]
    await salvarCategorias(base, edicao, (valor) => repositorio.gravar(valor))
    const retomada = (await repositorio.obter(base.idConta, base.dataCaptura))!
    igual(retomada.alterada, true)
    const reversao = abrirCategorizacao(retomada, "m", 0)
    reversao.selecionadas = [familia]
    const revertida = await salvarCategorias(retomada, reversao, (valor) => repositorio.gravar(valor))
    igual(revertida.alterada, false)
    igual(await repositorio.listarPendentes(base.idConta), [])
    const comTextoAlterado = { ...retomada, alteracoesOutras: true }
    const mantida = await salvarCategorias(comTextoAlterado, reversao, (valor) => repositorio.gravar(valor))
    igual(mantida.alterada, true)
    igual(mantida.alteracoesOutras, true)
    igual(mantida.categoriasOrigem, { m: [familia] })
    const duplicada = abrirCategorizacao(base, "m", 0)
    duplicada.selecionadas = [familia, { idCategoria: null, nome: " família " }]
    await rejeita(() => salvarCategorias(base, duplicada, () => Promise.resolve()))
})

Deno.test("categorias: reversão em uma memória não apaga a pendência de outra", async () => {
    const base = captura()
    base.memorias.push({ ...base.memorias[0], id: "n", categorias: [] })
    const gravar = () => Promise.resolve()
    const primeira = abrirCategorizacao(base, "m", 0)
    primeira.selecionadas = [familia]
    const uma = await salvarCategorias(base, primeira, gravar)
    const segunda = abrirCategorizacao(uma, "n", 0)
    segunda.selecionadas = [local]
    const duas = await salvarCategorias(uma, segunda, gravar)
    const reversao = abrirCategorizacao(duas, "m", 0)
    reversao.selecionadas = []
    igual((await salvarCategorias(duas, reversao, gravar)).alterada, true)
})

Deno.test("schema 6: descarta somente workspaces antigos uma vez e conserva catálogo", async () => {
    const fabrica = new IDBFactory()
    const bancoAntigo = new BancoLocal({ fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 5) })
    const base = captura()
    await new RepositorioCapturasLocais(bancoAntigo).gravar(base)
    await new RepositorioCatalogoCategorias(bancoAntigo).gravar(catalogo())
    const banco = new BancoLocal({ fabrica: () => fabrica })
    const repositorio = new RepositorioCapturasLocais(banco)
    igual(await repositorio.obter(base.idConta, base.dataCaptura), undefined)
    igual(await new RepositorioCatalogoCategorias(banco).obter("a"), catalogo())
    await repositorio.gravar(base)
    igual(await repositorio.obter(base.idConta, base.dataCaptura), base)
    igual(await repositorio.obter(base.idConta, base.dataCaptura), base)
})
