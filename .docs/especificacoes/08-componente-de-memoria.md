# 05.08 - Componente de Memória

## Estado

Oitava unidade de desenvolvimento da fase 05 - Especificação. Este corpo passa a constituir a instrução da unidade quando aprovado pelo autor. Depois da aprovação, permanece como registro histórico imutável da entrada do desenvolvimento e somente recebe Parecer final no encerramento.

## Origem funcional

04.06 - Especificação Funcional - Capturar / Registrar e organizar, Categorizar e Tom e Revisar e Preservar.

04.07 - Regras - Capturar / existência e ciclo de vida das categorias e valor funcional do Tom.

04.08 - Componentes - Capturar / origem conceitual dos futuros controles de categoria e Tom, somente no que for necessário para compreender as informações que o componente de memória deverá conseguir apresentar.

05.01 - Fundação Visual e Página Inicial / laboratório visual já existente em /laboratorio.

05.07 - Registrar e Organizar / lista atualmente materializada e fallback de prévia em até três linhas, que permanece no produto durante esta unidade.

## Autossuficiência da instrução

As referências acima registram somente a origem documental utilizada para elaborar a unidade. O programador não deve consultá-las para completar esta instrução. Durante o trabalho, seu contexto funcional é o Contexto do Desenvolvimento do Rememore, esta Especificação e o código necessário à unidade.

Esta unidade não materializa Categorizar e Tom nem Revisar e Preservar e não altera a lista real já existente em Registrar e organizar. Seu resultado termina no laboratório.

## Objetivo

Construir e fechar visualmente, em /laboratorio, um componente reutilizável de apresentação de memória preparado inicialmente para três contextos de Capturar:

- Registrar e organizar;
- Categorizar e Tom;
- Revisar e Preservar.

O componente deve ser uma única peça reutilizável. O contexto de uso, o conteúdo da memória, suas categorias, seu Tom e, quando aplicável, sua posição na lista determinam o que ele apresenta. Não devem ser criados três componentes independentes para reproduzir a mesma unidade visual.

A unidade possui também uma etapa experimental própria para descobrir a linguagem visual do Tom antes de implementá-la de forma completa no componente real. Essa exploração é parte deliberada do trabalho e deve ocorrer no laboratório antes da colorização definitiva.

A linguagem visual do Tom descoberta nesta unidade deve ser tecnicamente reaproveitável por outras superfícies futuras do Rememore. O componente de memória será seu primeiro consumidor real, mas a lógica de aparência do Tom não deve ficar acoplada de forma exclusiva à estrutura interna desse componente.

## Limite principal da unidade

Todo o trabalho funcional desta Especificação permanece em /laboratorio.

O componente atualmente usado em Registrar e organizar não deve ser substituído nesta unidade. Nenhuma página real de Capturar deve passar a depender do novo componente. A integração será tratada posteriormente, depois que o componente estiver visualmente aprovado.

Os controles criados no laboratório são instrumentos de experimentação. Eles não constituem os futuros seletores reais de categoria ou Tom, não criam contratos funcionais para essas telas e não devem antecipar suas funcionalidades.

## Contrato do componente de memória

### Informações recebidas do chamador

O componente não deve buscar por conta própria as informações necessárias à apresentação da memória. O chamador fornece os dados e o contexto; o componente deriva deles a aparência e os estados visuais correspondentes.

O componente deve receber, no mínimo:

- o conteúdo integral da memória;
- o contexto em que está sendo apresentado: Registrar e organizar, Categorizar e Tom ou Revisar e Preservar;
- uma lista de categorias associadas, que pode estar vazia, conter uma categoria ou conter várias;
- o Tom da memória, quando existente, como valor no intervalo -100 a +100, ou a indicação inequívoca de ausência de Tom;
- somente quando o contexto for Registrar e organizar, a indicação de a memória ser a primeira da lista;
- somente quando o contexto for Registrar e organizar, a indicação de a memória ser a última da lista.

Quando a mesma memória for simultaneamente a primeira e a última, o componente deve reconhecer o caso de memória única.

O chamador fornece informações funcionais, e não textos de apresentação já montados. Por exemplo, o chamador não deve precisar produzir “Sem categoria”, “Categoria +2”, decidir se o legend desaparece ou calcular quais botões ficam inativos. Essas são consequências dos dados recebidos e do contexto, tratadas pelo próprio componente.

Da mesma forma, Tom ausente e Tom 0 são entradas diferentes. O componente deve preservar essa distinção sem exigir que o chamador fabrique estados visuais.

### Ações emitidas pelo componente

O componente deve expor ações próprias para que o chamador decida o comportamento da tela.

Devem existir, no mínimo, três tipos de ação:

- acionamento do componente de memória como um todo;
- acionamento de Elevar;
- acionamento de Rebaixar.

O acionamento do componente como um todo não deve conhecer nem executar navegação específica. Ele apenas comunica ao chamador que aquela memória foi acionada. Futuramente, cada contexto poderá reagir de maneira diferente.

Em Registrar e organizar, esse acionamento poderá ser usado pela aba para abrir a edição da memória.

Em Categorizar e Tom, poderá ser usado pela aba para abrir a experiência de edição de categoria e Tom.

Essas consequências futuras não são implementadas nesta unidade.

Elevar e Rebaixar emitem ações independentes. Acionar um desses controles não pode também disparar a ação de clique do componente como um todo.

Quando um controle de ordenação estiver inativo, ele não deve emitir sua ação.

O componente é responsável por apresentação, estados visuais e emissão das ações. Ele não deve incorporar persistência, IndexedDB, rotas, regras de navegação ou decisões específicas da tela chamadora.

### Evolução futura

Nesta unidade o componente nasce com exatamente os três contextos conhecidos: Registrar e organizar, Categorizar e Tom e Revisar e Preservar.

