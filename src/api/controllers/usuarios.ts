import type { CriarContaRequest, CriarContaResponse, ErroAplicacao, RedefinirSenhaRequest, RedefinirSenhaResponse } from "@shared/usuarios";
import { criarCookieSessao } from "@api/controllers/cookies";

import { credencialSessaoSimulada, sessaoSimulada } from "@api/simulacao";
const chaveRedefinicaoSimulada = "550e8400-e29b-41d4-a716-446655440000";

function normalizarNomeUsuario(nomeUsuario: string) {
  return nomeUsuario.trim().toLowerCase();
}

function erroAplicacao(status: number, conteudo: ErroAplicacao) {
  return Response.json(conteudo, { status });
}

export async function criarConta(request: Request) {
  let dados: Partial<CriarContaRequest>;

  try {
    dados = await request.json() as Partial<CriarContaRequest>;
  } catch {
    return new Response(null, { status: 400 });
  }

  const convite = typeof dados.convite === "string" ? dados.convite : "";
  const nomeUsuario = typeof dados.nomeUsuario === "string" ? dados.nomeUsuario : "";
  const senha = typeof dados.senha === "string" ? dados.senha : "";
  const nomeNormalizado = normalizarNomeUsuario(nomeUsuario);

  if (convite === "api" && nomeNormalizado === "usuario" && senha === "usuario") {
    return new Response(null, { status: 500 });
  }

  if (convite === "usuario" && nomeNormalizado === "existente" && senha === "usuario") {
    return erroAplicacao(409, {
      tipo: "erroAplicacao",
      errosCampos: {
        nomeUsuario: "Este nome de usuário já está em uso. Escolha outro.",
      },
    });
  }

  if (convite === "usuario" && nomeNormalizado === "usuario" && senha === "usuario") {
    const resposta: CriarContaResponse = { ...sessaoSimulada, chaveRedefinicao: chaveRedefinicaoSimulada };
    return Response.json(
      resposta,
      {
        status: 201,
        headers: { "Set-Cookie": criarCookieSessao(request, credencialSessaoSimulada) },
      },
    );
  }

  const errosCampos: NonNullable<ErroAplicacao["errosCampos"]> = {};
  if (convite !== "usuario") {
    errosCampos.convite = "Não foi possível usar este convite. Confira o código recebido e tente novamente.";
  }
  if (nomeNormalizado !== "usuario") {
    errosCampos.nomeUsuario = "Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.";
  }
  if (senha !== "usuario") {
    errosCampos.senha = "A senha informada não é válida.";
  }

  return erroAplicacao(422, { tipo: "erroAplicacao", errosCampos });
}

export async function redefinirSenha(request: Request) {
  let dados: unknown;
  try {
    dados = await request.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (typeof dados !== "object" || dados === null || Array.isArray(dados) ||
      typeof (dados as Partial<RedefinirSenhaRequest>).nomeUsuario !== "string" ||
      typeof (dados as Partial<RedefinirSenhaRequest>).chaveRedefinicao !== "string" ||
      typeof (dados as Partial<RedefinirSenhaRequest>).novaSenha !== "string") {
    return new Response(null, { status: 400 });
  }
  const requisicao = dados as RedefinirSenhaRequest;
  if (requisicao.chaveRedefinicao !== chaveRedefinicaoSimulada) {
    return erroAplicacao(422, {
      tipo: "erroAplicacao",
      mensagem: "Não foi possível redefinir a senha. Confira as informações e tente novamente.",
    });
  }
  const resposta: RedefinirSenhaResponse = {
    ...sessaoSimulada,
    chaveRedefinicao: chaveRedefinicaoSimulada,
  };
  return Response.json(resposta, {
    status: 200,
    headers: { "Set-Cookie": criarCookieSessao(request, credencialSessaoSimulada) },
  });
}
