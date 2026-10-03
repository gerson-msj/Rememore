# 05.17 - Integração Funcional do Panorama

## Estado

Décima sétima unidade de desenvolvimento da fase 05 - Especificação. A unidade conecta a infraestrutura de dados materializada pela 05.16 aos dois componentes já existentes do primeiro nível de Rememorar: CMP-008 — Janela Temporal de Rememorar e CMP-009 — Categoria do Panorama.

O objetivo é fazer o Panorama funcionar com a projeção local real, ainda sem acabamento de composição. A página permanece deliberadamente simples nesta unidade.

## Origem funcional

Esta unidade materializa principalmente:

- REG-201 — Validade da janela temporal de Rememorar;
- REG-202 — Escala visual da quantidade de categoria;
- REG-203 — Tom agregado da categoria no panorama;
- REG-204 — Projeção local mínima do panorama, já materializada pela 05.16;
- CMP-008 — Janela Temporal de Rememorar, materializado pela 05.14;
- CMP-009 — Categoria do Panorama, materializado pela 05.15;
- a preparação e persistência local de Rememorar materializadas pela 05.16.

As referências acima registram a origem das decisões. O programador não deve depender da releitura dos documentos de Funcionalização para completar a unidade; o comportamento necessário está descrito abaixo.

## Clarificação e planejamento

Antes de alterar o código, o programador deve realizar a clarificação funcional inicial prevista pelo processo do projeto. Se não identificar lacuna funcional, deve informar isso explicitamente e seguir.

Depois da clarificação, deve atualizar a cópia Markdown operacional da Especificação e registrar um plano mínimo de execução. O plano deve contemplar ao menos:

1. leitura da projeção e do catálogo locais produzidos pela 05.16;
2. substituição das cinco datas artificiais atualmente usadas por `/rememorar`;
3. alimentação de CMP-008 com as datas preservadas reais;
4. derivação local das categorias do intervalo vigente;
5. cálculo de quantidade, Tom agregado e representatividade;
6. alimentação de CMP-009 com os modelos calculados;
7. atualização reativa ao mover a janela;
8. testes automatizados dos cálculos e da integração;
9. validação funcional com cenários pequenos e amplos do mock;
10. verificações finais de tipos, lint, formatação, build e diff.

Decisões internas de organização de código, nome de utilitários, composição técnica e criação de um contêiner/orquestrador técnico permanecem sob responsabilidade do programador, desde que não seja criado silenciosamente um novo componente canônico de produto.

# 1. Objetivo

Ao final da 05.17, `/rememorar` deve deixar de utilizar as cinco datas artificiais de desenvolvimento e passar a apresentar um Panorama funcional calculado exclusivamente a partir da projeção local e do catálogo de categorias sincronizados pela 05.16.

A sequência funcional será:

```text
projeção local + catálogo local
        ↓
dias preservados ordenados
        ↓
Janela Temporal de Rememorar
        ↓
intervalo vigente
        ↓
blocos das datas selecionadas
        ↓
derivação das categorias
        ↓
quantidade + Tom agregado + representatividade
        ↓
Categorias do Panorama
```

Nenhuma consulta remota adicional deve ser necessária quando o usuário apenas mover ou redimensionar a janela temporal. O recálculo do Panorama é local.

# 2. Limite da unidade

Entram nesta unidade:

- consumo da projeção local real criada pela 05.16;
- consumo do catálogo local de categorias já sincronizado;
- uso das datas preservadas reais em CMP-008 — Janela Temporal de Rememorar;
- intervalo inicial abrangendo todo o conjunto de dias preservados da jornada;
- recorte da projeção segundo o intervalo funcional publicado por CMP-008;
- derivação das categorias presentes no intervalo;
- contagem das associações memória–categoria;
- semântica correta de memórias com múltiplas categorias;
- cálculo do Tom agregado conforme REG-203;
- cálculo da representatividade conforme REG-202;
- resolução do nome da categoria pelo catálogo local;
- alimentação de CMP-009 — Categoria do Panorama;
- atualização imediata da lista quando o intervalo funcional mudar;
- apresentação de todas as categorias do intervalo;
- ordem inicial canônica por quantidade decrescente, sem controles de ordenação;
- integração funcional em `/rememorar`;
- testes automatizados e validação funcional dos cenários de mock.

