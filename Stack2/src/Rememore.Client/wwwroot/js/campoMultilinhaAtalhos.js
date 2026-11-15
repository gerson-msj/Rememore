export function conectar(elemento, referenciaDotNet) {
    const semModificadores = evento => !evento.ctrlKey && !evento.shiftKey && !evento.altKey && !evento.metaKey;

    const aoPressionarTecla = evento => {
        if (elemento.disabled || evento.isComposing || evento.keyCode === 229) return;

        let intencao;
        if (evento.key === "Enter" && evento.shiftKey && !evento.ctrlKey && !evento.altKey && !evento.metaKey)
            intencao = "incluir";
        else if (evento.key === "Enter" && evento.ctrlKey && !evento.shiftKey && !evento.altKey && !evento.metaKey)
            intencao = "incluir-e-continuar";
        else if (evento.key === "Escape" && semModificadores(evento))
            intencao = "cancelar";
        else
            return;

        evento.preventDefault();
        if (evento.repeat) return;

        void referenciaDotNet.invokeMethodAsync("TratarAtalhoAsync", intencao).catch(() => { });
    };

    elemento.addEventListener("keydown", aoPressionarTecla);

    return {
        desconectar() {
            elemento.removeEventListener("keydown", aoPressionarTecla);
        }
    };
}
