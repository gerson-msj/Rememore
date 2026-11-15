# Regras de trabalho — Rememore

Este repositório contém a implementação do Rememore com Bun e React (Stack 3). A documentação funcional aprovada orienta o trabalho; o código existente não autoriza inferir ou alterar requisitos. O operador define o escopo, aprova decisões funcionais e encerra cada unidade.

## Início de uma unidade

Leia, nesta ordem, estes arquivos, `.docs/README.md`, `.docs/memoria-tecnica.md` e `.docs/especificacoes/README.md`. Depois, verifique se existe uma única especificação operacional disponível em `.docs/especificacoes/`, se houver, ela será a especificação a ser trabalhada, do contrário, aguarde instruções do operador. Não percorra automaticamente outras especificações, a árvore completa do código ou documentos do Google Drive.

A especificação pode já existir na raiz do diretório de especificações, ser fornecida como texto/arquivo aprovado ou como pedido para elaborar uma proposta sujeita à aprovação. Mantenha o conteúdo aprovado intacto no Markdown operacional; registre nele, em seção separada, o plano mínimo, o estado, as validações, os pareceres parciais e o parecer final.

## Autoridade e limites

- Esclareça dúvidas funcionais antes de executar a parte afetada. Não invente regras, textos, navegação, estados, mensagens ou comportamento, em caso de dúvidas questione o operador.
- O operador avisará quando tiver feito alterações manuais; preserve-as.
- Não amplie o escopo, faça refatorações gerais, altere contratos ou crie infraestrutura futura sem necessidade e autorização.
- ELMs, CMPs, estilos compartilhados e seus contratos não devem ser alterados durante uma tarefa de página por iniciativa própria.
- `Stack1/` e `Stack2/` são referências históricas. Não as altere, leia ou exclua sem autorização específica.
- `.docs/Rememore/` contém uma cópia local da documentação do projeto mantida isoladamente. Durante tarefas no código-fonte, não leia, altere ou exclua esse diretório; trabalhe nele somente quando o operador solicitar.
- Não abra `Anotações.md` nem arquivos de credenciais; nunca exponha segredos. Alterações em publicação, pipelines, segredos, dados remotos ou backend real exigem autorização específica.
- Não acesse o Google Drive, solicite ao operador se precisar de alguma informação relativa a documentação utilizada para elaboração das especificações.
- Leia este `AGENTS.md` novamente a cada compactação da sessão. Leia também `.docs/memoria-tecnica.md` no início de cada nova sessão e novamente após cada compactação. Se não conseguir identificar que houve uma compactação, o operador avisará.

## Runbook (Execução e validação)

Faça verificações proporcionais aos requisitos e registre o que foi realmente validado e o que não foi. No ChatGPT Desktop/Windows, utilize uma aba do navegador interno para validar o site. Para executar o projeto, inicie `bun dev`, acompanhe os logs e, se houver falha após alterações nos arquivos do projeto, interrompa o processo e inicie-o novamente. Garanta que o site esteja aberto no endereço local necessário antes de aguardar validações do operador. Comandos Git que alterem o repositório, como `git add` e `git commit`, devem ser executados fora do sandbox para evitar falhas de permissão em `.git/index.lock`; comandos somente de leitura podem continuar no sandbox.

## Encerramento

Após a aprovação de todas as etapas de uma especificação, solicite ao operador autorização expressa para seu encerramento. Somente o operador pode autorizar o encerramento ou cancelamento. Para o procedimento completo, consulte a seção `Encerramento` de `.docs/especificacoes/README.md`.

## Auditoria
Leia `.docs/AUDITORIA.md` somente quando o operador pedir expressamente uma auditoria.
