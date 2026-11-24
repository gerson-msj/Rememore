import type { ErroAplicacao, ErrosCamposCadastro } from "@shared/usuarios";
import { invalidarSessaoHttp, obterGeracaoSessao, verificarGeracaoSessao } from "@web/services/sessao-http";

const mensagemHttpGenerica = "Não foi possível concluir a operação. Tente novamente.";
const mensagemComunicacao = "Não foi possível comunicar com o servidor. Tente novamente.";

export class FalhaHttp extends Error {
  constructor(
    public readonly tipo: "aplicacao" | "http" | "comunicacao",
    public readonly status: number | null,
    mensagem: string,
    public readonly errosCampos?: ErrosCamposCadastro,
  ) {
    super(mensagem);
    this.name = "FalhaHttp";
  }
}

function ehRegistro(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === "object" && valor !== null && !Array.isArray(valor);
}

function lerContratoErro(valor: unknown): ErroAplicacao | null {
  if (!ehRegistro(valor) || valor.tipo !== "erroAplicacao") return null;

  const mensagem = valor.mensagem;
  if (mensagem !== undefined && typeof mensagem !== "string") return null;

  let errosCampos: ErrosCamposCadastro | undefined;
  if (valor.errosCampos !== undefined) {
    const campos = valor.errosCampos;
    if (!ehRegistro(campos)) return null;
    const chaves = Object.keys(campos);
    if (chaves.some((chave) => !["convite", "nomeUsuario", "senha"].includes(chave))) return null;
    if (chaves.some((chave) => typeof campos[chave] !== "string")) return null;
    errosCampos = campos as ErrosCamposCadastro;
  }

  const temMensagem = typeof mensagem === "string" && mensagem.trim().length > 0;
  const temErroCampo = errosCampos && Object.values(errosCampos).some((texto) => texto.trim().length > 0);
  if (!temMensagem && !temErroCampo) return null;

  return {
    tipo: "erroAplicacao",
    ...(typeof mensagem === "string" ? { mensagem } : {}),
    ...(errosCampos ? { errosCampos } : {}),
  };
}

async function lerJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
}

export async function requisitar<T>(
  caminho: string,
  init: RequestInit = {},
  statusPermitidos: number[] = [],
  opcoes: { protegida: boolean } = { protegida: false },
): Promise<{ status: number; dados: T | undefined }> {
  const geracao = obterGeracaoSessao();
  const verificarSessao = () => {
    init.signal?.throwIfAborted();
    if (opcoes.protegida) verificarGeracaoSessao(geracao);
  };
  let response: Response;
  try {
    response = await fetch(caminho, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    verificarSessao();
    throw new FalhaHttp("comunicacao", null, mensagemComunicacao);
  }

  verificarSessao();
  if (opcoes.protegida && response.status === 401) {
    invalidarSessaoHttp(geracao);
    throw new FalhaHttp("http", 401, mensagemHttpGenerica);
  }

  if (!response.ok && !statusPermitidos.includes(response.status)) {
    const corpo = await lerJson(response);
    verificarSessao();
    const erro = lerContratoErro(corpo);
    if (erro) {
      throw new FalhaHttp("aplicacao", response.status, erro.mensagem ?? "", erro.errosCampos);
    }
    throw new FalhaHttp("http", response.status, mensagemHttpGenerica);
  }

  if (response.status === 204 || response.status === 401) {
    return { status: response.status, dados: undefined };
  }

  const corpo = await lerJson(response);
  verificarSessao();
  if (!ehRegistro(corpo)) {
    throw new FalhaHttp("http", response.status, mensagemHttpGenerica);
  }

  return { status: response.status, dados: corpo as T };
}

export function falhaDesconhecida(erro: unknown) {
  if (erro instanceof FalhaHttp) return erro;
  return new FalhaHttp("comunicacao", null, mensagemComunicacao);
}
