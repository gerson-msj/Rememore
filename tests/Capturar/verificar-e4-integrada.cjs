const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });
const conta = '5e12a398-04f7-4e61-9c2d-6ad97c15b842';
const perfil = fs.mkdtempSync(path.join(pasta, 'e4-integrada-'));
let contexto;
let pagina;

function workspace(data, origemLocal, revisaoOrigem, conteudo, categoria = 'Família', identidade = `mem-${data}`) {
    const memorias = conteudo === null ? [] : [{ identidade, conteudo, ordem: 0,
        primeiraPreservacaoUtc: '2000-01-01T00:00:00Z', temporalidadeConhecida: true,
        complementos: [{ identidade: `comp-${data}`, conteudo: 'Complemento integrado', ordem: 0,
            primeiraPreservacaoUtc: '2000-01-01T00:00:00Z', temporalidadeConhecida: true }],
        categorias: [{ identidade: 'local-categoria-integrada', nome: categoria, origem: 1 }],
        tom: 2, balancoSentimental: 'Balanço integrado.' }];
    return { identidadeConta: conta, data, alterado: true, origem: origemLocal, revisaoOrigem, memorias };
}

async function chamar(metodo, ...args) {
    return pagina.evaluate(({ metodo, args }) => window.verificacao.invokeMethodAsync(metodo, ...args), { metodo, args });
}
async function abrirAndaime() {
    await pagina.goto(`${origem}/verificacao-trabalho-local`);
    await pagina.waitForFunction(() => !!window.verificacao);
}
async function gravarLocal(captura) { assert.equal((await chamar('Gravar', captura)).estado, 0); }
async function preservarFake(captura) {
    const resultado = await chamar('PreservarFake', captura);
    assert.equal(resultado.estado, 0);
    return resultado;
}
async function abrirRevisao(data) {
    await pagina.goto(`${origem}/capturar/${data}?aba=revisar`);
    await pagina.getByRole('group', { name: 'Ações da revisão' }).waitFor();
}
async function clicarPreservar() {
    await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
}
async function clicarDescartar() { await pagina.getByRole('button', { name: 'Descartar alterações' }).click(); }
async function lerLocal(data) {
    return pagina.evaluate(({ conta, data }) => import('/js/trabalhoLocal.js').then(m => m.recuperar(conta, data)), { conta, data });
}
async function lerFake(data) {
    return pagina.evaluate(({ conta, data }) => import('/js/autoridadeCapturaFake.js').then(m => m.obterCompleta(conta, data)), { conta, data });
}
async function confirmarPopup(rotulo) { await pagina.getByRole('dialog').getByRole('button', { name: rotulo }).click(); }
async function fecharPopup() { await confirmarPopup('OK'); }

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
        await abrirAndaime();

        const dataA = '2026-11-01';
        const inicial = workspace(dataA, 1, null, 'Composição A preservada');
        await gravarLocal(inicial);
        await gravarLocal(workspace('2026-11-04', 1, null, 'Outra data permanece pendente'));
        await abrirRevisao(dataA);
        await clicarPreservar();
        await pagina.getByRole('dialog').getByText('Preservar as memórias deste dia?').waitFor();
        await confirmarPopup('Preservar');
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        await fecharPopup();
        const remotaA = await lerFake(dataA);
        assert.equal(remotaA.revisao, '1');
        assert.equal(remotaA.memorias[0].conteudo, 'Composição A preservada');
        assert.notEqual(remotaA.memorias[0].primeiraPreservacaoUtc, '2000-01-01T00:00:00Z');
        assert.notEqual(remotaA.memorias[0].complementos[0].primeiraPreservacaoUtc, '2000-01-01T00:00:00Z');
        const categoriaCanonica = remotaA.memorias[0].categorias[0].identidade;
        await pagina.getByRole('button', { name: 'Abrir captura de 04/11/2026' }).waitFor();
        assert.equal(await pagina.getByRole('button', { name: 'Abrir captura de 01/11/2026' }).count(), 0);
        console.log('OK: preservar, retornar à Seleção, manter outra pendência e criar historicidade canônica');

        await abrirAndaime();
        await gravarLocal(workspace(dataA, 2, '1', 'Alteração que será descartada', 'Leitura', `mem-${dataA}`));
        await abrirRevisao(dataA);
        await clicarDescartar();
        await pagina.getByRole('dialog').getByText('Descartar as alterações deste dia?').waitFor();
        await confirmarPopup('Descartar');
        await pagina.waitForURL('**/capturar');
        await pagina.getByRole('button', { name: 'Abrir captura de 04/11/2026' }).waitFor();
        assert.equal(await pagina.getByRole('button', { name: 'Abrir captura de 04/11/2026' }).count(), 1);
        assert.equal(await pagina.getByRole('button', { name: 'Abrir captura de 01/11/2026' }).count(), 0);
        await pagina.goto(`${origem}/capturar/${dataA}`);
        await pagina.getByText('Composição A preservada').waitFor();
        assert.equal((await lerFake(dataA)).revisao, '1');
        console.log('OK: descartar alteração sobre versão preservada e recuperar a versão sem mudanças');

        await abrirAndaime();
        const antesDePreservarNovamente = await lerFake(dataA);
        const workspaceRevisao = workspace(dataA, 2, '1', 'Composição A preservada de novo', 'Família', `mem-${dataA}`);
        workspaceRevisao.memorias[0].categorias[0].identidade = categoriaCanonica;
        await gravarLocal(workspaceRevisao);
        await abrirRevisao(dataA);
        await clicarPreservar();
        await confirmarPopup('Preservar');
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        await fecharPopup();
        const depoisDePreservarNovamente = await lerFake(dataA);
        assert.equal(depoisDePreservarNovamente.revisao, '2');
        assert.equal(depoisDePreservarNovamente.memorias[0].identidade, `mem-${dataA}`);
        assert.equal(depoisDePreservarNovamente.memorias[0].primeiraPreservacaoUtc,
            antesDePreservarNovamente.memorias[0].primeiraPreservacaoUtc);
        assert.equal(depoisDePreservarNovamente.memorias[0].categorias[0].identidade, categoriaCanonica);
        await pagina.reload();
        assert.equal((await lerFake(dataA)).revisao, '2');
        assert.equal((await lerFake(dataA)).memorias[0].conteudo, 'Composição A preservada de novo');
        console.log('OK: preservar novamente mantém identidade, categoria e historicidade após F5');

        await abrirAndaime();
        const dataB = '2026-11-02';
        const remotoB = await preservarFake(workspace(dataB, 1, null, 'Versão B inicial'));
        await preservarFake(workspace(dataB, 2, remotoB.revisao, 'Versão B mais recente'));
        await gravarLocal(workspace(dataB, 2, remotoB.revisao, 'Trabalho local recusado'));
        await abrirRevisao(dataB);
        await clicarPreservar();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        await confirmarPopup('Não substituir');
        await pagina.getByRole('dialog').getByText('Alterações mantidas').waitFor();
        assert.equal((await lerLocal(dataB)).valor.alterado, true);
        assert.equal((await lerFake(dataB)).memorias[0].conteudo, 'Versão B mais recente');
        await fecharPopup();
        await clicarDescartar();
        await confirmarPopup('Descartar');
        await pagina.waitForURL('**/capturar');
        await pagina.goto(`${origem}/capturar/${dataB}`);
        await pagina.getByText('Versão B mais recente').waitFor();
        assert.equal((await lerFake(dataB)).revisao, '2');
        console.log('OK: recusar conflito, descartar trabalho local e recuperar a versão remota mais recente');

        await abrirAndaime();
        const dataC = '2026-11-03';
        const baseC = await preservarFake(workspace(dataC, 1, null, 'Memória C removida'));
        await gravarLocal(workspace(dataC, 2, baseC.revisao, null));
        await abrirRevisao(dataC);
        await clicarPreservar();
        await pagina.getByRole('dialog').getByText('Confirmar a exclusão de todas as memórias?').waitFor();
        await confirmarPopup('Confirmar exclusão');
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        const vazia = await lerFake(dataC);
        assert.equal(vazia.revisao, '2');
        assert.deepEqual(vazia.memorias, []);
        await fecharPopup();
        await pagina.goto(`${origem}/capturar/${dataC}`);
        await pagina.getByRole('navigation', { name: 'Etapas da captura' }).waitFor();
        const recuperadaVazia = await lerLocal(dataC);
        assert.equal(recuperadaVazia.estado, 'sucesso');
        assert.equal(recuperadaVazia.valor.alterado, false);
        assert.deepEqual(recuperadaVazia.valor.memorias, []);
        console.log('OK: preservar exclusão total e reabrir a data com composição funcional vazia');

        const contaB = '179beb1d-98cd-4224-bc19-6802c4793912';
        await abrirAndaime();
        const separada = { ...workspace(dataA, 1, null, 'Captura de outra conta'), identidadeConta: contaB };
        await preservarFake(separada);
        const isolamento = await pagina.evaluate(async ({ contaA, contaB, data }) => {
            const autoridade = await import('/js/autoridadeCapturaFake.js');
            return { a: await autoridade.obterCompleta(contaA, data), b: await autoridade.obterCompleta(contaB, data) };
        }, { contaA: conta, contaB, data: dataA });
        assert.equal(isolamento.a.memorias[0].conteudo, 'Composição A preservada de novo');
        assert.equal(isolamento.b.memorias[0].conteudo, 'Captura de outra conta');
        console.log('OK: autoridade fake mantém contas isoladas durante os cruzamentos integrados');
    } finally {
        await contexto?.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
