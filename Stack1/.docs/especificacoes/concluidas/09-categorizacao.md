# 05.09 - Categorização

## Estado

Nona unidade de desenvolvimento da fase 05 - Especificação, aprovada como próxima unidade de desenvolvimento. Ela materializa a primeira experiência funcional real da aba Categorizar e Tom, mas seu escopo é deliberadamente restrito à categorização. O Tom, o balanço sentimental e a integração entre as diferentes perspectivas de edição da mesma memória permanecem para unidades posteriores.

Este corpo constitui a instrução histórica aprovada da unidade e somente deverá receber Parecer final no encerramento.

## Origem funcional

02.03 - Captura e Evolução das Memórias / categoria obrigatória, categoria dominante, historicidade e prazo de edição.

02.05 - Modelo de Trabalho e Continuidade / workspace local, persistência confirmada, pendências e proteção contra falhas.

03.05 - Capturar / navegação da Captura do dia e retorno das telas específicas de memória.

04.06 - Especificação Funcional - Capturar / lista de Categorizar e Tom, edição de categorias e catálogo disponível.

04.07 - Regras - Capturar / existência local de categorias, ciclo de vida das categorias preservadas, prazo de edição e concorrência.

04.08 - Componentes - Capturar / CMP-005 — Orientação Progressiva, CMP-006 — Seletor de Categoria e CMP-008 — Memória.

05.07 - Registrar e Organizar / estrutura real de /capturar/{data}, linha fixa, abas, proteção de saída, persistência local e restauração aproximada da rolagem.

05.08 - Componente de Memória / componente reutilizável Memoria já aprovado no laboratório para o contexto Categorizar e Tom.

## Autossuficiência da instrução

As referências acima registram apenas a origem das decisões. O programador não deve depender da releitura desses documentos para completar esta unidade. O comportamento necessário à implementação está descrito abaixo.

Antes de montar o plano técnico definitivo, o programador deve realizar a clarificação funcional inicial prevista pelo processo do projeto. Decisões técnicas internas permanecem sob sua responsabilidade quando não alterarem o comportamento observável definido aqui.

## Objetivo

Materializar de ponta a ponta a categorização das memórias da Captura do dia:

- tornar funcional a lista da aba Categorizar e Tom utilizando o componente Memoria já construído;
- abrir uma tela específica de Categorização para a memória selecionada;
- apresentar o texto integral da memória somente como contexto;
- permitir visualizar, adicionar e remover associações de categoria enquanto a memória estiver editável;
- materializar o CMP-006 — Seletor de Categoria, incluindo pesquisa, criação local e correspondência aproximada;
- manter um catálogo local reutilizável de categorias preservadas sincronizado por versionamento, sem baixar o catálogo integral a cada data;
- permitir que categorias ainda não preservadas existam localmente somente enquanto estiverem associadas a pelo menos uma memória local;
- respeitar o mesmo prazo e a mesma autorização de edição da memória;
- oferecer modo histórico somente leitura quando as categorias já não puderem ser alteradas;
- salvar as alterações no workspace local e restaurar o contexto da lista ao retornar;
- validar visualmente a nova tela e o seletor com o operador antes de concluir as integrações funcionais.

## Posição no ciclo

Já existem e devem ser preservados:

- /capturar/{data} com header global, linha fixa da captura, três abas e conteúdo rolável;
- Registrar e organizar funcional;
- workspace IndexedDB por conta/data, pendências reais e persistência local confirmada;
- prazo de edição da memória contado da primeira preservação;
- autorização decidida ao abrir a edição e preservada durante a mesma sessão autorizada;
- proteção contra abandono de edição modificada;
- restauração aproximada do contexto da lista ao retornar de uma edição;
- bloqueio de edição concorrente da mesma captura por conta/data;
- CMP-005 — Orientação Progressiva;
- CMP-008 — Memória, já experimentado no contexto Categorizar e Tom;
- linguagem visual de Tom, que não será expandida nem integrada nesta unidade.

A aba continua se chamando Categorizar e Tom na estrutura da Captura do dia. Entretanto, a tela específica construída nesta unidade terá o título Categorização. A futura diferenciação do título ou a entrada do Tom serão tratadas somente quando a experiência de Tom for retomada.

## Escopo desta unidade

Estão no escopo:

1. lista funcional da aba Categorizar e Tom;
2. uso real de CMP-008 — Memória nessa lista;
3. abertura da tela específica de Categorização;
4. caixa integral da memória com altura visual de cinco linhas e rolagem interna;
5. área fixa para categorias selecionadas;
6. inclusão e remoção de associações;
7. pesquisa de categorias com debounce;
8. pesquisa simples normalizada;
9. fallback de correspondência aproximada;
10. criação de categoria ainda somente local;
11. ordenação alfabética da lista disponível;
12. catálogo local de categorias preservadas;
13. fronteira de sincronização incremental/versionada do catálogo;
14. modo histórico somente leitura;
15. ação Salvar, abandono protegido e retorno à lista;
16. restauração aproximada da rolagem;
17. orientação para desencorajar múltiplas categorias sem proibi-las;
18. marco obrigatório de validação visual antes da integração completa;
19. utilitário reutilizável para normalização e correspondência aproximada.

## Fora do escopo principal

Não implementar nesta unidade:

