# Regras de trabalho — Rememore

Este repositório contém a implementação .NET do Rememore. A documentação funcional aprovada orienta o trabalho; o código existente não autoriza inferir ou alterar requisitos. O operador define o escopo, aprova decisões funcionais e encerra cada unidade.

## Início de uma unidade

Leia, nesta ordem, este arquivo, `.docs/README.md`, `.docs/memoria-tecnica.md` e `.docs/especificacoes/README.md`. Depois, leia somente a especificação operacional indicada pelo operador. Não percorra automaticamente outras especificações, a árvore completa do código ou documentos do Drive.

A especificação pode ser fornecida como texto/arquivo aprovado, como pedido para elaborar uma proposta sujeita à aprovação, ou como documento específico do Drive indicado pelo operador para transcrição integral. Mantenha o conteúdo aprovado intacto no Markdown operacional; registre nele, em seção separada, o plano mínimo, o estado, as validações e o parecer.

## Autoridade e limites

- Esclareça dúvidas funcionais antes de executar a parte afetada. Não invente regras, textos, navegação, estados, mensagens ou comportamento.
- Antes de editar, confira o estado do Git e os arquivos e consumidores envolvidos. O operador avisará quando tiver feito alterações manuais; preserve-as.
- Não amplie o escopo, faça refatorações gerais, altere contratos ou crie infraestrutura futura sem necessidade e autorização.
- ELMs, CMPs, estilos compartilhados e seus contratos não devem ser alterados durante uma tarefa de página por iniciativa própria. Siga o guia de especificações para a prontidão das páginas e o trabalho no `/lab`.
- `Stack1/` é referência histórica: consulte-a seletivamente se for útil enquanto houver defasagem funcional, sem copiar decisões automaticamente. Não a altere ou exclua sem autorização específica.
- Não abra `Anotações.md` nem arquivos de credenciais; nunca exponha segredos. Alterações em publicação, pipelines, segredos, dados remotos ou backend real exigem autorização específica.

## Execução e validação

Faça verificações proporcionais aos requisitos e registre o que foi realmente validado e o que não foi. No ChatGPT Desktop/Windows, comandos .NET devem ser executados fora do sandbox conhecido como inadequado. Para prévias, reutilize uma única instância de `dotnet watch`, normalmente na porta 5193, e uma aba do navegador interno; não acumule processos e terminais.

## Encerramento

Somente o operador encerra ou cancela uma especificação. Após autorização de encerramento, conclua o Parecer no Markdown operacional, arquive a unidade e faça commit/push de `develop`; não publique em `main`, implante ou altere pipelines sem autorização específica. Informe no chat o resultado real do commit/push e forneça o Parecer final para transferência ao Drive. Não declare que o Drive foi atualizado sem tê-lo feito.

Leia `.docs/AUDITORIA.md` somente quando o operador pedir expressamente uma auditoria.
