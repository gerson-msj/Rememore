# 05.16 - Projeção Local e Sincronização de Rememorar

## Estado

Décima sexta unidade de desenvolvimento da fase 05 - Especificação. A unidade materializa a infraestrutura de dados que sustentará Rememorar
antes da integração funcional do Panorama.

Seu foco é exclusivamente a obtenção, versionamento, persistência e reutilização local da projeção mínima de Rememorar, além da reutilização
do catálogo versionado de categorias já existente e da criação de uma massa de dados mockada determinística para as próximas etapas.

Não há objetivo visual nesta unidade. As validações pertencem predominantemente ao programador por testes automatizados, inspeção técnica e
verificações do repositório.

## Origem funcional

Esta unidade materializa principalmente:

- REG-204 — Projeção local mínima do panorama;
- REG-205 — Sincronização incremental do cache de Rememorar;
- REG-110 — Sincronização versionada do catálogo de categorias, já materializada no contexto de Capturar e agora candidata a reutilização
  por Rememorar;
- a infraestrutura IndexedDB reutilizável criada na 05.05;
- a casca protegida de `/rememorar` e CMP-008 — Janela Temporal de Rememorar, já materializados pela 05.14, sem ainda alimentar esses
  componentes com a nova projeção;
- CMP-009 — Categoria do Panorama, materializado pela 05.15, ainda sem integração aos dados reais desta unidade.

As referências acima registram a origem das decisões. O programador não deve depender da releitura desses documentos para completar a
unidade. O comportamento necessário está descrito abaixo.

## Autossuficiência e clarificação inicial

Antes de alterar o código, o programador deve realizar a clarificação funcional inicial prevista pelo processo do projeto.

Se o entendimento abaixo estiver completo e não houver dúvida funcional, deve informar isso explicitamente e seguir. Decisões puramente
técnicas — nomes de módulos, formato físico dos stores, índices, divisão de serviços, organização das fixtures e arquitetura interna do mock
— permanecem sob responsabilidade do programador desde que preservem o comportamento definido.

Depois da clarificação, o programador deve criar ou atualizar a cópia Markdown operacional da Especificação e registrar nela um plano mínimo
de execução antes de iniciar a implementação.

Esse plano deve contemplar, no mínimo:

1. auditoria da infraestrutura de catálogo de categorias já existente e decisão técnica de reutilização/refatoração compartilhada;
2. evolução não destrutiva do schema IndexedDB para a projeção de Rememorar;
3. contrato remoto mockado da projeção e seu versionamento;
4. persistência e reconciliação incremental por data;
5. massa de dados determinística de referência;
6. estados de revisão necessários ao mock;
7. testes automatizados da sincronização, migração e fixtures;
8. verificações finais de tipos, lint, formatação, build e demais verificações pertinentes.

O programador pode ampliar o roteiro de testes e o plano técnico quando identificar riscos adicionais. Não deve reduzir os cenários mínimos
definidos nesta Especificação sem discussão com o operador.

## Objetivo

Ao final da 05.16, o front deve possuir uma fronteira de dados substituível capaz de representar o futuro servidor de Rememorar, manter no
IndexedDB uma projeção local compacta do acervo por conta e sincronizá-la por revisão global e blocos completos de data.

A unidade também deve deixar pronto um acervo mockado estável e reutilizável com cenários de 2, 7, 30 e 300 dias preservados, um catálogo
comum de até 40 categorias e dados suficientes para alimentar futuramente o Panorama, o aprofundamento da categoria e a consulta de
memórias.

O resultado desta unidade deve permitir que a próxima Especificação trate os dados locais como uma fonte real do front, sem continuar
inventando arrays específicos dentro de `/rememorar`.

# 1. Limite da unidade

Entram nesta 05.16:

- projeção local mínima de Rememorar em IndexedDB;
- isolamento da projeção por conta;
- revisão global local da projeção;
- fronteira remota mockada substituível por backend real;
- carga inicial quando ainda não houver projeção local;
- conferência de revisão nas sincronizações seguintes;
- resposta sem retransmissão de conteúdo quando a revisão local continuar atual;
- sincronização incremental por data preservada;
- substituição integral do bloco local de uma data alterada;
- tratamento de data removida;
- tratamento de data removida e posteriormente recriada;
- possibilidade de reconstrução integral da projeção;
- preservação da revisão local anterior quando a reconciliação não terminar com sucesso;
- evolução não destrutiva do schema IndexedDB;
- reutilização da infraestrutura existente do catálogo versionado de categorias;
- sincronização da projeção antes da sincronização do catálogo durante a preparação de Rememorar;
- massa de dados determinística de referência;
- cenários selecionáveis de 2, 7, 30 e 300 dias preservados;
- catálogo comum de até 40 categorias;
- memórias fictícias com conteúdo simples, categorias, Tom e alguns adendos;
- estados de revisão no mock suficientes para testar o contrato incremental;
- planejamento técnico obrigatório pelo programador;
- testes automatizados obrigatórios dos comportamentos desta unidade.

