const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const origem = process.env.REMEMORE_URL || 'http://localhost:5193';
const pasta = path.resolve('artifacts/verificacao-capturar');
fs.mkdirSync(pasta, { recursive: true });
const conta = '5e12a398-04f7-4e61-9c2d-6ad97c15b842';
const perfil = fs.mkdtempSync(path.join(pasta, 'preservacao-'));
let contexto;
let pagina;

function fixture(data, origemLocal, revisaoOrigem, conteudo = 'Conteúdo local', identidade = `memoria-${data}`) {
    const memorias = conteudo === null ? [] : [{ identidade, conteudo, ordem: 0,
        categorias: [{ identidade: 'categoria-familia', nome: 'Família', origem: 0, versao: 1 }],
        complementos: [{ identidade: `complemento-${data}`, conteudo: 'Detalhe complementar', ordem: 0 }],
        tom: 2, balancoSentimental: 'Um balanço opcional.' }];
    return { identidadeConta: conta, data, alterado: true, origem: origemLocal, revisaoOrigem, memorias };
}

async function chamar(metodo, ...args) {
    return pagina.evaluate(({ metodo, args }) => window.verificacao.invokeMethodAsync(metodo, ...args), { metodo, args });
}

async function gravarLocal(captura) { assert.equal((await chamar('Gravar', captura)).estado, 0); }
async function preservarFake(captura) {
    const resultado = await chamar('PreservarFake', captura);
    assert.equal(resultado.estado, 0);
    return resultado;
}
async function abrirRevisao(data) {
    await pagina.goto(`${origem}/capturar/${data}?aba=revisar`);
    await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).waitFor();
}
async function confirmar() {
    await pagina.getByRole('dialog').getByRole('button', { name: 'Preservar' }).click();
}
async function lerLocal(data) {
    return pagina.evaluate(async ({ conta, data }) => (await import('/js/trabalhoLocal.js')).recuperar(conta, data), { conta, data });
}
async function lerFake(data) {
    return pagina.evaluate(async ({ conta, data }) => (await import('/js/autoridadeCapturaFake.js')).obterCompleta(conta, data), { conta, data });
}
async function lerCatalogo() {
    return pagina.evaluate(async conta => (await import('/js/autoridadeCapturaFake.js')).consultarCatalogo(conta, null), conta);
}
async function fecharPopupFalha() {
    await pagina.getByRole('dialog').getByRole('button', { name: 'OK' }).click();
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

        const nova = fixture('2026-11-01', 1, null, 'Memória nova integral');
        await gravarLocal(nova);
        await abrirRevisao(nova.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        const confirmacaoNova = pagina.getByRole('dialog');
        await confirmacaoNova.getByText('Preservar as memórias deste dia?').waitFor();
        await confirmacaoNova.getByText('A composição atual deste dia será preservada. Se já existir uma versão preservada, ela será substituída.').waitFor();
        await confirmacaoNova.getByRole('button', { name: 'Cancelar' }).click();
        assert.equal((await lerLocal(nova.data)).valor.alterado, true);
        assert.equal((await lerFake(nova.data)).estado, 1);

        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await confirmar();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        await pagina.getByRole('dialog').getByText('Memórias preservadas').waitFor();
        await pagina.getByRole('dialog').getByText('As memórias deste dia foram preservadas com sucesso.').waitFor();
        await fecharPopupFalha();
        assert.equal((await lerLocal(nova.data)).estado, 'ausente');
        const salvaNova = await lerFake(nova.data);
        assert.equal(salvaNova.revisao, '1');
        assert.equal(salvaNova.memorias[0].conteudo, 'Memória nova integral');
        assert.ok(salvaNova.memorias[0].primeiraPreservacaoUtc);
        assert.ok(salvaNova.memorias[0].complementos[0].primeiraPreservacaoUtc);
        await pagina.goto(`${origem}/capturar/${nova.data}`);
        await pagina.getByText('Memória nova integral').waitFor();
        console.log('OK: captura nova, confirmação/cancelamento, sucesso, remoção local e recuperação integral');

        const dataExistente = '2026-11-04';
        const original = fixture(dataExistente, 1, null, 'Versão anterior', 'memoria-estavel');
        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const primeira = await preservarFake(original);
        const dataOriginal = (await lerFake(dataExistente)).memorias[0].primeiraPreservacaoUtc;
        const editada = fixture(dataExistente, 2, primeira.revisao, 'Versão atualizada', 'memoria-estavel');
        await gravarLocal(editada);
        await abrirRevisao(dataExistente);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Preservar as memórias deste dia?').waitFor();
        await confirmar();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        await fecharPopupFalha();
        const salvaAtualizada = await lerFake(dataExistente);
        assert.equal(salvaAtualizada.revisao, '2');
        assert.equal(salvaAtualizada.memorias[0].identidade, 'memoria-estavel');
        assert.equal(salvaAtualizada.memorias[0].primeiraPreservacaoUtc, dataOriginal);
        assert.equal(salvaAtualizada.memorias[0].conteudo, 'Versão atualizada');
        console.log('OK: revisão compatível, avanço da revisão, identidade e historicidade estáveis');

        const divergente = '2026-11-05';
        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const remotaInicial = fixture(divergente, 1, null, 'Remoto inicial', 'memoria-conflito');
        const primeiraRemota = await preservarFake(remotaInicial);
        await preservarFake(fixture(divergente, 2, primeiraRemota.revisao, 'Remoto mais recente', 'memoria-conflito'));
        const localDesatualizada = fixture(divergente, 2, primeiraRemota.revisao, 'Trabalho local desatualizado', 'memoria-conflito');
        await gravarLocal(localDesatualizada);
        await abrirRevisao(divergente);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        await pagina.getByRole('dialog').getByText('As memórias preservadas deste dia mudaram desde que você começou esta captura. Se continuar, suas alterações substituirão o que está preservado atualmente.').waitFor();
        assert.equal((await lerLocal(divergente)).valor.alterado, true);
        assert.equal((await lerFake(divergente)).memorias[0].conteudo, 'Remoto mais recente');
        await pagina.getByRole('dialog').getByRole('button', { name: 'Não substituir' }).click();
        await pagina.getByRole('dialog').getByText('Alterações mantidas').waitFor();
        await pagina.getByRole('dialog').getByText('Nada foi substituído. Suas alterações continuam nesta captura. Se não quiser mais mantê-las, você pode usar Descartar alterações.').waitFor();
        await fecharPopupFalha();
        assert.equal((await lerFake(divergente)).memorias[0].conteudo, 'Remoto mais recente');
        console.log('OK: conflito normal recusado sem substituir nenhuma versão');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const ausenteVirouPresente = fixture(dataExistente, 1, null, 'Trabalho iniciado sem versão');
        await gravarLocal(ausenteVirouPresente);
        await abrirRevisao(dataExistente);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        assert.equal((await lerLocal(dataExistente)).valor.alterado, true);
        assert.equal((await lerFake(dataExistente)).revisao, '2');
        await pagina.getByRole('dialog').getByRole('button', { name: 'Não substituir' }).click();
        await pagina.getByRole('dialog').getByText('Alterações mantidas').waitFor();
        await fecharPopupFalha();

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const presenteVirouAusente = fixture('2026-11-06', 2, 'revisao-antiga', 'Trabalho baseado em versão removida');
        await gravarLocal(presenteVirouAusente);
        await abrirRevisao(presenteVirouAusente.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        assert.equal((await lerLocal(presenteVirouAusente.data)).valor.alterado, true);
        assert.equal((await lerFake(presenteVirouAusente.data)).estado, 1);
        await pagina.getByRole('dialog').getByRole('button', { name: 'Não substituir' }).click();
        await pagina.getByRole('dialog').getByText('Alterações mantidas').waitFor();
        await fecharPopupFalha();

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const origemDesconhecida = fixture('2026-11-02', 0, null, 'Origem antiga desconhecida');
        await gravarLocal(origemDesconhecida);
        await abrirRevisao(origemDesconhecida.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Não foi possível confirmar a versão preservada deste dia. Suas alterações continuam protegidas neste dispositivo. Tente preservar novamente.').waitFor();
        assert.equal((await lerLocal(origemDesconhecida.data)).valor.alterado, true);
        assert.equal((await lerFake(origemDesconhecida.data)).estado, 1);
        await fecharPopupFalha();
        console.log('OK: origem desconhecida interrompe sem sobrescrever');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const conflitoAceitoData = '2026-10-30';
        const remotoAceitoInicial = await preservarFake(fixture(conflitoAceitoData, 1, null, 'Versão remota inicial', 'memoria-substituida'));
        const historiaDaMemoriaSubstituida = (await lerFake(conflitoAceitoData)).memorias[0].primeiraPreservacaoUtc;
        await preservarFake(fixture(conflitoAceitoData, 2, remotoAceitoInicial.revisao, 'Versão remota recente', 'memoria-substituida'));
        await gravarLocal(fixture(conflitoAceitoData, 2, remotoAceitoInicial.revisao, 'Minha composição substituta', 'memoria-substituida'));
        await abrirRevisao(conflitoAceitoData);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Preservar minhas alterações' }).click();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        await pagina.getByRole('dialog').getByText('As memórias deste dia foram preservadas com sucesso.').waitFor();
        await fecharPopupFalha();
        const substituida = await lerFake(conflitoAceitoData);
        assert.equal(substituida.revisao, '3');
        assert.equal(substituida.memorias[0].conteudo, 'Minha composição substituta');
        assert.equal(substituida.memorias[0].identidade, 'memoria-substituida');
        assert.equal(substituida.memorias[0].primeiraPreservacaoUtc, historiaDaMemoriaSubstituida);
        assert.equal(substituida.memorias[0].categorias[0].identidade, 'categoria-familia');
        console.log('OK: substituição consciente grava uma vez e reutiliza o encerramento comum');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const vaziaPreservadaData = '2026-10-31';
        const baseVazia = await preservarFake(fixture(vaziaPreservadaData, 1, null, 'Memória removida localmente', 'memoria-removida'));
        const localVazia = fixture(vaziaPreservadaData, 2, baseVazia.revisao, null);
        await gravarLocal(localVazia);
        await abrirRevisao(vaziaPreservadaData);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        const confirmarExclusaoTotal = pagina.getByRole('dialog');
        await confirmarExclusaoTotal.getByText('Confirmar a exclusão de todas as memórias?').waitFor();
        await confirmarExclusaoTotal.getByText('Você removeu todas as memórias deste dia. Ao preservar, essa exclusão será confirmada e nenhuma memória ficará preservada para esta data.').waitFor();
        await confirmarExclusaoTotal.getByRole('button', { name: 'Cancelar' }).click();
        assert.equal((await lerFake(vaziaPreservadaData)).memorias.length, 1);
        assert.equal((await lerLocal(vaziaPreservadaData)).valor.alterado, true);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar exclusão' }).click();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        const preservacaoVazia = await lerFake(vaziaPreservadaData);
        assert.equal(preservacaoVazia.revisao, '2');
        assert.deepEqual(preservacaoVazia.memorias, []);
        assert.equal((await lerLocal(vaziaPreservadaData)).estado, 'ausente');
        const categoriasAposExclusao = await lerCatalogo();
        assert.equal(categoriasAposExclusao.categorias.find(item => item.identidade === 'categoria-familia').ativa, true);
        await fecharPopupFalha();
        console.log('OK: exclusão total confirmada sem conflito preserva composição vazia e categorias usadas em outras datas');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const conflitoVazioData = '2026-10-29';
        const remotoVazioInicial = await preservarFake(fixture(conflitoVazioData, 1, null, 'Versão que será alterada', 'memoria-vazia-conflito'));
        await preservarFake(fixture(conflitoVazioData, 2, remotoVazioInicial.revisao, 'Versão remota mais recente', 'memoria-vazia-conflito'));
        await gravarLocal(fixture(conflitoVazioData, 2, remotoVazioInicial.revisao, null));
        await abrirRevisao(conflitoVazioData);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar exclusão' }).click();
        const decisaoVazia = pagina.getByRole('dialog');
        await decisaoVazia.getByText('Este dia possui memórias mais recentes.').waitFor();
        await decisaoVazia.getByText('As memórias preservadas deste dia mudaram desde que você começou esta captura. Se confirmar a exclusão, essas memórias mais recentes também serão apagadas.').waitFor();
        await decisaoVazia.getByRole('button', { name: 'Não excluir' }).click();
        await pagina.getByRole('dialog').getByText('Alterações mantidas').waitFor();
        assert.equal((await lerFake(conflitoVazioData)).memorias[0].conteudo, 'Versão remota mais recente');
        assert.deepEqual((await lerLocal(conflitoVazioData)).valor.memorias, []);
        await fecharPopupFalha();
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Confirmar exclusão' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Excluir mesmo assim' }).click();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=sucesso');
        const exclusaoConflitante = await lerFake(conflitoVazioData);
        assert.equal(exclusaoConflitante.revisao, '3');
        assert.deepEqual(exclusaoConflitante.memorias, []);
        await fecharPopupFalha();
        console.log('OK: conflito de exclusão total permite recusar sem alteração ou excluir com confirmação explícita');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const falhaDecisaoData = '2026-10-28';
        const remotoFalhaInicial = await preservarFake(fixture(falhaDecisaoData, 1, null, 'Base de conflito', 'memoria-falha-conflito'));
        await preservarFake(fixture(falhaDecisaoData, 2, remotoFalhaInicial.revisao, 'Remoto atualizado', 'memoria-falha-conflito'));
        await gravarLocal(fixture(falhaDecisaoData, 2, remotoFalhaInicial.revisao, 'Substituição que falhará', 'memoria-falha-local'));
        await abrirRevisao(falhaDecisaoData);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Este dia possui alterações mais recentes.').waitFor();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.put;
            window.restaurarGravacaoConflito = () => { IDBObjectStore.prototype.put = original; };
            IDBObjectStore.prototype.put = function (...args) {
                if (this.transaction.db.name === 'rememore.autoridade.fake') throw new DOMException('Falha simulada', 'UnknownError');
                return original.apply(this, args);
            };
        });
        await pagina.getByRole('dialog').getByRole('button', { name: 'Preservar minhas alterações' }).click();
        await pagina.getByRole('dialog').getByText('Não foi possível preservar').waitFor();
        await pagina.evaluate(() => window.restaurarGravacaoConflito());
        assert.equal((await lerLocal(falhaDecisaoData)).valor.alterado, true);
        assert.equal((await lerFake(falhaDecisaoData)).memorias[0].conteudo, 'Remoto atualizado');
        await fecharPopupFalha();
        console.log('OK: falha após decisão de substituição mantém as versões protegidas');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const vazia = fixture('2026-11-06', 1, null, null);
        await gravarLocal(vazia);
        await abrirRevisao(vazia.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Não há memórias nesta captura para preservar.').waitFor();
        assert.equal((await lerLocal(vazia.data)).valor.alterado, true);
        assert.equal((await lerFake(vazia.data)).estado, 1);
        await fecharPopupFalha();
        console.log('OK: captura vazia impedida sem alterar workspace ou autoridade');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const falhaVerificacao = fixture('2026-11-02', 1, null, 'Falha de conferência');
        await gravarLocal(falhaVerificacao);
        await abrirRevisao(falhaVerificacao.data);
        await pagina.evaluate(() => {
            const original = IDBFactory.prototype.open;
            window.restaurarAberturaFake = () => { IDBFactory.prototype.open = original; };
            IDBFactory.prototype.open = function (nome, ...args) {
                if (nome === 'rememore.autoridade.fake') throw new DOMException('Falha simulada', 'UnknownError');
                return original.call(this, nome, ...args);
            };
        });
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByText('Não foi possível preservar').waitFor();
        await pagina.evaluate(() => window.restaurarAberturaFake());
        assert.equal((await lerLocal(falhaVerificacao.data)).valor.alterado, true);
        assert.equal((await lerFake(falhaVerificacao.data)).estado, 1);
        await fecharPopupFalha();
        console.log('OK: falha de conferência preserva o workspace e permite nova tentativa');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const falhaGravacao = fixture('2026-11-03', 1, null, 'Falha de gravação');
        await gravarLocal(falhaGravacao);
        await abrirRevisao(falhaGravacao.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).waitFor();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.put;
            window.restaurarGravacaoFake = () => { IDBObjectStore.prototype.put = original; };
            IDBObjectStore.prototype.put = function (...args) {
                if (this.transaction.db.name === 'rememore.autoridade.fake') throw new DOMException('Falha simulada', 'UnknownError');
                return original.apply(this, args);
            };
        });
        await confirmar();
        await pagina.getByRole('dialog').getByText('Não foi possível preservar').waitFor();
        await pagina.evaluate(() => window.restaurarGravacaoFake());
        assert.equal((await lerLocal(falhaGravacao.data)).valor.alterado, true);
        assert.equal((await lerFake(falhaGravacao.data)).estado, 1);
        await fecharPopupFalha();
        console.log('OK: falha de gravação mantém workspace e não confirma ausência remota como sucesso');

        await pagina.goto(`${origem}/verificacao-trabalho-local`);
        await pagina.waitForFunction(() => !!window.verificacao);
        const falhaLocal = fixture('2026-11-02', 1, null, 'Gravação remota confirmada');
        await gravarLocal(falhaLocal);
        await abrirRevisao(falhaLocal.data);
        await pagina.getByRole('group', { name: 'Ações da revisão' }).getByRole('button', { name: 'Preservar' }).click();
        await pagina.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).waitFor();
        await pagina.evaluate(() => {
            const original = IDBObjectStore.prototype.delete;
            window.restaurarRemocaoLocal = () => { IDBObjectStore.prototype.delete = original; };
            IDBObjectStore.prototype.delete = function (...args) {
                if (this.transaction.db.name === 'rememore.trabalho.local.dotnet') throw new DOMException('Falha simulada', 'UnknownError');
                return original.apply(this, args);
            };
        });
        await confirmar();
        await pagina.waitForURL('**/capturar?resultadoPreservacao=falha-local');
        await pagina.getByRole('dialog').getByText('Suas memórias foram preservadas, mas não foi possível atualizar esta captura neste dispositivo. Ela poderá continuar aparecendo como pendente até que o armazenamento local volte a funcionar corretamente.').waitFor();
        await pagina.evaluate(() => window.restaurarRemocaoLocal());
        assert.equal((await lerLocal(falhaLocal.data)).valor.alterado, true);
        assert.equal((await lerFake(falhaLocal.data)).revisao, '1');
        await fecharPopupFalha();
        assert.equal((await lerFake(falhaLocal.data)).revisao, '1');
        console.log('OK: falha de remoção local após sucesso remoto não repete a gravação');
    } finally {
        await contexto?.close();
    }
})().catch(erro => { console.error(erro); process.exitCode = 1; });
