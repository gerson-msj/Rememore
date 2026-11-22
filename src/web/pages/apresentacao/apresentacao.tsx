import { useLayoutEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import "./apresentacao.css";

export default function Apresentacao() {
  const { setConfiguracao } = useHeader();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    setConfiguracao({ titulo: "Rememore" });
  }, [setConfiguracao]);

  return (
    <section className="pagina-apresentacao">
      <div className="pagina-apresentacao-conteudo">
        <div className="pagina-apresentacao-textos">
          <p>Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.</p>
          <p>O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que poderiam se perder com a passagem dos dias.</p>
          <p>Entre na sua conta ou, se recebeu um convite, comece por aqui.</p>
        </div>
        <div className="pagina-apresentacao-acoes">
          <button className="botao" type="button" onClick={() => navigate("/entrar")}>Entrar</button>
          <button className="botao" type="button" onClick={() => navigate("/cadastro")}>Criar conta</button>
          <Link className="pagina-apresentacao-botao-laboratorio cor-link" to="/lab">Laboratório</Link>
        </div>
      </div>
    </section>
  );
}
