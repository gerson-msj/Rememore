const nomeBanco = "rememore";

const migracoes = [
  (banco: IDBDatabase) => {
    const capturas = banco.createObjectStore("capturas", { keyPath: ["idUsuario", "data"] });
    capturas.createIndex("por-conta", "idUsuario");
  },
  (banco: IDBDatabase) => { banco.createObjectStore("diagnostico"); },
];

type Repositorio = "capturas" | "diagnostico";

function abrirBanco(fabrica: IDBFactory): Promise<IDBDatabase> {
  return new Promise((resolver, rejeitar) => {
    // A posição de cada migração corresponde à versão que ela instala.
    const requisicao = fabrica.open(nomeBanco, migracoes.length);
    let bloqueada = false;
    let erroMigracao: unknown;

    requisicao.onblocked = () => {
      bloqueada = true;
      rejeitar(new Error("Uma conexão anterior bloqueou a atualização do IndexedDB."));
    };
    requisicao.onupgradeneeded = (evento) => {
      const transacao = requisicao.transaction!;
      if (bloqueada) {
        transacao.abort();
        return;
      }
      try {
        for (const migrar of migracoes.slice(evento.oldVersion)) migrar(requisicao.result);
      } catch (erro) {
        erroMigracao = erro;
        transacao.abort();
      }
    };
    requisicao.onerror = () => rejeitar(erroMigracao ?? requisicao.error);
    requisicao.onsuccess = () => {
      const banco = requisicao.result;
      if (bloqueada) {
        banco.close();
        return;
      }
      banco.onversionchange = () => banco.close();
      resolver(banco);
    };
  });
}

export function aguardarRequisicao<T>(requisicao: IDBRequest<T>): Promise<T> {
  return new Promise((resolver, rejeitar) => {
    requisicao.onsuccess = () => resolver(requisicao.result);
    requisicao.onerror = () => rejeitar(requisicao.error);
  });
}

export async function operarNoBanco<T>(
  repositorio: Repositorio,
  modo: IDBTransactionMode,
  operacao: (repositorio: IDBObjectStore) => Promise<T>,
  fabrica = globalThis.indexedDB,
): Promise<T> {
  const banco = await abrirBanco(fabrica);
  try {
    const transacao = banco.transaction(repositorio, modo);
    const conclusao = new Promise<void>((resolver, rejeitar) => {
      transacao.oncomplete = () => resolver();
      transacao.onabort = () => rejeitar(transacao.error ?? new Error("Transação do IndexedDB abortada."));
    });

    try {
      const [resultado] = await Promise.all([operacao(transacao.objectStore(repositorio)), conclusao]);
      return resultado;
    } catch (erro) {
      try { transacao.abort(); } catch { /* A transação pode já ter terminado. */ }
      await conclusao.catch(() => {});
      throw erro;
    }
  } finally {
    banco.close();
  }
}
