# 05.18 - Laboratório de Refinamento do Panorama

## Estado

Décima oitava unidade de desenvolvimento da fase 05 - Especificação. Esta unidade é deliberadamente experimental e deve ser executada antes da 05.19. Seu objetivo é produzir evidência visual e funcional controlada para quatro refinamentos do primeiro nível de Rememorar: apresentação da Janela Temporal, controle de ordenação, animação de reordenação das categorias e transformação visual não linear do Tom.

A rota real `/rememorar` não deve receber o acabamento final nesta unidade. A experimentação deve ocorrer no laboratório existente, ou em bloco isolado equivalente dentro dele, de forma que o operador possa aprovar, rejeitar ou ajustar cada comportamento antes da integração definitiva.

A 05.19 já pode existir no Drive como rascunho antecipado, mas não deve ser utilizada pelo programador durante esta unidade. O resultado da 05.18 poderá alterar pontualmente a 05.19 antes de sua execução.

## Origem funcional

Esta unidade parte do primeiro nível de Rememorar já materializado pelas 05.14 a 05.17:

- CMP-008 — Janela Temporal de Rememorar;
- CMP-009 — Categoria do Panorama;
- projeção local e catálogo versionado;
- cálculo local de quantidade, representatividade e Tom agregado;
- atualização imediata do Panorama durante o movimento da janela;
- transições de 180 ms já aprovadas para largura, cor e entrada/saída das categorias;
- ausência de paginação ou revelação progressiva na lista de categorias.

As regras matemáticas existentes permanecem vigentes. Esta unidade não altera REG-202, REG-203, a projeção local, sincronização, quantidade ou disponibilidade de Rememorar.

## Clarificação e planejamento

Antes de alterar o código, o programador deve realizar a clarificação funcional inicial prevista pelo processo do projeto. Se não identificar lacuna funcional, deve informar isso explicitamente e seguir.

Depois da clarificação, deve atualizar a cópia Markdown operacional e registrar plano mínimo de execução com quatro checkpoints independentes de validação do operador:

1. apresentação da Janela Temporal;
2. controle de ordenação;
3. animação de reordenação;
4. curva experimental de Tom.

Não acumular os quatro blocos para uma única validação final. Cada experimento deve ficar observável e ajustável antes do seguinte quando isso reduzir retrabalho.

# 1. Objetivo

Ao final da 05.18, o laboratório deve permitir ao operador decidir de forma concreta:

- a apresentação final da região temporal do Panorama;
- a aparência e a lógica de alternância do controle de ordenação;
- se a troca de posições das categorias deve receber animação e, em caso positivo, qual comportamento visual é aceitável;
- qual transformação não linear deve substituir a intensidade cromática linear do Tom em todo o sistema.

A unidade deve produzir componentes, utilitários ou variações experimentais tecnicamente reutilizáveis, mas não deve antecipar a integração final em `/rememorar`.

# 2. Limite da unidade

Entram nesta unidade:

- refinamento visual experimental de CMP-008 no laboratório;
- label `Período`;
- datas extremas compactas abaixo do trilho;
- mensagem centralizada para geometria temporariamente inválida;
- composição experimental fixa no topo com Período e Ordenação;
- controle compacto de ordenação com Representatividade e Tom;
- todas as alternâncias e critérios de desempate definidos abaixo;
- massa controlada para observar reordenação de categorias;
- experimentação de animação de troca de posições;
- respeito a movimento reduzido;
- transformação cromática não linear parametrizável do Tom;
- comparação entre mapeamento linear e experimental;
- aplicação experimental da nova curva aos diferentes usos da linguagem de Tom no laboratório;
- simulação em largura móvel da região fixa superior;
- testes automatizados das regras puras de ordenação e transformação cromática quando aplicável;
- validação visual progressiva pelo operador.

Não entram nesta unidade:

- integração definitiva desses refinamentos em `/rememorar`;
- persistência da preferência de ordenação entre jornadas;
- remoção dos controles temporários de cenários da rota real;
- segundo nível de Rememorar;
- navegação ao selecionar categoria;
- paginação, `Mostrar mais`, virtualização ou scroll interno da lista;
- alteração de REG-202 ou REG-203;
- mudança do cálculo do Tom agregado;
- backend real.

# 3. Experimento da região temporal

Criar no laboratório uma composição que represente a região superior pretendida para o Panorama.

