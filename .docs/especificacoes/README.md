# Guia das especificações operacionais

`.docs/especificacoes/` contém a unidade de trabalho atual em Markdown. Cada especificação aprovada é autossuficiente e rege somente o escopo que o operador autorizou. `concluidas/` conserva a especificação integral e seu parecer; não reescreva o corpo aprovado.

## Receber e preparar uma unidade

O operador pode fornecer a especificação aprovada em texto/arquivo, pedir uma proposta a partir de uma instrução ou indicar um documento específico do Drive para transcrição integral. No segundo caso, apresente a proposta Markdown e obtenha aprovação antes de implementar. No terceiro, leia somente o documento indicado; não complete trechos ausentes por inferência.

Use Markdown simples, com títulos, listas e tabelas apenas quando ajudarem a localizar requisitos. Separe o corpo funcional aprovado das anotações de execução. No mesmo arquivo, mantenha um plano conciso, estado das etapas, decisões posteriores, validações, pareceres parciais e parecer final. Preserve o registro suficiente para retomar e compreender o resultado, sem diário de sessão.

Antes de implementar, confira dúvidas, viabilidade, contratos e pontos de integração. Apresente ao operador as dúvidas funcionais; o plano técnico não precisa de aprovação rotineira quando não houver decisão pendente. Se uma dúvida ou incompatibilidade surgir depois, pare somente a parte afetada e peça decisão.

## Blocos reutilizáveis e páginas

Antes de liberar uma especificação de página, identifique os ELMs e CMPs necessários, incluindo estados e variantes, e confirme que estão implementados e aprovados no `/lab`. Se faltar ou precisar mudar um bloco compartilhado, trate essa unidade separadamente no laboratório, com aprovação do operador, antes da página. A aprovação no laboratório não substitui a validação no contexto da página.

No `/lab`, demonstre os elementos ou componentes reais usados pela aplicação, não cópias visuais. Para blocos visuais, trabalhe em sequência: estrutura semântica e Bulma; personalização visual; funcionalização e validação. Para páginas, siga as etapas definidas na especificação, podendo integrar composição visual e funcionalização de cada bloco em incrementos pequenos, verificáveis e sujeitos ao aceite do operador. HTML estrutural simples não exige ELM próprio; regras sem apresentação não exigem componente visual fictício.

## Retorno, etapas e encerramento

Ao concluir a implementação de uma etapa, informe os resultados, testes, limitações e pendências, apresentando a entrega ao operador para avaliação. Correções e decisões posteriores devem ser registradas separadamente, sem reescrever o corpo aprovado.

**Após o aceite expresso de cada etapa**, retire os controles temporários de teste que já não forem necessários, verifique o resultado e registre no Markdown operacional a etapa como concluída, acrescentando um breve **Parecer Parcial — E#** com entregas, testes, decisões e pendências. Em seguida, faça um commit local na `develop`, sem push, com a mensagem definida para a unidade (exemplo: `07.06 - E1`).

Registre o commit realizado e apresente ao operador um breve resumo da próxima etapa prevista, indicando seu objetivo, principais entregas e eventuais dependências, **sem iniciar sua implementação**. Aguarde autorização expressa do operador para prosseguir.

**Somente o operador encerra a unidade**, após a aprovação de todas as etapas. Nesse momento, consolide os pareceres parciais em um Parecer Final, mova o Markdown integral para `concluidas/`, faça o commit final com a identificação da unidade (exemplo: `07.06`) e o push da `develop`. Relate o resultado confirmado, sem publicar em `main` nem implantar sem autorização específica.
