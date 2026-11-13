import { Route, Routes } from "react-router";
import Detalhes from "@web/pages/detalhes/detalhes";
import Home from "@web/pages/home/home";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/detalhes" element={<Detalhes />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}
