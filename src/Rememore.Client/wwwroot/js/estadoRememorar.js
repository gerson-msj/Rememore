const prefixoOrdenacao = "rememore.rememorar.ordenacao.v1:";
const prefixoPanorama = "rememore.rememorar.panorama.v1:";
const prefixoDetalhe = "rememore.rememorar.detalhe.v1:";
const prefixoIdentidadeJornada = "rememore.rememorar.identidade-jornada.v1:";
const prefixoIdentidadeAba = "rememore.rememorar.identidade-aba.v1:";
const prefixoLegadoJornada = "rememore.rememorar.jornada.v1:";
const rolagens = new Map();
const nonceModulo = crypto.randomUUID();
const verificacoesAba = new Map();
let canalAbas;
let identidadeAbaAtual;
let observadorMarcadorDetalhe;
let referenciaDetalhe;
let listenerRolagemDetalhe;
let temporizadorRolagemDetalhe;
let contextoRolagemDetalhe;
let estadoTopoDetalhe;
let quadroDetalheAgendado = false;
let solicitacaoMarcadorDetalhePendente = false;
let restauracaoDetalheAtiva = false;

function chave(prefixo, identidadeConta) {
    if (typeof identidadeConta !== "string" || !identidadeConta.trim()) throw new TypeError("Conta invalida.");
    return `${prefixo}${encodeURIComponent(identidadeConta)}`;
}

function ordenacaoValida(valor) {
    return valor && ((valor.criterio === "Representatividade" && ["Positivo", "Negativo"].includes(valor.sentido))
        || (valor.criterio === "Tom" && ["Positivo", "Negativo", "Nulo"].includes(valor.sentido)));
}

function contextoPanoramaValido(valor, identidadeConta, identidadeSessao) {
    return valor && valor.versao === 2 && valor.identidadeConta === identidadeConta
        && valor.identidadeSessao === identidadeSessao
        && typeof valor.identidadeJornada === "string" && valor.identidadeJornada.trim()
        && Number.isFinite(valor.posicaoInicio) && valor.posicaoInicio >= 0 && valor.posicaoInicio <= 1
        && Number.isFinite(valor.posicaoFim) && valor.posicaoFim >= valor.posicaoInicio && valor.posicaoFim <= 1
        && Number.isFinite(valor.rolagem ?? 0) && (valor.rolagem ?? 0) >= 0
        && (valor.categoriaSelecionada == null || typeof valor.categoriaSelecionada === "string");
}

function identidadeJornadaValida(valor) {
    return typeof valor === "string" && valor.trim().length > 0;
}

function jornadaAtual(identidadeConta, identidadeSessao = null) {
    const salvo = sessionStorage.getItem(chave(prefixoIdentidadeJornada, identidadeConta));
    if (!salvo) return null;
    try {
        const valor = JSON.parse(salvo);
        if (valor && typeof valor === "object")
            return identidadeSessao == null || valor.identidadeSessao === identidadeSessao
                ? valor.identidadeJornada : null;
    } catch { }
    return salvo;
}

function gravarIdentidadeJornada(identidadeConta, identidadeSessao, identidadeJornada) {
    sessionStorage.setItem(chave(prefixoIdentidadeJornada, identidadeConta), JSON.stringify({ identidadeSessao, identidadeJornada }));
}

function garantirCanalAbas() {
    if (canalAbas || typeof BroadcastChannel === "undefined") return;
    canalAbas = new BroadcastChannel("rememore.rememorar.jornadas");
    canalAbas.onmessage = evento => {
        const mensagem = evento.data;
        if (!mensagem || mensagem.nonceModulo === nonceModulo) return;
        if (mensagem.tipo === "consultar" && mensagem.identidadeAba === identidadeAbaAtual) {
            canalAbas.postMessage({ tipo: "duplicada", nonce: mensagem.nonce, nonceModulo });
            return;
        }
        if (mensagem.tipo === "duplicada") verificacoesAba.get(mensagem.nonce)?.();
    };
}

