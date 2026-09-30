# 05.14 - Fundação de Rememorar e Janela Temporal

## Finalidade

Evoluir a casca protegida de `/rememorar`, criada na 05.04, para a fundação real da jornada Rememorar e construir o primeiro componente próprio dessa área: **CMP-008 — Janela Temporal de Rememorar**.

A unidade é deliberadamente pequena. Seu objetivo é construir, experimentar e validar o comportamento intrínseco da Janela Temporal antes de conectá-la ao acervo real ou aos demais componentes de Rememorar.

O CMP-008 deve ser desenvolvido primeiro como componente isolado em um novo bloco do laboratório existente e, depois de validado, aplicado à página real de Rememorar com dados controlados.

Esta unidade não implementa o Panorama funcional nem a infraestrutura definitiva de dados de Rememorar.

## Base existente

A rota `/rememorar` já existe como casca protegida desde a 05.04.

A Principal já conhece o destino `/rememorar` e controla a disponibilidade da jornada. Rememorar fica disponível quando o acervo possui simultaneamente pelo menos dois dias preservados e duas categorias distintas.

Não devem ser refeitas nesta unidade a autenticação, a disponibilidade da jornada nem a navegação da Principal.

O laboratório existente deve continuar organizado em blocos independentes. O CMP-008 recebe um novo bloco próprio; não deve ser incorporado a um bloco monolítico com experimentos anteriores.

# 1. Fundação da página Rememorar

A casca atual de `/rememorar` deve tornar-se a estrutura real sobre a qual os componentes seguintes serão acrescentados progressivamente.

Deve continuar respeitando a fronteira autenticada existente e o cabeçalho já utilizado pela aplicação, com retorno à Principal e saída da sessão.

A região principal deve ser preparada para receber os blocos de Rememorar em sequência, sem criar antecipadamente componentes, caixas ou conteúdos fictícios que pertençam às próximas unidades.

Nesta 05.14, somente o CMP-008 ocupa efetivamente a região funcional da página.

A composição deve permitir avaliar desde já:

- largura útil;
- espaçamento;
- comportamento responsivo;
- relação do componente com o cabeçalho;
- redimensionamento da área disponível;
- futura inclusão de novos blocos abaixo dele.

Na página real, o CMP-008 ainda utiliza um conjunto determinístico de dados controlados. Ele pode exercer integralmente seu comportamento próprio, mas não consulta o servidor, IndexedDB ou o acervo real e ainda não altera outros elementos de Rememorar.

# 2. CMP-008 — Janela Temporal de Rememorar

## Responsabilidade

CMP-008 seleciona um intervalo dentro da sequência cronologicamente ordenada dos **dias preservados existentes** no acervo.

Ele não trabalha sobre todos os dias corridos do calendário.

Se o conjunto recebido for:

```text
03/01, 04/01, 20/01, 15/02, 02/06
```

o componente possui cinco posições temporais relevantes. As diferenças de calendário entre essas datas não criam posições adicionais.

Assim, quatro datas consecutivas e quatro datas muito espaçadas produzem a mesma geometria de quatro posições no controle.

## Entrada conceitual

O componente deve ser capaz de receber:

- sequência ordenada de dias preservados;
- posição contínua inicial da alça esquerda, quando houver estado anterior a restaurar;
- posição contínua inicial da alça direita, quando houver estado anterior a restaurar.

Em uma nova jornada sem estado anterior, a seleção começa abrangendo todo o histórico disponível.

A posição contínua preservada deve ser independente da largura física anterior da tela. Uma representação normalizada, ou solução equivalente, pode ser utilizada para permitir reprojeção em diferentes larguras.

A forma técnica concreta desse contrato fica a critério do programador.

## Resultado funcional

A geometria contínua das alças deve ser traduzida para um intervalo discreto da sequência de dias preservados.

O resultado funcional disponibilizado ao contexto deve permitir conhecer, no mínimo:

- primeiro dia efetivamente selecionado;
- último dia efetivamente selecionado;
- quantidade de dias preservados no intervalo;
- posições ou limites discretos necessários para que o restante de Rememorar possa posteriormente trabalhar sobre o mesmo recorte.

As posições contínuas atuais das duas alças também precisam ser recuperáveis pelo contexto para que uma reconstrução da jornada possa restaurar a mesma disposição visual.

O componente não precisa decidir sozinho onde esse estado será persistido. A arquitetura pode mantê-lo no componente, em seu contexto chamador ou em estrutura equivalente, desde que o contrato permita preservá-lo e restaurá-lo.

# 3. Movimento contínuo e resultado discreto

As alças devem apresentar movimento visual **fluido**, e não saltar magneticamente entre os dias existentes.

A quantidade de dias não deve determinar uma quantidade igualmente pequena de paradas físicas.

