export function Elm01() {
  return (
    <details className="bloco-teste">
      <summary className="bloco-teste-titulo link">ELM-01 Título</summary>
      <div className="bloco-teste-conteudo">
        <p>Variação: Título</p>
        {/* ELM-01: reproduzir o elemento abaixo; o restante pertence ao Laboratório. */}
        <h1>Exemplo de título</h1>
        <p>Variação: Subtítulo</p>
        {/* ELM-01: reproduzir o elemento abaixo; o restante pertence ao Laboratório. */}
        <h2 className="subtitulo">Exemplo de subtítulo</h2>
      </div>
    </details>
  );
}
