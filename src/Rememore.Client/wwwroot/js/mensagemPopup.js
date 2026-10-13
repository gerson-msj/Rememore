const controladores = new WeakMap();

export function abrir(dialogo, referencia) {
    const anterior = document.activeElement;
    if (!dialogo.open) dialogo.showModal();
    const aoEsc = evento => {
        if (evento.key !== "Escape") return;
        evento.preventDefault();
        evento.stopPropagation();
        if (!evento.repeat) referencia.invokeMethodAsync("AoCancelarPorTecladoOuFundo");
    };
    const aoFundo = evento => {
        if (evento.target === dialogo) referencia.invokeMethodAsync("AoCancelarPorTecladoOuFundo");
    };
    dialogo.addEventListener("keydown", aoEsc, true);
    dialogo.addEventListener("click", aoFundo);
    controladores.set(dialogo, { aoEsc, aoFundo, anterior });
    const focoInicial = dialogo.querySelector("button:not([disabled])") ?? dialogo;
    if (focoInicial === dialogo) dialogo.setAttribute("tabindex", "-1");
    focoInicial.focus({ preventScroll: true });
}

export function fechar(dialogo) {
    const controle = controladores.get(dialogo);
    if (controle) {
        dialogo.removeEventListener("keydown", controle.aoEsc, true);
        dialogo.removeEventListener("click", controle.aoFundo);
        controladores.delete(dialogo);
    }
    if (dialogo.open) dialogo.close();
    if (controle?.anterior instanceof HTMLElement && controle.anterior.isConnected) controle.anterior.focus({ preventScroll: true });
}
