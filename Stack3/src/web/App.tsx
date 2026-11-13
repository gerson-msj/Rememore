import { Detalhes } from "./pages/detalhes/detalhes";
import Home from "./pages/home/home";
import { Header } from "@web/components/Header/Header";


export function App() {
  let pagina;

  switch (window.location.pathname) {
    case "/":
      pagina = <Home />;
      break;

    case "/detalhes":
      pagina = <Detalhes />;
      break;

    default:
      pagina = <h1>Página não encontrada</h1>;
  }

  return (
    <>
      <Header />
      {pagina}
    </>
  );
}

export default App;
