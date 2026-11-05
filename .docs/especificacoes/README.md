# Guia das especificações operacionais

`.docs/especificacoes/` contém a unidade de trabalho atual em Markdown. Cada especificação aprovada é autossuficiente e rege somente o escopo que o operador autorizou. `concluidas/` conserva a especificação integral e seu parecer; não reescreva o corpo aprovado.

## Receber e preparar uma unidade

O operador pode fornecer a especificação aprovada em texto/arquivo ou pedir uma proposta a partir de uma instrução. No segundo caso, apresente a proposta Markdown e obtenha aprovação antes de implementar. Não acesse o Google Drive; se a elaboração depender de informações de documentos armazenados lá, solicite ao operador que forneça o conteúdo relevante em texto ou arquivo.

Use Markdown simples, com títulos, listas e tabelas apenas quando ajudarem a localizar requisitos. Separe o corpo funcional aprovado das anotações de execução. No mesmo arquivo, mantenha um plano conciso, estado das etapas, decisões posteriores, validações, pareceres parciais e parecer final. Preserve o registro suficiente para retomar e compreender o resultado, sem diário de sessão.

Antes de implementar, confira dúvidas, viabilidade, contratos e pontos de integração. Apresente ao operador as dúvidas funcionais; o plano técnico não precisa de aprovação rotineira quando não houver decisão pendente. Se uma dúvida ou incompatibilidade surgir depois, pare somente a parte afetada e peça decisão.

## Blocos reutilizáveis e páginas

Antes de liberar uma especificação de página, identifique os ELMs e CMPs necessários, incluindo estados e variantes, e confirme que estão implementados e aprovados no `/lab`. Se faltar ou precisar mudar um bloco compartilhado, informe ao operador e aguarde instruções.

No `/lab`, demonstre os elementos ou componentes reais usados pela aplicação, não cópias visuais. Para blocos visuais, trabalhe em sequência: estrutura semântica e Bulma; personalização visual; funcionalização e validação. Para páginas, siga as etapas definidas na especificação aprovada. Resolva primeiro a estrutura com HTML semântico e Bulma. Faça personalizações no CSS da página somente quando a especificação as previr ou o operador as solicitar ou aprovar. Mudanças em CSS compartilhado entre páginas também exigem solicitação ou aprovação do operador e devem seguir as regras de propriedade dos estilos em `.docs/memoria-tecnica.md`. HTML estrutural simples não exige ELM próprio; regras sem apresentação não exigem componente visual fictício.

## Retorno, etapas e encerramento

Ao concluir a implementação de uma etapa, informe os resultados, testes, limitações e pendências, apresentando a entrega ao operador para avaliação. Correções e decisões posteriores devem ser registradas separadamente, sem reescrever o corpo aprovado.

**Após o aceite expresso de cada etapa**, retire os controles temporários de teste que já não forem necessários, verifique o resultado e registre no Markdown operacional a etapa como concluída, acrescentando um breve **Parecer Parcial — E#** com entregas, testes, decisões, pendências e possíveis observações do operador. Em seguida, faça um commit local na `develop`, sem push, com a mensagem definida para a unidade (exemplo: `07.06 - E1`).

Registre o commit realizado e apresente ao operador um breve resumo da próxima etapa prevista, indicando seu objetivo, principais entregas e eventuais dependências, **sem iniciar sua implementação**. Aguarde autorização expressa do operador para prosseguir.

## Encerramento

**Somente o operador pode encerrar ou cancelar uma especificação.** O encerramento exige a aprovação de todas as etapas e autorização expressa do operador. Após essa autorização, consolide os pareceres parciais e as observações do operador em um **Parecer Final**, registrado no Markdown operacional. Em seguida, arquive a unidade movendo o Markdown integral para `concluidas/`, realize o commit final na branch `develop`, utilizando como mensagem a identificação da unidade e o nome da especificação, e execute o push para `origin/develop`. Informe no chat o resultado efetivamente confirmado do commit e do push e apresente uma **cópia integral do Parecer Final em formato facilmente copiável** pelo operador. Não publique em `main`, realize implantações ou altere pipelines sem autorização específica.
