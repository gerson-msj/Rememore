export function Elm03() {
  return (
    <details className="bloco-teste">
      <summary className="bloco-teste-titulo link">ELM-03 Link</summary>
      <div className="bloco-teste-conteudo">
        <p>Variação: Link</p>
        {/* ELM-03, link: reproduzir o elemento abaixo com o destino adequado ao uso. */}
        <a className="link" href="/lab">
          Exemplo de link
        </a>
        <p>Variação: Link perigo</p>
        {/* ELM-03, link perigo: reproduzir o elemento abaixo com o destino adequado ao uso. */}
        <a className="link cor-perigo" href="/lab">
          Exemplo de link perigo
        </a>
        <p>Variação: Link alerta</p>
        {/* ELM-03, link alerta: aplicar a classe de cor semântica e o destino adequado. */}
        <a className="link cor-alerta" href="/lab">
          Exemplo de link alerta
        </a>
        <p>Variação: Link info</p>
        <a className="link cor-info" href="/lab">
          Exemplo de link info
        </a>
      </div>
    </details>
  );
}
