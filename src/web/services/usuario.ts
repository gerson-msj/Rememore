import type {
  DadosCriarConta,
  Perfil,
  RespostaCriarConta,
  RespostaSessao,
} from "@shared/usuarios";
import { FalhaHttp, requisitar } from "@web/services/http";

function nomeNormalizado(nomeUsuario: string) {
  return nomeUsuario.trim().toLowerCase();
}

function validarPerfil(perfil: unknown): perfil is Perfil {
  return perfil === "usuario" || perfil === "admin";
}

export async function criarConta(dados: DadosCriarConta): Promise<RespostaCriarConta> {
  if (dados.convite === "rede" && nomeNormalizado(dados.nomeUsuario) === "usuario" && dados.senha === "usuario") {
    throw new FalhaHttp(
      "comunicacao",
      null,
      "Não foi possível comunicar com o servidor. Tente novamente.",
    );
  }

  const resposta = await requisitar<RespostaCriarConta>("/api/usuarios", {
    method: "POST",
    body: JSON.stringify(dados),
  });
  if (resposta.status !== 201 || !resposta.dados || !validarPerfil(resposta.dados.perfil) ||
      typeof resposta.dados.chaveRedefinicao !== "string") {
    throw new FalhaHttp("http", resposta.status, "Não foi possível concluir a operação. Tente novamente.");
  }
  return resposta.dados;
}

export async function consultarSessao(): Promise<RespostaSessao | null> {
  const resposta = await requisitar<RespostaSessao>("/api/sessao", {}, [401]);
  if (resposta.status === 401) return null;
  if (!resposta.dados || !validarPerfil(resposta.dados.perfil)) {
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
