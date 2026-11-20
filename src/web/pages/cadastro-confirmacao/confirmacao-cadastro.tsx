import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { ErrorMessages, type MensagemErro } from "@web/components/error-messages/error-messages";
import { NewKeyConfirmation } from "@web/components/new-key-confirmation/new-key-confirmation";
import { usePopup } from "@web/components/popup/PopupContext";
import { useSessao } from "@web/contexts/SessaoContext";
import {
  CHAVE_CONFIRMACAO_CADASTRO,
  recuperar,
  remover,
} from "@web/services/storage";
import "./confirmacao-cadastro.css";

type ContextoCadastro = { chaveRedefinicao: string };

const mensagemFalhaSessao = "Não foi possível concluir a operação. Tente novamente.";
const mensagemChaveIndisponivel =
  "Não foi possível recuperar sua chave de redefinição de senha. Você poderá entrar no Rememore, mas talvez não consiga redefinir sua senha. Entre em contato com o administrador para receber orientação.";

export default function ConfirmacaoCadastro() {
  const { setConfiguracao } = useHeader();
  const { abrirPopup } = usePopup();
  const navigate = useNavigate();
  const { estado: estadoSessao, consultarSessao } = useSessao();
  const [chaveRedefinicao, setChaveRedefinicao] = useState<string | null>(null);
  const [leituraConcluida, setLeituraConcluida] = useState(false);
  const leituraIniciada = useRef(false);

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Conta criada" });
  }, [setConfiguracao]);

  useEffect(() => {
    if (estadoSessao === "verificando") return;

    if (estadoSessao === "falha") {
      leituraIniciada.current = false;
      return;
    }

    if (estadoSessao === "naoAutenticado") {
      try {
        remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
      } catch {
        // A navegação não depende da remoção do registro temporário.
      }
      navigate("/", { replace: true });
      return;
    }

    if (leituraIniciada.current) return;
    leituraIniciada.current = true;

    let chave: string | null = null;
    try {
      const contexto = recuperar<ContextoCadastro>(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
      chave = typeof contexto?.chaveRedefinicao === "string" && contexto.chaveRedefinicao.length > 0
        ? contexto.chaveRedefinicao
        : null;
    } catch {
      chave = null;
    }

    setChaveRedefinicao(chave);
    setLeituraConcluida(true);
  }, [estadoSessao, navigate]);

  async function confirmarEntrada() {
    if (!chaveRedefinicao) {
      navigate("/home", { replace: true });
      return;
    }

    const acao = await abrirPopup({
      tema: "alerta",
      mensagemHtml:
        "<p>Você já guardou sua chave de redefinição? Depois de entrar, ela não poderá ser exibida novamente.</p>",
      botoes: {
        ok: { texto: "Já guardei, entrar" },
        cancelar: { texto: "Voltar e guardar" },
      },
    });

    if (acao !== "OK") return;

    try {
      remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
    } catch {
      // A remoção não bloqueia a entrada.
    }
    navigate("/home", { replace: true });
  }

  if (estadoSessao === "falha") {
    return (
      <section className="pagina-confirmacao-cadastro">
        <ErrorMessages mensagens={[{ id: "confirmacao-erro-sessao", texto: mensagemFalhaSessao }]} />
        <button className="botao" type="button" onClick={() => void consultarSessao()}>
          Tentar novamente
        </button>
      </section>
    );
  }

  if (estadoSessao !== "autenticado" || !leituraConcluida) {
    return (
      <section className="pagina-confirmacao-cadastro">
        <p>Aguarde…</p>
      </section>
    );
  }

  const mensagensErro: MensagemErro[] = chaveRedefinicao
    ? []
    : [{ id: "confirmacao-erro-chave", texto: mensagemChaveIndisponivel }];

  return (
    <section className="pagina-confirmacao-cadastro">
      {chaveRedefinicao && (
        <>
          <div className="pagina-confirmacao-cadastro-contexto">
            <h2 className="subtitulo">Sua conta foi criada.</h2>
            <p>
              Guarde esta chave: ela será necessária caso você precise redefinir
              sua senha no futuro.
            </p>
          </div>

          <NewKeyConfirmation chave={chaveRedefinicao} />

          <p className="pagina-confirmacao-cadastro-aviso">
            Esta chave será exibida somente agora. O Rememore não poderá mostrá-la
            novamente depois que você sair desta página.
          </p>
        </>
      )}

      <button
        className="botao cor-link"
        type="button"
        onClick={confirmarEntrada}
      >
        Entrar
      </button>

      <ErrorMessages mensagens={mensagensErro} />
    </section>
  );
}