Não entram nesta unidade:

- títulos ou subtítulos novos;
- legendas;
- textos explicativos do Panorama;
- controles de ordenação;
- ordenação por Tom;
- filtros;
- paginação;
- `Mostrar mais` ou revelação progressiva;
- limite artificial da quantidade de categorias visíveis;
- navegação para o segundo nível ao selecionar uma categoria;
- Projeção Temporal da Categoria;
- Onda de Utilização da Categoria;
- Variação do Tom da Categoria;
- lista de memórias da categoria;
- consulta individual da memória;
- redesign de CMP-008 ou CMP-009;
- nova experiência visual de erro;
- backend real.

# 3. Preparação e fonte dos dados

A preparação de Rememorar já materializada pela 05.16 continua sendo a fronteira de inicialização da jornada. Ela sincroniza/verifica primeiro a projeção e depois o catálogo de categorias.

A 05.17 deve consumir o estado local resultante dessa preparação. Não deve reimplementar versionamento, sincronização, tombstones, reconstrução integral ou catálogo.

Depois da preparação bem-sucedida, a página obtém do IndexedDB a projeção da conta autenticada e o catálogo local correspondente.

As cinco datas artificiais atualmente utilizadas pela composição visual de `/rememorar` deixam de alimentar a página.

Não utilizar dados artificiais como fallback silencioso quando a preparação real não estiver disponível. Esta unidade não precisa criar uma experiência visual elaborada de falha; deve apenas preservar o contrato técnico existente e não apresentar um Panorama fictício como se fosse real.

# 4. Janela Temporal de Rememorar com dados reais

CMP-008 — Janela Temporal de Rememorar deve receber a sequência cronologicamente ordenada das datas preservadas existentes na projeção local.

Somente datas realmente preservadas ocupam posições na janela. Lacunas do calendário não criam posições intermediárias, conforme o comportamento já materializado na 05.14.

Ao iniciar uma nova jornada de Rememorar, o intervalo funcional começa abrangendo todo o conjunto disponível.

A janela continua responsável apenas por publicar um intervalo válido. Não deve conhecer categorias, quantidade, Tom ou cálculos do Panorama.

A 05.17 não altera:

- posições contínuas normalizadas;
- regra mínima de dois dias preservados distintos;
- último intervalo válido durante geometria temporariamente inválida;
- comportamento das alças;
- arraste conjunto;
- resize;
- teclado;
- marcadores e regra de densidade.

Quando CMP-008 publicar um novo intervalo funcional válido, o Panorama é recalculado imediatamente a partir da projeção local.

Movimentos contínuos que ainda resolvam para o mesmo intervalo discreto não exigem recalcular modelos funcionalmente idênticos, embora a otimização concreta seja decisão técnica.

# 5. Derivação das categorias do intervalo

Para o intervalo vigente, considerar apenas os blocos das datas preservadas compreendidas entre os índices inicial e final publicados pela janela, inclusive os dois extremos.

O Panorama deve reunir todos os identificadores de categoria que possuam pelo menos uma associação de memória em qualquer data do intervalo.

Uma categoria que não possua associação alguma no novo intervalo deixa de aparecer. Uma categoria que passe a ter ao menos uma associação entra imediatamente na lista.

A unidade de quantidade é a associação **memória–categoria**.

## 5.1 Memórias com múltiplas categorias

Quando uma memória possui mais de uma categoria, ela contribui exatamente uma vez para cada categoria associada.

Exemplo:

```text
Memória A
categorias: Casa, Amigos
Tom: 30
```

Na projeção e nos cálculos do Panorama, essa memória produz conceitualmente:

```text
Casa   -> [30]
Amigos -> [30]
```

Portanto:

- Casa recebe uma ocorrência e o Tom 30;
- Amigos recebe uma ocorrência e o Tom 30;
- a memória não é dividida entre categorias;
- a soma das quantidades das categorias pode ser maior que o total de memórias únicas do intervalo, e isso é correto.

Se a memória possuir Tom ausente, a mesma ausência participa de cada associação correspondente:

```text
Casa   -> [nulo]
Amigos -> [nulo]
```

O nulo conta para a quantidade de ambas as categorias, mas não entra no cálculo do Tom agregado.

