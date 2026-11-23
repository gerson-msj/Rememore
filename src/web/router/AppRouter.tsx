import { Route, Routes } from "react-router";
import { AcessoArea, RotaDesconhecida } from "./AcessoArea";
import { LayoutArea } from "./LayoutArea";
import Apresentacao from "@web/pages/apresentacao/apresentacao";
import Home from "@web/pages/home/home";
import Cadastro from "@web/pages/cadastro/cadastro";
import Entrar from "@web/pages/entrar/entrar";
import ChaveRedefinicao from "@web/pages/chave-redefinicao/chave-redefinicao";
import RedefinirSenha from "@web/pages/redefinir-senha/redefinir-senha";
import Laboratorio from "@web/pages/laboratorio/laboratorio";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AcessoArea tipo="aberta" />}>
        <Route element={<LayoutArea area="aberta" />}>
          <Route path="/" element={<Apresentacao />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/entrar" element={<Entrar />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        </Route>
      </Route>
      <Route element={<AcessoArea tipo="protegida" />}>
        <Route element={<LayoutArea area="protegida" />}>
          <Route path="/home" element={<Home />} />
          <Route path="/cadastro/confirmacao" element={<ChaveRedefinicao />} />
          <Route path="/redefinir-senha/confirmacao" element={<ChaveRedefinicao />} />
        </Route>
      </Route>
      <Route element={<LayoutArea area="aberta" />}>
        <Route path="/lab" element={<Laboratorio />} />
      </Route>
      <Route path="*" element={<RotaDesconhecida />} />
    </Routes>
  );
}
