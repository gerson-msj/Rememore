import { useCallback } from "react";
import { useNavigate } from "react-router";
import { useProcessamento } from "@web/components/processing-overlay/ProcessingContext";
import { useSessao } from "@web/contexts/SessaoContext";
import { CHAVE_CONFIRMACAO_CADASTRO, CHAVE_CONFIRMACAO_REDEFINICAO, remover } from "@web/services/storage";

export function useSaidaSessao() {
  const { sair } = useSessao();
  const { processar } = useProcessamento();
  const navigate = useNavigate();

  return useCallback(() => processar(async () => {
    // Uma saída descartada não deve afetar uma sessão posterior.
    if (!await sair()) return;
    try {
      remover(CHAVE_CONFIRMACAO_CADASTRO, "sessao");
      remover(CHAVE_CONFIRMACAO_REDEFINICAO, "sessao");
    } catch {
      // A limpeza temporária não bloqueia a navegação após sair.
    }
    void navigate("/", { replace: true });
  }, "Saindo..."), [navigate, processar, sair]);
}
