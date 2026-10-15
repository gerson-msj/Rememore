import { executarNoBanco, transacionar, falha } from "./bancoTrabalhoLocal.js";

export function diagnosticar() {
    return executarNoBanco("diagnostico", (banco) => transacionar(banco, ["diagnostico"], "readwrite", "diagnostico", (transacao) => {
        const store = transacao.objectStore("diagnostico");
        const identidade = crypto.randomUUID();
        store.put({ identidade, valor: identidade });
        const leitura = store.get(identidade);
        leitura.onsuccess = () => {
            if (leitura.result?.valor !== identidade) { transacao.abort(); return; }
            store.delete(identidade);
        };
    }));
}

function validarConta(identidadeConta) {
    if (typeof identidadeConta !== "string" || !identidadeConta.trim()) throw new TypeError("Identidade de conta obrigatoria.");
}

function validarChave(identidadeConta, data) {
    validarConta(identidadeConta);
    if (typeof data !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(data)
        || !Number.isFinite(Date.parse(data)) || new Date(data).toISOString().slice(0, 10) !== data) {
        throw new TypeError("Data invalida.");
    }
}

function validarCaptura(captura) {
    validarChave(captura.identidadeConta, captura.data);
    if (typeof captura.alterado !== "boolean" || !Array.isArray(captura.memorias)) throw new TypeError("Composicao invalida.");
    const origem = captura.origem ?? 0;
    if (![0, 1, 2].includes(origem)
        || (origem === 2 && (typeof captura.revisaoOrigem !== "string" || !captura.revisaoOrigem.trim()))
        || (origem !== 2 && captura.revisaoOrigem != null)) throw new TypeError("Origem invalida.");
    const identidades = new Set();
    for (const memoria of captura.memorias) {
        if (typeof memoria.identidade !== "string" || !memoria.identidade.trim() || identidades.has(memoria.identidade)
            || typeof memoria.conteudo !== "string" || !Number.isInteger(memoria.ordem)) throw new TypeError("Memoria invalida.");
        identidades.add(memoria.identidade);
    }
}

function operacaoValidada(etapa, validar, executar) {
    try { validar(); }
    catch (erro) { return Promise.resolve(falha("validacao", erro)); }
    return executarNoBanco(etapa, executar);
}

export function gravar(captura) {
    return operacaoValidada("escrita", () => validarCaptura(captura), (banco) =>
        transacionar(banco, ["capturas"], "readwrite", "escrita", (transacao) => {
            transacao.objectStore("capturas").put({ ...captura, origem: captura.origem ?? 0,
                revisaoOrigem: captura.revisaoOrigem ?? null,
                memorias: [...captura.memorias].sort((a, b) => a.ordem - b.ordem) });
        }));
}

export function gravarSeLimpo(captura) {
    return operacaoValidada("escrita", () => validarCaptura(captura), (banco) =>
        transacionar(banco, ["capturas"], "readwrite", "escrita", (transacao, concluir) => {
            const store = transacao.objectStore("capturas");
            const pedido = store.get([captura.identidadeConta, captura.data]);
            pedido.onsuccess = () => {
                if (pedido.result?.alterado) {
                    concluir(falha("escrita", { name: "CapturaAlterada" }));
                    return;
                }
                try {
                    store.put({ ...captura, origem: captura.origem ?? 0,
                        revisaoOrigem: captura.revisaoOrigem ?? null,
                        memorias: [...captura.memorias].sort((a, b) => a.ordem - b.ordem) });
                } catch { transacao.abort(); }
            };
        }));
}

export function marcarAlterado(identidadeConta, data) {
    return operacaoValidada("marcacao", () => validarChave(identidadeConta, data), (banco) =>
        transacionar(banco, ["capturas"], "readwrite", "marcacao", (transacao, concluir) => {
            const store = transacao.objectStore("capturas");
            const pedido = store.get([identidadeConta, data]);
            pedido.onsuccess = () => {
                if (pedido.result === undefined) { concluir({ estado: "ausente" }); return; }
                const captura = { ...pedido.result, alterado: true };
                try {
                    store.put(captura);
                    concluir({ estado: "sucesso", valor: captura });
                } catch { transacao.abort(); }
            };
        }));
}

export function removerSeAlterado(identidadeConta, data) {
    return operacaoValidada("remocao", () => validarChave(identidadeConta, data), (banco) =>
        transacionar(banco, ["capturas"], "readwrite", "remocao", (transacao, concluir) => {
            const store = transacao.objectStore("capturas");
            const pedido = store.get([identidadeConta, data]);
            pedido.onsuccess = () => {
                if (pedido.result === undefined || !pedido.result.alterado) {
                    concluir({ estado: "ausente" });
                    return;
                }
                try { store.delete([identidadeConta, data]); }
                catch { transacao.abort(); }
            };
        }));
}

export function recuperar(identidadeConta, data) {
    return operacaoValidada("leitura", () => validarChave(identidadeConta, data), (banco) =>
        transacionar(banco, ["capturas"], "readonly", "leitura", (transacao, concluir) => {
            const pedido = transacao.objectStore("capturas").get([identidadeConta, data]);
            pedido.onsuccess = () => concluir(pedido.result === undefined ? { estado: "ausente" } : { estado: "sucesso", valor: pedido.result });
        }));
}

export function remover(identidadeConta, data) {
    return operacaoValidada("remocao", () => validarChave(identidadeConta, data), (banco) =>
        transacionar(banco, ["capturas"], "readwrite", "remocao", (transacao, concluir) => {
            const store = transacao.objectStore("capturas");
            const pedido = store.getKey([identidadeConta, data]);
            pedido.onsuccess = () => {
                if (pedido.result === undefined) concluir({ estado: "ausente" });
                else store.delete([identidadeConta, data]);
            };
        }));
}

export function consultar(identidadeConta) {
    return operacaoValidada("consulta", () => validarConta(identidadeConta), (banco) =>
        transacionar(banco, ["capturas"], "readonly", "consulta", (transacao, concluir) => {
            const pedido = transacao.objectStore("capturas").index("porConta").getAll(identidadeConta);
            pedido.onsuccess = () => concluir({ estado: "sucesso", valor: pedido.result });
        }));
}