Não devem ser inventados modos adicionais, propriedades especulativas ou uma matriz genérica de comportamentos futuros apenas para tentar antecipar necessidades ainda não definidas.

Ao mesmo tempo, a implementação não deve tornar artificialmente impossível acrescentar uma nova variante de apresentação no futuro. É aceitável estruturar o componente de forma extensível, desde que somente os três comportamentos atuais sejam materializados agora.

## Componente real de memória

### Unidade visual

A caixa externa comporta todo o componente. O resultado deve ser percebido como uma única caixa, não como uma composição de pequenos boxes independentes.

A caixa possui borda e sombra e deve manter aparência compacta, sem margens ou espaçamentos internos excessivos. Sua linguagem visual deve ser próxima à de uma caixa de texto do Bulma já integrada ao tema do Rememore.

A superfície principal da caixa possui estado normal e resposta visual ao passar do mouse, semelhante à resposta esperada de um campo de texto interativo. Os controles internos que forem clicáveis possuem seus próprios estados de hover.

A definição fina de espessura de borda, raio, sombra, padding, intensidade dos hovers e demais medidas visuais será calibrada no laboratório com o operador.

O CSS definitivo deste componente deve permanecer isolado em arquivo próprio. A organização e os nomes técnicos exatos ficam a cargo do programador, mas a aparência do componente não deve depender de estilos definitivos espalhados pelo laboratório ou pelas páginas que futuramente o utilizarão.

### Região de categoria integrada à borda

Quando o contexto determinar apresentação de categoria, sua identificação ocupa visualmente a própria linha da borda superior da caixa.

A referência conceitual é a posição vertical de um fieldset/legend: o texto cruza a altura da borda superior, ficando aproximadamente metade acima e metade dentro da caixa. Ele não deve ser colocado como um título comum acima do componente.

A identificação começa depois de um pequeno trecho visível de borda à esquerda; não fica encostada na lateral. A borda superior continua depois do texto.

O acabamento desejado combina essa posição de legend com uma transição arredondada e integrada semelhante ao encontro visual de uma aba do Chrome com a barra que a contém: sem seta, sem bloco destacado independente e sem uma quebra seca na moldura.

O uso literal dos elementos HTML fieldset e legend não é obrigatório. Se a semântica, a acessibilidade ou o acabamento forem melhores com outra construção, o programador pode reproduzir o mesmo resultado visual por técnica equivalente.

O texto da categoria deve possuir destaque moderado e ser um pouco maior que o texto da memória.

### Área de texto nos modos compactos

Registrar e organizar e Categorizar e Tom utilizam uma apresentação compacta.

A memória é apresentada em uma área de no máximo três linhas, sem barra de rolagem interna e sem reticências artificiais.

O texto fica alinhado horizontalmente à esquerda e o bloco de texto fica verticalmente centralizado dentro da região reservada. Uma memória de uma linha aparece centralizada verticalmente; uma memória de duas linhas também; conteúdo maior ocupa naturalmente a região prevista.

Quando houver conteúdo além da prévia, a continuidade é indicada por efeito de gradiente na parte inferior da área de texto. O gradiente permanece posicionado na mesma região independentemente da quantidade de linhas. É aceitável e deliberado que textos curtos recebam leve esmaecimento quando atravessarem a região em que o gradiente começa.

O gradiente deve terminar na cor de fundo efetiva do componente. Se o modelo de Tom escolhido alterar o fundo, o gradiente deve acompanhar essa alteração e não terminar numa cor neutra incompatível.

## Contexto: Registrar e organizar

Registrar e organizar utiliza a versão compacta do componente.

### Texto

A memória é apresentada em até três linhas, com o alinhamento e o gradiente definidos acima.

### Categoria

Se a memória não possuir categoria, nenhuma indicação de ausência é mostrada e nenhuma área vazia é reservada para o legend. A borda superior permanece contínua.

Se existir categoria, a identificação integrada à borda aparece.

Quando houver uma única categoria, apresenta seu nome.

Quando houver mais de uma, apresenta somente a primeira categoria e uma indicação compacta da quantidade excedente, seguindo o padrão visual a ser fechado no laboratório, preferencialmente no formato:

Categoria principal +N

Exemplo: Família +2.

A intenção é manter uma categoria visualmente principal e não transformar a caixa numa coleção de marcadores.

### Tom

Se a memória já possuir Tom, sua representação visual também aparece neste contexto usando exatamente o mesmo sistema de Tom aprovado para o componente.

Se não possuir Tom, apresenta a aparência neutra normal do componente e não apresenta o indicador estrutural de existência de Tom.

### Controles de ordenação

À direita da caixa existe uma região estreita com dois botões empilhados verticalmente:

- elevar, acima;
- rebaixar, abaixo.

Os dois botões permanecem integrados à caixa e não possuem borda própria. Devem parecer ações pertencentes à mesma unidade visual, não pequenos boxes independentes.

Cada botão ativo possui resposta visual própria ao hover.

Os controles permanecem estruturalmente presentes mesmo quando indisponíveis. A indisponibilidade não remove o botão nem altera a geometria da caixa.

Quando o componente receber a indicação de primeira memória, Elevar fica inativo.

Quando receber a indicação de última memória, Rebaixar fica inativo.

Quando receber simultaneamente as indicações de primeira e última, ambos ficam inativos.

O laboratório deve permitir testar esses estados sem exigir uma lista funcional real. A ação de reordenar dados persistidos não pertence a esta unidade.

## Contexto: Categorizar e Tom

Categorizar e Tom também utiliza a versão compacta do componente, mas não apresenta os controles de elevar e rebaixar.

### Texto

A memória é apresentada em até três linhas com o mesmo alinhamento e efeito de gradiente dos demais modos compactos.

### Categoria

