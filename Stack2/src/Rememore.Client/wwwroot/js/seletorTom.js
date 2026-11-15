const distanciaConclusao = 0.001;
const decorridoMaximo = 0.064;
const intervaloPublicacaoMs = 1000 / 30;
const deslocamentoMinimoArraste = 4;
const teclasDeValor = new Set(["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End", "PageUp", "PageDown"]);

export function conectarSeletorTom(raiz, entrada, referencia, valorInicial, atrasoMs, curva, curvaClique, curvaArraste, atrasoSetasMs, curvaSetas, desabilitado) {
    const trilha = raiz.querySelector(".seletor-tom__trilha");
    const controleVisual = raiz.querySelector(".seletor-tom__controle-visual");
    const superficie = raiz.querySelector(".seletor-tom__superficie-ponteiro");
    const mediaMovimentoReduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
    let valorAtual = limitarNormalizado((valorInicial + 100) / 200);
    let alvo = valorAtual;
    let velocidade = 0;
    let instanteAnterior = null;
    let quadro = null;
    let ponteiroAtivo = null;
    let inicioPonteiroX = 0;
    let inicioPonteiroY = 0;
    let ponteiroArrastando = false;
    let tipoInteracaoAtiva = null;
    let gestoAberto = false;
    let houveAlteracao = false;
    let conclusaoPendente = false;
    let ultimoValorPublicado = Math.round(valorInicial);
    let ultimoValorApresentado = Number.NaN;
    let ultimoInstantePublicacao = Number.NEGATIVE_INFINITY;
    let atraso = atrasoMs;
    let atrasoPadrao = atrasoMs;
    let atrasoSetasAtual = atrasoSetasMs;
    let curvaPadrao = curva;
    let curvaCliqueAtual = curvaClique;
    let curvaArrasteAtual = curvaArraste;
    let curvaSetasAtual = curvaSetas;
    let curvaAtual = curvaPadrao;
    let inativo = desabilitado;

    const apresentar = valor => {
        const textoValor = String(valor);
        const textoAcessivel = valor === 0 ? "Neutro" : valor < 0 ? "Negativo" : "Positivo";
        if (entrada.value !== textoValor) entrada.value = textoValor;
        if (entrada.getAttribute("aria-valuenow") !== textoValor) entrada.setAttribute("aria-valuenow", textoValor);
        if (entrada.getAttribute("aria-valuetext") !== textoAcessivel) entrada.setAttribute("aria-valuetext", textoAcessivel);
        if (valor === ultimoValorApresentado) return;
        ultimoValorApresentado = valor;

        const intensidade = Math.abs(valor);
        const pesoNegativo = valor < 0 ? `${intensidade}%` : "0%";
        const pesoPositivo = valor > 0 ? `${intensidade}%` : "0%";
        const largura = `${intensidade / 2}%`;
        const posicao = `${(valor + 100) / 2}%`;
        const inicio = valor < 0 ? `calc(50% - ${largura})` : "50%";
        const corNegativa = `color-mix(in oklab, var(--tom-negativo) ${pesoNegativo}, var(--bulma-text-weak))`;
        const corPositiva = `color-mix(in oklab, var(--tom-positivo) ${pesoPositivo}, var(--bulma-text-weak))`;

        controleVisual.style.setProperty("--seletor-tom-largura", largura);
        controleVisual.style.setProperty("--seletor-tom-inicio", inicio);
        controleVisual.style.setProperty("--seletor-tom-posicao", posicao);
        controleVisual.style.setProperty("--seletor-tom-alca", valor < 0 ? corNegativa : valor > 0 ? corPositiva : "var(--bulma-text-strong)");
        controleVisual.style.setProperty("--seletor-tom-cor-inicial", valor < 0 ? corNegativa : "var(--bulma-text-weak)");
        controleVisual.style.setProperty("--seletor-tom-cor-final", valor > 0 ? corPositiva : "var(--bulma-text-weak)");
    };

    const publicar = (forcarNotificacao = false) => {
        const valor = Math.round(valorAtual * 200 - 100);
        apresentar(valor);
        if (valor === ultimoValorPublicado) return;

        const instante = performance.now();
        if (forcarNotificacao || instante - ultimoInstantePublicacao >= intervaloPublicacaoMs) {
            ultimoValorPublicado = valor;
            ultimoInstantePublicacao = instante;
            void referencia.invokeMethodAsync("AoAlterarValorVisual", valor);
        }
    };

    const pararQuadro = () => {
        if (quadro !== null) cancelAnimationFrame(quadro);
        quadro = null;
        instanteAnterior = null;
        velocidade = 0;
    };

    const concluir = () => {
        if (!gestoAberto || !houveAlteracao) {
            gestoAberto = false;
            houveAlteracao = false;
            conclusaoPendente = false;
            tipoInteracaoAtiva = null;
            return;
        }
        if (quadro !== null) {
            conclusaoPendente = true;
            return;
        }
        gestoAberto = false;
        houveAlteracao = false;
        conclusaoPendente = false;
        tipoInteracaoAtiva = null;
        publicar(true);
        void referencia.invokeMethodAsync("AoConcluirInteracao", Math.round(valorAtual * 200 - 100));
    };

    const proximoValor = (atual, destino, velocidadeAnterior, dt) => {
        const distancia = destino - atual;
        const absoluta = Math.abs(distancia);
        if (atraso <= 0) return { valor: destino, velocidade: 0, concluido: true };
        if (absoluta < distanciaConclusao) return { valor: destino, velocidade: 0, concluido: true };

        const segundos = atraso / 1000;
        if (curvaAtual === "ease-out") {
            const progresso = 1 - Math.exp(-6.9 * dt / segundos);
            const valor = atual + distancia * progresso;
            const concluido = Math.abs(destino - valor) < distanciaConclusao;
            return { valor: concluido ? destino : valor, velocidade: dt > 0 ? (valor - atual) / dt : 0, concluido };
        }

        const velocidadeMaxima = 1 / segundos;
        const aceleracao = velocidadeMaxima / 0.3;
        const sentido = Math.sign(distancia);
        let velocidadeDesejada = sentido * velocidadeMaxima;
        if (curvaAtual === "ease-in-out") {
            velocidadeDesejada = sentido * Math.min(velocidadeMaxima, Math.sqrt(2 * aceleracao * absoluta));
        }
        const velocidadeAtual = curvaAtual === "linear"
            ? velocidadeDesejada
            : velocidadeAnterior + Math.min(aceleracao * dt, Math.max(-aceleracao * dt, velocidadeDesejada - velocidadeAnterior));
        const deslocamento = velocidadeAtual * dt;
        const valor = Math.abs(deslocamento) >= absoluta ? destino : atual + deslocamento;
        return { valor, velocidade: velocidadeAtual, concluido: valor === destino };
    };

    const animar = instante => {
        quadro = null;
        const dt = Math.min(decorridoMaximo, Math.max(0, (instante - (instanteAnterior ?? instante)) / 1000));
        instanteAnterior = instante;
        const avancamento = proximoValor(valorAtual, alvo, velocidade, dt);
        valorAtual = limitarNormalizado(avancamento.valor);
        velocidade = avancamento.velocidade;
        publicar();

        if (avancamento.concluido) {
            valorAtual = alvo;
            publicar();
            instanteAnterior = null;
            velocidade = 0;
            if (conclusaoPendente) concluir();
            return;
        }
        quadro = requestAnimationFrame(animar);
    };

    const agendar = () => {
        if (quadro !== null) return;
        quadro = requestAnimationFrame(animar);
    };

    const definirAlvo = (valor, origemGesto) => {
        if (inativo) return;
        const valorAlvo = Math.max(-100, Math.min(100, Math.round(valor)));
        const proximo = limitarNormalizado((valorAlvo + 100) / 200);
        if (Math.round(alvo * 200 - 100) !== valorAlvo) {
            void referencia.invokeMethodAsync("AoDefinirAlvo", valorAlvo);
        }
        if (origemGesto && Math.round(proximo * 200 - 100) !== Math.round(valorAtual * 200 - 100)) {
            gestoAberto = true;
            houveAlteracao = true;
            conclusaoPendente = false;
        }
        alvo = proximo;

        if (atraso <= 0 || mediaMovimentoReduzido.matches) {
            pararQuadro();
            valorAtual = alvo;
            publicar();
            if (conclusaoPendente) concluir();
            return;
        }
        agendar();
    };

    const calcularPosicao = evento => {
        const caixa = trilha?.getBoundingClientRect();
        if (!caixa || caixa.width <= 0) return Math.round(valorAtual * 200 - 100);
        const fracao = Math.max(0, Math.min(1, (evento.clientX - caixa.left) / caixa.width));
        return Math.round(fracao * 200 - 100);
    };

    const aoIniciarPonteiro = evento => {
        if (inativo || evento.button !== 0) return;
        evento.preventDefault();
        raiz.classList.add("seletor-tom--foco-ponteiro");
        try { entrada.focus({ preventScroll: true }); } catch { entrada.focus(); }
        ponteiroAtivo = evento.pointerId;
        inicioPonteiroX = evento.clientX;
        inicioPonteiroY = evento.clientY;
        ponteiroArrastando = false;
        tipoInteracaoAtiva = "clique";
        atraso = atrasoPadrao;
        definirCurvaAtiva(curvaCliqueAtual);
        try { superficie.setPointerCapture(evento.pointerId); } catch { }
        definirAlvo(calcularPosicao(evento), true);
    };

    const aoMoverPonteiro = evento => {
        if (inativo || ponteiroAtivo !== evento.pointerId) return;
        if (!ponteiroArrastando) {
            const distancia = Math.hypot(evento.clientX - inicioPonteiroX, evento.clientY - inicioPonteiroY);
            if (distancia < deslocamentoMinimoArraste) return;
            ponteiroArrastando = true;
            tipoInteracaoAtiva = "arraste";
            definirCurvaAtiva(curvaArrasteAtual);
        }
        definirAlvo(calcularPosicao(evento), true);
    };

    const aoTerminarPonteiro = evento => {
        if (ponteiroAtivo !== evento.pointerId) return;
        ponteiroAtivo = null;
        ponteiroArrastando = false;
        conclusaoPendente = true;
        if (quadro === null) concluir();
        try {
            if (superficie.hasPointerCapture(evento.pointerId)) superficie.releasePointerCapture(evento.pointerId);
        } catch { }
    };

    const aoEntradaTeclado = () => {
        const valor = Number.parseInt(entrada.value, 10);
        if (Number.isFinite(valor)) definirAlvo(valor, true);
    };

    const aoKeyDown = evento => {
        if (!teclasDeValor.has(evento.key)) return;
        raiz.classList.remove("seletor-tom--foco-ponteiro");
        if (inativo) return;
        gestoAberto = true;

        if (evento.key === "PageUp" || evento.key === "PageDown") {
            evento.preventDefault();
            if (evento.repeat) return;
            tipoInteracaoAtiva = "page";
            atraso = atrasoPadrao;
            definirCurvaAtiva(curvaPadrao);
            const valorAtualPagina = valorAtual * 200 - 100;
            const proximoValorPagina = evento.key === "PageUp"
                ? valorAtualPagina < 0 ? 0 : 100
                : valorAtualPagina > 0 ? 0 : -100;
            definirAlvo(proximoValorPagina, true);
            return;
        }

        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(evento.key)
            && !evento.ctrlKey
            && !evento.altKey
            && !evento.metaKey) {
            evento.preventDefault();
            tipoInteracaoAtiva = "setas";
            atraso = atrasoSetasAtual;
            definirCurvaAtiva(curvaSetasAtual);

            const valorAtualAlvo = Math.round(alvo * 200 - 100);
            const passo = evento.shiftKey ? 1 : 10;
            const direcao = evento.key === "ArrowLeft" || evento.key === "ArrowDown" ? -1 : 1;
            const proximoValor = passo === 1
                ? valorAtualAlvo + direcao
                : direcao > 0
                    ? (Math.floor(valorAtualAlvo / passo) + 1) * passo
                    : (Math.ceil(valorAtualAlvo / passo) - 1) * passo;

            definirAlvo(proximoValor, true);
            return;
        }

        tipoInteracaoAtiva = null;
        atraso = atrasoPadrao;
        definirCurvaAtiva(curvaPadrao);
    };

    const aoKeyUp = evento => {
        if (!teclasDeValor.has(evento.key)) return;
        if (gestoAberto && houveAlteracao) {
            conclusaoPendente = true;
            if (quadro === null) concluir();
        } else {
            gestoAberto = false;
        }
    };

    const aoBlur = () => {
        raiz.classList.remove("seletor-tom--foco-ponteiro");
        if (!gestoAberto || !houveAlteracao) return;
        conclusaoPendente = true;
        if (quadro === null) concluir();
    };

    const aoMovimentoReduzido = () => {
        if (!mediaMovimentoReduzido.matches || quadro === null) return;
        pararQuadro();
        valorAtual = alvo;
        publicar();
        if (conclusaoPendente) concluir();
    };

    const definirCurvaAtiva = novaCurva => {
        if (curvaAtual !== novaCurva) velocidade = 0;
        curvaAtual = novaCurva;
    };

    superficie?.addEventListener("pointerdown", aoIniciarPonteiro);
    superficie?.addEventListener("pointermove", aoMoverPonteiro);
    superficie?.addEventListener("pointerup", aoTerminarPonteiro);
    superficie?.addEventListener("pointercancel", aoTerminarPonteiro);
    superficie?.addEventListener("lostpointercapture", aoTerminarPonteiro);
    entrada.addEventListener("input", aoEntradaTeclado);
    entrada.addEventListener("keydown", aoKeyDown);
    entrada.addEventListener("keyup", aoKeyUp);
    entrada.addEventListener("blur", aoBlur);
    mediaMovimentoReduzido.addEventListener("change", aoMovimentoReduzido);

    return {
        definirAlvo(valor, origemGesto = true, concluirAoConvergir = false) {
            if (origemGesto) {
                tipoInteracaoAtiva = null;
                atraso = atrasoPadrao;
                definirCurvaAtiva(curvaPadrao);
            }
            definirAlvo(valor, origemGesto);
            if (!concluirAoConvergir || !houveAlteracao) return;
            conclusaoPendente = true;
            if (quadro === null) concluir();
        },
        definirResposta(novoAtraso, novaCurva, novaCurvaClique, novaCurvaArraste, novoAtrasoSetas, novaCurvaSetas) {
            atrasoPadrao = Math.max(0, novoAtraso);
            atrasoSetasAtual = Math.max(0, novoAtrasoSetas);
            curvaPadrao = novaCurva;
            curvaCliqueAtual = novaCurvaClique;
            curvaArrasteAtual = novaCurvaArraste;
            curvaSetasAtual = novaCurvaSetas;
            atraso = tipoInteracaoAtiva === "setas" ? atrasoSetasAtual : atrasoPadrao;
            definirCurvaAtiva(tipoInteracaoAtiva === "clique"
                ? curvaCliqueAtual
                : tipoInteracaoAtiva === "arraste"
                    ? curvaArrasteAtual
                    : tipoInteracaoAtiva === "setas" ? curvaSetasAtual : curvaPadrao);
            if (atraso === 0 && quadro !== null) {
                pararQuadro();
                valorAtual = alvo;
                publicar();
                if (conclusaoPendente) concluir();
            }
        },
        definirValorExterno(valor, bloqueado) {
            inativo = bloqueado;
            if (ponteiroAtivo !== null) {
                try { if (superficie.hasPointerCapture(ponteiroAtivo)) superficie.releasePointerCapture(ponteiroAtivo); } catch { }
                ponteiroAtivo = null;
            }
            pararQuadro();
            gestoAberto = false;
            houveAlteracao = false;
            conclusaoPendente = false;
            tipoInteracaoAtiva = null;
            raiz.classList.remove("seletor-tom--foco-ponteiro");
            valorAtual = limitarNormalizado((Math.max(-100, Math.min(100, valor ?? 0)) + 100) / 200);
            alvo = valorAtual;
            ultimoValorPublicado = Math.round(valorAtual * 200 - 100);
            ultimoValorApresentado = Number.NaN;
            apresentar(ultimoValorPublicado);
            entrada.setAttribute("aria-valuetext", valor === null
                ? "Sem Tom"
                : ultimoValorPublicado === 0 ? "Neutro" : ultimoValorPublicado < 0 ? "Negativo" : "Positivo");
        },
        dispose() {
            pararQuadro();
            superficie?.removeEventListener("pointerdown", aoIniciarPonteiro);
            superficie?.removeEventListener("pointermove", aoMoverPonteiro);
            superficie?.removeEventListener("pointerup", aoTerminarPonteiro);
            superficie?.removeEventListener("pointercancel", aoTerminarPonteiro);
            superficie?.removeEventListener("lostpointercapture", aoTerminarPonteiro);
            entrada.removeEventListener("input", aoEntradaTeclado);
            entrada.removeEventListener("keydown", aoKeyDown);
            entrada.removeEventListener("keyup", aoKeyUp);
            entrada.removeEventListener("blur", aoBlur);
            mediaMovimentoReduzido.removeEventListener("change", aoMovimentoReduzido);
        }
    };
}

function limitarNormalizado(valor) {
    return Number.isFinite(valor) ? Math.max(0, Math.min(1, valor)) : 0.5;
}
