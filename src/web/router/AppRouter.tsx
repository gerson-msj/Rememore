import { Route, Routes } from "react-router";
import Home from "@web/pages/home/home";
import Cadastro from "@web/pages/cadastro/cadastro";
import ConfirmacaoCadastro from "@web/pages/cadastro-confirmacao/confirmacao-cadastro";
import Laboratorio from "@web/pages/laboratorio/laboratorio";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/cadastro/confirmacao" element={<ConfirmacaoCadastro />} />
      <Route path="/lab" element={<Laboratorio />} />
      <Route path="*" element={<h1>Página não encontrada</h1>} />
    </Routes>
  );
}
