import { useHeader } from "./HeaderContext";

export function Header() {
  const { titulo } = useHeader();

  return <h1>{titulo}</h1>;
}
