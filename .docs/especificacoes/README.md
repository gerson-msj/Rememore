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

Ao concluir uma etapa, registre no Markdown operacional o que foi implementado, as validações realizadas e seus resultados, as decisões tomadas, as observações do operador e as pendências. Esse registro deve ser suficiente para retomar o trabalho após uma compactação de contexto e será usado na composição do Parecer Final da unidade.

Apresente ao operador o resultado da etapa, as validações e as pendências. Informe qualquer requisito que não pôde ser atendido e o motivo. Aguarde a avaliação do operador e registre as solicitações de ajuste e decisões posteriores sem alterar o texto aprovado da especificação.

Após o aceite do operador, marque a etapa como concluída no Markdown operacional e apresente a próxima etapa prevista, com seu objetivo, entregas e dependências. Não a inicie sem autorização do operador.

Após o aceite expresso de cada etapa, retire os controles temporários de teste que já não forem necessários, valide o resultado e registre um **Parecer Parcial — E#** com entregas, validações, decisões, pendências e observações do operador. Faça um commit local na branch `develop`, sem push, usando a mensagem definida para a unidade, por exemplo, `05.01 - E1`. Registre o commit no Markdown operacional.

## Encerramento da especificação

Somente o operador pode encerrar ou cancelar a unidade. Não a considere encerrada sem autorização expressa.

Após a autorização, componha o Parecer Final usando os registros persistentes das etapas. O parecer deve ser autossuficiente e registrar o que foi entregue, as validações e seus resultados, as decisões vigentes e as observações do operador.

Descreva explicitamente as alterações realizadas na usabilidade e nas regras de negócio em relação à especificação aprovada. Para cada alteração, registre o comportamento resultante, a decisão do operador e os documentos que podem precisar de reconciliação. Inclua também diferenças não resolvidas, pendências e limitações. O parecer deve permitir a reconciliação da documentação sem depender do histórico da conversa.

Inclua o Parecer Final no Markdown operacional e arquive a unidade movendo o Markdown integral para `concluidas/`. Faça o commit final na branch `develop`, usando como mensagem a identificação da unidade e o nome da especificação, e execute o push para `origin/develop`. Informe ao operador o resultado confirmado do commit e do push e apresente o Parecer Final integral em formato copiável.

Não publique em `main`, faça implantações ou altere pipelines sem autorização específica.