Por exemplo, cinco dias não devem resultar em apenas cinco posições físicas do controle.

A implementação pode utilizar uma resolução interna significativamente maior que a quantidade de dias, valores normalizados contínuos, pixels ou outra estratégia.

Caso seja útil, a **resolução física pode variar conforme a quantidade de dias**, de modo que conjuntos pequenos continuem oferecendo movimento suave e conjuntos grandes não exijam uma representação interna desnecessariamente onerosa.

Exemplos como transformar cinco posições discretas em 50 ou 100 posições físicas são apenas ilustrações possíveis, não contratos obrigatórios.

O critério é o efeito observável:

- movimento fluido;
- ausência de sensação magnética;
- conversão previsível para posições discretas;
- estado semântico independente da resolução física escolhida.

A resolução interna nunca deve tornar-se o estado funcional canônico do intervalo.

# 4. Intervalo mínimo

A decisão desta unidade refina a formulação funcional anterior da janela temporal:

**um intervalo funcional válido deve conter pelo menos dois dias preservados distintos.**

Em uma sequência de dias `D1, D2, D3, D4`, são exemplos válidos:

- D1–D2;
- D2–D3;
- D3–D4;
- D1–D3;
- D2–D4;
- D1–D4.

Não são intervalos funcionais válidos:

- somente D1;
- somente D2;
- somente D3;
- somente D4.

Em termos discretos, os extremos precisam corresponder a posições distintas da sequência. A diferença mínima entre as posições é uma posição, resultando em dois dias selecionados.

Essa alteração deverá posteriormente ser reconciliada com REG-201 na Funcionalização.

# 5. Estado físico temporariamente inválido

A liberdade de movimento das alças não deve ser sacrificada para impedir geometricamente toda configuração inválida.

É permitido que ambas as alças sejam movimentadas para posições contínuas que, após conversão, correspondam ao mesmo dia preservado.

Nesse caso:

- a geometria visível continua refletindo a posição escolhida pelo usuário;
- nenhum novo intervalo funcional é publicado;
- permanece válido internamente o último intervalo discreto válido;
- o componente apresenta uma orientação contextual;
- assim que a movimentação voltar a produzir pelo menos dois dias, a orientação desaparece e o novo intervalo válido pode ser publicado.

A mensagem definida para esse estado é:

**“Amplie o intervalo para incluir pelo menos dois dias preservados.”**

A mensagem não deve ser apresentada em popup, modal ou alerta que exija ação.

Ela deve aparecer junto ao próprio componente, em uma região que possa substituir temporariamente a informação normal do intervalo sem provocar deslocamentos desnecessários no layout.

Quando a seleção for válida, essa região apresenta:

**“{N} dias preservados, entre {data inicial} e {data final}”**

Quando for inválida, apresenta a orientação acima.

A correção ocorre exclusivamente pela própria movimentação das alças.

# 6. Caso mínimo de dois dias no acervo

Rememorar só é acessível em produção quando houver pelo menos dois dias preservados.

Com exatamente dois dias existem apenas dois pontos temporais relevantes e um único intervalo funcional possível: os dois dias juntos.

As alças podem continuar apresentando sua linguagem de movimento, desde que isso não crie outro resultado funcional.

Movimentos que continuem correspondendo aos dois dias não provocam alteração funcional.

Movimentos que façam ambas corresponderem ao mesmo dia entram no estado físico inválido já definido e não substituem o último intervalo válido.

O laboratório deve permitir observar esse caso mínimo.

# 7. Alças, colisão e aproximação física

As duas alças não devem atravessar uma à outra.

A solução visual preferencial é fazer com que sua aproximação máxima seja determinada pelas **bordas internas das alças**, e não por uma colisão artificial entre seus centros.

A largura visual das alças não pode alterar a semântica temporal. A distância física mínima permitida entre os controles não pode corresponder a vários dias discretos apenas porque há muitas datas condensadas no trilho.

Na aproximação física mínima, a geometria deve representar no máximo a menor diferença temporal útil: uma posição discreta de diferença, que resulta em dois dias selecionados. Também é aceitável que a aproximação máxima faça as duas alças resolverem temporariamente para o mesmo dia, entrando então no estado inválido definido anteriormente. A colisão física nunca deve obrigar a manutenção de um intervalo de vários dias.

A implementação pode utilizar pontos lógicos associados às bordas internas, posições virtuais independentes do centro visual ou solução equivalente.

## Complexidade permitida

A colisão pelas bordas é uma **preferência importante**, mas não deve comprometer a robustez geral do componente.

O programador deve tentar essa solução.

Se ela elevar de forma desproporcional a complexidade, fragilizar arraste, toque, resize ou conversão contínua/discreta, a dificuldade deve ser apresentada ao operador.

Como último recurso, pode ser aceita colisão ou sobreposição baseada nos centros, após validação do operador.

