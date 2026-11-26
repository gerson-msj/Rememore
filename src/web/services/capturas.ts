import { existemCapturasLocaisPendentes } from "@web/services/capturas-locais";
import { obterGeracaoSessao, obterIdUsuarioSessao, verificarGeracaoSessao } from "@web/services/sessao-http";

export const mensagemFalhaConsultaPendencias = "Não foi possível verificar as capturas pendentes neste dispositivo.";

export class FalhaConsultaPendencias extends Error {
  constructor(causa?: unknown) {
    super(mensagemFalhaConsultaPendencias, { cause: causa });
    this.name = "FalhaConsultaPendencias";
  }
}

export async function existemCapturasPendentes(): Promise<boolean> {
  const geracao = obterGeracaoSessao();
  const idUsuario = obterIdUsuarioSessao();
  if (idUsuario === null) throw new FalhaConsultaPendencias();

  const existem = await existemCapturasLocaisPendentes(idUsuario).catch((falha: unknown) => {
    verificarGeracaoSessao(geracao);
    throw new FalhaConsultaPendencias(falha);
  });
  verificarGeracaoSessao(geracao);
  return existem;
}
