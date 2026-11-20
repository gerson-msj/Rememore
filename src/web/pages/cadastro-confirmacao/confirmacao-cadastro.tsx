import { useLayoutEffect, useState } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import { NewKeyConfirmation } from "@web/components/new-key-confirmation/new-key-confirmation";
import { usePopup } from "@web/components/popup/PopupContext";
import "./confirmacao-cadastro.css";

const chaveDemonstracao = "550e8400-e29b-41d4-a716-446655440000";
export default function ConfirmacaoCadastro() {
  const { setConfiguracao } = useHeader();
  const { abrirPopup } = usePopup();
  const [resultadoPopup, setResultadoPopup] = useState("");

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Conta criada" });
  }, [setConfiguracao]);

  async function confirmarEntrada() {
    const acao = await abrirPopup({
      tema: "alerta",
      mensagemHtml:
        "<p>Você já guardou sua chave de redefinição? Depois de entrar, ela não poderá ser exibida novamente.</p>",
      botoes: {
        ok: { texto: "Já guardei, entrar" },
        cancelar: { texto: "Voltar e guardar" },
      },
    });

    setResultadoPopup(
      acao === "OK"
        ? "Ação escolhida: Já guardei, entrar."
        : "Ação escolhida: Voltar e guardar.",
    );
  }

  return (
    <section className="pagina-confirmacao-cadastro">
      <div className="pagina-confirmacao-cadastro-contexto">
        <h2 className="subtitulo">Sua conta foi criada.</h2>
        <p>
          Guarde esta chave: ela será necessária caso você precise redefinir
          sua senha no futuro.
        </p>
      </div>

      <NewKeyConfirmation chave={chaveDemonstracao} />

      <p className="pagina-confirmacao-cadastro-aviso">
        Esta chave será exibida somente agora. O Rememore não poderá mostrá-la
        novamente depois que você sair desta página.
      </p>

      <button
        className="botao cor-link"
        type="button"
        onClick={confirmarEntrada}
      >
        Entrar
      </button>

      {resultadoPopup && (
        <p className="pagina-confirmacao-cadastro-resultado" role="status" aria-live="polite">
          {resultadoPopup}
        </p>
      )}

      <ErrorMessages mensagens={[]} />
    </section>
  );
}
