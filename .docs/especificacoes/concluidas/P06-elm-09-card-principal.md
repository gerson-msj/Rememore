# Especificação operacional — ELM-09 Card Principal

Rememore / Stack2 (.NET 10, Blazor WebAssembly, Bulma) — 26/10/2026.

**Estado:** escopo e orientação visual aprovados pelo operador em 26/10/2026. Implementação limitada ao `/Lab`, aos estilos compartilhados do ELM e à migração da fonte visual já existente em `/principal`; não alterar comportamento da página.

## 1. Objetivo e fronteiras

Catalogar como **ELM-09 — Card Principal** o padrão de card de jornada já apresentado em `Pages/Principal.razor`, para que o mesmo padrão visual possa ser reutilizado e demonstrado no `/Lab`.

Orientação aprovada pelo operador: “Faça esse elemento exatamente como está apresentado em /principal, porém, com seus estilos css em elementos.css.” A composição, tipografia, espaçamentos, cores, dimensões mínimas, estados, elevação e movimento devem preservar a apresentação atual de `/principal`.

Não alterar títulos, descrições, disponibilidade, rotas, `aria-haspopup`, callbacks, navegação, popup, grade da página ou regras funcionais. O CSS que organiza a grade da página permanece em `Principal.razor.css`; somente o estilo visual pertencente ao card migra para `wwwroot/css/elementos.css`. Não criar CMP Razor nem JavaScript para este padrão.

## 2. Referência HTML/Bulma e estrutura

A referência local é a marcação existente em `Pages/Principal.razor`: botão semântico com classe Bulma `card`, contendo `card-content`, ícone `icon is-large` e grupos de título, descrição e mensagem opcional de indisponibilidade. Preservar essa estrutura no consumidor `/principal`; aplicar classes estáveis `elemento-card-principal` e `elemento-card-principal__*` para que o Lab use a mesma marcação/classes de produção.

A documentação oficial do Bulma descreve `card` como contêiner e `card-content` como sua região principal de conteúdo: https://bulma.io/documentation/components/card/. O elemento raiz interativo continua sendo o `button` já usado por `/principal`, com o `card` do Bulma aplicado a ele.

## 3. Estilos compartilhados e aparência

Migrar para `elementos.css`, sem recalibrar os valores visuais, as regras atuais de `.principal-jornada` e seus elementos de conteúdo, ícone, texto, título, descrição, mensagem de disponibilidade, hover, foco e movimento reduzido. A nova nomenclatura deve ficar sob `.elemento-card-principal`.

Manter a grade `.principal-jornadas__grade`, o breakpoint e demais regras de disposição próprias de `/principal` em `Principal.razor.css`. O CSS isolado do catálogo pode organizar a disposição dos exemplos ELM-09, mas não pode redefinir a aparência dos cards.

## 4. Demonstração no `/Lab`

Adicionar seção numerada ELM-09 dentro do bloco existente “Elementos HTML”. Mostrar as quatro jornadas atuais (`Capturar`, `Encontrar Memórias`, `Rever um Dia` e `Rememorar`), com ícones, títulos, descrições e textos opcionais de disponibilidade iguais aos dados definidos em `Principal.razor`.

A demonstração usa as mesmas classes e CSS de produção, sem navegar, abrir popup ou alterar estado real. Ela serve como referência visual e não cria um contrato de interação próprio.

## 5. Validações e aceite

- Build da solução e `git diff --check`.
- Confirmar que as regras visuais do card estão em `elementos.css` e não duplicadas em CSS isolado do Lab ou da página.
- Comparar o card de `/principal` antes/depois: visual e comportamento do consumidor permanecem iguais; somente a origem das regras e as classes de estilo mudam.
- Inspecionar ELM-09 no `/Lab` em tema claro/escuro/sistema e largura estreita, incluindo quebra de texto, foco por teclado, hover e `prefers-reduced-motion`.
- Parar com a demonstração disponível no `/Lab` para validação visual/funcional do operador; o aceite do operador permanece independente do build.

## Continuidade operacional

**Abertura e aprovação em 26/10/2026:** o operador definiu o novo padrão como “elemento 09 — Card Principal” e aprovou como referência exata o card exibido em `/principal`, solicitando que seus estilos CSS pertençam a `elementos.css`.

**Implementação em 26/10/2026:** a classe `elemento-card-principal` e os estilos do card foram transferidos para `wwwroot/css/elementos.css`. `Pages/Principal.razor` passou a usar as classes estáveis do ELM, preservando textos, estado de disponibilidade, `aria-haspopup`, callback, navegação e popup. A grade da página permaneceu em `Principal.razor.css`. O catálogo “Elementos HTML” recebeu quatro cards com a mesma marcação/classes, ícones e conteúdo das jornadas atuais; o CSS isolado do catálogo cuida apenas da disposição da amostra.

**Ajuste solicitado pelo operador em 26/10/2026 — demonstração:** reduzir os quatro cards a uma única amostra com ícone e somente dois textos: título no estilo mais forte e texto no estilo mais fraco. Usar conteúdo fictício; o objetivo é demonstrar a hierarquia tipográfica do ELM e manter os estilos de produção em `elementos.css`. A classe visual e a apresentação de `/principal` não mudam.

**Atualização da demonstração:** a seção ELM-09 agora mostra um card com ícone Font Awesome `fa-lightbulb`, título “Ideias para guardar” e texto de disponibilidade “Disponível para receber novas lembranças.”. O título usa `elemento-card-principal__titulo` e o texto secundário usa `elemento-card-principal__disponibilidade`; não há texto descritivo intermediário nem grade exclusiva do catálogo.

**Verificação do ajuste:** após reconstruir e atualizar a prévia `/Lab`, o navegador confirmou um único card, ícone `fa-lightbulb` e exatamente os dois textos indicados; não há texto descritivo intermediário. O build de `Rememore.slnx` passou com 0 avisos/erros e `git diff --check` passou. A amostra atualizada permanece aberta para validação do operador.

**Validação técnica e inspeção em 26/10/2026:** `dotnet build Rememore.slnx` passou com 0 avisos/erros; `git diff --check` passou. No navegador, ELM-09 apareceu no `/Lab` em tema claro e viewport desktop. A comparação dos estilos computados entre o primeiro card de `/principal` e o exemplo confirmou os mesmos valores para display flex, altura mínima 160 px, raio 14,4 px, fundo branco, sombra, transição de 160 ms, padding do conteúdo 28 px, gap 18,4 px e ícone de 48 px na cor `rgb(27, 88, 121)`. A prévia atualizada está em `http://localhost:5193/lab`. Tema escuro, viewport móvel, teclado/hover e emulação ativa de movimento reduzido não foram conferidos nesta rodada.

**Estado:** encerrada por solicitação do operador em 26/10/2026. ELM-09 validado no `/Lab`; parecer final registrado abaixo.

## Parecer final

O parecer final desta unidade foi consolidado junto ao de P06-lab em [P06-lab.md](P06-lab.md), sob o título “Parecer final — Referências visuais da P06 (P06-lab e ELM-09)”. Esse parecer único abrange os escopos, decisões finais, aceites, evidências e limitações das duas especificações.