Não entram nesta unidade cálculo do Panorama, alimentação real da Janela Temporal de Rememorar, apresentação das Categorias do Panorama,
ordenação visual, revelação de categorias, aprofundamento de categoria ou qualquer nova interface de usuário.

# 2. Projeção local mínima de Rememorar

## 2.1 Unidade temporal

A unidade temporal da projeção é a **data preservada**.

A projeção não representa todos os dias corridos do calendário. Somente datas que efetivamente existem no acervo preservado integram o
conjunto.

Nenhuma data preservada pode existir sem memória. Se a última memória preservada de uma data deixar de existir, a data deixa de existir como
bloco atual da projeção.

## 2.2 Conteúdo conceitual

Para cada data existente, devem ser conhecidos os identificadores estáveis das categorias presentes e, para cada categoria, uma lista
contendo um valor de Tom ou ausência de Tom para cada memória associada àquela categoria naquela data.

Conceitualmente:

```text
data
  -> categoria
       -> [Tom | nulo, Tom | nulo, ...]
```

Exemplo meramente ilustrativo:

```text
2026-01-01
  categoria-a -> [20, nulo, 0]
  categoria-b -> [-35]
```

O exemplo não congela schema, nomes de campos ou organização física do IndexedDB.

## 2.3 Quantidade e múltiplas categorias

Cada elemento da lista de uma categoria representa uma associação de uma memória àquela categoria.

Se uma memória possuir duas categorias, seu Tom ou ausência de Tom participa da lista de cada uma das duas categorias.

A projeção não precisa preservar na própria lista a identidade da memória para realizar os cálculos do Panorama, salvo se o programador
identificar utilidade técnica compatível sem ampliar a responsabilidade funcional. O requisito é que a quantidade de associações e os Tons
correspondentes possam ser derivados corretamente.

Tom `0` é valor definido e deve permanecer distinto de Tom ausente/nulo.

## 2.4 Conteúdo deliberadamente ausente

A projeção sincronizada não deve carregar conteúdo desnecessário para suas responsabilidades.

Não pertencem à projeção mínima:

- texto integral da memória;
- adendos/complementos;
- balanço sentimental;
- conteúdo de apresentação que possa ser resolvido pelo catálogo de categorias;
- caches da futura lista de memórias do segundo nível.

Esses dados podem existir no acervo mockado do servidor para uso futuro, mas não devem ser retransmitidos nem persistidos como parte da
projeção REG-204.

# 3. Persistência local

A projeção deve ser persistida no IndexedDB e isolada por conta, seguindo a infraestrutura local já existente.

A implementação pode escolher a estrutura física que melhor se adapte ao repositório — store por blocos, registros compostos, metadados
separados ou equivalente — desde que seja possível:

- obter a revisão global local conhecida para uma conta;
- listar os dias preservados atuais daquela conta;
- obter o bloco atual de uma data;
- substituir integralmente um bloco de data;
- remover um bloco de data;
- reconstruir integralmente a projeção;
- concluir uma reconciliação sem promover a revisão global antes de todas as alterações necessárias estarem confirmadas.

A evolução do schema deve ser **não destrutiva** para os dados reais já existentes das unidades anteriores. Capturas locais, catálogo de
categorias e demais stores vigentes não podem ser apagados apenas para introduzir Rememorar.

A migração do schema faz parte dos testes obrigatórios.

# 4. Revisão global e sincronização incremental

## 4.1 Revisão global

A projeção local possui uma revisão global conhecida pelo cliente.

O serviço remoto mockado representa uma revisão global corrente do servidor.

Quando a revisão local e a revisão remota forem iguais, o conteúdo local pode ser reutilizado sem novo download dos blocos da projeção.

Uma verificação remota leve pode informar que não existem alterações. O contrato técnico concreto fica a cargo do programador.

## 4.2 Primeira sincronização

Quando não houver projeção local válida para a conta, o cliente deve obter o estado atual necessário para reconstruí-la integralmente e
registrar a revisão global correspondente somente depois da persistência bem-sucedida.

Essa carga inicial pode utilizar o mesmo contrato conceitual da sincronização incremental ou uma operação específica, conforme decisão
técnica.

