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
        if (memoria.temporalidadeConhecida != null && typeof memoria.temporalidadeConhecida !== "boolean") throw new TypeError("Temporalidade de memoria invalida.");
        if (memoria.primeiraPreservacaoUtc != null && (typeof memoria.primeiraPreservacaoUtc !== "string" || !Number.isFinite(Date.parse(memoria.primeiraPreservacaoUtc)))) throw new TypeError("Marco de preservacao invalido.");
        if (memoria.complementos != null && !Array.isArray(memoria.complementos)) throw new TypeError("Complementos invalidos.");
        if (memoria.temporalidadeConhecida === true && !Array.isArray(memoria.complementos)) throw new TypeError("Metadados completos ausentes.");
        const identidadesComplementos = new Set();
        for (const complemento of memoria.complementos ?? []) {
            if (typeof complemento.identidade !== "string" || !complemento.identidade.trim() || typeof complemento.conteudo !== "string" || !Number.isInteger(complemento.ordem)
                || complemento.ordem < 0 || identidadesComplementos.has(complemento.identidade)
                || (memoria.temporalidadeConhecida === true && complemento.temporalidadeConhecida !== true)
                || (complemento.primeiraPreservacaoUtc != null && (typeof complemento.primeiraPreservacaoUtc !== "string" || !Number.isFinite(Date.parse(complemento.primeiraPreservacaoUtc))))) throw new TypeError("Complemento invalido.");
            identidadesComplementos.add(complemento.identidade);
        }
        const ordens = [...(memoria.complementos ?? [])].map(c => c.ordem).sort((a, b) => a - b);
        if (ordens.some((ordem, indice) => ordem !== indice)) throw new TypeError("Ordem de complementos invalida.");
        identidades.add(memoria.identidade);
    }
}

