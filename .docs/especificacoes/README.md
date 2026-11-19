# Guia de execução das especificações

Este guia orienta o modelo durante a execução de especificações do Rememore. Ao receber uma especificação, o modelo deve compreender o escopo, esclarecer dúvidas com o operador e então planejar e realizar o trabalho descrito.

A especificação define o que deve ser entregue, seus limites e os comportamentos esperados. O modelo deve segui-la sem acrescentar requisitos ou tomar decisões funcionais que não estejam autorizadas.

## Ao receber uma especificação

Leia integralmente a especificação indicada pelo operador. Identifique a entrega, os limites do escopo, os comportamentos exigidos, as dependências e os critérios de aceite.

Antes de implementar, verifique se há dúvidas funcionais, contradições ou informações insuficientes para cumprir a especificação. Apresente as dúvidas ao operador, agrupadas em uma única mensagem sempre que possível. Não preencha lacunas funcionais com decisões próprias.

Depois dos esclarecimentos, confirme o entendimento do escopo e prossiga. Se não houver dúvidas, informe isso e prossiga sem aguardar uma confirmação adicional.

## Especificações de páginas

Depois de esclarecer as dúvidas, comece pelo planejamento e pela estruturação do layout da página. Defina como os elementos e componentes solicitados serão dispostos e estabeleça a hierarquia visual.

Implemente primeiro essa composição, respeitando o conteúdo, os componentes e os limites definidos na especificação. As decisões de disposição e apresentação visual ficam a cargo do modelo. O operador pode solicitar ajustes ao avaliar o resultado.

Depois, implemente os comportamentos funcionais previstos na especificação.

## Elementos e componentes reutilizáveis

Antes de implementar a página, identifique os elementos e componentes existentes que atendem à especificação e verifique seus usos atuais. Reutilize-os quando forem compatíveis com o comportamento solicitado.

Não crie uma cópia de um elemento ou componente existente. Não altere elementos, componentes ou estilos compartilhados durante uma tarefa de página, salvo quando a especificação incluir essa alteração ou o operador a solicitar.

Se um componente necessário não existir ou não atender à especificação, informe o operador e esclareça como proceder antes de implementá-lo.

## Registro de trabalho e continuidade

Use Markdown simples, com títulos, listas e tabelas quando ajudarem a localizar informações. Preserve integralmente o corpo aprovado da especificação. Registre o plano, o estado das etapas, as decisões posteriores, as validações, os pareceres parciais e o parecer final em seções separadas no mesmo Markdown operacional.

Mantenha um registro suficiente para retomar o trabalho após uma compactação de contexto. Registre decisões e descobertas relevantes quando ocorrerem e atualize o registro ao concluir cada etapa. Não dependa do histórico da conversa para reconstruir o que foi feito.

Se surgir uma dúvida funcional ou incompatibilidade durante a implementação, interrompa somente a parte afetada, registre o ponto de interrupção e consulte o operador.

## Conclusão e avaliação de uma etapa

Ao iniciar uma etapa, registre no Markdown operacional o estado do Git que servirá de referência para identificar as alterações dessa etapa. Se já houver alterações, identifique-as quando possível e preserve-as. Se não for possível distinguir as alterações da etapa de mudanças alheias, registre a limitação e consulte o operador antes de incluir essas mudanças na revisão.

Ao concluir a implementação, registre no Markdown operacional o que foi feito, as validações realizadas e seus resultados, as decisões tomadas, as observações do operador e as pendências. Esse registro deve ser suficiente para retomar o trabalho após uma compactação de contexto e será usado na composição do Parecer Final da unidade.

Apresente ao operador o resultado da etapa, as validações e as pendências. Informe qualquer requisito que não pôde ser atendido e o motivo. Aguarde a avaliação funcional do operador e registre as solicitações de ajuste e decisões posteriores sem alterar o texto aprovado da especificação.

Após o aceite funcional expresso do operador, retire os controles temporários de teste que já não forem necessários e valide o resultado. Em seguida, faça uma revisão técnica de qualidade limitada às alterações da etapa ainda presentes no Git, incluindo alterações staged e unstaged e arquivos novos não rastreados. Considere a referência registrada no início da etapa para distinguir mudanças alheias. Se a origem de alguma alteração não puder ser determinada com segurança, registre essa limitação e consulte o operador antes de incluí-la na revisão.

A revisão técnica avalia a qualidade do código alterado, incluindo práticas de React, uso de estilos, composição da página, clareza e manutenção. Seu escopo é a qualidade das alterações da etapa; não reavalie o atendimento à especificação nem reabra o aceite funcional.

Apresente sugestões com referências aos arquivos e trechos pertinentes, explicando o problema ou benefício esperado. Diferencie correções necessárias, melhorias opcionais e preferências de engenharia. Se não houver sugestões relevantes, registre esse resultado. Não altere o código durante a revisão e aguarde a decisão do operador sobre cada sugestão antes de implementá-la. Se uma sugestão puder alterar comportamento ou escopo funcional, esclareça esse impacto e obtenha autorização específica antes de implementá-la.

Implemente as sugestões aprovadas pelo operador, valide os ajustes e revise as alterações resultantes. Registre também as sugestões recusadas ou adiadas e as decisões do operador. Concluída a revisão técnica e registradas as decisões sobre as sugestões, quando houver, marque a etapa como concluída no Markdown operacional e registre sempre um **Parecer Parcial — E#**, mesmo que a revisão não tenha encontrado achados. Inclua no parecer as entregas, validações, decisões, resultado da revisão técnica, pendências e observações do operador; quando não houver achados, registre esse resultado. Esse parecer será usado na composição do Parecer Final da unidade.

Faça um commit local na branch `develop`, sem push, usando a mensagem definida para a unidade, por exemplo, `05.01 - E1`. Registre o commit no Markdown operacional. Apresente a próxima etapa prevista, com seu objetivo, entregas e dependências, e aguarde autorização do operador antes de iniciá-la.

## Encerramento da especificação

Somente o operador pode encerrar ou cancelar a unidade. Não a considere encerrada sem autorização expressa.

Após a autorização, componha o Parecer Final usando os registros persistentes das etapas. O parecer deve ser autossuficiente e registrar o que foi entregue, as validações e seus resultados, as decisões vigentes e as observações do operador.

Descreva explicitamente as alterações realizadas na usabilidade e nas regras de negócio em relação à especificação aprovada. Para cada alteração, registre o comportamento resultante, a decisão do operador e os documentos que podem precisar de reconciliação. Inclua também diferenças não resolvidas, pendências e limitações. O parecer deve permitir a reconciliação da documentação sem depender do histórico da conversa.

Inclua o Parecer Final no Markdown operacional e arquive a unidade movendo o Markdown integral para `concluidas/`. Faça o commit final na branch `develop`, usando como mensagem a identificação da unidade e o nome da especificação, e execute o push para `origin/develop`. Informe ao operador o resultado confirmado do commit e do push e apresente o Parecer Final integral em formato copiável.

Não publique em `main`, faça implantações ou altere pipelines sem autorização específica.