- edição ou seleção de Tom;
- balanço sentimental;
- mudança da linguagem visual do Tom;
- aplicação do Tom à caixa integral desta tela;
- regra que decide quando o Tom passa a estar disponível;
- alteração do rótulo da aba Categorizar e Tom;
- navegação entre Registrar e organizar e Categorização dentro da tela específica da mesma memória;
- unificação visual definitiva entre a caixa de edição textual de Registrar e organizar e a caixa de contexto desta unidade;
- integração do componente Memoria à lista real de Registrar e organizar;
- Revisar e Preservar funcional;
- preservação real no backend;
- backend real de categorias;
- decisão definitiva de algoritmo, limiar ou biblioteca para correspondência aproximada;
- exclusão manual independente de categorias;
- limite máximo para quantidade de categorias associadas a uma memória.

# 1. Lista da aba Categorizar e Tom

## 1.1 Estrutura da aba

A aba permanece integrada à estrutura já existente de Captura do dia. Header global, linha fixa da captura e controle das três abas continuam seguindo a implementação vigente.

Ao entrar na aba Categorizar e Tom, o conteúdo funcional desta unidade é a lista das memórias da composição atual.

A unidade não altera o rótulo da aba existente.

## 1.2 Apresentação das memórias

Usar o componente real Memoria criado na 05.08 no contexto Categorizar e Tom.

A lista respeita a ordem física atual das memórias. Não apresenta Elevar, Rebaixar ou qualquer outro controle de ordenação.

Cada item apresenta a prévia compacta de até três linhas já definida pelo componente.

A apresentação de categorias segue o contrato já aprovado do componente:

- sem categoria: “Sem categoria” em aparência esmaecida;
- uma categoria: nome da categoria;
- várias categorias: primeira categoria seguida de “e +N”;
- nomes longos podem ser abreviados conforme o comportamento já definido no componente.

Esta unidade não acrescenta comportamento novo de Tom à lista. Não é necessário criar fluxo, estado ou persistência de Tom para alimentar o componente.

Clicar na memória abre a tela específica de Categorização daquela memória.

A lista não oferece inclusão, remoção ou alteração direta de categorias.

## 1.3 Retorno da edição

Ao abrir uma memória a partir da lista, guardar informação suficiente para restaurar aproximadamente o contexto visual da lista.

Ao retornar da Categorização, seja depois de Salvar ou depois de abandonar deliberadamente a edição, procurar manter a memória de origem na mesma região visível em que estava antes da abertura.

Não é exigida restauração pixel a pixel.

Essa restauração é específica do retorno da edição. Não cria obrigação de preservar rolagem em toda troca de abas.

# 2. Tela específica de Categorização

## 2.1 Estrutura

Ao abrir uma memória para categorização:

- o título apresentado no header é Categorização;
- as abas da Captura do dia ficam ocultas enquanto essa tela específica estiver aberta;
- permanece a navegação de retorno já utilizada nas telas específicas de Memória;
- quando a memória estiver editável, existe no topo a ação Salvar;
- quando a memória estiver histórica e somente para consulta, Salvar não aparece.

Não implementar nesta unidade navegação entre as diferentes perspectivas de edição da mesma memória.

## 2.2 Memória como contexto

O texto da memória não pode ser alterado nesta tela.

Apresentá-lo integralmente numa caixa própria de leitura com:

- altura visual fixa correspondente a aproximadamente cinco linhas;
- rolagem interna quando o conteúdo ultrapassar essa altura;
- texto alinhado de maneira coerente com os campos já existentes do produto;
- nenhuma reação visual obrigatória ao Tom nesta unidade.

Esta superfície deverá ser considerada futuramente na revisão conjunta da aparência da edição textual de Registrar e organizar e da visualização usada na Categorização. Essa harmonização não faz parte da 05.09.

# 3. Categorias selecionadas

## 3.1 Área própria

Abaixo da memória existe uma área própria para representar o conjunto atual de categorias selecionadas.

Essa área possui altura visual fixa suficiente para duas linhas de pequenas caixas/etiquetas de categoria.

Quando o conteúdo ocupar somente uma linha, a linha fica centralizada verticalmente dentro dessa área e alinhada à esquerda.

Quando ocupar duas linhas, usa naturalmente as duas.

Se a quantidade ultrapassar a capacidade das duas linhas, a área utiliza rolagem interna em vez de aumentar indefinidamente de altura.

O objetivo é impedir que o campo de pesquisa e a lista de resultados sejam deslocados continuamente a cada nova seleção.

## 3.2 Controles

Em modo editável, cada categoria selecionada aparece como pequena caixa/etiqueta com ação X para desmarcá-la.

Remover pelo X e clicar novamente na mesma categoria na lista de resultados produzem o mesmo efeito funcional: retirar aquela associação do estado corrente da edição.

Não existe limite funcional para a quantidade de categorias associadas.

## 3.3 Orientação quando houver múltiplas categorias

A partir da segunda categoria selecionada, apresentar imediatamente uma mensagem curta logo abaixo da área de categorias selecionadas.

Texto inicial desta unidade:

“Tente representar esta memória com uma única categoria sempre que possível. Use mais de uma apenas quando isso fizer diferença para você.”

A mensagem não bloqueia a seleção e não transforma múltiplas categorias em erro.

Ela é igual para todos os níveis de usuário. Não pertence ao conjunto de mensagens progressivas de CMP-005.

Enquanto estiver visível, ocupa espaço normal no fluxo da tela e desloca a pesquisa e a lista de resultados para baixo.

Ao voltar para uma ou nenhuma categoria, desaparece.

