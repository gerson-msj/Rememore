const modais = new WeakMap();

function focaveis(modal) {
    return Array.from(modal.querySelectorAll('textarea:not(:disabled), button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex]:not([tabindex="-1"])'))
        .filter(elemento => elemento.getClientRects().length > 0);
}

export function focar(modal, seletor) {
    setTimeout(() => {
        if (!modal.classList.contains('is-active')) return;
        const alvo = modal.querySelector(seletor) ?? focaveis(modal)[0];
        alvo?.focus({ preventScroll: true });
    }, 50);
}

export function registrar(modal, referencia, seletor) {
    remover(modal, false);
    const anterior = document.activeElement;
    const aoPressionarTecla = evento => {
        if (!modal.classList.contains('is-active')) return;
        if (evento.key === 'Escape') {
            evento.preventDefault();
            evento.stopPropagation();
            if (!evento.repeat) referencia.invokeMethodAsync('AoPressionarEscape');
            return;
        }
        if (evento.key !== 'Tab') return;
        const elementos = focaveis(modal);
        if (elementos.length === 0) {
            evento.preventDefault();
            return;
        }
        const primeiro = elementos[0];
        const ultimo = elementos[elementos.length - 1];
        if (!modal.contains(document.activeElement) || (evento.shiftKey && document.activeElement === primeiro)) {
            evento.preventDefault();
            (evento.shiftKey ? ultimo : primeiro).focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primeiro.focus();
        }
    };
    document.addEventListener('keydown', aoPressionarTecla, true);
    const aoTentarSair = evento => {
        if (!modal.classList.contains('is-active') || modal.dataset.rascunhoAlterado !== 'true') return;
        evento.preventDefault();
        evento.returnValue = '';
    };
    window.addEventListener('beforeunload', aoTentarSair);
    modais.set(modal, { aoPressionarTecla, anterior, aoTentarSair });
    focar(modal, seletor);
}

export function definirRascunhoAlterado(modal, alterado) {
    modal.dataset.rascunhoAlterado = alterado ? 'true' : 'false';
}

export function remover(modal, restaurar = true) {
    const estado = modais.get(modal);
    if (!estado) return;
    document.removeEventListener('keydown', estado.aoPressionarTecla, true);
    window.removeEventListener('beforeunload', estado.aoTentarSair);
    delete modal.dataset.rascunhoAlterado;
    modais.delete(modal);
    if (restaurar && estado.anterior?.isConnected && typeof estado.anterior.focus === 'function') {
        estado.anterior.focus({ preventScroll: true });
    }
}