# 6. Quantidade por categoria

Para cada categoria presente no intervalo, `q` é a quantidade total de elementos da categoria nos blocos selecionados.

Cada elemento representa uma associação memória–categoria e deve ser contado independentemente de seu Tom ser positivo, negativo, zero ou ausente.

Exemplo:

```text
Casa -> [30, nulo, -10, 0]
```

resulta em:

```text
q = 4
```

A quantidade numérica não deve ser apresentada ao usuário nesta unidade. Ela é matéria-prima do cálculo de representatividade e da ordem inicial da lista.

# 7. Tom agregado

O Tom agregado de cada categoria segue REG-203.

Regras obrigatórias:

- considerar somente Tons definidos;
- Tom `0` é definido e participa normalmente da média;
- Tom ausente/nulo não participa da média;
- memórias sem Tom continuam contando para a quantidade;
- se nenhum Tom estiver definido para a categoria no intervalo, o Tom agregado é ausente/nulo;
- se existir ao menos um Tom definido, calcular a média aritmética simples desses valores.

Exemplo:

```text
Casa -> [30, -10, nulo, 0]
```

Quantidade:

```text
q = 4
```

Tom agregado:

```text
(30 + -10 + 0) / 3 = 6,666...
```

A estratégia técnica de arredondamento ou preservação de precisão interna pode seguir o contrato já aceito pelos utilitários de Tom, desde que a semântica da média não seja alterada.

Exemplo sem Tom definido:

```text
Trabalho -> [nulo, nulo]
```

resulta em quantidade 2 e Tom agregado ausente, distinto de Tom neutro `0`.

# 8. Representatividade visual

Depois de calcular a quantidade de todas as categorias presentes no intervalo, encontrar:

```text
qMax = maior quantidade entre as categorias do intervalo
```

A categoria mais frequente é a referência visual máxima.

Para cada categoria, calcular conforme REG-202:

```text
representatividade = sqrt(q / qMax)
```

O resultado entregue a CMP-009 deve estar normalizado entre `0` e `1`.

Como somente categorias com `q > 0` são apresentadas, um Panorama válido com categorias sempre possui `qMax > 0`.

A categoria ou categorias empatadas em `qMax` recebem representatividade `1`.

Não apresentar ao usuário `q`, `qMax`, frações, percentuais ou a fórmula.

# 9. Resolução pelo catálogo

Os blocos da projeção utilizam identificadores estáveis de categoria.

O nome apresentado por CMP-009 deve ser resolvido a partir do mesmo catálogo local versionado já reutilizado pela 05.16.

Não criar segundo catálogo, duplicação persistente de nome dentro da projeção nem validação cruzada nova de integridade referencial.

Categorias inativas continuam podendo ser apresentadas quando existem historicamente no intervalo, pois permanecem registradas no catálogo.

# 10. Modelo entregue à Categoria do Panorama

O contexto do Panorama deve produzir para cada categoria um modelo compatível com o contrato já materializado de CMP-009, contendo conceitualmente:

- identificador estável;
- nome resolvido;
- representatividade normalizada já calculada;
- Tom agregado ou ausência de Tom;
- callback de seleção exigido pelo componente.

CMP-009 continua sendo componente de apresentação. Não deve receber a projeção bruta nem passar a conhecer REG-202, REG-203, `qMax`, intervalo ou catálogo.

# 11. Ordem da lista

Esta unidade não cria funcionalidade nem controles de ordenação.

A apresentação usa somente a ordem inicial já definida para o Panorama: **quantidade decrescente**, da categoria mais frequente para a menos frequente dentro do intervalo vigente.

Empates podem ser resolvidos por um critério técnico estável e determinístico, sem significado funcional próprio. O programador pode reutilizar ordem de nome, identificador estável ou outro critério consistente, desde que o resultado não varie arbitrariamente entre renderizações com os mesmos dados.

Ordenação por Tom nas duas direções permanece para unidade posterior.

# 12. Composição deliberadamente simples de `/rememorar`

Nesta unidade, a área funcional de Rememorar deve permanecer essencialmente composta por:

```text
[ Janela Temporal de Rememorar ]

[ Categoria do Panorama ]
[ Categoria do Panorama ]
[ Categoria do Panorama ]
...
```

