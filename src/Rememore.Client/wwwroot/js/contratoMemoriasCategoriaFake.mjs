const tamanhoLote = 30;
const dataIso = /^\d{4}-\d{2}-\d{2}$/;

function dataValida(valor) {
    if (typeof valor !== "string" || !dataIso.test(valor)) return false;
    const data = new Date(`${valor}T00:00:00Z`);
    return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor;
}

function comparar(a, b) {
    if (a.data !== b.data) return a.data < b.data ? -1 : 1;
    if (a.ordem !== b.ordem) return a.ordem - b.ordem;
    return a.identidade < b.identidade ? -1 : a.identidade > b.identidade ? 1 : 0;
}

export function consultarEstadoMemoriasCategoria(estado, conta, categoria, inicio, fim, cursor = null) {
    if (typeof conta !== "string" || !conta.trim() || typeof categoria !== "string" || !categoria.trim()
        || !dataValida(inicio) || !dataValida(fim) || inicio > fim) return { estado: 3 };

    const revisao = String(estado.revisaoPanorama ?? 0);
    let deslocamento = 0;
    if (cursor != null) {
        let continuidade;
        try { continuidade = JSON.parse(cursor); } catch { return { estado: 1 }; }
        if (continuidade?.versao !== 1 || continuidade.conta !== conta || continuidade.categoria !== categoria
            || continuidade.inicio !== inicio || continuidade.fim !== fim || continuidade.revisao !== revisao
            || !Number.isSafeInteger(continuidade.deslocamento) || continuidade.deslocamento < tamanhoLote
            || continuidade.deslocamento % tamanhoLote !== 0) return { estado: 1 };
        deslocamento = continuidade.deslocamento;
    }

    const itens = Object.entries(estado.capturas ?? {})
        .filter(([data]) => data >= inicio && data <= fim)
        .flatMap(([data, captura]) => (captura.memorias ?? [])
            .filter(memoria => (memoria.categorias ?? []).some(item => item.identidade === categoria))
            .map(memoria => ({ identidade: memoria.identidade, data, ordem: memoria.ordem,
                conteudo: memoria.conteudo, tom: memoria.tom ?? null })))
        .sort(comparar);

    if (deslocamento > itens.length) return { estado: 1 };
    const lote = itens.slice(deslocamento, deslocamento + tamanhoLote);
    const proximoDeslocamento = deslocamento + lote.length;
    const temMais = proximoDeslocamento < itens.length;
    return { estado: 0, revisao, itens: lote, temMais,
        proximoCursor: temMais ? JSON.stringify({ versao: 1, conta, categoria, inicio, fim, revisao,
            deslocamento: proximoDeslocamento }) : null };
}
