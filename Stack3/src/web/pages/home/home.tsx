import { useLayoutEffect } from "react";
import { ActionButton } from "@web/components/action-button/action-button";
import { useHeader } from "@web/components/Header/HeaderContext";
import { useNavigate } from "react-router";
import "./home.module.css";

export default function Home() {
    const { setTitulo } = useHeader();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        setTitulo("Rememore");
    }, [setTitulo]);

    return (
        <main>
            <p>React + Bun + TS</p>
            <ActionButton
                label="Ir para Detalhes"
                onClick={() => navigate("/detalhes")}
            />
        </main>
    );
}
