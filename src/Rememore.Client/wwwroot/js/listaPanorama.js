export function conectar(raiz) {
    let posicoesAnteriores = null;
    let itensRemovidos = null;
    let focoCategoriaAnterior = null;
    const animacoes = new Set();

    function encerrarAnimacoes() {
        for (const animacao of animacoes) {
            animacao.cancel();
        }
        animacoes.clear();
    }

    function limparClones() {
        if (!itensRemovidos) return;
        for (const item of itensRemovidos.values()) {
            item.clone.remove();
        }
        itensRemovidos.clear();
    }

    function capturar() {
        encerrarAnimacoes();
        limparClones();
        const itens = [...raiz.querySelectorAll("[data-categoria-id]")];
        const itemFocado = document.activeElement?.closest("[data-categoria-id]");
        const indiceFocado = itens.indexOf(itemFocado);
        focoCategoriaAnterior = indiceFocado < 0
            ? null
            : { id: itemFocado.dataset.categoriaId, indice: indiceFocado };
        posicoesAnteriores = new Map();
        itensRemovidos = new Map();

        for (const elemento of itens) {
            const id = elemento.dataset.categoriaId;
            const retangulo = elemento.getBoundingClientRect();
            posicoesAnteriores.set(id, retangulo);

            const clone = elemento.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.removeAttribute("id");
            for (const descendente of clone.querySelectorAll("[id], button, a, input, select, textarea")) {
                descendente.removeAttribute("id");
                descendente.setAttribute("tabindex", "-1");
                descendente.setAttribute("aria-hidden", "true");
            }
            clone.style.position = "fixed";
            clone.style.inset = "auto";
            clone.style.left = `${retangulo.left}px`;
            clone.style.top = `${retangulo.top}px`;
            clone.style.width = `${retangulo.width}px`;
            clone.style.height = `${retangulo.height}px`;
            clone.style.margin = "0";
            clone.style.pointerEvents = "none";
            clone.style.zIndex = "1000";
            clone.style.listStyle = "none";
            clone.classList.add("cmp009-lista-panorama__saida");
            itensRemovidos.set(id, { clone, retangulo });
        }
    }

    async function aplicar(animar, movimentoReduzido, duracao) {
        const anteriores = posicoesAnteriores;
        const removidos = itensRemovidos;
        const focoAnterior = focoCategoriaAnterior;
        posicoesAnteriores = null;
        itensRemovidos = null;
        focoCategoriaAnterior = null;
        if (!anteriores) return;

        encerrarAnimacoes();
        const atuais = [...raiz.querySelectorAll("[data-categoria-id]")];
        const idsAtuais = new Set(atuais.map(elemento => elemento.dataset.categoriaId));
        if (focoAnterior) {
            const documento = raiz.ownerDocument;
            const focoPerdido = documento.activeElement === documento.body
                || documento.activeElement === documento.documentElement;
            if (focoPerdido) {
                const itemPreservado = atuais.find(elemento => elemento.dataset.categoriaId === focoAnterior.id);
                const indiceProximo = Math.min(focoAnterior.indice, atuais.length - 1);
                const itemProximo = atuais[indiceProximo];
                const botao = (itemPreservado ?? itemProximo)?.querySelector("button.categoria-panorama");
                const titulo = raiz.closest(".cmp009-painel-lista")
                    ?.querySelector(".cmp009-painel-lista__titulo");
                (botao ?? titulo)?.focus({ preventScroll: true });
            }
        }

        const reduzir = movimentoReduzido || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reduzir) {
            if (removidos) for (const item of removidos.values()) item.clone.remove();
            return;
        }

        const novasAnimacoes = [];

        if (animar) {
            for (const elemento of atuais) {
                const anterior = anteriores.get(elemento.dataset.categoriaId);
                if (!anterior) continue;

                const atual = elemento.getBoundingClientRect();
                const deslocamentoX = anterior.left - atual.left;
                const deslocamentoY = anterior.top - atual.top;
                if (Math.abs(deslocamentoX) < 0.5 && Math.abs(deslocamentoY) < 0.5) continue;

                novasAnimacoes.push(elemento.animate(
                    [
                        { transform: `translate(${deslocamentoX}px, ${deslocamentoY}px)` },
                        { transform: "translate(0, 0)" }
                    ],
                    { duration: duracao, easing: "ease-in-out" }
                ));
            }
        }

        if (removidos) {
            for (const [id, item] of removidos) {
                if (idsAtuais.has(id)) {
                    item.clone.remove();
                    continue;
                }

                document.body.append(item.clone);
                const animacaoSaida = item.clone.animate(
                    [
                        { opacity: 1, transform: "translateY(0)" },
                        { opacity: 0, transform: animar ? "translateY(-0.35rem)" : "translateY(0)" }
                    ],
                    { duration: duracao, easing: "ease-out", fill: "forwards" }
                );
                animacaoSaida.finished.catch(() => {}).finally(() => item.clone.remove());
                novasAnimacoes.push(animacaoSaida);
            }
        }

        for (const animacao of novasAnimacoes) {
            animacoes.add(animacao);
            animacao.finished.catch(() => {}).finally(() => animacoes.delete(animacao));
        }
    }

    function descartar() {
        encerrarAnimacoes();
        limparClones();
        posicoesAnteriores = null;
        itensRemovidos = null;
        focoCategoriaAnterior = null;
    }

    return { capturar, aplicar, descartar };
}
