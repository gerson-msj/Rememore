import { useLayoutEffect } from "react";
import { ActionButton } from "@web/components/action-button/action-button";
import { useHeader } from "@web/components/Header/HeaderContext";

export function Detalhes() {
    const { setTitulo } = useHeader();

    useLayoutEffect(() => {
        setTitulo("Detalhes");
    }, [setTitulo]);

    return (
        <main>
            <ActionButton
                label="Voltar para Home"
                   onClick={() => window.location.assign("/")}
            />
        </main>
    )
}
