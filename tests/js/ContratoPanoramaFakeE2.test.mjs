import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import {
    construirBlocoPanorama,
    consultarEstadoPanorama,
    registrarAlteracaoPanorama
} from "../../src/Rememore.Client/wwwroot/js/contratoPanoramaFake.mjs";

function captura(categorias, tom) {
    return { memorias: [{ conteudo: "texto que não deve sair na projeção", tom,
        categorias: categorias.map(identidade => ({ identidade })) }] };
}

function criarDias(quantidade) {
    const capturas = {};
    const inicio = new Date("2025-01-01T00:00:00Z");
    for (let i = 0; i < quantidade; i++) {
        const data = new Date(inicio.getTime() + i * 3 * 86400000).toISOString().slice(0, 10);
        const categoria = `categoria-${i % 40}`;
        const ids = i === 0 ? Array.from({ length: 40 }, (_, indice) => `categoria-${indice}`)
            : i % 4 === 0 ? ["categoria-0", "categoria-1"]
                : i % 3 === 0 ? [categoria, `categoria-${(i + 1) % 40}`] : [categoria];
        const tom = i === 0 ? 0 : [-100, -20, 0, 15, 100, null][i % 6];
        capturas[data] = { memorias: [
            { conteudo: "texto omitido", tom, categorias: ids.map(identidade => ({ identidade })) },
            ...(i % 4 === 0 ? [{ conteudo: "outro texto omitido", tom: null,
                categorias: [{ identidade: "categoria-0" }] }] : [])
        ] };
    }
    return capturas;
}

test("cenários determinísticos cobrem 2, 7, 30 e 300 dias e até 40 categorias", () => {
    for (const quantidade of [2, 7, 30, 300]) {
        const estado = { capturas: criarDias(quantidade), revisaoPanorama: 0, alteracoesPanorama: [] };
        const resposta = consultarEstadoPanorama(estado, null);
        assert.equal(resposta.estado, 0);
        assert.equal(resposta.dias.length, quantidade);
        assert.ok(resposta.dias.every(dia => dia.associacoes.every(item =>
            Object.keys(item).sort().join(",") === "identidadeCategoria,tom")));
        assert.ok(resposta.dias.some(dia => dia.associacoes.length > 1));
        assert.ok(resposta.dias.flatMap(dia => dia.associacoes).some(item => item.tom === 0));
        if (quantidade >= 7) {
            assert.ok(resposta.dias.flatMap(dia => dia.associacoes).some(item => item.tom < 0));
            assert.ok(resposta.dias.flatMap(dia => dia.associacoes).some(item => item.tom > 0));
            assert.ok(resposta.dias.flatMap(dia => dia.associacoes).some(item => item.tom === null));
        }
        assert.equal(new Set(resposta.dias.flatMap(dia => dia.associacoes.map(item => item.identidadeCategoria))).size, 40);
    }
});

test("delta envia bloco atual completo, tombstone e recriação, sem texto preservado", () => {
    const data = "2026-11-01";
    const estado = { capturas: { [data]: captura(["familia"], -10) }, revisaoPanorama: 0, alteracoesPanorama: [] };
    registrarAlteracaoPanorama(estado, data, estado.capturas[data]);
    estado.capturas[data] = captura(["familia", "trabalho"], 0);
    registrarAlteracaoPanorama(estado, data, estado.capturas[data]);
    let resposta = consultarEstadoPanorama(estado, "1");
    assert.equal(resposta.estado, 2);
    assert.equal(resposta.alteracoes.length, 1);
    assert.equal(resposta.alteracoes[0].bloco.associacoes.length, 2);
    assert.equal(resposta.alteracoes[0].bloco.associacoes[0].tom, 0);
    assert.equal("conteudo" in resposta.alteracoes[0].bloco, false);

    delete estado.capturas[data];
    registrarAlteracaoPanorama(estado, data, null);
    resposta = consultarEstadoPanorama(estado, "2");
    assert.equal(resposta.alteracoes[0].tipo, 1);
    assert.equal("bloco" in resposta.alteracoes[0], false);

    estado.capturas[data] = captura(["viagens"], null);
    registrarAlteracaoPanorama(estado, data, estado.capturas[data]);
    resposta = consultarEstadoPanorama(estado, "3");
    assert.equal(resposta.alteracoes[0].bloco.associacoes[0].identidadeCategoria, "viagens");
});

test("revisão atual não retransmite blocos e histórico vencido pede reconstrução", () => {
    const estado = { capturas: { "2026-11-01": captura(["familia"], 0) }, revisaoPanorama: 2,
        alteracoesPanorama: [{ revisao: 1, data: "2026-11-01", bloco: construirBlocoPanorama("2026-11-01", captura(["familia"], 0)) },
            { revisao: 2, data: "2026-11-01", bloco: construirBlocoPanorama("2026-11-01", captura(["familia"], null)) }] };
    assert.deepEqual(consultarEstadoPanorama(estado, "2"), { estado: 1, revisao: "2" });
    estado.alteracoesPanorama = [{ revisao: 1001, data: "2026-11-01", bloco: null }];
    estado.revisaoPanorama = 1001;
    const resposta = consultarEstadoPanorama(estado, "0");
    assert.equal(resposta.estado, 3);
    assert.equal(resposta.dias.length, 1);
});

test("migração v3 para v4 acrescenta a store e preserva dados locais existentes", async () => {
    const caminhoBanco = new URL("../../src/Rememore.Client/wwwroot/js/bancoTrabalhoLocal.js", import.meta.url);
    const codigoBanco = await readFile(fileURLToPath(caminhoBanco), "utf8");
    const { abrirBanco } = await import(`data:text/javascript;base64,${Buffer.from(codigoBanco).toString("base64")}`);
    const capturaStore = { dado: { identidadeConta: "conta-a", data: "2026-11-01", memorias: [{ conteudo: "preservada" }] } };
    const stores = new Map([
        ["capturas", capturaStore], ["diagnostico", {}], ["catalogosCategorias", { dado: { identidadeConta: "conta-a" } }]
    ]);
    const banco = {
        version: 3,
        createObjectStore(nome) { const store = {}; stores.set(nome, store); return store; },
        close() { }
    };
    globalThis.indexedDB = { open(_nome, versao) {
        const request = { result: banco, transaction: {} };
        queueMicrotask(() => {
            if (versao > banco.version) request.onupgradeneeded({ oldVersion: banco.version });
            banco.version = versao;
            request.onsuccess();
        });
        return request;
    } };

    const aberto = await abrirBanco();
    assert.equal(aberto.version, 4);
    assert.equal(stores.get("capturas"), capturaStore);
    assert.equal(capturaStore.dado.memorias[0].conteudo, "preservada");
    assert.ok(stores.has("catalogosCategorias"));
    assert.ok(stores.has("projecoesPanorama"));
    aberto.close();
    delete globalThis.indexedDB;
});
