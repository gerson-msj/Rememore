import { useLayoutEffect } from "react";
import { Navigate, Outlet, useMatch } from "react-router";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import { useSessao } from "@web/contexts/SessaoContext";
import { CHAVE_CONFIRMACAO_CADASTRO, remover } from "@web/services/storage";

type AcessoAreaProps = { tipo: "aberta" | "protegida" };

const mensagemFalhaSessao = "Não foi possível concluir a operação. Tente novamente.";

function EstadoSessaoRota() {
  const { estado, consultarSessao } = useSessao();

  if (estado === "verificando") {
    return <section className="estado-sessao-rota"><p>Aguarde…</p></section>;
  }

  return (
    <section className="estado-sessao-rota">
      <ErrorMessages mensagens={[{ id: "rota-erro-sessao", texto: mensagemFalhaSessao }]} />
      <button className="botao" type="button" onClick={() => void consultarSessao()}>
        Tentar novamente
      </button>
    </section>
  );
}

export function AcessoArea({ tipo }: AcessoAreaProps) {
  const { estado, transicaoCadastroPendente } = useSessao();
  const cadastro = useMatch("/cadastro");
  const confirmacao = useMatch("/cadastro/confirmacao");
  const limparConfirmacao = tipo === "protegida" && estado === "naoAutenticado" && Boolean(confirmacao);

  useLayoutEffect(() => {
    if (!limparConfirmacao) return;

    try {
      remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
    } catch {
      // O redirecionamento pode prosseguir se o armazenamento estiver indisponível.
    }
  }, [limparConfirmacao]);

  if (estado === "verificando" || estado === "falha") {
    return <EstadoSessaoRota />;
  }

  if (tipo === "aberta" && estado === "autenticado") {
    // Mantém o Cadastro montado até ele concluir a navegação para a Confirmação.
    if (cadastro && transicaoCadastroPendente) {
      return <Outlet />;
    }
    return <Navigate to="/home" replace />;
  }

  if (tipo === "protegida" && estado === "naoAutenticado") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export function RotaDesconhecida() {
  const { estado } = useSessao();

  if (estado === "verificando" || estado === "falha") {
    return <EstadoSessaoRota />;
  }

  return <Navigate to={estado === "autenticado" ? "/home" : "/"} replace />;
}
