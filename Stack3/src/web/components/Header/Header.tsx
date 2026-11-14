import { useHeader } from "./HeaderContext";
import "./Header.module.css";

export function Header() {
  const { titulo } = useHeader();

  return (
    <header className="rememore-header">
      <h1>{titulo}</h1>
    </header>
  );
}
