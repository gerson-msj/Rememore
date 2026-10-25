const consultaSistema = window.matchMedia("(prefers-color-scheme: dark)");

export function ler(chave) { return window.localStorage.getItem(chave); }
export function salvar(chave, valor) { window.localStorage.setItem(chave, valor); }
export function sistemaEscuro() { return consultaSistema.matches; }
export function aplicar(aparencia) {
    const raiz = document.documentElement;
    raiz.dataset.aparencia = aparencia;
    if (aparencia === "sistema") {
        delete raiz.dataset.theme;
        raiz.style.removeProperty("color-scheme");
    } else {
        raiz.dataset.theme = aparencia === "escuro" ? "dark" : "light";
        raiz.style.colorScheme = aparencia === "escuro" ? "dark" : "light";
    }
}
export function observarSistema(referencia) {
    const aoMudar = evento => referencia.invokeMethodAsync("AoMudarPreferenciaSistema", evento.matches);
    consultaSistema.addEventListener("change", aoMudar);
    return { dispose: () => consultaSistema.removeEventListener("change", aoMudar) };
}
export function pararObservarSistema(observador) { observador.dispose(); }
export async function copiar(texto) {
    try { await navigator.clipboard.writeText(texto); return true; }
    catch { return false; }
}
