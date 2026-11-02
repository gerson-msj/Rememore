let pontoPonteiroOrdenacao = null;
let ordenacaoConectada = false;

function capturarPontoPonteiroOrdenacao(evento) {
    if (evento.button !== 0 || evento.pointerType !== "mouse") return;
    if (!(evento.target instanceof Element)) return;

    const botao = evento.target.closest("button.memoria__acao");
    const item = botao?.closest("[data-identidade-memoria]");
    if (!(botao instanceof HTMLButtonElement) || botao.disabled || !(item instanceof HTMLElement)) return;

    const retangulo = item.getBoundingClientRect();
    pontoPonteiroOrdenacao = {
        identidade: item.dataset.identidadeMemoria,
        clientY: evento.clientY,
        deslocamentoNoItem: evento.clientY - retangulo.top
    };
}

function limparPontoPonteiroPorTeclado(evento) {
    if ((evento.key === "Enter" || evento.key === " ")
        && evento.target instanceof Element
        && evento.target.closest("button.memoria__acao")) {
        pontoPonteiroOrdenacao = null;
    }
}

export function conectarOrdenacao() {
    if (ordenacaoConectada) return;
    document.addEventListener("pointerdown", capturarPontoPonteiroOrdenacao, true);
    document.addEventListener("keydown", limparPontoPonteiroPorTeclado, true);
    ordenacaoConectada = true;
}

export function desconectarOrdenacao() {
    if (!ordenacaoConectada) return;
    document.removeEventListener("pointerdown", capturarPontoPonteiroOrdenacao, true);
    document.removeEventListener("keydown", limparPontoPonteiroPorTeclado, true);
    pontoPonteiroOrdenacao = null;
    ordenacaoConectada = false;
}

export function alinharMemoriaNoTopo(identidade, seletorBarraFixa) {
    const elemento = document.querySelector(`[data-identidade-memoria="${CSS.escape(identidade)}"]`);
    if (!(elemento instanceof HTMLElement)) return;

    const barra = document.querySelector(seletorBarraFixa);
    const topoUtil = barra instanceof HTMLElement
        ? Math.max(0, barra.getBoundingClientRect().bottom)
        : 0;
    const anterior = elemento.previousElementSibling;
    const proxima = elemento.nextElementSibling;
    const retanguloMemoria = elemento.getBoundingClientRect();
    const retanguloVizinho = anterior instanceof HTMLElement
        ? anterior.getBoundingClientRect()
        : proxima instanceof HTMLElement
            ? proxima.getBoundingClientRect()
            : null;
    const espacamentoMemorias = retanguloVizinho
        ? anterior instanceof HTMLElement
            ? Math.max(0, retanguloMemoria.top - retanguloVizinho.bottom)
            : Math.max(0, retanguloVizinho.top - retanguloMemoria.bottom)
        : elemento.parentElement instanceof HTMLElement
            ? Number.parseFloat(getComputedStyle(elemento.parentElement).rowGap) || 0
            : 0;
    const topoDesejado = topoUtil + espacamentoMemorias;
    const deslocamento = retanguloMemoria.top - topoDesejado;
    if (Math.abs(deslocamento) > 0.5) window.scrollBy(0, deslocamento);
}

export function focarEManterVisivel(identidade, elevar, seletorBarraFixa) {
    const seletor = `[data-identidade-memoria="${CSS.escape(identidade)}"]`;
    const elemento = document.querySelector(seletor);
    if (!(elemento instanceof HTMLElement)) return;

    const acoes = elemento.querySelectorAll(".memoria__acao");
    const acaoPreferida = acoes[elevar ? 0 : 1];
    const acaoAlternativa = acoes[elevar ? 1 : 0];
    const preferidaDisponivel = acaoPreferida instanceof HTMLButtonElement && !acaoPreferida.disabled;
    const acao = preferidaDisponivel ? acaoPreferida : acaoAlternativa;
    const elevarEfetivo = preferidaDisponivel ? elevar : !elevar;
    if (acao instanceof HTMLButtonElement && !acao.disabled) acao.focus({ preventScroll: true });

    const pontoPonteiro = pontoPonteiroOrdenacao?.identidade === identidade
        ? pontoPonteiroOrdenacao
        : null;
    pontoPonteiroOrdenacao = null;
    if (pontoPonteiro) {
        const topoDesejado = pontoPonteiro.clientY - pontoPonteiro.deslocamentoNoItem;
        const deslocamento = elemento.getBoundingClientRect().top - topoDesejado;
        if (Math.abs(deslocamento) > 0.5) window.scrollBy(0, deslocamento);
    }

    const barra = document.querySelector(seletorBarraFixa);
    const topoUtil = barra instanceof HTMLElement
        ? Math.max(0, barra.getBoundingClientRect().bottom)
        : 0;
    const retangulo = elemento.getBoundingClientRect();
    const alturaUtil = window.innerHeight - topoUtil;
    const vizinho = elevarEfetivo ? elemento.previousElementSibling : elemento.nextElementSibling;
    const alvo = vizinho instanceof HTMLElement
        ? vizinho.getBoundingClientRect()
        : null;

    let topo = retangulo.top;
    let base = retangulo.bottom;
    if (alvo && Math.max(retangulo.bottom, alvo.bottom) - Math.min(retangulo.top, alvo.top) <= alturaUtil) {
        topo = Math.min(retangulo.top, alvo.top);
        base = Math.max(retangulo.bottom, alvo.bottom);
    }

    let deslocamento = 0;
    if (topo < topoUtil) deslocamento = topo - topoUtil;
    else if (base > window.innerHeight) deslocamento = base - window.innerHeight;

    if (deslocamento !== 0) window.scrollBy(0, deslocamento);
}