O comportamento obrigatório é: ao terminar com sucesso, o IndexedDB deve representar integralmente o estado atual da projeção e possuir a
revisão global que originou esse estado.

## 4.3 Unidade incremental: data preservada

Quando a revisão local estiver atrasada, a unidade de atualização é a **data preservada**.

Cada data no servidor mantém apenas a última revisão global em que seu estado relevante para Rememorar mudou.

O servidor identifica as datas cuja última revisão seja posterior à revisão conhecida pelo cliente.

Para cada data que atualmente existe, a resposta contém o **bloco atual completo daquela data**, não uma sequência de eventos
intermediários.

O cliente substitui integralmente o bloco local correspondente.

Exemplo conceitual:

```text
cliente conhece revisão 20

data A -> última revisão 12
data B -> última revisão 21
data C -> última revisão 25

servidor retorna:
- bloco atual completo da data B
- bloco atual completo da data C
- revisão global corrente
```

A data A não precisa ser retransmitida.

## 4.4 Várias alterações sucessivas da mesma data

Se uma mesma data tiver sido alterada várias vezes depois da revisão conhecida pelo cliente, não é necessário transmitir todas as etapas.

O cliente recebe somente o estado atual completo da data associado à sua última revisão relevante.

O modelo não exige histórico de revisões intermediárias para a sincronização da projeção.

## 4.5 Data removida

Quando a última memória preservada de uma data for removida, a sincronização deve fornecer informação suficiente para que clientes antigos
removam o bloco local correspondente.

A implementação pode representar esse estado por tombstone, marcador de remoção ou solução equivalente.

Enquanto necessário para clientes desatualizados, a remoção permanece associada à revisão em que ocorreu.

## 4.6 Data recriada

Se uma data removida for posteriormente recriada, seu estado atual passa novamente a ser existente e recebe uma revisão posterior.

Um cliente que sincronize somente depois da recriação não precisa conhecer a sequência histórica remoção -> recriação. Deve receber o estado
atual existente mais recente.

## 4.7 Promoção da revisão local

A revisão global local só pode avançar para a revisão global corrente depois que todas as alterações necessárias daquela sincronização
tiverem sido reconciliadas e persistidas com sucesso.

Falha remota, falha de persistência ou interrupção da reconciliação não autorizam promover a nova revisão global como se o cache estivesse
atualizado.

O programador deve escolher uma estratégia segura de transação/commit compatível com o IndexedDB e com a infraestrutura existente.

## 4.8 Reconstrução integral

A projeção é derivada do acervo e pode ser reconstruída integralmente quando a sincronização incremental não puder ou não fizer sentido ser
usada.

O mock e os serviços devem permitir exercitar esse caminho.

A reconstrução bem-sucedida substitui o estado derivado anterior da projeção para a conta e registra a revisão global correspondente.

# 5. Catálogo de categorias: reutilização da infraestrutura existente

O catálogo de categorias **não deve ser reinventado para Rememorar**.

A 05.09 já materializou um catálogo local reutilizável por conta com:

- identidade estável da categoria;
- nome;
- versão individual;
- estado ativa/inativa;
- revisão/cursor global do catálogo;
- carga inicial;
- sincronização incremental por deltas;
- manutenção do cache local quando a sincronização não puder ser concluída.

O programador deve primeiro verificar se essa infraestrutura pode ser consumida diretamente por Rememorar.

Se ela estiver tecnicamente acoplada à jornada Capturar de forma que impeça reutilização limpa, é permitido refatorá-la para um serviço
compartilhado, desde que o comportamento vigente de Capturar seja preservado e seus testes continuem passando.

Não deve existir um segundo catálogo paralelo exclusivo de Rememorar.

## 5.1 Ordem de preparação

Na preparação de dados de Rememorar, a sequência funcional desta unidade é:

1. sincronizar/verificar a projeção de Rememorar;
2. sincronizar/verificar o catálogo de categorias reutilizável;
3. disponibilizar ao restante do front os estados locais resultantes.

Não é necessário acrescentar no front uma validação cruzada de integridade referencial entre todos os identificadores da projeção e o
catálogo.

A autoridade futura do backend e do banco de dados garante a integridade referencial entre memórias e categorias. A unidade não deve
duplicar essa responsabilidade tentando detectar no cliente uma memória que aponte para categoria inexistente.

Categorias inativas continuam existindo no catálogo e permanecem resolvíveis historicamente; estado inativo significa apenas
indisponibilidade para novas categorizações normais, não inexistência no acervo.

## 5.2 Falhas independentes

Projeção e catálogo possuem versionamentos independentes.

