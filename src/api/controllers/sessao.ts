import type { RespostaSessao } from "@shared/usuarios";
import { lerCookieSessao, removerCookieSessao } from "@api/controllers/cookies";

const idUsuarioSimulado = "01ARZ3NDEKTSV4RRFFQ69G5FAV";

export function consultarSessao(request: Request) {
  if (lerCookieSessao(request) !== idUsuarioSimulado) {
    return new Response(null, { status: 401 });
  }

  const resposta: RespostaSessao = { perfil: "usuario" };
  return Response.json(resposta, { status: 200 });
}

export function sair(request: Request) {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": removerCookieSessao(request) },
  });
}