A região integrada à borda superior sempre comunica o estado de categorização.

Sem categoria associada, apresenta:

Sem categoria

Esse texto deve aparecer esmaecido, para comunicar ausência de valor e para que não seja confundido com uma categoria real que eventualmente se chame literalmente “Sem categoria”.

Com uma categoria, apresenta seu nome com aparência normal.

Com mais de uma categoria, apresenta somente a primeira e a quantidade excedente, pelo mesmo padrão compacto de Registrar e organizar.

### Tom

Quando houver Tom informado, apresenta a representação visual aprovada.

Quando não houver Tom, mantém a aparência sem Tom definida para o componente.

As ações reais que futuramente abrirão categorização ou Tom não pertencem a esta unidade.

## Contexto: Revisar e Preservar

Revisar e Preservar utiliza a versão completa do componente.

### Categorias

A identificação continua integrada à borda superior.

Sem categoria associada, apresenta “Sem categoria” esmaecido.

Quando existirem categorias, todas devem ser apresentadas. Elas aparecem separadas por vírgula e podem ocupar mais de uma linha quando o espaço exigir.

Nesse contexto não existe compactação para primeira categoria +N, pois a revisão deve permitir ao usuário conferir integralmente a categorização que será preservada.

O laboratório deve permitir observar como a região integrada à borda se comporta quando a lista de categorias quebra em múltiplas linhas. O resultado precisa preservar a sensação de que a identificação pertence à moldura da caixa. O mecanismo visual exato para acomodar múltiplas linhas será fechado durante a experimentação.

### Texto

O texto da memória é apresentado integralmente.

Não existe limite de três linhas, gradiente, rolagem interna ou altura padronizada para a memória.

A caixa cresce verticalmente de acordo com o conteúdo e diferentes memórias podem produzir componentes de alturas bastante diferentes.

Essa diferença é deliberada: os modos de trabalho priorizam compactação e coesão de lista; a revisão prioriza a leitura integral da composição.

### Tom

O mesmo sistema visual de Tom aprovado para o componente é utilizado sem criar uma representação específica para Revisar e Preservar.

## Tom — linguagem visual reutilizável

A representação do Tom definida nesta unidade deve ser tratada como uma linguagem visual reutilizável, e não como uma característica exclusiva do componente de memória.

O laboratório e o componente de memória são o local em que essa linguagem será descoberta e calibrada inicialmente. A solução técnica deve permitir que outra superfície futura receba um valor de Tom ou sua ausência e aplique os mesmos princípios visuais sem depender da estrutura interna do componente de memória.

Isso inclui, quando forem aprovados, os parâmetros de cor por tema, interpolação ao longo do eixo, intensidade, presença estrutural de Tom, borda, sombra, fundo, contraste e demais propriedades que componham a solução final.

### Uso futuro conhecido, fora desta unidade

Futuramente, ao acionar uma memória na aba Categorizar e Tom, o usuário entrará em uma tela de edição própria.

Nessa experiência futura, a memória será apresentada integralmente em uma caixa com rolagem interna. Haverá controles para categoria e um seletor de Tom. Conforme o valor de Tom for alterado, essa caixa de visualização deverá refletir a mesma linguagem visual definida nesta Especificação.

Essa futura caixa não precisa ser o próprio componente de memória e não deve ser implementada agora. O requisito desta unidade é somente evitar que a lógica visual de Tom seja construída de maneira impossível de reutilizar.

Também futuramente, Registrar e organizar poderá abrir uma experiência de criação ou edição textual da memória ao acionar o componente. Essa edição não precisa receber ou representar Tom. Esse comportamento também permanece fora desta unidade.

## Tom — etapa experimental anterior ao componente definitivo

A representação do Tom é a parte visual mais incerta desta unidade. Para evitar implementar integralmente várias soluções no componente real, o trabalho deve começar por uma exploração visual barata no laboratório.

### Amostras fake

Antes de aplicar Tom ao componente definitivo, criar uma área de laboratório com pequenas representações fake de uma memória.

Essas amostras não precisam utilizar o componente real nem possuir seus comportamentos completos. Precisam apenas reproduzir geometria, fundo, borda, sombra, identificação de categoria e texto suficientes para comparar estratégias de aplicação do Tom.

Todas as alternativas devem reagir às mesmas escolhas de cor e ao mesmo valor experimental de Tom, permitindo comparação direta.

Devem ser apresentados, no mínimo, os modelos debatidos durante a definição da unidade:

- colorização ampla do componente, explorando fundo, borda, sombra, categoria, gradiente e, se necessário, texto;
- faixa lateral interna + borda externa + sombra tonalizadas;
- faixa lateral interna + borda externa tonalizada;
- faixa lateral interna + sombra tonalizada;
- somente borda externa tonalizada, como comparação visual;
- somente faixa lateral interna tonalizada;
- faixa lateral interna + texto da categoria tonalizado, mantendo o restante neutro.

As amostras podem permanecer disponíveis no laboratório depois da escolha do modelo. Elas são referência de experimentação e não fazem parte do produto.

### Escolha das cores extremas

O laboratório deve permitir escolher e alterar visualmente as duas cores extremas do eixo de Tom:

- extremo negativo;
- extremo positivo.

As cores são específicas por tema. Ao final da calibração existirão, portanto, uma cor negativa e uma positiva para o tema claro e uma cor negativa e uma positiva para o tema escuro.

A apresentação concreta dos controles deve obedecer ao tema atualmente selecionado no laboratório e integrar-se ao estado compartilhado entre os blocos do laboratório.

As amostras fake e, posteriormente, o componente real devem reagir imediatamente às alterações dessas cores durante a experimentação.

Depois da aprovação, as cores escolhidas e os parâmetros necessários deixam de ser dependências do painel experimental e são fixados nos arquivos CSS apropriados para utilização normal do sistema. Os controles podem continuar disponíveis no laboratório como ferramenta de calibração, mas o funcionamento do produto não deve depender deles.

