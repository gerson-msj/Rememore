import { Header } from "@web/components/Header/Header";
import { AppRouter } from "@web/router/AppRouter";
import "./app.module.css";


export function App() {
  return (
    <div className="rememore-app">
      <Header />
      <main className="rememore-app-content">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
