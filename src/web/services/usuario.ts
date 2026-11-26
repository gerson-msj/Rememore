import type {
  CriarContaRequest,
  CriarContaResponse,
  EntrarRequest,
  EntrarResponse,
  RedefinirSenhaRequest,
  RedefinirSenhaResponse,
  SessaoResponse,
} from "@shared/usuarios";
import { FalhaHttp, requisitar } from "@web/services/http";

function nomeNormalizado(nomeUsuario: string) {
  return nomeUsuario.trim().toLowerCase();
}

function validarSessao(sessao?: SessaoResponse): sessao is SessaoResponse {
  return !!sessao && (sessao.perfil === "usuario" || sessao.perfil === "admin") &&
    typeof sessao.idUsuario === "string" && sessao.idUsuario.trim().length > 0;
}

export async function criarConta(dados: CriarContaRequest): Promise<CriarContaResponse> {
  if (dados.convite === "rede" && nomeNormalizado(dados.nomeUsuario) === "usuario" && dados.senha === "usuario") {
    throw new FalhaHttp(
      "comunicacao",
      null,
      "Não foi possível comunicar com o servidor. Tente novamente.",
    );
  }

  const resposta = await requisitar<CriarContaResponse>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  if (resposta.status !== 201 || !validarSessao(resposta.dados) ||
      typeof resposta.dados.chaveRedefinicao !== "string") {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return resposta.dados;
}

export async function entrar(dados: EntrarRequest): Promise<EntrarResponse> {
  if (nomeNormalizado(dados.nomeUsuario) === "rede" && dados.senha === "usuario") {
    throw new FalhaHttp(
      "comunicacao",
      null,
      "Não foi possível comunicar com o servidor. Tente novamente.",
    );
  }

  const resposta = await requisitar<EntrarResponse>("/api/sessao", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  if (resposta.status !== 200 || !validarSessao(resposta.dados)) {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return resposta.dados;
}

export async function redefinirSenha(dados: RedefinirSenhaRequest): Promise<RedefinirSenhaResponse> {
  const resposta = await requisitar<RedefinirSenhaResponse>("/api/usuarios/redefinicao-senha", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  if (resposta.status !== 200 || !validarSessao(resposta.dados) ||
      typeof resposta.dados.chaveRedefinicao !== "string") {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return resposta.dados;
}

export async function consultarSessao(): Promise<SessaoResponse | null> {
  const resposta = await requisitar<SessaoResponse>("/api/sessao", {}, [401]);
  if (resposta.status === 401) return null;
  if (resposta.status !== 200 || !validarSessao(resposta.dados)) {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return resposta.dados;
}

export async function sair(): Promise<void> {
  const resposta = await requisitar<never>("/api/sessao", { method: "DELETE" });
  if (resposta.status !== 204) {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
}
