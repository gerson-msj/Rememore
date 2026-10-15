// Executa contra Blazor real com o andaime temporário descrito no README.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-trabalho-local');
fs.mkdirSync(pasta, { recursive: true });
const perfil = fs.mkdtempSync(path.join(pasta, 'perfil-'));
const resultados = [];
let contexto;
let pagina;
async function abrir() {
    contexto = await chromium.launchPersistentContext(perfil, { channel: 'chrome', headless: true });
    await contexto.addInitScript(() => {
        window.registrarVerificacaoTrabalhoLocal = referencia => { window.verificacao = referencia; };
    });
    pagina = await contexto.newPage();
}
async function visitar() {
    await pagina.goto(`${origem}/verificacao-trabalho-local`);
    await pagina.waitForFunction(() => !!window.verificacao);
}
async function chamar(metodo, ...args) {
    return pagina.evaluate(({ metodo, args }) => window.verificacao.invokeMethodAsync(metodo, ...args), { metodo, args });
}
async function cenario(nome, executar) {
    await executar();
    resultados.push(nome);
    console.log(`OK: ${nome}`);
}
const contaA = '5e12a398-04f7-4e61-9c2d-6ad97c15b842';
const contaB = '179beb1d-98cd-4224-bc19-6802c4793912';
const captura = { identidadeConta: contaA, data: '2026-10-14', alterado: false,
    origem: 0, revisaoOrigem: null,
    memorias: [{ identidade: '21c9e8bb-fd2f-409e-a88c-1dfc6e42aa70', conteudo: 'Primeira', ordem: 0 },
        { identidade: '643a3c38-e9e7-4ef7-ac89-884e244b6717', conteudo: 'Segunda', ordem: 1 }] };
