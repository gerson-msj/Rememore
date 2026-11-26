// A geração e a identidade pública identificam a sessão corrente fora do React.
let geracao = 0;
let idUsuario: string | null = null;
const observadores = new Set<() => void>();

export class RespostaSessaoObsoleta extends Error {
  constructor() {
    super("A operação pertence a uma sessão encerrada.");
    this.name = "RespostaSessaoObsoleta";
  }
}

export function obterGeracaoSessao() { return geracao; }
export function obterIdUsuarioSessao() { return idUsuario; }

export function verificarGeracaoSessao(origem: number) {
  if (origem !== geracao) throw new RespostaSessaoObsoleta();
}

export function renovarGeracaoSessao(identidade: string | null = null) {
  geracao += 1;
  idUsuario = identidade;
}

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
