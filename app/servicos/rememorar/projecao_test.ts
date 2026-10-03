import { IDBFactory } from "npm:fake-indexeddb@6.2.4"
import { BancoLocal } from "../local/banco.ts"
import { RepositorioCatalogoCategorias } from "../local/catalogoCategorias.ts"
import { type CapturaLocal, RepositorioCapturasLocais } from "../local/capturas.ts"
import { type BlocoProjecaoRememorar, RepositorioProjecaoRememorar } from "../local/projecaoRememorar.ts"
import { migracoesLocais } from "../local/esquema.ts"
import { catalogoReferenciaRememorar, obterCenarioAcervoRememorar, projetarDiaAcervoRememorar } from "./acervo.ts"
import type { RespostaProjecaoRemota, ServicoProjecaoRemota } from "./contratos.ts"
import { reconstruirProjecaoRememorar, sincronizarProjecaoRememorar } from "./projecao.ts"
import { criarProjecaoRemotaSimulada } from "./simulado.ts"
import { executarPreparacaoRememorar } from "../rememorar.ts"

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

function novoBanco(versao = migracoesLocais.length) {
    const fabrica = new IDBFactory()
    const banco = new BancoLocal({
        nome: `rememore-projecao-${crypto.randomUUID()}`,
        fabrica: () => fabrica,
        migracoes: migracoesLocais.slice(0, versao)
    })
    return { fabrica, banco }
}

function capturaLegada(): CapturaLocal {
    return {
        idConta: "conta-a",
        dataCaptura: "2026-01-01",
        memorias: [],
        alterada: false,
        alteracoesOutras: false,
        categoriasOrigem: {},
        primeiraMemoriaConfirmada: true,
        origemPreservada: true,
        revisaoOrigem: "r1",
        idAreaTrabalho: "area-1",
        prazoEdicaoDias: 3
    }
}

function bloco(data: string, categoria = "categoria-01", tom: number | null = 0): BlocoProjecaoRememorar {
    return { idConta: "conta-a", data, categorias: [{ idCategoria: categoria, tons: [tom] }] }
}

function remotoSequencial(respostas: RespostaProjecaoRemota[]): ServicoProjecaoRemota {
    return {
        consultar() {
            const resposta = respostas.shift()
            if (!resposta) throw new Error("Resposta remota não preparada")
            return Promise.resolve(structuredClone(resposta))
        },
        reconstruir() {
            const resposta = respostas.shift()
            if (!resposta || resposta.tipo === "atualizada") throw new Error("Snapshot não preparado")
            return Promise.resolve({ revisao: resposta.revisao, blocos: structuredClone(resposta.blocos) })
        }
    }
}

Deno.test("schema 7 acrescenta stores sem apagar capturas nem catálogo da versão 6", async () => {
    const fabrica = new IDBFactory()
    const nome = `rememore-projecao-migracao-${crypto.randomUUID()}`
    const banco6 = new BancoLocal({ nome, fabrica: () => fabrica, migracoes: migracoesLocais.slice(0, 6) })
    const captura = capturaLegada()
    await new RepositorioCapturasLocais(banco6).gravar(captura)
    const catalogos6 = new RepositorioCatalogoCategorias(banco6)
    const catalogo = {
        idConta: "conta-a",
        revisao: "cat-3",
        categorias: [{ id: "categoria-01", nome: "Família", versao: 2, ativa: false }]
    }
    await catalogos6.gravar(catalogo)
    const banco7 = new BancoLocal({ nome, fabrica: () => fabrica })
    // Usa a mesma fábrica e banco nomeado para exercitar o upgrade 6 -> 7.
    const capturas = new RepositorioCapturasLocais(banco7)
    igual(await capturas.obter(captura.idConta, captura.dataCaptura), captura)
    igual(await new RepositorioCatalogoCategorias(banco7).obter("conta-a"), catalogo)
    igual(await new RepositorioProjecaoRememorar(banco7).listar("conta-a"), [])
})