## 3.1 Label

Acima da Janela Temporal, apresentar o label curto:

`Período`

Não utilizar `Janela Temporal` como rótulo visível de produto.

Não adicionar instrução permanente como `Arraste as alças para escolher o período`. A interação deve ser compreensível pelos próprios controles, datas e resposta visual do Panorama. Acessibilidade não visual continua obrigatória por nomes e descrições apropriadas.

## 3.2 Estado válido

Abaixo do trilho, substituir a frase atual com quantidade de dias por somente as duas datas extremas do intervalo funcional vigente:

```text
DD/MM/AAAA                              DD/MM/AAAA
```

A data inicial fica alinhada à esquerda e a final à direita. Ambas usam tamanho visual reduzido e formato numérico `DD/MM/AAAA`.

Não apresentar quantidade de dias, quantidade de memórias, percentuais ou frase envolvendo o intervalo.

## 3.3 Geometria temporariamente inválida

Quando as duas alças resolverem temporariamente para o mesmo dia, a linha das datas deve ser substituída integralmente por uma mensagem centralizada:

`Inclua pelo menos dois dias no período.`

Não apresentar a mesma data dos dois lados durante esse estado, pois o Panorama continua funcionalmente sustentado pelo último intervalo válido.

A regra funcional de CMP-008 não muda: intervalo válido exige ao menos dois dias preservados distintos e o último intervalo funcional válido permanece vigente enquanto a geometria estiver temporariamente inválida.

# 4. Região superior fixa no laboratório

A composição experimental deve permitir testar como região fixa superior:

1. `Período`;
2. CMP-008;
3. datas ou mensagem de intervalo inválido;
4. linha de ordenação.

A lista de categorias deve utilizar somente a rolagem normal da página. Não criar área de rolagem interna para as categorias.

Testar essa composição também em simulação móvel. O objetivo é observar se a região fixa preserva área útil suficiente e se os controles permanecem legíveis e operáveis. Altura exata, sombra, espaçamento e técnica de sticky permanecem ajustáveis no laboratório.

# 5. Controle experimental de ordenação

Criar uma única linha compacta com a estrutura conceitual:

```text
Ordenar por   Representatividade +   Tom
```

Somente o critério ativo recebe destaque visual e mostra seu estado. O critério inativo permanece sem sinal.

Os sinais `+`, `−` e `∅` devem possuir nomes acessíveis que expressem seu significado. Não depender exclusivamente do símbolo para leitores de tela.

## 5.1 Representatividade

Ao selecionar Representatividade a partir de outro critério, ela sempre inicia em:

`Representatividade +`

Esse estado significa maior representatividade primeiro.

Novo clique sobre a própria Representatividade alterna para:

`Representatividade −`

Esse estado significa menor representatividade primeiro.

Novo clique retorna para `Representatividade +`.

Ao abandonar Representatividade para selecionar Tom, seu subestado anterior é esquecido. Se o usuário voltar a Representatividade, ela reinicia em `+`.

### Ordenação por Representatividade

`Representatividade +`:

1. representatividade decrescente;
2. empate: nome em ordem alfabética crescente.

`Representatividade −`:

1. representatividade crescente;
2. empate: nome em ordem alfabética crescente.

# 6. Ordenação por Tom

Ao selecionar Tom a partir de Representatividade, Tom sempre inicia em:

`Tom +`

Cliques sucessivos sobre Tom percorrem ciclicamente:

```text
Tom + → Tom − → Tom ∅ → Tom +
```

Ao abandonar Tom para Representatividade, o subestado anterior de Tom é esquecido. Se o usuário voltar a Tom, ele reinicia em `+`.

Tom `0` é valor definido e não recebe tratamento especial. Ele aparece naturalmente entre positivos e negativos conforme a direção escolhida.

Tom nulo significa ausência de Tom e permanece semanticamente distinto de Tom neutro.

## 6.1 Tom +

Ordenar categorias com Tom definido do valor mais positivo para o mais negativo.

Critérios:

1. Tom agregado decrescente;
2. mesmo Tom: maior representatividade primeiro;
3. persistindo empate: nome em ordem alfabética crescente;
4. categorias sem Tom ficam depois de todas as categorias com Tom definido;
5. dentro do grupo sem Tom: maior representatividade primeiro e depois nome crescente.

