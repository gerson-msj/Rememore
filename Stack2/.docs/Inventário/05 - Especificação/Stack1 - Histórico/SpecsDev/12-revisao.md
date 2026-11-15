# 05.12 - Revisão da Captura

## Objetivo

Materializar a primeira parte funcional da etapa Revisar em `/capturar/{data}`, responsável por apresentar a composição local completa do
dia, permitir sua conferência, oferecer acesso contextual às edições já existentes e executar a primeira validação local antes da
preservação.

Esta unidade trabalha somente sobre o workspace local já confirmado da captura. Ela não realiza preservação remota, resolução de conflitos
nem descarte efetivo da captura.

## Escopo da unidade

Esta Especificação deve entregar:

- a composição visual e operacional da etapa Revisar;
- a apresentação integral das memórias do dia por CMP-008 — Memória no contexto Revisar;
- a Orientação Progressiva própria da Revisão;
- os controles superiores da etapa;
- a validação local de categoria obrigatória acionada por Preservar;
- o destaque e o posicionamento das memórias sem categoria depois dessa validação;
- a abertura de qualquer memória da Revisão para ajuste;
- a navegação contextual entre as perspectivas Memória e Categorização da mesma memória;
- o retorno contextual para a Revisão;
- a ação Voltar ao topo quando a extensão efetiva da página justificar.

## Fora do escopo

Permanecem para a unidade seguinte:

- envio da composição ao servidor;
- conferência da revisão remota;
- preservação normal;
- confirmação e preservação de composição vazia sobre um dia já preservado;
- estados remotos de processamento, sucesso, falha ou resposta inconclusiva;
- concorrência entre dispositivos;
- tratamento e decisão de conflitos;
- funcionamento efetivo de Descartar alterações;
- destino final depois de preservação ou descarte concluídos.

Nenhuma dessas capacidades deve ser simulada como concluída nesta unidade.

## Estrutura da tela

A etapa Revisar utiliza a estrutura já existente da Captura do dia.

De cima para baixo, a tela apresenta:

1. header global;
2. linha da captura com a data completa;
3. controles das três etapas da Captura: Memorar, Categorizar e Revisar;
4. linha de ações própria da Revisão;
5. Orientação Progressiva;
6. lista das memórias;
7. ação Voltar ao topo, somente quando a extensão efetiva da página justificar sua presença.

Header, data e controles das etapas preservam o comportamento estrutural já materializado na Captura do dia.

A linha de ações da Revisão e a Orientação Progressiva pertencem ao conteúdo rolável. Não devem ampliar a região fixa superior da página.

## Linha de ações da Revisão

A linha apresenta botões com ícone e descrição textual completa. Nesta etapa a clareza dos rótulos é mais importante que compactá-los em
ícones isolados.

### Preservar

Preservar é a ação principal e permanece disponível para acionamento mesmo quando existirem memórias sem categoria.

Nesta unidade, seu acionamento executa integralmente a validação local definida adiante.

Se a composição estiver localmente válida, a ação chega somente ao limite funcional de “apto para iniciar preservação”. Não deve enviar
dados ao servidor, simular preservação concluída ou apresentar sucesso remoto.

### Descartar alterações

Descartar alterações já deve ocupar sua posição definitiva para que a organização visual da etapa seja validada nesta unidade.

Seu botão utiliza ícone e texto completo e deve estar inequivocamente indisponível enquanto sua consequência funcional ainda não estiver
materializada.

A próxima unidade ligará o comportamento real sem precisar reorganizar a tela.

## Orientação Progressiva

A etapa Revisar utiliza CMP-005 — Orientação Progressiva.

Mensagens:

**Iniciante**

“Revise suas memórias antes de preservar. Confira o texto, as categorias e os demais detalhes. Se precisar, você ainda pode ajustar qualquer
memória.”

**Intermediário**

“Confira se esta composição representa bem o seu dia. Você ainda pode ajustar qualquer memória antes de preservar.”