Deno.test("repositório mantém contas isoladas e reconcilia bloco e revisão atomicamente", async () => {
    const { banco } = novoBanco()
    const repo = new RepositorioProjecaoRememorar(banco)
    await repo.reconciliar("conta-a", "1", [bloco("2026-01-01")], [], true)
    await repo.reconciliar("conta-b", "5", [bloco("2026-02-01")], [], true)
    igual((await repo.obterMetadados("conta-a"))?.revisao, "1")
    igual((await repo.listar("conta-a")).map((item) => item.data), ["2026-01-01"])
    await repo.reconciliar("conta-a", "2", [bloco("2026-01-01", "categoria-02", null)], [])
    igual((await repo.obter("conta-a", "2026-01-01"))?.categorias[0].tons, [null])
    await repo.reconciliar("conta-a", "3", [], ["2026-01-01"])
    igual(await repo.listar("conta-a"), [])
    igual((await repo.obterMetadados("conta-b"))?.revisao, "5")
})

Deno.test("carga integral, cache atualizado e falha não promove revisão nem destrói cache válido", async () => {
    const { banco } = novoBanco()
    const repo = new RepositorioProjecaoRememorar(banco)
    let consultas = 0
    const remoto: ServicoProjecaoRemota = {
        consultar(_conta, revisao) {
            consultas++
            return Promise.resolve(
                revisao === null
                    ? { tipo: "completa", revisao: "10", blocos: [bloco("2026-01-01"), bloco("2026-01-02", "categoria-02", null)] }
                    : { tipo: "atualizada", revisao: "10" }
            )
        },
        reconstruir: () => Promise.reject(new Error("Não usado"))
    }
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.listar("conta-a")).length, 2)
    igual((await repo.obterMetadados("conta-a"))?.revisao, "10")
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual(consultas, 2)
    const falho: ServicoProjecaoRemota = {
        consultar: () => Promise.reject(new Error("Sem rede")),
        reconstruir: () => Promise.reject(new Error("Sem rede"))
    }
    await rejeita(() => sincronizarProjecaoRememorar("conta-a", repo, falho))
    igual((await repo.obterMetadados("conta-a"))?.revisao, "10")
    igual((await repo.listar("conta-a")).length, 2)
    await rejeita(() =>
        sincronizarProjecaoRememorar("conta-b", {
            obterMetadados: () => Promise.resolve(undefined),
            reconciliar: () => Promise.reject(new Error("Quota"))
        }, remoto)
    )

    const bancoRecuperacao = novoBanco().banco
    const repoRecuperacao = new RepositorioProjecaoRememorar(bancoRecuperacao)
    let falharPrimeiraGravacao = true
    const persistenciaInstavel = {
        obterMetadados: (idConta: string) => repoRecuperacao.obterMetadados(idConta),
        reconciliar: (idConta: string, revisao: string, blocos: BlocoProjecaoRememorar[], removidas: string[], reconstruir?: boolean) => {
            if (falharPrimeiraGravacao) {
                falharPrimeiraGravacao = false
                return Promise.reject(new Error("Quota"))
            }
            return repoRecuperacao.reconciliar(idConta, revisao, blocos, removidas, reconstruir)
        }
    }
    await rejeita(() => sincronizarProjecaoRememorar("conta-nova", persistenciaInstavel, remoto))
    igual(await repoRecuperacao.obterMetadados("conta-nova"), undefined)
    await sincronizarProjecaoRememorar("conta-nova", persistenciaInstavel, remoto)
    igual((await repoRecuperacao.obterMetadados("conta-nova"))?.revisao, "10")
})

Deno.test("incremental substitui só datas alteradas e cobre inclusão, remoção e recriação", async () => {
    const { banco } = novoBanco()
    const repo = new RepositorioProjecaoRememorar(banco)
    await repo.reconciliar("conta-a", "20", [bloco("2026-01-01"), bloco("2026-01-02"), bloco("2026-01-03")], [], true)
    const remoto = remotoSequencial([
        {
            tipo: "incremental",
            revisao: "25",
            blocos: [bloco("2026-01-02", "categoria-02", 0), bloco("2026-01-04")],
            removidas: ["2026-01-03"]
        },
        { tipo: "incremental", revisao: "28", blocos: [bloco("2026-01-03", "categoria-03", -30)], removidas: [] }
    ])
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.listar("conta-a")).map((item) => item.data).sort(), ["2026-01-01", "2026-01-02", "2026-01-04"])
    igual((await repo.obter("conta-a", "2026-01-02"))?.categorias, [{ idCategoria: "categoria-02", tons: [0] }])
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.listar("conta-a")).map((item) => item.data).sort(), ["2026-01-01", "2026-01-02", "2026-01-03", "2026-01-04"])
    igual((await repo.obterMetadados("conta-a"))?.revisao, "28")
})