### Ponto obrigatório de validação

A etapa de amostras fake deve ser apresentada ao operador antes da implementação maciça da colorização no componente real.

O programador não deve investir na aplicação completa de todas as variações do Tom ao componente definitivo antes de o operador escolher qual linguagem visual será trabalhada.

A escolha pode combinar características observadas em mais de uma amostra. O objetivo das amostras é reduzir o espaço de decisão antes da construção definitiva, não transformar cada alternativa em uma implementação final completa.

## Tom — comportamento do componente definitivo

### Valor funcional

O laboratório precisa representar o eixo contínuo já definido para o Tom:

-100 até +100.

Valores negativos caminham em direção à cor extrema negativa do tema.

Valores positivos caminham em direção à cor extrema positiva do tema.

O valor 0 representa Tom neutro.

Tom não informado é ausência de valor e permanece diferente de 0.

O laboratório deve possuir um estado explícito de “sem Tom” separado do controle de valor. Habilitar Tom e posicionar o range em 0 precisa produzir um estado diferente de manter o Tom desabilitado.

### Indicador inequívoco de existência de Tom

A solução atualmente definida para o componente final utiliza uma faixa ou borda interna mais espessa colada à lateral esquerda da caixa, acompanhando sua curvatura.

Sem Tom informado, essa faixa não existe.

Com Tom informado, a faixa existe inclusive quando o valor é 0.

Nos valores negativos ou positivos, a faixa utiliza uma representação forte da cor correspondente ao valor.

No neutro informado, a faixa utiliza uma aparência neutra coerente com o tema, mas continua perceptível como elemento estrutural.

Assim, a presença ou ausência de Tom não depende somente de perceber uma diferença cromática: a própria existência da faixa distingue “Tom informado” de “sem Tom”.

As amostras experimentais podem incluir alternativas puras que não utilizem a faixa, para comparação. Porém, a aplicação definitiva deve preservar uma distinção inequívoca entre ausência e Tom neutro; a faixa lateral é a solução definida nesta unidade enquanto não houver decisão expressa do operador em sentido diferente durante a validação.

### Variação da cor

O valor do Tom deve produzir variação contínua entre o estado neutro e a respectiva cor extrema. Não devem ser criadas faixas discretas arbitrárias apenas para simplificar a implementação.

A técnica de interpolação e o espaço de cor utilizados são decisões técnicas do programador, desde que o resultado visual seja contínuo e possa ser calibrado adequadamente nos temas claro e escuro.

### Regiões calibráveis

O modelo preferencial é permitir que diferentes partes do componente recebam intensidades diferentes da cor do Tom.

Devem ser tratadas de forma suficientemente independente no CSS para que possam ser calibradas durante o laboratório:

- fundo da caixa;
- borda externa;
- sombra;
- faixa lateral interna;
- texto da categoria;
- gradiente da prévia;
- texto da memória, se necessário para contraste ou acabamento.

A colorização ampla é o objetivo inicial, mas não é obrigatória se os testes mostrarem que prejudica leitura, harmonia ou clareza.

A estratégia pode ser reduzida progressivamente para uma solução mais contida, preservando somente as regiões que produzirem bom resultado. Entre os fallbacks possíveis estão faixa + borda + sombra, faixa + borda, faixa + sombra ou apenas faixa.

A cor do texto da memória pode permanecer neutra se isso produzir melhor legibilidade. Também pode receber ajuste de intensidade ou cor caso o fundo escolhido exija contraste. O mesmo vale para o texto da categoria. Nenhuma dessas regiões deve ser tecnicamente acoplada de modo que uma pequena calibração obrigue a reconstrução de toda a estratégia.

### Fundo e gradiente

Quando o modelo escolhido colorir o fundo, a cor deve permanecer harmonizada ao fundo normal da caixa e ao tema atual. A intensidade do Tom não deve transformar automaticamente toda a superfície na cor extrema.

O gradiente da prévia deve terminar sobre a cor de fundo efetiva da caixa em cada valor de Tom.

## Organização do laboratório

A página /laboratorio já possui responsabilidades suficientes para que seu código não permaneça concentrado num único componente de página. Esta unidade deve aproveitar a entrada do componente de memória para estabelecer uma organização modular que continue sustentável conforme novos experimentos forem adicionados.

### Blocos atuais

O laboratório passa a ser composto, no mínimo, por três blocos funcionais independentes:

1. seleção de tema e definição/calibração das cores dos temas;
2. visualização do tema e das cores aplicadas;
3. definição e experimentação do componente de memória.

Cada um desses blocos deve ser materializado como componente de código isolado em arquivo próprio. A página do laboratório deve compor esses componentes, e não absorver internamente toda a implementação de cada experimento.

O objetivo dessa separação é impedir que /laboratorio se transforme progressivamente num arquivo monolítico e facilitar a inclusão de novos blocos de laboratório nas futuras unidades.

A organização de diretórios, os nomes dos arquivos e a abstração compartilhada ficam a cargo do programador.

### Expansão e recolhimento

Cada um dos três blocos deve aparecer dentro de uma seção visual que possa ser expandida ou recolhida independentemente.

O estado de expansão/recolhimento dos três blocos deve ser persistido localmente no navegador.

Depois de recarregar a página, reiniciar a aplicação ou voltar posteriormente ao laboratório no mesmo ambiente local, cada bloco deve reaparecer no estado de expansão em que foi deixado.

Essa persistência é preferência de uso do laboratório e não dado funcional do Rememore. Pode utilizar localStorage ou mecanismo local equivalente considerado mais apropriado pelo programador.