Não acrescentar nesta etapa:

- título do Panorama;
- explicações;
- legenda de cor;
- cabeçalho de lista;
- contador de categorias;
- quantidade numérica;
- controles de ordenação;
- paginação;
- `Mostrar mais`;
- scroll interno criado especificamente para limitar a lista.

Devem ser apresentadas **todas as categorias existentes no intervalo**.

Se o cenário de 300 dias produzir grande parte das 40 categorias, todas devem aparecer. Essa exposição é intencional: a unidade seguinte utilizará a observação real da lista ampla para decidir o tratamento definitivo de listas extensas.

A composição visual básica já existente dos dois componentes deve ser preservada. Ajustes técnicos mínimos de espaçamento necessários para integrá-los são permitidos, mas esta não é uma unidade de redesign.

# 13. Clique na Categoria do Panorama

Selecionar CMP-009 não conduz ao segundo nível nesta unidade.

O callback pode ser conectado a uma operação nula ou equivalente técnico. Clique, Enter ou Space sobre a categoria não precisam navegar, alterar a página, abrir detalhe, exibir mensagem ou produzir outro efeito funcional.

Não criar rota provisória, tela falsa, alerta temporário ou conteúdo de aprofundamento.

O segundo nível de Rememorar será materializado em unidade posterior.

# 14. Atualização reativa da janela

Quando o intervalo funcional mudar, recalcular localmente:

- conjunto de categorias presentes;
- quantidade de cada categoria;
- Tom agregado de cada categoria;
- `qMax`;
- representatividade de cada categoria;
- ordem inicial por quantidade.

Consequentemente, ao deslocar ou reduzir a Janela Temporal:

- categorias podem entrar ou sair da lista;
- as barras podem aumentar ou diminuir;
- uma nova categoria pode assumir a referência visual máxima;
- o Tom agregado de uma categoria pode mudar;
- a aparência de ausência de Tom pode surgir ou desaparecer conforme o recorte.

Nenhuma dessas mudanças deve provocar nova sincronização remota. Elas utilizam apenas os dados locais já preparados.

# 15. Cenários de mock para desenvolvimento e validação

A 05.17 deve reutilizar os cenários determinísticos criados pela 05.16:

- 2 dias;
- 7 dias;
- 30 dias;
- 300 dias.

Não criar nova massa paralela de dados para o Panorama.

A forma técnica já existente para selecionar o cenário pode ser utilizada pelo programador; não criar seletor de cenário na interface de produto.

O cenário de 7 dias é apropriado para inspeção funcional cotidiana. O cenário de 300 dias deve ser utilizado para observar o comportamento com uma janela extensa e uma lista ampla de categorias.

# 16. Testes automatizados obrigatórios

O programador deve planejar e executar cobertura automatizada compatível com esta unidade. Os itens abaixo são roteiro mínimo e podem ser ampliados quando a implementação revelar riscos adicionais.

## 16.1 Fonte e inicialização

Validar, no mínimo:

1. `/rememorar` deixa de utilizar as cinco datas artificiais como fonte funcional;
2. os dias entregues a CMP-008 são obtidos da projeção da conta autenticada;
3. as datas são ordenadas cronologicamente;
4. a nova jornada inicia com todo o conjunto selecionado;
5. mudar a janela não dispara nova sincronização/download remoto da projeção;
6. dados artificiais antigos não são usados como fallback silencioso.

## 16.2 Recorte temporal

Validar, no mínimo:

7. o intervalo funcional inclui seus dois extremos;
8. somente blocos de datas contidos no intervalo participam dos cálculos;
9. reduzir a janela remove corretamente contribuições externas ao novo intervalo;
10. deslocar a janela pode fazer categorias entrarem e saírem;
11. geometria temporariamente inválida de CMP-008 não substitui o último intervalo funcional válido.

## 16.3 Quantidade e múltiplas categorias

Validar, no mínimo:

12. uma memória com uma categoria contribui uma vez para aquela categoria;
13. uma memória com duas categorias contribui uma vez para cada uma;
14. o mesmo Tom da memória multicategorizada é considerado em cada categoria associada;
15. ausência de Tom da memória multicategorizada conta para a quantidade de cada categoria, mas não para suas médias;
16. a soma das quantidades das categorias pode superar o total de memórias únicas sem ser tratada como erro;
17. elementos com Tom nulo continuam contando para `q`;
18. Tom `0` continua contando para `q` e permanece valor definido.

