export function Elm03() {
  return (
    <details className="bloco-teste">
      <summary className="bloco-teste-titulo link">ELM-03 Link</summary>
      <div className="bloco-teste-conteudo">
        <p>Variação: Link</p>
        <a className="link" href="/lab">
          Exemplo de link
        </a>
        <p>Variação: Link perigo</p>
        <a className="link-perigo" href="/lab">
          Exemplo de link perigo
        </a>
      </div>
    </details>
  );
}
