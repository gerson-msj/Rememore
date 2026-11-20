import { useCallback } from "react";
import { usePopup } from "@web/components/popup/PopupContext";

type OpcoesExecucao = {
  operacao: () => Promise<void>;
  aoIniciar?: () => void;
  aoFinalizar?: () => void;
  aoFalhar?: (falha: unknown) => void | Promise<void>;
};

const mensagemFalhaGenerica = "Não foi possível concluir a operação. Tente novamente.";

/** Executa uma operação, garante sua finalização e apresenta o tratamento genérico quando necessário. */
export function useExecutorOperacao() {
  const { abrirPopup } = usePopup();

  return useCallback(async ({
    operacao,
    aoIniciar,
    aoFinalizar,
    aoFalhar,
  }: OpcoesExecucao) => {
    try {
      aoIniciar?.();
      await operacao();
      return true;
    } catch (falha) {
      if (aoFalhar) {
        await aoFalhar(falha);
      } else {
        await abrirPopup({
          mensagemHtml: `<p>${mensagemFalhaGenerica}</p>`,
          botoes: {
            ok: { texto: "Entendi" },
            cancelar: { apresentar: false },
          },
        });
      }
      return false;
    } finally {
      aoFinalizar?.();
    }
  }, [abrirPopup]);
}
