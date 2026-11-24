import { Navigate, Route, Routes } from "react-router";
import { AcessoArea, RotaDesconhecida } from "./AcessoArea";
import { LayoutArea } from "./LayoutArea";
import Apresentacao from "@web/pages/apresentacao/apresentacao";
import Home from "@web/pages/home/home";
import Cadastro from "@web/pages/cadastro/cadastro";
import Entrar from "@web/pages/entrar/entrar";
import ChaveRedefinicao from "@web/pages/chave-redefinicao/chave-redefinicao";
import RedefinirSenha from "@web/pages/redefinir-senha/redefinir-senha";
import Laboratorio from "@web/pages/laboratorio/laboratorio";
import { PaginaDestino } from "@web/pages/PaginaDestino";
import { useSessao } from "@web/contexts/SessaoContext";

function Administracao() {
  const { perfil } = useSessao();
  return perfil === "admin"
    ? <PaginaDestino titulo="Administração" />
    : <Navigate to="/home" replace />;
}

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
          <Route path="/capturar" element={<PaginaDestino titulo="Capturar" />} />
          <Route path="/encontrar" element={<PaginaDestino titulo="Encontrar Memórias" />} />
          <Route path="/rever" element={<PaginaDestino titulo="Rever um Dia" />} />
          <Route path="/rememorar" element={<PaginaDestino titulo="Rememorar" />} />
          <Route path="/conta" element={<PaginaDestino titulo="Minha Conta e Meus Dados" />} />
          <Route path="/admin" element={<Administracao />} />
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