Não existe nesta unidade obrigação de persistir todos os demais controles experimentais do componente de memória. A persistência obrigatória adicionada aqui é a dos estados de expansão/recolhimento. Comportamentos de persistência já existentes para tema e cores devem ser preservados.

### Estado de tema compartilhado

A separação dos blocos em componentes de código não os transforma em ilhas visuais independentes.

O bloco de seleção de tema e cores permanece a origem das escolhas de tema e da calibração global já existente no laboratório.

O bloco de visualização do tema deve reagir às escolhas feitas ali.

O bloco de componente de memória, incluindo as amostras fake do Tom e o componente real em experimentação, também deve reagir ao mesmo tema e às cores relevantes.

Ao alternar entre claro e escuro ou modificar uma cor de calibração, todas as áreas visíveis que dependam desse estado devem refletir imediatamente a alteração correspondente.

As cores extremas de Tom permanecem parte da experimentação do componente de memória, mas são específicas do tema corrente: a calibração de claro é observada no ambiente claro, e a de escuro no ambiente escuro.

A arquitetura concreta de compartilhamento de estado pertence ao programador, desde que não haja duplicação incoerente de estados de tema entre os subcomponentes.

## Instrumentação do bloco de componente de memória

O bloco de componente de memória no laboratório deve permitir experimentar a peça sem depender de IndexedDB, backend ou páginas reais.

Deve existir controle suficiente para alterar, no mínimo:

- contexto do componente: Registrar e organizar, Categorizar e Tom ou Revisar e Preservar;
- texto da memória, inclusive conteúdo curto e longo;
- ausência, uma ou várias categorias;
- nomes das categorias;
- estado sem Tom;
- valor do Tom entre -100 e +100 quando habilitado;
- cores extremas negativa e positiva dos temas claro e escuro;
- indicação de primeira memória;
- indicação de última memória.

A forma desses controles pertence ao laboratório e pode ser simples. Não deve ser confundida com os controles futuros do produto.

Para categorias, basta uma maneira direta de adicionar, alterar e remover nomes usados nas amostras. Não implementar busca, criação real de categoria, persistência de categoria ou o futuro seletor real.

Para Tom, basta o estado habilitado/desabilitado, um range experimental e os controles de cores necessários à calibração. Não implementar o futuro seletor de Tom como interface de produto.

O laboratório deve permitir testar explicitamente uma categoria real cujo nome seja “Sem categoria”, para verificar que sua aparência normal continua inequívoca diante do estado de ausência “Sem categoria” esmaecido.

## Comportamento em listas

O componente será utilizado futuramente em listas nas três etapas. O laboratório deve permitir observar não apenas uma instância isolada, mas também um pequeno conjunto de componentes em sequência.

A lista de laboratório não precisa possuir persistência nem comportamento funcional real. Sua finalidade é permitir avaliar:

- espaçamento entre caixas;
- coesão visual da lista;
- componentes com e sem categoria;
- diferentes quantidades de categorias;
- diferentes valores de Tom;
- primeira, intermediária, última e única memória para os estados dos botões de ordenação;
- textos de tamanhos diferentes;
- no modo Revisar e Preservar, caixas de alturas diferentes na mesma lista.

Os eventos do componente podem ser demonstrados no laboratório por indicação simples de que foram disparados. Não é necessário criar navegação real nem alterar dados reais para provar seu funcionamento.

## Responsividade e casos de estresse

O componente deve ser avaliável em diferentes larguras por meio do laboratório e da própria responsividade do navegador.

A validação deve incluir nomes de categoria curtos e longos, várias categorias, texto de memória longo e espaço reduzido para os controles de ordenação.

A unidade não define novos breakpoints globais. O objetivo é evitar que o componente dependa de uma largura confortável para funcionar, que produza overflow horizontal indevido ou que perca a hierarquia visual definida.

## Cadência sugerida e validações progressivas

Esta unidade deve ser conduzida em blocos que reduzam retrabalho.

### Marco 1 — organização do laboratório e linguagem visual do Tom

Separar os blocos atuais do laboratório em componentes de código próprios, estabelecer expansão/recolhimento persistidos e preservar o estado compartilhado de tema e cores.

Construir as amostras fake, controles de cores e comparação das alternativas de Tom.

Apresentar ao operador.

Somente depois da escolha do caminho visual seguir para a aplicação completa de Tom no componente real.

### Marco 2 — componente e seus três contextos

Construir o componente real com CSS isolado, contrato explícito de entradas e ações, e permitir alternar entre Registrar e organizar, Categorizar e Tom e Revisar e Preservar.

Validar geometria, legend integrado, prévia de três linhas, gradiente, ordenação visual, categorias compactas, categorias completas da revisão e emissão das ações.

### Marco 3 — aplicação e calibração do Tom

Aplicar ao componente real o modelo escolhido no Marco 1.

Calibrar os quatro extremos de cor dos temas, intensidades por região, faixa de existência de Tom, neutro, gradiente e contraste.

Validar o resultado final nos três contextos e em listas.

Confirmar que a implementação da linguagem visual do Tom possa ser reaproveitada futuramente por outra caixa de visualização sem depender da estrutura específica do componente de memória.

A ordem técnica interna pode ser ajustada pelo programador se encontrar uma sequência melhor, mas o ponto de validação anterior à implementação completa do Tom deve ser preservado.

## Cenários mínimos de validação

A unidade deve permitir validar no laboratório, no mínimo:

