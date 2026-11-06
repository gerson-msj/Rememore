# Regras de trabalho — Rememore

Este repositório contém a implementação .NET do Rememore. A documentação funcional aprovada orienta o trabalho; o código existente não autoriza inferir ou alterar requisitos. O operador define o escopo, aprova decisões funcionais e encerra cada unidade.

## Início de uma unidade

Leia, nesta ordem, estes arquivos, `.docs/README.md`, `.docs/memoria-tecnica.md` e `.docs/especificacoes/README.md`. Depois, verifique se existe uma única especificação operacional disponível em `.docs/especificacoes/`, se houver, ela será a especificação a ser trabalhada, do contrário, aguarde instruções do operador. Não percorra automaticamente outras especificações, a árvore completa do código ou documentos do Google Drive.

A especificação pode já existir na raiz do diretório de especificações, ser fornecida como texto/arquivo aprovado ou como pedido para elaborar uma proposta sujeita à aprovação. Mantenha o conteúdo aprovado intacto no Markdown operacional; registre nele, em seção separada, o plano mínimo, o estado, as validações, os pareceres parciais e o parecer final.

## Autoridade e limites

- Esclareça dúvidas funcionais antes de executar a parte afetada. Não invente regras, textos, navegação, estados, mensagens ou comportamento, em caso de dúvidas questione o operador.
- O operador avisará quando tiver feito alterações manuais; preserve-as.
- Não amplie o escopo, faça refatorações gerais, altere contratos ou crie infraestrutura futura sem necessidade e autorização.
- ELMs, CMPs, estilos compartilhados e seus contratos não devem ser alterados durante uma tarefa de página por iniciativa própria.
- `Stack1/` é referência histórica. Não a altere, leia ou exclua sem autorização específica.
- Não abra `Anotações.md` nem arquivos de credenciais; nunca exponha segredos. Alterações em publicação, pipelines, segredos, dados remotos ou backend real exigem autorização específica.
- Não acesse o Google Drive, solicite ao operador se precisar de alguma informação relativa a documentação utilizada para elaboração das especificações.

## Runbook (Execução e validação)

Faça verificações proporcionais aos requisitos e registre o que foi realmente validado e o que não foi. No ChatGPT Desktop/Windows, comandos .NET devem ser executados fora do sandbox e utilize aba do navegador interno. Comandos Git que alterem o repositório, como `git add` e `git commit`, também devem ser executados fora do sandbox para evitar falhas de permissão no `.git/index.lock`; comandos somente de leitura podem continuar no sandbox.
Gerencie o uso dos comandos `dotnet`, execute ou interrompa `dotnet run` ou `dotnet watch` quando necessário, tenha sido ele iniciado por você ou não, acompanhe os logs e em caso de falha após alteração de arquivos do projeto interrompa e execute novamente, de preferência ao uso de `dotnet watch` e garanta que o site esteja aberto no local necessário antes de aguardar validações do site pelo operador.

## Encerramento

Após a aprovação de todas as etapas de uma especificação, solicite ao operador autorização expressa para seu encerramento. Somente o operador pode autorizar o encerramento ou cancelamento. Para o procedimento completo, consulte a seção `Encerramento` de `.docs/especificacoes/README.md`.

## Auditoria
Leia `.docs/AUDITORIA.md` somente quando o operador pedir expressamente uma auditoria.