**Avançado**

“Revise se esta composição representa bem o que você quer preservar deste dia.”

A orientação aparece antes da lista e rola normalmente com o conteúdo.

## Lista de memórias

A Revisão apresenta as memórias na ordem atual da composição usando CMP-008 — Memória no contexto Revisar.

Cada memória utiliza a apresentação já definida para esse contexto:

- unidade de leitura integral, incluindo os complementos que pertençam à memória;
- texto sem limite de três linhas e sem gradiente;
- todas as categorias associadas, podendo ocupar múltiplas linhas;
- “Sem categoria” esmaecido quando não houver associação;
- linguagem visual do Tom quando ele estiver informado;
- nenhum controle de ordenação próprio da lista.

A Revisão não cria uma terceira forma de editar os dados. Ela utiliza as capacidades de edição já existentes.

Todas as memórias são acionáveis, independentemente de possuírem ou não algum impedimento para preservação.

## Validação local ao acionar Preservar

Ao acionar Preservar, a Revisão verifica a composição local completa.

Toda memória precisa possuir ao menos uma categoria.

### Composição sem problema de categoria

Se todas as memórias possuírem ao menos uma categoria, a validação local termina com sucesso e a ação alcança o ponto de integração
reservado à futura preservação remota.

Nenhuma consequência remota é executada nesta unidade.

Uma composição sem memórias não possui erro de categoria e também ultrapassa esta validação local. As consequências de preservar uma
composição vazia pertencem à próxima unidade.

### Existência de memória sem categoria

Se uma ou mais memórias não possuírem categoria:

- a preservação não avança;
- apresentar a mensagem: “Há memórias sem categoria. Adicione pelo menos uma categoria a cada memória antes de preservar.”;
- todas as ocorrências de “Sem categoria” correspondentes às memórias inválidas recebem tratamento visual de atenção;
- o tratamento deve dar maior destaque ao próprio indicador de ausência, podendo utilizar contraste mais forte e contorno diferenciado ao
  redor de “Sem categoria”, sem transformar toda a memória em uma caixa de erro;
- a tela navega imediatamente para a primeira memória sem categoria na ordem atual da composição;
- a memória é posicionada na região visível, sem abrir sua edição automaticamente.

O destaque nasce da tentativa de preservação e acompanha o estado real da composição.

Depois que uma categoria for associada com sucesso a uma memória anteriormente inválida, o destaque daquela memória desaparece. Outras
memórias ainda sem categoria permanecem destacadas.

Uma nova tentativa de Preservar sempre executa novamente a validação sobre o estado atual. Se ainda existirem problemas, a tela posiciona a
primeira memória ainda inválida.

## Abertura de memória a partir da Revisão

Clicar em qualquer memória da lista abre a edição contextual daquela memória.

A abertura não leva o usuário de volta às etapas gerais Memorar ou Categorizar. Ele permanece conceitualmente dentro da Revisão, apenas
ajustando uma memória específica.

As abas gerais da Captura do dia ficam ocultas durante essa edição contextual.

A edição possui duas perspectivas locais:

- **Memória**;
- **Categorização**.

O usuário pode alternar entre essas duas perspectivas sem trocar de memória.

### Perspectiva Memória

Reutiliza integralmente o comportamento já existente da edição de memória.

Permanecem vigentes, sem exceção criada pela Revisão:

- edição do texto quando autorizada;
- leitura histórica quando o texto original estiver fora do prazo;
- criação de complemento quando permitida;
- edição de complemento ainda autorizado;
- leitura dos complementos históricos;
- exclusão regressiva;
- autorização de edição decidida pelas regras já existentes;
- proteção de rascunho e continuidade por reload;
- confirmações e persistência local já definidas.

Entrar pela Revisão não torna conteúdo histórico novamente editável.

### Perspectiva Categorização

Reutiliza a Categorização já existente da memória:

