# Guia das especificações operacionais

`.docs/especificacoes/` contém a unidade de trabalho atual em Markdown. Cada especificação aprovada é autossuficiente e rege somente o escopo que o operador autorizou. `concluidas/` conserva a especificação integral e seu parecer; não reescreva o corpo aprovado.

## Receber e preparar uma unidade

O operador pode fornecer a especificação aprovada em texto/arquivo, pedir uma proposta a partir de uma instrução ou indicar um documento específico do Drive para transcrição integral. No segundo caso, apresente a proposta Markdown e obtenha aprovação antes de implementar. No terceiro, leia somente o documento indicado; não complete trechos ausentes por inferência.

Use Markdown simples, com títulos, listas e tabelas apenas quando ajudarem a localizar requisitos. Separe o corpo funcional aprovado das anotações de execução. No mesmo arquivo, mantenha um plano conciso, estado/checkpoints, decisões posteriores, validações e parecer final. Preserve o registro suficiente para retomar e compreender o resultado, sem diário de sessão.

Antes de implementar, confira dúvidas, viabilidade, contratos e pontos de integração. Apresente ao operador as dúvidas funcionais; o plano técnico não precisa de aprovação rotineira quando não houver decisão pendente. Se uma dúvida ou incompatibilidade surgir depois, pare somente a parte afetada e peça decisão.

## Blocos reutilizáveis e páginas

Antes de liberar uma especificação de página, identifique os ELMs e CMPs necessários, incluindo estados e variantes, e confirme que estão implementados e aprovados no `/lab`. Se faltar ou precisar mudar um bloco compartilhado, trate essa unidade separadamente no laboratório, com aprovação do operador, antes da página. A aprovação no laboratório não substitui a validação no contexto da página.

No `/lab`, demonstre os elementos ou componentes reais usados pela aplicação, não cópias visuais. Para blocos visuais, trabalhe em sequência: estrutura semântica e Bulma; personalização visual; funcionalização e validação. Para páginas, separe montagem do layout e funcionalização, podendo dividir em checkpoints coesos. HTML estrutural simples não exige ELM próprio; regras sem apresentação não exigem componente visual fictício.

## Retorno e encerramento

Registre resultados e pendências no Markdown da unidade. Ao concluir a implementação prevista, informe esse marco; indique também validações realizadas e limites ainda não verificados. Apresente o resultado ao operador para revisão. Correções solicitadas e decisões posteriores ficam em registros separados, sem alterar retroativamente o corpo aprovado.

Somente o operador encerra a unidade. Após autorização, finalize o parecer, mova o arquivo integral para `concluidas/`, faça commit e push de `develop`, e relate o resultado confirmado. Não publique em `main` nem implante sem autorização específica. Forneça no chat o parecer final e o estado da publicação para eventual transferência ao Drive.
