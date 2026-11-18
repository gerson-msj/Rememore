import { useLayoutEffect } from "react";
import { Link } from "react-router";
import { useHeader } from "@web/components/Header/HeaderContext";
import "./home.css";

export default function Home() {
    const { setConfiguracao } = useHeader();

    useLayoutEffect(() => {
        setConfiguracao({
            titulo: "Rememore",
        });
    }, [setConfiguracao]);

    return (
        <section className="pagina-inicial-area-aberta">
            <div className="pagina-inicial-apresentacao">
                <div className="pagina-inicial-textos">
                    <p>Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.</p>
                    <p>O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que poderiam se perder com a passagem dos dias.</p>
                    <p>Entre na sua conta ou, se recebeu um convite, comece por aqui.</p>
                </div>
                <div className="pagina-inicial-acoes">
                    <button type="button">Entrar</button>
                    <button type="button">Criar conta</button>
                    <Link className="pagina-inicial-botao-laboratorio cor-link" to="/lab">Laboratório</Link>
                </div>
            </div>
        </section>
    );
}
