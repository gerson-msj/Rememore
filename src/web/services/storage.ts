const prefixoSerializacao = "rememore:json:";

/** Armazena um texto simples ou objeto JSON no localStorage. */
export function armazenar<T extends string | object>(chave: string, valor: T): void {
  const serializado =
    typeof valor === "string"
      ? valor
      : `${prefixoSerializacao}${JSON.stringify(valor)}`;
  window.localStorage.setItem(chave, serializado);
}

/** Recupera e desserializa um valor do localStorage, ou null se a chave não existir. */
export function recuperar<T extends string | object>(chave: string): T | null {
  const valor = window.localStorage.getItem(chave);

  if (valor === null) {
    return null;
  }

  if (!valor.startsWith(prefixoSerializacao)) {
    return valor as T;
  }

  return JSON.parse(valor.slice(prefixoSerializacao.length)) as T;
}

/** Remove do localStorage o valor associado à chave. */
export function remover(chave: string): void {
  window.localStorage.removeItem(chave);
}
