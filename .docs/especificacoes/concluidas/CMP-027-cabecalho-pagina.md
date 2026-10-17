# CMP-027 — Cabeçalho de Página

## Instrução operacional recebida

Reconstruir o CMP-027 — Cabeçalho de Página no `/lab`, seguindo processo incremental. A definição funcional vigente indicada é CMP-027 em 04.01 — Fundação do Front. O código atual deve ser consultado antes de começar.

O objetivo é obter um componente reutilizável, construído e validado em etapas. Não implementar o contrato inteiro de uma vez: o operador indicará configurações e comportamentos após cada avaliação.

1. Criar no `/lab` um bloco expansível **CMP-027 — Cabeçalho de Página**, destinado apenas às configurações e ao acompanhamento dos testes. A demonstração do cabeçalho fica no topo da página do `/lab`, fixada como em uma página real.
2. Depois, construir somente a estrutura inicial do cabeçalho com HTML e Bulma, sem ações funcionais ou configurações dinâmicas, e apresentar para avaliação visual.
3. Acrescentar gradualmente entradas, estados e ações solicitados. Apresentar cada etapa e aguardar validação antes de avançar.

O componente antigo pode receber o sufixo `_old` quando isso evitar conflitos e preservar a referência. Não integrar o novo cabeçalho às páginas do produto nesta tarefa.

Contrato funcional a alcançar ao longo das etapas: o chamador fornece o título, escolhe se a região esquerda mostra `book-open` sem ação ou `chevron-left` com ação de retorno, informa se `arrow-right-from-bracket` deve aparecer e trata os acionamentos de retorno e saída. O componente comunica as ações ao chamador; não escolhe destinos, encerra sessão nem abre confirmações. Não há menu próprio. O cabeçalho possui regiões esquerda, central e direita; o título não é acionável; a região esquerda preserva seu espaço ao alternar ícones, sem deslocar o título; ocupa a largura superior e permanece fixo durante a rolagem. Detalhes visuais serão definidos durante os testes, começando pela estrutura simples do Bulma.

O programador inicia, acompanha e reinicia `dotnet watch` quando necessário, mantendo-o ativo para a avaliação. O operador realiza testes visuais e funcionais até pedir o contrário; se inspeção própria da interface se tornar necessária, será combinada no momento. Ao disponibilizar cada etapa, informar o que foi acrescentado e aguardar observações.

## Continuidade e checkpoints

### Preparação

- Entendimento: executar somente a primeira etapa agora, adicionando o bloco expansível de acompanhamento no `/lab`; não construir nem exibir o cabeçalho ainda.
- Dúvidas funcionais para esta etapa: nenhuma.
- A branch de trabalho é `develop`; `git status --short` estava limpo antes da edição.
- A definição local de 04.01/CMP-027 não foi encontrada em `.docs/especificacoes/`. O componente atual e o código do `/lab` foram inspecionados; a ausência da definição vigente fica registrada para consulta antes de etapas que dependam de detalhes dela.
- O índice e a memória técnica foram lidos. Reutilizar o `BlocoLab` existente; o `CabecalhoPagina` atual e `DemonstracaoCabecalho` foram consultados como estado anterior, sem alterá-los nesta etapa.

### Checkpoint 1 — bloco de acompanhamento

- Implementado: inclusão do bloco expansível `cmp-027-cabecalho-pagina` em `Pages/Lab.razor`, com título solicitado e uma nota curta de acompanhamento. Nenhum cabeçalho é renderizado e nenhum componente/contrato existente foi alterado.
- Validação técnica: `dotnet watch` restaurou os pacotes e compilou o cliente com 0 avisos e 0 erros; o servidor está ativo em `http://localhost:5193` e aguardando alterações. A primeira tentativa sem acesso à rede falhou com `NU1301`; a restauração autorizada foi concluída com sucesso.
- Validação visual e funcional: fica a cargo do operador.
- Aceite do operador: aguardando.
- Pendências e próximo passo: operador avaliar o bloco no `/lab`. Só após validação avançar à etapa 2 (estrutura visual inicial). Recuperar a definição local 04.01/CMP-027 se estiver disponível antes de implementar conteúdo funcional dependente dela.

