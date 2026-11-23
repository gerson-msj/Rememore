const prefixoSerializacao = "rememore:json:";
export type DestinoArmazenamento = "local" | "sessao";
export const CHAVE_CONFIRMACAO_CADASTRO = "confirmacaoCadastro";
export const CHAVE_CONFIRMACAO_REDEFINICAO = "confirmacaoRedefinicao";

function obterArmazenamento(destino: DestinoArmazenamento = "local"): Storage {
  return destino === "sessao" ? window.sessionStorage : window.localStorage;
}

/** Armazena um texto simples ou objeto JSON no destino informado. */
export function armazenar<T extends string | object>(
  chave: string,
  valor: T,
  destino: DestinoArmazenamento = "local",
): void {
  const serializado =
    typeof valor === "string"
      ? valor
      : `${prefixoSerializacao}${JSON.stringify(valor)}`;
  obterArmazenamento(destino).setItem(chave, serializado);
}

/** Recupera e desserializa um valor do destino informado, ou null se a chave não existir. */
export function recuperar<T extends string | object>(
  chave: string,
  destino: DestinoArmazenamento = "local",
): T | null {
  const valor = obterArmazenamento(destino).getItem(chave);

  if (valor === null) {
    return null;
  }

  if (!valor.startsWith(prefixoSerializacao)) {
    return valor as T;
  }

  return JSON.parse(valor.slice(prefixoSerializacao.length)) as T;
}

/** Remove do destino informado o valor associado à chave. */
export function remover(chave: string, destino: DestinoArmazenamento = "local"): void {
  obterArmazenamento(destino).removeItem(chave);
}

/** Testa gravação, leitura, igualdade e remoção no destino escolhido. */
export function verificarAcesso(destino: DestinoArmazenamento = "local"): boolean {
  let armazenamento: Storage;
  try {
    armazenamento = obterArmazenamento(destino);
  } catch {
    return false;
  }

  const identificador = globalThis.crypto?.randomUUID?.()
    ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const chaveTeste = `rememore:teste-armazenamento:${destino}:${identificador}`;
  const valorTeste = `teste-${identificador}`;
  let escritaTentada = false;

  try {
    if (armazenamento.getItem(chaveTeste) !== null) return false;
    escritaTentada = true;
    armazenamento.setItem(chaveTeste, valorTeste);
    if (armazenamento.getItem(chaveTeste) !== valorTeste) return false;
    armazenamento.removeItem(chaveTeste);
    escritaTentada = false;
    return armazenamento.getItem(chaveTeste) === null;
  } catch {
    return false;
  } finally {
    if (escritaTentada) {
      try {
        armazenamento.removeItem(chaveTeste);
      } catch {
        // O resultado já será informado como indisponibilidade.
      }
    }
  }
}