A eventual simplificação visual não autoriza alterar as invariantes funcionais da janela.

# 8. Arraste das alças

Arrastar uma alça individual altera somente o extremo correspondente da janela.

Durante o movimento:

1. a posição contínua muda;
2. a posição discreta correspondente é recalculada;
3. se o intervalo discreto continuar igual, nenhuma alteração funcional precisa ser publicada;
4. se surgir um novo intervalo válido, ele pode ser publicado;
5. se surgir configuração inválida, mantém-se o último intervalo válido e apresenta-se a orientação.

É esperado que, especialmente com poucos dias, a alça possa percorrer uma distância física perceptível sem alterar o resultado discreto.

Isso não deve ser tratado como erro nem resolvido por magnetismo.

# 9. Arraste da área selecionada

A área interna compreendida entre as duas alças deve, preferencialmente, ser arrastável.

Esse gesto possui semântica diferente do arraste de uma alça:

- arrastar uma alça amplia ou reduz o intervalo;
- arrastar a área selecionada **desloca a janela**.

Durante o deslocamento da área, o objetivo é preservar a quantidade discreta de dias selecionados enquanto o intervalo se move pela sequência.

Por exemplo, uma janela válida de dez dias deve continuar representando dez dias enquanto é deslocada, apenas mudando seus extremos.

Ao atingir o início ou o fim do universo disponível, o deslocamento deve respeitar o limite do trilho sem produzir posições inexistentes.

A solução concreta para conciliar movimento físico contínuo e preservação discreta da extensão fica a critério do programador.

## Complexidade permitida

O arraste da área interna é um comportamento desejado e deve ser tentado.

Ele é reconhecido como uma das partes potencialmente mais complexas do CMP-008.

Se preservar corretamente a quantidade discreta durante esse gesto provocar complexidade desproporcional, instabilidade ou conflito sério com as demais invariantes, o problema deve retornar ao operador antes de uma simplificação.

A remoção desse comportamento é último recurso, não decisão inicial de implementação.

# 10. Marcadores visuais

Quando a densidade de dias for pequena em relação ao espaço disponível, o trilho pode apresentar divisões ou marcadores visuais que ajudem o usuário a perceber a estrutura discreta existente sob o movimento contínuo.

Esses marcadores:

- representam posições da sequência de dias preservados;
- não representam a distância real do calendário;
- não criam paradas físicas;
- não atraem nem magnetizam as alças;
- não alteram o cálculo funcional.

Sua apresentação deve considerar conjuntamente:

- quantidade de dias;
- largura física disponível;
- densidade resultante.

A mesma quantidade de dias pode justificar marcadores em uma região larga e dispensá-los depois que essa região for estreitada.

A apresentação deve possuir pelo menos três estados experimentáveis:

- marcadores visíveis;
- marcadores esmaecidos;
- marcadores ausentes.

Os limiares entre esses estados devem ser parâmetros manipuláveis no laboratório.

Após experimentação e validação visual, a versão de produção pode adotar valores estáticos resultantes dessa exploração.

A transição durante resize não precisa ser matematicamente exata; deve apenas parecer estável e visualmente agradável.

# 11. Redimensionamento

O componente deve suportar alteração da largura disponível sem reiniciar automaticamente a seleção para os extremos.

Redimensionamentos são considerados situação comum de uso e podem ocorrer por:

- mudança do tamanho da janela;
- painéis laterais do navegador;
- divisão da tela entre aplicações ou sites;
- mudança de orientação;
- outras alterações responsivas.

A direção preferencial é preservar posições contínuas **normalizadas** e reprojetá-las sobre a nova largura.

Por exemplo, uma posição relativa de 0,25 continua aproximadamente em um quarto do novo trilho, independentemente da quantidade de pixels disponível.

Não é exigida conservação exata de cada pixel ou animação perfeita.

O objetivo é que o usuário perceba continuidade e não perda de trabalho.

Quando a lista de dias não tiver mudado, a seleção funcional anterior deve permanecer estável sempre que possível.

O redimensionamento também recalcula a densidade visual e, portanto, pode alterar o estado dos marcadores entre visíveis, esmaecidos e ausentes.

# 12. Restauração da jornada e F5

A reconstrução da mesma jornada deve ser capaz de restaurar não apenas o mesmo intervalo discreto, mas também a disposição contínua das alças.

Duas posições físicas diferentes podem produzir a mesma seleção discreta; restaurar apenas os dias selecionados e recolocar arbitrariamente as alças em outra posição seria funcionalmente correto, mas perceptivamente inconsistente.

Por isso, o estado recuperável deve contemplar as posições contínuas das duas alças em forma independente da largura anterior.

A responsabilidade técnica pela persistência não é imposta ao CMP-008.

