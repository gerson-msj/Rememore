# CMP-006 — Seletor de Categoria
## Reconstrução na Stack .NET 10 — Laboratório

### 1. Objetivo

Reconstruir o **CMP-006 — Seletor de Categoria** na Stack .NET 10 / Blazor WebAssembly, utilizando o novo laboratório `/lab` como ambiente exclusivo de desenvolvimento e validação.

O componente permite visualizar as categorias associadas a uma memória, removê-las quando permitido e abrir uma janela dedicada para pesquisar, selecionar ou criar categorias.

A reconstrução deve partir diretamente da **última versão funcional aprovada na Stack1**, incorporando as evoluções consolidadas posteriormente à sua implementação inicial.

Não é necessário reproduzir as etapas históricas de evolução do componente nem seu código ou aparência anteriores.

### 2. Método de construção

Seguir o procedimento aprovado no documento `05.00 — Guia da Especificação`.

A construção deve ocorrer em três checkpoints independentes:

**Checkpoint 1 — Estrutura**

- Criar um bloco próprio no `/lab`.
- Preparar os controles de configuração e cenários demonstrativos.
- Construir o HTML semântico básico do seletor e de seu popup.
- Utilizar inicialmente os recursos nativos do Bulma.
- Não criar CSS autoral preventivo.
- Não implementar ainda as funcionalidades definitivas.
- Apresentar a estrutura ao operador para validação.

**Checkpoint 2 — Formatação visual**

Após o aceite da estrutura:

- Ajustar dimensões, espaçamentos, tipografia, alinhamentos e ícones.
- Refinar a apresentação das etiquetas de categorias.
- Ajustar a geometria e responsividade do popup.
- Validar temas claro e escuro, estados visuais e larguras diferentes.
- Utilizar CSS isolado e modular somente quando houver necessidade concreta.
- Trabalhar os ajustes com o operador até obter aprovação visual.

**Checkpoint 3 — Funcionalidades**

Após aprovação visual:

- Implementar interações e estados do componente.
- Implementar pesquisa normalizada e correspondência aproximada.
- Implementar inclusão e remoção por contratos com o chamador.
- Validar abertura, fechamento, seleção, teclado, foco, acessibilidade e cenários alternativos.
- Executar testes funcionais proporcionais à complexidade.
- Obter o aceite final do operador.

**Não avançar automaticamente de um checkpoint para outro.**

### 3. Preservação dos componentes existentes

Antes de reconstruir, verificar os componentes existentes na Stack2.

Se já existir implementação anterior com o mesmo nome:

- Renomear o componente antigo acrescentando o sufixo `_old`.
- Preservar o funcionamento das páginas que ainda o utilizam, ajustando suas referências quando necessário.
- Criar o novo componente mantendo o nome original, sem inventar nova nomenclatura.
- Não substituir componentes em páginas reais neste trabalho.

Esta fase é exclusivamente de construção e validação no `/lab`.

A substituição dos componentes antigos, limpeza de CSS e revisão das páginas ocorrerão posteriormente, página por página, em trabalho próprio.

### 4. Composição do componente

O CMP-006 possui duas superfícies visuais complementares:

1. Região de categorias associadas à memória.
2. Popup dedicado à pesquisa e inclusão de categorias.

A implementação pode separar essas superfícies em componentes Razor internos quando isso favorecer organização e reutilização.

O conjunto deve funcionar como uma única capacidade de interface, sem assumir responsabilidades de persistência ou regras de negócio da página hospedeira.

### 5. Região de categorias associadas

A região apresenta as categorias atualmente associadas à memória.

**Geometria**

- Começa com altura visual para uma linha.
- Expande naturalmente até duas linhas quando necessário.
- A partir disso, mantém a altura máxima e apresenta rolagem interna para o conteúdo excedente.
- O crescimento deve ocorrer apenas quando o conteúdo exigir.
- Não deve provocar expansão ilimitada da tela.

**Etiquetas**

Cada categoria é apresentada como uma pequena etiqueta contendo seu nome.

Quando o contexto permitir edição, a etiqueta apresenta ação de remoção por meio de um controle `X`.

Não existe diferenciação visual entre a primeira categoria e as demais.

Entretanto, deve ser preservada a **ordem de associação**, pois a primeira categoria será utilizada posteriormente como referência principal na apresentação compacta do componente CMP-030 — Memória.

A regra de apresentação dessa categoria no CMP-030 pertence ao próprio componente Memória, não ao CMP-006.

**Nomes longos**

Na região de etiquetas, nomes excessivamente longos devem ser abreviados com reticências.

Utilizar inicialmente 30 caracteres como referência para a abreviação, permitindo ajuste visual com o operador.

O nome original da categoria não deve ser alterado, truncado nos dados ou perdido.

O popup apresenta sempre os nomes completos.

**Estado vazio**

Quando não houver categorias associadas, apresentar uma indicação discreta:

`Adicione uma categoria`

**Ação de adicionar**

Uma ação de adicionar/pesquisar categoria permanece à direita da região de etiquetas.

- Deve estar visualmente integrada à região.
- Pode utilizar ícone sem fundo, conforme a referência funcional vigente.
- Não deve desaparecer durante a rolagem interna das categorias.
- Deve possuir nome acessível.
- Seu acionamento abre o popup de pesquisa.

O aspecto exato será definido com o operador durante o refinamento visual.

### 6. Popup de pesquisa

A pesquisa é realizada em popup próprio, evitando ocupar permanentemente espaço na página hospedeira, que reunirá vários outros componentes.

**Estrutura**

- Janela contextual dedicada.
- Campo de pesquisa.
- Lista de resultados.
- Área visual para aproximadamente cinco resultados simultâneos.
- Rolagem interna quando houver mais resultados.
- Controle explícito de fechamento.
- Apresentação dos nomes completos das categorias.

O popup poderá ocupar grande parte da área útil disponível, particularmente em dispositivos móveis.

Dimensões, margens, posicionamento e comportamento responsivo serão calibrados visualmente com o operador.