## 16.4 Tom agregado

Validar, no mínimo:

19. média com apenas Tons positivos;
20. média com apenas Tons negativos;
21. média combinando Tons positivos, negativos e zero;
22. Tons nulos são excluídos do denominador da média;
23. categoria com apenas Tons nulos produz Tom agregado ausente;
24. categoria com Tom médio exatamente zero permanece distinta de categoria sem Tom.

## 16.5 Representatividade

Validar, no mínimo:

25. `qMax` é obtido entre as categorias do intervalo atual;
26. categoria com `q = qMax` recebe representatividade `1`;
27. categorias empatadas em `qMax` recebem `1`;
28. demais categorias seguem `sqrt(q / qMax)`;
29. mudar o intervalo pode mudar `qMax` e recalcular todas as larguras relativas;
30. CMP-009 recebe a representatividade pronta e não recalcula REG-202 internamente.

## 16.6 Catálogo e modelos

Validar, no mínimo:

31. nomes são resolvidos pelo catálogo local compartilhado;
32. categoria histórica inativa continua apresentável quando existe no recorte;
33. não é criado catálogo paralelo para Rememorar;
34. CMP-009 recebe identificador, nome, representatividade e Tom agregado/ausência coerentes com a projeção.

## 16.7 Lista e interação

Validar, no mínimo:

35. todas as categorias do intervalo são renderizadas;
36. não existe limite artificial de quantidade visível nesta unidade;
37. a lista usa quantidade decrescente como ordem inicial;
38. empates permanecem determinísticos entre renderizações com os mesmos dados;
39. não existem controles de ordenação por Tom ou quantidade;
40. não existe paginação ou `Mostrar mais`;
41. acionar uma Categoria do Panorama não navega para o segundo nível nem cria estado de aprofundamento.

## 16.8 Cenários amplos

Validar, no mínimo:

42. cenário de 2 dias produz um Panorama funcional no limite mínimo da janela;
43. cenário de 7 dias permite recortes diferentes com atualização correta;
44. cenário de 30 dias calcula e renderiza a lista a partir da projeção real;
45. cenário de 300 dias pode alimentar a janela e renderizar todas as categorias do intervalo sem erro funcional;
46. mover a janela no cenário de 300 dias continua sendo operação local e não exige tratamento remoto especial.

Não definir limite rígido de milissegundos como requisito de produto. Medições podem ser registradas se forem úteis, mas não devem tornar a suíte dependente do desempenho da máquina de teste.

# 17. Validação pelo operador

Depois dos testes automatizados e da integração funcional, disponibilizar `/rememorar` para validação do operador.

Não é necessário criar controles de diagnóstico na tela de produto.

A validação deve permitir observar, pelo menos:

- cenário pequeno, preferencialmente 7 dias, com movimentação dos extremos da Janela Temporal;
- entrada e saída de categorias conforme o recorte;
- mudança perceptível das larguras relativas;
- mudança de expressão de Tom conforme o intervalo;
- cenário amplo de 300 dias com grande quantidade de categorias visíveis;
- ausência de títulos, legendas, paginação e demais acabamentos deliberadamente adiados.

A finalidade desta validação não é aprovar ainda a composição final da página. É comprovar que os dois componentes já existentes funcionam juntos sobre os dados reais locais.

# 18. Verificações técnicas finais

Antes de solicitar encerramento, o programador deve:

- executar a suíte automatizada relevante existente;
- executar os novos testes desta unidade;
- executar checagem de tipos;
- executar lint;
- executar formatação/verificação de formatação dos arquivos tocados;
- executar build de produção quando fizer parte do processo vigente;
- executar `git diff --check` ou equivalente vigente;
- revisar o diff final;
- confirmar que a infraestrutura de sincronização da 05.16 não foi duplicada;
- confirmar que CMP-008 não passou a conhecer regras de categoria;
- confirmar que CMP-009 não passou a conhecer REG-202/203 ou a projeção bruta;
- confirmar que nenhuma navegação para o segundo nível foi antecipada;
- confirmar que nenhum acabamento de lista extensa foi introduzido por iniciativa técnica.

