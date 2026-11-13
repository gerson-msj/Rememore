import { useLayoutEffect } from "react";
import { ActionButton } from "@web/components/action-button/action-button";
import { useHeader } from "@web/components/Header/HeaderContext";
import "./home.module.css";

export default function Home() {
    const { setTitulo } = useHeader();

    useLayoutEffect(() => {
        setTitulo("Rememore");
    }, [setTitulo]);

    return (
        <main>
            <p>React + Bun + TS</p>
            <ActionButton
                label="Ir para Detalhes"
                onClick={() => window.location.assign("/detalhes")}
            />
        </main>
    );
}
