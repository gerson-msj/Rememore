const chave = "rememore.captura.ativa.v1";

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