Se a implementação revelar um caso técnico adicional relevante para derivação, reatividade ou integração, o programador deve acrescentar o teste correspondente desde que não invente nova regra funcional.

# 19. Fora do escopo

Não fazem parte da 05.17:

- alteração do protocolo de sincronização da projeção;
- alteração do versionamento do catálogo;
- backend real;
- novo schema de servidor;
- novo componente canônico de Panorama sem discussão prévia;
- persistência nova do intervalo entre jornadas;
- títulos, legendas ou textos editoriais;
- controles de ordenação;
- ordenação por Tom;
- paginação ou revelação progressiva;
- decisão definitiva sobre listas extensas;
- navegação ao clicar na categoria;
- segundo nível de Rememorar;
- memória resumida ou completa;
- carregamento progressivo de memórias;
- balanço sentimental em consulta;
- redesign dos dois componentes já aprovados.

# 20. Critérios de conclusão

A 05.17 está concluída quando:

- `/rememorar` consome a projeção local criada pela 05.16;
- as cinco datas artificiais deixaram de ser a fonte da Janela Temporal;
- CMP-008 recebe a sequência real de dias preservados;
- a nova jornada começa abrangendo todo o histórico disponível;
- alterar a janela recalcula o Panorama localmente;
- apenas categorias presentes no intervalo são mostradas;
- cada associação memória–categoria conta uma vez para sua categoria;
- memórias multicategorizadas contribuem uma vez para cada categoria associada com o mesmo Tom ou ausência;
- quantidade considera Tons nulos;
- Tom agregado ignora nulos, inclui zero e distingue ausência de neutralidade;
- representatividade segue REG-202 com `qMax` do intervalo vigente;
- nomes são resolvidos pelo catálogo local compartilhado;
- CMP-009 recebe valores já calculados;
- todas as categorias do intervalo são apresentadas;
- a ordem inicial é quantidade decrescente, sem controles de ordenação;
- clicar/acionar uma categoria não navega nem abre segundo nível;
- não existem paginação, `Mostrar mais`, títulos, legendas ou outros acabamentos desta etapa;
- mover a janela não exige nova consulta remota;
- os cenários de 2, 7, 30 e 300 dias foram exercitados conforme aplicável;
- os testes automatizados da unidade passaram;
- a validação funcional do operador foi realizada;
- tipos, lint, formatação dos arquivos tocados, build e verificações pertinentes passaram;
- nenhuma responsabilidade da unidade seguinte foi antecipada.

## Resultado esperado

Depois da 05.17, o primeiro nível de Rememorar já será funcional em sua essência: a **Janela Temporal de Rememorar** controlará um recorte real da projeção local e a página mostrará todas as **Categorias do Panorama** correspondentes, com frequência relativa e Tom agregado recalculados imediatamente.

A unidade seguinte poderá concentrar-se exclusivamente na composição e no acabamento do Panorama: títulos e orientações se necessários, controles de ordenação, tratamento da lista extensa, eventual paginação ou revelação progressiva e demais decisões de experiência que dependem de observar o comportamento real produzido por esta integração.


## Continuidade

### Clarificação

Não foram identificadas lacunas funcionais na leitura inicial da Especificação e da referência técnica de Projeção de Rememorar. As regras de fonte, recorte temporal, contagem memória–categoria, média de Tom, representatividade, ordenação, interação nula e limites de composição estão especificadas. Se a inspeção do código revelar uma divergência que altere comportamento, interromper o trecho afetado e consultar o operador.

### Indicadores de contexto

- Antes das leituras: percentual e capacidade total não disponíveis na interface.
- Após AGENTS, índice, memória inicial, referência pertinente e Especificação, antes do fonte: percentual e capacidade total não disponíveis na interface.
- Ao final da unidade: percentual e capacidade total não disponíveis na interface. O histórico desta sessão chegou ao agente em forma de resumo condensado ao menos uma vez; não há indicador que permita determinar a quantidade total de compactações.

### Plano e estado