A efetividade dessa orientação continua sujeita à hipótese H-CAP-04 e poderá ser refinada por observação de uso sem alterar a regra de que múltiplas categorias são permitidas.

# 4. CMP-006 — Seletor de Categoria

## 4.1 Composição

Abaixo da área de categorias selecionadas e da mensagem condicional de múltiplas categorias fica o seletor.

Ele contém:

- campo de pesquisa;
- lista de resultados;
- aproximadamente cinco resultados visíveis por vez;
- rolagem interna quando houver mais itens.

Com pesquisa vazia, apresentar todas as categorias atualmente disponíveis, em ordem alfabética.

O campo utiliza pequena temporização/debounce para evitar recomputações a cada evento de digitação. O tempo exato é decisão técnica, desde que a interação permaneça responsiva.

## 4.2 Pesquisa simples normalizada

A pesquisa normal é sempre a primeira estratégia.

Para comparação, normalizar consulta e nomes pesquisáveis de modo a ignorar:

- maiúsculas e minúsculas;
- acentuação;
- espaços externos.

A apresentação continua usando a grafia real da categoria. A normalização serve apenas para busca e equivalência de pesquisa.

A busca simples deve localizar correspondências textuais pelo conteúdo normalizado. Não é necessário exigir igualdade integral entre consulta e nome.

Exemplos esperados:

- “familia” encontra “Família”;
- “TRABALHO” encontra “Trabalho”;
- espaços acidentais antes ou depois da consulta não criam categoria diferente.

Enquanto a busca simples retornar ao menos um resultado, não executar nem misturar resultados da correspondência aproximada.

## 4.3 Correspondência aproximada como fallback

Somente quando a pesquisa simples retornar zero resultados entra a busca difusa/correspondência aproximada.

Nesse estado:

1. o primeiro item da lista é sempre o texto informado pelo usuário, representando a possibilidade de criar uma nova categoria;
2. abaixo dele aparecem categorias existentes consideradas suficientemente semelhantes;
3. se não houver nenhuma aproximação relevante, permanece apenas a opção de criar o texto informado.

Exemplo:

consulta: “famlia”

resultados:

- “famlia” — criar nova categoria;
- “Família”.

A existência de uma sugestão semelhante não bloqueia a criação. O sistema não corrige automaticamente o usuário nem presume que o texto digitado seja erro.

O algoritmo e o limiar concreto pertencem à implementação, mas o resultado não deve produzir sugestões amplas e irrelevantes apenas para preencher a lista.

A correspondência aproximada deve ser implementada como utilitário reutilizável, desacoplado do seletor de categorias, porque a mesma capacidade poderá ser usada futuramente em outras pesquisas do Rememore.

A política de quando ativá-la continua pertencendo ao contexto chamador: nesta unidade, ela só é usada depois de zero resultados da busca simples.

## 4.4 Seleção e desseleção na lista

Categorias já selecionadas devem possuir estado visual inequívoco na lista.

Clicar numa categoria não selecionada a adiciona ao conjunto corrente.

Clicar novamente numa categoria já selecionada a remove.

O X da área superior é uma segunda forma de produzir a mesma remoção.

A lista deve reagir imediatamente às mudanças do estado corrente da tela, antes do salvamento.

## 4.5 Opção de nova categoria

Quando a lista apresentar o texto digitado como opção de criação, selecionar esse item apenas acrescenta esse valor ao conjunto corrente da edição.

Isso ainda não cria uma categoria no servidor.

Também não deve produzir, por si só, uma entidade preservada autônoma no IndexedDB.

A categoria local passa a ter existência funcional persistida somente quando Salvar confirmar uma associação dessa categoria a pelo menos uma memória no workspace local.

# 5. Catálogo de categorias e existência local

## 5.1 Duas origens distintas

A lista disponível combina duas origens conceitualmente diferentes:

- categorias preservadas conhecidas pelo catálogo sincronizado do servidor;
- categorias ainda não preservadas, existentes somente no trabalho local da conta.

Essas origens não devem ser confundidas.

Uma categoria preservada possui identidade e versionamento servidores.

Uma categoria exclusivamente local ainda não possui versão de servidor e sua existência depende de associações locais.

## 5.2 Categoria criada somente localmente

Uma nova categoria selecionada e salva numa memória permanece disponível para outras categorizações locais enquanto estiver associada a pelo menos uma memória existente em algum workspace local da mesma conta.

Se sua última associação local for removida e a categoria nunca tiver sido preservada pelo servidor, ela deixa de integrar imediatamente o conjunto local disponível.

Não existe ação independente de excluir essa categoria.

Não existe tombstone, histórico ou versionamento servidor para um valor que nunca chegou ao acervo.

A implementação pode derivar essa existência diretamente das associações ou manter índice local equivalente. O comportamento observável é a autoridade.

## 5.3 Categoria já preservada

Retirar uma categoria preservada de uma memória altera apenas a composição local.

O front não decide que essa categoria ficou globalmente sem uso, porque não possui autoridade sobre todas as memórias preservadas do usuário.

Enquanto o catálogo servidor ainda a considerar ativa, ela continua disponível para seleção local, mesmo que não esteja associada a nenhuma memória da captura atual.

Somente uma sincronização posterior pode informar que uma categoria preservada passou a inativa.

# 6. Versionamento e sincronização do catálogo preservado

## 6.1 Objetivo

Não retransmitir o catálogo completo de categorias a cada data de memória consultada.

O front deve manter localmente, por conta, a versão conhecida do catálogo preservado e reutilizá-lo enquanto estiver atual.

