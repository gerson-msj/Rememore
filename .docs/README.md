# Documentação operacional — Stack .NET

Memória técnica da Stack2 (.NET 10). A documentação funcional canônica do produto permanece no Google Drive; o código não substitui a especificação aprovada.

## Leitura inicial

1. `/AGENTS.md` — normas permanentes de desenvolvimento e segurança.
2. `.docs/memoria-tecnica.md` — fatos e contratos técnicos reutilizáveis; confira registros superados.
3. A especificação operacional atual indicada pelo operador, conforme `/AGENTS.md`.

Não ler por padrão toda a Stack1, toda a árvore de código, todas as especificações ou documentos do Drive. Enquanto houver defasagem funcional, é permitida consulta **seletiva** a `Stack1/` como referência técnica complementar; a especificação Stack2 continua autossuficiente e é a autoridade de implementação. O Codex não precisa acessar o Drive para completar os requisitos.

## Organização

- `memoria-tecnica.md` — padrões e contratos verificados da Stack2.
- `especificacoes/` — unidades funcionais operacionais em andamento.
- `especificacoes/concluidas/` — unidades históricas aprovadas, com seus Pareceres e adendos.
- `planos/concluidas/plano-refatoracao-paginas.md` — macroplano histórico da campanha de refatoração visual Stack2 P01–P08, concluída e aceita em 27/10/2026. Contém o Parecer Final Geral aprovado e o registro de execução; serve apenas para rastreabilidade.
- `AUDITORIA.md` — ler apenas após solicitação expressa de auditoria independente, nunca automaticamente.

Para unidades novas, siga o fluxo de especificação autossuficiente, verificação de dúvidas/viabilidade, plano técnico sem aprovação rotineira, checkpoints, validações, Parecer final e reconciliação descrito em `/AGENTS.md`. Uma especificação de **página** somente é entregue depois de todos os ELMs/CMPs necessários estarem testados e aprovados no `/lab`. A página usa montagem de layout e depois funcionalização; uma unidade de bloco visual no `/lab` mantém estrutura HTML/Bulma → apresentação/CSS → funcionalização.

Referência canônica de contexto: https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit
