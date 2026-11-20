import type { DadosCriarConta, ErroAplicacao } from "@shared/usuarios";
import { criarCookieSessao } from "@api/controllers/cookies";

const idUsuarioSimulado = "01ARZ3NDEKTSV4RRFFQ69G5FAV";
const chaveRedefinicaoSimulada = "550e8400-e29b-41d4-a716-446655440000";

function normalizarNomeUsuario(nomeUsuario: string) {
  return nomeUsuario.trim().toLowerCase();
}

function erroAplicacao(status: number, conteudo: ErroAplicacao) {
  return Response.json(conteudo, { status });
}

export async function criarConta(request: Request) {
  let dados: Partial<DadosCriarConta>;

  try {
    dados = await request.json() as Partial<DadosCriarConta>;
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
    return Response.json(
      { perfil: "usuario", chaveRedefinicao: chaveRedefinicaoSimulada },
      {
        status: 201,
        headers: { "Set-Cookie": criarCookieSessao(request, idUsuarioSimulado) },
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
