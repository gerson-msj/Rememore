const chave = "rememore.captura.ativa.v1";
const chaveTentativaPreservar = "rememore.captura.revisar-preservacao.v1";
const chaveRascunho = "rememore.captura.rascunho.v1";
const chaveEdicaoMemoria = "rememore.editar-memoria.rascunho.v1";
const chaveAutorizacaoCategoria = "rememore.categorizar.autorizacao.v1";
const chaveBalancoSentimental = "rememore.categorizar.balanco.rascunho.v1";

export function ehRecargaAtiva(identidadeConta, data) {
    try {
        const navegacao = performance.getEntriesByType("navigation")[0];
        return navegacao?.type === "reload"
            && sessionStorage.getItem(chave) === JSON.stringify({ identidadeConta, data });
    } catch { return false; }
}

export function registrar(identidadeConta, data) {
    sessionStorage.setItem(chave, JSON.stringify({ identidadeConta, data }));
}

export function limpar() {
    sessionStorage.removeItem(chave);
}

export function registrarTentativaPreservar(identidadeConta, data) {
    try { sessionStorage.setItem(`${chaveTentativaPreservar}:${encodeURIComponent(identidadeConta)}:${data}`, "true"); }
    catch { }
}

export function tentouPreservar(identidadeConta, data) {
    try {
        return sessionStorage.getItem(`${chaveTentativaPreservar}:${encodeURIComponent(identidadeConta)}:${data}`) === "true";
    } catch { return false; }
}

export function registrarRascunho(identidadeConta, data, inclusaoAberta, texto) {
    try {
        sessionStorage.setItem(chaveRascunho, JSON.stringify({ identidadeConta, data, inclusaoAberta, texto }));
    } catch { }
}

export function recuperarRascunho(identidadeConta, data) {
    try {
        const rascunho = JSON.parse(sessionStorage.getItem(chaveRascunho) ?? "null");
        if (rascunho?.identidadeConta !== identidadeConta || rascunho?.data !== data
            || typeof rascunho.inclusaoAberta !== "boolean" || typeof rascunho.texto !== "string") return null;
        return { inclusaoAberta: rascunho.inclusaoAberta, texto: rascunho.texto };
    } catch { return null; }
}

export function limparRascunho() {
    try { sessionStorage.removeItem(chaveRascunho); }
    catch { }
}

export function registrarEdicaoMemoria(identidadeConta, data, identidadeMemoria, tipo, identidadeComplemento, texto, autorizacaoConcedida) {
    try { sessionStorage.setItem(chaveEdicaoMemoria, JSON.stringify({ identidadeConta, data, identidadeMemoria, tipo, identidadeComplemento, texto, autorizacaoConcedida })); } catch { }
}

export function recuperarEdicaoMemoria(identidadeConta, data, identidadeMemoria) {
    try {
        const navegacao = performance.getEntriesByType("navigation")[0];
        const rascunho = JSON.parse(sessionStorage.getItem(chaveEdicaoMemoria) ?? "null");
        if (navegacao?.type !== "reload" || rascunho?.identidadeConta !== identidadeConta || rascunho?.data !== data
            || rascunho?.identidadeMemoria !== identidadeMemoria || typeof rascunho.texto !== "string"
            || typeof rascunho.autorizacaoConcedida !== "boolean") return null;
        const tipo = rascunho.tipo ?? "MemoriaPrincipal";
        if (!["MemoriaPrincipal", "ComplementoExistente", "ComplementoNovo"].includes(tipo)
            || (tipo === "ComplementoExistente" && typeof rascunho.identidadeComplemento !== "string")
            || (tipo !== "ComplementoExistente" && rascunho.identidadeComplemento != null)) return null;
        return { texto: rascunho.texto, autorizacaoConcedida: rascunho.autorizacaoConcedida, tipo, identidadeComplemento: rascunho.identidadeComplemento ?? null };
    } catch { return null; }
}

export function limparEdicaoMemoria(identidadeConta, data, identidadeMemoria) {
    try {
        const rascunho = JSON.parse(sessionStorage.getItem(chaveEdicaoMemoria) ?? "null");
        if (rascunho?.identidadeConta === identidadeConta && rascunho?.data === data && rascunho?.identidadeMemoria === identidadeMemoria)
            sessionStorage.removeItem(chaveEdicaoMemoria);
    } catch { }
}

export function registrarAutorizacaoCategoria(identidadeConta, data, identidadeMemoria) {
    try { sessionStorage.setItem(chaveAutorizacaoCategoria, JSON.stringify({ identidadeConta, data, identidadeMemoria })); }
    catch { }
}

export function recuperarAutorizacaoCategoria(identidadeConta, data, identidadeMemoria) {
    try {
        const navegacao = performance.getEntriesByType("navigation")[0];
        const autorizacao = JSON.parse(sessionStorage.getItem(chaveAutorizacaoCategoria) ?? "null");
        return navegacao?.type === "reload" && autorizacao?.identidadeConta === identidadeConta
            && autorizacao?.data === data && autorizacao?.identidadeMemoria === identidadMemoria;
    } catch { return false; }
}

export function limparAutorizacaoCategoria() {
    try { sessionStorage.removeItem(chaveAutorizacaoCategoria); }
    catch { }
}

export function registrarBalancoSentimental(identidadeConta, data, identidadeMemoria, textoConfirmadoBase, texto, autorizacaoConcedida) {
    try {
        sessionStorage.setItem(chaveBalancoSentimental, JSON.stringify({ identidadeConta, data, identidadeMemoria, textoConfirmadoBase, texto, autorizacaoConcedida, aberto: true }));
        return true;
    } catch { return false; }
}

export function recuperarBalancoSentimental(identidadeConta, data, identidadeMemoria) {
    try {
        if (performance.getEntriesByType("navigation")[0]?.type !== "reload") return null;
        const rascunho = JSON.parse(sessionStorage.getItem(chaveBalancoSentimental) ?? "null");
        if (rascunho?.identidadeConta !== identidadeConta || rascunho?.data !== data || rascunho?.identidadeMemoria !== identidadeMemoria
            || typeof rascunho.texto !== "string" || typeof rascunho.autorizacaoConcedida !== "boolean" || rascunho.aberto !== true
            || !(rascunho.textoConfirmadoBase == null || typeof rascunho.textoConfirmadoBase === "string")) return null;
        return { texto: rascunho.texto, textoConfirmadoBase: rascunho.textoConfirmadoBase, autorizacaoConcedida: rascunho.autorizacaoConcedida };
    } catch { return null; }
}

export function limparBalancoSentimental(identidadeConta, data, identidadeMemoria) {
    try {
        const rascunho = JSON.parse(sessionStorage.getItem(chaveBalancoSentimental) ?? "null");
        if (rascunho?.identidadeConta === identidadeConta && rascunho?.data === data && rascunho?.identidadeMemoria === identidadeMemoria)
            sessionStorage.removeItem(chaveBalancoSentimental);
    } catch { }
}