- os três blocos do laboratório expandindo e recolhendo independentemente;
- persistência local dos três estados de expansão/recolhimento após recarregar o laboratório;
- alteração de tema e cores refletida tanto na visualização geral quanto no bloco do componente de memória;
- Registrar e organizar sem categoria e sem Tom;
- Registrar e organizar com uma categoria;
- Registrar e organizar com várias categorias;
- Registrar e organizar com Tom negativo, neutro e positivo;
- Registrar e organizar como primeira memória, com Elevar inativo;
- Registrar e organizar como última memória, com Rebaixar inativo;
- Registrar e organizar simultaneamente como primeira e última, com ambos inativos;
- clique na caixa emitindo a ação geral;
- clique em Elevar emitindo apenas a ação de Elevar;
- clique em Rebaixar emitindo apenas a ação de Rebaixar;
- controles inativos sem emissão de ação;
- Categorizar e Tom sem categoria, exibindo “Sem categoria” esmaecido;
- categoria real chamada “Sem categoria”, exibida como valor normal;
- Categorizar e Tom com uma e com várias categorias;
- Revisar e Preservar sem categoria;
- Revisar e Preservar com todas as categorias visíveis e quebra de linha quando necessária;
- uma, duas e três linhas na prévia compacta;
- texto que ultrapassa três linhas e recebe gradiente;
- texto integral longo em Revisar e Preservar, sem gradiente;
- ausência de Tom comparada diretamente com Tom 0;
- valores negativos e positivos próximos de 0;
- valores intermediários negativos e positivos;
- extremos -100 e +100;
- temas claro e escuro;
- várias larguras de viewport;
- várias caixas consecutivas em lista.

## Fora de escopo

Não fazem parte desta unidade:

- substituir a caixa atualmente usada em Registrar e organizar;
- integrar o novo componente a /capturar/{data};
- criar ou alterar persistência em IndexedDB;
- reordenar memórias reais;
- editar memórias reais;
- criar a tela de criação ou edição textual de memória;
- criar as telas reais de categorização;
- pesquisar, criar, associar ou remover categorias reais;
- materializar o seletor real de categoria;
- materializar o seletor real de Tom;
- criar a futura caixa integral com rolagem usada durante a edição de categoria e Tom;
- aplicar dinamicamente o Tom nessa futura tela de edição;
- implementar balanço sentimental;
- criar navegação entre lista, categorização e Tom;
- implementar Revisar e Preservar;
- preservar dados no servidor;
- alterar a Orientação Progressiva de Registrar e organizar;
- antecipar regras funcionais ainda reservadas às futuras unidades de Categorizar e Tom;
- criar modos adicionais do componente além dos três definidos nesta unidade.

O fallback atualmente materializado em Registrar e organizar permanece funcionando durante esta unidade. Sua substituição pelo componente aprovado será tratada em Especificação posterior.

## Decisões técnicas

A composição técnica interna do componente, nomes de tipos e propriedades, nomes de arquivos, organização de diretórios, mecanismo de emissão de eventos, abstrações de estado compartilhado, funções de interpolação de cor, estratégia de testes e detalhes equivalentes pertencem ao programador, desde que preservem o comportamento observável e os limites desta instrução.

O componente deve ser concebido para futura reutilização nas três listas sem carregar dependências do laboratório para o ambiente real.

A linguagem visual do Tom deve ser concebida para reutilização além do componente de memória, sem que esta unidade precise implementar os consumidores futuros.

A modularização do laboratório deve manter cada um dos três blocos atuais em componente de código próprio, evitando que a página de laboratório concentre a lógica interna de todos eles.

## Critérios de conclusão

A unidade está concluída quando:

- o laboratório estiver dividido nos três blocos atuais como componentes de código isolados;
- cada bloco puder ser expandido ou recolhido independentemente;
- os estados de expansão/recolhimento forem restaurados localmente depois de recarregar o laboratório;
- o tema e suas cores permanecerem compartilhados coerentemente entre os blocos;
- o laboratório possuir as amostras comparativas do Tom e o operador tiver escolhido a direção visual a desenvolver;
- as cores extremas negativa e positiva puderem ser calibradas separadamente nos temas claro e escuro;
- existir um único componente real de memória com CSS isolado;
- o componente receber explicitamente conteúdo integral, contexto, categorias, Tom ou sua ausência e, em Registrar e organizar, as indicações de primeira e última memória;
- o componente emitir separadamente as ações de clique geral, Elevar e Rebaixar;
- seus três contextos puderem ser alternados e avaliados no laboratório;
- Registrar e organizar apresentar a prévia compacta, categoria apenas quando existente, Tom quando informado e os controles de ordenação com estados ativos/inativos;
- Categorizar e Tom apresentar prévia compacta, categoria ou “Sem categoria” esmaecido e o Tom quando informado;
- Revisar e Preservar apresentar todas as categorias ou “Sem categoria” esmaecido, o texto integral e o Tom;
- a região de categoria possuir o efeito integrado à borda superior aprovado pelo operador;
- o gradiente, alinhamento, hovers, espaçamentos e responsividade tiverem sido calibrados;
- “sem Tom” e Tom neutro forem distinguíveis de forma inequívoca;
- a estratégia final de colorização do Tom funcionar nos temas claro e escuro e ao longo do eixo -100 a +100;
- a implementação da linguagem visual do Tom não estiver acoplada de forma exclusiva ao componente de memória;
- o comportamento puder ser observado em pequenas listas de laboratório;
- nenhuma página real de Capturar tiver sido alterada para utilizar o novo componente.

## Resultado esperado para a próxima unidade

Depois do encerramento e da reconciliação desta Especificação, o projeto possuirá um componente de memória visualmente fechado e experimentado isoladamente, um laboratório melhor organizado para novas experiências e uma linguagem visual de Tom preparada para reutilização.

Uma unidade posterior poderá introduzir o componente nas telas reais sem precisar descobrir simultaneamente sua aparência, seus modos de apresentação e a linguagem visual do Tom. Outras unidades futuras poderão reutilizar essa mesma linguagem visual em superfícies diferentes, como a caixa integral apresentada durante a edição de categoria e Tom.

## Continuidade

### Sessão de 20/09/2026 — entendimento e clarificação