O popup não deve apresentar coloração baseada no Tom da memória.

### 7. Pesquisa de categorias

A pesquisa seguirá exatamente a política funcional consolidada, com duas estratégias sucessivas.

#### 7.1 Pesquisa simples normalizada

É sempre a primeira estratégia.

Normalizar os textos de comparação para ignorar:

- Diferenças entre letras maiúsculas e minúsculas.
- Acentuação.
- Espaços externos acidentais.

A pesquisa deve aceitar correspondências parciais, sem exigir igualdade integral entre consulta e nome.

Exemplos:

- `familia` encontra `Família`.
- `TRABALHO` encontra `Trabalho`.
- `via` pode encontrar `Viagens`.

Os resultados são apresentados com a grafia original e ordenados alfabeticamente.

Com o campo vazio, apresentar todas as categorias disponíveis, também em ordem alfabética.

Utilizar pequeno debounce para evitar processamento excessivo durante a digitação.

O tempo exato é decisão técnica, preservando resposta perceptivelmente ágil.

**Enquanto existir pelo menos um resultado simples, não executar nem misturar correspondências aproximadas.**

#### 7.2 Correspondência aproximada

A pesquisa difusa é utilizada exclusivamente quando a pesquisa simples retorna zero resultados.

Nesse momento, a lista passa a apresentar:

1. Na primeira posição, a opção para criar uma categoria utilizando o texto informado pelo usuário.
2. Nas posições seguintes, categorias existentes suficientemente semelhantes à consulta.

Exemplo:

Pesquisa: `famlia`

Resultados:

- `famlia` — Criar nova categoria.
- `Família` — Categoria existente semelhante.

A opção de criação e as sugestões difusas coexistem.

Continuar digitando deve atualizar os resultados sem retirar artificialmente a opção de criação.

Caso nenhuma categoria semelhante seja encontrada, permanece somente a opção de criar a categoria informada.

A existência de sugestões não impede a criação e não provoca correção automática.

A busca difusa deve favorecer correspondências realmente relevantes, evitando sugestões amplas ou sem relação perceptível.

O algoritmo e seu limiar são decisões técnicas, mas sua implementação deve ser reutilizável e desacoplada da interface do CMP-006.

#### 7.3 Equivalência e duplicidade

Uma categoria nova não pode duplicar uma categoria existente considerada equivalente pela normalização definida.

A verificação considera também categorias já associadas, mesmo quando estas estiverem indisponíveis na lista de seleção.

Não permitir criação de nomes vazios ou compostos exclusivamente por espaços.

Preservar a grafia original do nome válido escolhido pelo usuário, aplicando apenas o tratamento necessário aos espaços externos.

### 8. Seleção e remoção

**Categoria disponível**

Ao selecionar uma categoria ainda não associada:

- Fechar o popup.
- Comunicar ao chamador a categoria escolhida.
- Atualizar a apresentação conforme o estado confirmado pelo chamador.

**Categoria já associada**

- Continua aparecendo entre os resultados.
- Apresenta estado visual inequívoco de já associada.
- Não permite nova seleção.
- Não é removida pelo clique na lista de pesquisa.

A remoção pertence exclusivamente à região de etiquetas do seletor.

**Nova categoria**

Ao selecionar a opção de criação:

- Comunicar ao chamador o nome válido informado.
- Fechar o popup.
- Permitir que o chamador realize a associação segundo suas próprias regras.

Essa ação não representa, por si só, criação de uma categoria no servidor.

**Fechamento sem seleção**

O popup pode ser fechado pelo controle explícito ou por interação externa apropriada.

Fechar sem selecionar não altera as associações.

Implementar também comportamento coerente para Escape, foco e demais interações acessíveis.

### 9. Modo somente leitura

O componente deve permitir apresentação em modo somente leitura.

Nesse modo:

- As categorias permanecem visíveis.
- Não existem ações de remoção.
- Não existe ação de adicionar ou pesquisar.
- A apresentação mantém aparência normal de consulta, sem sugerir erro ou indisponibilidade geral da memória.

A decisão de permitir edição pertence ao contexto chamador.

O CMP-006 não calcula prazos nem determina a autorização de uma memória.

### 10. Contrato com a página hospedeira

O CMP-006 deve permanecer reutilizável e não assumir responsabilidades que pertencem à Categorização ou aos serviços do produto.

**Responsabilidades do CMP-006**

- Apresentar categorias associadas.
- Apresentar a ação de adicionar.
- Abrir e fechar o popup.
- Exibir o catálogo recebido.
- Realizar pesquisa simples e difusa utilizando utilitários reutilizáveis.
- Mostrar categorias já associadas como indisponíveis.
- Comunicar pedidos de inclusão, criação e remoção.
- Respeitar o modo editável ou somente leitura recebido.
- Fornecer os estados visuais e interativos adequados.

**Responsabilidades do chamador e dos serviços externos**

- Fornecer catálogo e categorias associadas.
- Determinar se a memória pode ser editada.
- Decidir sobre associações e existência local de categorias.
- Persistir alterações no IndexedDB.
- Gerenciar pendências e falhas de gravação.
- Sincronizar o catálogo preservado e seu versionamento.
- Aplicar as regras de existência das categorias locais.
- Resolver identidades e categorias canônicas no momento apropriado.
- Determinar qualquer regra de preservação remota.

Na integração futura, inclusões e remoções efetivas deverão seguir a persistência local imediata já aprovada na Funcionalização, sem botão Salvar/Cancelar na Categorização.

O componente não deve afirmar que uma operação foi concluída antes da confirmação correspondente.

**Neste trabalho de LAB não implementar persistência real, sincronização ou integração com o workspace.**

Utilizar estados demonstrativos controlados pelo próprio laboratório ou por um hospedeiro de testes simples, sem acrescentar lógica de negócio ao componente.

### 11. Cenários obrigatórios no LAB

O bloco demonstrativo deve permitir avaliar, proporcionalmente a cada checkpoint:

