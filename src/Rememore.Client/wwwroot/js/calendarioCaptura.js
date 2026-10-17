export function hojeLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

const seletoresConectados = new WeakMap();

export function conectarSeletor(campo, botao) {
    const aoClicar = () => {
        try {
            if (typeof campo.showPicker === "function") {
                campo.showPicker();
                return;
            }
        } catch {
        }

        campo.focus();
    };

    botao.addEventListener("click", aoClicar);
    seletoresConectados.set(botao, aoClicar);
}

export function desconectarSeletor(botao) {
    const aoClicar = seletoresConectados.get(botao);
    if (aoClicar) botao.removeEventListener("click", aoClicar);
    seletoresConectados.delete(botao);
}
