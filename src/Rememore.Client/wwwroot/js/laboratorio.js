const consultaSistema = window.matchMedia("(prefers-color-scheme: dark)");

export function ler(chave) { return window.localStorage.getItem(chave); }
export function salvar(chave, valor) { window.localStorage.setItem(chave, valor); }
export function sistemaEscuro() { return consultaSistema.matches; }
export function aplicar(aparencia, cores) {
    const raiz = document.documentElement;
    raiz.dataset.aparencia = aparencia;
    if (aparencia === "sistema") {
        delete raiz.dataset.theme;
        raiz.style.removeProperty("color-scheme");
    } else {
        raiz.dataset.theme = aparencia === "escuro" ? "dark" : "light";
        raiz.style.colorScheme = aparencia === "escuro" ? "dark" : "light";
    }
    const variaveisBulma = {
        main: "scheme-main",
        bis: "scheme-main-bis",
        ter: "scheme-main-ter",
        background: "background",
        text: "text",
        "text-weak": "text-weak",
        "text-strong": "text-strong",
        title: "title-color",
        border: "border",
        "border-weak": "border-weak",
        primary: "primary",
        link: "link",
        info: "info",
        success: "success",
        warning: "warning",
        danger: "danger",
    };
    for (const [nome, variavel] of Object.entries(variaveisBulma)) {
        raiz.style.removeProperty(`--cor-${nome}`);
        raiz.style.removeProperty(`--bulma-${variavel}`);
    }
    if (cores) {
        for (const [nome, valor] of Object.entries(cores)) {
            const variavel = variaveisBulma[nome];
            if (!variavel) continue;
            raiz.style.setProperty(`--cor-${nome}`, valor);
            raiz.style.setProperty(`--bulma-${variavel}`, valor);
        }
    }
    const coresEfetivas = cores ?? Object.fromEntries(Object.keys(variaveisBulma).map(nome => [nome, getComputedStyle(raiz).getPropertyValue(`--cor-${nome}`).trim()]));
    for (const token of ["text", "primary", "link", "info", "success", "warning", "danger"]) {
        raiz.style.removeProperty(`--bulma-${token}-h`);
        raiz.style.removeProperty(`--bulma-${token}-s`);
        raiz.style.removeProperty(`--bulma-${token}-l`);
        const valor = coresEfetivas[token];
        if (!valor || !/^#[0-9a-f]{6}$/i.test(valor)) continue;
        const [h, s, l] = paraHsl(valor);
        raiz.style.setProperty(`--bulma-${token}`, valor);
        raiz.style.setProperty(`--bulma-${token}-h`, `${h}deg`);
        raiz.style.setProperty(`--bulma-${token}-s`, `${s}%`);
        raiz.style.setProperty(`--bulma-${token}-l`, `${l}%`);
    }
}

function paraHsl(hex) {
    const valores = hex.slice(1).match(/.{2}/g).map(valor => parseInt(valor, 16) / 255);
    const maximo = Math.max(...valores);
    const minimo = Math.min(...valores);
    const diferenca = maximo - minimo;
    let h = 0;
    const l = (maximo + minimo) / 2;
    let s = 0;
    if (diferenca !== 0) {
        s = diferenca / (1 - Math.abs(2 * l - 1));
        switch (maximo) {
            case valores[0]: h = ((valores[1] - valores[2]) / diferenca) % 6; break;
            case valores[1]: h = (valores[2] - valores[0]) / diferenca + 2; break;
            default: h = (valores[0] - valores[1]) / diferenca + 4;
        }
        h *= 60;
        if (h < 0) h += 360;
    }
    return [Math.round(h), Math.round(s * 100), Math.round(l * 100)];
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