No laboratório deve existir mecanismo simples para experimentar:

- estado sem memória efêmera;
- preservação do estado durante a sessão;
- recarregamento da página;
- recuperação da geometria e do resultado após F5;
- início deliberado de uma nova jornada/reset.

`sessionStorage` ou recurso equivalente pode ser utilizado pelo ambiente de laboratório se for adequado, sem transformar essa escolha em contrato interno obrigatório do componente.

# 13. Acessibilidade e meios de interação

A construção não deve assumir exclusivamente mouse.

O componente deve ser concebido de forma compatível com:

- ponteiro/mouse;
- toque;
- teclado.

A área física de interação pode ser maior que a alça desenhada visualmente, especialmente em telas estreitas ou dispositivos de toque.

Essa ampliação da área clicável não deve modificar a geometria semântica do controle nem a regra de colisão visual/lógica.

O comportamento concreto de teclado pode ser definido tecnicamente durante a implementação, desde que permita operar ambos os extremos de forma compreensível e preserve as mesmas regras de validade.

# 14. Laboratório do CMP-008

O laboratório não serve apenas para provar que o componente funciona.

Ele deve permitir **experimentar rapidamente sua sensação e comportamento** sob diferentes condições antes de congelar as decisões visuais.

O novo bloco deve permanecer independente dos blocos já existentes.

Os controles auxiliares podem ser simples e utilitários; não precisam seguir a apresentação final do produto.

O laboratório deve permitir exercitar, no mínimo:

## Conjuntos de dias

- caso mínimo de 2 dias;
- 3, 4 e 5 dias;
- conjuntos intermediários;
- dezenas ou grande quantidade de dias;
- datas consecutivas;
- datas muito espaçadas;
- distribuição irregular.

Datas consecutivas ou espaçadas com a mesma quantidade devem demonstrar a mesma geometria temporal.

## Estado interno observável

O laboratório pode apresentar informações técnicas que não existirão no produto, como:

- posições contínuas das duas alças;
- posições discretas correspondentes;
- primeiro e último dia efetivos;
- quantidade selecionada;
- estado válido ou inválido;
- resolução física utilizada, quando fizer sentido;
- densidade atual de marcadores.

Essas informações existem somente para experimentação e diagnóstico.

## Resolução física

Deve ser possível experimentar estratégias ou parâmetros de resolução suficientes para verificar quando o movimento passa a parecer magnético ou artificial.

Se a implementação utilizar resolução variável conforme a quantidade de dias, o laboratório deve permitir observar esse comportamento.

## Marcadores

Devem ser ajustáveis os limiares usados para:

- exibição plena;
- esmaecimento;
- desaparecimento.

O objetivo é encontrar empiricamente uma relação agradável entre quantidade de dias e espaço disponível.

## Largura disponível

O bloco deve permitir observar facilmente o componente em larguras diferentes, seja por controle próprio, container redimensionável, viewport do navegador ou solução equivalente.

O resize deve permitir observar simultaneamente:

- reprojeção das alças;
- preservação do intervalo;
- alteração da densidade dos marcadores.

## Memória efêmera

Devem existir meios simples de:

- preservar o estado;
- recarregar;
- verificar restauração;
- limpar o estado;
- simular nova jornada.

## Gestos

Devem ser experimentáveis:

- arraste da alça esquerda;
- arraste da alça direita;
- aproximação máxima;
- configuração discreta inválida;
- recuperação para intervalo válido;
- arraste da região interna;
- chegada da janela aos extremos.

# 15. Aplicação na página real

Depois da validação do componente no laboratório, CMP-008 deve ser utilizado em `/rememorar`.

A página recebe um cenário controlado e determinístico de dias preservados suficiente para avaliar o componente em sua composição real.

Esse cenário deve ser claramente de desenvolvimento/mock e não cria infraestrutura definitiva de Rememorar.

O componente mantém na página seu comportamento intrínseco:

- movimento;
- conversão contínua/discreta;
- mensagem de intervalo;
- estado inválido;
- marcadores;
- resize;
- arraste das alças;
- arraste da faixa, quando aprovado.

Ainda não existem efeitos sobre categorias ou outros componentes.

# 16. Fora do escopo

Não fazem parte da 05.14:

- CMP-009 e componentes posteriores de Rememorar;
- categorias do Panorama;
- cálculo da força relativa das categorias;
- Tom agregado;
- projeção temporal da categoria;
- onda de utilização;
- variação do Tom;
- listas de memórias;
- consulta individual de memória;
- cache definitivo de Rememorar em IndexedDB;
- projeção local definitiva do acervo;
- revisão global;
- sincronização incremental;
- obtenção real de dados do backend;
- integração funcional entre a janela e o restante do Panorama;
- implementação de Encontrar Memórias;
- implementação de Rever um Dia.