Uma falha de sincronização não deve ser interpretada como conteúdo vazio e não deve apagar silenciosamente um cache local válido já
conhecido.

Esta unidade não precisa criar uma experiência visual específica de erro em `/rememorar`. O serviço deve devolver estado técnico suficiente
para que uma unidade posterior decida a apresentação apropriada quando necessário.

# 6. Fronteira remota mockada

Não implementar backend real nesta unidade.

Deve existir uma fronteira de serviço substituível que represente o futuro servidor e seja capaz de:

- informar a revisão global vigente da projeção;
- responder sem blocos quando o cliente já estiver atualizado;
- entregar a carga inicial/reconstrução integral;
- identificar datas alteradas depois de uma revisão conhecida;
- devolver o bloco atual completo de cada data existente alterada;
- informar remoções necessárias;
- representar recriação posterior de data;
- simular falhas relevantes para os testes;
- trabalhar com os cenários determinísticos definidos abaixo.

O contrato deve representar a futura fronteira real, sem obrigar o mock a copiar uma implementação específica de backend que ainda não
existe.

# 7. Acervo mockado determinístico de referência

## 7.1 Finalidade

A massa de dados criada nesta unidade deve ser tratada como **acervo fictício de referência de Rememorar**, reutilizável nas próximas
Especificações.

Ela não deve ser recriada aleatoriamente a cada execução.

Os dados podem ser gerados uma única vez por algoritmo com semente fixa e depois congelados como JSON/fixtures, ou podem ser construídos
diretamente como dados estáticos. A escolha técnica é livre, mas execuções futuras com o mesmo cenário devem produzir exatamente o mesmo
universo.

Evitar duplicação manual desnecessária entre os cenários.

É recomendável manter um universo mestre de até 300 dias e descritores/subconjuntos determinísticos para os cenários menores, ou outra
estrutura equivalente que permita criar os dados uma única vez e reutilizá-los.

## 7.2 Cenários obrigatórios

Devem existir quatro cenários selecionáveis:

- **2 dias preservados**;
- **7 dias preservados**;
- **30 dias preservados**;
- **300 dias preservados**.

O programador deve deixar uma forma simples e técnica de escolher o cenário usado pelo mock, adequada ao padrão já empregado no projeto.

As datas não precisam ser consecutivas no calendário. A existência de lacunas é desejável para aproximar o mock do comportamento real de
Rememorar.

Cada cenário deve possuir exatamente a quantidade nominal de dias preservados.

Nenhum dos dias pode estar vazio.

## 7.3 Catálogo comum de categorias

Os quatro cenários devem utilizar um **catálogo comum com até 40 categorias possíveis**.

A intenção é aproximar o mock de um uso prolongado real, no qual o vocabulário de categorias cresce inicialmente e depois tende a reutilizar
temas já existentes.

As categorias não devem aparecer com frequência uniforme.

A massa deve conter uma distribuição variada, com combinação equivalente a:

- algumas categorias muito frequentes;
- várias categorias frequentes;
- categorias ocasionais;
- categorias raras;
- algumas categorias muito raras ou históricas.

Não é necessário congelar uma quantidade exata em cada grupo. O requisito é produzir uma cauda longa suficientemente diversa para tensionar
futuramente o Panorama.

Algumas categorias podem estar inativas no catálogo e ainda aparecer em memórias históricas da projeção, representando corretamente a
diferença entre categoria inativa para nova categorização e categoria ainda existente no acervo.

Os cenários menores não precisam utilizar todas as 40 categorias. O cenário de 300 dias deve ser o principal cenário de amplitude e pode
utilizar grande parte ou a totalidade do catálogo.

## 7.4 Memórias do acervo fictício

Embora a projeção mínima não carregue o texto das memórias, o mock pode e deve conhecer as memórias que originam a projeção para permitir
reutilização futura.

Cada memória fictícia deve possuir pelo menos:

- identificador estável;
- data preservada;
- conteúdo textual simples;
- uma ou mais categorias quando aplicável ao modelo vigente;
- Tom definido entre os valores válidos ou ausência de Tom;
- zero a três adendos/complementos.

O conteúdo textual não precisa simular uma biografia real. Valores como `Memória 1`, `Memória 2`, `Memória 3` são suficientes.

Os adendos podem seguir o mesmo princípio, por exemplo `Adendo 1`, `Adendo 2`.

Nenhuma memória deve possuir mais de três adendos nesta massa de referência.

O balanço sentimental pode permanecer ausente da massa desta unidade; ele não é necessário à projeção nem aos testes atuais e poderá ser
enriquecido futuramente se uma etapa concreta exigir.