Deno.test("reconstrução troca integralmente projeção e falha preserva revisão anterior", async () => {
    const { banco } = novoBanco()
    const repo = new RepositorioProjecaoRememorar(banco)
    await repo.reconciliar("conta-a", "2", [bloco("2026-01-01"), bloco("2026-01-02")], [], true)
    const remoto = remotoSequencial([{ tipo: "completa", revisao: "9", blocos: [bloco("2026-02-01")] }])
    await reconstruirProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.listar("conta-a")).map((item) => item.data), ["2026-02-01"])
    igual((await repo.obterMetadados("conta-a"))?.revisao, "9")
    await rejeita(() =>
        reconstruirProjecaoRememorar("conta-a", { reconciliar: () => Promise.reject(new Error("Persistência")) }, remotoSequencial([]))
    )
    igual((await repo.obterMetadados("conta-a"))?.revisao, "9")
})

Deno.test("preparação verifica projeção antes do catálogo e mantém resultados independentes", async () => {
    const ordem: string[] = []
    const resultado = await executarPreparacaoRememorar(
        () => {
            ordem.push("projecao")
            return Promise.resolve("estado-projecao")
        },
        () => {
            ordem.push("catalogo")
            return Promise.resolve("estado-catalogo")
        }
    )
    igual(ordem, ["projecao", "catalogo"])
    igual(resultado.projecao, { status: "ready", dados: "estado-projecao" })
    igual(resultado.catalogo, { status: "ready", dados: "estado-catalogo" })
    const falhaIndependente = await executarPreparacaoRememorar(
        () => Promise.reject(new Error("Remoto")),
        () => Promise.resolve("catalogo-local")
    )
    igual(falhaIndependente.projecao.status, "failed")
    igual(falhaIndependente.catalogo, { status: "ready", dados: "catalogo-local" })
})

Deno.test("fixtures determinísticas atendem cenários, Tons, cauda longa e forma mínima da projeção", () => {
    for (const quantidade of [2, 7, 30, 300] as const) {
        const cenario = obterCenarioAcervoRememorar(quantidade)
        igual(cenario.dias.length, quantidade)
        igual(new Set(cenario.dias).size, quantidade)
        if (JSON.stringify(cenario) !== JSON.stringify(obterCenarioAcervoRememorar(quantidade))) {
            throw new Error("Fixture não determinística")
        }
        for (const data of cenario.dias) {
            const memorias = cenario.memorias.filter((memoria) => memoria.data === data)
            if (memorias.length < 1 || memorias.length > 15) throw new Error(`Quantidade inválida em ${data}`)
            if (memorias.some((memoria) => memoria.complementos.length > 3)) throw new Error("Memória com mais de três adendos")
        }
        igual(new Set(cenario.memorias.map((memoria) => memoria.id)).size, cenario.memorias.length)
    }
    igual(catalogoReferenciaRememorar.length, 40)
    const amplo = obterCenarioAcervoRememorar(300)
    const tons = amplo.memorias.map((memoria) => memoria.tom)
    if (
        !tons.includes(null) || !tons.includes(0) || !tons.some((tom) => tom !== null && tom < 0) ||
        !tons.some((tom) => tom !== null && tom > 0)
    ) {
        throw new Error("Fixture não contém diversidade de Tom")
    }
    if (!amplo.memorias.some((memoria) => memoria.categorias.length > 1)) throw new Error("Fixture não contém associações múltiplas")
    const frequencias = new Map<string, number>()
    for (const memoria of amplo.memorias) {
        for (const categoria of memoria.categorias) frequencias.set(categoria, (frequencias.get(categoria) ?? 0) + 1)
    }
    if (Math.max(...frequencias.values()) <= Math.min(...frequencias.values())) throw new Error("Distribuição de categorias uniforme")
    const cenarioRepetido = obterCenarioAcervoRememorar(300)
    const blocoProjetado = projetarDiaAcervoRememorar("conta-a", amplo, amplo.dias[0])
    if (blocoProjetado.categorias.some((categoria) => categoria.tons.length === 0)) throw new Error("Associação sem Tom, inclusive ausente")
    if (JSON.stringify(amplo) !== JSON.stringify(cenarioRepetido)) throw new Error("Seleção do mesmo cenário divergiu")
    if ("conteudo" in blocoProjetado || "complementos" in blocoProjetado) throw new Error("Conteúdo de memória vazou para a projeção")
    const diaComMulticategoria = amplo.dias.find((data) =>
        amplo.memorias.some((memoria) => memoria.data === data && memoria.categorias.length > 1)
    )!
    const memoriaMulticategoria = amplo.memorias.find((memoria) => memoria.data === diaComMulticategoria && memoria.categorias.length > 1)!
    const blocoMulticategoria = projetarDiaAcervoRememorar("conta-a", amplo, diaComMulticategoria)
    for (const idCategoria of memoriaMulticategoria.categorias) {
        const lista = blocoMulticategoria.categorias.find((categoria) => categoria.idCategoria === idCategoria)?.tons ?? []
        if (lista.filter((tom) => tom === memoriaMulticategoria.tom).length < 1) {
            throw new Error("Associação multicategorizada não projetou seu Tom")
        }
    }
    if (blocoMulticategoria.categorias.some((categoria) => categoria.tons.length === 0)) {
        throw new Error("Quantidade por categoria não corresponde às associações")
    }
})

