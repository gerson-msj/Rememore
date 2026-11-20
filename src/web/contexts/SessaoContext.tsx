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
import type { DadosCriarConta, Perfil } from "@shared/usuarios";
import { falhaDesconhecida, type FalhaHttp } from "@web/services/http";
import * as servicoUsuario from "@web/services/usuario";

export type EstadoSessao = "verificando" | "autenticado" | "naoAutenticado" | "falha";

type ContextoSessao = {
  estado: EstadoSessao;
  perfil: Perfil | null;
  erro: FalhaHttp | null;
  transicaoCadastroPendente: boolean;
  criarConta: (dados: DadosCriarConta) => Promise<string>;
  concluirTransicaoCadastro: () => void;
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
  const consultaInicialIniciada = useRef(false);

  const consultarSessao = useCallback(async () => {
    setEstado("verificando");
    setPerfil(null);
    setErro(null);
    setTransicaoCadastroPendente(false);
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

  const criarConta = useCallback(async (dados: DadosCriarConta) => {
    try {
      const resposta = await servicoUsuario.criarConta(dados);
      setPerfil(resposta.perfil);
      setErro(null);
      setTransicaoCadastroPendente(true);
      setEstado("autenticado");
      return resposta.chaveRedefinicao;
    } catch (falha) {
      throw falhaDesconhecida(falha);
    }
  }, []);

  const concluirTransicaoCadastro = useCallback(() => {
    setTransicaoCadastroPendente(false);
  }, []);

  const sair = useCallback(async () => {
    try {
      await servicoUsuario.sair();
      setPerfil(null);
      setErro(null);
      setTransicaoCadastroPendente(false);
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
      criarConta,
      concluirTransicaoCadastro,
      consultarSessao,
      sair,
    }),
    [estado, perfil, erro, transicaoCadastroPendente, criarConta, concluirTransicaoCadastro, consultarSessao, sair],
  );

  return <SessaoContext.Provider value={valor}>{children}</SessaoContext.Provider>;
}

export function useSessao() {
  const contexto = useContext(SessaoContext);
  if (!contexto) throw new Error("useSessao deve ser usado dentro de SessaoProvider.");
  return contexto;
}
