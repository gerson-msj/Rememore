const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });
const dataTeste = '2026-10-13';

(async () => {
    const contexto = await chromium.launchPersistentContext(
        fs.mkdtempSync(path.join(pasta, 'cenarios-')), { channel: 'chrome', headless: true });
    await contexto.addInitScript(() => {
        window.registrarVerificacaoCapturar = referencia => { window.verificacaoCapturar = referencia; };
    });
    const pagina = await contexto.newPage();
    const erros = [];
    pagina.on('pageerror', erro => erros.push(erro.message));
    const chamar = (metodo, ...args) => pagina.evaluate(
        ({ metodo, args }) => window.verificacaoCapturar.invokeMethodAsync(metodo, ...args), { metodo, args });
    async function visitarAndaime() {
        await pagina.goto(`${origem}/verificacao-capturar`);
        await pagina.waitForFunction(() => !!window.verificacaoCapturar);
    }
    async function voltarAoAndaime() {
        await pagina.evaluate(() => { window.verificacaoCapturar = null; });
        await pagina.goBack();
        await pagina.waitForURL('**/verificacao-capturar');
        await pagina.waitForFunction(() => !!window.verificacaoCapturar);
    }
    async function recuperar(data) {
        return pagina.evaluate(async data => {
            const { recuperar } = await import('/js/trabalhoLocal.js');
            return recuperar('5e12a398-04f7-4e61-9c2d-6ad97c15b842', data);
        }, data);
    }
    try {
        await pagina.goto(`${origem}/entrar`);
        await pagina.locator('#nome-usuario').fill('usuario');
        await pagina.locator('#senha-login').fill('senha-tecnica');
        await pagina.getByRole('button', { name: 'Entrar', exact: true }).click();
        await pagina.waitForURL('**/principal');
        await visitarAndaime();
        assert.ok(await chamar('IdentidadeConta'));

        await chamar('DefinirNivel', 1);
        await chamar('NavegarSelecao');
        await pagina.waitForURL('**/capturar');
        await pagina.getByText('Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.').waitFor();
        assert.equal(await pagina.locator('.selecao-capturar__orientacao').evaluate(el => getComputedStyle(el).whiteSpace), 'pre-wrap');
        await voltarAoAndaime();
        await chamar('DefinirNivel', 2);
        await chamar('NavegarSelecao');
        await pagina.waitForURL('**/capturar');
        assert.equal(await pagina.locator('.selecao-capturar__orientacao').count(), 0);
        await voltarAoAndaime();

        await chamar('DefinirRemoto', dataTeste, 'presente', 'rev-1');
        await chamar('NavegarCaptura', dataTeste);
        await pagina.waitForURL(`**/capturar/${dataTeste}`);
        await pagina.getByText('Workspace limpo').waitFor();
        assert.equal((await recuperar(dataTeste)).valor.revisaoOrigem, 'rev-1');
        assert.equal((await recuperar(dataTeste)).valor.memorias.length, 1);
        await voltarAoAndaime();
        await chamar('DefinirRemoto', dataTeste, 'presente', 'rev-2');
        await chamar('NavegarCaptura', dataTeste);
        await pagina.waitForURL(`**/capturar/${dataTeste}`);
        await pagina.getByText('Workspace limpo').waitFor();
        assert.equal((await recuperar(dataTeste)).valor.revisaoOrigem, 'rev-2');
        await voltarAoAndaime();
        assert.equal(await chamar('LeiturasRemotas'), 2);
        await chamar('NavegarCaptura', dataTeste);
        await pagina.waitForURL(`**/capturar/${dataTeste}`);
        await pagina.getByText('Workspace limpo').waitFor();
        await pagina.reload();
        await pagina.getByText('Workspace limpo').waitFor();
        assert.equal((await recuperar(dataTeste)).valor.revisaoOrigem, 'rev-2');
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/capturar');
        await pagina.getByLabel('Data da captura').fill(dataTeste);
        await pagina.getByRole('button', { name: 'Capturar', exact: true }).click();
        await pagina.waitForURL(`**/capturar/${dataTeste}`);
        await pagina.getByText('Workspace limpo').waitFor();
        assert.equal((await recuperar(dataTeste)).valor.origem, 1);

        await visitarAndaime();
        await chamar('DefinirRemoto', '2026-10-12', 'falha', null);
        await chamar('NavegarCaptura', '2026-10-12');
        await pagina.getByText('Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.').waitFor();
        assert.equal((await recuperar('2026-10-12')).estado, 'ausente');
        await visitarAndaime();
        await chamar('DefinirRemoto', '2026-10-11', 'inconclusiva', null);
        await chamar('NavegarCaptura', '2026-10-11');
        await pagina.getByText('Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.').waitFor();

        await visitarAndaime();
        await pagina.evaluate(() => {
            window.contagemCaptura = 0;
            const original = indexedDB.open;
            indexedDB.open = function (...args) { window.contagemCaptura++; return original.apply(this, args); };
        });
        await chamar('NavegarCaptura', '2026-02-30');
        await pagina.getByText('Data inválida. Escolha uma data completa, existente e até hoje.').waitFor();
        assert.equal(await pagina.evaluate(() => window.contagemCaptura), 0);

        await visitarAndaime();
        await pagina.evaluate(() => {
            Object.defineProperty(globalThis, 'indexedDB', { configurable: true, value: undefined });
        });
        await chamar('NavegarCaptura', '2026-10-10');
        await pagina.getByText('Não é possível iniciar uma captura neste navegador.', { exact: false }).waitFor();
        await visitarAndaime();
        await pagina.evaluate(() => {
            const original = IDBDatabase.prototype.transaction;
            window.restaurarTransacao = () => { IDBDatabase.prototype.transaction = original; };
            IDBDatabase.prototype.transaction = () => { throw new DOMException('Teste', 'InvalidStateError'); };
        });
        await chamar('NavegarCaptura', '2026-10-09');
        await pagina.getByText('Não foi possível acessar o armazenamento local.', { exact: false }).waitFor();
        await pagina.evaluate(() => window.restaurarTransacao());

        await visitarAndaime();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.get;
            window.restaurarLeitura = () => { IDBObjectStore.prototype.get = original; };
            IDBObjectStore.prototype.get = function (...args) {
                if (this.name === 'capturas') throw new DOMException('Teste', 'UnknownError');
                return original.apply(this, args);
            };
        });
        await chamar('NavegarCaptura', '2026-10-08');
        await pagina.getByText('Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.').waitFor();
        await pagina.evaluate(() => window.restaurarLeitura());

        await visitarAndaime();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.put;
            window.restaurarEscrita = () => { IDBObjectStore.prototype.put = original; };
            IDBObjectStore.prototype.put = function (...args) {
                if (this.name === 'capturas') throw new DOMException('Teste', 'UnknownError');
                return original.apply(this, args);
            };
        });
        await chamar('NavegarCaptura', '2026-10-07');
        await pagina.getByText('Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente.').waitFor();
        await pagina.evaluate(() => window.restaurarEscrita());
        assert.equal((await recuperar('2026-10-07')).estado, 'ausente');

        await visitarAndaime();
        await chamar('NavegarSelecao');
        await pagina.waitForURL('**/capturar');
        const campo = pagina.getByLabel('Data da captura');
        await campo.fill('');
        assert.equal(await pagina.getByRole('button', { name: 'Capturar', exact: true }).isDisabled(), true);
        await campo.evaluate(elemento => elemento.blur());
        await pagina.getByText('DD/MM/AAAA').waitFor();
        await campo.fill('2099-01-01');
        assert.equal(await pagina.getByRole('button', { name: 'Capturar', exact: true }).isDisabled(), true);
        await campo.fill(dataTeste);
        await campo.focus();
        let calendarioAlcancado = false;
        for (let tentativa = 0; tentativa < 8; tentativa++) {
            await pagina.keyboard.press('Tab');
            if (await pagina.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Abrir calendário') {
                calendarioAlcancado = true;
                break;
            }
        }
        assert.equal(calendarioAlcancado, true);
        await pagina.keyboard.press('Tab');
        assert.equal(await pagina.evaluate(() => document.activeElement?.textContent.trim()), 'Capturar');
        await pagina.setViewportSize({ width: 375, height: 812 });
        assert.equal(await pagina.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await pagina.screenshot({ path: path.join(pasta, 'selecao-estreita.png'), fullPage: true });

        assert.deepEqual(erros, []);
        console.log('Cenários de interface, orientação, remoto e falhas concluídos.');
    } finally {
        await contexto.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
