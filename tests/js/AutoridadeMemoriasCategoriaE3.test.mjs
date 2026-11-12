import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function carregarAutoridade() {
    const raiz = new URL("../../src/Rememore.Client/wwwroot/js/", import.meta.url);
    const panorama = await readFile(new URL("contratoPanoramaFake.mjs", raiz), "utf8");
    const memorias = await readFile(new URL("contratoMemoriasCategoriaFake.mjs", raiz), "utf8");
    const urlPanorama = `data:text/javascript;base64,${Buffer.from(panorama).toString("base64")}`;
    const urlMemorias = `data:text/javascript;base64,${Buffer.from(memorias).toString("base64")}`;
    const codigo = (await readFile(new URL("autoridadeCapturaFake.js", raiz), "utf8"))
        .replace('"./contratoPanoramaFake.mjs"', JSON.stringify(urlPanorama))
        .replace('"./contratoMemoriasCategoriaFake.mjs"', JSON.stringify(urlMemorias));
    return import(`data:text/javascript;base64,${Buffer.from(codigo).toString("base64")}`);
}

function bancoPorConta(estados) {
    const banco = {
        close() { },
        transaction() {
            const tx = {
                objectStore() {
                    return { put(estado) { estados.set(estado.identidadeConta, estado); }, get(conta) {
                        const pedido = { result: estados.get(conta) };
                        queueMicrotask(() => { pedido.onsuccess(); queueMicrotask(() => tx.oncomplete()); });
                        return pedido;
                    } };
                }
            };
            return tx;
        }
    };
    return { open() {
        const pedido = { result: banco };
        queueMicrotask(() => pedido.onsuccess());
        return pedido;
    } };
}

test("autoridade persistente consulta somente capturas da conta solicitada", async () => {
    const estados = new Map([
        ["conta-a", { identidadeConta: "conta-a", revisaoPanorama: 2, capturas: {
            "2026-11-01": { memorias: [{ identidade: "a", ordem: 0, conteudo: "Texto A", tom: 0,
                categorias: [{ identidade: "familia" }] }] }
        } }],
        ["conta-b", { identidadeConta: "conta-b", revisaoPanorama: 3, capturas: {
            "2026-11-01": { memorias: [{ identidade: "b", ordem: 0, conteudo: "Texto B", tom: null,
                categorias: [{ identidade: "familia" }] }] }
        } }]
    ]);
    globalThis.indexedDB = bancoPorConta(estados);
    try {
        const { consultarMemoriasCategoria } = await carregarAutoridade();
        const a = await consultarMemoriasCategoria("conta-a", "familia", "2026-11-01", "2026-11-03", null);
        const b = await consultarMemoriasCategoria("conta-b", "familia", "2026-11-01", "2026-11-03", null);
        assert.deepEqual(a.itens.map(item => item.conteudo), ["Texto A"]);
        assert.deepEqual(b.itens.map(item => item.conteudo), ["Texto B"]);
        assert.equal(a.revisao, "2");
        assert.equal(b.revisao, "3");
        assert.equal((await consultarMemoriasCategoria("conta-c", "familia", "2026-11-01", "2026-11-03", null)).itens.length, 0);
    } finally { delete globalThis.indexedDB; }
});

test("consulta lê a composição efetivamente preservada na autoridade", async () => {
    const estados = new Map([["conta-a", { identidadeConta: "conta-a", revisaoCatalogo: 1,
        categorias: [{ identidade: "familia", nome: "Família", versao: 1, ativa: true, everAssociated: true }],
        alteracoes: [], revisaoPanorama: 0, alteracoesPanorama: [], capturas: {} }]]);
    globalThis.indexedDB = bancoPorConta(estados);
    try {
        const { preservar, consultarMemoriasCategoria } = await carregarAutoridade();
        const antes = await consultarMemoriasCategoria("conta-a", "familia", "2026-11-01", "2026-11-03", null);
        assert.deepEqual(antes.itens, []);
        await preservar({ identidadeConta: "conta-a", data: "2026-11-02", memorias: [
            { identidade: "memoria-a", ordem: 0, conteudo: "Texto preservado", tom: 0,
                categorias: [{ identidade: "familia", nome: "Família" }], complementos: [] }
        ] });
        const depois = await consultarMemoriasCategoria("conta-a", "familia", "2026-11-01", "2026-11-03", null);
        assert.equal(depois.revisao, "1");
        assert.deepEqual(depois.itens.map(item => item.conteudo), ["Texto preservado"]);
    } finally { delete globalThis.indexedDB; }
});

test("falha de leitura da autoridade não retorna coleção vazia", async () => {
    globalThis.indexedDB = { open() {
        const pedido = { error: new Error("Banco indisponível") };
        queueMicrotask(() => pedido.onerror());
        return pedido;
    } };
    try {
        const { consultarMemoriasCategoria } = await carregarAutoridade();
        await assert.rejects(
            consultarMemoriasCategoria("conta-a", "familia", "2026-11-01", "2026-11-03", null),
            /Banco indisponível/);
    } finally { delete globalThis.indexedDB; }
});