## 7.5 Quantidade de memórias por dia

Cada dia preservado deve possuir entre **1 e 15 memórias**.

A distribuição deve variar de forma determinística.

Devem existir dias com uma única memória e dias com quantidades maiores. O cenário amplo deve conter variedade suficiente para que,
futuramente, cálculos de frequência por categoria não sejam artificialmente uniformes.

## 7.6 Tons

A massa deve incluir diversidade de Tom:

- valores negativos;
- valores positivos;
- Tom `0` neutro;
- ausência de Tom.

A distribuição não precisa ser uniforme.

Memórias de um mesmo dia podem possuir Tons distintos.

O conjunto deve permitir futuramente observar categorias com médias positivas, negativas, próximas do neutro e sem Tom agregado em
determinados recortes.

## 7.7 Múltiplas categorias

A maioria das memórias pode possuir uma única categoria, coerente com a orientação vigente do produto.

Algumas memórias devem possuir duas ou mais categorias para exercitar corretamente a contagem por associação.

Não é necessário criar um volume artificialmente alto de memórias multicategorizadas.

# 8. Estados de revisão do mock

A massa de conteúdo deve ser criada uma única vez e não precisa ser duplicada integralmente para cada revisão.

O mock pode representar evoluções por pequenas mutações, operações predefinidas, snapshots derivados ou mecanismo equivalente.

Deve ser possível exercitar, no mínimo:

1. cliente sem projeção local, exigindo carga inicial completa;
2. cliente com a mesma revisão do servidor, sem download de blocos;
3. cliente com revisão atrasada e apenas uma data alterada;
4. cliente com várias datas alteradas;
5. mesma data alterada várias vezes desde a revisão do cliente, recebendo apenas seu estado atual completo;
6. inclusão de nova data preservada;
7. remoção de data por desaparecimento de sua última memória;
8. data removida e posteriormente recriada;
9. reconstrução integral da projeção;
10. falha remota antes da conclusão da sincronização;
11. falha de persistência local antes da promoção da revisão global.

Os números concretos das revisões são decisão técnica e não possuem significado funcional próprio.

# 9. Integração mínima com Rememorar

A unidade deve criar um ponto de orquestração capaz de preparar os dados de Rememorar seguindo a ordem definida nesta Especificação.

Esse ponto pode ser chamado pela entrada de `/rememorar` ou por uma camada de serviço imediatamente utilizada por ela, conforme a
arquitetura vigente.

A responsabilidade desta unidade termina quando projeção e catálogo foram sincronizados/verificados e seus estados locais estão disponíveis.

A página **não deve ainda substituir sua composição visual atual pelos dados da projeção**.

Em especial, não antecipar nesta unidade:

- derivação das categorias da janela atual;
- cálculo de quantidade por categoria para o Panorama;
- cálculo da representatividade REG-202;
- cálculo do Tom agregado REG-203;
- alimentação real de CMP-008 — Janela Temporal de Rememorar;
- alimentação real de CMP-009 — Categoria do Panorama;
- ordenação ou revelação de categorias.

Esses trabalhos pertencem à unidade seguinte.

# 10. Testes automatizados obrigatórios

Esta unidade deve ser planejada e executada com cobertura automatizada compatível com sua natureza de infraestrutura.

O programador deve tratar os cenários abaixo como **roteiro mínimo**, podendo e devendo acrescentar outros testes quando a implementação
revelar riscos adicionais.

Não é necessário criar checkpoint visual para o operador.

## 10.1 Schema e persistência

Validar, no mínimo:

1. evolução do schema IndexedDB sem apagar capturas existentes;
2. evolução do schema sem apagar ou corromper o catálogo de categorias já existente;
3. projeções de contas diferentes permanecendo isoladas;
4. gravação e leitura da revisão global por conta;
5. gravação, substituição e remoção de blocos de data;
6. reconstrução da sequência atual de dias preservados a partir do IndexedDB.

## 10.2 Carga inicial

Validar, no mínimo:

7. conta sem projeção local recebendo carga integral;
8. todos os blocos da carga inicial persistidos antes da revisão global ser promovida;
9. falha de persistência durante a carga inicial não deixando a nova revisão marcada como concluída;
10. uma nova tentativa posterior conseguindo reconstruir corretamente o estado.

## 10.3 Cache já atualizado

Validar, no mínimo:

11. revisão local igual à remota não retransmitindo os blocos da projeção;
12. conteúdo local permanecendo utilizável quando nenhuma alteração existe.

## 10.4 Sincronização incremental

Validar, no mínimo:

13. uma única data alterada depois da revisão local sendo a única data de conteúdo retornada;
14. várias datas alteradas sendo retornadas sem retransmitir datas inalteradas;
15. bloco recebido substituindo integralmente o bloco local anterior da data;
16. várias mudanças sucessivas da mesma data resultando somente no estado atual completo;
17. nova data sendo acrescentada corretamente;
18. data removida fazendo o bloco local desaparecer;
19. data removida e posteriormente recriada resultando no estado atual existente mais recente;
20. revisão global local avançando somente depois da reconciliação bem-sucedida de todos os blocos necessários.

## 10.5 Falhas e reconstrução

Validar, no mínimo:

21. falha remota não sendo interpretada como projeção vazia;
22. falha de persistência não promovendo a revisão global nova;
23. cache local previamente válido não sendo apagado por uma sincronização malsucedida;
24. reconstrução integral substituindo corretamente a projeção derivada anterior;
25. reconstrução malsucedida não sendo registrada como nova revisão válida.

## 10.6 Semântica da projeção

Validar, no mínimo:

26. Tom `0` permanecendo distinto de ausência de Tom;
27. memória com múltiplas categorias contribuindo uma vez para cada associação correspondente;
28. quantidade por categoria podendo ser derivada pela contagem dos elementos, inclusive nulos;
29. texto da memória, adendos e balanço não sendo necessários nem retransmitidos como parte da projeção mínima;
30. bloco completo recebido para uma data refletindo o estado atual sem depender de eventos intermediários.

## 10.7 Reutilização do catálogo

Validar, no mínimo:

31. Rememorar utilizando o mesmo catálogo persistido já existente, e não um segundo catálogo paralelo;
32. catálogo atual sendo reutilizado sem retransmissão integral quando sua revisão continuar válida;
33. deltas existentes de categoria continuando aplicáveis sem regressão em Capturar;
34. categoria inativa permanecendo resolvível no catálogo histórico;
35. eventual refatoração para serviço compartilhado preservando os testes e comportamentos vigentes de Capturar;
36. preparação de Rememorar executando primeiro a sincronização/verificação da projeção e depois a sincronização/verificação do catálogo.

Não criar teste ou regra de produto que percorra a projeção para confirmar se cada identificador possui categoria correspondente no
catálogo. Essa integridade pertence à autoridade futura do banco/servidor e não deve ser duplicada no front.

## 10.8 Fixtures e cenários de mock

Validar automaticamente as invariantes da massa de referência:

37. cenário de 2 dias contendo exatamente 2 dias preservados;
38. cenário de 7 dias contendo exatamente 7 dias preservados;
39. cenário de 30 dias contendo exatamente 30 dias preservados;
40. cenário de 300 dias contendo exatamente 300 dias preservados;
41. nenhum cenário contendo dia preservado vazio;
42. cada dia contendo entre 1 e 15 memórias;
43. identificadores de memória estáveis e sem colisões dentro do universo;
44. cada memória contendo de 0 a 3 adendos;
45. existência de Tons negativos, positivos, neutros e ausentes na massa ampla;
46. existência de memórias multicategorizadas;
47. catálogo comum contendo até 40 categorias e sendo compartilhado pelos quatro cenários;
48. existência de distribuição não uniforme entre categorias;
49. existência de pelo menos algumas categorias históricas/inativas ainda utilizáveis por memórias preservadas, se essa característica for
    incluída na fixture final;
50. seleção repetida do mesmo cenário produzindo exatamente o mesmo universo de dados.

A coerência interna das fixtures pode e deve ser validada em teste de desenvolvimento. Isso não cria uma validação cruzada de integridade
referencial no produto em execução.

## 10.9 Escala

O cenário de 300 dias deve ser executado ao menos em testes de integração suficientes para comprovar que:

- a carga inicial completa pode ser processada e persistida;
- a projeção pode ser lida novamente do IndexedDB;
- uma sincronização incremental posterior funciona sobre essa base;
- o volume não produz erro funcional ou necessidade de tratamento especial.

Não definir nesta unidade um limite rígido de milissegundos como requisito de produto. Medições podem ser registradas pelo programador se
forem úteis, mas não devem tornar o teste artificialmente frágil conforme o ambiente de execução.

# 11. Verificações técnicas finais

Antes de solicitar encerramento, o programador deve:

- executar a suíte automatizada relevante existente;
- executar todos os novos testes desta unidade;
- executar checagem de tipos;
- executar lint;
- executar formatação/verificação de formatação;
- executar build de produção quando fizer parte do processo vigente;
- revisar o diff final;
- confirmar que nenhum dado existente de Capturar foi descartado pela evolução do schema;
- confirmar que não foi criado catálogo paralelo de categorias para Rememorar;
- confirmar que a página Rememorar não recebeu antecipadamente lógica do Panorama pertencente à unidade seguinte.

