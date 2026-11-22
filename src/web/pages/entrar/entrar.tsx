import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { PasswordField } from "@web/components/password-field/password-field";
import { ErrorMessages } from "@web/components/error-messages/error-messages";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext.tsx";
import { useSessao } from "@web/contexts/SessaoContext";
import { FalhaHttp } from "@web/services/http";
import "./entrar.css";

const MENSAGEM_CREDENCIAIS = "Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.";
const MENSAGEM_HTTP = "Não foi possível concluir a operação. Tente novamente.";
const MENSAGEM_COMUNICACAO = "Não foi possível comunicar com o servidor. Tente novamente.";

export default function Entrar() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const { entrar } = useSessao();
  const { processar } = useProcessamento();
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [credenciaisRejeitadas, setCredenciaisRejeitadas] = useState(false);
  const envioEmCurso = useRef(false);

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Entrar",
      voltar: () => navigate("/"),
      apresentarSair: false,
    });
  }, [navigate, setConfiguracao]);

  function limparFalhaAnterior() {
    setMensagem("");
    setCredenciaisRejeitadas(false);
  }

  function alterarNomeUsuario(valor: string) {
    setNomeUsuario(valor);
    limparFalhaAnterior();
  }

  function alterarSenha(valor: string) {
    setSenha(valor);
    limparFalhaAnterior();
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const nomeNormalizado = nomeUsuario.trim().toLowerCase();
    if (
      envioEmCurso.current || enviando || credenciaisRejeitadas ||
      nomeNormalizado.length === 0 || senha.trim().length === 0
    ) return;

    if (/\s/.test(nomeNormalizado)) {
      setMensagem(MENSAGEM_CREDENCIAIS);
      setCredenciaisRejeitadas(true);
      return;
    }

    envioEmCurso.current = true;
    setEnviando(true);
    setMensagem("");

    try {
      await processar(() => entrar({ nomeUsuario: nomeNormalizado, senha }));
      // AcessoArea redireciona para /home quando a sessão muda para autenticada.
    } catch (falha) {
      if (falha instanceof FalhaHttp && falha.tipo === "aplicacao" && falha.status === 401) {
        setMensagem(MENSAGEM_CREDENCIAIS);
        setCredenciaisRejeitadas(true);
      } else if (falha instanceof FalhaHttp && falha.tipo === "comunicacao") {
        setMensagem(MENSAGEM_COMUNICACAO);
      } else {
        setMensagem(MENSAGEM_HTTP);
      }
    } finally {
      envioEmCurso.current = false;
      setEnviando(false);
    }
  }

  const habilitarEntrar = nomeUsuario.trim().length > 0 && senha.trim().length > 0 &&
    !enviando && !credenciaisRejeitadas;
  const mensagens = mensagem ? [{ id: "entrar-erro-geral", texto: mensagem }] : [];

  return (
    <section className="pagina-entrar">
      <form className="pagina-entrar-formulario" onSubmit={enviar}>
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
              onChange={(evento) => alterarNomeUsuario(evento.currentTarget.value)}
            />
          </div>

          <PasswordField
            inputId="entrar-senha"
            value={senha}
            onChange={alterarSenha}
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

        <ErrorMessages mensagens={mensagens} />
      </form>
    </section>
  );
}
