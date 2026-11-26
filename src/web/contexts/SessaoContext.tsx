import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CriarContaRequest, EntrarRequest, Perfil, RedefinirSenhaRequest, SessaoResponse } from "@shared/usuarios";
import { falhaDesconhecida, type FalhaHttp } from "@web/services/http";
import * as servicoUsuario from "@web/services/usuario";
import {
  observarSessaoInvalidada, obterGeracaoSessao, renovarGeracaoSessao,
  RespostaSessaoObsoleta, verificarGeracaoSessao,
} from "@web/services/sessao-http";

export type EstadoSessao = "verificando" | "autenticado" | "naoAutenticado" | "falha";

type ContextoSessao = {
  estado: EstadoSessao;
  perfil: Perfil | null;
  /** Identidade estável do usuário autenticado. */
  idUsuario: string | null;
  erro: FalhaHttp | null;
  transicaoCadastroPendente: boolean;
  transicaoRedefinicaoPendente: boolean;
  criarConta: (dados: CriarContaRequest) => Promise<string>;
  entrar: (dados: EntrarRequest) => Promise<void>;
  redefinirSenha: (dados: RedefinirSenhaRequest) => Promise<string>;
  concluirTransicaoCadastro: () => void;
  concluirTransicaoRedefinicao: () => void;
  consultarSessao: () => Promise<void>;
  sair: () => Promise<boolean>;
};

const SessaoContext = createContext<ContextoSessao | null>(null);

type SessaoProviderProps = { children: ReactNode };

export function SessaoProvider({ children }: SessaoProviderProps) {
  const [estado, setEstado] = useState<EstadoSessao>("verificando");
  const [sessao, setSessao] = useState<SessaoResponse | null>(null);
  const [erro, setErro] = useState<FalhaHttp | null>(null);
  const [transicaoCadastroPendente, setTransicaoCadastroPendente] = useState(false);
  const [transicaoRedefinicaoPendente, setTransicaoRedefinicaoPendente] = useState(false);
  const consultaInicialIniciada = useRef(false);

  useEffect(() => observarSessaoInvalidada(() => {
    setSessao(null);
    setErro(null);
    setTransicaoCadastroPendente(false);
    setTransicaoRedefinicaoPendente(false);
    setEstado("naoAutenticado");
  }), []);

  const consultarSessao = useCallback(async () => {
    const geracao = obterGeracaoSessao();
    setEstado("verificando");
    setSessao(null);
    setErro(null);
    setTransicaoCadastroPendente(false);
    setTransicaoRedefinicaoPendente(false);
    try {
      const resposta = await servicoUsuario.consultarSessao();
      verificarGeracaoSessao(geracao);
      renovarGeracaoSessao(resposta?.idUsuario);
      setSessao(resposta);
      setEstado(resposta ? "autenticado" : "naoAutenticado");
    } catch (falha) {
      if (geracao !== obterGeracaoSessao()) return;
      setErro(falhaDesconhecida(falha));
      setEstado("falha");
      setSessao(null);
    }
  }, []);

  const criarConta = useCallback(async (dados: CriarContaRequest) => {
    const geracao = obterGeracaoSessao();
    try {
      const resposta = await servicoUsuario.criarConta(dados);
      verificarGeracaoSessao(geracao);
      renovarGeracaoSessao(resposta.idUsuario);
      const { perfil, idUsuario } = resposta;
      setSessao({ perfil, idUsuario });
      setErro(null);
      setTransicaoCadastroPendente(true);
      setTransicaoRedefinicaoPendente(false);
      setEstado("autenticado");
      return resposta.chaveRedefinicao;
    } catch (falha) {
      verificarGeracaoSessao(geracao);
      throw falhaDesconhecida(falha);
    }
  }, []);

  const entrar = useCallback(async (dados: EntrarRequest) => {
    const geracao = obterGeracaoSessao();
    try {
      const resposta = await servicoUsuario.entrar(dados);
      verificarGeracaoSessao(geracao);
      renovarGeracaoSessao(resposta.idUsuario);
      setSessao(resposta);
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(false);
      setEstado("autenticado");
    } catch (falha) {
      verificarGeracaoSessao(geracao);
      throw falhaDesconhecida(falha);
    }
  }, []);

  const redefinirSenha = useCallback(async (dados: RedefinirSenhaRequest) => {
    const geracao = obterGeracaoSessao();
    try {
      const resposta = await servicoUsuario.redefinirSenha(dados);
      verificarGeracaoSessao(geracao);
      renovarGeracaoSessao(resposta.idUsuario);
      const { perfil, idUsuario } = resposta;
      setSessao({ perfil, idUsuario });
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(true);
      setEstado("autenticado");
      return resposta.chaveRedefinicao;
    } catch (falha) {
      verificarGeracaoSessao(geracao);
      throw falhaDesconhecida(falha);
    }
  }, []);

  const concluirTransicaoCadastro = useCallback(() => {
    setTransicaoCadastroPendente(false);
  }, []);

  const concluirTransicaoRedefinicao = useCallback(() => {
    setTransicaoRedefinicaoPendente(false);
  }, []);

  const sair = useCallback(async () => {
    const geracao = obterGeracaoSessao();
    try {
      await servicoUsuario.sair();
      verificarGeracaoSessao(geracao);
      renovarGeracaoSessao();
      setSessao(null);
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(false);
      setEstado("naoAutenticado");
      return true;
    } catch (falha) {
      if (falha instanceof RespostaSessaoObsoleta || geracao !== obterGeracaoSessao()) return false;
      throw falhaDesconhecida(falha);
    }
  }, []);

  useEffect(() => {
    if (consultaInicialIniciada.current) return;
    consultaInicialIniciada.current = true;
    void consultarSessao();
  }, [consultarSessao]);

  const valor = useMemo<ContextoSessao>(
    () => ({
      estado,
      perfil: sessao?.perfil ?? null,
      idUsuario: sessao?.idUsuario ?? null,
      erro,
      transicaoCadastroPendente,
      transicaoRedefinicaoPendente,
      criarConta,
      entrar,
      redefinirSenha,
      concluirTransicaoCadastro,
      concluirTransicaoRedefinicao,
      consultarSessao,
      sair,
    }),
    [estado, sessao, erro, transicaoCadastroPendente, transicaoRedefinicaoPendente, criarConta, entrar, redefinirSenha, concluirTransicaoCadastro, concluirTransicaoRedefinicao, consultarSessao, sair],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) throw new Error("useSessao deve ser usado dentro de SessaoProvider.");
  return contexto;
}