Se a implementação revelar um caso técnico adicional relevante para sincronização, persistência ou corrupção de estado, o programador deve
acrescentar o teste correspondente antes de concluir, desde que isso não introduza uma nova regra funcional não aprovada.

# 12. Fora do escopo

Não fazem parte da 05.16:

- backend real;
- banco de dados real do servidor;
- criação de integridade referencial no front;
- verificação cruzada em runtime entre cada categoria da projeção e o catálogo;
- cálculo do Panorama;
- REG-202 aplicado à lista real;
- REG-203 aplicado à lista real;
- ordenação das Categorias do Panorama;
- decisão sobre quantidade inicial de categorias visíveis;
- paginação, revelação progressiva ou `mostrar mais`;
- integração definitiva da projeção com CMP-008 — Janela Temporal de Rememorar;
- integração definitiva com CMP-009 — Categoria do Panorama;
- aprofundamento da categoria;
- Projeção Temporal da Categoria;
- Onda de Utilização da Categoria;
- Variação do Tom da Categoria;
- carregamento progressivo das memórias do segundo nível;
- consulta individual da memória;
- balanço sentimental no mock de referência, salvo se o programador precisar de um campo vazio/ausente por compatibilidade técnica;
- qualquer trabalho visual novo em `/rememorar`.

# 13. Critérios de conclusão

A 05.16 está concluída quando:

- existe uma projeção local de Rememorar persistida em IndexedDB e isolada por conta;
- o schema evoluiu sem apagar os dados vigentes;
- a projeção representa por data as categorias e os Tons necessários a REG-204;
- texto, adendos e balanço permanecem fora da projeção mínima;
- existe revisão global local da projeção;
- conta sem projeção recebe carga inicial completa;
- revisão igual reutiliza o cache sem retransmitir os blocos;
- revisão atrasada recebe somente as datas alteradas desde a revisão conhecida;
- cada data existente alterada é recebida como bloco atual completo e substitui integralmente o bloco local;
- remoção e recriação de datas estão representadas;
- a revisão local só avança depois de reconciliação bem-sucedida;
- reconstrução integral está disponível;
- a infraestrutura existente do catálogo de categorias foi reutilizada ou refatorada de forma compartilhada, sem criar catálogo paralelo;
- a preparação de Rememorar sincroniza primeiro a projeção e depois o catálogo;
- não existe validação redundante de integridade referencial entre projeção e catálogo no front;
- existe massa determinística de referência com cenários de 2, 7, 30 e 300 dias;
- os cenários utilizam um catálogo comum de até 40 categorias com distribuição variada;
- cada dia possui entre 1 e 15 memórias e nenhum dia preservado é vazio;
- as memórias fictícias possuem conteúdo simples, Tons variados, categorias e de 0 a 3 adendos;
- algumas memórias possuem múltiplas categorias;
- os estados de revisão necessários ao contrato incremental podem ser simulados;
- o programador registrou e executou seu plano de testes;
- todos os testes mínimos aplicáveis desta Especificação passaram ou eventual impedimento real foi explicitamente discutido com o operador
  antes do encerramento;
- o programador acrescentou testes adicionais quando a implementação revelou riscos técnicos não cobertos pelo roteiro mínimo;
- tipos, lint, formatação, build e demais verificações pertinentes passaram;
- nenhuma lógica visual ou de cálculo da próxima etapa do Panorama foi antecipada.

## Resultado esperado

Depois da 05.16, Rememorar possuirá uma fonte local compacta, versionada e sincronizável que poderá ser tratada como a matéria-prima real do
Panorama pelo front.

A unidade seguinte poderá concentrar-se em conectar essa projeção à **Janela Temporal de Rememorar** e às **Categorias do Panorama**,
calculando quantidade, representatividade e Tom agregado a partir dos dados locais, sem voltar a resolver obtenção remota, versionamento ou
massa de teste.

## Continuidade

### Clarificação e escopo

Entendimento confirmado em 2026-10-02: construir a projeção mínima de Rememorar em IndexedDB, seu serviço remoto mockado versionado,
sincronização inicial/incremental com remoção/recriação e reconstrução, reutilizar o catálogo de categorias atual, criar acervo
determinístico nos cenários de 2, 7, 30 e 300 dias e preparar esses dados pela ordem definida para `/rememorar`. A interface existente não
será alimentada pela projeção nesta unidade; cálculos e componentes do Panorama permanecem para a unidade seguinte. Não foram identificadas
dúvidas funcionais na Especificação; decisões de organização interna ficam técnicas, dentro desses contratos.

