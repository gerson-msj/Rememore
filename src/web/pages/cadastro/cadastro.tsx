import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { PasswordField } from "@web/components/password-field/password-field";
import { ErrorMessages, type MensagemErro } from "@web/components/error-messages/error-messages";
import { useSessao } from "@web/contexts/SessaoContext";
import { FalhaHttp, falhaDesconhecida } from "@web/services/http";
import {
  armazenar,
  CHAVE_CONFIRMACAO_CADASTRO,
  remover,
  verificarAcesso,
} from "@web/services/storage";
import type { ErrosCamposCadastro } from "@shared/usuarios";
import "./cadastro.css";

type CampoCadastro = keyof ErrosCamposCadastro;

const identificadoresCampos: Record<CampoCadastro, string> = {
  convite: "cadastro-convite",
  nomeUsuario: "cadastro-nome-usuario",
  senha: "cadastro-senha",
};

const mensagensValidacao: Pick<Required<ErrosCamposCadastro>, "nomeUsuario" | "senha"> = {
  nomeUsuario: "Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.",
  senha: "A senha deve ter pelo menos 6 caracteres.",
};
const mensagemArmazenamentoIndisponivel =
  "Não foi possível acessar o armazenamento deste navegador. Habilite o armazenamento do site e tente criar a conta novamente.";

export default function Cadastro() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const conviteInicial = parametros.get("convite") ?? "";
  const conviteRecebido = conviteInicial.length > 0;
  const [convite, setConvite] = useState(conviteInicial);
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [errosCampos, setErrosCampos] = useState<ErrosCamposCadastro>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const envioEmAndamento = useRef(false);
  const { criarConta, concluirTransicaoCadastro } = useSessao();

  useLayoutEffect(() => {
    setConfiguracao({
      titulo: "Criar conta",
      voltar: () => navigate("/"),
    });
  }, [navigate, setConfiguracao]);

  useLayoutEffect(() => () => {
    concluirTransicaoCadastro();
  }, [concluirTransicaoCadastro]);

  const formularioPreenchido = [convite, nomeUsuario, senha].every((valor) => valor.trim().length > 0);
  const botaoDesabilitado = !formularioPreenchido || enviando;

  function alterarCampo(campo: CampoCadastro, valor: string) {
    if (campo === "convite") setConvite(valor);
    if (campo === "nomeUsuario") setNomeUsuario(valor);
    if (campo === "senha") setSenha(valor);
    setErrosCampos((atuais) => {
      const seguintes = { ...atuais };
      delete seguintes[campo];
      return seguintes;
    });
    setErroGeral("");
  }

  async function enviarCadastro(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (envioEmAndamento.current || enviando) return;

    setErroGeral("");
    const convitePreparado = convite.trim();
    const nomeUsuarioPreparado = nomeUsuario.trim().toLowerCase();
    const senhaPreparada = senha;
    const errosLocais: ErrosCamposCadastro = {};

    if (!nomeUsuarioPreparado || /\s/.test(nomeUsuarioPreparado)) {
      errosLocais.nomeUsuario = mensagensValidacao.nomeUsuario;
    }
    if (!senhaPreparada.trim() || senhaPreparada.length < 6) {
      errosLocais.senha = mensagensValidacao.senha;
    }
    setErrosCampos(errosLocais);

    if (!convitePreparado || Object.keys(errosLocais).length > 0) return;

    if (!verificarAcesso("sessao")) {
      setErroGeral(mensagemArmazenamentoIndisponivel);
      return;
    }

    envioEmAndamento.current = true;
    setEnviando(true);
    let chaveRedefinicao: string | null = null;
    try {
      chaveRedefinicao = await criarConta({
        convite: convitePreparado,
        nomeUsuario: nomeUsuarioPreparado,
        senha: senhaPreparada,
      });
    } catch (falha) {
      const erro = falhaDesconhecida(falha);
      if (erro instanceof FalhaHttp && erro.tipo === "aplicacao") {
        setErrosCampos(erro.errosCampos ?? {});
        setErroGeral(erro.message);
      } else {
        setErrosCampos({});
        setErroGeral(erro.message);
      }
    } finally {
      envioEmAndamento.current = false;
      setEnviando(false);
    }

    if (chaveRedefinicao === null) return;

    let chaveNaoGravada = false;
    try {
      armazenar(CHAVE_CONFIRMACAO_CADASTRO, { chaveRedefinicao }, "sessao");
    } catch {
      chaveNaoGravada = true;
      try {
        remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
      } catch {
        // A Confirmação ignora o registro anterior mesmo se a remoção falhar.
      }
    }

    navigate("/cadastro/confirmacao", { state: { chaveNaoGravada } });
  }

  const mensagensErro: MensagemErro[] = [
    ...Object.entries(errosCampos).flatMap(([campo, texto]) =>
      texto
        ? [{ id: `cadastro-erro-${campo}`, texto, campo }]
        : [],
    ),
    ...(erroGeral ? [{ id: "cadastro-erro-geral", texto: erroGeral }] : []),
  ];

  function focarCampo(campo: string) {
    const id = identificadoresCampos[campo as CampoCadastro];
    if (id) document.getElementById(id)?.focus();
  }

  return (
    <section className="pagina-cadastro">
      <form className="pagina-cadastro-formulario" onSubmit={enviarCadastro}>
        <div className="pagina-cadastro-campos">
          <div className={`campo-texto${errosCampos.convite ? " cor-perigo" : ""}`}>
            <label htmlFor="cadastro-convite">Convite</label>
            <input
              id="cadastro-convite"
              className="controle-com-borda"
              type="text"
              readOnly={conviteRecebido}
              disabled={enviando}
              aria-invalid={Boolean(errosCampos.convite) || undefined}
              aria-describedby={errosCampos.convite ? "cadastro-erro-convite" : undefined}
              value={convite}
              onChange={(evento) => alterarCampo("convite", evento.currentTarget.value)}
            />
          </div>

          <div className={`campo-texto${errosCampos.nomeUsuario ? " cor-perigo" : ""}`}>
            <label htmlFor="cadastro-nome-usuario">Nome de usuário</label>
            <input
              id="cadastro-nome-usuario"
              className="controle-com-borda"
              type="text"
              autoComplete="username"
              disabled={enviando}
              aria-invalid={Boolean(errosCampos.nomeUsuario) || undefined}
              aria-describedby={errosCampos.nomeUsuario ? "cadastro-erro-nomeUsuario" : undefined}
              value={nomeUsuario}
              onChange={(evento) => alterarCampo("nomeUsuario", evento.currentTarget.value)}
            />
          </div>

          <PasswordField
            inputId="cadastro-senha"
            value={senha}
            onChange={(valor) => alterarCampo("senha", valor)}
            autoComplete="new-password"
            hasError={Boolean(errosCampos.senha)}
            errorMessage={errosCampos.senha ?? ""}
            errorMessageId="cadastro-erro-senha"
            renderErrorMessage={false}
            disabled={enviando}
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

        <ErrorMessages mensagens={mensagensErro} aoFocarCampo={focarCampo} />
      </form>
    </section>
  );
}