async function aguardarDuplicidadeAba(identidadeAba) {
    if (typeof BroadcastChannel === "undefined") return false;
    garantirCanalAbas();
    const nonce = crypto.randomUUID();
    let resolver;
    const duplicada = new Promise(resolve => { resolver = () => resolve(true); });
    verificacoesAba.set(nonce, resolver);
    canalAbas.postMessage({ tipo: "consultar", identidadeAba, nonce, nonceModulo });
    const encontrou = await Promise.race([duplicada, new Promise(resolve => setTimeout(() => resolve(false), 120))]);
    verificacoesAba.delete(nonce);
    return encontrou;
}

export async function validarIdentidadeJornadaDaAba(identidadeConta, identidadeSessao) {
    try {
        const chaveAba = chave(prefixoIdentidadeAba, identidadeConta);
        let aba;
        try { aba = JSON.parse(sessionStorage.getItem(chaveAba) ?? "null"); } catch { aba = null; }
        const mesmaSessao = aba?.identidadeSessao === identidadeSessao
            && typeof aba?.identidadeAba === "string" && aba.identidadeAba.trim();
        const identidadeAba = mesmaSessao ? aba.identidadeAba : crypto.randomUUID();
        identidadeAbaAtual = identidadeAba;
        const duplicada = await aguardarDuplicidadeAba(identidadeAba);
        let identidadeJornada = jornadaAtual(identidadeConta, identidadeSessao);
        if (duplicada || !mesmaSessao) {
            sessionStorage.removeItem(chave(prefixoPanorama, identidadeConta));
            sessionStorage.removeItem(chave(prefixoDetalhe, identidadeConta));
            sessionStorage.removeItem(chave(prefixoLegadoJornada, identidadeConta));
            identidadeJornada = crypto.randomUUID();
            gravarIdentidadeJornada(identidadeConta, identidadeSessao, identidadeJornada);
        }
        sessionStorage.setItem(chaveAba, JSON.stringify({ identidadeSessao, identidadeAba }));
        return { identidadeJornada, duplicada };
    } catch { return null; }
}

function lerJson(prefixo, identidadeConta) {
    return JSON.parse(sessionStorage.getItem(chave(prefixo, identidadeConta)) ?? "null");
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
        const chavePanorama = chave(prefixoPanorama, identidadeConta);
        let valor = JSON.parse(sessionStorage.getItem(chavePanorama) ?? "null");
        if (valor == null) {
            const legado = lerJson(prefixoLegadoJornada, identidadeConta);
            if (legado && legado.identidadeConta === identidadeConta
                && legado.identidadeSessao === identidadeSessao) {
                const identidadeJornada = identidadeJornadaValida(legado.identidadeJornada)
                    ? legado.identidadeJornada : crypto.randomUUID();
                valor = { ...legado, versao: 2, identidadeJornada, rolagem: legado.rolagem ?? 0 };
                gravarIdentidadeJornada(identidadeConta, identidadeSessao, identidadeJornada);
                if (contextoPanoramaValido(valor, identidadeConta, identidadeSessao)) {
                    sessionStorage.setItem(chavePanorama, JSON.stringify(valor));
                    sessionStorage.removeItem(chave(prefixoLegadoJornada, identidadeConta));
                } else valor = null;
            }
        }
        const identidadeAtiva = jornadaAtual(identidadeConta, identidadeSessao);
        if (!contextoPanoramaValido(valor, identidadeConta, identidadeSessao)
            || valor.identidadeJornada !== identidadeAtiva) {
            if (valor != null) sessionStorage.removeItem(chavePanorama);
            return null;
        }
        return { ...valor, rolagem: valor.rolagem ?? 0 };
    } catch { return null; }
}

export function gravarContexto(identidadeConta, identidadeSessao, valor) {
    try {
        const chavePanorama = chave(prefixoPanorama, identidadeConta);
        const anterior = JSON.parse(sessionStorage.getItem(chavePanorama) ?? "null");
        const identidadeJornada = valor?.identidadeJornada ?? jornadaAtual(identidadeConta, identidadeSessao);
        const mesmoContexto = contextoPanoramaValido(anterior, identidadeConta, identidadeSessao)
            && anterior.identidadeJornada === identidadeJornada;
        const novo = { ...valor, versao: 2, identidadeJornada,
            rolagem: mesmoContexto ? anterior.rolagem ?? 0 : 0 };
        if (!contextoPanoramaValido(novo, identidadeConta, identidadeSessao)
            || novo.identidadeJornada !== jornadaAtual(identidadeConta, identidadeSessao)) return false;
        sessionStorage.setItem(chavePanorama, JSON.stringify(novo));
        return true;
    } catch { return false; }
}

