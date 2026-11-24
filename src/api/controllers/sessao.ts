import type { EntrarRequest, EntrarResponse, ErroAplicacao, SessaoResponse } from "@shared/usuarios";
import { criarCookieSessao, lerCookieSessao, removerCookieSessao } from "@api/controllers/cookies";

import { idUsuarioSimulado, perfilSimulado } from "@api/simulacao";
const mensagemCredenciaisInvalidas =
  "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.";

// As credenciais abaixo pertencem somente aos cenários da API simulada.
function normalizarNomeUsuario(nomeUsuario: string) {
  return nomeUsuario.trim().toLowerCase();
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

export async function entrar(request: Request) {
  let dados: unknown;

  try {
    dados = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  if (!ehRegistro(dados) || typeof dados.nomeUsuario !== "string" || typeof dados.senha !== "string") {
    return new Response(null, { status: 400 });
  }

  const credenciais: EntrarRequest = {
    nomeUsuario: dados.nomeUsuario,
    senha: dados.senha,
  };
  const nomeUsuario = normalizarNomeUsuario(credenciais.nomeUsuario);

  if (nomeUsuario === "api" && credenciais.senha === "usuario") {
    return new Response(null, { status: 500 });
  }

  if (nomeUsuario === "usuario" && credenciais.senha === "usuario") {
    const resposta: EntrarResponse = { perfil: perfilSimulado };
    return Response.json(resposta, {
      status: 200,
      headers: { "Set-Cookie": criarCookieSessao(request, idUsuarioSimulado) },
    });
  }

  const erro: ErroAplicacao = {
    tipo: "erroAplicacao",
    mensagem: mensagemCredenciaisInvalidas,
  };
  return Response.json(erro, { status: 401 });
}

export function consultarSessao(request: Request) {
  if (lerCookieSessao(request) !== idUsuarioSimulado) {
    return new Response(null, { status: 401 });
  }

  const resposta: SessaoResponse = { perfil: perfilSimulado };
  return Response.json(resposta, { status: 200 });
}

export function sair(request: Request) {
  return new Response(null, {
    status: 204,
    headers: { "Set-Cookie": removerCookieSessao(request) },
  });
}