# 17. Validação técnica

O componente deve possuir testes automatizados para as invariantes que puderem ser verificadas sem avaliação estética.

Cobrir, conforme a arquitetura adotada, pelo menos:

- conversão de posição contínua para posição discreta;
- sequência de dias independente das lacunas de calendário;
- intervalo mínimo de dois dias;
- impossibilidade de publicar intervalo de um único dia;
- manutenção do último intervalo válido durante geometria inválida;
- recuperação quando o intervalo volta a ser válido;
- não cruzamento das alças;
- comportamento nos extremos do trilho;
- caso com exatamente dois dias;
- caso com poucos dias;
- caso com muitos dias;
- preservação da extensão discreta no arraste da área, se esse comportamento for materializado;
- reprojeção após resize;
- restauração de posições contínuas;
- ausência de dependência semântica da resolução física interna.

Regras cuja garantia seja mais apropriada por teste de navegador podem ser validadas dessa forma.

A avaliação de fluidez, sensação de magnetismo, aparência dos marcadores, colisão visual, qualidade do resize e composição final permanece com o operador.

# 18. Pontos de validação do operador

A unidade deve prever validação progressiva, evitando avançar para a página real antes de o comportamento fundamental do componente estar satisfatório.

A validação visual deve observar especialmente:

- fluidez com poucos dias;
- fluidez com muitos dias;
- sensação ao permanecer dentro da mesma região discreta;
- clareza do estado inválido;
- mensagem contextual;
- marcadores com diferentes densidades;
- resize;
- colisão das alças;
- arraste conjunto;
- toque/área de interação quando aplicável;
- integração visual na página Rememorar.

Os parâmetros experimentais podem ser alterados durante essa validação até que sejam escolhidos valores estáticos satisfatórios para a versão integrada.

# 19. Cadência especial de execução

Devido à concentração de geometria, interação e regras interdependentes no CMP-008, esta unidade terá uma cadência especial de sessões.

## Etapa inicial — Luna, esforço Médio

A sessão inicial deve:

- compreender a Especificação;
- realizar a clarificação funcional prevista pelo processo;
- preparar o Markdown operacional;
- evoluir a fundação de `/rememorar`;
- preparar o novo bloco independente do laboratório;
- estruturar os cenários e controles auxiliares;
- chegar até o ponto anterior ao núcleo de implementação do CMP-008.

Antes de iniciar o núcleo complexo do componente, deve registrar de forma completa no Markdown operacional:

- estado atual;
- arquivos criados ou alterados;
- decisões já materializadas;
- testes existentes;
- próximo passo exato;
- qualquer descoberta técnica relevante.

A sessão é então encerrada.

## Núcleo do componente — Astra

Uma nova sessão com Astra assume a partir do checkpoint e implementa o núcleo técnico do CMP-008, com atenção especial a:

- geometria contínua;
- tradução discreta;
- validade;
- colisão;
- arraste individual;
- arraste da área;
- resolução;
- resize;
- restauração;
- testes automatizados.

Quando o núcleo estiver tecnicamente consistente e apto à experimentação visual, deve atualizar novamente o Markdown operacional com checkpoint completo e encerrar a sessão.

## Refinamento e validação — Luna, esforço Médio

Uma nova sessão com Luna assume o resultado para:

- conduzir as tratativas com o operador;
- ajustar parâmetros do laboratório;
- realizar refinamentos visuais;
- ajustar marcadores, mensagens, fluidez e CSS;
- integrar o componente aprovado à página real;
- executar a validação final da unidade.

Essa distribuição não altera as responsabilidades funcionais da Especificação e não impede retorno ao modelo mais capaz caso um problema técnico concreto exija.

# 20. Critério de conclusão

A 05.14 está concluída quando:

- `/rememorar` deixou de ser apenas uma casca e possui sua fundação real preparada para crescimento progressivo;
- CMP-008 existe como componente reutilizável;
- seu bloco independente de laboratório permite experimentar os principais cenários e parâmetros;
- movimento contínuo e resultado discreto estão claramente separados;
- a janela nunca publica seleção funcional inferior a dois dias;
- estado físico inválido é tratado sem popup e sem perda do último intervalo válido;
- posições contínuas podem ser restauradas;
- resize não reinicia arbitrariamente o trabalho do usuário;
- marcadores respondem à densidade de dias e espaço disponível;
- arraste individual está funcional;
- o arraste da região inteira foi materializado ou, se sua complexidade tiver se mostrado desproporcional, a exceção foi explicitamente discutida e aceita pelo operador;
- a colisão preferencial pelas bordas foi materializada ou seu fallback foi explicitamente discutido e aceito pelo operador;
- o componente foi aprovado visualmente no laboratório;
- o componente aprovado está aplicado em `/rememorar` com dados controlados;
- testes técnicos e validações pertinentes passaram;
- nenhuma integração funcional futura de Rememorar foi antecipada.

