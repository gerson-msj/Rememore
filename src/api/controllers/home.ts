import type { HomeResponse } from "@shared/home";
import { lerCookieSessao } from "@api/controllers/cookies";
import { credencialSessaoSimulada, perfilSimulado } from "@api/simulacao";

const disponibilidadesSimuladas = {
  encontrarMemorias: true,
  reverUmDia: true,
  rememorar: true,
};

export function consultarHome(request: Request) {
  try {
    if (lerCookieSessao(request) !== credencialSessaoSimulada) {
      return new Response(null, { status: 401 });
    }
    const resposta: HomeResponse = { perfil: perfilSimulado, ...disponibilidadesSimuladas };
    return Response.json(resposta);
  } catch {
    return new Response(null, { status: 500 });
  }
}
