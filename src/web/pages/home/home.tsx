import { useLayoutEffect } from "react";
import { ActionButton } from "@web/components/action-button/action-button";
import { useHeader } from "@web/components/Header/HeaderContext";
import { useNavigate } from "react-router";

export default function Home() {
    const { setConfiguracao } = useHeader();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        setConfiguracao({
            titulo: "Rememore",
        });
    }, [setConfiguracao]);

    return (
        <>
            <p>React + Bun + TS</p>
            <ActionButton
                label="Ir para Detalhes"
                onClick={() => navigate("/detalhes")}
            />

            {Array.from({ length: 100 }, (_, indice) => (
                <p key={indice + 1}>Linha {indice + 1}</p>
            ))}
        </>
    );
}