async function verificarCaptura(esperada = captura) {
    const r = await chamar('Recuperar', contaA, captura.data);
    assert.equal(r.estado, 0);
    assert.deepEqual(r.valor, esperada);
}
(async () => {
    try {
        await abrir();
        await visitar();
        await cenario('Primeira abertura, diagnóstico e reabertura via C#/JS', async () => {
            assert.equal((await chamar('Diagnosticar')).estado, 0);
            assert.equal((await chamar('Diagnosticar')).estado, 0);
            assert.equal(await chamar('IdentidadeConta'), null);
        });
        await cenario('Sessão existente v2 compatível e identidade opaca após login', async () => {
            await pagina.goto(`${origem}/entrar`);
            await pagina.locator('#nome-usuario').fill('usuario');
            await pagina.locator('#senha-login').fill('senha-tecnica');
            await pagina.getByRole('button', { name: 'Entrar', exact: true }).click();
            await pagina.waitForURL('**/principal');
            await visitar();
            assert.equal(await chamar('IdentidadeConta'), contaA);
            const sessao = await pagina.evaluate(() => JSON.parse(localStorage.getItem('rememore.sessao.simulada.v2')));
            assert.equal(sessao.versao, 2);
            assert.ok(!JSON.stringify(sessao).includes('senha-tecnica'));
        });
        await cenario('Ausência legítima e consulta vazia distintas de falha', async () => {
            assert.equal((await chamar('Recuperar', contaA, captura.data)).estado, 1);
            assert.equal((await chamar('Remover', contaA, captura.data)).estado, 1);
            assert.deepEqual((await chamar('Consultar', contaA)).valor, []);
        });
        await cenario('CRUD, chave única, isolamento de duas contas, limpo/alterado', async () => {
            assert.equal((await chamar('Gravar', captura)).estado, 0);
            assert.equal((await chamar('Gravar', { ...captura, identidadeConta: contaB, alterado: true })).estado, 0);
            await verificarCaptura();
            assert.equal((await chamar('Consultar', contaA)).valor.length, 1);
            assert.equal((await chamar('Consultar', contaB)).valor[0].alterado, true);
            assert.equal((await chamar('Remover', contaB, captura.data)).estado, 0);
            assert.equal((await chamar('Consultar', contaB)).valor.length, 0);
            await verificarCaptura();
        });
        const alterada = { ...captura, alterado: true, memorias: [
            { ...captura.memorias[1], conteudo: 'Segunda editada', ordem: 0 },
            { ...captura.memorias[0], conteudo: 'Primeira editada', ordem: 1 }] };
        await cenario('Datas distintas da mesma conta não se substituem nem se removem', async () => {
            const outraData = { ...captura, data: '2026-10-15' };
            assert.equal((await chamar('Gravar', outraData)).estado, 0);
            assert.equal((await chamar('Consultar', contaA)).valor.length, 2);
            assert.deepEqual((await chamar('Recuperar', contaA, outraData.data)).valor, outraData);
            assert.equal((await chamar('Remover', contaA, outraData.data)).estado, 0);
            await verificarCaptura();
        });
        await cenario('Substituição preserva identidades e ordem explícita', async () => {
            assert.equal((await chamar('Gravar', alterada)).estado, 0);
            await verificarCaptura(alterada);
            assert.equal((await chamar('Consultar', contaA)).valor.length, 1);
        });
        await cenario('Marcação e descarte transacionais protegem Alterado', async () => {
            const temporaria = { ...captura, data: '2026-10-12', memorias: [] };
            assert.equal((await chamar('GravarSeLimpo', temporaria)).estado, 0);
            assert.equal((await chamar('RemoverSeAlterado', contaA, temporaria.data)).estado, 1);
            assert.equal((await chamar('Recuperar', contaA, temporaria.data)).estado, 0);
            assert.equal((await chamar('MarcarAlterado', contaA, temporaria.data)).valor.alterado, true);
            assert.equal((await chamar('MarcarAlterado', contaA, temporaria.data)).valor.alterado, true);
            const substituicao = await chamar('GravarSeLimpo', { ...temporaria, alterado: false });
            assert.equal(substituicao.estado, 3);
            assert.equal(substituicao.falha.codigo, 'CapturaAlterada');
            assert.equal((await chamar('Recuperar', contaA, temporaria.data)).valor.alterado, true);
            assert.equal((await chamar('RemoverSeAlterado', contaA, temporaria.data)).estado, 0);
            assert.equal((await chamar('Recuperar', contaA, temporaria.data)).estado, 1);
        });
        await cenario('Diagnóstico não modifica captura e não deixa resíduos', async () => {
            assert.equal((await chamar('Diagnosticar')).estado, 0);
            await verificarCaptura(alterada);
            assert.equal(await pagina.evaluate(async () => {
                const { abrirBanco, transacionar } = await import('/js/bancoTrabalhoLocal.js');
                const banco = await abrirBanco();
                try {
                    return (await transacionar(banco, ['diagnostico'], 'readonly', 'teste', (tx, concluir) => {
                        const pedido = tx.objectStore('diagnostico').count();
                        pedido.onsuccess = () => concluir({ estado: 'sucesso', valor: pedido.result });
                    })).valor;
                } finally { banco.close(); }
            }), 0);
        });
        await cenario('F5 recupera captura e identidade autenticada', async () => {
            await pagina.reload();
            await pagina.waitForFunction(() => !!window.verificacao);
            await verificarCaptura(alterada);
            assert.equal(await chamar('IdentidadeConta'), contaA);
        });
        await cenario('Fechamento/reabertura do navegador e nova visita preservam dados', async () => {
            await contexto.close();
            await abrir();
            await visitar();
            await verificarCaptura(alterada);
            assert.equal(await chamar('IdentidadeConta'), contaA);
        });
        await cenario('API indisponível e abertura negada são resultados explícitos em C#', async () => {
            const respostas = await pagina.evaluate(async () => {
                const descritor = Object.getOwnPropertyDescriptor(globalThis, 'indexedDB');
                const fabrica = indexedDB;
                try {
                    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined });
                    const indisponivel = await window.verificacao.invokeMethodAsync('Diagnosticar');
                    Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: { open() { throw new DOMException('Teste', 'SecurityError'); } } });
                    const negada = await window.verificacao.invokeMethodAsync('Recuperar', 'conta', '2026-10-14');
                    return { indisponivel, negada };
                } finally {
                    if (descritor) Object.defineProperty(globalThis, 'indexedDB', descritor);
                    else { delete globalThis.indexedDB; if (indexedDB !== fabrica) throw Error('Restauração falhou'); }
                }
            });
            assert.equal(respostas.indisponivel.estado, 2);
            assert.equal(respostas.negada.estado, 3);
            assert.equal(respostas.negada.falha.etapa, 'abertura');
        });
        await cenario('Abort após success do put não confirma nem altera dados', async () => {
            const resposta = await pagina.evaluate(async (registro) => {
                const original = IDBObjectStore.prototype.put;
                IDBObjectStore.prototype.put = function (...args) {
                    const pedido = original.apply(this, args);
                    pedido.addEventListener('success', () => this.transaction.abort());
                    return pedido;
                };
                try {
                    return {
                        captura: await window.verificacao.invokeMethodAsync('Gravar', registro),
                        diagnostico: await window.verificacao.invokeMethodAsync('Diagnosticar')
                    };
                }
                finally { IDBObjectStore.prototype.put = original; }
            }, { ...captura, memorias: [] });
            assert.equal(resposta.captura.estado, 3);
            assert.equal(resposta.captura.falha.codigo, 'AbortError');
            assert.equal(resposta.diagnostico.estado, 3);
            assert.equal((await chamar('Diagnosticar')).estado, 0);
            await verificarCaptura(alterada);
        });
        await cenario('Falhas em leitura, escrita, consulta, remoção e transação', async () => {
            const respostas = await pagina.evaluate(async ({ captura, contaA }) => {
                const resultados = [];
                for (const [api, metodo, args] of [
                    ['get', 'Recuperar', [contaA, captura.data]], ['put', 'Gravar', [captura]],
                    ['getAll', 'Consultar', [contaA]], ['delete', 'Remover', [contaA, captura.data]]]) {
                    const original = IDBObjectStore.prototype[api];
                    const originalIndice = IDBIndex.prototype[api];
                    const negar = () => { throw new DOMException('Teste', 'UnknownError'); };
                    IDBObjectStore.prototype[api] = negar;
                    if (originalIndice) IDBIndex.prototype[api] = negar;
                    try { resultados.push(await window.verificacao.invokeMethodAsync(metodo, ...args)); }
                    finally {
                        IDBObjectStore.prototype[api] = original;
                        if (originalIndice) IDBIndex.prototype[api] = originalIndice;
                    }
                }
                const original = IDBDatabase.prototype.transaction;
                IDBDatabase.prototype.transaction = () => { throw new DOMException('Teste', 'InvalidStateError'); };
                try { resultados.push(await window.verificacao.invokeMethodAsync('Diagnosticar')); }
                finally { IDBDatabase.prototype.transaction = original; }
                return resultados;
            }, { captura, contaA });
            assert.ok(respostas.every(r => r.estado === 3));
            await verificarCaptura(alterada);
        });
        await cenario('Upgrade bloqueado, falha de migração e preservação de Alterado legado', async () => {
            const r = await pagina.evaluate(async (captura) => {
                const { abrirBanco, transacionar, migracoes } = await import('/js/bancoTrabalhoLocal.js');
                const nome = 'rememore.verificacao.evolucao';
                const banco = await abrirBanco(nome, [migracoes[0]]);
                const { origem, revisaoOrigem, ...legado } = captura;
                await transacionar(banco, ['capturas'], 'readwrite', 'teste', tx => tx.objectStore('capturas').put(legado));
                banco.onversionchange = () => {}; // Simula outra aba antiga mantendo conexão aberta.
                let bloqueado;
                try { await abrirBanco(nome); }
                catch (erro) { bloqueado = erro.etapa; }
                banco.close();
                // A abertura abandonada deve abortar o upgrade quando a outra aba liberar.
                const anterior = await abrirBanco(nome, [migracoes[0]]);
                const versaoAposBloqueio = anterior.version;
                anterior.close();
                let falhou;
                try { await abrirBanco(nome, [migracoes[0], db => db.createObjectStore('capturas')]); }
                catch (erro) { falhou = erro.etapa; }
                const novo = await abrirBanco(nome);
                const versao = novo.version;
                const leitura = await transacionar(novo, ['capturas'], 'readonly', 'teste', (tx, concluir) => {
                    const pedido = tx.objectStore('capturas').get([captura.identidadeConta, captura.data]);
                    pedido.onsuccess = () => concluir({ estado: 'sucesso', valor: pedido.result });
                });
                novo.close();
                await new Promise((resolve, reject) => {
                    const pedido = indexedDB.deleteDatabase(nome);
                    pedido.onsuccess = resolve; pedido.onerror = reject;
                });
                return { bloqueado, falhou, versaoAposBloqueio, versao, leitura };
            }, alterada);
            assert.equal(r.bloqueado, 'upgradeBloqueado');
            assert.equal(r.falhou, 'upgrade');
            assert.equal(r.versaoAposBloqueio, 1);
            assert.equal(r.versao, 2);
            assert.deepEqual(r.leitura.valor, alterada);
        });
        await cenario('Principal e Seleção de Capturar continuam disponíveis', async () => {
            await pagina.goto(`${origem}/principal`);
            await pagina.locator('h1.is-sr-only').filter({ hasText: 'Rememore' }).waitFor();
            await pagina.goto(`${origem}/capturar`);
            await pagina.getByRole('heading', { name: 'Escolha o dia que deseja capturar', level: 1 }).waitFor();
        });
        fs.writeFileSync(path.join(pasta, 'resultado.json'), JSON.stringify({ data: new Date().toISOString(), origem, perfil, resultados }, null, 2));
        console.log(`${resultados.length} cenários aprovados. Evidência: ${pasta}`);
    } finally { await contexto?.close(); }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
