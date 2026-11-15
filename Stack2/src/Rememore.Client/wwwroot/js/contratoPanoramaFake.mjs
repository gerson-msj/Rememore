const limiteHistorico = 1000;

export function construirBlocoPanorama(data, captura) {
    return {
        data,
        associacoes: captura.memorias.flatMap(memoria => (memoria.categorias ?? []).map(categoria => ({
            identidadeCategoria: categoria.identidade,
            tom: memoria.tom ?? null
        })))
    };
}

export function registrarAlteracaoPanorama(estado, data, captura) {
    estado.revisaoPanorama ??= 0;
    estado.alteracoesPanorama ??= [];
    const bloco = captura?.memorias?.length ? construirBlocoPanorama(data, captura) : null;
    const revisao = ++estado.revisaoPanorama;
    estado.alteracoesPanorama.push({ revisao, data, bloco });
    if (estado.alteracoesPanorama.length > limiteHistorico)
        estado.alteracoesPanorama.splice(0, estado.alteracoesPanorama.length - limiteHistorico);
}

function diasAtuais(estado) {
    return Object.entries(estado.capturas)
        .filter(([, captura]) => captura.memorias?.length)
        .map(([data, captura]) => construirBlocoPanorama(data, captura))
        .sort((a, b) => a.data.localeCompare(b.data));
}

export function consultarEstadoPanorama(estado, revisaoConhecida) {
    const revisao = Number(estado.revisaoPanorama ?? 0);
    const dias = () => diasAtuais(estado);
    if (revisaoConhecida == null) return { estado: 0, revisao: String(revisao), dias: dias() };
    if (typeof revisaoConhecida !== "string" || !/^\d+$/.test(revisaoConhecida))
        return { estado: 3, revisao: String(revisao), dias: dias() };
    const conhecida = Number(revisaoConhecida);
    if (conhecida === revisao) return { estado: 1, revisao: String(revisao) };
    const historico = estado.alteracoesPanorama ?? [];
    const menorRevisaoRetida = historico.length ? historico[0].revisao : revisao + 1;
    if (conhecida > revisao || conhecida < menorRevisaoRetida - 1)
        return { estado: 3, revisao: String(revisao), dias: dias() };
    const alteracoes = historico.filter(item => item.revisao > conhecida)
        .map(item => item.bloco
            ? { tipo: 0, data: item.data, bloco: item.bloco }
            : { tipo: 1, data: item.data });
    return { estado: 2, revisao: String(revisao), alteracoes };
}