## 6.2 Tom −

Ordenar categorias com Tom definido do valor mais negativo para o mais positivo.

Critérios:

1. Tom agregado crescente;
2. mesmo Tom: maior representatividade primeiro;
3. persistindo empate: nome em ordem alfabética crescente;
4. categorias sem Tom ficam depois de todas as categorias com Tom definido;
5. dentro do grupo sem Tom: maior representatividade primeiro e depois nome crescente.

## 6.3 Tom ∅

`Tom ∅` significa `Sem Tom primeiro`.

Não utilizar símbolo de bloqueio/cancelamento. O símbolo visual de referência é `∅`, acompanhado por nome acessível completo.

Ordenação:

1. primeiro todas as categorias sem Tom;
2. dentro desse grupo: maior representatividade primeiro;
3. empate: nome crescente;
4. depois todas as categorias com Tom definido;
5. nesse segundo grupo: maior representatividade primeiro;
6. empate: nome crescente.

Nesse modo, os Tons definidos não são ordenados por seu valor sentimental. A pergunta da perspectiva é quais categorias estão sem Tom; encerrado esse grupo, a lista retorna à relevância padrão do Panorama.

# 7. Experimento de reordenação animada

Criar no laboratório um cenário controlado em que categorias mudem repetidamente de posição por alteração do intervalo, dos valores ou do critério de ordenação.

Experimentar uma transição visual que permita perceber a caixa saindo da posição anterior e ocupando a nova posição, em vez de simplesmente desaparecer de um ponto e surgir em outro.

A técnica é decisão do programador. FLIP, recurso nativo da stack ou abordagem equivalente são aceitáveis. Não congelar uma implementação técnica específica como requisito funcional.

A referência inicial pode permanecer próxima da família de 180 ms já aprovada para largura, cor e entrada/saída, mas a duração deve poder ser calibrada se o resultado visual pedir outro valor.

O laboratório precisa permitir observar:

- troca de poucas categorias;
- muitas categorias trocando simultaneamente;
- reordenação durante mudanças contínuas do período;
- troca de critério de ordenação;
- interação combinada com as transições já existentes de largura, cor e entrada/saída.

O operador decide após a experimentação se essa animação deve ser integrada na 05.19. Ela não é requisito obrigatório do produto antes dessa aprovação.

Com movimento reduzido ativado, a reordenação não deve depender de animação espacial para continuar compreensível e funcional.

# 8. Experimento da curva cromática do Tom

A intensidade cromática atual varia linearmente entre Tom `0` e os extremos `-100` e `+100`. A experimentação deve criar uma transformação visual não linear, simétrica para positivos e negativos, sem alterar o valor funcional do Tom.

A transformação aprovada futuramente deverá ser aplicável à linguagem de Tom como um todo, e não somente ao Tom agregado do Panorama. Por isso, o laboratório deve observar seu efeito em diferentes componentes que reutilizam `aparenciaTom` ou linguagem equivalente.

Tom nulo continua fora da escala e mantém tratamento próprio de ausência.

## 8.1 Dois parâmetros ajustáveis

Trabalhar com a magnitude absoluta do Tom, de `0` a `100`, e disponibilizar dois parâmetros experimentais:

1. `limiar`: magnitude próxima do neutro em que a taxa de degradação muda;
2. `intensidade no limiar`: intensidade visual que o limiar deve possuir na nova curva.

Exemplo de referência:

```text
limiar = 20
intensidade no limiar = 50
```

Nesse caso:

- Tom 100 produz intensidade 100;
- Tom 20 produz intensidade 50;
- entre 100 e 20 ocorre somente a variação que no mapeamento linear existiria entre 100 e 50;
- entre 20 e 0 concentra-se o restante da aproximação ao neutro.

Outro exemplo possível:

```text
limiar = 10
intensidade no limiar = 80
```

Isso mantém a cor viva por uma faixa ainda maior e concentra a perda de intensidade nos valores muito próximos de zero.

## 8.2 Função experimental inicial

A primeira implementação deve ser simples e controlável, com dois trechos lineares conectados:

- `0 → limiar`: intensidade `0 → intensidade no limiar`;
- `limiar → 100`: intensidade `intensidade no limiar → 100`.

A mesma transformação usa a magnitude absoluta para positivos e negativos; o sinal continua escolhendo a família cromática correspondente.