---

# Continuidade

## Sessão inicial — 30/09/2026

### Escopo e clarificação

Unidade ativa: fundação progressiva da página `/rememorar` e preparação do bloco independente CMP-008 no laboratório. Esta parada segue a orientação do operador de experimentar com Luna 6.0 e guardar checkpoints de contexto e commits; se o resultado não for satisfatório, a implementação poderá ser retomada com Astra. O núcleo técnico do CMP-008 permanece para etapa posterior, conforme a cadência especial da Especificação.

A leitura da Especificação, da memória técnica, da referência de componentes e dos pontos de integração não revelou lacunas funcionais que exijam decisão do operador antes do plano. As regras do intervalo, mensagens, movimentos, persistência experimental, cenários e limites de escopo estão definidos no corpo aprovado. Decisões internas de organização e implementação do bloco ficam a cargo do programador; uma lacuna funcional surgida durante o trabalho interromperá somente o caminho afetado para consulta.

### Plano da unidade

1. Preparar a estrutura real de `/rememorar`, mantendo fronteira autenticada e cabeçalho existentes, e reservando a região principal para o CMP-008, sem conteúdo de componentes futuros.
2. Preparar um bloco isolado do laboratório com estrutura de cenários, observabilidade e controles auxiliares suficientes para receber o componente depois; não implementar ainda o núcleo geométrico.
3. Fazer verificações técnicas pertinentes, registrar arquivos, decisões, testes e próximo passo exato, e criar commit de checkpoint antes de encerrar esta parada.
4. Em etapa posterior, implementar e verificar o núcleo do CMP-008; avançar para validação visual do laboratório antes da integração controlada em `/rememorar`.

### Estado

- Plano: etapas 1 e 2 executadas; etapa 3 em andamento.
- Etapa corrente: checkpoint desta parada, antes do núcleo técnico do CMP-008.
- Validações do operador: nenhuma realizada nesta sessão.
- Testes existentes: foram localizados 12 módulos de teste no projeto; nenhum é específico da Janela Temporal. Não foram criados nem executados testes nesta parada, anterior ao núcleo do componente.
- Pendências: núcleo geométrico e seus testes; memória efêmera experimental; validação visual; integração do componente em `/rememorar`.

### Referências verificadas

- `routes/rememorar.tsx` atualmente renderiza `EstruturaProtegida` sem região funcional adicional.
- `routes/laboratorio.tsx` entrega o laboratório existente; `islands/Laboratorio.tsx` organiza experimentos em blocos independentes com estado de expansão local.
- `routes/_middleware.ts` inclui `/rememorar` na fronteira autenticada.
- Nesta parada, `EstruturaProtegida` ganhou o identificador opcional `regiaoPrincipal="rememorar"`, preservando os demais consumidores; a rota agora nomeia sua região principal.
- `islands/ExperimentoJanelaTemporal.tsx` prepara dados determinísticos para 2, 3, 4, 5, 10, 30 ou 100 datas consecutivas, espaçadas ou irregulares e permite reduzir a largura da área experimental. Ainda não implementa o controle temporal, persistência de estado ou parâmetros de marcadores/resolução.
- Alterações já presentes antes desta sessão foram preservadas: remoção de `.docs/especificacoes/13-Preservacao.md`, cópia nova em `.docs/especificacoes/concluidas/13-Preservacao.md` e arquivo não rastreado `.docs/especificacoes/14-rememorar-01.md`.

### Verificações e checkpoint

- `deno lint` nos cinco módulos TSX alterados: passou após acrescentar uma chave JSX.
- `git diff --check`: passou; Git emitiu avisos de conversão LF/CRLF nos arquivos existentes.
- `deno check routes/rememorar.tsx routes/laboratorio.tsx`: não concluído porque o manifesto JSR de `@fresh/core` não pôde ser lido do cache enquanto o acesso à rede está restrito.
- Próximo passo exato: implementar o núcleo técnico do CMP-008, começando pela conversão contínua/discreta e invariantes do intervalo, e acrescentar testes automatizados correspondentes antes dos gestos e da integração visual.
- Commit desta parada: este checkpoint; identificador consultado no Git ao encerrar a sessão.

### Indicadores de contexto

- Antes das leituras: não disponível na interface; valor inicial não pode ser reconstruído.
- Após AGENTS, índice, memória inicial e Especificação, antes do fonte: não disponível na interface.
- Ao final desta sessão: não disponível na interface.

## Sessão CMP-008 — implementação para laboratório

### Escopo e plano