export function garantirIdentidadeJornada(identidadeConta, identidadeSessao) {
    try {
        const panorama = lerContexto(identidadeConta, identidadeSessao);
        if (panorama?.identidadeJornada) return panorama.identidadeJornada;
        const atual = jornadaAtual(identidadeConta, identidadeSessao);
        if (identidadeJornadaValida(atual)) return atual;
        const criada = crypto.randomUUID();
        gravarIdentidadeJornada(identidadeConta, identidadeSessao, criada);
        return criada;
    } catch { return null; }
}

export async function iniciarNovaJornadaPanorama(identidadeConta, identidadeSessao) {
    try {
        const verificacao = await validarIdentidadeJornadaDaAba(identidadeConta, identidadeSessao);
        const anterior = jornadaAtual(identidadeConta)
            ?? lerJson(prefixoPanorama, identidadeConta)?.identidadeJornada
            ?? lerJson(prefixoDetalhe, identidadeConta)?.identidadeJornada
            ?? lerJson(prefixoLegadoJornada, identidadeConta)?.identidadeJornada
            ?? lerJson(prefixoLegadoJornada, identidadeConta)?.identidadeSessao;
        sessionStorage.removeItem(chave(prefixoPanorama, identidadeConta));
        sessionStorage.removeItem(chave(prefixoDetalhe, identidadeConta));
        sessionStorage.removeItem(chave(prefixoLegadoJornada, identidadeConta));
        const nova = crypto.randomUUID();
        gravarIdentidadeJornada(identidadeConta, identidadeSessao, nova);
        return { identidadeAnterior: verificacao?.duplicada ? null
            : identidadeJornadaValida(anterior) ? anterior : null, identidadeNova: nova };
    } catch { return { identidadeAnterior: null, identidadeNova: null }; }
}

export function lerContextoDetalhe(identidadeConta, identidadeSessao, identidadeJornada, identidadeCategoria) {
    try {
        const valor = lerJson(prefixoDetalhe, identidadeConta);
        if (!contextoDetalheValido(valor, identidadeConta, identidadeSessao, identidadeJornada)
            || valor.identidadeCategoria !== identidadeCategoria) return null;
        return { ...valor, rolagem: valor.rolagem ?? 0 };
    } catch { return null; }
}

function contextoDetalheValido(valor, identidadeConta, identidadeSessao, identidadeJornada) {
    return valor && valor.versao === 1 && valor.identidadeConta === identidadeConta
        && valor.identidadeSessao === identidadeSessao && valor.identidadeJornada === identidadeJornada
        && jornadaAtual(identidadeConta, identidadeSessao) === identidadJornada
        && typeof valor.identidadeCategoria === "string" && valor.identidadeCategoria.trim()
        && Number.isFinite(valor.posicaoInicio) && valor.posicaoInicio >= 0 && valor.posicaoInicio <= 1
        && Number.isFinite(valor.posicaoFim) && valor.posicaoFim >= valor.posicaoInicio && valor.posicaoFim <= 1
        && Number.isFinite(valor.rolagem ?? 0) && (valor.rolagem ?? 0) >= 0
        && typeof valor.ultimaDataInicio === "string" && typeof valor.ultimaDataFim === "string";
}

export function gravarContextoDetalhe(identidadeConta, identidadeSessao, identidadeJornada, valor) {
    try {
        const anterior = lerJson(prefixoDetalhe, identidadeConta);
        const mesmoRecorte = contextoDetalheValido(anterior, identidadeConta, identidadeSessao, identidadeJornada)
            && anterior.identidadeCategoria === valor?.identidadeCategoria
            && anterior.ultimaDataInicio === valor?.ultimaDataInicio
            && anterior.ultimaDataFim === valor?.ultimaDataFim;
        const novo = { ...valor, versao: 1, identidadeConta, identidadeSessao, identidadeJornada,
            rolagem: mesmoRecorte ? anterior.rolagem ?? 0 : valor.rolagem ?? 0 };
        if (!contextoDetalheValido(novo, identidadeConta, identidadeSessao, identidadeJornada)) return false;
        sessionStorage.setItem(chave(prefixoDetalhe, identidadeConta), JSON.stringify(novo));
        return true;
    } catch { return false; }
}