A sincronização de categorias é independente da revisão da composição de uma data.

## 6.2 Modelo mínimo do catálogo preservado

O modelo local precisa comportar, no mínimo, para cada categoria preservada:

- identidade estável fornecida pelo servidor;
- nome;
- versão própria da categoria;
- estado ativa/inativa.

Além disso, o cliente mantém uma revisão/cursor do catálogo de categorias como um todo, usado para pedir somente alterações posteriores ao estado já conhecido.

A versão individual permite reconhecer a evolução de cada categoria. A revisão/cursor global evita que o cliente precise enviar ao servidor um mapa com a versão de todas as categorias a cada sincronização.

Os nomes concretos dos campos pertencem à implementação e devem seguir a convenção PT-BR vigente.

## 6.3 Contrato incremental

O contrato remoto pode continuar mockado nesta unidade, mas deve representar a fronteira futura.

Quando não houver catálogo local conhecido, o serviço pode fornecer o estado inicial necessário e a revisão correspondente.

Quando houver revisão local, o cliente consulta somente alterações posteriores a essa revisão.

A resposta pode:

- não conter alterações;
- trazer categorias novas;
- trazer mudança de nome futura;
- marcar categoria como inativa;
- reativar categoria;
- avançar a versão individual correspondente;
- fornecer a nova revisão/cursor global do catálogo.

Aplicar os deltas ao cache local sem baixar novamente todas as categorias.

Categorias inativas não aparecem no seletor normal.

A associação de categorias de cada memória continua pertencendo aos dados da própria composição da memória. O catálogo versionado existe para fornecer o conjunto reutilizável disponível para seleção.

## 6.4 Fronteira com o backend futuro

Esta unidade não implementa a decisão servidora de criação, inativação ou reativação.

Na preservação futura da composição, será responsabilidade do servidor:

- reconhecer quais valores locais correspondem a novas categorias;
- reutilizar categorias preservadas existentes;
- reconhecer e reativar uma categoria histórica quando aplicável;
- determinar se alguma categoria preservada ficou sem qualquer associação no acervo e deve passar a inativa;
- incrementar versões e revisão do catálogo;
- devolver ao front o estado canônico necessário para reconciliação.

Uma categoria preservada nunca é fisicamente removida apenas porque deixou de ter associações. Ela pode tornar-se inativa e voltar a ser ativada.

# 7. Salvar, abandonar e persistência local

## 7.1 Estado transitório da tela

Adicionar, remover ou criar opções de categoria durante a edição altera primeiro apenas o estado corrente da tela.

Nenhuma seleção individual grava imediatamente no workspace.

A composição confirmada no IndexedDB só muda ao acionar Salvar.

## 7.2 Salvar

Salvar trabalha com o conjunto final de associações, não com uma sequência de comandos independentes de criar/excluir categoria.

Ao Salvar:

- comparar o conjunto final com as associações confirmadas da memória;
- se houver alteração, persistir o conjunto no workspace IndexedDB;
- uma operação só é considerada concluída depois da confirmação da gravação;
- a captura passa a pendente conforme o modelo vigente;
- categorias exclusivamente locais recém-confirmadas passam a integrar a lista local enquanto possuírem ao menos uma associação;
- categorias exclusivamente locais que perderem sua última associação deixam de integrar a lista;
- depois da persistência bem-sucedida, retornar à lista da aba Categorizar e Tom;
- restaurar aproximadamente o contexto de rolagem anterior.

Se a persistência falhar, manter a edição aberta e não apresentar as alterações como salvas.

Se o conjunto final for igual ao conjunto confirmado de origem, Salvar não deve criar alteração artificial.

## 7.3 Abandono

Se o usuário voltar sem ter modificado a edição, retornar normalmente à lista.

Se houver alterações ainda não salvas, uma navegação controlada pelo Rememore deve avisar que as mudanças serão perdidas e permitir cancelar a saída.

Se o usuário confirmar a saída, descartar o estado transitório e retornar à lista sem alterar o workspace.

Para retorno, fechamento ou navegação pelos recursos nativos do navegador, reutilizar a proteção nativa já empregada em Registrar e organizar quando aplicável, reconhecendo as limitações impostas pelo navegador.

Esta unidade não precisa criar persistência própria das seleções ainda não salvas para sobreviver a reload deliberado. A continuidade da autorização de edição, entretanto, segue a regra vigente da memória.

# 8. Historicidade e modo somente leitura

## 8.1 Autorização

As categorias seguem a mesma autorização de edição da memória.

Memória nunca preservada permanece editável.

Depois da primeira preservação, aplica-se o prazo vigente já existente.

A autorização é verificada quando a tela de Categorização é aberta. Se a memória estiver autorizada naquele instante, a sessão permanece autorizada conforme a regra já vigente mesmo que o prazo expire enquanto ela estiver aberta.

Uma nova abertura reavalia o prazo.

## 8.2 Memória histórica

Quando as categorias já não puderem ser alteradas:

- manter o título Categorização;
- apresentar a caixa integral da memória;
- apresentar somente a relação de categorias associadas;
- não apresentar X;
- não apresentar campo de pesquisa;
- não apresentar lista de resultados;
- não apresentar possibilidade de criar categoria;
- não apresentar Salvar.

Exibir mensagem explicando a razão do modo somente leitura.

Texto desta unidade:

“As categorias desta memória não podem mais ser alteradas porque o período de edição já terminou.”

