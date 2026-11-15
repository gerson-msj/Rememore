const controladores = new WeakMap();
const duracaoAnimacaoMs = 180;
const limite = valor => Math.max(-1, Math.min(1, Number.isFinite(valor) ? valor : 0));

function normalizarPontos(valores) {
    if (!Array.isArray(valores) || valores.length !== 4)
        return [0, 0, 0, 0];
    return valores.map(limite);
}

function tangenteExtrema(primeiraDiferenca, segundaDiferenca) {
    let tangente = (3 * primeiraDiferenca - segundaDiferenca) / 2;
    if (Math.sign(tangente) !== Math.sign(primeiraDiferenca))
        return 0;
    if (Math.sign(primeiraDiferenca) !== Math.sign(segundaDiferenca)
        && Math.abs(tangente) > 3 * Math.abs(primeiraDiferenca))
        return 3 * primeiraDiferenca;
    return tangente;
}

function criarSegmentos(pontosNormalizados) {
    const alturas = pontosNormalizados.map(valor => 50 - 40 * valor);
    const diferencas = alturas.slice(1).map((valor, indice) => valor - alturas[indice]);
    const tangentes = new Array(4);
    tangentes[0] = tangenteExtrema(diferencas[0], diferencas[1]);
    tangentes[3] = tangenteExtrema(diferencas[2], diferencas[1]);
    for (let indice = 1; indice < 3; indice++) {
        const anterior = diferencas[indice - 1];
        const seguinte = diferencas[indice];
        tangentes[indice] = Math.sign(anterior) === Math.sign(seguinte) && anterior !== 0
            ? 2 * anterior * seguinte / (anterior + seguinte)
            : 0;
    }

    const larguraTrecho = 100 / 3;
    return alturas.slice(0, 3).map((altura, indice) => {
        const xInicio = larguraTrecho * indice;
        const xFim = indice === 2 ? 100 : larguraTrecho * (indice + 1);
        return {
            xControle1: xInicio + larguraTrecho / 3,
            yControle1: altura + tangentes[indice] / 3,
            xControle2: xInicio + 2 * larguraTrecho / 3,
            yControle2: alturas[indice + 1] - tangentes[indice + 1] / 3,
            xFim,
            yFim: alturas[indice + 1]
        };
    });
}

function formatar(valor) {
    return Number(valor.toFixed(4)).toString();
}

function criarCaminho(pontosNormalizados, fecharNaBase) {
    const alturas = pontosNormalizados.map(valor => 50 - 40 * valor);
    const segmentos = criarSegmentos(pontosNormalizados);
    let caminho = `M 0 ${formatar(alturas[0])}`;
    for (const segmento of segmentos) {
        caminho += ` C ${formatar(segmento.xControle1)} ${formatar(segmento.yControle1)}`
            + `, ${formatar(segmento.xControle2)} ${formatar(segmento.yControle2)}`
            + `, ${formatar(segmento.xFim)} ${formatar(segmento.yFim)}`;
    }
    return fecharNaBase ? `${caminho} L 100 100 L 0 100 Z` : caminho;
}

function desenhar(controlador, pontos) {
    const pontosAtuais = normalizarPontos(pontos);
    controlador.linha.setAttribute('d', criarCaminho(pontosAtuais, false));
    controlador.preenchimento.setAttribute('d', criarCaminho(pontosAtuais, true));
    controlador.atual = pontosAtuais;
}

function cancelar(controlador) {
    if (controlador.quadro !== null)
        cancelAnimationFrame(controlador.quadro);
    controlador.quadro = null;
    controlador.geracao++;
}

export function conectarOnda(area, valoresNormalizados) {
    const anterior = controladores.get(area);
    if (anterior)
        desconectarOnda(area);

    const linha = area.querySelector('.onda-utilizacao__linha');
    const preenchimento = area.querySelector('.onda-utilizacao__preenchimento');
    if (!linha || !preenchimento)
        return;

    const controlador = {
        linha,
        preenchimento,
        atual: normalizarPontos(valoresNormalizados),
        alvo: normalizarPontos(valoresNormalizados),
        quadro: null,
        geracao: 0,
        inicio: null,
        origem: null,
        preferenciaMovimento: window.matchMedia?.('(prefers-reduced-motion: reduce)') ?? null,
        aoMudarPreferencia: null
    };

    desenhar(controlador, controlador.atual);
    if (controlador.preferenciaMovimento) {
        controlador.aoMudarPreferencia = evento => {
            if (!evento.matches)
                return;
            cancelar(controlador);
            desenhar(controlador, controlador.alvo);
        };
        controlador.preferenciaMovimento.addEventListener?.('change', controlador.aoMudarPreferencia);
    }
    controladores.set(area, controlador);
}

export function atualizarOnda(area, valoresNormalizados) {
    const controlador = controladores.get(area);
    if (!controlador)
        return;

    const alvo = normalizarPontos(valoresNormalizados);
    if (alvo.every((valor, indice) => valor === controlador.alvo[indice]))
        return;

    cancelar(controlador);
    controlador.alvo = alvo;
    controlador.origem = [...controlador.atual];
    if (controlador.preferenciaMovimento?.matches
        || controlador.origem.every((valor, indice) => valor === alvo[indice])) {
        desenhar(controlador, alvo);
        return;
    }

    controlador.inicio = null;
    const geracao = controlador.geracao;
    const animar = instante => {
        if (geracao !== controlador.geracao)
            return;
        controlador.quadro = null;
        controlador.inicio ??= instante;
        const progresso = Math.min(1, (instante - controlador.inicio) / duracaoAnimacaoMs);
        const aceleracao = progresso * progresso * (3 - 2 * progresso);
        const atual = controlador.origem.map((valor, indice) =>
            valor + (controlador.alvo[indice] - valor) * aceleracao);
        desenhar(controlador, atual);
        if (progresso >= 1) {
            desenhar(controlador, controlador.alvo);
            controlador.origem = null;
            controlador.inicio = null;
            return;
        }
        controlador.quadro = requestAnimationFrame(animar);
    };
    controlador.quadro = requestAnimationFrame(animar);
}

export function desconectarOnda(area) {
    const controlador = controladores.get(area);
    if (!controlador)
        return;
    cancelar(controlador);
    controlador.preferenciaMovimento?.removeEventListener?.('change', controlador.aoMudarPreferencia);
    controladores.delete(area);
}