### Plano de execução

1. Auditar a persistência IndexedDB, migrações e catálogo de categorias; decidir reutilização direta ou refatoração compartilhada
   preservando Capturar.
2. Evoluir o schema sem apagar stores vigentes e definir repositório isolado por conta para projeção e revisão.
3. Definir o contrato remoto mockado versionado, incluindo blocos completos, remoções, recriações, reconstrução e falhas.
4. Implementar reconciliação transacional/incremental e orquestração de preparação na ordem projeção → catálogo.
5. Criar fixtures determinísticas compartilhadas e seleção dos quatro cenários.
6. Integrar o ponto de preparação à entrada de `/rememorar`, sem substituir a composição atual nem acrescentar lógica de Panorama.
7. Criar e executar testes automatizados para migração, persistência, sincronização, falhas, catálogo, fixtures e escala de 300 dias.
8. Executar suíte relevante, tipos, lint, formatação, build pertinente e revisão final do diff; registrar evidências e pendências.

### Estado e validações

- Plano registrado antes da inspeção do fonte. Etapas de implementação e verificações concluídas; Especificação encerrada após solicitação
  do operador.
- Git no início: `git status --short` sem alterações reportadas.
- Indicadores de contexto: antes das leituras — não disponível na interface; após leituras iniciais e Especificação, antes do fonte — não
  disponível na interface; capacidade total — não disponível na interface. Nenhum valor estimado.
- Validação visual com operador: não aplicável, conforme a Especificação. Validação automatizada e técnica será registrada após
  implementação.

### Andamento em 2026-10-02

- Plano: etapas 1–8 executadas. O catálogo existente foi reutilizado diretamente; nenhuma refatoração de Capturar foi necessária.
- Resultado técnico: schema 7 com stores novos; projeção compacta por conta/data; revisão global e reconciliação atômica; sincronização
  inicial/incremental, tombstone, recriação e reconstrução; mock e fixtures determinísticas; preparação client-side iniciada por
  `/rememorar` antes da sincronização do catálogo.
- Testes: `deno test` — 101 aprovados, 0 falhas, incluindo os 9 testes de Rememorar e migração preservadora. `deno lint` — passou.
  `deno check` — passou fora do sandbox após desbloquear acesso ao manifesto JSR. `deno task build` — passou fora do sandbox após
  desbloquear leitura do `vite.config.ts`. `git diff --check` e `deno fmt --check` nos arquivos desta unidade — passaram.
- `deno fmt --check .` apontou 106 arquivos do repositório fora do conjunto desta unidade; não foram formatados em massa. A checagem
  formatada dos arquivos alterados passou.
- Parecer final incluído após solicitação de encerramento em 2026-10-03 e entregue ao operador nesta sessão. Nenhuma atualização do Drive é
  afirmada; validação visual não se aplica.
- Indicador final de contexto e capacidade: não disponível na interface.

## Parecer final

A 05.16 materializou a projeção mínima de Rememorar nos stores IndexedDB `projecaoRememorar` e `metadadosProjecaoRememorar`, acrescentados
pela migração não destrutiva do schema 7. A projeção isolada por conta registra blocos completos por data, IDs de categoria e listas de Tom,
distinguindo `0` de ausência. O serviço remoto mockado oferece carga inicial, resposta sem conteúdo quando atualizado, sincronização
incremental por data com tombstones, recriação, reconstrução integral e falhas simuláveis; a revisão local só avança junto ao commit dos
blocos reconciliados.

O catálogo versionado existente foi reutilizado, sem store paralelo nem refatoração de Capturar. O acervo fictício determinístico oferece
cenários de 2, 7, 30 e 300 dias, até 40 categorias compartilhadas, memórias, Tons variados e até três adendos. `/rememorar` obtém a conta
autenticada e inicia a preparação client-side da projeção antes do catálogo. A composição visual atual permanece com suas cinco datas de
desenvolvimento; ela ainda não consome a projeção e nenhum cálculo ou apresentação do Panorama foi antecipado, conforme o limite desta
unidade.

A suíte completa passou: 101 testes aprovados, incluindo os testes de migração, sincronização e escala. `deno lint`, `deno check`, o build
de produção, a formatação dos arquivos da unidade e `git diff --check` passaram. A verificação global `deno fmt --check .` ainda aponta 106
arquivos fora da unidade sem formatação segundo o formatter atual; eles não foram formatados em massa. Não houve validação visual, que não
era prevista nesta Especificação.
