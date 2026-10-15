export function hojeLocal() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

export function abrirSeletor(campo) {
    try {
        if (typeof campo.showPicker === "function") campo.showPicker();
        else campo.focus();
    } catch {
        campo.focus();
    }
}