- categorias;
- pesquisa e criação local quando disponíveis;
- Tom quando disponível para o nível do usuário;
- balanço sentimental quando disponível;
- modos somente leitura decorrentes da historicidade;
- persistência imediata das associações de categoria;
- persistência e proteções já definidas para Tom e balanço sentimental.

A única alteração contextual é a navegação.

Na Categorização aberta a partir da Revisão não existem os controles Anterior e Próxima entre memórias. A memória permanece fixa. A
navegação local ocorre somente entre Memória e Categorização daquela mesma memória.

### Perspectiva inicial

Uma memória aberta normalmente a partir da Revisão inicia na perspectiva **Memória**.

Depois de uma tentativa de Preservar que identificou memórias sem categoria, selecionar uma memória que esteja destacada por esse
impedimento inicia diretamente na perspectiva **Categorização**.

Isso apenas encurta o caminho para o problema já identificado; não altera permissões nem regras de edição.

## Retorno à Revisão

Sair da edição contextual retorna sempre à etapa Revisar.

O retorno não leva o usuário à lista de Memorar nem à lista de Categorizar.

A memória de origem deve ser restaurada aproximadamente na região em que estava sendo visualizada, ou tão próxima quanto a geometria da
página permitir.

Alterações que tenham sido confirmadas e persistidas localmente aparecem imediatamente na Revisão.

Rascunhos não confirmados continuam obedecendo às proteções já existentes de suas respectivas edições.

## Voltar ao topo

Não repetir Preservar e Descartar alterações no final da lista.

Quando a extensão efetiva da página tornar inconveniente retornar manualmente à região superior, apresentar ao final da composição a ação
textual **“Voltar ao topo”**.

A necessidade deve ser determinada pela rolagem real da página, e não por uma quantidade fixa de memórias. Uma única memória muito extensa
pode justificar a ação; várias memórias curtas podem não justificar.

Acionar Voltar ao topo retorna à região superior da Revisão, tornando novamente acessíveis as ações da etapa.

Em páginas curtas, a ação não é apresentada.

## Persistência e fonte dos dados

A Revisão lê a composição do workspace local já utilizado pelas demais etapas da Captura do dia.

Esta unidade não introduz nova cópia paralela dos dados nem nova origem de verdade.

A simples visualização e a validação de categoria não modificam o workspace.

Quando o usuário abre uma memória e realiza uma alteração pelas capacidades já existentes, a persistência continua seguindo os contratos
atuais de cada edição.

Falhas de persistência local continuam utilizando o tratamento já definido: a interface não pode apresentar como concluída uma alteração que
não tenha sido confirmada no armazenamento local.

## Limite de integração com a próxima unidade

Ao final desta Especificação deve existir um ponto claro de integração para o comando Preservar depois que a composição passa pela validação
local.

A unidade seguinte parte desse ponto para tratar a fronteira entre workspace local e acervo preservado: conferência remota, preservação,
composição vazia, descarte, falhas e conflitos.

O resultado desta unidade deve poder ser validado integralmente sem depender dessas operações remotas.

## Referências documentais de origem — não operacionais

Esta Especificação foi derivada principalmente de:

- 04.06 — Especificação Funcional - Capturar;
- 04.07 — Regras - Capturar;
- 04.08 — Componentes - Capturar;
- 03.05 — Capturar;
- 02.03 — Captura e Evolução das Memórias;
- 02.05 — Modelo de Trabalho e Continuidade.

Essas referências preservam rastreabilidade histórica. O programador não depende da leitura desses documentos para executar esta unidade; o
contrato necessário está descrito acima.

## Continuidade

### Indicadores de contexto

- Antes das leituras: não disponível na interface; sem estimativa.
- Após AGENTS, índice, memória inicial e esta Especificação, antes do fonte: não disponível na interface; sem estimativa.
- Ao final da unidade: registrar se disponível; sem estimativa.

### Clarificação

