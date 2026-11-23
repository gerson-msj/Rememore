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
import type { CriarContaRequest, EntrarRequest, Perfil, RedefinirSenhaRequest } from "@shared/usuarios";
import { falhaDesconhecida, type FalhaHttp } from "@web/services/http";
import * as servicoUsuario from "@web/services/usuario";

export type EstadoSessao = "verificando" | "autenticado" | "naoAutenticado" | "falha";

type ContextoSessao = {
  estado: EstadoSessao;
  perfil: Perfil | null;
  erro: FalhaHttp | null;
  transicaoCadastroPendente: boolean;
  transicaoRedefinicaoPendente: boolean;
  criarConta: (dados: CriarContaRequest) => Promise<string>;
  entrar: (dados: EntrarRequest) => Promise<void>;
  redefinirSenha: (dados: RedefinirSenhaRequest) => Promise<string>;
  concluirTransicaoCadastro: () => void;
  concluirTransicaoRedefinicao: () => void;
  consultarSessao: () => Promise<void>;
  sair: () => Promise<void>;
};

const SessaoContext = createContext<ContextoSessao | null>(null);

type SessaoProviderProps = { children: ReactNode };

export function SessaoProvider({ children }: SessaoProviderProps) {
  const [estado, setEstado] = useState<EstadoSessao>("verificando");
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [erro, setErro] = useState<FalhaHttp | null>(null);
  const [transicaoCadastroPendente, setTransicaoCadastroPendente] = useState(false);
  const [transicaoRedefinicaoPendente, setTransicaoRedefinicaoPendente] = useState(false);
  const consultaInicialIniciada = useRef(false);

  const consultarSessao = useCallback(async () => {
    setEstado("verificando");
    setPerfil(null);
    setErro(null);
    setTransicaoCadastroPendente(false);
    setTransicaoRedefinicaoPendente(false);
    try {
      const sessao = await servicoUsuario.consultarSessao();
      setPerfil(sessao?.perfil ?? null);
      setEstado(sessao ? "autenticado" : "naoAutenticado");
    } catch (falha) {
      setErro(falhaDesconhecida(falha));
      setEstado("falha");
      setPerfil(null);
    }
  }, []);

  const criarConta = useCallback(async (dados: CriarContaRequest) => {
    try {
      const resposta = await servicoUsuario.criarConta(dados);
      setPerfil(resposta.perfil);
      setErro(null);
      setTransicaoCadastroPendente(true);
      setTransicaoRedefinicaoPendente(false);
      setEstado("autenticado");
      return resposta.chaveRedefinicao;
    } catch (falha) {
      throw falhaDesconhecida(falha);
    }
  }, []);

  const entrar = useCallback(async (dados: EntrarRequest) => {
    try {
      const resposta = await servicoUsuario.entrar(dados);
      setPerfil(resposta.perfil);
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(false);
      setEstado("autenticado");
    } catch (falha) {
      throw falhaDesconhecida(falha);
    }
  }, []);

  const redefinirSenha = useCallback(async (dados: RedefinirSenhaRequest) => {
    try {
      const resposta = await servicoUsuario.redefinirSenha(dados);
      setPerfil(resposta.perfil);
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(true);
      setEstado("autenticado");
      return resposta.chaveRedefinicao;
    } catch (falha) {
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
    try {
      await servicoUsuario.sair();
      setPerfil(null);
      setErro(null);
      setTransicaoCadastroPendente(false);
      setTransicaoRedefinicaoPendente(false);
      setEstado("naoAutenticado");
    } catch (falha) {
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
      perfil,
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
    [estado, perfil, erro, transicaoCadastroPendente, transicaoRedefinicaoPendente, criarConta, entrar, redefinirSenha, concluirTransicaoCadastro, concluirTransicaoRedefinicao, consultarSessao, sair],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) throw new Error("useSessao deve ser usado dentro de SessaoProvider.");
  return contexto;
}