- Nenhuma categoria associada.
- Uma categoria associada.
- Duas categorias associadas.
- Muitas categorias, ultrapassando duas linhas.
- Nomes curtos e longos.
- Popup com pesquisa vazia.
- Popup com vários resultados.
- Categoria já associada na pesquisa.
- Pesquisa simples normalizada.
- Pesquisa difusa com sugestões.
- Pesquisa difusa sem sugestões.
- Criação de nova categoria.
- Inclusão e remoção demonstrativas.
- Modo somente leitura.
- Temas claro e escuro.
- Apresentação em largura estreita.

Os cenários devem usar dados fictícios, previsíveis e independentes de IndexedDB e backend.

### 12. Acessibilidade e qualidade

Durante o refinamento e a funcionalização, considerar:

- HTML semântico e controles nativos adequados.
- Nomes acessíveis para adicionar, remover e fechar.
- Operação por teclado.
- Foco visível e restauração de foco após fechar o popup.
- Distinção acessível de categorias já associadas.
- Leitura dos nomes completos independentemente da abreviação visual.
- Responsividade.
- Temas claro e escuro.
- Respeito às preferências de movimento reduzido.
- Preservação dos estados nativos do Bulma quando forem suficientes.

Evitar CSS redundante, alterações preventivas e complexidade técnica desnecessária.

### 13. Limites da reconstrução

Não realizar nesta tarefa:

- Integração do CMP-006 em páginas reais.
- Reformulação da tela Categorização.
- Alterações no CMP-030 — Memória.
- Implementação de Tom ou balanço sentimental.
- Persistência real das associações.
- Alterações de schema IndexedDB.
- Sincronização remota de categorias.
- Implementação de backend.
- Exclusão de componentes antigos ainda utilizados.
- Refatoração geral do projeto.
- Criação de nova Especificação funcional numerada.

O escopo é exclusivamente a reconstrução visual e interativa do CMP-006 no `/lab`, de acordo com a versão funcional consolidada.

### 14. Registro e encerramento

Criar ou atualizar o Markdown operacional correspondente, preservando checkpoints, observações, decisões do operador e verificações efetuadas.

Ao término de cada checkpoint, registrar o resultado e aguardar a validação do operador antes de prosseguir.

No encerramento final, fornecer um parecer resumindo:

- Componentes e arquivos criados ou alterados.
- Estados e comportamentos implementados.
- Resultados das verificações.
- Ajustes solicitados e aprovados pelo operador.
- Limites da implementação.
- Pendências para a futura integração às páginas.

**Iniciar agora exclusivamente pelo Checkpoint 1 — criação do bloco no `/lab` e estrutura básica HTML/Bulma do seletor e do popup.**

Não antecipar CSS refinado ou funcionalidade definitiva antes da avaliação da estrutura.
---

## Plano, checkpoints e estado operacional

### Plano aprovado

Implementar a reconstrução do CMP-006 exclusivamente no `/lab`, seguindo os três checkpoints independentes do corpo aprovado. Não integrar em páginas reais nem adicionar persistência, sincronização ou backend.

### Checkpoints

| Checkpoint | Estado | Critério para avançar |
|---|---|---|
| 1 — Estrutura | Aceito pelo operador em 2026-10-19 | O operador instruiu o início das formatações do Checkpoint 2 após revisar a estrutura. |
| 2 — Formatação visual | Aceito pelo operador em 2026-10-19 | Seletor e popup revisados e aprovados; ajustes compartilhados do CMP-028 também aprovados. |
| 3 — Funcionalidades | Aceito pelo operador em 2026-10-19 | Contratos, busca, seleção, remoção, fechamento, acessibilidade e cenários demonstrativos estão disponíveis no `/lab`; validações registradas abaixo. |

### Plano do Checkpoint 3

1. Definir parâmetros e callbacks controlados pelo chamador para catálogo, associações, pedidos de inclusão/criação/remoção e estado do popup.
2. Extrair a normalização e a correspondência aproximada para utilitário reutilizável; aplicar busca simples primeiro, ordenação alfabética e debounce.
3. Funcionalizar resultados, indicação de item associado, opção de criação, fechamento por backdrop/Escape e foco de entrada/restauração, mantendo o popup sem botão X nem botão textual de fechamento, conforme decisão posterior do operador.
4. Tornar a demonstração do `/lab` um hospedeiro simples com dados fictícios e respostas controladas para exercitar inclusão, criação e remoção sem persistência.
5. Compilar e conferir no navegador os cenários previstos, incluindo pesquisa normalizada/difusa, duplicidade, somente leitura, teclado, foco, tema e largura estreita; registrar resultados e pendências.

### Continuidade