export function removerContexto(identidadeConta, identidadeJornada = null) {
    try {
        const chaves = [prefixoPanorama, prefixoDetalhe, prefixoLegadoJornada];
        for (const prefixo of chaves) {
            const chaveContexto = chave(prefixo, identidadeConta);
            const contexto = JSON.parse(sessionStorage.getItem(chaveContexto) ?? "null");
            if (identidadeJornada == null || contexto?.identidadeJornada === identidadeJornada)
                sessionStorage.removeItem(chaveContexto);
        }
        const chaveAtiva = chave(prefixoIdentidadeJornada, identidadeConta);
        const removerIdentidadeAtiva = identidadeJornada == null || jornadaAtual(identidadeConta) === identidadeJornada;
        if (removerIdentidadeAtiva) {
            sessionStorage.removeItem(chaveAtiva);
            sessionStorage.removeItem(chave(prefixoIdentidadeAba, identidadeConta));
        }
    } catch { }
}

function atualizarRolagem(identidadeConta, identidadeSessao, identidadeJornada) {
    try {
        const chavePanorama = chave(prefixoPanorama, identidadeConta);
        const contexto = JSON.parse(sessionStorage.getItem(chavePanorama) ?? "null");
        if (contextoPanoramaValido(contexto, identidadeConta, identidadeSessao)
            && contexto.identidadeJornada === identidadeJornada
            && jornadaAtual(identidadeConta, identidadeSessao) === identidadeJornada) {
            contexto.rolagem = Math.max(0, window.scrollY || 0);
            sessionStorage.setItem(chavePanorama, JSON.stringify(contexto));
        }
    } catch { }
}

export function gravarRolagemImediata(identidadeConta, identidadeSessao, identidadeJornada) {
    const controle = rolagens.get(identidadeConta);
    if (controle) clearTimeout(controle.temporizador);
    atualizarRolagem(identidadeConta, identidadeSessao, identidadeJornada);
}