function complementosLocaisValidos(memoria) {
    const complementos = memoria?.complementos;
    if (memoria?.temporalidadeConhecida !== true || !Array.isArray(complementos)) return false;
    const ids = new Set();
    for (const complemento of complementos) {
        if (typeof complemento.identidade !== "string" || !complemento.identidade.trim() || ids.has(complemento.identidade)
            || typeof complemento.conteudo !== "string" || !Number.isInteger(complemento.ordem) || !complemento.temporalidadeConhecida) return false;
        if (complemento.primeiraPreservacaoUtc != null && (typeof complemento.primeiraPreservacaoUtc !== "string"
            || !/[zZ]|[+-]00:00$/.test(complemento.primeiraPreservacaoUtc) || !Number.isFinite(Date.parse(complemento.primeiraPreservacaoUtc)))) return false;
        ids.add(complemento.identidade);
    }
    return [...complementos].map(c => c.ordem).sort((a, b) => a - b).every((ordem, indice) => ordem === indice);
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

export function confirmarEdicaoMemoria(identidadeConta, data, identidadeMemoria, conteudoAnterior, novoConteudo) {
    return operacaoValidada("edicaoMemoria", () => {
        validarChave(identidadeConta, data);
        if (typeof identidadeMemoria !== "string" || !identidadeMemoria.trim() || typeof conteudoAnterior !== "string" || typeof novoConteudo !== "string" || !novoConteudo.trim()) throw new TypeError("Edicao de memoria invalida.");
    }, (banco) => transacionar(banco, ["capturas"], "readwrite", "edicaoMemoria", (transacao, concluir) => {
        const store = transacao.objectStore("capturas");
        const pedido = store.get([identidadeConta, data]);
        pedido.onsuccess = () => {
            const captura = pedido.result;
            const memoria = captura?.memorias?.find(item => item.identidade === identidadeMemoria);
            if (!captura || !memoria || memoria.conteudo !== conteudoAnterior) { concluir(falha("edicaoMemoria", { name: "MemoriaAlterada" })); return; }
            const memorias = captura.memorias.map(item => item.identidade === identidadeMemoria ? { ...item, conteudo: novoConteudo } : item);
            const atualizado = { ...captura, alterado: true, memorias };
            store.put(atualizado);
            concluir({ estado: "sucesso", valor: atualizado });
        };
    }));
}

export function excluirMemoriaSemComplementos(identidadeConta, data, identidadeMemoria, conteudoConfirmado) {
    return operacaoValidada("exclusaoMemoria", () => {
        validarChave(identidadeConta, data);
        if (typeof identidadeMemoria !== "string" || !identidadeMemoria.trim() || typeof conteudoConfirmado !== "string") throw new TypeError("Exclusao de memoria invalida.");
    }, (banco) => transacionar(banco, ["capturas"], "readwrite", "exclusaoMemoria", (transacao, concluir) => {
        const store = transacao.objectStore("capturas");
        const pedido = store.get([identidadeConta, data]);
        pedido.onsuccess = () => {
            const captura = pedido.result;
            const memoria = captura?.memorias?.find(item => item.identidade === identidadeMemoria);
            if (!captura || !memoria || memoria.conteudo !== conteudoConfirmado) { concluir(falha("exclusaoMemoria", { name: "MemoriaAlterada" })); return; }
            if (memoria.temporalidadeConhecida !== true || !Array.isArray(memoria.complementos)) { concluir(falha("exclusaoMemoria", { name: "MetadadosAusentes" })); return; }
            if (memoria.complementos.length !== 0) { concluir(falha("exclusaoMemoria", { name: "PossuiComplementos" })); return; }
            const memorias = captura.memorias.filter(item => item.identidade !== identidadeMemoria).map((item, ordem) => ({ ...item, ordem }));
            const atualizado = { ...captura, alterado: true, memorias };
            store.put(atualizado);
            concluir({ estado: "sucesso", valor: atualizado });
        };
    }));
}

export function confirmarComplemento(identidadeConta, data, identidadeMemoria, quantidadeEsperada, identidadeUltimoEsperada, identidadeComplemento, conteudoAnterior, novoConteudo) {
    return operacaoValidada("confirmacaoComplemento", () => {
        validarChave(identidadeConta, data);
        if (typeof identidadeMemoria !== "string" || !identidadeMemoria.trim() || !Number.isInteger(quantidadeEsperada) || quantidadeEsperada < 0
            || (identidadeUltimoEsperada !== null && typeof identidadeUltimoEsperada !== "string")
            || (identidadeComplemento !== null && (typeof identidadeComplemento !== "string" || !identidadeComplemento.trim()))
            || (conteudoAnterior !== null && typeof conteudoAnterior !== "string") || typeof novoConteudo !== "string" || !novoConteudo.trim())
            throw new TypeError("Confirmacao de complemento invalida.");
        if ((identidadeComplemento === null) !== (conteudoAnterior === null)) throw new TypeError("Alvo de complemento invalido.");
    }, (banco) => transacionar(banco, ["capturas"], "readwrite", "confirmacaoComplemento", (transacao, concluir) => {
        const store = transacao.objectStore("capturas");
        const pedido = store.get([identidadeConta, data]);
        pedido.onsuccess = () => {
            const captura = pedido.result;
            const memoria = captura?.memorias?.find(item => item.identidade === identidadeMemoria);
            const complementos = memoria?.complementos;
            const ultimo = Array.isArray(complementos) && complementos.length ? complementos[complementos.length - 1] : null;
            if (!captura || !memoria || !complementosLocaisValidos(memoria) || !Array.isArray(complementos)
                || complementos.length !== quantidadeEsperada || (ultimo?.identidade ?? null) !== identidadeUltimoEsperada) {
                concluir(falha("confirmacaoComplemento", { name: "ContextoAlterado" })); return;
            }
            let atualizados;
            if (identidadeComplemento === null) {
                if ((ultimo?.identidade ?? null) !== identidadeUltimoEsperada) { concluir(falha("confirmacaoComplemento", { name: "ContextoAlterado" })); return; }
                const identidade = crypto.randomUUID();
                atualizados = [...complementos, { identidade, conteudo: novoConteudo, ordem: complementos.length, primeiraPreservacaoUtc: null, temporalidadeConhecida: true }];
            } else {
                if (!ultimo || ultimo.identidade !== identidadeComplemento || ultimo.conteudo !== conteudoAnterior) {
                    concluir(falha("confirmacaoComplemento", { name: "ComplementoAlterado" })); return;
                }
                atualizados = complementos.map(item => item.identidade === identidadeComplemento ? { ...item, conteudo: novoConteudo } : item);
            }
            const memorias = captura.memorias.map(item => item.identidade === identidadeMemoria ? { ...item, complementos: atualizados } : item);
            const atualizado = { ...captura, alterado: true, memorias };
            store.put(atualizado);
            concluir({ estado: "sucesso", valor: atualizado });
        };
    }));
}

export function excluirUltimoComplemento(identidadeConta, data, identidadeMemoria, quantidadeEsperada, identidadeComplemento, conteudoConfirmado) {
    return operacaoValidada("exclusaoComplemento", () => {
        validarChave(identidadeConta, data);
        if (typeof identidadeMemoria !== "string" || !identidadeMemoria.trim() || !Number.isInteger(quantidadeEsperada) || quantidadeEsperada <= 0
            || typeof identidadeComplemento !== "string" || !identidadeComplemento.trim() || typeof conteudoConfirmado !== "string")
            throw new TypeError("Exclusao de complemento invalida.");
    }, (banco) => transacionar(banco, ["capturas"], "readwrite", "exclusaoComplemento", (transacao, concluir) => {
        const store = transacao.objectStore("capturas");
        const pedido = store.get([identidadeConta, data]);
        pedido.onsuccess = () => {
            const captura = pedido.result;
            const memoria = captura?.memorias?.find(item => item.identidade === identidadeMemoria);
            const complementos = memoria?.complementos;
            const ultimo = Array.isArray(complementos) ? complementos[complementos.length - 1] : null;
            if (!captura || !memoria || !complementosLocaisValidos(memoria) || !Array.isArray(complementos)
                || complementos.length !== quantidadeEsperada || ultimo?.identidade !== identidadeComplemento || ultimo.conteudo !== conteudoConfirmado) {
                concluir(falha("exclusaoComplemento", { name: "ContextoAlterado" })); return;
            }
            const atualizados = complementos.slice(0, -1).map((item, ordem) => ({ ...item, ordem }));
            const memorias = captura.memorias.map(item => item.identidade === identidadeMemoria ? { ...item, complementos: atualizados } : item);
            const atualizado = { ...captura, alterado: true, memorias };
            store.put(atualizado);
            concluir({ estado: "sucesso", valor: atualizado });
        };
    }));
}