A mensagem deve ser percebida como explicação de estado, não como erro.

# 9. Orientação Progressiva

A categorização continua podendo utilizar CMP-005 — Orientação Progressiva com as mensagens já definidas para iniciante, intermediário e avançado.

Nesta unidade, a orientação progressiva pertence apenas ao modo editável e não substitui a mensagem condicional sobre múltiplas categorias.

Mensagens vigentes:

- iniciante: “Escolha uma categoria que represente esta memória. Se ela ainda não existir, basta escrever o nome.”
- intermediário: “Escolha a categoria que melhor representa o contexto desta memória.”
- avançado: “Categorias consistentes tornam mais perceptíveis os temas que atravessam suas memórias.”

A posição visual exata dessa orientação dentro da nova tela será validada no marco de layout.

# 10. Marco obrigatório de validação do layout

Esta unidade cria uma nova composição de tela e materializa o seletor real de categoria. Por isso, não concluir toda a lógica funcional antes de validar sua forma com o operador.

## Marco 1 — construção visual

Materializar primeiro a tela de Categorização com dados de teste ou integração mínima suficiente para observar, no mínimo:

- header com título Categorização;
- caixa integral da memória com cinco linhas e rolagem;
- área de categorias selecionadas com duas linhas fixas;
- centralização vertical quando houver apenas uma linha;
- etiquetas com X;
- estado com muitas categorias e rolagem;
- mensagem de múltiplas categorias e seu deslocamento do conteúdo abaixo;
- campo de pesquisa;
- lista com aproximadamente cinco resultados visíveis;
- estado de item selecionado;
- busca vazia;
- busca simples com resultados;
- estado de criação de nova categoria;
- criação acompanhada de sugestões aproximadas;
- modo histórico somente leitura e sua mensagem;
- comportamento em diferentes larguras relevantes.

Apresentar esse marco ao operador.

## Marco 2 — batimento e ajuste

Antes de prosseguir para a integração completa de persistência e catálogo, realizar um batimento com o operador sobre:

- hierarquia visual;
- espaçamentos;
- tamanhos relativos;
- comportamento das duas rolagens internas;
- legibilidade das categorias selecionadas;
- clareza do X;
- aparência da opção “criar nova categoria”;
- distinção entre resultados normais e sugestões aproximadas;
- mensagem de múltiplas categorias;
- mensagem de modo histórico;
- responsividade.

Ajustes visuais aprovados nesse marco passam a integrar a unidade.

## Marco 3 — comportamento funcional

Depois da aprovação visual, concluir:

- pesquisa e debounce;
- normalização;
- busca aproximada reutilizável;
- seleção/desseleção;
- persistência local por Salvar;
- categorias locais derivadas das associações;
- catálogo preservado versionado;
- retorno e restauração de rolagem;
- historicidade;
- testes e verificações finais.

A ordem técnica interna pode ser ajustada se necessário, mas a validação visual deve ocorrer antes de a unidade ser tratada como funcionalmente concluída.

# 11. Cenários mínimos de validação

Validar, no mínimo:

- lista com memória sem categoria;
- lista com uma categoria;
- lista com várias categorias;
- abertura da memória correta;
- memória curta na caixa de cinco linhas;
- memória longa com rolagem interna;
- uma categoria selecionada centralizada verticalmente;
- duas linhas de categorias selecionadas;
- quantidade que exija rolagem da área selecionada;
- remover pelo X;
- remover clicando novamente na lista;
- selecionar várias categorias sem limite artificial;
- mensagem de categoria dominante ao selecionar a segunda;
- desaparecimento da mensagem ao voltar para uma categoria;
- busca vazia com todas as categorias em ordem alfabética;
- busca ignorando caixa;
- busca ignorando acentuação;
- busca ignorando espaços externos;
- busca simples com pelo menos um resultado sem executar/misturar fuzzy;
- busca sem resultado simples entrando no fallback aproximado;
- texto digitado aparecendo primeiro como opção de criação;
- categoria aproximada aparecendo abaixo;
- ausência de aproximações deixando apenas a criação;
- criação de categoria local;
- nova categoria disponível em outra memória depois de Salvar;
- categoria local ainda disponível enquanto houver ao menos uma associação local;
- desaparecimento depois de perder a última associação local, quando nunca preservada;
- categoria preservada permanecendo disponível depois de retirada da memória atual;
- catálogo local reutilizado quando a revisão não mudou;
- aplicação de delta de categoria nova;
- aplicação de delta de inativação;
- aplicação de delta de reativação;
- Salvar sem alteração não criando pendência artificial;
- Salvar com alteração persistindo antes do retorno;
- falha de persistência mantendo a tela aberta;
- retorno sem alterações;
- retorno com alterações solicitando confirmação de perda;
- retorno depois de Salvar restaurando aproximadamente a posição da lista;
- abandono confirmado restaurando aproximadamente a posição da lista;
- memória histórica sem controles de alteração;
- memória histórica com mensagem explicativa;
- memória histórica sem Salvar;
- autorização válida ao abrir permanecendo durante a mesma sessão;
- nova abertura reavaliando o prazo;
- responsividade do seletor e ausência de overflow horizontal indevido.

# 12. Decisões técnicas deixadas ao programador

Pertencem ao programador, desde que o comportamento acima seja preservado:

