# Memória do programador

Esta pasta preserva a memória técnica e o capital de tokens do Rememore no próprio repositório. Seu conteúdo acompanha o projeto entre
sessões, computadores e modelos.

## Leitura inicial

Depois do `AGENTS.md`, leia este índice e [Memória técnica](memoria-tecnica.md). Em seguida, leia somente a Especificação indicada pelo
operador em `especificacoes/`, dentro desta pasta. A leitura inicial da memória não autoriza listar ou ler outras Especificações.

As Especificações locais usam somente a sequência numérica: `01`, `02` etc. O prefixo `05.` é mantido apenas na identificação da fonte do
Drive.

O `AGENTS.md` guarda as orientações de trabalho; a memória técnica guarda decisões, descobertas e suas razões; a Continuidade da
Especificação guarda o estado daquela unidade.

## Entrada, uso e saída da Especificação

O operador cria `especificacoes/NN-titulo.md` com o conteúdo integral aprovado, a identificação original e o link da fonte. O Google Doc
continua canônico e histórico; o Markdown é o espelho operacional. O fluxo normal dispensa acesso ao Drive.

Depois da clarificação, o programador acrescenta a Continuidade no mesmo arquivo: plano, decisões, validações, pendências e indicadores de
contexto disponíveis. Ao encerramento solicitado pelo operador, preenche o Parecer final autossuficiente. O operador copia esse parecer para
o analista e o Drive. Não é necessário criar outro arquivo nem uma versão resumida da Especificação.

## Consultas sob demanda

- [Componentes e capacidades](referencias/componentes-e-capacidades.md): contratos de CabecalhoPagina, MensagemPopup, cascas e navegação
  autenticada.
- [Ambiente e fundação visual](referencias/ambiente-e-fundacao-visual.md): execução do Deno, estilos, paletas e laboratório.
- [Trabalho local](referencias/trabalho-local.md): IndexedDB, disponibilidade, capturas por conta/data, transações e evolução de schema.

Leia somente a referência pertinente à unidade. Para reutilizar um contrato documentado, a referência pode bastar; antes de alterá-lo,
confira o fonte e os chamadores afetados. O catálogo cresce quando o trabalho demanda, sem inventário geral do projeto.

## Manutenção do conhecimento atual

Preserve resultados de investigação e decisões que poupem raciocínio futuro. Atualize ou remova conhecimento superado. Acrescente documentos
quando houver conteúdo relevante e mantenha aqui os links para a leitura inicial. Evite diários de alterações, cópias do código e boas
práticas genéricas.

Esta organização foi definida com o operador e pode evoluir conforme a experiência de trabalho no projeto.