O operador autorizou a criação do CMP-008 para experimentação no laboratório, mantendo Luna 6.0 com esforço médio e solicitou que o componente tenha um arquivo CSS isolado. Não surgiu lacuna funcional nova; a Especificação existente define os comportamentos e textos. A preferência de CSS será atendida com `assets/janela-temporal.css`, importado pela entrada central de estilos.

1. Implementar funções puras para posições normalizadas, conversão discreta, validade, deslocamento e restauração, com testes automatizados. Concluída.
2. Construir `JanelaTemporal` com alças contínuas acessíveis, seleção mínima, gesto de faixa, marcadores configuráveis e preservação das coordenadas em resize. Concluída para primeira experimentação.
3. Integrar o componente ao bloco de laboratório com cenários, observabilidade e memória de sessão; manter `/rememorar` fora desta etapa. Concluída.
4. Rodar verificações técnicas, registrar o checkpoint e criar o commit solicitado pelo operador. Em andamento.

### Estado desta sessão

- Etapas 1–3 implementadas; etapa 4 em andamento.
- Próximo ponto de validação: avaliação visual e funcional pelo operador no laboratório, antes de integrar em `/rememorar`.
- Componentes existentes lidos: `ExperimentoJanelaTemporal`, `SeletorTom` e seu CSS; testes existentes usam `Deno.test` com assertivas simples locais.
- Arquivos alterados nesta etapa: `app/utilitarios/janelaTemporal.ts`, `app/utilitarios/janelaTemporal_test.ts`, `components/JanelaTemporal.tsx`, `assets/janela-temporal.css`, `assets/app.css`, `islands/ExperimentoJanelaTemporal.tsx`, CSS auxiliar de laboratório, a referência de componentes e este Markdown.
- Decisões técnicas materializadas: posições contínuas normalizadas são mapeadas por arredondamento para posições igualmente espaçadas dos dias existentes; as bordas internas das alças definem seus pontos lógicos e podem se tocar; o gesto da faixa desloca limites discretos mantendo a extensão; a restauração guarda posições e último intervalo válido juntos.
- O laboratório já oferece contagens 2, 3, 4, 5, 10, 30 e 100, distribuições consecutiva/espaçada/irregular, largura ajustável, limiares numéricos dos marcadores, diagnóstico e memória opcional em `sessionStorage`, incluindo recuperação após F5 e reinício de jornada.
- Validação visual do operador: ainda não realizada.
- Indicadores de contexto: antes das leituras, depois da leitura inicial e ao final desta sessão não disponíveis na interface.

### Verificações e checkpoint

- `deno test app/utilitarios/janelaTemporal_test.ts`: 11 passaram, 0 falharam.
- `deno lint` nos quatro módulos TS/TSX da unidade: passou.
- `deno fmt --check` nos quatro módulos TS/TSX da unidade: passou.
- `deno check components/JanelaTemporal.tsx islands/ExperimentoJanelaTemporal.tsx`: passou.
- `deno check routes/laboratorio.tsx`: não concluído; o manifesto JSR de `@fresh/core` não está no cache e a rede permanece restrita.
- `git diff --check`: sem erros; avisos LF/CRLF do Windows permanecem informativos.
- Próximo passo: revisar a composição visual e os gestos no laboratório; ajustar apenas conforme retorno do operador. Depois de aprovação visual, integrar CMP-008 em `/rememorar` com dados controlados.
- Commit deste checkpoint: pendente até concluir a conferência final dos arquivos desta sessão.

## Refinamento após primeira experimentação visual — 30/09/2026

O operador testou o laboratório e pediu alças circulares, semelhantes ao Seletor de Tom; divisórias nos limites entre posições discretas, em vez de centralizadas sobre cada dia; e marcas mais espessas e visíveis. Ajustes feitos em `JanelaTemporal` e `assets/janela-temporal.css`: as alças visuais são círculos mantendo as bordas internas como coordenadas lógicas; há uma divisória por transição, posicionada no ponto de mudança do arredondamento; a espessura passou a 2 px com contraste aumentado. A função `posicaoDivisoria` cobre esses limites em teste.

- `deno test app/utilitarios/janelaTemporal_test.ts`: 12 passaram, 0 falharam.
- `deno lint`, `deno fmt --check` e `deno check components/JanelaTemporal.tsx`: passaram.
- `git diff --check`: sem erros; avisos LF/CRLF do Windows são informativos.
- A validação visual continua aberta para novos retornos do operador. Integração em `/rememorar` permanece pendente da aprovação do componente no laboratório.
- Commit do refinamento: `7e06216` (`Spec 14: ajustar alcas e divisorias da janela`).

## Refinamento de densidade, faixa contínua e marcadores — 30/09/2026

O operador solicitou marcadores com altura da faixa colorida do trilho, quantidade do cenário como campo numérico inteiro, limiares iniciais de densidade em 5 (visíveis) e 7 (esmaecidos), ainda editáveis, e movimento menos magnético ao arrastar toda a seleção. O campo de quantidade usa `type="number"`, mínimo 2 e passo 1. Os valores 5 e 7 são padrões tanto no componente quanto no laboratório.

