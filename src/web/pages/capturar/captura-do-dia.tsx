import { Navigate, useParams } from "react-router";
import { PaginaDestino } from "@web/pages/PaginaDestino";
import { validarDataCaptura } from "./data-captura";

export function CapturaDoDia() {
  const { data } = useParams();
  if (!data || !validarDataCaptura(data)) return <Navigate to="/capturar" replace />;
  return <PaginaDestino titulo="Captura do dia" voltarPara="/capturar" />;
}