Deno.test("cenário de 300 dias carrega, lê e recebe atualização incremental", async () => {
    const { banco } = novoBanco()
    const repo = new RepositorioProjecaoRememorar(banco)
    const cenario = obterCenarioAcervoRememorar(300)
    let respostaInicial = true
    const remoto: ServicoProjecaoRemota = {
        consultar(_conta, revisao) {
            if (respostaInicial && revisao === null) {
                respostaInicial = false
                return Promise.resolve({
                    tipo: "completa",
                    revisao: "1",
                    blocos: cenario.dias.map((data) => projetarDiaAcervoRememorar("conta-a", cenario, data))
                })
            }
            return Promise.resolve({
                tipo: "incremental",
                revisao: "2",
                blocos: [bloco(cenario.dias[0], "categoria-01", null)],
                removidas: []
            })
        },
        reconstruir: () => Promise.reject(new Error("Não usado"))
    }
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.listar("conta-a")).length, 300)
    await sincronizarProjecaoRememorar("conta-a", repo, remoto)
    igual((await repo.obterMetadados("conta-a"))?.revisao, "2")
    igual((await repo.obter("conta-a", cenario.dias[0]))?.categorias[0].tons, [null])
})

Deno.test("mock remoto mantém revisão por data e transmite somente o estado completo mais recente", async () => {
    const estados = new Map<
        string,
        { revisao: number; blocos: Record<string, BlocoProjecaoRememorar>; ultimaRevisao: Record<string, number> }
    >()
    const remoto = criarProjecaoRemotaSimulada({
        ler: (conta) => estados.get(conta) ?? { revisao: 0, blocos: {}, ultimaRevisao: {} },
        gravar: (conta, estado) => estados.set(conta, estado),
        cenario: () => 2
    })
    const carga = await remoto.consultar("conta-a", null)
    if (carga.tipo !== "completa") throw new Error("Carga inicial não completa")
    const dataAlterada = carga.blocos[0].data
    const estado = estados.get("conta-a")!
    estado.revisao += 2
    estado.ultimaRevisao[dataAlterada] = estado.revisao
    estado.blocos[dataAlterada] = bloco(dataAlterada, "categoria-04", 75)
    estados.set("conta-a", estado)
    const incremental = await remoto.consultar("conta-a", "1")
    if (incremental.tipo !== "incremental") throw new Error("Resposta incremental esperada")
    igual(incremental.blocos.length, 1)
    igual(incremental.blocos[0].categorias[0].tons, [75])
})
