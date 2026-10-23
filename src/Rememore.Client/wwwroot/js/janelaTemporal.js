export function conectarJanelaTemporal(raiz, area, referenciaDotNet) {
    let ponteiroAtivo = null;
    let movimento = null;
    let quadro = null;
    let instanteAnterior = null;
    let sincronizacaoEmAndamento = false;
    let sincronizacaoPendente = null;
    let descartado = false;

    const limitar = valor => Number.isFinite(valor) ? Math.max(0, Math.min(1, valor)) : 0;
    const arredondarIndice = posicao => Math.floor(posicao * (Math.max(2, Number(raiz.dataset.quantidadeDias) || 2) - 1) + 0.5);
    const estilosMovimento = nome => ({
        linear: 'linear',
        'ease-in': 'ease-in',
        'ease-out': 'ease-out',
        'ease-in-out': 'ease-in-out'
    })[nome] ?? 'ease-in-out';

    const obterFracao = evento => {
        const caixa = area.getBoundingClientRect();
        if (caixa.width <= 0) return null;
        const rtl = getComputedStyle(area).direction === 'rtl';
        const distancia = rtl ? caixa.right - evento.clientX : evento.clientX - caixa.left;
        const posicao = limitar(distancia / caixa.width);
        const marcador = area.querySelector('.janela-temporal__marcador');
        const diametro = marcador?.getBoundingClientRect().width ?? 0;
        return { posicao, separacaoMinima: Math.min(1, diametro / caixa.width) };
    };

    const resolverAlca = evento => {
        const solicitada = evento.target.closest('[data-alca]');
        if (!solicitada || !raiz.contains(solicitada)) return null;
        const inicio = raiz.querySelector('[data-alca="inicio"]');
        const fim = raiz.querySelector('[data-alca="fim"]');
        if (!inicio || !fim) return solicitada;
        const caixaInicio = inicio.getBoundingClientRect();
        const caixaFim = fim.getBoundingClientRect();
        const centroInicio = caixaInicio.left + caixaInicio.width / 2;
        const centroFim = caixaFim.left + caixaFim.width / 2;
        if (Math.abs(centroInicio - centroFim) > 1) return solicitada;
        return evento.clientX < centroInicio ? inicio : fim;
    };

    const lerPosicoes = () => {
        const inicio = Number(area.dataset.posicaoInicio);
        const fim = Number(area.dataset.posicaoFim);
        return Number.isFinite(inicio) && Number.isFinite(fim) && inicio <= fim ? { inicio, fim } : null;
    };

    const obterPosicaoVisualAlca = alca => {
        const caixaArea = area.getBoundingClientRect();
        const caixaAlca = alca.getBoundingClientRect();
        if (caixaArea.width <= 0) return null;
        const centro = caixaAlca.left + caixaAlca.width / 2;
        const distancia = getComputedStyle(area).direction === 'rtl'
            ? caixaArea.right - centro
            : centro - caixaArea.left;
        return limitar(distancia / caixaArea.width);
    };

    const desenharPosicoes = posicoes => {
        area.style.setProperty('--posicao-inicio', `${posicoes.inicio * 100}%`);
        area.style.setProperty('--posicao-fim', `${posicoes.fim * 100}%`);
        area.dataset.posicaoInicio = String(posicoes.inicio);
        area.dataset.posicaoFim = String(posicoes.fim);
    };

    const cancelarQuadro = () => {
        if (quadro !== null) cancelAnimationFrame(quadro);
        quadro = null;
        instanteAnterior = null;
    };

    const agendarQuadro = () => {
        if (descartado || quadro !== null || !movimento) return;
        quadro = requestAnimationFrame(avancarQuadro);
    };

    const avancarValor = (atual, alvo, velocidadeAnterior, decorrido, resposta) => {
        const distancia = alvo - atual;
        const absoluta = Math.abs(distancia);
        if (resposta.atrasoMs <= 0) return { valor: alvo, velocidade: 0, concluido: true };
        if (absoluta < 0.001) return { valor: alvo, velocidade: 0, concluido: true };
        decorrido = Math.max(0, Math.min(0.064, decorrido));
        const atraso = resposta.atrasoMs / 1000;
        if (resposta.curva === 'ease-out') {
            const progresso = 1 - Math.exp(-6.9 * decorrido / atraso);
            const proximo = atual + distancia * progresso;
            const concluido = Math.abs(alvo - proximo) < 0.001;
            return { valor: concluido ? alvo : proximo, velocidade: decorrido > 0 ? (proximo - atual) / decorrido : 0, concluido };
        }
        const velocidadeMaxima = 1 / atraso;
        const aceleracao = velocidadeMaxima / 0.3;
        const sentido = Math.sign(distancia);
        let velocidadeDesejada = sentido * velocidadeMaxima;
        if (resposta.curva === 'ease-in-out')
            velocidadeDesejada = sentido * Math.min(velocidadeMaxima, Math.sqrt(2 * aceleracao * absoluta));
        const velocidade = resposta.curva === 'linear'
            ? velocidadeDesejada
            : velocidadeAnterior + Math.max(-aceleracao * decorrido, Math.min(aceleracao * decorrido, velocidadeDesejada - velocidadeAnterior));
        const deslocamento = velocidade * decorrido;
        const valor = Math.abs(deslocamento) >= absoluta ? alvo : atual + deslocamento;
        return { valor: limitar(valor), velocidade, concluido: valor === alvo };
    };

    const valorEfetivo = movimentoAtual => movimentoAtual.tipo === 'alca'
        ? movimentoAtual.nomeAlca === 'inicio' ? movimentoAtual.posicoes.inicio : movimentoAtual.posicoes.fim
        : movimentoAtual.posicoes.inicio;

    const alvoAtual = movimentoAtual => movimentoAtual.tipo === 'alca'
        ? movimentoAtual.nomeAlca === 'inicio' ? movimentoAtual.alvoInicio : movimentoAtual.alvoFim
        : movimentoAtual.alvoInicio;

    const aplicarAlvo = (movimentoAtual, alvo) => {
        if (movimentoAtual.tipo === 'alca') {
            if (movimentoAtual.nomeAlca === 'inicio') {
                const atual = movimentoAtual.posicoes.inicio;
                movimentoAtual.alvoInicio = alvo <= atual
                    ? alvo
                    : Math.min(alvo, Math.max(atual, movimentoAtual.posicoes.fim - movimentoAtual.separacaoMinima));
            } else {
                const atual = movimentoAtual.posicoes.fim;
                movimentoAtual.alvoFim = alvo >= atual
                    ? alvo
                    : Math.max(alvo, Math.min(atual, movimentoAtual.posicoes.inicio + movimentoAtual.separacaoMinima));
            }
        } else {
            const largura = movimentoAtual.largura;
            const inicio = Math.max(0, Math.min(1 - largura, alvo));
            movimentoAtual.alvoInicio = inicio;
            movimentoAtual.alvoFim = inicio + largura;
        }
    };

    const sincronizarSeNecessario = () => {
        if (!movimento || sincronizacaoEmAndamento) return;
        const indiceInicio = arredondarIndice(movimento.posicoes.inicio);
        const indiceFim = arredondarIndice(movimento.posicoes.fim);
        if (indiceInicio === movimento.indiceSincronizadoInicio && indiceFim === movimento.indiceSincronizadoFim) return;
        const posicoes = { ...movimento.posicoes };
        movimento.indiceSincronizadoInicio = indiceInicio;
        movimento.indiceSincronizadoFim = indiceFim;
        sincronizacaoEmAndamento = true;
        sincronizacaoPendente = referenciaDotNet.invokeMethodAsync('AtualizarPosicoesEfetivas', posicoes.inicio, posicoes.fim)
            .catch(erro => { if (!descartado) console.error('Falha ao sincronizar o período efetivo.', erro); })
            .finally(() => {
                sincronizacaoEmAndamento = false;
                sincronizacaoPendente = null;
                if (movimento) desenharPosicoes(movimento.posicoes);
                sincronizarSeNecessario();
            });
    };

    const concluirMovimento = async atual => {
        if (movimento !== atual || !atual.finalizar || !atual.concluido) return;
        movimento = null;
        instanteAnterior = null;
        if (!atual.alterado) return;
        try {
            if (sincronizacaoPendente) await sincronizacaoPendente;
            await referenciaDotNet.invokeMethodAsync('ConcluirArraste', atual.posicoes.inicio, atual.posicoes.fim);
        } catch (erro) {
            if (!descartado) console.error('Falha ao concluir o arraste da janela temporal.', erro);
        }
    };

    const avancarQuadro = instante => {
        quadro = null;
        const atual = movimento;
        if (descartado || !atual) { instanteAnterior = null; return; }
        const decorrido = instanteAnterior === null ? 0 : Math.min(64, Math.max(0, instante - instanteAnterior)) / 1000;
        instanteAnterior = instante;
        const resultado = avancarValor(valorEfetivo(atual), alvoAtual(atual), atual.velocidade, decorrido, atual.resposta);
        atual.velocidade = resultado.concluido ? 0 : resultado.velocidade;
        if (atual.tipo === 'alca') {
            if (atual.nomeAlca === 'inicio') atual.posicoes.inicio = resultado.valor;
            else atual.posicoes.fim = resultado.valor;
        } else {
            const deslocamento = resultado.valor - atual.posicoes.inicio;
            atual.posicoes.inicio += deslocamento;
            atual.posicoes.fim += deslocamento;
        }
        desenharPosicoes(atual.posicoes);
        atual.alterado ||= Math.abs(atual.posicoes.inicio - atual.inicioInicial) > 0.00000001
            || Math.abs(atual.posicoes.fim - atual.fimInicial) > 0.00000001;
        sincronizarSeNecessario();

        if (resultado.concluido) {
            instanteAnterior = null;
            atual.concluido = true;
            if (atual.finalizar) void concluirMovimento(atual);
        } else {
            atual.concluido = false;
            agendarQuadro();
        }
    };

    const iniciarMovimento = (tipo, nomeAlca, posicoes, separacaoMinima) => {
        cancelarQuadro();
        const atrasoMs = Number(raiz.dataset.respostaMovimentoMs) || 0;
        const curva = estilosMovimento(raiz.dataset.curvaMovimento);
        const reduzir = raiz.dataset.movimentoReduzido === 'true'
            || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        movimento = {
            tipo,
            nomeAlca,
            posicoes: { ...posicoes },
            alvoInicio: posicoes.inicio,
            alvoFim: posicoes.fim,
            largura: posicoes.fim - posicoes.inicio,
            separacaoMinima,
            velocidade: 0,
            resposta: { atrasoMs: reduzir ? 0 : atrasoMs, curva },
            inicioInicial: posicoes.inicio,
            fimInicial: posicoes.fim,
            indiceSincronizadoInicio: arredondarIndice(posicoes.inicio),
            indiceSincronizadoFim: arredondarIndice(posicoes.fim),
            alterado: false,
            concluido: false,
            finalizar: false
        };
        return movimento;
    };

    const obterMovimento = (tipo, nomeAlca, separacaoMinima) => {
        if (!movimento || movimento.tipo !== tipo || movimento.nomeAlca !== nomeAlca) {
            const posicoes = lerPosicoes();
            if (!posicoes) return null;
            iniciarMovimento(tipo, nomeAlca, posicoes, separacaoMinima);
        }
        movimento.separacaoMinima = separacaoMinima;
        movimento.concluido = false;
        return movimento;
    };

    const atualizarAlvoPonteiro = evento => {
        const ativo = ponteiroAtivo;
        if (!ativo || ativo.id !== evento.pointerId) return;
        evento.preventDefault();
        const medidas = obterFracao(evento);
        if (!medidas) return;
        if (ativo.tipo === 'alca') {
            const atual = obterMovimento('alca', ativo.nomeAlca, medidas.separacaoMinima);
            if (!atual) return;
            aplicarAlvo(atual, limitar(medidas.posicao + ativo.deslocamento));
        } else {
            const atual = obterMovimento('faixa', null, medidas.separacaoMinima);
            if (!atual) return;
            const deslocamento = medidas.posicao - ativo.posicaoPonteiroInicial;
            aplicarAlvo(atual, ativo.posicaoInicioInicial + deslocamento);
        }
        agendarQuadro();
    };

    const aoIniciarPonteiro = evento => {
        if (descartado || ponteiroAtivo || evento.isPrimary === false || evento.button !== 0) return;
        movimento = null;
        cancelarQuadro();
        const posicoes = lerPosicoes();
        if (!posicoes) return;
        const alca = resolverAlca(evento);
        const faixa = alca ? null : evento.target.closest('[data-faixa]');
        const faixaDaSelecaoInvalida = alca && raiz.dataset.invalida === 'true' && posicoes.inicio === posicoes.fim
            ? area.querySelector('[data-faixa]') : null;
        const faixaArrastada = faixa ?? faixaDaSelecaoInvalida;
        if (!alca && (!faixaArrastada || !raiz.contains(faixaArrastada))) return;
        const medidas = obterFracao(evento);
        if (!medidas) return;
        evento.preventDefault();
        const tipo = alca && !faixaDaSelecaoInvalida ? 'alca' : 'faixa';
        let deslocamento = 0;
        if (tipo === 'alca') {
            const posicaoVisual = obterPosicaoVisualAlca(alca);
            if (posicaoVisual !== null) deslocamento = posicaoVisual - medidas.posicao;
        }
        ponteiroAtivo = {
            id: evento.pointerId,
            tipo,
            nomeAlca: tipo === 'alca' ? alca.dataset.alca : null,
            alvo: tipo === 'alca' ? alca : faixaArrastada,
            deslocamento,
            posicaoPonteiroInicial: medidas.posicao,
            posicaoInicioInicial: posicoes.inicio,
            posicaoFimInicial: posicoes.fim
        };
        ponteiroAtivo.alvo.classList.add(tipo === 'faixa'
            ? 'janela-temporal__faixa--arrastando'
            : `janela-temporal__alca--arrastando`);
        try { ponteiroAtivo.alvo.setPointerCapture(evento.pointerId); } catch { }
    };

    const aoTerminarPonteiro = async (evento, atualizarPosicao = false) => {
        const ativo = ponteiroAtivo;
        if (!ativo || ativo.id !== evento.pointerId) return;
        if (atualizarPosicao) atualizarAlvoPonteiro(evento);
        ponteiroAtivo = null;
        ativo.alvo.classList.remove(ativo.tipo === 'faixa'
            ? 'janela-temporal__faixa--arrastando'
            : 'janela-temporal__alca--arrastando');
        try {
            if (ativo.alvo.hasPointerCapture(ativo.id)) ativo.alvo.releasePointerCapture(ativo.id);
        } catch { }
        const atual = movimento;
        if (!atual) return;
        atual.finalizar = true;
        if (atual.concluido) await concluirMovimento(atual);
        else agendarQuadro();
    };

    const aoSoltarPonteiro = evento => void aoTerminarPonteiro(evento, true);
    const aoCancelarPonteiro = evento => void aoTerminarPonteiro(evento);
    raiz.addEventListener('pointerdown', aoIniciarPonteiro);
    raiz.addEventListener('pointermove', atualizarAlvoPonteiro, { passive: false });
    raiz.addEventListener('pointerup', aoSoltarPonteiro);
    raiz.addEventListener('pointercancel', aoCancelarPonteiro);
    raiz.addEventListener('lostpointercapture', aoCancelarPonteiro);

    return {
        async sincronizarEstadoChamador() {
            const ativo = ponteiroAtivo;
            ponteiroAtivo = null;
            cancelarQuadro();
            movimento = null;

            if (ativo) {
                ativo.alvo.classList.remove(ativo.tipo === 'faixa'
                    ? 'janela-temporal__faixa--arrastando'
                    : 'janela-temporal__alca--arrastando');
                try { if (ativo.alvo.hasPointerCapture(ativo.id)) ativo.alvo.releasePointerCapture(ativo.id); } catch { }
            }

            if (sincronizacaoPendente) await sincronizacaoPendente;
            if (!descartado) {
                const posicoes = lerPosicoes();
                if (posicoes) desenharPosicoes(posicoes);
            }
        },
        async dispose() {
            descartado = true;
            cancelarQuadro();
            raiz.removeEventListener('pointerdown', aoIniciarPonteiro);
            raiz.removeEventListener('pointermove', atualizarAlvoPonteiro);
            raiz.removeEventListener('pointerup', aoSoltarPonteiro);
            raiz.removeEventListener('pointercancel', aoCancelarPonteiro);
            raiz.removeEventListener('lostpointercapture', aoCancelarPonteiro);
            if (sincronizacaoPendente) await sincronizacaoPendente;
            const ativo = ponteiroAtivo;
            ponteiroAtivo = null;
            if (ativo) {
                ativo.alvo.classList.remove(ativo.tipo === 'faixa'
                    ? 'janela-temporal__faixa--arrastando'
                    : 'janela-temporal__alca--arrastando');
                try { if (ativo.alvo.hasPointerCapture(ativo.id)) ativo.alvo.releasePointerCapture(ativo.id); } catch { }
            }
            if (movimento?.alterado) {
                await referenciaDotNet.invokeMethodAsync('ConcluirArraste', movimento.posicoes.inicio, movimento.posicoes.fim).catch(() => { });
            }
            movimento = null;
        }
    };
}