- evolução concreta do schema IndexedDB;
- estrutura de índices para categorias locais;
- nomes de tipos, módulos e funções;
- arquitetura do serviço mockado de catálogo;
- tempo exato do debounce;
- algoritmo de distância/similaridade;
- limiar da correspondência aproximada;
- eventual dependência externa ou implementação própria do algoritmo;
- mecanismo de ordenação alfabética sensível à localidade;
- forma de virtualização, caso algum dia seja útil;
- mecanismo preciso de restauração aproximada da rolagem;
- CSS concreto e medidas exatas aprovadas no batimento;
- estratégia e granularidade dos testes automatizados.

A lógica genérica de normalização e correspondência aproximada não deve ficar acoplada ao CMP-006, para permitir reutilização futura.

# 13. Critérios de conclusão

A unidade está concluída quando:

- a aba Categorizar e Tom possui lista real usando CMP-008 — Memória;
- clicar numa memória abre a tela Categorização;
- a nova tela foi validada visualmente pelo operador antes da conclusão da lógica;
- a memória aparece integralmente em caixa de cinco linhas com rolagem;
- a área de selecionadas mantém duas linhas fixas e rolagem;
- categorias podem ser adicionadas e removidas sem limite artificial;
- a mensagem de múltiplas categorias funciona sem bloquear;
- o seletor pesquisa com debounce;
- a busca simples ignora caixa, acentuação e espaços externos;
- a busca difusa só ocorre depois de zero resultados simples;
- a opção de criação aparece antes das sugestões aproximadas;
- a lógica aproximada foi separada para reutilização;
- categorias locais só existem enquanto houver associação local;
- categorias preservadas utilizam cache/versionamento próprio;
- o contrato incremental evita retransmissão integral do catálogo a cada data;
- inativação e reativação podem ser representadas pelo cache local sem o front assumir a decisão servidora;
- Salvar persiste o conjunto final no workspace e retorna à lista;
- abandono modificado possui proteção contra perda;
- a rolagem da lista é restaurada aproximadamente ao retornar da edição;
- memória histórica apresenta apenas consulta das categorias e mensagem explicativa;
- Tom, balanço sentimental e navegação interna entre perspectivas da memória não foram antecipados.

## Resultado esperado

Depois da 05.09, a Captura do dia possuirá categorização funcional de ponta a ponta no front: lista real, edição completa do conjunto de categorias, criação local, pesquisa normalizada com fallback aproximado, historicidade, persistência local e catálogo preservado preparado para sincronização incremental futura.

O Tom continuará deliberadamente fora dessa unidade. A próxima especificação poderá ser escolhida a partir do estado real resultante, incluindo a futura integração entre edição textual, categorização e Tom ou outra frente que se mostre mais adequada.

---

## Continuidade

### Sessão de 22/09/2026 — clarificação e primeiro marco

- Leitura inicial concluída: AGENTS, índice, memória técnica, esta Especificação e referências pertinentes de componentes, trabalho local e ambiente visual. Fonte consultado seletivamente.
- Estado inicial: `develop`, commit `8f06b5b`; remoção prévia de `08-componente-de-memoria.md`, inclusão de sua cópia em `concluidas/` e inclusão desta Especificação ainda não rastreadas. Preservar esse trabalho; sem commit ou push nesta sessão.
- Indicadores de contexto: antes das leituras e após a leitura inicial/antes do fonte, percentual e capacidade total não disponíveis. Não estimados retrospectivamente.

### Decisões esclarecidas com o operador

1. O contexto integral inclui texto original e complementos, em sequência.
2. As associações conservam a ordem de seleção; a primeira selecionada é apresentada na prévia compacta.
3. A indisponibilidade do catálogo não bloqueia o trabalho com categorias locais. Na primeira utilização, o conjunto pode estar vazio e o usuário cria categorias pelo texto digitado.
4. Selecionadas continuam nos resultados, destacadas e desmarcáveis tanto pelo resultado quanto pelo X.
5. Revisão expressa da seção 5.2 e dos cenários correlatos: não há compartilhamento de categorias exclusivamente locais entre capturas. O conjunto disponível combina categorias ativas do catálogo servidor com categorias em uso nas memórias do workspace aberto. Não consultar os demais workspaces para compor esse conjunto.
6. Uma categoria que o servidor inativou continua consultável e selecionável na captura pendente que ainda a utiliza. Não aparece em outra captura por esse motivo. Sem associação restante na captura e sem estado ativo no catálogo, deixa de integrar o conjunto disponível; pode ser criada manualmente novamente.
7. A inativação servidora ocorre após preservação sem uso no acervo e chega por nova versão do catálogo. O front não decide a inativação global.

### Plano e pontos de validação

1. **Construído e tecnicamente verificado — apresentação:** componentes reutilizáveis da tela e seletor em laboratório, com dados de teste e interação transitória. Inclui texto/complementos, selecionadas, rolagens, pesquisa, criação, sugestões e consulta histórica. Entregue para avaliação, sem aceite visual presumido.
2. **Aprovado pelo operador:** avaliação visual concluída, sem sugestões de alteração.
3. **Implementado e tecnicamente verificado — integração:** lista real em CapturaDia, autorização da memória original, proteção de saída, salvamento confirmado e retorno contextual; associações e catálogo incremental compatíveis, mantendo disponibilidade restrita à captura. Contratos documentados nas referências técnicas.
4. **Encerrada por determinação do operador:** após avaliar a apresentação e solicitar o ajuste de hover, o operador solicitou o Parecer final. Verificações técnicas e limites da validação registrados abaixo.

