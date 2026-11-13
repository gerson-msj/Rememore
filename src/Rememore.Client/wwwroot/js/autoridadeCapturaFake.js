import { consultarEstadoPanorama, registrarAlteracaoPanorama } from "./contratoPanoramaFake.mjs";
import { consultarEstadoMemoriasCategoria } from "./contratoMemoriasCategoriaFake.mjs";

const bancoNome = "rememore.autoridade.fake";
const bancoVersao = 1;

function abrirBanco() {
    return new Promise((resolve, reject) => {
        const pedido = indexedDB.open(bancoNome, bancoVersao);
        pedido.onupgradeneeded = () => pedido.result.createObjectStore("contas", { keyPath: "identidadeConta" });
        pedido.onsuccess = () => { pedido.result.onversionchange = () => pedido.result.close(); resolve(pedido.result); };
        pedido.onerror = () => reject(pedido.error);
    });
}

function chave(conta, data) {
    if (typeof conta !== "string" || !conta.trim() || typeof data !== "string"
        || !/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new TypeError("Contexto de captura invalido.");
    return [conta, data];
}

async function transacionar(conta, modo, executar) {
    const banco = await abrirBanco();
    try {
        return await new Promise((resolve, reject) => {
            const tx = banco.transaction(["contas"], modo);
            const store = tx.objectStore("contas");
            const leitura = store.get(conta);
            let resultado;
            leitura.onerror = () => { try { tx.abort(); } catch { } };
            leitura.onsuccess = () => {
                try {
                    const estado = leitura.result ?? { identidadeConta: conta, revisaoCatalogo: 3,
                        categorias: [
                            { identidade: "categoria-familia", nome: "Família", versao: 1, ativa: true, everAssociated: false },
                            { identidade: "categoria-trabalho", nome: "Trabalho", versao: 2, ativa: true, everAssociated: false },
                            { identidade: "categoria-viagens", nome: "Viagens", versao: 3, ativa: true, everAssociated: false }
                        ], alteracoes: [], capturas: {} };
                    // Compatibilidade aditiva com registros de conta criados antes da revisão global.
                    estado.revisaoPanorama ??= 0;
                    estado.alteracoesPanorama ??= [];
                    resultado = executar(estado, store);
                } catch (erro) { try { tx.abort(); } catch { } reject(erro); }
            };
            tx.oncomplete = () => resolve(resultado);
            tx.onabort = () => reject(tx.error ?? new Error("Transacao da autoridade fake falhou."));
            tx.onerror = () => { };
        });
    } finally { banco.close(); }
}

export async function verificar(conta, data) {
    chave(conta, data);
    return transacionar(conta, "readonly", estado => {
        const captura = estado.capturas[data];
        return captura ? { estado: 0, revisao: captura.revisao } : { estado: 1 };
    });
}

export async function obterCompleta(conta, data) {
    chave(conta, data);
    return transacionar(conta, "readonly", estado => {
        const captura = estado.capturas[data];
        return captura ? { estado: 0, revisao: captura.revisao, memorias: captura.memorias }
            : { estado: 1 };
    });
}

function normalizarNome(nome) { return nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR"); }

export async function preservar(captura) {
    const [conta, data] = chave(captura.identidadeConta, captura.data);
    if (!Array.isArray(captura.memorias)) throw new TypeError("Composicao invalida.");
    return transacionar(conta, "readwrite", (estado, store) => {
        const anterior = estado.capturas[data];
        const categorias = estado.categorias.map(item => ({ ...item }));
        let revisaoCatalogo = estado.revisaoCatalogo;
        const referencias = new Map(categorias.map(item => [normalizarNome(item.nome), item]));
        const agora = new Date().toISOString();
        const memorias = captura.memorias.map((memoria, ordem) => {
            const categoriasMemoria = (memoria.categorias ?? []).map(local => {
                const nome = local.nome.trim();
                const normalizado = normalizarNome(nome);
                let canonica = referencias.get(normalizado);
                if (!canonica) {
                    canonica = { identidade: `categoria-${crypto.randomUUID()}`, nome, versao: 0, ativa: true, everAssociated: true };
                    categorias.push(canonica); referencias.set(normalizado, canonica);
                    revisaoCatalogo++; canonica.versao = revisaoCatalogo;
                    estado.alteracoes.push({ tipo: 0, categoria: { ...canonica } });
                } else if (!canonica.ativa) {
                    revisaoCatalogo++; canonica.versao = revisaoCatalogo; canonica.ativa = true;
                    estado.alteracoes.push({ tipo: 3, categoria: { ...canonica } });
                }
                canonica.everAssociated = true;
                return { identidade: canonica.identidade, nome: canonica.nome, origem: 0, versao: canonica.versao };
            });
            const memoriaAnterior = anterior?.memorias.find(item => item.identidade === memoria.identidade);
            const complementos = (memoria.complementos ?? []).map((complemento, indice) => {
                const complementoAnterior = memoriaAnterior?.complementos?.find(item => item.identidade === complemento.identidade);
                return { ...complemento, ordem: indice,
                    primeiraPreservacaoUtc: complementoAnterior?.primeiraPreservacaoUtc ?? agora,
                    temporalidadeConhecida: true };
            });
            const { categoriasOriginais: _categoriasOriginais, ...dadosFuncionais } = memoria;
            return { ...dadosFuncionais, ordem, categorias: categoriasMemoria, complementos,
                primeiraPreservacaoUtc: memoriaAnterior?.primeiraPreservacaoUtc ?? agora,
                temporalidadeConhecida: true };
        });
        // Inativação considera o acervo inteiro da conta antes de alterar o estado canônico.
        const associadas = new Set(memorias.flatMap(memoria => memoria.categorias.map(item => item.identidade)));
        for (const outra of Object.values(estado.capturas))
            if (outra !== anterior) for (const memoria of outra.memorias)
                for (const categoria of memoria.categorias ?? []) associadas.add(categoria.identidade);
        for (const categoria of categorias) if (categoria.ativa && categoria.everAssociated && !associadas.has(categoria.identidade)) {
            revisaoCatalogo++; categoria.versao = revisaoCatalogo; categoria.ativa = false;
            estado.alteracoes.push({ tipo: 2, categoria: { ...categoria } });
        }
        const revisao = anterior ? String(Number(anterior.revisao) + 1) : "1";
        estado.categorias = categorias; estado.revisaoCatalogo = revisaoCatalogo;
        if (memorias.length) estado.capturas[data] = { revisao, memorias };
        else delete estado.capturas[data];
        registrarAlteracaoPanorama(estado, data, memorias.length ? { memorias } : null);
        store.put(estado);
        return { estado: 0, revisao, memorias };
    });
}

export async function consultarPanorama(conta, revisaoConhecida) {
    if (typeof conta !== "string" || !conta.trim()) return { estado: 5 };
    return transacionar(conta, "readonly", estado => consultarEstadoPanorama(estado, revisaoConhecida));
}

export async function consultarMemoriasCategoria(conta, categoria, inicio, fim, cursor) {
    if (typeof conta !== "string" || !conta.trim() || typeof categoria !== "string" || !categoria.trim())
        return { estado: 3 };
    return transacionar(conta, "readonly", estado =>
        consultarEstadoMemoriasCategoria(estado, conta, categoria, inicio, fim, cursor));
}

export async function consultarCatalogo(conta, cursorConhecido) {
    if (typeof conta !== "string" || !conta.trim()) return { estado: 4 };
    return transacionar(conta, "readonly", estado => {
        const revisao = String(estado.revisaoCatalogo);
        if (cursorConhecido == null) return { estado: 0, revisao, categorias: estado.categorias };
        if (cursorConhecido === revisao) return { estado: 1, revisao };
        const cursor = Number.parseInt(cursorConhecido, 10) || 0;
        return { estado: 2, revisao, alteracoes: estado.alteracoes.filter(item => item.categoria.versao > cursor) };
    });
}