- Leitura inicial concluída: AGENTS.md, índice, memória técnica, corpo integral desta Especificação e referência de ambiente e fundação visual. Conferidos seletivamente a rota e os componentes atuais do laboratório.
- Decisão do operador: nos modos compactos, o nome muito longo da primeira categoria pode ser abreviado visualmente, mantendo visível o indicador `+N` quando houver categorias excedentes. A revisão continua apresentando todas as categorias, com quebra de linha quando necessária.
- Não restam dúvidas funcionais para iniciar o Marco 1. As escolhas visuais permanecem sujeitas à experimentação e validação previstas no corpo aprovado.
- Estado atual: Especificação encerrada por determinação do operador, com validação final dos três marcos e Parecer final entregue. Todo o resultado funcional permanece no laboratório.

### Plano e pontos de validação

1. **Marco 1 — laboratório e amostras de Tom (concluído e validado):** separar os três blocos em componentes próprios, persistir expansão/recolhimento e preservar tema e paletas compartilhados. Construir as sete amostras comparativas com controles comuns de Tom e extremos por tema. Verificar tecnicamente e apresentar ao operador; aguardar a escolha visual antes da aplicação completa ao componente definitivo.
2. **Marco 2 — componente e contextos (concluído e validado):** construir a peça reutilizável com CSS próprio, entradas e ações explícitas. Instrumentar os três contextos, listas e larguras no laboratório. Validar com o operador geometria, categoria integrada à borda, abreviação com `+N`, categorias completas, prévia, gradiente e controles; verificar a emissão independente das ações e a inatividade dos botões.
3. **Marco 3 — Tom definitivo (concluído e validado):** aplicar a direção escolhida como linguagem visual reutilizável, calibrar extremos e intensidades nos dois temas e validar ausência versus Tom 0, valores intermediários, contraste, gradiente e listas nos três contextos. Fixar os parâmetros aprovados nos arquivos apropriados; encerramento depende do operador.

### Entrega do Marco 1

- `islands/Laboratorio.tsx` compõe os três blocos. `ControlesLaboratorio`, `VisualizacaoLaboratorio` e `ExperimentoMemoria` mantêm suas responsabilidades em arquivos próprios; as amostras anteriores foram preservadas.
- Expansão/recolhimento usa as chaves locais `rememore:lab:bloco:tema:v1`, `rememore:lab:bloco:visualizacao:v1` e `rememore:lab:bloco:memoria:v1`. Recolher mantém os componentes montados para preservar a aplicação das paletas e os controles experimentais.
- As sete amostras compartilham texto, categoria, presença/valor de Tom e extremos por tema. Há ajuste de largura e atalhos para extremos, intermediários, zero e valores próximos de zero. As cores iniciais são provisórias e não persistem após recarregar.
- Estilos experimentais isolados em `assets/laboratorio-memoria.css`. O componente definitivo e sua linguagem reutilizável ainda não foram construídos.
- Verificações: formatação dos arquivos alterados, lint direcionado, checagem de tipos da rota e build Fresh aprovados. Avaliação visual, persistência no navegador e escolha do modelo aguardam o operador; não constituem aceitação automática.
- Próxima ação: avaliar em `/laboratorio` os três blocos e a comparação de Tom nos temas claro e escuro; escolher a estratégia ou combinação antes de avançar ao componente definitivo.
- Alterações preexistentes nas Specs 01–07 e na pasta `concluidas/` preservadas. Sem commit nesta entrega.

### Indicadores ao entregar o Marco 1

- Antes das leituras: indicador não disponível.
- Após a leitura inicial e antes do fonte: indicador não disponível.
- Ao final da etapa de entendimento e clarificação e na entrega do Marco 1: indicador não disponível.
- Percentual e capacidade total não foram fornecidos pela interface nem pelo operador; não foram estimados.


### Decisões após avaliação do Marco 1

- O operador aprovou a experimentação e escolheu colorização ampla. Cores iniciais: claro negativo `#007bff`, positivo `#00ffaa`; escuro negativo `#cc0000`, positivo `#ffea00`. Permanecem ajustáveis para calibração posterior.
- Por decisão expressa, a faixa deixa de ser obrigatória para distinguir ausência de Tom e Tom neutro. O componente começa com a faixa desligada; ausência e zero permanecem entradas distintas e recebem aparências diferentes.
- Cada região pode ter sua tonalização ligada/desligada centralmente: categoria, borda, sombra, fundo e setas. A faixa tem interruptor próprio. Desligar tonalização restaura as cores normais do tema, sem remover a região.
- Setas preservam cores normal, de realce e inativa. O gradiente sempre acompanha o fundo efetivo. Texto permanece na cor do tema.
- O componente real ocupa um quarto bloco independente, preservando o bloco de experimentação. A expansão do novo bloco usa `rememore:lab:bloco:memoria-real:v1`.

### Entrega para avaliação — componente real e Tom

