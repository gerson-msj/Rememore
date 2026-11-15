const manipuladoresEscape = new WeakMap();

export function registrarEscape(modal, referencia) {
    removerEscape(modal);

    const aoPressionarTecla = evento => {
        if (evento.key !== "Escape" || !modal.classList.contains("is-active")) return;

        evento.preventDefault();
        evento.stopPropagation();
        if (!evento.repeat) referencia.invokeMethodAsync("AoCancelarPorEsc");
    };

    document.addEventListener("keydown", aoPressionarTecla, true);
    manipuladoresEscape.set(modal, aoPressionarTecla);
}

export function removerEscape(modal) {
    const manipulador = manipuladoresEscape.get(modal);
    if (!manipulador) return;

    document.removeEventListener("keydown", manipulador, true);
    manipuladoresEscape.delete(modal);
}
