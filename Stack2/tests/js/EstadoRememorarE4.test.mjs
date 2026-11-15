import test from "node:test";
import assert from "node:assert/strict";

const armazenamentos = () => {
    const valores = new Map();
    return {
        getItem: chave => valores.has(chave) ? valores.get(chave) : null,
        setItem: (chave, valor) => valores.set(chave, String(valor)),
        removeItem: chave => valores.delete(chave),
        valores
    };
};

test("preferência de ordenação persiste separada por conta", async () => {
    globalThis.localStorage = armazenamentos();
    const modulo = await import(`../../src/Rememore.Client/wwwroot/js/estadoRememorar.js?teste=${Date.now()}`);
    const preferencia = { criterio: "Tom", sentido: "Nulo" };

    assert.equal(modulo.gravarOrdenacao("conta-a", preferencia), true);
    assert.deepEqual(modulo.lerOrdenacao("conta-a"), preferencia);
    assert.equal(modulo.lerOrdenacao("conta-b"), null);
    assert.equal(modulo.gravarOrdenacao("conta-a", { criterio: "Tom", sentido: "invalido" }), false);
});

test("contexto dura na jornada da aba, valida a conta e pode ser descartado", async () => {
    globalThis.sessionStorage = armazenamentos();
    const modulo = await import(`../../src/Rememore.Client/wwwroot/js/estadoRememorar.js?teste=${Date.now()}-ctx`);
    const contexto = {
        versao: 1, identidadeConta: "conta-a", identidadeSessao: "sessao-a", posicaoInicio: .2, posicaoFim: .9,
        ultimaDataInicio: "2026-11-01", ultimaDataFim: "2026-11-08", categoriaSelecionada: "categoria-1", rolagem: 0
    };

    assert.equal(modulo.gravarContexto("conta-a", "sessao-a", contexto), true);
    assert.deepEqual(modulo.lerContexto("conta-a", "sessao-a"), contexto);
    assert.equal(modulo.lerContexto("conta-b", "sessao-a"), null);
    assert.equal(modulo.lerContexto("conta-a", "sessao-b"), null);
    assert.equal(modulo.gravarContexto("conta-a", "sessao-a", { ...contexto, posicaoInicio: 1.2 }), false);
    modulo.removerContexto("conta-a");
    assert.equal(modulo.lerContexto("conta-a", "sessao-a"), null);
});

test("grava a rolagem em pagehide, restaura a posição e remove os listeners", async () => {
    globalThis.localStorage = armazenamentos();
    globalThis.sessionStorage = armazenamentos();
    const listeners = new Map();
    let rolagemRestaurada = -1;
    globalThis.window = {
        scrollY: 0,
        addEventListener: (nome, callback) => listeners.set(nome, callback),
        removeEventListener: nome => listeners.delete(nome),
        scrollTo: ({ top }) => { rolagemRestaurada = top; }
    };
    globalThis.requestAnimationFrame = callback => callback();
    const modulo = await import(`../../src/Rememore.Client/wwwroot/js/estadoRememorar.js?teste=${Date.now()}-scroll`);
    modulo.gravarContexto("conta-a", "sessao-a", {
        versao: 1, identidadeConta: "conta-a", identidadeSessao: "sessao-a", posicaoInicio: 0, posicaoFim: 1,
        ultimaDataInicio: null, ultimaDataFim: null, categoriaSelecionada: null
    });
    modulo.conectarRolagem("conta-a", "sessao-a");
    window.scrollY = 456;
    listeners.get("pagehide")();
    assert.equal(modulo.lerContexto("conta-a", "sessao-a").rolagem, 456);
    modulo.restaurarRolagem("conta-a", 456);
    assert.equal(rolagemRestaurada, 456);
    modulo.desconectarRolagem("conta-a");
    assert.equal(listeners.size, 0);
});
