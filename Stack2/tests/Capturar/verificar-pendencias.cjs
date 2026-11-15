const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });
const contaA = '5e12a398-04f7-4e61-9c2d-6ad97c15b842';
const contaB = '179beb1d-98cd-4224-bc19-6802c4793912';
const datas = ['2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04'];

(async () => {
    const contexto = await chromium.launchPersistentContext(
        fs.mkdtempSync(path.join(pasta, 'pendencias-')), { channel: 'chrome', headless: true });
    const pagina = await contexto.newPage();
    const erros = [];
    pagina.on('pageerror', erro => erros.push(erro.message));
    async function gravar(captura) {
        return pagina.evaluate(async captura => {
            const { gravar } = await import('/js/trabalhoLocal.js');
            return gravar(captura);
        }, captura);
    }
    const captura = (conta, data, alterado, origemCaptura, revisaoOrigem = null) => ({
        identidadeConta: conta, data, alterado, origem: origemCaptura, revisaoOrigem, memorias: []
    });
    const abrirExclusao = data => pagina.getByRole('button', { name: `Apagar captura de ${data}` }).click();
    try {
        await pagina.goto(`${origem}/entrar`);
        await pagina.locator('#nome-usuario').fill('usuario');
        await pagina.locator('#senha-login').fill('senha-tecnica');
        await pagina.getByRole('button', { name: 'Entrar', exact: true }).click();
        await pagina.waitForURL('**/principal');

        assert.equal((await gravar(captura(contaA, datas[2], true, 2, 'rev-1'))).estado, 'sucesso');
        assert.equal((await gravar(captura(contaA, datas[0], true, 0))).estado, 'sucesso');
        assert.equal((await gravar(captura(contaA, datas[1], true, 1))).estado, 'sucesso');
        assert.equal((await gravar(captura(contaA, datas[3], false, 1))).estado, 'sucesso');
        assert.equal((await gravar(captura(contaB, '2026-10-05', true, 1))).estado, 'sucesso');

        await pagina.getByRole('button', { name: /Capturar Preserve/ }).click();
        await pagina.waitForURL('**/capturar');
        const itens = pagina.locator('.selecao-capturar__pendencia');
        assert.equal(await itens.count(), 3);
        assert.deepEqual(await itens.locator('a').allTextContents(), ['01/10/2026', '02/10/2026', '03/10/2026']);
        await pagina.screenshot({ path: path.join(pasta, 'selecao-pendencias.png'), fullPage: true });

        await pagina.evaluate(() => {
            const original = IDBIndex.prototype.getAll;
            window.restaurarConsulta = () => { IDBIndex.prototype.getAll = original; };
            IDBIndex.prototype.getAll = () => { throw new DOMException('Teste', 'UnknownError'); };
        });
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/principal');
        await pagina.getByText('Não foi possível verificar as capturas pendentes neste dispositivo.').waitFor();
        assert.equal(await pagina.getByRole('link', { name: 'Capturas pendentes' }).count(), 0);
        await pagina.getByRole('button', { name: /Capturar Preserve/ }).click();
        await pagina.waitForURL('**/capturar');
        await pagina.getByText('Não foi possível verificar as capturas pendentes neste dispositivo.').waitFor();
        await pagina.evaluate(() => window.restaurarConsulta());
        await pagina.getByRole('button', { name: 'Tentar novamente' }).click();
        assert.equal(await itens.count(), 3);

        await abrirExclusao('01/10/2026');
        await pagina.getByRole('dialog').getByText('Apagar o trabalho local de 01/10/2026?').waitFor();
        await pagina.getByRole('dialog').getByText('O trabalho ainda não preservado desta captura será removido. Qualquer conteúdo já preservado será mantido.').waitFor();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
        assert.equal(await itens.count(), 3);

        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.delete;
            window.restaurarRemocao = () => { IDBObjectStore.prototype.delete = original; };
            IDBObjectStore.prototype.delete = () => { throw new DOMException('Teste', 'UnknownError'); };
        });
        await abrirExclusao('01/10/2026');
        await pagina.getByRole('dialog').getByRole('button', { name: 'Apagar' }).click();
        await pagina.getByText('Não foi possível apagar as alterações. Tente novamente.').waitFor();
        assert.equal(await itens.count(), 3);
        await pagina.evaluate(() => window.restaurarRemocao());
        await abrirExclusao('01/10/2026');
        await pagina.getByRole('dialog').getByRole('button', { name: 'Apagar' }).click();
        await pagina.getByRole('button', { name: 'Apagar captura de 01/10/2026' }).waitFor({ state: 'detached' });
        assert.equal(await itens.count(), 2);

        await abrirExclusao('02/10/2026');
        await pagina.getByRole('dialog').getByText('Apagar as memórias de 02/10/2026?').waitFor();
        await pagina.getByRole('dialog').getByText('As memórias desta captura ainda não foram preservadas e serão removidas.').waitFor();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Apagar' }).click();
        await pagina.getByRole('button', { name: 'Apagar captura de 02/10/2026' }).waitFor({ state: 'detached' });
        await abrirExclusao('03/10/2026');
        await pagina.getByRole('dialog').getByText('Apagar as alterações de 03/10/2026?').waitFor();
        await pagina.getByRole('dialog').getByText('As alterações ainda não preservadas serão removidas. As memórias já preservadas desse dia serão mantidas.').waitFor();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Apagar' }).click();
        await pagina.getByRole('button', { name: 'Apagar captura de 03/10/2026' }).waitFor({ state: 'detached' });
        assert.equal(await itens.count(), 0);
        assert.equal(await pagina.getByRole('heading', { name: 'Capturas pendentes' }).count(), 0);

        await pagina.getByLabel('Data da captura').fill(datas[3]);
        await pagina.getByRole('button', { name: 'Capturar', exact: true }).click();
        await pagina.getByText('Workspace limpo').waitFor();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.put;
            window.restaurarEscrita = () => { IDBObjectStore.prototype.put = original; };
            IDBObjectStore.prototype.put = () => { throw new DOMException('Teste', 'UnknownError'); };
        });
        await pagina.getByRole('button', { name: 'Marcar como alterada' }).click();
        await pagina.getByText('Não foi possível marcar a captura como alterada. Tente novamente.').waitFor();
        await pagina.getByText('Workspace limpo').waitFor();
        await pagina.evaluate(() => window.restaurarEscrita());
        await pagina.getByRole('button', { name: 'Marcar como alterada' }).click();
        await pagina.getByText('Workspace alterado').waitFor();
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/capturar');
        assert.equal(await itens.count(), 1);
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/principal');
        await pagina.getByRole('link', { name: 'Capturas pendentes' }).waitFor();
        assert.ok(erros.every(erro => erro === 'Teste'), erros.join('\n'));
        console.log('Pendências, falhas, mensagens e isolamento verificados no Chrome.');
    } finally {
        await contexto.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
