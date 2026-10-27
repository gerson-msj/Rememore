# Documentação operacional — Stack .NET

Memória técnica da Stack2 (.NET 10). A documentação funcional canônica do produto permanece no Google Drive; o código não substitui a especificação aprovada.

## Leitura inicial

1. `/AGENTS.md` — normas permanentes e exceção da campanha.
2. `.docs/memoria-tecnica.md` — fatos/contratos técnicos reutilizáveis (verifique registros superados).
3. **Durante a campanha de refatoração visual:** `.docs/plano-refatoracao-paginas.md`, a especificação **concluída da unidade** em `.docs/especificacoes/concluidas/` (incluindo corpo, Parecer e adendos) e apenas o código relacionado. P01 foi o piloto; P01–P06 estão concluídas e aceitas. P07 — Captura do Dia aguarda liberação expressa do operador; não iniciar até essa liberação.
4. **Fora da campanha:** somente a especificação operacional atual indicada pelo operador, conforme `/AGENTS.md`.

Não ler por padrão o histórico Stack1, toda a árvore de código, todas as especificações ou documentos do Drive. Na campanha **não recorrer à Stack1**: trabalhar apenas com as fontes e decisões Stack2.

## Organização

- `plano-refatoracao-paginas.md` — **macroplano temporário vigente**: escopo fechado até 06.02, ordem P01–P08, protocolo de autonomia/escalonamento, checkpoints, progresso e conclusão.
- `memoria-tecnica.md` — padrões e contratos verificados da Stack2; não transformar em diário de campanha.
- `especificacoes/` — futuras unidades funcionais abertas; a campanha não cria novas especificações.
- `especificacoes/concluidas/` — unidades históricas aprovadas, com seus Pareceres. Na campanha, anexar **somente após aceite** um `Adendo Técnico — Refatoração da Apresentação (Stack2)` ao arquivo original da página, preservando conteúdo prévio.
- `AUDITORIA.md` — ler apenas após solicitação expressa de auditoria independente, nunca automaticamente.

## Ciclo especial da campanha

Cada página: inventariar seus padrões visuais e mapear cada um para CMP aprovado ou exemplo básico aprovado no `/Lab` → quando faltar referência, consultar Bulma oficial e preparar especificação separada para o elemento básico ou CMP → aguardar aprovação antes de criar/alterar a referência → implementar e demonstrar no `/Lab` → operador valida → Codex apresenta plano da página → operador aprova → Codex percorre autonomamente HTML/Bulma/CMPs, CSS/JS, integração funcional equivalente e limpeza/testes → pergunta ao operador **antes** de incompatibilidade ou alteração contratual/funcional/visual aprovada → entrega e operador inspeciona/testa → após aceite, adendo e atualização de progresso → **Codex faz commit e push em `develop`; depois o operador libera a próxima página**. Sem quatro interrupções obrigatórias, sem retorno ao analista entre páginas, sem modificar especificações antigas.

No encerramento geral, realizar regressão transversal, remover legados apenas sem consumidores, emitir Parecer Final Geral e levar ao analista para reconciliação única no Drive. Arquivar macroplano depois, sem apagar evidências. O padrão permanente de qualidade continua no AGENTS.

## Ciclo normal futuro

Para funcionalidades novas, volta a regra de especificação autossuficiente aprovada, clarificação, checkpoints, Parecer final e reconciliação prevista em AGENTS. Não iniciar novas páginas antes do encerramento autorizado da campanha.

Referência canônica de contexto: https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit
