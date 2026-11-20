import { useLayoutEffect } from "react";
import { useHeader } from "@web/components/Header/HeaderContext";
import { useNavigate } from "react-router";

export default function Detalhes() {
    const { setConfiguracao } = useHeader();
    const navigate = useNavigate();

    useLayoutEffect(() => {
        setConfiguracao({
            titulo: "Detalhes",
            voltar: () => navigate("/home"),
            sair: () => navigate("/home"),
        });
    }, [navigate, setConfiguracao]);

    return null;
}
