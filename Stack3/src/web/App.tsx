import { Header } from "@web/components/Header/Header";
import { AppRouter } from "@web/router/AppRouter";
import "./app.css";


export function App() {
  return (
    <div className="aplicacao">
      <Header />
      <main className="aplicacao-conteudo">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
