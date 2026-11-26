import { useState } from "react";
import { coresSemanticas, type CorSemantica } from "@web/styles/cores";
import "./elm09.css";

const exemplos = {
  curto: { formato: "texto", conteudo: "Escolha uma data para começar." },
  multilinha: { formato: "texto", conteudo: "Escolha uma data para começar.\nVocê pode registrar o que lembra desse dia." },
  html: {
    formato: "html",
    conteudo: "<p>Comece pelo que você <strong>lembra</strong>. Escreva <em>no seu ritmo</em>.</p><ul><li>Onde você estava?</li><li>O que aconteceu?</li></ul>",
  },
  ausente: null,
} as const;

export function Elm09() {
  const [cor, setCor] = useState<CorSemantica | "">("");
  const [exemplo, setExemplo] = useState<keyof typeof exemplos>("curto");
  const orientacao = exemplos[exemplo];
  const classeOrientacao = cor ? `orientacao texto-cor-selecionada cor-${cor}` : "orientacao";

  return (
    <details className="bloco-teste elm09">
      <summary className="bloco-teste-titulo link">ELM-09 Exibição de orientação</summary>
      <div className="bloco-teste-conteudo">
        <div className="elm09-controles">
          <div className="campo-texto">
            <label htmlFor="elm09-cor">Cor semântica</label>
            <select id="elm09-cor" className="controle-com-borda" value={cor} onChange={(evento) => setCor(evento.currentTarget.value as CorSemantica | "")}>
              <option value="">Padrão da orientação (Info)</option>
              {coresSemanticas.map(({ cor, rotulo }) => <option key={cor} value={cor}>{rotulo}</option>)}
            </select>
          </div>
          <div className="campo-texto">
            <label htmlFor="elm09-conteudo">Conteúdo</label>
            <select id="elm09-conteudo" className="controle-com-borda" value={exemplo} onChange={(evento) => setExemplo(evento.currentTarget.value as typeof exemplo)}>
              <option value="curto">Texto curto</option>
              <option value="multilinha">Texto multilinha</option>
              <option value="html">HTML formatado</option>
              <option value="ausente">Sem conteúdo</option>
            </select>
          </div>
        </div>

        {/* ELM-09: renderizar a orientação somente quando existir.
            Info é a cor inicial. Para outra cor, usar texto-cor-selecionada e a classe semântica.
            Reproduzir o contêiner e usar HTML apenas para marcação estática da aplicação. */}
        {orientacao && (orientacao.formato === "html" ? (
          <div className={classeOrientacao} dangerouslySetInnerHTML={{ __html: orientacao.conteudo }} />
        ) : (
          <div className={classeOrientacao}>
            <p className="orientacao-texto">{orientacao.conteudo}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