- Escopo entendido: materializar Revisar sobre o workspace local, com lista integral, orientação, ações superiores, validação de categoria,
  abertura contextual das perspectivas Memória e Categorização, retorno à revisão e ação condicional Voltar ao topo.
- Esclarecimento do operador: enquanto a memória estiver aberta pela Revisão, o header mostra “Revisar” nas duas perspectivas; os controles
  locais são “Memorar” e “Categorizar” e não alteram o título. Voltar no header, de qualquer perspectiva, fecha a edição e retorna à lista na
  aba Revisar.
- Ajuste solicitado pelo operador: Preservar fica indisponível quando a lista vazia pertence a uma captura nova, mas continua disponível
  para captura com origem preservada ou que já teve memória confirmada. Usar ícone `book-open` e centralizar Preservar/Descartar alterações.
- Correção de defeito: ao voltar da perspectiva Categorizar, limpar também seu estado contextual antes de mostrar a lista Revisar, evitando
  que a tela permaneça em Categorização.
- Refinamento solicitado pelo operador: destacar todas as memórias sem categoria assim que a lista Revisar aparecer; destacar somente a
  cor do texto do indicador, preservando a borda original; ao tentar Preservar com categorias faltantes, abrir popup com a mensagem definida
  no corpo aprovado. A abertura direta em Categorizar continua vinculada à tentativa de Preservar.
- Não foram encontradas lacunas funcionais que exijam decisão do operador. A ação Preservar para na validação local; Descartar alterações
  permanece indisponível.

### Plano

1. **Revisar e validar** — implementado: orientação, memórias completas e ações; validação local, mensagem, destaque reativo e foco na
   primeira inválida. Verificações técnicas passaram.
2. **Edição contextual** — implementado: perspectiva inicial conforme a validação, alternância Memória/Categorização na mesma memória,
   sem navegação entre memórias, retorno à Revisão e restauração da posição. Verificações técnicas passaram.
3. **Extensão e entrega** — implementado: Voltar ao topo baseado na extensão real do documento. `deno fmt`, `deno check
   islands/CapturaDia.tsx`, lint direcionado, `deno task build` e `git diff --check` passaram. Testes não foram executados. A validação
   visual não pôde ser confirmada nesta sessão: a página no navegador permaneceu em “Preparando captura…”. O operador solicitou o
   encerramento da Especificação após as correções.

Estado: encerrada a pedido do operador. Parecer final elaborado e entregue nesta cópia local; o Drive não foi atualizado.

## Parecer final

Foi materializada a etapa Revisar em `/capturar/{data}`, integrada ao workspace local e aos componentes existentes de memória e edição.
Foram entregues a lista integral das memórias, a orientação progressiva, as ações da etapa, a validação local de categoria obrigatória, a
edição contextual nas perspectivas Memorar e Categorizar, o retorno à lista Revisar na posição de origem e a ação Voltar ao topo conforme a
extensão real da página.

Por solicitação do operador, memórias sem categoria já recebem destaque textual ao entrar em Revisar; a borda original é preservada. Uma
tentativa de Preservar com categorias faltantes abre popup e posiciona a primeira memória inválida. Após essa tentativa, abrir uma memória
destacada inicia em Categorizar. O header mantém “Revisar” nas duas perspectivas e seu botão Voltar retorna à lista Revisar. Preservar usa
ícone `book-open`, fica centralizado com Descartar alterações e é desabilitado apenas para uma captura nova ainda vazia; composição vazia
com origem preservada ou memória previamente confirmada continua habilitada para a integração futura.

Preservação remota, confirmação de composição vazia, descarte efetivo, estados remotos e conflitos não foram realizados e permanecem para a
unidade seguinte. `deno check`, lint direcionado, build de produção e `git diff --check` passaram; testes automatizados não foram executados.
A apresentação visual no navegador não pôde ser confirmada nesta sessão porque a página permaneceu em “Preparando captura…”. O parecer foi
entregue ao operador nesta cópia local; não houve atualização do Google Drive.