Se a junção dos trechos produzir uma quebra visual indesejada, o operador pode pedir nova experimentação de suavização. Não antecipar curva exponencial, logarítmica ou easing complexo antes dessa evidência.

## 8.3 Ferramentas do laboratório

Disponibilizar no mínimo:

- controle de Tom de teste entre `-100` e `+100`;
- controle de `limiar`;
- controle de `intensidade no limiar`;
- comparação lado a lado `Linear` e `Experimental`;
- amostras simultâneas ao longo da escala positiva e negativa;
- amostra separada para Tom nulo;
- visualização em pelo menos CMP-009 e outros usos relevantes da linguagem de Tom existentes no laboratório.

Uma sequência como `100, 80, 60, 40, 20, 10, 0` e seu espelho negativo pode ser usada como referência visual, sem transformar esses pontos em regra de produto.

# 9. Testes automatizados

A unidade é principalmente visual, mas as regras determinísticas devem receber cobertura automatizada quando forem extraídas como funções ou utilitários.

Cobrir no mínimo:

1. Representatividade inicia em `+` ao ser selecionada a partir de Tom;
2. Representatividade alterna `+ ↔ −`;
3. Tom inicia em `+` ao ser selecionado a partir de Representatividade;
4. Tom percorre `+ → − → ∅ → +`;
5. trocar de critério esquece o subestado anterior;
6. Representatividade usa alfabético crescente como desempate;
7. Tom `+` ordena definidos em ordem decrescente e nulos ao final;
8. Tom `−` ordena definidos em ordem crescente e nulos ao final;
9. Tom `0` participa normalmente das duas direções;
10. Tom `∅` coloca nulos primeiro e usa representatividade como ordenação interna e posterior;
11. empates de Tom usam representatividade e depois alfabético;
12. transformação cromática preserva `0 → 0`;
13. transformação cromática preserva `100 → 100`;
14. o limiar produz exatamente a intensidade configurada;
15. a transformação é simétrica entre magnitudes positivas e negativas;
16. Tom nulo não é convertido em intensidade da escala;
17. movimento reduzido não impede uso funcional dos controles e da lista.

Não criar testes frágeis dependentes de milissegundos exatos de animação.

# 10. Validação pelo operador

A unidade deve ser conduzida por quatro validações visuais progressivas.

## Checkpoint A — região temporal

Validar:

- label `Período`;
- datas compactas à esquerda e direita;
- formato `DD/MM/AAAA`;
- substituição por mensagem centralizada no estado inválido;
- ausência de instrução permanente;
- composição fixa e comportamento em simulação móvel.

## Checkpoint B — ordenação

Validar:

- linha única `Ordenar por`;
- destaque do critério ativo;
- exclusividade do sinal;
- alternâncias de Representatividade;
- ciclo de Tom;
- reinicialização do subestado ao trocar de critério;
- comportamento dos nulos e dos empates.

## Checkpoint C — reordenação animada

Validar se a animação ajuda a compreender a troca de posições sem gerar distração excessiva. O operador pode aprovar, rejeitar ou solicitar calibração antes que a 05.19 seja ajustada.

## Checkpoint D — curva de Tom

O operador deve experimentar diferentes combinações de limiar e intensidade até encontrar uma curva satisfatória, comparando linear e experimental e observando tanto positivos quanto negativos, neutro e ausência.

O Parecer final deve registrar os valores escolhidos e qualquer consequência necessária para a 05.19.

# 11. Verificações técnicas finais

Antes do encerramento, executar conforme aplicável:

- testes automatizados relevantes;
- novos testes desta unidade;
- checagem de tipos;
- lint;
- formatação dos arquivos tocados;
- build de produção quando fizer parte do processo vigente;
- `git diff --check` ou equivalente;
- revisão do diff final.

Confirmar ainda que:

- `/rememorar` não recebeu silenciosamente o acabamento final da 05.19;
- REG-202 e REG-203 não foram alterados;
- não foi criada paginação ou rolagem interna da lista;
- não foi antecipado o segundo nível de Rememorar;
- a curva experimental não muda o valor funcional do Tom;
- preferência por movimento reduzido continua respeitada.

# 12. Critérios de conclusão

A 05.18 está concluída quando:

