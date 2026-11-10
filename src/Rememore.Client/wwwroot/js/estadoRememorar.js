const prefixoOrdenacao = "rememore.rememorar.ordenacao.v1:";
const prefixoJornada = "rememore.rememorar.jornada.v1:";
const rolagens = new Map();

function chave(prefixo, identidadeConta) {
    if (typeof identidadeConta !== "string" || !identidadeConta.trim()) throw new TypeError("Conta invalida.");
    return `${prefixo}${encodeURIComponent(identidadeConta)}`;
}

function ordenacaoValida(valor) {
    return valor && ((valor.criterio === "Representatividade" && ["Positivo", "Negativo"].includes(valor.sentido))
        || (valor.criterio === "Tom" && ["Positivo", "Negativo", "Nulo"].includes(valor.sentido)));
}

function contextoValido(valor, identidadeConta, identidadeSessao) {
    return valor && valor.versao === 1 && valor.identidadeConta === identidadeConta
        && valor.identidadeSessao === identidadeSessao
        && Number.isFinite(valor.posicaoInicio) && valor.posicaoInicio >= 0 && valor.posicaoInicio <= 1
        && Number.isFinite(valor.posicaoFim) && valor.posicaoFim >= valor.posicaoInicio && valor.posicaoFim <= 1
        && Number.isFinite(valor.rolagem ?? 0) && (valor.rolagem ?? 0) >= 0
        && (valor.categoriaSelecionada == null || typeof valor.categoriaSelecionada === "string");
}

export function lerOrdenacao(identidadeConta) {
    try {
        const valor = JSON.parse(localStorage.getItem(chave(prefixoOrdenacao, identidadeConta)) ?? "null");
        return ordenacaoValida(valor) ? valor : null;
    } catch { return null; }
}

export function gravarOrdenacao(identidadeConta, valor) {
    try {
        if (!ordenacaoValida(valor)) return false;
        localStorage.setItem(chave(prefixoOrdenacao, identidadeConta), JSON.stringify(valor));
        return true;
    } catch { return false; }
}

export function lerContexto(identidadeConta, identidadeSessao) {
    try {
        const chaveJornada = chave(prefixoJornada, identidadeConta);
        const valor = JSON.parse(sessionStorage.getItem(chaveJornada) ?? "null");
        if (!contextoValido(valor, identidadeConta, identidadeSessao)) {
            if (valor != null) sessionStorage.removeItem(chaveJornada);
            return null;
        }
        return { ...valor, rolagem: valor.rolagem ?? 0 };
    } catch { return null; }
}

export function gravarContexto(identidadeConta, identidadeSessao, valor) {
    try {
        const chaveJornada = chave(prefixoJornada, identidadeConta);
        const anterior = JSON.parse(sessionStorage.getItem(chaveJornada) ?? "null");
        const novo = { ...valor, rolagem: contextoValido(anterior, identidadeConta, identidadeSessao) ? anterior.rolagem ?? 0 : 0 };
        if (!contextoValido(novo, identidadeConta, identidadeSessao)) return false;
        sessionStorage.setItem(chaveJornada, JSON.stringify(novo));
        return true;
    } catch { return false; }
}

export function removerContexto(identidadeConta) {
    try { sessionStorage.removeItem(chave(prefixoJornada, identidadeConta)); } catch { }
}

function atualizarRolagem(identidadeConta, identidadeSessao) {
    const chaveJornada = chave(prefixoJornada, identidadeConta);
    try {
        const contexto = JSON.parse(sessionStorage.getItem(chaveJornada) ?? "null");
        if (contextoValido(contexto, identidadeConta, identidadeSessao)) {
            contexto.rolagem = Math.max(0, window.scrollY || 0);
            sessionStorage.setItem(chaveJornada, JSON.stringify(contexto));
        }
    } catch { }
}

export function conectarRolagem(identidadeConta, identidadeSessao) {
    desconectarRolagem(identidadeConta);
    let restaurandoAte = 0;
    const controle = { temporizador: undefined, aoRolar: null, cancelarRestauracao: () => { restaurandoAte = Date.now() + 250; } };
    const aoRolar = () => {
        if (Date.now() < restaurandoAte) return;
        clearTimeout(controle.temporizador);
        controle.temporizador = setTimeout(() => atualizarRolagem(identidadeConta, identidadeSessao), 120);
    };
    const aoSairPagina = () => {
        clearTimeout(controle.temporizador);
        atualizarRolagem(identidadeConta, identidadeSessao);
    };
    controle.aoSairPagina = aoSairPagina;
    controle.aoRolar = aoRolar;
    rolagens.set(identidadeConta, controle);
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("pagehide", aoSairPagina);
}

export function restaurarRolagem(identidadeConta, posicao) {
    const estado = rolagens.get(identidadeConta);
    estado?.cancelarRestauracao();
    const y = Number.isFinite(posicao) ? Math.max(0, posicao) : 0;
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" })));
}

export function desconectarRolagem(identidadeConta) {
    const estado = rolagens.get(identidadeConta);
    if (!estado) return;
    clearTimeout(estado.temporizador);
    window.removeEventListener("scroll", estado.aoRolar);
    window.removeEventListener("pagehide", estado.aoSairPagina);
    rolagens.delete(identidadeConta);
}