1. **Concluído — contratos e integração existente:** inspeção seletiva confirmou a preparação real já existente, CMP-008 e CMP-009; nenhum componente canônico foi alterado.
2. **Concluído — derivação:** `app/utilitarios/panoramaRememorar.ts` seleciona o intervalo inclusivo, conta cada associação, agrega Tons definidos, calcula qMax/representatividade e ordena por quantidade decrescente com desempate estável por ID.
3. **Concluído — integração:** `islands/Rememorar.tsx` consome projeção e catálogo somente após status pronto, ordena as datas reais, inicia CMP-008 no histórico todo e deriva novamente apenas quando muda o intervalo publicado. `routes/rememorar.tsx` e `islands/EstruturaProtegida.tsx` não usam mais as cinco datas artificiais. Falha de preparação não apresenta Panorama fictício.
4. **Concluído — cobertura automatizada:** seis testes do Panorama cobrem associações múltiplas, Tons nulos/zero, média/ausência, recortes inclusivos, reescala, categorias inativas, empates estáveis, fixtures de 2/7/30/300 dias e janela inválida. A suíte de projeção inclui troca do cenário mock com remoção das datas que saíram.
5. **Concluído — validação funcional do operador:** ao mover as alças da janela, o operador observou categorias, representatividade e Tom mudarem imediatamente; aprovou esse efeito para permanecer na experiência. O cenário amplo de 300 dias foi apresentado no navegador. Os cenários de 2, 7, 30 e 300 dias também estão cobertos pelos testes automatizados.
6. **Concluído — verificações técnicas:** os testes relevantes passaram 16/16; `deno fmt --check` passou nos nove arquivos de código da unidade; lint e `deno check` passaram nos fontes da integração; `git diff --check` passou; o build de produção passou fora do sandbox após bloqueio de leitura do sandbox. `deno task check` global não passou na etapa de formatação: reportou 108 arquivos fora do padrão no repositório, incluindo configurações e arquivos fora da unidade. Ajustes do operador: cenário padrão de desenvolvimento em 300 dias, intervalo entre categorias ampliado reutilizando a lista espaçada e largura do seletor temporal alinhada às caixas de categoria.

### Ajustes temporários solicitados na validação

- Controles de desenvolvimento para alternar entre 2, 7, 30 e 300 dias foram adicionados acima da lista do Panorama; trocar cenário sincroniza a projeção e reinicia a janela no histórico completo.
- A lista usa espaçamento CSS já existente. CMP-009 aplica sombra externa menor no hover, com transição de `box-shadow`.
- A largura da barra voltou a usar a representatividade original `√(q/qMax)`, calculada pelo Panorama e passada pronta a CMP-009. A sombra hover aprovada permanece menor e com transição.
- O trilho de CMP-008 foi ajustado para que as bordas externas das alças fiquem alinhadas às caixas de categoria.
- A atualização imediata de categorias, representatividade e Tom durante o movimento das alças foi validada e aprovada pelo operador.

O corpo aprovado permanece preservado. Encerramento solicitado pelo operador; Parecer final registrado abaixo.

## Parecer final

A rota `/rememorar` passou a consumir a projeção e o catálogo locais preparados para a conta autenticada. CMP-008 recebe os dias preservados reais e inicia com o histórico completo; seu intervalo recalcula localmente todas as categorias presentes, suas quantidades relativas e os Tons agregados, exibidos em ordem decrescente de quantidade por CMP-009. A interação não navega para um segundo nível. Os controles temporários para alternar os cenários de 2, 7, 30 e 300 dias foram mantidos conforme solicitação do operador.

O operador validou e aprovou a atualização imediata do Panorama durante o movimento das alças, mantendo-se esse comportamento para permitir observar as mudanças em tempo real. Foram aprovados também o espaçamento das categorias, a sombra reduzida no hover e o alinhamento da largura visual do seletor temporal às caixas.

Os 16 testes relevantes, lint, checagem de tipos, formatação dos nove arquivos de código da unidade, `git diff --check` e build de produção passaram. A tarefa agregada `deno task check` permanece sem aprovação global porque a formatação reportou 108 arquivos fora do padrão no repositório; as verificações direcionadas aos fontes da unidade passaram. Não foi implementado backend, segundo nível, paginação, ordenação interativa ou acabamento editorial, conforme o limite desta Especificação.

Parecer entregue ao operador em 03/10/2026; o registro canônico no Drive permanece sob responsabilidade do operador.