O marco visual não confirma gravações no IndexedDB e não representa aceitação funcional da unidade.

### Entrega do marco visual

- Página: `/laboratorio-categorizacao`, servida nesta sessão em `http://127.0.0.1:5173/laboratorio-categorizacao`. Servidor de desenvolvimento iniciado para o batimento.
- Componentes: `components/Categorizacao.tsx` e `components/SeletorCategoria.tsx`, estilos em `assets/categorizacao.css`; amostras e controles em `islands/LaboratorioCategorizacao.tsx`. `EstruturaCaptura` admite título opcional, preservando Capturar como padrão.
- O laboratório começa na edição de uma amostra. Voltar exibe três memórias com o componente real, sem categoria, com uma e com várias. Salvar altera somente as amostras na memória da página. Não há gravação local, sincronização ou proteção de abandono nessa demonstração. As abas são apenas contexto visual.
- Controles abaixo da tela: primeiro uso sem categorias, nenhuma/uma/muitas selecionadas, texto curto, modo histórico e catálogo somente local. A amostra longa inclui complemento separado do texto original dentro da mesma caixa rolável.
- Roteiro: conferir centralização de uma linha, duas linhas e rolagem com muitas etiquetas; remover pelo X e pelo resultado; observar a mensagem ao selecionar a segunda; pesquisar `f`, `FAMILIA`, `famlia` e `Astronomia`; verificar modo histórico e larguras estreita/ampla. Limpar a pesquisa restaura a lista alfabética. A ordem das selecionadas acompanha a seleção.
- Normalização e aproximação já isoladas em `app/utilitarios/pesquisaTexto.ts`; o laboratório usa debounce de 180 ms e só aproxima após zero resultados simples. Algoritmo inicial conservador, ainda sujeito ao batimento e aos cenários da integração.
- Verificações: formato e lint dos arquivos envolvidos aprovados; tipos da página nova e de CapturaDia aprovados; build cliente/servidor aprovado; dois testes do utilitário aprovados; página respondeu HTTP 200 com contexto e seletor renderizados. `git diff --check` sem erros. Não houve inspeção visual automatizada; responsividade e aparência aguardam avaliação do operador.
- Estado ao entregar: `develop`, sem commit/push; alterações documentais prévias preservadas. Persistência, catálogo, lista da captura real, autorização/reload, proteção de abandono e restauração contextual serão integrados após o batimento.
- Contexto ao final do marco: percentual e capacidade total não disponíveis.

### Integração após aprovação visual

- Operador aprovou a apresentação sem alterações e autorizou continuar.
- Falhas aprovadas: “Não foi possível salvar as categorias. Suas alterações continuam nesta tela. Tente novamente.” e “Não foi possível atualizar o catálogo de categorias. Você pode continuar com as categorias disponíveis nesta captura.” Na falha de sincronização, manter o catálogo armazenado, quando disponível, além das categorias da captura.
- Evolução técnica prevista: schema 5 adiciona somente `catalogosCategorias`, por `idConta`, com `revisao` e categorias `{id, nome, versao, ativa}`. Não apaga capturas. Associações opcionais `MemoriaLocal.categorias` comportam `{idCategoria: string | null, nome}`; ausência em registros antigos significa nenhuma categoria. Payload remoto de memória acrescenta `categories` opcional (`id`, `name`), preservando os campos e cenários anteriores. Não alterar chaves/cookies/rotas existentes.
- Autorização da categorização considera a primeira preservação da memória original, nunca o prazo de um complemento. Um marcador próprio guarda somente autorização/alvo/base para reload na mesma sessão; seleções transitórias não são restauradas.

### Entrega da integração funcional

- `CapturaDia` agora apresenta a lista real de Categorizar e Tom com `Memoria`, respeitando a ordem física e as categorias na ordem de seleção. A abertura usa a tela aprovada, com texto e complementos; Salvar aguarda commit, marca pendência somente quando o conjunto muda e retorna à lista. Voltar, logout e beforeunload usam a proteção vigente; retorno controlado restaura aproximadamente a região da memória.
- `EdicaoCategorizacao` compõe a apresentação aprovada com pesquisa e estado transitório. O modo histórico omite seletor, X e Salvar; o prazo é o da memória original. Tom continua ausente.
- Schema 5 e associações implementados conforme o contrato acima, sem limpeza de capturas v4. O catálogo sincroniza na abertura de cada captura, mesmo pendente, sob bloqueio por conta; cache/revisão independem da composição por data. Falhas usam os textos aprovados e o cache disponível.
- O conjunto final idêntico ao original não grava nem muda a ordem confirmada, mesmo após desmarcar/remarcar os mesmos itens. Quando há mudança do conjunto, a ordem salva é a ordem de seleção.
- Verificação técnica: **46 testes passaram**, sendo 11 cenários novos de categorização/catálogo/migração, 2 do utilitário de pesquisa e 33 de regressão da captura/edição/sessão. Tipos da CapturaDia e testes, lint dos arquivos envolvidos e build completo cliente/servidor aprovados. Verificações de IndexedDB usam fake-indexeddb e não equivalem a quota, disco ou encerramento abrupto de navegador real.
- Avaliação manual sugerida: abrir `/capturar`, escolher uma data, registrar duas memórias e entrar em Categorizar e Tom. Criar uma categoria na primeira, Salvar e reutilizar na segunda; remover as associações até o último uso e verificar seu desaparecimento. Em outra data, essa categoria local não deve aparecer. Experimentar abandono/cancelamento, reload, retorno à região da lista e a captura histórica. A aprovação visual anterior permanece registrada; não significa aceite desses comportamentos.
- Para catálogo remoto simulado, no console de desenvolvimento, a conta do mock vigente é `01K4Z5J6M7N8P9Q0R1S2T3V4W5`. `rememoreCategoriasMock.alterar("01K4Z5J6M7N8P9Q0R1S2T3V4W5", "cat-familia", "Família", true)` acrescenta/reativa; o mesmo comando com `false` inativa. Reabrir/recarregar a captura consulta deltas. Se a categoria estiver associada à captura pendente, continua disponível nela; em uma captura nova sem essa associação não aparece. `rememoreCategoriasMock.falhar("01K4Z5J6M7N8P9Q0R1S2T3V4W5", true)` simula falha; `false` restaura a consulta. Esses comandos não preservam memórias no servidor.
- Estado de entrega: `develop` no mesmo commit `8f06b5b`, alterações locais sem commit/push; movimentação documental prévia da 08 preservada. Continuidade e referências técnicas atualizadas; sem Parecer final e sem atualização do Drive.
- Indicadores de contexto ao final da integração: percentual e capacidade total não disponíveis.

