import test from "node:test";
import assert from "node:assert/strict";
import { consultarEstadoMemoriasCategoria } from "../../src/Rememore.Client/wwwroot/js/contratoMemoriasCategoriaFake.mjs";
import { registrarAlteracaoPanorama } from "../../src/Rememore.Client/wwwroot/js/contratoPanoramaFake.mjs";

const consultar = (estado, cursor = null, conta = "conta-a", categoria = "familia",
    inicio = "2026-11-01", fim = "2026-11-03") =>
    consultarEstadoMemoriasCategoria(estado, conta, categoria, inicio, fim, cursor);

const memoria = (identidade, ordem, categorias = ["familia"], tom = null) => ({
    identidade, ordem, conteudo: `Conteúdo ${identidade}`, tom,
    categorias: categorias.map(identidade => ({ identidade })),
    complementos: [{ identidade: `complemento-${identidade}`, conteudo: "Não é item" }]
});

test("datas inclusivas, lacunas, categoria, ordem, associação repetida e Tom", () => {
    const estado = { revisaoPanorama: 4, capturas: {
        "2026-11-01": { memorias: [memoria("b", 1, ["familia", "familia"], 0), memoria("a", 1),
            memoria("fora", 0, ["trabalho"])] },
        "2026-11-03": { memorias: [memoria("c", 0, ["familia"], null)] },
        "2026-11-04": { memorias: [memoria("depois", 0)] }
    } };
    const resposta = consultar(estado);
    assert.equal(resposta.estado, 0);
    assert.equal(resposta.revisao, "4");
    assert.deepEqual(resposta.itens.map(item => [item.data, item.identidade, item.ordem, item.tom]), [
        ["2026-11-01", "a", 1, null], ["2026-11-01", "b", 1, 0], ["2026-11-03", "c", 0, null]
    ]);
    assert.ok(resposta.itens.every(item => !Object.hasOwn(item, "complementos")));
    assert.equal(resposta.temMais, false);
    assert.equal(resposta.proximoCursor, null);
    assert.deepEqual(consultar(estado, null, "conta-a", "familia", "2026-11-03", "2026-11-03")
        .itens.map(item => item.identidade), ["c"]);
});

test("coleções de 0, 1, 30 e 65 registros respeitam lotes e continuidade", () => {
    for (const quantidade of [0, 1, 30, 65]) {
        const estado = { revisaoPanorama: 1, capturas: { "2026-11-02": {
            memorias: Array.from({ length: quantidade }, (_, indice) => memoria(`id-${String(indice).padStart(3, "0")}`, indice))
        } } };
        const recebidas = [];
        let cursor = null;
        do {
            const resposta = consultar(estado, cursor);
            assert.equal(resposta.estado, 0);
            assert.ok(resposta.itens.length <= 30);
            recebidas.push(...resposta.itens.map(item => item.identidade));
            cursor = resposta.proximoCursor;
            assert.equal(resposta.temMais, cursor !== null);
        } while (cursor);
        assert.deepEqual(recebidas, Array.from({ length: quantidade }, (_, indice) => `id-${String(indice).padStart(3, "0")}`));
    }
});

test("cursor de outro contexto, malformado ou revisão anterior exige reinício", () => {
    const estado = { revisaoPanorama: 7, capturas: { "2026-11-02": {
        memorias: Array.from({ length: 31 }, (_, indice) => memoria(`id-${indice}`, indice))
    } } };
    const cursor = consultar(estado).proximoCursor;
    assert.ok(cursor);
    assert.equal(consultar(estado, cursor).itens.length, 1);
    assert.equal(consultar(estado, cursor, "conta-b").estado, 1);
    assert.equal(consultar(estado, cursor, "conta-a", "trabalho").estado, 1);
    assert.equal(consultar(estado, cursor, "conta-a", "familia", "2026-11-02").estado, 1);
    assert.equal(consultar(estado, "{invalido").estado, 1);
    assert.equal(consultar(estado, JSON.stringify({ ...JSON.parse(cursor), deslocamento: -1 })).estado, 1);
    estado.capturas["2026-11-02"].memorias.push(memoria("nova", 31));
    registrarAlteracaoPanorama(estado, "2026-11-02", estado.capturas["2026-11-02"]);
    assert.equal(consultar(estado, cursor).estado, 1);
});

test("entrada inválida é distinta de coleção vazia", () => {
    const vazio = { revisaoPanorama: 0, capturas: {} };
    assert.deepEqual(consultar(vazio).itens, []);
    assert.equal(consultar(vazio, null, " ").estado, 3);
    assert.equal(consultar(vazio, null, "conta-a", " ").estado, 3);
    assert.equal(consultar(vazio, null, "conta-a", "familia", "2026-02-30").estado, 3);
    assert.equal(consultar(vazio, null, "conta-a", "familia", "2026-11-03", "2026-11-01").estado, 3);
});