- a nova apresentação temporal foi validada no laboratório;
- o controle de ordenação foi validado com todas as alternâncias;
- os critérios de desempate foram comprovados;
- o tratamento de Tom nulo foi comprovado;
- a reordenação animada foi experimentada e recebeu decisão explícita do operador;
- a curva cromática não linear foi experimentada com parâmetros ajustáveis;
- o operador escolheu ou rejeitou uma configuração final para a curva;
- o efeito global da curva sobre a linguagem de Tom foi observado;
- a região fixa foi observada em largura móvel;
- testes e verificações técnicas pertinentes passaram;
- o Parecer final registra as decisões que devem atualizar a 05.19.

## Resultado esperado

Depois da 05.18, não deve restar decisão visual relevante sobre os quatro experimentos. A unidade seguinte poderá integrar somente comportamentos já aprovados, persistir a preferência de ordenação, finalizar a região fixa do Panorama e encerrar o primeiro nível de Rememorar sem descobrir sua linguagem visual durante a implementação.

## Continuidade

### Clarificação

- Leitura funcional concluída em 2026-10-04. Não foram encontradas lacunas que exijam inventar regras, conteúdo, estados ou comportamentos; os quatro experimentos e seus critérios estão definidos no corpo aprovado.
- A Spec 18 já existia como arquivo não rastreado (`?? .docs/especificacoes/18-refinamento-do-panorama.md`) no início desta sessão. Seu conteúdo aprovado foi preservado.
- Indicadores de contexto: antes das leituras — não disponíveis na interface; após AGENTS, índice, memória inicial e Especificação — não disponíveis na interface; ao final da unidade — registrar quando a unidade terminar, se disponível. Nenhum valor foi estimado.

### Plano de execução

1. **Checkpoint A — região temporal.** Compor no laboratório Período, CMP-008, datas/mensagem de estado inválido e linha de ordenação no topo fixo; observar largura móvel. Apresentar para validação do operador antes de avançar.
2. **Checkpoint B — ordenação.** Implementar controle, alternâncias, reinicialização dos subestados e ordenadores puros com critérios e desempates especificados; verificar regras determinísticas e apresentar no laboratório para validação.
3. **Checkpoint C — reordenação.** Criar massa controlada e experimentar movimento espacial, estados de movimento reduzido e combinações com transições existentes; apresentar para decisão explícita do operador.
4. **Checkpoint D — curva de Tom.** Adicionar parâmetros, comparação linear/experimental e amostras da linguagem compartilhada; verificar regras puras e apresentar para escolha do operador.
5. Fazer verificações técnicas finais aplicáveis, revisar o diff e registrar decisões para a 05.19 no Parecer final somente quando o operador solicitar encerramento.

**Estado:** unidade encerrada a pedido do operador; Parecer final registrado abaixo. **Validação final:** formatação dos 15 arquivos de código/CSS verificada; 12 testes (5 da curva e 7 de ordenação) passaram; checagem de tipos, lint e `git diff --check` passaram; `deno task build` compilou cliente e SSR com sucesso fora do sandbox. A primeira tentativa no sandbox foi bloqueada ao ler `vite.config.ts`; a repetição autorizada fora do sandbox concluiu com sucesso. **Indicadores de contexto:** antes das leituras, após a leitura inicial e ao final — não disponíveis na interface; sem estimativa. **Entrega:** Parecer final entregue ao operador nesta sessão; nenhuma atualização do Drive foi feita.

### Checkpoint A — aprovado

- `JanelaTemporal` recebeu a propriedade opcional `mostrarDatasExtremas`, usada somente no experimento. Ela apresenta `Período`, as datas do último intervalo funcional válido e, durante geometria inválida, a mensagem centralizada definida na Especificação; nomes e descrições acessíveis dos controles permanecem associados.
- O laboratório posiciona a região temporal como sticky e acrescenta a simulação de largura móvel de 390 px. A lista de datas de cenário e os diagnósticos existentes seguem como material de laboratório fora da apresentação do intervalo.
- A rota real `/rememorar` não usa a nova propriedade e não recebeu essa apresentação experimental.
- Aprovado pelo operador após iteração: datas e mensagem abaixo do trilho; datas em 0.7rem, mensagem em 1rem e linha com altura fixa para a troca de estado não deslocar o conteúdo abaixo.

### Checkpoint B — aprovado

