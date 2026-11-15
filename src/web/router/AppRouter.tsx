import { Route, Routes } from "react-router";
import Detalhes from "@web/pages/detalhes/detalhes";
import Home from "@web/pages/home/home";
import Laboratorio from "@web/pages/laboratorio/laboratorio";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Laboratorio />} />
      <Route path="/home" element={<Home />} />
      <Route path="/detalhes" element={<Detalhes />} />
      <Route path="/lab" element={<Laboratorio />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}
