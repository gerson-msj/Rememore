const observadores = new WeakMap();

export function observar(elemento, referencia) {
    parar(elemento);
    const observador = new ResizeObserver(() => medir(elemento, referencia));
    observador.observe(elemento);
    observadores.set(elemento, observador);
    medir(elemento, referencia);
}

export function medir(elemento, referencia) {
    const vista = elemento.querySelector(".previa-balanco__viewport");
    const excedente = vista !== null && vista.scrollHeight > vista.clientHeight;
    referencia.invokeMethodAsync("AtualizarExcedente", excedente).catch(() => {});
}

export function parar(elemento) {
    observadores.get(elemento)?.disconnect();
    observadores.delete(elemento);
}
