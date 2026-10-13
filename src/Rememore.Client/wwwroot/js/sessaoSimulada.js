export function ler(chave) {
  return sessionStorage.getItem(chave);
}

export function gravar(chave, valor) {
  sessionStorage.setItem(chave, valor);
}

export function remover(chave) {
  sessionStorage.removeItem(chave);
}
