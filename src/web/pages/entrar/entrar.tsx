import { useLayoutEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { PasswordField } from "@web/components/password-field/password-field";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import "./entrar.css";

export default function Entrar() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Entrar",
      voltar: () => navigate("/"),
      apresentarSair: false,
    });
  }, [navigate, setConfiguracao]);

  function impedirEnvio(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
  }

  const habilitarEntrar = nomeUsuario.length > 0 && senha.length > 0;

  return (
    <section className="pagina-entrar">
      <form className="pagina-entrar-formulario" onSubmit={impedirEnvio}>
        <div className="pagina-entrar-campos">
          {/* ELM-05, caixa de texto: reproduzido conforme o bloco compartilhado da bancada. */}
          <div className="campo-texto">
            <label htmlFor="entrar-nome-usuario">Nome de usuário</label>
            <input
              id="entrar-nome-usuario"
              className="controle-com-borda"
              type="text"
              autoComplete="username"
              value={nomeUsuario}
              onChange={(evento) => setNomeUsuario(evento.currentTarget.value)}
            />
          </div>

          <PasswordField
            inputId="entrar-senha"
            value={senha}
            onChange={setSenha}
            autoComplete="current-password"
            hasError={false}
            errorMessage=""
            disabled={false}
          />
        </div>

        <div className="pagina-entrar-acoes">
          {/* ELM-06, botão: reproduzido conforme a variação compartilhada da bancada. */}
          <button className="botao pagina-entrar-enviar" type="submit" disabled={!habilitarEntrar}>
            Entrar
          </button>
          {/* ELM-03, link: sem navegação nesta etapa. */}
          <a className="link pagina-entrar-redefinir" href="#" onClick={(evento) => evento.preventDefault()}>
            Redefinir senha
          </a>
        </div>

        <ErrorMessages mensagens={[]} />
      </form>
    </section>
  );
}
