export const nomeBanco = "rememore.trabalho.local.dotnet";
export const versaoSchema = 1;

// Migrações são sequenciais e executadas na transação de upgrade do navegador.
// Próximas versões acrescentam entradas; não reescrevem a abertura nem apagam dados.
export const migracoes = [
    (banco) => {
        const capturas = banco.createObjectStore("capturas", { keyPath: ["identidadeConta", "data"] });
        capturas.createIndex("porConta", "identidadeConta", { unique: false });
        banco.createObjectStore("diagnostico", { keyPath: "identidade" });
    }
];

export function falha(etapa, erro) {
    return { estado: "falha", falha: { etapa, codigo: erro?.name ?? "ErroOperacional" } };
}

export function abrirBanco(nome = nomeBanco, evolucoes = migracoes) {
    return new Promise((resolve, reject) => {
        let pedido;
        let abandonado = false;
        let erroMigracao;
        try {
            const versao = evolucoes === migracoes ? versaoSchema : evolucoes.length;
            if (versao !== evolucoes.length) throw new Error("Schema sem migracao correspondente.");
            pedido = indexedDB.open(nome, versao);
        }
        catch (erro) { reject({ etapa: "abertura", erro }); return; }
        pedido.onblocked = () => {
            abandonado = true;
            reject({ etapa: "upgradeBloqueado", erro: { name: "BlockedError" } });
        };
        pedido.onupgradeneeded = (evento) => {
            if (abandonado) { pedido.transaction.abort(); return; }
            try {
                for (let versao = evento.oldVersion; versao < evolucoes.length; versao++) {
                    evolucoes[versao](pedido.result, pedido.transaction);
                }
            } catch (erro) {
                erroMigracao = erro;
                pedido.transaction.abort();
            }
        };
        pedido.onerror = () => reject({ etapa: erroMigracao ? "upgrade" : "abertura", erro: erroMigracao ?? pedido.error });
        pedido.onsuccess = () => {
            const banco = pedido.result;
            if (abandonado) { banco.close(); return; }
            banco.onversionchange = () => banco.close();
            resolve(banco);
        };
    });
}

// Enfileirar pedidos e callbacks dentro da mesma chamada JS mantém a transação viva.
// O valor só sai no evento complete, nunca no success de um pedido individual.
export function transacionar(banco, stores, modo, etapa, enfileirar) {
    return new Promise((resolve) => {
        let transacao;
        let resultado = { estado: "sucesso", valor: true };
        let erroOperacao;
        try {
            transacao = banco.transaction(stores, modo);
            transacao.oncomplete = () => resolve(resultado);
            transacao.onabort = () => resolve(falha(etapa, erroOperacao ?? transacao.error ?? { name: "AbortError" }));
            transacao.onerror = (evento) => { erroOperacao ??= evento.target.error; };
            enfileirar(transacao, (valor) => { resultado = valor; });
        } catch (erro) {
            erroOperacao = erro;
            if (transacao) {
                try { transacao.abort(); }
                catch { resolve(falha(etapa, erro)); }
            } else resolve(falha(etapa, erro));
        }
    });
}

export async function executarNoBanco(etapa, operacao) {
    let banco;
    try {
        if (!globalThis.indexedDB) return { estado: "apiIndisponivel" };
        banco = await abrirBanco();
        return await operacao(banco);
    } catch (erro) { return falha(erro.etapa ?? etapa, erro.erro ?? erro); }
    finally { banco?.close(); }
}