export function conectarRolagem(identidadeConta, identidadeSessao, identidadeJornada) {
    desconectarRolagem(identidadeConta);
    let restaurandoAte = 0;
    const controle = { temporizador: undefined, aoRolar: null, cancelarRestauracao: () => { restaurandoAte = Date.now() + 250; } };
    const aoRolar = () => {
        if (Date.now() < restaurandoAte) return;
        clearTimeout(controle.temporizador);
        controle.temporizador = setTimeout(() => atualizarRolagem(identidadeConta, identidadeSessao, identidadeJornada), 120);
    };
    const aoSairPagina = () => {
        clearTimeout(controle.temporizador);
        atualizarRolagem(identidadeConta, identidadeSessao, identidadeJornada);
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

function atualizarEstadoTopoDetalhe() {
    quadroDetalheAgendado = false;
    const visivel = window.scrollY > window.innerHeight;
    if (visivel !== estadoTopoDetalhe) {
        estadoTopoDetalhe = visivel;
        void referenciaDetalhe?.invokeMethodAsync("AoAlterarVisibilidadeDoTopoAsync", visivel);
    }
    if (!restauracaoDetalheAtiva) agendarGravacaoRolagemDetalhe();
    solicitarLoteSeMarcadorProximo();
}

function gravarRolagemDetalhe() {
    if (restauracaoDetalheAtiva || !contextoRolagemDetalhe) return;
    const { identidadeConta, identidadeSessao, identidadeJornada } = contextoRolagemDetalhe;
    try {
        const chaveContexto = chave(prefixoDetalhe, identidadeConta);
        const contexto = JSON.parse(sessionStorage.getItem(chaveContexto) ?? "null");
        if (!contextoDetalheValido(contexto, identidadeConta, identidadeSessao, identidadeJornada)) return;
        contexto.rolagem = Math.max(0, window.scrollY || 0);
        sessionStorage.setItem(chaveContexto, JSON.stringify(contexto));
    } catch { }
}

function agendarGravacaoRolagemDetalhe() {
    clearTimeout(temporizadorRolagemDetalhe);
    temporizadorRolagemDetalhe = setTimeout(gravarRolagemDetalhe, 120);
}

export function gravarRolagemDetalheImediata() {
    clearTimeout(temporizadorRolagemDetalhe);
    gravarRolagemDetalhe();
}

function solicitarLoteSeMarcadorProximo() {
    if (solicitacaoMarcadorDetalhePendente || !referenciaDetalhe) return;
    const elemento = document.getElementById("detalhe-categoria-marcador");
    if (!elemento) return;
    const retangulo = elemento.getBoundingClientRect();
    const margem = 320;
    if (retangulo.top > window.innerHeight + margem || retangulo.bottom < -margem) return;
    solicitacaoMarcadorDetalhePendente = true;
    void referenciaDetalhe.invokeMethodAsync("AoMarcadorDeLoteVisivelAsync")
        .catch(() => { solicitacaoMarcadorDetalhePendente = false; });
}

export function conectarRolagemDetalhe(dotNetRef, identidadeConta, identidadeSessao, identidadeJornada) {
    if (listenerRolagemDetalhe) window.removeEventListener("scroll", listenerRolagemDetalhe);
    referenciaDetalhe = dotNetRef;
    contextoRolagemDetalhe = { identidadeConta, identidadeSessao, identidadeJornada };
    estadoTopoDetalhe = undefined;
    listenerRolagemDetalhe = () => {
        if (quadroDetalheAgendado) return;
        quadroDetalheAgendado = true;
        window.requestAnimationFrame(atualizarEstadoTopoDetalhe);
    };
    window.addEventListener("scroll", listenerRolagemDetalhe, { passive: true });
    atualizarEstadoTopoDetalhe();
}

export function observarMarcadorDetalhe() {
    desconectarMarcadorDetalhe();
    solicitacaoMarcadorDetalhePendente = false;
    const elemento = document.getElementById("detalhe-categoria-marcador");
    if (!elemento) return;
    if (typeof IntersectionObserver !== "undefined") {
        observadorMarcadorDetalhe = new IntersectionObserver(entradas => {
            if (entradas.some(entrada => entrada.isIntersecting)) solicitarLoteSeMarcadorProximo();
        }, { rootMargin: "320px 0px" });
        observadorMarcadorDetalhe.observe(elemento);
    }
    solicitarLoteSeMarcadorProximo();
}

export function suspenderMarcadorDetalheParaRestauracao() {
    restauracaoDetalheAtiva = true;
    desconectarMarcadorDetalhe();
}

export function medirDocumentoDetalhe() {
    return { altura: document.documentElement.scrollHeight, alturaVisivel: window.innerHeight };
}

export function restaurarRolagemDetalhe(posicao) {
    const y = Number.isFinite(posicao) ? Math.max(0, posicao) : 0;
    return new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo({ top: y, behavior: "auto" });
        resolve();
    })));
}

export function concluirRestauracaoDetalhe() {
    restauracaoDetalheAtiva = false;
    clearTimeout(temporizadorRolagemDetalhe);
    gravarRolagemDetalhe();
}

export function desconectarMarcadorDetalhe() {
    observadorMarcadorDetalhe?.disconnect();
    observadorMarcadorDetalhe = undefined;
}

export function rolarAoTopoDetalhe() {
    const movimentoReduzido = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: movimentoReduzido ? "auto" : "smooth" });
}

export function desconectarDetalhe() {
    clearTimeout(temporizadorRolagemDetalhe);
    gravarRolagemDetalhe();
    desconectarMarcadorDetalhe();
    if (listenerRolagemDetalhe) window.removeEventListener("scroll", listenerRolagemDetalhe);
    listenerRolagemDetalhe = undefined;
    contextoRolagemDetalhe = undefined;
    referenciaDetalhe = undefined;
    estadoTopoDetalhe = undefined;
    quadroDetalheAgendado = false;
    solicitacaoMarcadorDetalhePendente = false;
    restauracaoDetalheAtiva = false;
}
