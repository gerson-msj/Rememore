const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });
const conta = '5e12a398-04f7-4e61-9c2d-6ad97c15b842';
const perfil = fs.mkdtempSync(path.join(pasta, 'descarte-'));
let contexto;
let pagina;

async function chamar(metodo, ...args) {
    return pagina.evaluate(({ metodo, args }) => window.verificacao.invokeMethodAsync(metodo, ...args), { metodo, args });
}

async function fixture(data, origemLocal, revisaoOrigem, conteudo = 'Trabalho local') {
    return { identidadeConta: conta, data, alterado: true, origem: origemLocal, revisaoOrigem,
        memorias: conteudo ? [{ identidade: `memoria-${data}`, conteudo, ordem: 0,
            categorias: [{ identidade: 'categoria-familia', nome: 'Família', origem: 0, versao: 1 }] }] : [] };
}

async function confirmarDescarte() {
    await pagina.getByRole('button', { name: 'Descartar alterações' }).click();
    await pagina.getByRole('dialog').getByRole('button', { name: 'Descartar' }).click();
}

(async () => {
    try {
        contexto = await chromium.launchPersistentContext(perfil, { channel: 'chrome', headless: true });
        await contexto.addInitScript(() => {
            window.registrarVerificacaoTrabalhoLocal = referencia => { window.verificacao = referencia; };
        });
        pagina = await contexto.newPage();
        await pagina.goto(`${origem}/entrar`);
        await pagina.locator('#nome-usuario').fill('usuario');
        await pagina.locator('#senha-login').fill('senha-tecnica');
        await pagina.getByRole('button', { name: 'Entrar', exact: true }).click();
        await pagina.waitForURL('**/principal');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const nuncaPreservada = await fixture('2026-11-02', 1, null);
        assert.equal((await chamar('Gravar', nuncaPreservada)).estado, 0);
        assert.equal((await chamar('Gravar', await fixture('2026-11-04', 1, null, 'Outra data pendente'))).estado, 0);
        await pagina.goto(`${origem}/capturar/2026-11-02?aba=revisar`);
        const descartarNovo = pagina.getByRole('button', { name: 'Descartar alterações' });
        await assert.doesNotReject(() => descartarNovo.waitFor({ state: 'visible' }));
        assert.equal(await descartarNovo.isEnabled(), true);
        await descartarNovo.click();
        const confirmacaoNova = pagina.getByRole('dialog');
        await confirmacaoNova.getByText('Descartar esta captura?').waitFor();
        await confirmacaoNova.getByText('Todo o trabalho deste dia ainda não preservado será removido.').waitFor();
        await confirmacaoNova.getByRole('button', { name: 'Cancelar' }).click();
        assert.equal((await pagina.evaluate(async d => (await import('/js/trabalhoLocal.js')).recuperar(
            '5e12a398-04f7-4e61-9c2d-6ad97c15b842', d), '2026-11-02')).estado, 'sucesso');
        await descartarNovo.click();
        await pagina.keyboard.press('Escape');
        assert.equal((await pagina.evaluate(async d => (await import('/js/trabalhoLocal.js')).recuperar(
            '5e12a398-04f7-4e61-9c2d-6ad97c15b842', d), '2026-11-02')).estado, 'sucesso');
        await confirmarDescarte();
        await pagina.waitForURL('**/capturar');
        await pagina.getByRole('heading', { name: 'Capturas pendentes' }).waitFor();
        assert.equal(await pagina.getByRole('button', { name: 'Abrir captura de 02/11/2026' }).count(), 0);
        assert.equal(await pagina.getByRole('button', { name: 'Abrir captura de 04/11/2026' }).count(), 1);
        await pagina.goto(`${origem}/capturar/2026-11-02`);
        await pagina.getByRole('navigation', { name: 'Etapas da captura' }).waitFor();
        const reabertaNova = await pagina.evaluate(async d => (await import('/js/trabalhoLocal.js')).recuperar(
            '5e12a398-04f7-4e61-9c2d-6ad97c15b842', d), '2026-11-02');
        assert.equal(reabertaNova.estado, 'sucesso');
        assert.equal(reabertaNova.valor.alterado, false);
        await pagina.goto(`${origem}/capturar/2026-11-02?aba=revisar`);
        const descartarLimpa = pagina.getByRole('button', { name: 'Descartar alterações' });
        await descartarLimpa.waitFor();
        assert.equal(await descartarLimpa.isDisabled(), true);
        console.log('OK: descarte de captura nova, cancelamento, Escape, remoção pendente e reabertura vazia');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const base = await fixture('2026-11-03', 1, null, 'Versão preservada original');
        assert.equal((await chamar('PreservarFake', base)).estado, 0);
        const alterada = await fixture('2026-11-03', 2, '1', 'Alteração local não preservada');
        assert.equal((await chamar('Gravar', alterada)).estado, 0);
        await pagina.goto(`${origem}/capturar/2026-11-03?aba=revisar`);
        await pagina.getByRole('button', { name: 'Descartar alterações' }).click();
        const confirmacaoPreservada = pagina.getByRole('dialog');
        await confirmacaoPreservada.getByText('Descartar as alterações deste dia?').waitFor();
        await confirmacaoPreservada.getByText('A versão já preservada deste dia será mantida sem alterações.').waitFor();

        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.delete;
            window.restaurarDelete = () => { IDBObjectStore.prototype.delete = original; };
            IDBObjectStore.prototype.delete = function () { throw new DOMException('Falha técnica simulada', 'UnknownError'); };
        });
        await confirmacaoPreservada.getByRole('button', { name: 'Descartar' }).click();
        await pagina.getByRole('dialog').getByText('Não foi possível descartar').waitFor();
        await pagina.getByRole('dialog').getByText('Suas alterações continuam protegidas neste dispositivo. Tente novamente.').waitFor();
        assert.match(pagina.url(), /capturar\/2026-11-03\?aba=revisar/);
        assert.equal((await pagina.evaluate(async d => (await import('/js/trabalhoLocal.js')).recuperar(
            '5e12a398-04f7-4e61-9c2d-6ad97c15b842', d), '2026-11-03')).estado, 'sucesso');
        await pagina.getByRole('dialog').getByRole('button', { name: 'OK' }).click();
        await pagina.evaluate(() => window.restaurarDelete());
        assert.equal(await pagina.getByRole('button', { name: 'Descartar alterações' }).isEnabled(), true);
        await confirmarDescarte();
        await pagina.waitForURL('**/capturar');
        await pagina.goto(`${origem}/capturar/2026-11-03`);
        await pagina.getByText('Versão preservada original').waitFor();
        assert.equal(await pagina.getByText('Alteração local não preservada').count(), 0);
        console.log('OK: descarte de alteração preservada, falha recuperável e recuperação da versão canônica');
    } finally {
        await contexto?.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
