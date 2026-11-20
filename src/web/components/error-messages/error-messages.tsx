import { useEffect, useRef, useState } from "react";
import "./error-messages.css";

export type MensagemErro = {
  id: string;
  texto: string;
  campo?: string;
};

type ErrorMessagesProps = {
  mensagens: MensagemErro[];
  aoFocarCampo?: (campo: string) => void;
};

type MensagemVisivel = MensagemErro & { saindo: boolean };

export function ErrorMessages({ mensagens, aoFocarCampo }: ErrorMessagesProps) {
  const [mensagensVisiveis, setMensagensVisiveis] = useState<MensagemVisivel[]>(
    () => mensagens.map((mensagem) => ({ ...mensagem, saindo: false })),
  );
  const mensagensRef = useRef(mensagensVisiveis);
  const temporizadores = useRef(new Map<string, number>());
  const chaveMensagens = JSON.stringify(mensagens);

  useEffect(() => {
    const visiveisPorId = new Map(mensagensRef.current.map((mensagem) => [mensagem.id, mensagem]));

    for (const mensagem of mensagens) {
      const temporizador = temporizadores.current.get(mensagem.id);
      if (temporizador !== undefined) {
        window.clearTimeout(temporizador);
        temporizadores.current.delete(mensagem.id);
      }
    }

    const seguintes: MensagemVisivel[] = mensagensRef.current.map((mensagem) => {
      const atualizada = mensagens.find((item) => item.id === mensagem.id);
      if (atualizada) return { ...atualizada, saindo: false };

      if (!temporizadores.current.has(mensagem.id)) {
        const temporizador = window.setTimeout(() => {
          temporizadores.current.delete(mensagem.id);
          const restantes = mensagensRef.current.filter((item) => item.id !== mensagem.id);
          mensagensRef.current = restantes;
          setMensagensVisiveis(restantes);
        }, 180);
        temporizadores.current.set(mensagem.id, temporizador);
      }

      return { ...mensagem, saindo: true };
    });

    for (const nova of mensagens) {
      if (!visiveisPorId.has(nova.id)) seguintes.push({ ...nova, saindo: false });
    }

    mensagensRef.current = seguintes;
    setMensagensVisiveis(seguintes);
  }, [chaveMensagens]);

  useEffect(() => () => {
    for (const temporizador of temporizadores.current.values()) window.clearTimeout(temporizador);
  }, []);

  return (
    <div className={`cmp038${mensagensVisiveis.length > 0 ? " cmp038-visivel" : ""}`} aria-live="polite">
      <div className="cmp038-conteudo">
        {mensagensVisiveis.map((mensagem) => {
          const classeMensagem = `cmp038-mensagem${mensagem.saindo ? " cmp038-saindo" : ""}`;
          const campo = mensagem.campo;

          return campo && aoFocarCampo ? (
            <button
              className={`${classeMensagem} cmp038-mensagem-campo`}
              key={mensagem.id}
              id={mensagem.id}
              type="button"
              onClick={() => aoFocarCampo(campo)}
            >
              {mensagem.texto}
            </button>
          ) : (
            <p className={classeMensagem} key={mensagem.id} id={mensagem.id}>
              {mensagem.texto}
            </p>
          );
        })}
      </div>
    </div>
  );
}
