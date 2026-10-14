export function ler(chave) {
  return sessionStorage.getItem(chave);
}

export function gravar(chave, valor) {
  sessionStorage.setItem(chave, valor);
}

export function remover(chave) {
  sessionStorage.removeItem(chave);
}

export function lerPersistente(chave) {
  return localStorage.getItem(chave);
}

export function gravarPersistente(chave, valor) {
  localStorage.setItem(chave, valor);
}

export function removerPersistente(chave) {
  localStorage.removeItem(chave);
}
