# Memória técnica

Este documento reúne informações sobre o projeto, seus recursos e as ferramentas compartilhadas disponíveis. Seu objetivo é permitir que o agente conheça esses recursos sem precisar ler o código. O operador define todo o material registrado aqui.

## Organização e desenvolvimento

- `src` está dividida em `api`, `web` e `shared`.
- O desenvolvimento começa pela aplicação web, com React.
- Os contratos de dados serão definidos ao longo do desenvolvimento e ficarão em `shared`.
- Inicialmente, os dados serão armazenados por implementações fake, possivelmente usando IndexedDB.
- Após a conclusão da parte web, ela servirá de base para definir o que a API deverá fornecer. As implementações fake serão descartadas gradualmente.
- Haverá também armazenamento local definitivo.

## Estilos da aplicação web

- O projeto não utiliza framework CSS. Os estilos são organizados, nesta ordem de precedência: `global`, `elementos`, `componentes`, `componente`, `paginas` e `pagina`.
- Cada camada posterior pode redefinir estilos de qualquer camada anterior, mas essa possibilidade só deve ser usada quando necessária e autorizada pelo operador. Assim, uma página pode fazer um ajuste local sem criar um estilo mais abrangente para um caso de uso único.
- Cada página ou componente mantém seus estilos em um arquivo CSS próprio.
- Enquanto o problema de CSS Modules no Bun não for resolvido, use arquivos `.css` comuns importados por efeito colateral. Nas camadas `componente` e `pagina`, limite os estilos à classe raiz própria do componente ou página, inclusive regras para elementos HTML. As camadas compartilhadas `global`, `elementos`, `componentes` e `paginas` não exigem esse isolamento.
- Estilos compartilhados entre componentes ficam nas camadas `componentes` e `paginas`; por sua posição, podem modificar estilos das camadas anteriores.
- Elementos HTML simples são estilizados na camada `elementos`, para uso consistente em páginas e componentes.
- Ao reproduzir uma variação de elemento do Laboratório, consulte seu JSX e os estilos compartilhados. O comentário da variação indica o início do bloco reutilizável: reproduza sua estrutura desde o contêiner indicado, incluindo os filhos e as classes necessários. Títulos de variação e controles da bancada pertencem somente ao Laboratório. Adapte conteúdo, identificadores, destino de links e propriedades ao uso real.
- Cada página define a disposição horizontal e vertical de seus elementos e componentes, usando `grid` ou `flex` conforme o layout. Entre blocos irmãos na direção vertical, use `var(--padding-padrao)` (16px) como espaçamento padrão. A divisão em colunas e o espaçamento horizontal são definidos pela página conforme sua composição. Esta regra trata apenas da composição da página; os espaçamentos internos de elementos e componentes são definidos por eles próprios, conforme a estrutura e os estilos de cada um.
- Quando uma composição necessária à página não corresponder a um elemento ou componente existente, a página pode definir sua estrutura e seus estilos localmente, respeitando a especificação e reutilizando os estilos compartilhados aplicáveis. Essa composição permanece própria da página. Sua promoção a elemento, componente ou estilo compartilhado depende de decisão posterior do operador.
- A camada `global` reúne estilos aplicáveis à aplicação inteira.
- O projeto utiliza o pacote gratuito de ícones do Font Awesome 7.
- Os temas `light` e `dark` ficam em `src/web/styles/themes`, na camada `global`, e definem as variáveis de cor de fundo e texto. O tema é selecionado pelo atributo `data-theme` no elemento `<html>`; por enquanto, o HTML inicia com `light`.
- A definição de temas será expandida futuramente com alternância por componente, contexto e provider, incluindo as opções `system`, `light` e `dark`.

## Serviço de armazenamento

- O serviço de `localStorage` da aplicação web está em `src/web/services/storage.ts`.

## Convenção de nomes

- Prefira português brasileiro, com identificadores ASCII e convenções usuais da linguagem, para nomes autorais internos ao projeto, como arquivos, classes, métodos e variáveis.
- Use inglês quando exigido pela estrutura organizacional, por padrões de React, TypeScript, sistema ou ambiente. Preserve a grafia original de APIs, bibliotecas, atributos, rotas e contratos externos.