### Ajuste durante a avaliação funcional

- A pedido do operador, o destaque de `Memoria` passou a responder ao hover da caixa inteira, incluindo legenda e espaços internos, em vez de depender do botão sobre o texto. Borda e sombra usam transição de 180 ms na entrada e na saída. A preferência de movimento reduzido desativa a animação. Ajuste compartilhado em `assets/memoria.css`; aguarda avaliação visual do operador.

### Encerramento da sessão

- Especificação encerrada por solicitação do operador; Parecer final preparado abaixo e entregue ao operador neste arquivo para transporte ao analista e ao registro canônico. O Drive não foi atualizado.
- Contexto ao encerramento: **57% utilizados, informado pelo operador**. Capacidade total não informada. Os indicadores anteriores permanecem indisponíveis, sem reconstrução retrospectiva.
- Mantido `develop`, sem commit ou push; alterações prévias e corpo aprovado preservados. Próxima unidade a definir pelo operador.

## Parecer final

A Especificação 09 foi implementada e encerrada por determinação do operador. A aba **Categorizar e Tom** de `/capturar/{data}` utiliza o componente `Memoria` e abre a tela **Categorização**, construída com `Categorizacao`, `EdicaoCategorizacao` e `SeletorCategoria` (CMP-006). A apresentação foi aprovada antes da integração funcional. O laboratório `/laboratorio-categorizacao` permanece disponível com amostras sem persistência.

Foram entregues contexto integral em caixa rolável de cinco linhas, categorias selecionadas em área fixa de duas linhas, seleção e remoção, orientação para múltiplas categorias, pesquisa normalizada com debounce e aproximação somente após ausência de resultados simples. A opção de criação precede as sugestões. Salvar confirma as associações no IndexedDB antes de retornar à lista; falhas mantêm a edição aberta. Abandono modificado possui proteção, e o retorno procura restaurar a região da memória. O modo histórico omite controles de alteração e apresenta a explicação prevista.

Decisões e consequências que devem ser reconciliadas com a documentação funcional:

- **Disponibilidade restrita à captura:** por decisão expressa do operador, substituiu-se o compartilhamento entre todos os workspaces da conta previsto na seção 5.2. O seletor combina categorias ativas do catálogo servidor com categorias utilizadas nas memórias da captura aberta, sem consultar outras capturas. Uma categoria inativa no servidor continua disponível na captura pendente que ainda a utiliza; não aparece em outra captura por esse motivo. Sem associação restante na captura e sem estado ativo no catálogo, deixa de estar disponível, podendo ser criada manualmente novamente.
- **Contexto e historicidade:** a caixa de leitura inclui o texto original e os complementos em sequência. A autorização das categorias considera a primeira preservação da memória original; um complemento recente não renova esse prazo. Reload da mesma sessão conserva a autorização, mas descarta seleções ainda não salvas, como permitido nesta unidade.
- **Ordem das categorias:** segue a ordem de seleção, com a primeira apresentada na prévia. A comparação para Salvar é por conjunto: desmarcar e remarcar exatamente os mesmos itens não grava, não cria pendência e mantém a ordem confirmada anterior.
- **Catálogo e falhas:** o catálogo preservado possui cache por conta, versões individuais e revisão global, com serviço incremental ainda mockado. Na indisponibilidade, o catálogo armazenado é mantido quando acessível e o usuário pode continuar com as categorias disponíveis na captura, inclusive criar a primeira categoria local. Os avisos de falha de salvamento e sincronização foram aprovados pelo operador. O schema 5 adiciona o catálogo sem apagar capturas existentes.
- **Componente compartilhado:** a pedido do operador, o destaque de `Memoria` passou a abranger toda a caixa e recebeu transição de borda e sombra de 180 ms na entrada e na saída, respeitando movimento reduzido.

Passaram 46 testes automatizados e as verificações pertinentes de tipos, lint e build. Esses resultados não representam validação exaustiva de quota, disco ou encerramento abrupto no navegador, nem um aceite individual de todos os cenários manuais. Não foi identificada funcionalidade pendente dentro do escopo acordado. Tom, balanço sentimental, navegação entre perspectivas da memória, Revisar e Preservar funcional e backend real permanecem fora desta unidade; a decisão servidora de inativação e a reconciliação após preservação continuam futuras.

