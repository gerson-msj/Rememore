import { useLayoutEffect } from "react";
import { ActionButton } from "@web/components/action-button/action-button";
import { useHeader } from "@web/components/Header/HeaderContext";
import { useNavigate } from "react-router";

export default function Detalhes() {
    const { setTitulo } = useHeader();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        setTitulo("Detalhes");
    }, [setTitulo]);

    return (
        <main>
            <ActionButton
                label="Voltar para Home"
                onClick={() => navigate("/")}
            />
        </main>
    )
}
