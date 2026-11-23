import { useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import { PasswordField } from "@web/components/password-field/password-field";
import { ErrorMessages, type MensagemErro } from "@web/components/error-messages/error-messages";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext.tsx";
import { useSessao } from "@web/contexts/SessaoContext";
import { FalhaHttp, falhaDesconhecida } from "@web/services/http";
import { armazenar, CHAVE_CONFIRMACAO_REDEFINICAO, verificarAcesso } from "@web/services/storage";
import type { RedefinirSenhaRequest } from "@shared/usuarios";
import "./redefinir-senha.css";

type ErrosRedefinicao = Partial<Record<"nomeUsuario" | "novaSenha", string>>;
const mensagemNome = "Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.";
const mensagemSenha = "A senha deve ter pelo menos 6 caracteres.";
const mensagemArmazenamento = "Não foi possível acessar o armazenamento deste navegador. Habilite o armazenamento do site e tente redefinir a senha novamente.";
const mensagemRejeicao = "Não foi possível redefinir a senha. Confira as informações e tente novamente.";
const mensagemHttp = "Não foi possível concluir a operação. Tente novamente.";
const mensagemComunicacao = "Não foi possível comunicar com o servidor. Tente novamente.";

export default function RedefinirSenha() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();
  const chaveInicial = parametros.get("chave") ?? "";
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [chave, setChave] = useState(chaveInicial);
  const [novaSenha, setNovaSenha] = useState("");
  const [errosCampos, setErrosCampos] = useState<ErrosRedefinicao>({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const emAndamento = useRef(false);
  const { redefinirSenha } = useSessao();
  const { processar } = useProcessamento();

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Redefinir senha", voltar: () => navigate("/entrar"), apresentarSair: false });
  }, [navigate, setConfiguracao]);

  function alterar(campo: "nomeUsuario" | "chaveRedefinicao" | "novaSenha", valor: string) {
    if (campo === "nomeUsuario") setNomeUsuario(valor);
    if (campo === "chaveRedefinicao") setChave(valor);
    if (campo === "novaSenha") setNovaSenha(valor);
    setErrosCampos((atuais) => {
      const seguintes = { ...atuais };
      if (campo === "nomeUsuario") delete seguintes.nomeUsuario;
      if (campo === "novaSenha") delete seguintes.novaSenha;
      return seguintes;
    });
    setErroGeral("");
  }

  async function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (emAndamento.current || enviando) return;
    setErroGeral("");
    const usuarioPreparado = nomeUsuario.trim().toLowerCase();
    const erros: ErrosRedefinicao = {};
    if (!usuarioPreparado || /\s/.test(usuarioPreparado)) erros.nomeUsuario = mensagemNome;
    if (!novaSenha.trim() || novaSenha.length < 6) erros.novaSenha = mensagemSenha;
    setErrosCampos(erros);
    if (!usuarioPreparado || !chave.trim() || !novaSenha.trim() || Object.keys(erros).length > 0) return;
    if (!verificarAcesso("sessao")) {
      setErroGeral(mensagemArmazenamento);
      return;
    }

    emAndamento.current = true;
    setEnviando(true);
    let chaveRetornada: string | null = null;
    try {
      const dados: RedefinirSenhaRequest = { nomeUsuario: usuarioPreparado, chaveRedefinicao: chave, novaSenha };
      chaveRetornada = await processar(() => redefinirSenha(dados), "Aguarde...");
    } catch (falha) {
      const erro = falhaDesconhecida(falha);
      if (erro instanceof FalhaHttp && erro.tipo === "aplicacao") setErroGeral(erro.message || mensagemRejeicao);
      else if (erro.tipo === "comunicacao") setErroGeral(mensagemComunicacao);
      else setErroGeral(mensagemHttp);
    } finally {
      emAndamento.current = false;
      setEnviando(false);
    }
    if (chaveRetornada === null) return;

    let chaveNaoGravada = false;
    try {
      armazenar(CHAVE_CONFIRMACAO_REDEFINICAO, { chaveRedefinicao: chaveRetornada }, "sessao");
    } catch {
      chaveNaoGravada = true;
      try { window.sessionStorage.removeItem(CHAVE_CONFIRMACAO_REDEFINICAO); } catch { /* confirmação exibirá estado indisponível */ }
    }
    navigate("/redefinir-senha/confirmacao", { state: { chaveNaoGravada } });
  }

  const preenchido = [nomeUsuario, chave, novaSenha].every((valor) => valor.trim().length > 0);
  const mensagens: MensagemErro[] = [
    ...(errosCampos.nomeUsuario ? [{ id: "redefinir-erro-nome", texto: errosCampos.nomeUsuario, campo: "nomeUsuario" }] : []),
    ...(errosCampos.novaSenha ? [{ id: "redefinir-erro-senha", texto: errosCampos.novaSenha, campo: "novaSenha" }] : []),
    ...(erroGeral ? [{ id: "redefinir-erro-geral", texto: erroGeral }] : []),
  ];
  function focar(campo: string) {
    document.getElementById(campo === "nomeUsuario" ? "redefinir-nome-usuario" : "redefinir-nova-senha")?.focus();
  }

  return (
    <section className="pagina-redefinir-senha">
      <form className="pagina-redefinir-senha-formulario" onSubmit={enviar}>
        <div className="pagina-redefinir-senha-campos">
          <div className={`campo-texto${errosCampos.nomeUsuario ? " cor-perigo" : ""}`}>
            <label htmlFor="redefinir-nome-usuario">Nome de usuário</label>
            <input id="redefinir-nome-usuario" className="controle-com-borda" type="text" autoComplete="username" disabled={enviando} value={nomeUsuario} aria-invalid={Boolean(errosCampos.nomeUsuario) || undefined} aria-describedby={errosCampos.nomeUsuario ? "redefinir-erro-nome" : undefined} onChange={(e) => alterar("nomeUsuario", e.currentTarget.value)} />
          </div>
          <div className="campo-texto">
            <label htmlFor="redefinir-chave">Chave de redefinição</label>
            <input id="redefinir-chave" className="controle-com-borda" type="text" disabled={enviando} value={chave} onChange={(e) => alterar("chaveRedefinicao", e.currentTarget.value)} />
          </div>
          <PasswordField inputId="redefinir-nova-senha" value={novaSenha} onChange={(valor) => alterar("novaSenha", valor)} autoComplete="new-password" hasError={Boolean(errosCampos.novaSenha)} errorMessage={errosCampos.novaSenha ?? ""} errorMessageId="redefinir-erro-senha" renderErrorMessage={false} disabled={enviando} />
        </div>
        <button className="botao pagina-redefinir-senha-enviar" type="submit" disabled={!preenchido || enviando}>Redefinir senha</button>
        <ErrorMessages mensagens={mensagens} aoFocarCampo={focar} />
      </form>
    </section>
  );
}