### Atualização de continuidade — execução do checkpoint 1

- A alteração observada em `Pages/Lab.razor` já estava no workspace antes da execução desta etapa e foi preservada. O diff existente contém apenas o bloco CMP-027 descrito acima; a documentação operacional também já estava criada e foi mantida, acrescentando-se somente este resultado de validação.
- `dotnet watch` permaneceu ativo após build bem-sucedido e está servindo o Lab em `http://localhost:5193`.

### Checkpoint 2 — estrutura visual estática

- Implementado: novo `CabecalhoPaginaLab` em `Componentes/Lab`, exibido no topo fixo de `/lab`; mostra estaticamente `book-open` e `chevron-left` como alternativas visuais à esquerda, o título alinhado à esquerda na região central e `arrow-right-from-bracket` à direita. Nenhum ícone é botão e nenhuma ação/configuração dinâmica foi adicionada. O componente `CabecalhoPagina` anterior e os chamadores de páginas reais foram preservados.
- Bulma consultado: a documentação de [Columns](https://bulma.io/documentation/columns/basics/) indica colunas iguais e a documentação de [alinhamento vertical](https://bulma.io/documentation/columns/options/) confirma `is-vcentered`; `is-mobile` mantém a fileira no viewport móvel e `is-gapless` remove os intervalos entre as três regiões. Essa estrutura simétrica mantém a região esquerda constante e inicia o título na mesma posição. O `level` oferece `level-left` e `level-right`; seus itens centralizados são centrados, portanto não atende tão diretamente ao título alinhado à esquerda em sua própria região. A documentação de [ícones](https://bulma.io/documentation/elements/icon/) recomenda o wrapper `icon` como caixa quadrada estável, utilizado em torno dos ícones Font Awesome existentes no projeto.
- CSS isolado do novo componente fixa o cabeçalho acima do conteúdo, aplica fundo/texto/borda pelos tokens existentes e limita a elipse do título; `Lab.razor.css` compensa a altura fixa para o conteúdo não ficar coberto.
- Validação: `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore` passou com 0 avisos e 0 erros. Avaliação visual e funcional do operador: aguardando.
- Execução do Lab: após a criação dos novos arquivos, `dotnet watch` encerrou com erro interno de Hot Reload. Nas tentativas de reinício, o build passou, mas o watcher falhou ao consultar `https://api.nuget.org/v3-index/repository-signatures/5.0.0/index.json` (`NU1301`); não há servidor ativo confirmado neste momento. A avaliação visual fica pendente até recuperar o acesso do watcher. Não foi criado workaround permanente nem alterada configuração de NuGet.
- Próximo passo: operador avaliar as três alternativas visuais assim que `/lab` puder ser servido e indicar ajustes ou autorizar a etapa seguinte.

### Ajuste solicitado pelo operador — largura e posição do seletor de tema

- Solicitação: alinhar a largura máxima do cabeçalho à página; manter o conteúdo rolável; fixar o seletor de tema em uma faixa imediatamente abaixo do cabeçalho; aplicar a mesma largura máxima a ambos.
- Implementado: `CabecalhoPaginaLab` e a faixa do seletor usam `container is-max-desktop`, centralizados e limitados ao mesmo max-width do conteúdo do Lab. O seletor saiu do fluxo de rolagem e deixou de usar um cálculo lateral independente; fica fixo logo abaixo do cabeçalho. O conteúdo começa após as duas faixas e segue rolável.
- Bulma consultado: [Container](https://bulma.io/documentation/layout/container/) documenta `container is-max-desktop` com máximo de 960px nos viewports desktop e largura fluida abaixo desse breakpoint. A página e ambas as faixas agora usam a mesma convenção e padding horizontal.
- Validação: após `dotnet restore ... --ignore-failed-sources -p:NuGetAudit=false`, `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore` passou com 0 avisos e 0 erros. Não fiz inspeção visual; cabe ao operador confirmar o alinhamento no navegador.
- Execução: `localhost:5193` não respondeu durante a verificação. As tentativas anteriores de manter `dotnet watch` ainda estão bloqueadas pela consulta ao serviço de assinaturas NuGet (`NU1301`); build explícito passa quando a restauração é feita com a auditoria NuGet desabilitada.

### Atualização de continuidade — recuperação do `dotnet watch`

- O operador relatou a janela do Windows `dotnet.exe - Erro de Aplicativo`, exceção `0xe0434352`, e diagnósticos em cascata do VS Code indicando ausência de `Microsoft.AspNetCore` e componentes Razor desconhecidos em `Lab.razor`.
- Diagnóstico do processo: as portas `5193` e `5194` já estavam ocupadas por processos `dotnet`; não foi possível ler a linha de comando desses processos por restrição de acesso do Windows, portanto eles não foram encerrados. Ao falhar o bind, o processo do DevServer também falhou ao escrever no Event Log por acesso negado, gerando a exceção mostrada. Isso não foi uma falha de compilação do componente.
- Estado recuperado: `dotnet watch --project src/Rememore.Client run --no-launch-profile --urls http://localhost:5195` está ativo. Build explícito passou com 0 avisos e 0 erros; `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`.
- Os erros visuais do editor não foram reproduzidos na compilação de linha de comando. Provável diagnóstico desatualizado/falha de carregamento do projeto no servidor C#/Razor do VS Code; a confirmação cabe após recarregar a janela e deixar o workspace reabrir a solução. Se persistirem, coletar as mensagens do Output de C# Dev Kit/Razor.
### Ajuste visual solicitado — título e cores dos ícones

- Solicitação do operador: eliminar o corte da fonte do título, alinhá-lo à esquerda, testar danger 85 no ícone de saída, info no ícone de livro, primary no voltar; aumentar um pouco o ícone de saída e manter o voltar no tamanho atual.
- Implementado em `CabecalhoPaginaLab.razor`: título com `has-text-left`; livro com `has-text-info`; voltar com `has-text-primary`; saída com `has-text-danger-85` e `fa-lg`. Removidos `overflow: hidden` e reticências do título e ajustado seu `line-height` para evitar corte visual.
- Bulma oficial consultado: [ícones](https://bulma.io/documentation/elements/icon/) indica que o ícone Font Awesome herda o tamanho e pode usar classes de tamanho; [paletas](https://bulma.io/documentation/features/color-palettes/) documenta os tons por incremento de 5 e os helpers, incluindo `danger-85`; [cores](https://bulma.io/documentation/helpers/color-helpers/) confirma helpers `has-text-*`. A classe `has-text-danger-85` também foi confirmada no Bulma distribuído no projeto.
- Validação: `dotnet watch` ativo em `http://localhost:5195`; Hot Reload aplicou alterações Razor e CSS. Avaliação visual cabe ao operador.
### Reorganização solicitada pelo operador — nomes e localização

- Solicitação: renomear o cabeçalho anterior com sufixo `_old` e colocar o novo `CabecalhoPagina` diretamente na raiz de `Componentes`.
- Implementado: o componente anterior está em `Componentes/CabecalhoPagina_old.razor`; o novo está em `Componentes/CabecalhoPagina.razor`, com CSS isolado `Componentes/CabecalhoPagina.razor.css`. O `/lab` renderiza o novo `CabecalhoPagina`. Os chamadores existentes de páginas e componentes do produto passaram a usar explicitamente `CabecalhoPagina_old`, preservando o comportamento antigo e sem integrar o novo componente às páginas reais.
- Validação: `dotnet watch` reiniciado para aplicar a alteração de nome/localização; compilação concluída com êxito e `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. O watcher permanece aguardando alterações.
- Avaliação visual: pendente com o operador.
### Ajuste solicitado — alinhamento com helpers Bulma e retorno oculto

- Verificação da documentação oficial: Bulma oferece `is-flex`, `is-align-items-center`, `is-flex-grow-1`, `is-vcentered`, `has-text-right`, `is-invisible` e espaçamento `mr-2`, suficientes para compor/alinha as três regiões sem regras CSS próprias de flexbox.
- Aplicado no novo `CabecalhoPagina`: a faixa usa flex helpers do Bulma; as três regiões continuam em `columns`; a região esquerda usa `is-flex is-align-items-center`; a distância entre os ícones usa `mr-2`; o voltar fica visualmente oculto por `is-invisible`, mantendo sua caixa reservada.
- Removidos do CSS isolado os alinhamentos `display:flex`, `align-items`, `gap`, além de margem/padding de colunas já tratados por `is-gapless` e a altura mínima da linha, centralizada pelo helper do Bulma. Permanecem CSS próprio para posição fixa, altura/padding e acabamento visual do cabeçalho, além de `min-width:0` para permitir que colunas encolham.
- Validação: Hot Reload aplicou Razor e CSS; `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. A avaliação visual cabe ao operador.
- Referências: [flexbox helpers](https://bulma.io/documentation/helpers/flexbox-helpers/), [spacing helpers](https://bulma.io/documentation/helpers/spacing-helpers/), [column options](https://bulma.io/documentation/columns/options/) e [visibility helpers](https://bulma.io/documentation/helpers/visibility-helpers/).
### Ajuste de proporções da linha do cabeçalho

- Solicitação: região do título mais larga, alinhada à esquerda; regiões laterais dos cantos com larguras iguais.
- Implementado com as classes Bulma `is-3`, `is-6`, `is-3` nas colunas esquerda, central e direita, respectivamente. As laterais ocupam 25% cada e o centro 50%; o ícone de retorno permanece oculto nesta prévia.
- A documentação oficial de [tamanhos de colunas](https://bulma.io/documentation/columns/sizes/) confirma a grade de 12 colunas e os modificadores `is-3`/`is-6`.
- Validação: Hot Reload aplicou a alteração; `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`.
### Alinhamento dos ícones com o conteúdo do Lab

- O operador informou que aplicou `ml-4` ao ícone do livro para alinhá-lo à borda esquerda do conteúdo e que retorno/saída também devem acompanhar as bordas.
- Para evitar margens independentes em cada ícone, a linha do cabeçalho agora é envolvida por `div.section.py-2`. O `section` usa o mesmo padding horizontal Bulma do `<main class="... section">` do Lab: 1,5rem em viewports menores e 3rem em desktop; `py-2` limita apenas o padding vertical. Removido `ml-4` do ícone. Assim, as caixas dos ícones nas duas extremidades alinham às bordas internas do conteúdo e a região central permanece entre elas.
- CSS isolado deixou de definir o padding horizontal do cabeçalho; continua responsável pelo posicionamento fixo e acabamento. Bulma consultado: [container](https://bulma.io/documentation/layout/container/), [section](https://bulma.io/documentation/layout/section/) e [spacing helpers](https://bulma.io/documentation/helpers/spacing-helpers/).
- Validação: Hot Reload aplicou o markup e `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. Avaliação visual do operador pendente.
### Ajuste de alinhamento informado pelo operador

- Observação: no teste visual, ícone esquerdo aparecia recuado; ícone de saída e seletor de tema avançavam além das bordas do conteúdo. A borda inferior do cabeçalho pode ultrapassar a largura do conteúdo.
- Ajuste: o cabeçalho agora é uma faixa fixa de largura total (borda inferior full-width) com conteúdo interno em `container is-max-desktop section py-2`, igual ao `<main>` em largura e recuos responsivos. A faixa do tema passou a usar um shell fixo full-width e o mesmo container/section interno, alinhando o seletor à borda direita do conteúdo. Mantida a proporção `1-10-1` editada pelo operador.
- Bulma documenta o max-width e comportamento responsivo de `container is-max-desktop` e os paddings responsivos de `section`; reaproveitada a mesma combinação do conteúdo para os dois controles fixos.
- Validação: Hot Reload aplicou Razor e CSS; `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. Avaliação visual cabe ao operador.
### Ajuste de alinhamento e espaçamento — solicitação do operador

- Pedido: manter o conteúdo do cabeçalho alinhado à largura máxima da página, permitir que somente a borda inferior ultrapasse essa largura e equilibrar as margens superior e inferior do controle de tema.
- Implementado no novo `CabecalhoPagina`: o próprio cabeçalho usa `container is-max-desktop`, centralizado por CSS para continuar fixo; `::after` desenha apenas a borda inferior com `100vw`. O miolo conserva `section py-2`, igual ao contêiner do seletor e ao conteúdo do Lab.
- No seletor de tema do Lab, `mb-0` neutraliza a margem inferior do grupo Bulma `buttons`; o wrapper mantém `py-2` para espaçamento vertical igual acima e abaixo.
- Referências oficiais Bulma: [container](https://bulma.io/documentation/layout/container/), [section](https://bulma.io/documentation/layout/section/), [spacing helpers](https://bulma.io/documentation/helpers/spacing-helpers/) e [buttons](https://bulma.io/documentation/elements/button/).
- Validação: `dotnet watch` aplicou as alterações e `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. A avaliação visual permanece com o operador.
### Funcionalização inicial do CMP-027 — opções e retorno ao chamador

- Solicitação do operador: o chamador informa título obrigatório; seleciona retorno ou ícone esquerdo e pode informar o ícone; controla a visibilidade de saída; recebe os acionamentos de retorno e saída para decidir o que fazer. O bloco CMP-027 no Lab deve configurar o exemplo e expor os retornos.
- `CabecalhoPagina.razor` agora recebe `Titulo` (`EditorRequired`), `MostrarVoltar`, `IconeEsquerdo` (classe Font Awesome, padrão `fa-book-open`) e `MostrarSair`; expõe `EventCallback` `AoRetornar` e `AoSair`. A área esquerda como ícone é somente visual; como retorno e na saída são botões sem navegação/encerramento próprios. O título é fornecido ao `h1`.
- O `/lab` mantém uma única instância fixa do cabeçalho na página. O `BlocoLab` CMP-027 altera seu título, modo/ícone esquerdo e visibilidade da saída. Os callbacks só incrementam contadores/mostram confirmação textual no bloco, demonstrando que o chamador recebeu a ação.
- A composição existente foi preservada, incluindo colunas 1–10–1 e alinhamentos Bulma ajustados pelo operador. Não foi necessária nova regra CSS de alinhamento.
- Bulma oficial consultado para os campos do bloco: [input](https://bulma.io/documentation/form/input/), [select](https://bulma.io/documentation/form/select/), [checkbox](https://bulma.io/documentation/form/checkbox/), [button](https://bulma.io/documentation/elements/button/) e [icon](https://bulma.io/documentation/elements/icon/).
- Validação: `dotnet build src/Rememore.Client --no-restore` passou com 0 avisos e 0 erros. `dotnet watch` foi reiniciado e `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. Testes visuais e de interação ficam com o operador.
### Ajustes solicitados após validação das funcionalidades

- Solicitação do operador: impedir seleção do título; remover sublinhado dos ícones acionáveis; evitar que o tamanho/posição varie ao alternar entre ícone e voltar.
- O título recebeu o helper Bulma `is-unselectable`.
- Os botões de voltar e sair deixaram de usar as classes visuais `button is-ghost`. A documentação oficial mostra que o botão ghost aplica sublinhado no hover; sem essa classe, os botões semânticos usam os helpers flex do Bulma, preservam as cores e não ganham esse sublinhado.
- A caixa do voltar agora usa o mesmo wrapper `icon is-size-4 p-1` do ícone passivo. Assim, o botão não adiciona altura ou padding diferente quando alterna o modo esquerdo.
- Referências oficiais Bulma: [button](https://bulma.io/documentation/elements/button/) (inclui o modificador ghost), [icon](https://bulma.io/documentation/elements/icon/) e [other helpers](https://bulma.io/documentation/helpers/other-helpers/) (`is-unselectable`).
- Validação: compilação sem avisos/erros; `dotnet watch` aplicou Razor e `/lab` respondeu HTTP 200. Avaliação visual cabe ao operador.
### Efeito de sombra/fade abaixo do cabeçalho

- Solicitação do operador: acrescentar uma sombra sutil abaixo do cabeçalho, usando a cor de fundo do tema claro/escuro, para que o conteúdo pareça passar sob o cabeçalho durante a rolagem.
- Implementado em `CabecalhoPagina.razor.css` com `::after` posicionado logo abaixo do cabeçalho, em degradê vertical de `var(--cor-background)` para transparente. O pseudo-elemento não captura interação e acompanha a largura do container do cabeçalho.
- Bulma não oferece helper para esse fade sobre conteúdo rolável; o efeito ficou isolado no CSS do componente, sem modificar seus alinhamentos.
- Validação: `dotnet build src/Rememore.Client --no-restore` passou com 0 avisos e 0 erros. O `dotnet run` foi reiniciado em `http://localhost:5195/lab`; página respondeu HTTP 200. Avaliação visual cabe ao operador.
### Refinamento do efeito abaixo do cabeçalho

- O operador observou que o degradê parecia uma faixa opaca e solicitou uma sombra real, em vez de um `linear-gradient`.
- Removido o pseudo-elemento com degradê e aplicado `box-shadow` abaixo do cabeçalho: `0 0.4rem 0.7rem -0.15rem var(--cor-background)`. A cor segue a variável do fundo vigente em temas claro e escuro; a sombra aparece sobre componentes rolando sob o cabeçalho.
- Validação: build passou com 0 avisos e 0 erros; `dotnet run` reiniciado; `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`. Avaliação visual do operador pendente.
## Parecer final — CMP-027 — Cabeçalho de Página

- **Estado:** o operador declarou o componente concluído após avaliação visual e funcional no `/lab`.
- **Componente:** `src/Rememore.Client/Componentes/CabecalhoPagina.razor`, com CSS isolado em `CabecalhoPagina.razor.css`. O chamador fornece `Titulo` obrigatório, `MostrarVoltar`, `IconeEsquerdo` (classe Font Awesome, com `fa-book-open` como padrão) e `MostrarSair`; recebe `AoRetornar` e `AoSair` como `EventCallback`. O título é um `h1` não selecionável. A região esquerda mostra o ícone fornecido ou `chevron-left`; a ação de retorno e a ação de saída apenas comunicam o acionamento ao chamador, sem navegação, encerramento de sessão ou confirmação próprios.
- **Apresentação validada:** cabeçalho fixo no topo do `/lab`; colunas Bulma na proporção 1–10–1 e largura máxima compartilhada com o conteúdo. A borda inferior e a sombra foram ajustadas iterativamente pelo operador. O valor final da sombra é `0 0.6rem 0.4rem -0.5rem var(--cor-background)`, acompanhando o tema. As escolhas finais de alinhamento e espaçamento foram mantidas conforme os ajustes do operador.
- **Demonstração:** o bloco `CMP-027 — Cabeçalho de Página` configura o título, a opção de retorno ou ícone, a classe do ícone e a visibilidade de saída. O chamador da demonstração registra os eventos recebidos para que possam ser conferidos no bloco; o cabeçalho permanece fixo fora dele.
- **Foco:** o contorno ocasional ao redor do título não é seleção. `App.razor` usa `FocusOnNavigate` com `Selector="h1"`; após navegações, o navegador pode focar programaticamente o título e mostrar seu outline padrão. Esse indicador global foi preservado para não remover a sinalização visual de foco.
- **Validação:** a compilação do cliente passou com 0 avisos e 0 erros. Durante as etapas, `/lab` respondeu HTTP 200 em `http://localhost:5195/lab`; o operador realizou a validação visual e funcional e confirmou a conclusão. O controle mais recente do `watch` ficou com o operador.
- **Limites e pendências:** o novo cabeçalho permanece demonstrado apenas no `/lab`; páginas reais continuam usando `CabecalhoPagina_old`. A integração às páginas do produto e a retirada do componente antigo não fizeram parte desta unidade. Não há outras pendências de implementação declaradas.