- 2026-10-19 — Especificação recebida como texto colado e registrada integralmente acima. Entendimento comunicado: iniciar apenas pelo Checkpoint 1, sem funcionalidade definitiva ou CSS refinado. Nenhuma dúvida funcional impede esse checkpoint.
- Estado inicial observado antes de editar: branch `develop`, sem alterações listadas por `git status --short`; não havia Markdown operacional CMP-006 na pasta de especificações.
- Consulta oficial ao Bulma realizada para [tags](https://bulma.io/documentation/elements/tag/), [formulários](https://bulma.io/documentation/form/general/) e [modal](https://bulma.io/documentation/components/modal/). O padrão observado usa `tag` com `delete` para etiquetas, `field`/`control` com `label`/`input` para controles de formulário e `modal` com `modal-background` e `modal-card` (cabeçalho/corpo/rodapé quando aplicável). Bulma fornece estrutura e estilos, não JavaScript.
- A busca na Stack2 não encontrou implementação existente de `SeletorCategoria`; nenhum componente antigo precisou ser renomeado nem teve usos reais alterados. A consulta histórica ficou restrita à marcação do seletor e ao popup da Stack1; o CSS legado não foi copiado.
- 2026-10-19 — Checkpoint 1 implementado: criado `SeletorCategoria.razor` com região de categorias vazia/preenchida, etiquetas e marcação de ações desativadas; incluído popup de pesquisa com campo e amostras de resultados. Criado `DemonstracaoSeletorCategoria.razor` com controles locais para vazio/uma/duas/muitas categorias, modo somente leitura e visualização do popup; incluído bloco CMP-006 em `/lab` (`Pages/Lab.razor`, componente `BlocoLab`). Não foi criado CSS autoral nem foi implementada pesquisa, seleção, inclusão ou remoção funcional. Durante a revisão foi corrigida a rota de inserção inicialmente considerada: o `/lab` vigente é `Pages/Lab.razor`; `Pages/Laboratorio.razor` não foi alterado.
- Validação técnica de 2026-10-19: `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal` passou com zero avisos e zero erros; `git diff --check` passou. Uma primeira compilação revelou namespace ausente para a demonstração, corrigido antes da compilação final.
- A instância local para revisão está em `http://localhost:5195/lab`; expandir “CMP-006 - Seletor de Categoria” e escolher um cenário. A inspeção automatizada do navegador não concluiu porque a aprovação do controle do app expirou. A validação visual desta primeira formatação fica com o operador.
- 2026-10-19 — O operador direcionou o início das formatações, tratado como aceite da estrutura e avanço para o Checkpoint 2. Solicitou primeiro a correção da borda escura no título ao abrir o Lab e uma região de categorias com aparência de campo de texto, incluindo borda e estados de interação; pediu a ação adicionar como ícone à direita no padrão dos outros campos. A apresentação do popup ficará para depois.
- Investigação do título: `App.razor` usa `FocusOnNavigate` com `Selector="h1"`; o contorno visto no título é o foco programático da navegação aplicado ao `<h1>` do `CabecalhoPagina`, não uma borda de campo. A correção remove apenas o outline desse título não interativo, preservando o foco de navegação e os outlines dos controles.
- Consulta oficial ao Bulma para [Input](https://bulma.io/documentation/form/input/) e [Form controls](https://bulma.io/documentation/form/general/): o estilo `input` se destina a elementos `<input>` e não há componente de campo que acomode o conjunto de etiquetas; os estilos de hover/foco e variáveis do input foram usados como referência na personalização isolada. O botão de ícone à direita segue a estrutura `control has-icons-right` / `icon is-right` do Bulma e a classe de interação compartilhada `icone-controle-interativo`.
- Checkpoint 2, primeira entrega: atualizado `SeletorCategoria.razor` para agrupar etiquetas e ação num campo próprio; criado `SeletorCategoria.razor.css` para moldura, cores, borda hover/ativa/foco e posicionamento do ícone. Em `CabecalhoPagina.razor.css`, outline removido somente no título focado pelo roteamento. Popup não recebeu formatação nesta etapa.
- Validação técnica do primeiro ajuste visual em 2026-10-19: `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal` passou com zero avisos e zero erros; `git diff --check` passou. A prévia própria foi reiniciada em `http://localhost:5195` para servir os assets compilados.
- Próximo passo: aguardar revisão visual do operador sobre o título e a moldura do seletor; não formatar ainda o popup nem avançar para o Checkpoint 3.
- 2026-10-19 — O operador informou que a primeira formatação não ficou boa e solicitou navegar no Lab e explorar o componente `_old` e a Stack1 para compreender a expectativa visual, sem copiá-los. Busca de arquivos confirmou que não existe `SeletorCategoria_old` na Stack2. Componentes `_old` disponíveis incluem `SeletorData_old` e `Popup_old`; a observação mais próxima para campo/ícone está no antigo `SeletorData_old`.
- Comparação seletiva da Stack1: a superfície de categorias está em `Categorizacao.tsx`, distinta do componente de resultados `SeletorCategoria.tsx` e do popup `PesquisaCategoriaPopup.tsx`. O campo histórico usa caixa neutra com altura mínima 3.25rem, máxima 6rem e rolagem interna; etiquetas próprias com altura 2.125rem, borda neutra fina, fundo da paleta, remoção no próprio chip e reticências para nomes longos; o ícone de pesquisar fica alinhado à direita dentro da caixa, sem fundo ou borda próprios. O `SeletorData_old` também mostra proporção de campo alto e ação lateral integrada, com foco claramente identificado. Não foi copiado código nem CSS.
- A primeira proposta Stack2 usou tags `has-addons` nativas e uma caixa sem limite de altura; isso destoa das etiquetas próprias e da altura contida observadas na referência. O próximo ajuste deverá reinterpretar esses atributos com os tokens e padrões visuais atuais da Stack2.
- Tentativa de navegação visual: após autorização explícita do operador, o controle do navegador encerrou Computer Use com a mensagem “could not determine the current browser URL on Windows with enough confidence to enforce policy”; a instrução do controle exigiu interromper as ações no navegador. Nenhuma nova captura visual foi obtida nesta sessão. A prévia local continua sendo `http://localhost:5195/lab`.
- 2026-10-19 — Diagnóstico solicitado pelo operador: a aba Chrome correta foi identificada pelo endereço exato `http://localhost:5195/lab` e inspecionada por outra interface de controle. A captura mostrou o cabeçalho sem a borda de foco e o seletor com a moldura atual; o DOM confirmou que `Rememore.Client.styles.css` contém e aplica as regras escopadas do CMP-006. O navegador não registrou erros ou avisos. A falha anterior ocorreu no mecanismo de controle do navegador, que não conseguiu identificar com confiança a URL, e não por indisponibilidade do Lab. Para confirmar a execução limpa, iniciou-se outra instância via `dotnet run` em `http://localhost:5196/lab`; a primeira captura foi feita antes do Blazor WASM terminar de inicializar (página em branco), e, após cerca de dois segundos, o Lab renderizou normalmente sem erros de console. Ambas as instâncias carregam a implementação atual. Nenhuma alteração de código foi feita depois da rejeição visual anterior, portanto o reinício validou carregamento, mas não poderia produzir um novo desenho. A instância `5196` permanece ativa para revisão.
- 2026-10-19 — Nova rodada visual solicitada pelo operador: a prévia foi aberta antes da edição em `http://localhost:5196/lab`, confirmando que o navegador consegue exibir a implementação atual. A região de categorias foi refinada para altura mínima de 3,25rem e máxima de 6rem, rolagem interna, etiquetas de 2,125rem com nome truncado e ação de remoção integrada. O botão adicionar ocupa a altura da moldura e centraliza o ícone à direita; sua posição foi corrigida após inspeção da regra mais específica `.control.has-icons-right .icon.is-right` do Bulma, que mantinha o botão no topo quando a moldura excedia a altura padrão. Os estados vazio, uma categoria, muitas categorias/nomes longos e somente leitura foram conferidos na prévia; a lista longa ocupou duas linhas sem exceder a altura máxima. Build em 2026-10-19 passou com 0 avisos e 0 erros; `git diff --check` passou. A instância `5196` foi reiniciada após o build e segue aberta para avaliação. Estado do Checkpoint 2: esta nova proposta aguarda avaliação visual; popup continua sem formatação e Checkpoint 3 não iniciado.
- 2026-10-19 — A pedido do operador, o cenário “Muitas categorias e nomes longos” da demonstração local foi ampliado para 24 categorias. Na prévia `5196`, o contêiner atingiu o máximo de 96px; o conteúdo rolável mede 156px para 78px visíveis, com barra vertical de 15px. Build passou com 0 avisos e 0 erros; `git diff --check` passou. O cenário extenso ficou selecionado no navegador para revisão.
- 2026-10-19 — O operador aprovou a região de categorias e iniciou o refinamento do popup. No CMP-006, o X e o backdrop agora fecham a amostra por `PopupAbertoChanged`; a demonstração usa binding local para refletir o fechamento. No CMP-028 ativo no `/lab` (componente `Popup`), a correção de cantos aplica `overflow:hidden` e o raio Bulma ao cartão; o corpo recebeu sombra interna inferior correspondente à separação sombreada abaixo do cabeçalho. Os efeitos compartilhados foram centralizados em `wwwroot/css/components.css` com a classe `modal--popup-compartilhado`, usada pelos dois popups: backdrop claro/escuro com blur, título alinhado à esquerda e cartão a 25vh. O CSS específico do CMP-028 conserva apenas suas regras de cor/classe, sombra danger e botões.
- Validação visual/técnica dos popups: prévia `http://localhost:5196/lab`; no CMP-028 foi conferida a apresentação clara e escura. Em ambos, o cartão calculou raio de 12px e `overflow:hidden`; o backdrop calculou 30% e blur de 2px. No CMP-006 foram conferidos o compartilhamento do raio e backdrop, e o fechamento pelo X confirmou que a demonstração voltou ao estado fechado. Console sem erros/avisos. Build passou com 0 avisos e 0 erros; `git diff --check` passou. Escape e demais interações continuam para o Checkpoint 3, conforme escopo da especificação. O popup CMP-006 permanece aberto no tema Sistema para a revisão visual desta rodada.
- 2026-10-19 — Ajustes pedidos pelo operador para a revisão do popup: removido o botão X do CMP-006, mantendo o fechamento pelo backdrop; o cartão sem classe de fundo recebe borda de 1px e halo externo usando `--bulma-primary`; fundos explícitos removem o halo. A sombra inset inferior compartilhada foi encurtada para deslocamento de 4px e desfoque de 8px. No demo CMP-028, “Classes do popup” agora é um seletor Bulma com padrão, `popup--sombra-danger` e as opções de fundo primary, link, info, success, warning, danger, light e dark. Consulta oficial ao Bulma confirmou a estrutura documentada `div.select > select` e seus estados nativos.
- Validação desta rodada: build em 2026-10-19 passou com 0 avisos e 0 erros; `git diff --check` passou. A prévia `http://localhost:5196/lab` foi reiniciada após o build. No tema claro/Sistema, CMP-006 mostra o halo primário, raio de 12px, sombra inferior reduzida e nenhum botão de fechar; clicar no backdrop fecha o popup. No CMP-028, a lista de opções está visível e a borda padrão tem halo primário; em tema escuro, CMP-006 e CMP-028 exibem contorno primário adaptado ao tema, backdrop escuro com blur e corpo com sombra inferior reduzida. Console sem erros ou avisos. Popup CMP-006 deixado aberto em Sistema para revisão visual do operador; checkpoint 2 continua em revisão, Escape permanece para o checkpoint funcional.
- 2026-10-19 — O operador apontou que a sombra sob o cabeçalho do CMP-028 continuava alta e pediu identificar a regra Bulma antes de prosseguir com o conteúdo do popup CMP-006. A inspeção de `bulma.min.css` confirmou `.modal-card-head { box-shadow: var(--bulma-shadow) }`; o token tem uma camada de 8px de deslocamento/16px de desfoque e uma segunda camada de contorno de 1px. Em `components.css`, `.modal.modal--popup-compartilhado .modal-card-head` agora sobrescreve as duas camadas, reduzindo a primeira para 4px de deslocamento/8px de desfoque e mantendo a segunda fina. A alteração é local aos popups que usam a classe compartilhada e não muda o token global do Bulma.
- Validação da sombra superior: build passou com 0 avisos e 0 erros; após reiniciar a prévia `http://localhost:5196/lab` e recarregar a aba, o estilo calculado do cabeçalho passou de `0px 8px 16px -2px` para `0px 4px 8px -2px`, preservando a camada de 1px. A sombra inferior do corpo permaneceu em `0px -4px 8px -4px inset`. A captura do CMP-028 confirmou a redução visual; o popup CMP-028 ficou aberto na prévia para revisão. A próxima etapa, após este ajuste, é seguir com o conteúdo do popup CMP-006, sem iniciá-lo nesta rodada.
- 2026-10-19 — O operador definiu que as classes do popup mudam a cor da sombra, sem colorir o interior, e que as classes dos botões mudam somente os botões. A lista do popup agora oferece `popup--sombra-primary`, `popup--sombra-link`, `popup--sombra-info`, `popup--sombra-success`, `popup--sombra-warning` e `popup--sombra-danger`; foram removidas as opções de fundo e as regras que propagavam cores de fundo/texto aos segmentos internos. Confirmação e cancelamento agora têm listas Bulma próprias, incluindo opções padrão, semânticas, neutras e versões claras.
- Validação desta rodada: build passou com 0 avisos e 0 erros. Na prévia `http://localhost:5196/lab`, selecionei `popup--sombra-danger`, `is-primary` para confirmação e `is-danger` para cancelamento. O estilo calculado confirmou sombra externa danger, partes internas mantendo fundo branco e classes aplicadas somente aos dois botões; a captura exibiu o resultado. O popup do CMP-028 ficou aberto com essas escolhas para revisão. A lista anterior de classes de fundo foi substituída pela regra acima; o próximo passo permanece revisar o conteúdo do popup do CMP-006.
- 2026-10-19 — A pedido do operador, a sombra externa colorida do popup foi reforçada de 24% para 32% de opacidade nas seis variantes `popup--sombra-*`. Deslocamento, desfoque, cores internas, contorno e sombra do conteúdo não foram alterados.
- Validação: build passou com 0 avisos e 0 erros. Na prévia recarregada, o estilo calculado de `popup--sombra-danger` confirmou a cor danger a 32%; o cabeçalho permaneceu branco e os botões continuaram com as classes selecionadas. O popup segue aberto no `/lab` para revisão visual.
- 2026-10-19 — Plano desta rodada para o conteúdo do popup CMP-006: manter o cartão, cabeçalho e efeitos já compartilhados via `modal--popup-compartilhado`; formatar somente busca e resultados no CSS isolado do `SeletorCategoria`. A consulta ao `Popup_old.razor` mostrou apenas uma mensagem dentro de `.modal-content`/`.box`, sem padrão de busca ou lista. Na Stack1, `PesquisaCategoriaPopup.tsx` define o contêiner e o título, enquanto `SeletorCategoria.tsx` compõe rótulo, busca e resultados. A referência geral foi a separação de responsabilidades, não a cópia de estilos ou implementação. A documentação oficial do Bulma confirma a estrutura `modal-card` com cabeçalho/corpo e os elementos `field`, `control`, `input`, `icon` e `button`; a lista de categorias permanece uma lista semântica HTML estilizada pelo componente.
- Conteúdo aplicado em `SeletorCategoria.razor` e `.razor.css`: o rótulo da busca continua associado ao campo, mas fica visualmente oculto para evitar repetir o título; as opções viraram linhas Bulma de largura integral, sem marcadores padrão e com espaçamento regular; a amostra “Família” usa um indicador “Já associada” alinhado à direita; oito opções de demonstração e altura máxima de 15,625rem mostram a rolagem interna. Estados interativos de hover e foco visível foram preparados para as opções habilitáveis no checkpoint funcional, sem ativar seleção, pesquisa ou teclado nesta etapa. Nenhum efeito compartilhado foi duplicado em `components.css`.
- Validação visual parcial: a instância já iniciada pelo operador em `http://localhost:5193/lab` recebeu a atualização do watcher sem reinício. Com “Exibir estrutura do popup” ativo, a captura mostrou o título e contorno compartilhados, campo de busca alinhado ao corpo, linhas sem bullets e rolagem interna; o aviso de categoria associada ficou distinguível. `git diff --check` passou. Não foi executado build nem teste; o resultado aguarda revisão visual do operador. Checkpoint 2 permanece em andamento, Checkpoint 3 não iniciado.
- 2026-10-19 — A pedido do operador, os resultados foram aproximados de uma tabela: uma única moldura externa envolve o conjunto e sua rolagem; as caixas individuais perderam bordas laterais e cantos separados e agora têm apenas divisórias horizontais entre linhas. A altura mínima das opções foi reduzida de 2,75rem para 2,25rem e o limite da área rolável ajustado para 12rem. Na prévia `http://localhost:5193/lab`, após atualizar a página existente, a captura mostrou a barra de rolagem contida pela moldura externa, sem sobrepor as bordas dos resultados, com linhas mais compactas e contínuas. A amostra do popup ficou aberta para revisão; Checkpoint 2 permanece em andamento.
- 2026-10-19 — A pedido do operador, a área rolável dos resultados foi ampliada de 12rem para 15rem para exibir cinco itens simultaneamente. O indicador “Já associada” recebeu margem à direita de 0,75rem para afastá-lo da barra de rolagem. Na prévia `http://localhost:5193/lab`, a captura mostrou cinco linhas completas visíveis e o indicador sem sobreposição; o popup segue aberto para revisão visual. Checkpoint 2 permanece em andamento.
- 2026-10-19 — O operador aprovou a apresentação da região de categorias associadas, do popup e dos ajustes feitos no CMP-028. Checkpoint 2 aceito e Checkpoint 3 iniciado. O operador autorizou planejar e implementar as funcionalidades da especificação e preferiu manter o dotnet watch ativo para acompanhar a prévia em `http://localhost:5193/lab`. Plano registrado acima. Entendimento funcional apresentado: o componente segue controlado pelo chamador e emite pedidos; o Lab simula as respostas sem persistência, API ou integração real. Para conciliar o requisito de fechamento explícito com a solicitação anterior de remover o X, foi planejado um botão textual “Fechar”, além de backdrop e Escape.
- 2026-10-19 — Checkpoint 3 implementado. `SeletorCategoria` agora recebe o catálogo em `CategoriasDisponiveis` e emite `AoAdicionarCategoria`, `AoCriarCategoria` e `AoRemoverCategoria`; continua recebendo as associações pelo parâmetro controlado `Categorias`. A nova infraestrutura `PesquisaCategorias` normaliza caixa, acentos e espaços externos, aplica substring primeiro e usa distância Levenshtein somente sem resultado simples (limiar de similaridade 0,72); o debounce é 180ms. A criação mantém o nome digitado após remover espaços externos, aparece somente quando a busca simples está vazia e é bloqueada se já houver equivalente no catálogo ou entre as associações. Itens associados aparecem desativados e não podem ser removidos pela lista. A amostra do Lab passou a simular as respostas de inclusão, criação e remoção em memória, sem persistência.
- Acessibilidade funcional: a busca recebe foco ao abrir; foco retorna ao acionador ao fechar; Tab/Shift+Tab ficam contidos no cartão; Escape, backdrop e botão textual “Fechar” fecham sem seleção, e o popup não apresenta X. No modo somente leitura, ações de adicionar, remover e abrir o popup não são renderizadas.
- Validação de 2026-10-19: `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal` passou com 0 avisos e 0 erros; `git diff --check` passou. Na prévia `http://localhost:5197/lab`, busca `familia` retornou somente `Família` sem oferta de criação; `famlia` mostrou criação e sugestão `Família`; `viagenz` mostrou criação e sugestão `Viagens`; `zxqv` mostrou somente criação. A criação aparou espaços externos, entrou nas associações/catálogo demonstrativos e bloqueou criação duplicada. Seleção de `Trabalho` fechou o popup e atualizou a região; remoção retirou o item. Modo somente leitura ocultou as ações. Fechar, Escape e backdrop foram exercitados; foco inicial, ciclo Tab/Shift+Tab e restauração ao acionador foram confirmados.
- A validação visual em `390×844` mostrou o popup e cinco itens sem overflow horizontal (largura do documento 375px, considerando a barra vertical; largura do cartão 377px). Claro e Escuro foram conferidos após corrigir o selo `Já associada`, que no tema escuro herdava fundo claro com texto claro; o indicador agora usa os tokens de superfície/texto do tema. O tema do Lab foi restaurado para Sistema e o popup está aberto para revisão.
- Operação da prévia: o processo originalmente ativo em `5193` ficou com manifesto antigo depois que o build atualizou os hashes do runtime e o navegador falhou ao buscar o módulo dinâmico. Para não interromper o watch do operador, foi iniciada uma prévia compilada via `dotnet run --no-build --no-restore --no-launch-profile` em `http://localhost:5197/lab`, atualmente servindo o build conferido. A tentativa de iniciar um watch paralelo encontrou bloqueio do NuGet em `NuGet.Config`; o processo paralelo foi encerrado. Não foi alterado nem encerrado o processo preexistente em `5193`. Para revisar a versão atual, usar a aba aberta em `5197`; se o operador preferir voltar ao watch em `5193`, será necessário reiniciá-lo para carregar o manifesto novo.
- 2026-10-19 — O operador observou que o botão textual “Fechar” voltou a aparecer no cabeçalho do popup e solicitou sua remoção. O botão foi retirado; o popup permanece fechável pelo backdrop e por Escape, e não apresenta X nem controle de fechamento no cabeçalho. Esta decisão substitui a escolha anterior do botão textual. O build passou com 0 avisos e 0 erros. A prévia em `5197` permaneceu presa no estado “Carregando Rememore…” após recarregar, então foi iniciada uma prévia compilada em `http://localhost:5198/lab`, sem interromper o processo preexistente do operador. Na demonstração aberta, a inspeção do diálogo confirmou que o cabeçalho contém apenas “Pesquisar categoria” e não contém botão “Fechar”; a busca e os nove resultados renderizaram normalmente. A prévia `5198` permanece aberta para conferência visual.
- 2026-10-19 — A pedido do operador, o ícone de ação do seletor foi alterado de mais para lupa e o clique na área do campo abre o popup. Os cliques dos botões de remoção e do acionador não propagam para o campo, evitando disparar a abertura ao remover ou executar a ação duas vezes. Implementação segue as convenções de controle do Bulma, mantendo o botão de ícone como ação dedicada e ampliando o acionamento ao restante do campo. Recompilar e verificar lupa, abertura pelo fundo, remoção e modo somente leitura na prévia.
- Validação de 2026-10-19: consulta à documentação oficial Bulma confirmou `control` como contêiner de controles e o uso de `icon`/`button` para a ação; a lupa continua num botão nomeado, que preserva acionamento por teclado. Build passou com 0 avisos e 0 erros. Após reiniciar a prévia compilada `5198`, a inspeção confirmou `fa-magnifying-glass`; clique no espaço livre do campo abriu o diálogo com os resultados, e o cabeçalho permaneceu sem botão “Fechar”. A aba `5198` está aberta no estado do popup para revisão. `git diff --check` passou (com o aviso preexistente de normalização LF/CRLF em `Popup.razor.css`).
- 2026-10-19 — A pedido do operador, o campo recebeu cursor de ponteiro para indicar que toda a área abre o popup. Os nomes das categorias receberam cursor padrão e `user-select: none`, evitando cursor de seleção de texto sobre o rótulo. Recompilar e conferir o estilo no seletor.
- Validação de 2026-10-19: build passou com 0 avisos e 0 erros. Na prévia reiniciada em `http://localhost:5198/lab`, os estilos computados confirmaram `cursor: pointer` no campo e `cursor: default` mais `user-select: none` no nome da categoria.
- 2026-10-19 — O operador confirmou que o X de remoção deve usar o elemento Bulma `delete` e solicitou seu tamanho padrão. O markup já usava `delete`, mas estava reduzido por `is-small`; removido esse modificador. A documentação oficial do Bulma confirma `<button class="delete"></button>` como forma independente e diferencia tamanho padrão de `is-small`. Recompilar e conferir na prévia.
- Validação de 2026-10-19: build passou com 0 avisos e 0 erros. Após reiniciar a prévia `5198`, o DOM mostra as classes `delete seletor-categoria__remover`, sem `is-small`, e o tamanho computado é 20×20px.
- 2026-10-19 — A pedido do operador, conferido o alinhamento vertical do X na etiqueta em `http://localhost:5198/lab`. O centro geométrico da etiqueta (34px), do botão `delete` (20px) e da linha do nome (21px) coincide exatamente; os três centros computados foram `1036px` no viewport. A composição permanece centralizada por `align-items: center`, conforme estrutura da tag Bulma. Nenhum ajuste CSS foi necessário.
- 2026-10-19 — O operador aceitou o Checkpoint 3. Aceite registrado: contratos controlados, busca simples/difusa, criação, seleção, duplicidade, inclusão/remoção demonstrativas, somente leitura, fechamento por backdrop/Escape, foco e teclado; build e validação manual previamente registrados. O ajuste visual subsequente do `delete` em tamanho padrão e sua conferência de alinhamento também foram registrados antes do aceite. Checkpoints 1, 2 e 3 estão aceitos; implementação da especificação concluída. Aguarda-se apenas eventual pedido do operador para encerramento formal, elaboração do Parecer final e arquivamento.
- 2026-10-19 — Revisão de limpeza solicitada após o aceite: removida a regra `.seletor-categoria__adicionar:disabled`, pois o botão não recebe o atributo `disabled` em nenhum estado; no modo somente leitura ele não é renderizado. A regra era inativa e sua remoção não altera a apresentação ou o comportamento.

### Registro do Checkpoint 1

Implementação e compilação registradas acima. O operador direcionou o início do Checkpoint 2 em 2026-10-19, considerado aceite da estrutura para avançar.

## Parecer final

### Resultado entregue

O CMP-006 foi reconstruído e funcionalizado no laboratório `/lab`, sem integração em páginas reais. O componente `SeletorCategoria` apresenta categorias associadas em uma região com aparência de campo, etiquetas removíveis e ação de pesquisa com lupa. Clicar na área livre do campo ou na lupa abre o popup; a remoção das etiquetas não propaga o clique para a abertura. A área clicável usa cursor de ponteiro, e os nomes das categorias usam cursor padrão sem seleção de texto. O X é o elemento Bulma `delete`, em tamanho padrão, centralizado verticalmente.

O popup apresenta busca, resultados agrupados em uma região contínua com rolagem e indicador de categoria já associada. A pesquisa normaliza caixa, acentos e espaços externos, prioriza correspondência parcial simples e só então usa aproximação por distância Levenshtein com similaridade mínima de 0,72. Os resultados são ordenados alfabeticamente; a busca tem debounce de 180ms. Quando não há correspondência simples, a opção de criar pode coexistir com sugestões aproximadas. Criação equivalente a item do catálogo ou categoria associada é bloqueada; nomes válidos preservam a grafia digitada após aparar espaços externos.

O componente mantém estado controlado pelo chamador por meio de `Categorias`, `CategoriasDisponiveis`, `SomenteLeitura`, `PopupAberto`/`PopupAbertoChanged` e dos callbacks `AoAdicionarCategoria`, `AoCriarCategoria` e `AoRemoverCategoria`. O laboratório fornece dados fictícios e simula inclusão, criação e remoção em memória. Em modo somente leitura, as ações não são exibidas. A busca recebe foco ao abrir; Escape e backdrop fecham sem selecionar; o foco é restaurado ao acionador, e Tab/Shift+Tab permanecem no diálogo.

O popup do CMP-006 não apresenta X nem botão textual “Fechar”, conforme solicitações posteriores do operador; permanece fechável pelo backdrop e por Escape. Essa escolha substitui o requisito original de controle explícito de fechamento e foi aceita pelo operador no Checkpoint 3.

### Compartilhamento e arquivos

Os efeitos compartilhados dos popups do CMP-006 e CMP-028 foram centralizados em `src/Rememore.Client/wwwroot/css/components.css`: backdrop claro/escuro com blur, posicionamento a 25vh, alinhamento do título, contorno/sombra padrão, sombras internas e cantos do corpo quando faltam cabeçalho ou rodapé, além do respeito a movimento reduzido. `src/Rememore.Client/Componentes/Popup.razor` adota a classe compartilhada; `Popup.razor.css` conserva as variações de sombra. A demonstração do CMP-028 em `DemonstracaoPopup.razor` apresenta as opções de sombra e de classes dos botões. `CabecalhoPagina.razor.css` contém o ajuste à borda de foco do título solicitado no início da unidade.

Arquivos do CMP-006: `Pages/Lab.razor`, `Componentes/Lab/DemonstracaoSeletorCategoria.razor`, `Componentes/SeletorCategoria.razor`, `Componentes/SeletorCategoria.razor.css`, `Infraestrutura/PesquisaCategorias.cs` e `wwwroot/js/seletorCategoria.js`. A documentação da unidade está em `.docs/memoria-tecnica.md` e neste Markdown operacional.

### Verificações e aceite

- `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal`: passou com 0 avisos e 0 erros, inclusive após a última limpeza de uma regra CSS inativa.
- `git diff --check`: passou. O Git emitiu o aviso de que normalizará LF para CRLF em `Popup.razor.css` na próxima atualização; não houve erro de whitespace.
- Validação manual no navegador em `http://localhost:5198/lab`: correspondências normalizadas (`familia`), simples parciais, difusas (`famlia`, `viagenz`) e ausência de sugestões (`zxqv`); criação aparando espaços e bloqueando duplicidade; seleção, inclusão, remoção e somente leitura; fechamento por backdrop e Escape; foco inicial, contenção e restauração; tema claro/escuro e viewport estreito de 390×844 com cinco resultados visíveis e sem overflow horizontal.
- Revisões posteriores confirmaram abertura pelo fundo do seletor, lupa Font Awesome, cursores pedidos pelo operador e `delete` em 20×20px com centro vertical coincidente com a etiqueta e a linha do nome. A regra `.seletor-categoria__adicionar:disabled` foi removida por não corresponder a nenhum estado renderizado.
- Checkpoints 1, 2 e 3 aceitos pelo operador. Checkpoint 3 foi aceito em 2026-10-19; a implementação prevista para esta especificação está concluída. Não foi executada suíte automatizada nesta unidade; a validação funcional foi manual no Lab.

### Limites e pendências

A unidade termina no `/lab`. Não inclui integração a páginas reais, persistência IndexedDB, sincronização remota, API/backend ou atualização do Google Drive. Uma integração futura deve ser tratada em unidade própria e preservar os contratos controlados do componente. Não há pendência de implementação para esta especificação.
