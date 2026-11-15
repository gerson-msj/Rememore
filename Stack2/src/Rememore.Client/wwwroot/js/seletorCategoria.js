const tratadores = new WeakMap();

export function registrarContencaoFoco(elemento) {
    removerContencaoFoco(elemento);

    const tratarTecla = evento => {
        if (evento.key !== "Tab") return;

        const focaveis = Array.from(elemento.querySelectorAll(
            'button:not(:disabled), input:not(:disabled), [tabindex]:not([tabindex="-1"])'));

        if (focaveis.length === 0) {
            evento.preventDefault();
            elemento.focus();
            return;
        }

        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];

        if (evento.shiftKey && document.activeElement === primeiro) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    };

    elemento.addEventListener("keydown", tratarTecla);
    tratadores.set(elemento, tratarTecla);
}

export function removerContencaoFoco(elemento) {
    const tratarTecla = tratadores.get(elemento);
    if (!tratarTecla) return;

    elemento.removeEventListener("keydown", tratarTecla);
    tratadores.delete(elemento);
}