- A região sticky agora inclui a linha compacta `Ordenar por`; a lista das nove categorias controladas fica abaixo, na rolagem normal. O experimento de categoria isolada permanece no laboratório.
- O critério ativo tem destaque e sinal visual. Os rótulos acessíveis descrevem maior/menor representatividade, direção do Tom ou “Sem Tom primeiro”; critérios inativos não exibem sinal.
- `app/utilitarios/ordenacaoPanorama.ts` concentra a alternância dos critérios e a ordenação, inclusive desempates por representatividade/nome, Tom zero e ausências. Foi criado teste local com sete cenários cobrindo estado, alternâncias, reinício e ordenação.
- A superfície da janela passou a usar `overflow: clip` para permitir que a região sticky acompanhe a rolagem do documento sem criar rolagem interna.
- Os dois botões de ordenação ficam agrupados sem quebra de linha; o rótulo pode ocupar uma linha separada na largura móvel.
- Validação automatizada: sete testes passaram; checagem de tipos, lint e diff check passaram. O operador aprovou a ordenação após observar os critérios e pediu os botões agrupados quando houver quebra de linha.

### Checkpoint C — aprovado

- A reordenação das linhas usa FLIP com Web Animations API e duração ajustável de 80 a 600 ms (padrão 180 ms). A variação dos valores fictícios aciona reordenações com o critério selecionado; as transições existentes de largura e cor continuam ativas.
- O controle “Simular movimento reduzido” desliga movimento espacial e encurta as transições de largura/cor, preservando os controles e a lista. A preferência real do sistema também é respeitada pela animação FLIP.
- O operador aprovou o efeito; escolheu manter 180 ms. Observou que em velocidades mais altas a alternância fica menos nítida, o que considera esperado.

### Checkpoint D — aprovado

- O bloco “Tom — curva cromática experimental” compara lado a lado `Linear` e `Experimental`, com sliders para Tom, limiar (padrão 20) e intensidade no limiar (padrão 50).
- As amostras cobrem positivos, negativos, zero e ausência separada, usando `CategoriaPanorama` e o componente real `Memoria`. O padrão dos demais consumidores continua linear; apenas as amostras experimentais recebem a função configurável.
- As linhas de limiar nas colunas Linear e Experimental mostram a intensidade correspondente e reservam a mesma altura para manter as amostras alinhadas.
- `app/utilitarios/curvaTom.ts` implementa dois trechos lineares simétricos, sem alterar o Tom funcional. Foram acrescentados cinco testes para extremos, limiar, simetria, nulo e limite da intensidade. A referência técnica de componentes registra o parâmetro opcional de apresentação visual.
- Aprovado pelo operador: limiar 20 e intensidade 50, considerados levemente melhores. A decisão foi registrada para orientar a Spec 19.

## Parecer final

A 05.18 foi concluída com quatro experimentos no `/laboratorio`. A região temporal apresenta `Período`, as datas extremas abaixo do trilho e a mensagem especificada durante geometria inválida; a região superior fixa foi preparada para simulação móvel. O controle de ordenação aplica as alternâncias e desempates definidos, com a lista na rolagem normal. A preferência de ordenação não foi persistida.

A reordenação FLIP foi aprovada em 180 ms, respeitando movimento reduzido. A curva experimental de dois trechos lineares foi observada em `CategoriaPanorama` e no componente real `Memoria`; o operador escolheu limiar 20 e intensidade 50. A curva afeta somente a apresentação visual, preserva o Tom funcional e deixa Tom ausente fora da escala.

Para orientar a 05.19: integrar a região temporal e o controle de ordenação aprovados; persistir a preferência conforme previsto para a unidade seguinte; manter a animação espacial em 180 ms com respeito a movimento reduzido; aplicar a curva de Tom escolhida (limiar 20 / intensidade 50) à linguagem visual compartilhada. Esta unidade não integrou o acabamento final em `/rememorar`, não implementou persistência de ordenação, segundo nível, paginação, rolagem interna ou backend.

Verificações: 12 testes automatizados passaram; formatação, checagem de tipos, lint e `git diff --check` passaram. O build de produção compilou cliente e SSR com sucesso fora do sandbox. Os indicadores de contexto antes das leituras, após a leitura inicial e ao final não estavam disponíveis na interface e não foram estimados.

Este Parecer foi entregue ao operador nesta sessão. O Google Drive não foi atualizado.

