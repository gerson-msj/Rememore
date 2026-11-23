import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { ErrorMessages, type MensagemErro } from "@web/components/error-messages/error-messages";
import { NewKeyConfirmation } from "@web/components/new-key-confirmation/new-key-confirmation";
import { usePopup } from "@web/components/popup/PopupContext";
import { useSessao } from "@web/contexts/SessaoContext";
import {
  CHAVE_CONFIRMACAO_CADASTRO,
  CHAVE_CONFIRMACAO_REDEFINICAO,
  recuperar,
  remover,
} from "@web/services/storage";
import "./chave-redefinicao.css";

type ContextoCadastro = { chaveRedefinicao: string };
type OrigemConfirmacao = "cadastro" | "redefinicao";

const mensagemChaveIndisponivel =
  "Não foi possível recuperar sua chave de redefinição de senha. Você poderá entrar no Rememore, mas talvez não consiga redefinir sua senha. Entre em contato com o administrador para receber orientação.";

export default function ChaveRedefinicao() {
  const { setConfiguracao } = useHeader();
  const { abrirPopup } = usePopup();
  const navigate = useNavigate();
  const localizacao = useLocation();
  const origem: OrigemConfirmacao = localizacao.pathname === "/redefinir-senha/confirmacao"
    ? "redefinicao"
    : "cadastro";
  const chaveNaoGravada = localizacao.state?.chaveNaoGravada === true;
  const [chaveRedefinicao, setChaveRedefinicao] = useState<string | null>(null);
  const [leituraConcluida, setLeituraConcluida] = useState(false);
  const leituraIniciada = useRef(false);
  const { concluirTransicaoRedefinicao } = useSessao();

  useLayoutEffect(() => {
    setConfiguracao({ titulo: origem === "cadastro" ? "Conta criada" : "Senha redefinida", apresentarSair: false });
  }, [origem, setConfiguracao]);

  useEffect(() => {
    if (origem === "redefinicao") concluirTransicaoRedefinicao();
  }, [concluirTransicaoRedefinicao, origem]);

  useEffect(() => {
    if (leituraIniciada.current) return;
    leituraIniciada.current = true;

    if (chaveNaoGravada) {
      setLeituraConcluida(true);
      return;
    }

    let chave: string | null = null;
    try {
      const registro = origem === "cadastro" ? CHAVE_CONFIRMACAO_CADASTRO : CHAVE_CONFIRMACAO_REDEFINICAO;
      const contexto = recuperar<ContextoCadastro>(registro, "sessao");
      chave = typeof contexto?.chaveRedefinicao === "string" && contexto.chaveRedefinicao.length > 0
        ? contexto.chaveRedefinicao
        : null;
    } catch {
      chave = null;
    }

    setChaveRedefinicao(chave);
    setLeituraConcluida(true);
  }, [chaveNaoGravada, origem]);

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
        ok: { texto: "Já guardei, entrar", tema: "info" },
        cancelar: { texto: "Voltar e guardar", tema: "alerta" },
      },
    });

    if (acao !== "OK") return;

    try {
      remover(origem === "cadastro" ? CHAVE_CONFIRMACAO_CADASTRO : CHAVE_CONFIRMACAO_REDEFINICAO, "sessao");
    } catch {
      // A remoção não bloqueia a entrada.
    }
    navigate("/home", { replace: true });
  }

  if (!leituraConcluida) {
    return (
      <section className="pagina-chave-redefinicao">
        <p>Aguarde…</p>
      </section>
    );
  }

  const mensagensErro: MensagemErro[] = chaveRedefinicao
    ? []
    : [{ id: "confirmacao-erro-chave", texto: mensagemChaveIndisponivel }];

  return (
    <section className="pagina-chave-redefinicao">
      {chaveRedefinicao && (
        <>
          <div className="pagina-chave-redefinicao-contexto">
            <h2 className="subtitulo">{origem === "cadastro" ? "Sua conta foi criada." : "Sua senha foi redefinida."}</h2>
            <p>{origem === "cadastro"
              ? "Guarde esta chave: ela será necessária caso você precise redefinir sua senha no futuro."
              : "Guarde esta nova chave: ela será necessária caso você precise redefinir sua senha novamente no futuro."}</p>
          </div>

          <NewKeyConfirmation chave={chaveRedefinicao} />

          <p className="pagina-chave-redefinicao-aviso">
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
