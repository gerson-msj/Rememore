const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });

(async () => {
    const contexto = await chromium.launchPersistentContext(
        fs.mkdtempSync(path.join(pasta, 'perfil-')), { channel: 'chrome', headless: true });
    const pagina = await contexto.newPage();
    const erros = [];
    pagina.on('pageerror', erro => erros.push(erro.message));
    try {
        await pagina.goto(`${origem}/entrar`);
        await pagina.locator('#nome-usuario').fill('usuario');
        await pagina.locator('#senha-login').fill('senha-tecnica');
        await pagina.getByRole('button', { name: 'Entrar', exact: true }).click();
        await pagina.waitForURL('**/principal');
        assert.equal(await pagina.getByText('Capturas pendentes', { exact: true }).count(), 0);

        await pagina.getByRole('button', { name: /Capturar Preserve/ }).click();
        await pagina.waitForURL('**/capturar');
        await pagina.getByText('Você pode capturar qualquer dia até hoje. Escolha uma data para começar.').waitFor();
        const hoje = await pagina.evaluate(() => {
            const data = new Date();
            return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
        });
        const campo = pagina.getByLabel('Data da captura');
        assert.equal(await campo.inputValue(), hoje);
        assert.equal(await campo.getAttribute('max'), hoje);
        await pagina.screenshot({ path: path.join(pasta, 'selecao-desktop.png'), fullPage: true });

        await pagina.getByRole('button', { name: 'Capturar', exact: true }).click();
        await pagina.waitForURL(`**/capturar/${hoje}`);
        await pagina.getByText('Workspace limpo').waitFor();
        await pagina.getByRole('button', { name: 'Marcar como alterada' }).click();
        await pagina.getByText('Workspace alterado').waitFor();
        await pagina.screenshot({ path: path.join(pasta, 'captura-desktop.png'), fullPage: true });
        await pagina.reload();
        await pagina.getByText('Workspace alterado').waitFor();

        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/capturar');
        await pagina.getByRole('heading', { name: 'Capturas pendentes' }).waitFor();
        await pagina.getByRole('button', { name: /Apagar captura de/ }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
        await pagina.getByRole('heading', { name: 'Capturas pendentes' }).waitFor();
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/principal');
        await pagina.getByRole('link', { name: 'Capturas pendentes' }).waitFor();
        await pagina.getByRole('link', { name: 'Capturas pendentes' }).click();
        await pagina.waitForURL('**/capturar');
        await pagina.getByRole('button', { name: /Apagar captura de/ }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Apagar' }).click();
        await pagina.getByRole('heading', { name: 'Capturas pendentes' }).waitFor({ state: 'detached' });
        await pagina.getByRole('button', { name: 'Voltar' }).click();
        await pagina.waitForURL('**/principal');
        assert.equal(await pagina.getByRole('link', { name: 'Capturas pendentes' }).count(), 0);

        await pagina.goto(`${origem}/capturar/2099-01-01`);
        await pagina.getByText('Data inválida. Escolha uma data completa, existente e até hoje.').waitFor();
        assert.equal(erros.length, 0, erros.join('\n'));
        console.log('Navegação integrada de Capturar validada.');
    } finally {
        await contexto.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
