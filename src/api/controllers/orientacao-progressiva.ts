import { lerCookieSessao } from "@api/controllers/cookies";
import { credencialSessaoSimulada } from "@api/simulacao";
import type { NivelOrientacao, OrientacaoProgressivaResponse } from "@shared/orientacao-progressiva";

const nivelSimulado: NivelOrientacao = "iniciante";

export function consultarOrientacaoProgressiva(request: Request) {
  try {
    if (lerCookieSessao(request) !== credencialSessaoSimulada) {
      return new Response(null, { status: 401 });
    }

    const resposta: OrientacaoProgressivaResponse = { nivel: nivelSimulado };
    return Response.json(resposta);
  } catch {
    return new Response(null, { status: 500 });
  }
}
