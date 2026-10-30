const chave = "rememore.captura.ativa.v1";
const chaveRascunho = "rememore.captura.rascunho.v1";

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