- `components/Memoria.tsx` implementa os três contextos com CSS isolado em `assets/memoria.css`. Recebe conteúdo integral, categorias, Tom ou `null`, contexto e callbacks; posição e ordenação são exigidas somente em Registrar e organizar.
- Categoria longa compacta é abreviada mantendo `+N`; revisão apresenta todos os nomes com quebra de linha. Ausência de categoria é omitida em Registrar e organizar e esmaecida nos demais contextos.
- `app/utilitarios/aparenciaTom.ts` centraliza os interruptores; `assets/tom.css` contém extremos, interpolação e cores por região. A linguagem independe do componente e do laboratório. A faixa inicia desligada e as demais regiões ligadas.
- `components/MemoriaLaboratorio.tsx` permite alterar contexto, texto, categorias, Tom, largura e posição. Inclui contador de ações, comparação direta sem Tom/Tom 0 e lista com textos, categorias, tons e posições diferentes. As cores do experimento são compartilhadas com o componente real.
- Marcos 2 e 3 implementados para calibração; não encerrados. A aprovação do experimento não equivale à aceitação visual do componente real. Próxima validação: moldura/legenda, prévia, categorias longas, setas e ações, ausência/neutro, temas e larguras. Sem integração às páginas reais de Capturar.
- Indicador de contexto ao entregar: não disponível; sem estimativa de percentual ou capacidade.
- Verificações desta entrega: arquivos de implementação formatados, lint direcionado e checagem de tipos aprovados; build Fresh aprovado. Após o ajuste final de clique na legenda, tipos e lint foram repetidos e passaram. Não foi feita validação visual automatizada nem aceite em nome do operador. Trabalho sem commit; alterações preexistentes preservadas.
- Ajuste visual solicitado para avaliação: categoria com contorno fino arredondado usando `--tom-borda`, abrangendo nome e excedentes ou todas as categorias da revisão. O esmaecimento de Sem categoria passa a afetar somente o texto, preservando a cor da borda. Aguarda avaliação do operador.
- Após avaliação positiva do contorno, o operador alterou o indicador compacto de categorias excedentes de `+N` para `e +N` (exemplo: Família e +2). Implementado no componente real.
- A pedido do operador, a experimentação ganhou um combo de pares sugeridos para o tema ativo: Ameixa e jade, Ardósia e mel, Terracota e petróleo, Índigo e damasco, Rosa antigo e oliva e Orquídea e turquesa, além da escolha inicial. Cada par tem variantes clara/escura; aplica somente ao tema ativo e compartilha as cores com o componente real. Ajustes manuais são indicados como Personalizada. São sugestões de calibração, não novas cores definitivas.
- Cores aprovadas pelo operador após experimentar as sugestões: Terracota e petróleo nos dois temas. Claro: negativo `#B45F4D`, positivo `#237F88`; escuro: negativo `#E99E89`, positivo `#79CBD1`. Fixadas em `assets/tom.css` e na inicialização compartilhada do laboratório, substituindo os extremos anteriores. As demais sugestões continuam disponíveis para experimentação.

### Encerramento pelo operador

- Após a apresentação dos itens finais de validação (restauração da expansão, três contextos em larguras reduzidas, textos/categorias longos, independência das ações, botões inativos e ausência de Tom versus zero), o operador confirmou que está tudo ótimo e determinou a elaboração do Parecer final. Registrado o aceite final da unidade; os estados de espera acima descrevem as entregas anteriores.
- Consumo de contexto ao encerramento: **40%**, informado pelo operador. Capacidade total não informada. Os indicadores iniciais indisponíveis não foram reconstruídos retroativamente.
- Parecer final entregue ao operador neste arquivo para transporte ao analista e ao registro canônico. Não foi feita atualização do Drive.
- Trabalho permanece sem commit. Alterações preexistentes envolvendo as Specs 01–07 e `concluidas/` foram preservadas. Próxima unidade a ser definida pelo operador.

## Parecer final

A Especificação 08 foi concluída e aprovada pelo operador. Foi produzido o componente reutilizável `Memoria` (`components/Memoria.tsx`, com CSS próprio em `assets/memoria.css`), experimentado exclusivamente em `/laboratorio`. Ele recebe conteúdo integral, categorias, Tom ou ausência e um dos três contextos: Registrar e organizar, Categorizar e Tom e Revisar e Preservar. Os dois primeiros usam prévia de até três linhas com gradiente; a revisão apresenta texto e categorias integralmente. Em Registrar e organizar, as ações Elevar e Rebaixar são independentes do acionamento geral e respeitam os estados de primeira, última e única memória.

O laboratório passou a ter quatro blocos de código separados: tema e calibração, visualização do tema, experimentação comparativa e componente real. O quarto bloco foi solicitado durante a validação para preservar as sete amostras experimentais. Todos possuem expansão/recolhimento persistidos localmente e compartilham o tema e as cores pertinentes. Foram incluídos controles de conteúdo, categorias, Tom, posição e largura, listas de observação, indicação das ações e sugestões de pares de cores para os dois temas.

A solução visual aprovada utiliza colorização ampla e o par Terracota e petróleo: no tema claro, negativo `#B45F4D` e positivo `#237F88`; no escuro, negativo `#E99E89` e positivo `#79CBD1`. Por decisão expressa do operador, a faixa lateral deixou de ser obrigatória e inicia desligada; ausência de Tom e Tom 0 continuam distintos nos dados e na aparência. A linguagem de Tom foi separada em `app/utilitarios/aparenciaTom.ts` e `assets/tom.css`, reutilizável por outras superfícies. Há configuração centralizada para ativar/desativar tonalização da categoria, borda, sombra, fundo e setas, além da exibição da faixa. As setas preservam estados normal, de realce e inativo; o gradiente acompanha o fundo efetivo.

Como ajustes aprovados em relação à entrada, a região de categoria recebeu contorno fino arredondado e o indicador compacto passou de `+N` para `e +N`, por exemplo, “Família e +2”. Nomes longos podem ser abreviados nos modos compactos, preservando o excedente; a revisão mantém todos os nomes e admite múltiplas linhas. “Sem categoria” como ausência usa texto esmaecido, distinguindo-se de uma categoria real com esse nome.

As verificações técnicas realizadas incluíram formatação, lint direcionado, checagem de tipos e build Fresh; a avaliação visual e funcional foi aceita pelo operador. Não restam pendências nesta unidade. A lista real de Registrar e organizar permanece com sua implementação anterior: não houve integração do novo componente às páginas de Capturar, alteração de IndexedDB, edição/reordenação de dados reais ou implementação das telas futuras de Categorizar e Tom e Revisar e Preservar. Essas integrações ficam para unidades posteriores.
