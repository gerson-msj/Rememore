import { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { PasswordField } from "@web/components/password-field/password-field";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import "./cadastro.css";

export default function Cadastro() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [convite, setConvite] = useState("");
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Criar conta",
      voltar: () => navigate("/"),
    });
  }, [navigate, setConfiguracao]);

  const formularioPreenchido =
    convite.trim().length > 0 &&
    nomeUsuario.trim().length > 0 &&
    senha.trim().length > 0;
  const botaoDesabilitado = !formularioPreenchido;

  return (
    <section className="pagina-cadastro">
      <form className="pagina-cadastro-formulario" onSubmit={(evento) => evento.preventDefault()}>
        <div className="pagina-cadastro-campos">
          <div className="campo-texto">
            <label htmlFor="cadastro-convite">Convite</label>
            <input
              id="cadastro-convite"
              className="controle-com-borda"
              type="text"
              value={convite}
              onChange={(evento) => setConvite(evento.currentTarget.value)}
            />
          </div>

          <div className="campo-texto">
            <label htmlFor="cadastro-nome-usuario">Nome de usuário</label>
            <input
              id="cadastro-nome-usuario"
              className="controle-com-borda"
              type="text"
              autoComplete="username"
              value={nomeUsuario}
              onChange={(evento) => setNomeUsuario(evento.currentTarget.value)}
            />
          </div>

          <PasswordField
            inputId="cadastro-senha"
            value={senha}
            onChange={setSenha}
            autoComplete="new-password"
            hasError={false}
            errorMessage=""
            disabled={false}
          />
        </div>

        <div className="pagina-cadastro-informacoes">
          <p>
            <strong>Fase experimental</strong>
            Esta é uma versão experimental do Rememore. O sistema já pode ser
            utilizado, mas ainda está em desenvolvimento e não podemos garantir a
            manutenção permanente dos dados nesta fase.
          </p>
          <p>
            <strong>Privacidade</strong>
            Suas memórias são pessoais. O conteúdo que você registra não fica
            disponível para leitura por outras pessoas nem pelo administrador do
            Rememore.
          </p>
        </div>

        <button
          className="botao cor-link pagina-cadastro-enviar"
          type="submit"
          disabled={botaoDesabilitado}
        >
          Criar conta
        </button>

        <ErrorMessages mensagens={[]} />
      </form>
    </section>
  );
}
