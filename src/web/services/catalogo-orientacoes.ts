import type { NivelOrientacao } from "@shared/orientacao-progressiva";
import type { CorSemantica } from "@web/styles/cores";

export type Orientacao = {
  conteudo: string;
  formato: "texto" | "html";
  cor?: CorSemantica;
};

type MensagemCatalogo = Omit<Orientacao, "formato"> & { formato?: Orientacao["formato"] };
type OrientacoesPorNivel = Partial<Record<NivelOrientacao, MensagemCatalogo>>;

export const catalogoOrientacoes = {
  "capturar.selecao": {
    iniciante: { conteudo: "Você pode capturar qualquer dia até hoje. Escolha uma data para começar." },
    intermediario: { conteudo: "Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra." },
  },
} satisfies Record<string, OrientacoesPorNivel>;

export type ContextoOrientacao = keyof typeof catalogoOrientacoes;

export function resolverOrientacao(orientacoes: OrientacoesPorNivel, nivel: NivelOrientacao): Orientacao | null {
  const mensagem = orientacoes[nivel];
  return mensagem ? { ...mensagem, formato: mensagem.formato ?? "texto" } : null;
}