O gesto da faixa agora translada ambas as posições normalizadas pelo deslocamento físico do ponteiro. O intervalo semântico continua discreto, muda conforme a alça esquerda cruza os limites dos dias e preserva sua quantidade; nas extremidades, o gesto é limitado às posições possíveis. A marca `intervaloDeslocado` permite restaurar a relação entre a geometria contínua e o intervalo publicado em `sessionStorage`.

- `deno test app/utilitarios/janelaTemporal_test.ts`: 14 testes passaram, incluindo movimento pequeno contínuo, manutenção da quantidade, extremidades e restauração da faixa.
- `deno lint`, `deno fmt --check`, `deno check components/JanelaTemporal.tsx islands/ExperimentoJanelaTemporal.tsx` e `git diff --check`: passaram.
- A validação visual/funcional desta revisão pelo operador permanece pendente. A integração de CMP-008 em `/rememorar` também permanece pendente de aprovação visual no laboratório.
- Indicadores de contexto antes das leituras, após leituras iniciais e ao final: não disponíveis na interface.
- Próximo passo: operador testar no laboratório o campo inteiro, limiares, extensão dos marcadores e arraste da faixa com cenários de poucos dias; ajustar ao retorno antes da integração em `/rememorar`.
- Checkpoint desta revisão: `187d83e` (`Spec 14: suavizar arraste da faixa temporal`).

### Clarificação funcional do arraste conjunto — 30/09/2026

Ao arrastar o conjunto, cada alça deve atualizar seu próprio dia quando cruza uma divisão discreta. A quantidade de dias pode variar durante esse gesto. Isso substitui, para o comportamento do CMP-008 aprovado nesta clarificação, a interpretação anterior de deslocar o intervalo como bloco discreto de extensão fixa. A regra geral de validade continua aplicável: não publicar seleção inferior a dois dias; enquanto a geometria for inválida, manter o último intervalo válido até a seleção se recuperar.

O operador apontou que a alça final já podia cruzar para o dia anterior enquanto o intervalo publicado permanecia preso ao dia determinado pela alça inicial. A nova regra deriva ambos os extremos das posições contínuas traduzidas juntas e só mantém o último intervalo publicado quando a combinação momentânea não satisfaz a extensão mínima.

Esta clarificação substitui a interpretação da verificação visual anterior nesta Continuidade que considerava suficiente a troca do intervalo somente quando a alça inicial mudava de dia.

- `deno test app/utilitarios/janelaTemporal_test.ts`: 16 testes passaram, incluindo atualização independente dos extremos e preservação do último intervalo válido quando a geometria fica abaixo do mínimo.
- `deno lint`, `deno fmt --check`, `deno check components/JanelaTemporal.tsx islands/ExperimentoJanelaTemporal.tsx` e `git diff --check`: passaram.
- Checkpoint da implementação: `ac6c46e` (`Spec 14: atualizar extremos no arraste conjunto`).

### Verificação das anotações do laboratório — 30/09/2026

O operador esclareceu que os marcadores devem acompanhar somente a espessura da faixa colorida (0,4 rem), não toda a altura disponível para interação; `assets/janela-temporal.css` foi ajustado para centralizá-los sobre essa faixa. As três anotações do gesto mostram que os dias publicados permanecem 2–4 enquanto a posição contínua se move dentro da mesma região discreta, e que o intervalo muda para 1–3 quando a posição discreta inicial cruza o limite. Esse resultado preserva a quantidade de três dias e corresponde à semântica de deslocamento definida na Especificação.

- `deno lint`, `deno fmt --check` e `git diff --check`: passaram; não há teste automatizado para a espessura visual dos marcadores.
- Confirmação funcional pelo operador: arraste contínuo e troca de intervalo somente quando muda o primeiro dia, conforme as anotações; validar visualmente a nova altura dos marcadores no laboratório.
- Checkpoint: `1a11801` (`Spec 14: alinhar marcadores à faixa colorida`).

## Ajuste cromático dos marcadores — 30/09/2026

Após confirmar o comportamento do arraste conjunto e selecionar dois dias entre 1.500 preservados, o operador pediu que os marcadores acompanhem as cores da paleta do trilho em vez do preto atual. `Link` identifica marcadores visíveis; `Info` identifica os esmaecidos. O ajuste foi aplicado somente ao CSS isolado do CMP-008.

- Verificação de nomes de tokens: `--bulma-link` e `--bulma-info` estão disponíveis em `assets/palettes.css`.
- Verificação visual pelo operador: pendente.
- Checkpoint: `c5a83fd` (`Spec 14: colorir marcadores pela paleta`).
