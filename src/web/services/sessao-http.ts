// A geração identifica o ciclo de sessão, sem conhecer React, rotas ou cookies.
let geracao = 0;
const observadores = new Set<() => void>();

export class RespostaSessaoObsoleta extends Error {
  constructor() {
    super("A operação pertence a uma sessão encerrada.");
    this.name = "RespostaSessaoObsoleta";
  }
}

export function obterGeracaoSessao() { return geracao; }

export function verificarGeracaoSessao(origem: number) {
  if (origem !== geracao) throw new RespostaSessaoObsoleta();
}

export function renovarGeracaoSessao() { geracao += 1; }

export function observarSessaoInvalidada(observador: () => void) {
  observadores.add(observador);
  return () => { observadores.delete(observador); };
}

export function invalidarSessaoHttp(origem: number) {
  verificarGeracaoSessao(origem);
  // Avança antes de avisar: outros 401 do mesmo ciclo já serão obsoletos.
  renovarGeracaoSessao();
  for (const observador of observadores) observador();
}
