# 05.07 - Registrar e Organizar

## Estado

Especificação aprovada para a próxima unidade de desenvolvimento de Capturar. Esta unidade parte do resultado já concluído e reconciliado da 05.06 - Seleção e Abertura de Captura e substitui o andaime temporário da Captura do dia pela primeira etapa funcional real.

O corpo deste documento é autossuficiente para o desenvolvimento. As referências documentais abaixo existem apenas como rastreabilidade histórica da elaboração e **não constituem leitura obrigatória nem dependência operacional para o programador**.

## Objetivo

Materializar a estrutura real da Captura do dia e tornar **Registrar e organizar** funcional de ponta a ponta, incluindo:

- reaproveitamento seguro de workspaces não alterados como cache;
- revisão própria da composição preservada por data;
- estrutura fixa da Captura do dia com data, ações e três abas;
- lista real de memórias com inclusão, abertura e reordenação;
- tela de Memória para criação, edição, leitura histórica e complementos;
- prazo de edição baseado na primeira preservação;
- rascunho efêmero de edição resistente a recarregamento acidental;
- exclusão regressiva de complementos e memória;
- bloqueio de edição concorrente da mesma captura em duas abas/janelas;
- primeira alteração funcional real substituindo o controle temporário `Marcar como alterada`;
- validações progressivas explícitas, com lembretes ao operador sobre o que deve ser testado em cada marco.

## Origem funcional e rastreabilidade

Esta unidade foi elaborada a partir das definições vigentes de Capturar, especialmente 02.03 - Captura e Evolução das Memórias, 02.05 - Modelo de Trabalho e Continuidade, 02.06 - Conta, Dados e Administração, 03.05 - Capturar, 04.06 - Especificação Funcional - Capturar, 04.07 - Regras - Capturar e 04.08 - Componentes - Capturar.

Essas referências registram a origem das decisões. **O programador não precisa consultá-las para implementar esta unidade**: todo comportamento necessário está descrito abaixo.

## Posição no ciclo

Já existem e devem ser preservados:

- autenticação e Ambiente Principal;
- `/capturar` funcional para seleção de data;
- CMP-003 — Seletor de Data;
- CMP-005 — Orientação Progressiva com níveis atualmente mockados;
- lista real de capturas locais pendentes na Seleção e alerta correspondente na Principal;
- rota protegida `/capturar/{data}`;
- validação da data e diagnóstico operacional do armazenamento local;
- fundação IndexedDB reutilizável, schema versionado e repositório local de capturas por conta/data;
- identidade opaca e estável da conta autenticada disponível ao front;
- distinção entre workspace local limpo e workspace alterado;
- contrato remoto mockado capaz de distinguir conteúdo encontrado, ausência conclusiva e falha;
- preparação da captura somente depois que o workspace necessário estiver confirmado localmente;
- controle temporário `Marcar como alterada`, criado apenas como andaime de desenvolvimento.

A 05.07 transforma a Captura do dia em experiência real de trabalho. As etapas **Categorizar e Tom** e **Revisar e Preservar** devem aparecer na estrutura, mas seu conteúdo funcional permanece para unidades posteriores. Depois desta unidade, a sequência continua sendo escolhida pelo resultado efetivo; a expectativa atual é avançar para Categorizar, depois Tom e posteriormente Revisar e Preservar, sem transformar essa sequência em compromisso rígido.

## Escopo desta unidade

Estão no escopo:

1. evolução necessária do modelo local para suportar revisão de origem, historicidade e dados de memória/complemento;
2. contrato mockado de abertura com verificação leve de existência/revisão e obtenção integral somente quando necessária;
3. estrutura visual e operacional completa da Captura do dia;
4. as três abas visíveis e navegáveis;
5. conteúdo funcional completo de Registrar e organizar;
6. criação, edição e consulta de memória;
7. criação e edição de complemento conforme historicidade;
8. rascunho efêmero em `sessionStorage`;
9. exclusão regressiva;
10. reordenação física das memórias;
11. restauração aproximada do contexto de lista;
12. bloqueio concorrente da mesma captura em outra aba/janela;
13. reutilização do CMP-005 no contexto de início de uma captura genuinamente nova;
14. mocks e contratos mínimos necessários para testar memória nunca preservada, memória editável, memória histórica e complementos;
15. testes técnicos temporários úteis à implementação;
16. lembretes explícitos ao operador para validação manual progressiva.

## Fora do escopo

Não materializar nesta unidade:

- categorização funcional das memórias;
- criação/edição real de categorias;
- Tom, slider, balanço sentimental ou cores definitivas de Tom;
- Revisar e Preservar funcional;
- envio real da composição ao backend;
- resolução real de conflitos de preservação;
- backend real;
- área administrativa de Variáveis do Sistema;
- endpoint genérico novo de Variáveis do Sistema apenas por causa desta unidade;
- política global definitiva de limpeza dos caches/workspaces limpos;
- TTL, expiração por idade ou limite de volume para workspaces limpos;
- sincronização entre dispositivos;
- transferência sofisticada de controle entre abas;
- drag-and-drop de memórias;
- limite de tamanho de texto de memória ou complemento;
- refinamento artístico final do produto.

# 1. Abertura e cache da Captura do dia

## 1.1 Prioridade do trabalho alterado

A abertura continua começando pela conta e data atuais no armazenamento local.

Se existir **workspace local alterado**, ele representa trabalho do usuário ainda não preservado e possui prioridade absoluta de retomada. Ele deve ser aberto a partir do IndexedDB e **não pode ser substituído por conteúdo remoto durante a abertura**.

A existência desse workspace alterado continua significando captura pendente.

## 1.2 Workspace não alterado como cache

Um workspace local não alterado deixa de ser apenas uma cópia reconstruível sem benefício e passa a poder funcionar como cache.

Capturar deve possuir uma **revisão própria da composição preservada por data**, independente da revisão global/projeção usada por Rememorar. A revisão é opaca para o front: importa somente armazená-la e comparar igualdade/divergência.

O workspace limpo precisa conhecer a origem remota que o formou:

- quando existia composição preservada: `existe + revisão`;
- quando o servidor confirmou ausência de composição para a data: `não existe`.

A forma técnica concreta pode variar, desde que os estados não sejam confundidos.

## 1.3 Reabertura de workspace limpo

Quando não houver workspace alterado e existir workspace local limpo, fazer uma consulta remota leve antes de decidir se o conteúdo local pode ser reutilizado.

O resultado mínimo conceitual precisa permitir saber:

- se existe atualmente composição preservada para aquela data;
- se existir, qual é sua revisão vigente;
- os parâmetros operacionais de Capturar necessários à experiência atual, incluindo o valor vigente de `prazo_edicao_memoria_dias`.

Comportamento:

- local `existe + revisão X`, remoto `existe + revisão X` → reutilizar integralmente o conteúdo do IndexedDB; **não retransmitir as memórias**;
- local `existe + revisão X`, remoto `existe + revisão Y` → obter a composição remota completa e substituir o workspace limpo;
- local `existe`, remoto `não existe` → reconstruir o workspace limpo como composição vazia;
- local `não existe`, remoto `não existe` → reutilizar a composição vazia local;
- local `não existe`, remoto `existe + revisão` → obter a composição remota completa e reconstruir o workspace limpo;
- falha ou resposta inconclusiva → não interpretar como ausência e não substituir silenciosamente o estado local por vazio.

O contrato remoto pode continuar mockado nesta unidade. O objetivo é materializar corretamente o comportamento e a fronteira que um backend real deverá cumprir depois.

## 1.4 Primeira abertura sem workspace

Se não existir workspace local para a conta/data:

- consultar o serviço remoto;
- conteúdo encontrado → materializar integralmente no IndexedDB junto da revisão de origem;
- ausência conclusiva → materializar composição vazia limpa com origem remota ausente;
- falha/inconclusão → não abrir a captura como vazia; manter o erro de preparação.

A tela só é considerada aberta quando o workspace necessário estiver confirmado no IndexedDB.

## 1.5 Revisão de origem também prepara a futura preservação

A revisão usada para validar o cache não deve ser tratada como informação descartável. Quando o workspace passa a ser alterado, sua revisão de origem permanece associada à captura.

Essa mesma revisão será futuramente o baseline para detectar se a composição preservada no servidor mudou antes da preservação. A 05.07 **não implementa a preservação nem o conflito**, apenas deve deixar o dado corretamente modelado para que não seja necessário redesenhar essa parte depois.

## 1.6 Sem TTL nesta unidade

Não existe TTL, expiração automática por idade ou política de volume para workspaces limpos nesta unidade.

Eles podem permanecer no IndexedDB e ser revalidados por existência/revisão quando reabertos. A política global de limpeza do armazenamento local será definida somente quando o trabalho local estiver concluído como um todo. Logout é um candidato natural a esse tratamento futuro, mas **não implementar essa limpeza aqui por antecipação**.

# 2. Persistência local e evolução do schema

A fundação criada em 05.05 e evoluída em 05.06 deve ser reutilizada. É aceitável evoluir novamente o schema/versionamento do IndexedDB se os novos dados exigirem isso.

O modelo precisa ser suficiente para representar, no mínimo:

- conta e data da captura;
- estado limpo ou alterado;
- origem remota existente ou ausente;
- revisão da composição preservada quando houver;
- memórias em ordem física explícita;
- identidade local estável de cada memória, independente do conteúdo e da posição;
- texto da memória;
- informação suficiente para distinguir memória nunca preservada de memória preservada;
- timestamp da **primeira preservação** da memória, quando existir;
- complementos pertencentes à memória, preservando sua ordem histórica;
- identidade estável de complemento;
- texto do complemento;
- informação suficiente para distinguir complemento nunca preservado de complemento preservado;
- timestamp da **primeira preservação** de cada complemento, quando existir.

Não antecipar estrutura de categoria/Tom além do necessário para preservar compatibilidade com o modelo já existente ou com os mocks. As etapas posteriores poderão ampliar o schema quando houver necessidade concreta.

Toda alteração funcional concluída nesta unidade deve continuar respeitando a fundação local: uma operação só é considerada aplicada depois de confirmação da transação/gravação. Falha de persistência não pode deixar a interface aparentando que o estado foi protegido.

# 3. Estrutura real da Captura do dia

A casca temporária da 05.06 deve ser substituída pela estrutura real da Captura do dia.

De cima para baixo:

1. **header global do ambiente autenticado**;
2. **linha fixa de informações e ações da captura**;
3. **controle fixo das três abas**;
4. **conteúdo rolável da aba atual**.

A intenção é que header, linha da captura e abas permaneçam visualmente estáveis no topo enquanto somente o conteúdo abaixo percorre a página. A implementação concreta pode usar `sticky`, composição equivalente ou outra solução tecnicamente adequada; evitar criar uma rolagem interna artificial da página inteira quando a rolagem normal do documento puder cumprir o comportamento.

## 3.1 Linha fixa da captura

A linha imediatamente abaixo do header contém:

- à esquerda, **sempre** a data da captura;
- à direita, somente os controles necessários ao contexto atual.

A data deve ser apresentada por extenso em português, seguindo o calendário da data da captura, por exemplo:

`sexta-feira, 10 de janeiro de 2026`

A escolha tipográfica final pertence à construção, mas a data deve permanecer perceptível e estável entre as telas da mesma captura.

## 3.2 Abas

As três abas aparecem disponíveis desde já:

- `Registrar e organizar`;
- `Categorizar e Tom`;
- `Revisar e Preservar`.

A navegação entre elas é livre.

Nesta unidade:

- `Registrar e organizar` recebe conteúdo real;
- `Categorizar e Tom` pode permanecer uma área vazia/estrutural mínima;
- `Revisar e Preservar` pode permanecer uma área vazia/estrutural mínima.

Não inventar conteúdo funcional para as duas etapas futuras apenas para preencher espaço.

Quando uma **tela específica de Memória** estiver aberta, as abas deixam de ser apresentadas. Permanecem o header global e a linha fixa da captura com a data e as ações da memória. Ao retornar à Captura do dia, as abas reaparecem.

# 4. Registrar e organizar — lista de memórias

## 4.1 Ação Adicionar memória

Na aba Registrar e organizar, a linha fixa superior apresenta a ação **Adicionar memória** à direita.

Acioná-la abre a tela de Memória em modo de criação.

Uma nova memória:

- começa como rascunho efêmero da tela;
- ainda não integra o workspace IndexedDB;
- ainda não cria pendência;
- só passa a existir depois de **Confirmar Memória** com conteúdo válido;
- depois de confirmada é inserida **sempre na última posição** da composição.

Texto vazio ou formado somente por espaços não é uma memória válida. A ação Confirmar Memória deve permanecer indisponível enquanto não houver ao menos um caractere não branco.

Não existe limite de tamanho de texto definido nesta unidade.

## 4.2 Apresentação da lista

Cada memória ocupa uma caixa de altura visual controlada, evitando que textos muito longos produzam blocos de tamanhos completamente diferentes na composição.

A caixa apresenta **no máximo três linhas de pré-visualização do texto**.

Requisitos funcionais:

- nunca mostrar mais de três linhas;
- não oferecer rolagem interna na pré-visualização;
- texto integral é acessado abrindo a memória;
- clicar na própria área da memória abre sua tela;
- não existe botão separado `Editar` na lista;
- não existe ação de exclusão na lista.

Como aprimoramento visual desejável, aplicar perda progressiva de intensidade/opacidade no texto: primeira linha normal, segunda um pouco mais clara e terceira ainda mais clara, porém legível. Pode ser usado gradiente/máscara CSS ou solução equivalente. Se houver incompatibilidade ou complexidade desproporcional, o fallback aceitável é simplesmente limitar/truncar em três linhas sem o gradiente. **O limite de três linhas, porém, é obrigatório.**

A solução de truncamento não deve remover o conteúdo real do estado nem prejudicar sua leitura integral na tela de Memória.

## 4.3 Controles de ordem

À direita da caixa permanecem somente os controles de:

- elevar;
- rebaixar.

Podem ser ícones compactos em uma ou duas linhas, conforme o programador considerar melhor para aproveitar a altura da caixa.

Regras:

- cada acionamento move exatamente **uma posição**;
- não existe arrastar/drag-and-drop;
- elevar fica indisponível na primeira memória;
- rebaixar fica indisponível na última;
- reordenar é alteração real do workspace e cria pendência se ainda não existir;
- a nova ordem precisa estar confirmada no IndexedDB antes de ser tratada como aplicada.

## 4.4 Acompanhamento da rolagem ao mover

A reordenação não deve fazer a memória que o usuário está acompanhando desaparecer inesperadamente da área visível.

Ao elevar:

- se a memória continuar confortavelmente visível, não é necessário deslocar a página;
- se estiver saindo da região visível, ajustar a rolagem o mínimo necessário;
- quando houver memória anterior, procurar manter visível também **uma caixa acima** da memória movida;
- na primeira posição não existe essa exigência.

Ao rebaixar:

- comportamento simétrico;
- quando houver memória seguinte, procurar manter visível também **uma caixa abaixo**;
- na última posição não existe essa exigência.

Não é exigido cálculo pixel a pixel. A intenção é preservar contexto visual e evitar que o foco do trabalho suma depois de uma ação simples.

## 4.5 Final perceptível da lista

Deve existir respiro/espaço visual abaixo da última memória para que o usuário reconheça que chegou ao fim da composição e para que a última caixa não fique colada ao limite inferior da área.

# 5. Orientação Progressiva em Registrar e organizar

Reutilizar o **CMP-005 — Orientação Progressiva** já materializado na 05.06.

A orientação para começar só aparece quando a captura representa uma data **genuinamente nova**. Para este contexto, isso significa simultaneamente:

- o servidor confirmou que não existe composição preservada para aquela data;
- o workspace está limpo;
- não há memória na composição;
- nenhuma alteração anterior transformou aquela captura em trabalho em elaboração.

Não apresentar essa orientação quando:

- existe conteúdo vindo do servidor;
- existe qualquer memória;
- existe captura local alterada;
- aquela captura já deixou de ser nova e voltou a ficar vazia por exclusões.

Mensagens vigentes:

- iniciante: `Comece pelo que vier à memória. Pode ser uma frase curta, um detalhe ou algo que aconteceu hoje.`
- intermediário: `Registre uma lembrança por vez. Memórias mais focadas ajudam a reencontrar melhor cada contexto depois.`
- avançado: `Observe detalhes que normalmente passariam despercebidos: uma conversa, uma sensação, uma pequena mudança.`

A orientação desaparece quando a primeira memória é confirmada. Se essa memória e todas as outras forem removidas posteriormente, **não reapresentar automaticamente a orientação** naquela captura: ela já cumpriu sua função de início.

O nível pode continuar mockado conforme a fundação existente; esta unidade não define cálculo real de evolução.

**Validação pendente herdada da 05.06:** o CMP-005 foi informado como implementado no Parecer anterior, mas não ficou comprovado que o operador tenha validado manualmente todos os níveis/mensagens. O programador deve lembrar explicitamente o operador de testar essa orientação antes do encerramento da 05.07.

# 6. Variável do prazo de edição

Existe uma Variável do Sistema predefinida:

`prazo_edicao_memoria_dias`

Valor inicial:

`3`

Apesar do nome em dias, para o consumo atual o valor `3` significa **72 horas exatas**.

A mesma variável governa:

- o prazo da memória principal;
- o prazo de cada complemento.

Não criar uma segunda variável para complemento.

A área administrativa real de Variáveis do Sistema permanece fora do escopo. O valor pode ser entregue pelo mock/serviço de abertura junto aos metadados leves necessários à captura. Não criar um endpoint genérico separado apenas porque esta unidade precisa desse parâmetro, salvo se o programador identificar uma razão técnica concreta que não altere o contrato funcional.

Se o valor recebido não puder ser interpretado de acordo com a definição da variável, não usar fallback silencioso para 3. Tratar como falha de configuração/serviço, conforme a arquitetura de Variáveis do Sistema.

# 7. Historicidade da memória e do complemento

## 7.1 Memória nunca preservada

Uma memória criada localmente que **nunca foi preservada com sucesso no servidor** permanece editável independentemente de quanto tempo a captura local permaneça pendente.

Exemplo: uma memória criada hoje pode permanecer local por semanas. Enquanto nunca tiver integrado o acervo preservado, não se torna histórica apenas pelo passar do tempo.

## 7.2 Início do prazo da memória

Quando uma memória é preservada com sucesso pela primeira vez, registrar seu timestamp de **primeira preservação**.

As 72 horas contam a partir desse instante, e não:

- da data do dia capturado;
- da criação local da memória;
- da última edição;
- da última preservação posterior.

Uma nova preservação da mesma memória não reinicia o relógio.

## 7.3 Início do prazo do complemento

Um complemento segue a mesma regra:

- enquanto nunca foi preservado, permanece editável;
- na primeira preservação bem-sucedida, recebe seu próprio timestamp de primeira preservação;
- as 72 horas contam desse timestamp;
- preservações/edições futuras não reiniciam o relógio.

A data histórica exibida como `Complemento adicionado em {data}` deriva da preservação daquele complemento, e não da data da captura original.

## 7.4 A autorização é decidida ao abrir a edição

A verificação do prazo ocorre **quando a edição é aberta**.

Se naquele instante a memória/complemento estiver dentro das 72 horas — ou ainda nunca tiver sido preservado — aquela **sessão de edição fica autorizada**.

Essa autorização não precisa ser recalculada no momento de confirmar.

Consequência deliberada: se o usuário abrir uma memória faltando poucos segundos para o prazo e permanecer com a mesma edição aberta durante horas, dias ou mesmo período muito maior, ele ainda poderá confirmar aquela edição. A regra privilegia simplicidade e continuidade da edição iniciada validamente.

Quando essa tela é deliberadamente encerrada, a autorização daquela sessão termina. Uma nova entrada volta a verificar o prazo vigente.

Um recarregamento acidental da **mesma** edição não deve ser interpretado como uma nova abertura funcional: ao restaurar o rascunho, deve restaurar também a autorização já concedida para aquela sessão.

# 8. Tela de Memória

A mesma tela atende diferentes estados. Não criar experiências completamente separadas sem necessidade.

## 8.1 Estrutura comum

Ao abrir uma memória:

- header global permanece;
- linha fixa da captura permanece;
- data por extenso permanece à esquerda;
- ações contextuais da memória ficam à direita;
- as três abas deixam de aparecer;
- abaixo fica o conteúdo da memória, usando a rolagem normal da página quando necessário.

Deve existir ação clara de retorno à Captura do dia/Registrar e organizar.

## 8.2 Memória nova

Uma memória nova abre uma caixa de texto editável.

Referência visual de altura: aproximadamente **cinco linhas**.

Se o conteúdo exceder essa altura, a caixa pode ter rolagem interna. A altura exata, responsividade e detalhes de CSS ficam a cargo da construção.

A principal ação positiva é:

**Confirmar Memória**

Não usar `Salvar` e não usar metáfora de disquete. Como intenção visual, usar um ícone de marcador/bookmark em tratamento de sucesso/verde, acompanhado do rótulo `Confirmar Memória`, se compatível com a linguagem já usada no projeto.

Enquanto o texto for vazio ou somente espaços, Confirmar Memória fica indisponível.

Como a memória nova ainda não existe no workspace, a ação de exclusão fica indisponível. Abandonar a criação descarta o rascunho efêmero depois da confirmação de perda quando necessária.

## 8.3 Memória existente editável

Se a abertura foi autorizada pelo prazo:

- mostrar a caixa principal editável;
- pré-carregar o último texto confirmado do workspace;
- disponibilizar `Confirmar Memória`;
- enquanto a edição estiver **limpa**, a ação destrutiva referente ao último elemento existente pode estar disponível conforme a regra de exclusão regressiva;
- depois que o usuário modificar o conteúdo, considerar a edição **suja** e desabilitar a ação destrutiva até confirmar ou abandonar a edição.

Confirmar Memória grava a alteração no workspace IndexedDB. Somente depois da confirmação local a lista e o estado pendente refletem a alteração.

Se o usuário confirmar exatamente o mesmo conteúdo já existente, não há mudança funcional a aplicar nem razão para criar uma nova pendência exclusivamente por essa confirmação.

## 8.4 Memória histórica

Quando a memória não estiver mais autorizada para edição:

- o texto principal fica somente leitura;
- categoria/Tom pertencem a etapas posteriores e não devem ser inventados aqui;
- complementos históricos são apresentados integrados à mesma unidade de leitura;
- pode aparecer a ação `Adicionar complemento` quando não houver complemento ainda editável;
- a memória continua podendo ser reordenada na lista;
- a cadeia de exclusão continua disponível enquanto a tela estiver limpa.

A leitura da memória histórica não deve sugerir que o texto original ainda pode ser reescrito.

# 9. Complementos

## 9.1 Quando pode existir novo complemento

Complemento existe para registrar percepção posterior sem reescrever uma memória histórica.

A ação **Adicionar complemento** só aparece quando:

- a memória principal está histórica/somente leitura;
- não existe outro complemento atualmente editável.

Não é necessário oferecer complemento para memória principal ainda editável: enquanto a memória estiver autorizada, a própria memória pode ser ajustada diretamente.

## 9.2 Complemento novo

Ao acionar Adicionar complemento:

- abrir uma região editável abaixo da memória histórica e dos complementos históricos existentes;
- usar caixa de texto com referência visual de aproximadamente **quatro linhas**;
- permitir rolagem interna quando necessário;
- usar a ação positiva **Confirmar Complemento**;
- manter Confirmar Complemento indisponível para texto vazio ou somente espaços;
- não criar o complemento no workspace até a confirmação local bem-sucedida.

Enquanto for apenas rascunho não confirmado, esse complemento não integra a cadeia de exclusão. A ação destrutiva fica inativa; para desistir, o usuário abandona a edição e descarta o rascunho.

## 9.3 Complemento existente ainda editável

Se o último complemento existente ainda estiver autorizado para edição:

- a memória principal permanece somente leitura;
- complementos históricos anteriores ficam integrados à leitura;
- o complemento editável ocupa a região de edição própria;
- a ação positiva é `Confirmar Complemento`;
- se a edição estiver limpa, a ação `Excluir último complemento` pode estar disponível;
- depois da primeira alteração no campo, a exclusão fica inativa até confirmar ou abandonar.

Apenas um complemento pode estar editável por vez.

## 9.4 Complementos históricos integrados à memória

Complementos não editáveis não precisam de uma tela ou caixa de controle independente. Eles passam a compor a leitura contínua da memória.

Representação conceitual:

```text
Aqui está a memória principal.

Complemento adicionado em 12/01/2026
Aqui está o primeiro complemento.

Complemento adicionado em 20/02/2026
Aqui está outro complemento.
```

O tratamento visual concreto pode separar os blocos com espaçamento, tipografia ou divisores discretos. Não transformar a unidade em uma coleção de formulários.

A data mostrada em cada complemento é sua data de primeira preservação. Para complemento nunca preservado e ainda editável não existe ainda uma data histórica definitiva a apresentar como `adicionado em`.

# 10. Rascunho efêmero da edição

## 10.1 Separação de responsabilidades

Esta unidade passa a trabalhar explicitamente com três níveis de estado:

1. **servidor** — fonte da verdade do acervo preservado;
2. **IndexedDB** — fonte da verdade da captura local já confirmada pelo usuário;
3. **`sessionStorage`** — proteção efêmera do texto atualmente digitado numa tela de edição e ainda não confirmado.

Não misturar essas responsabilidades.

## 10.2 Persistência quase em tempo real

Enquanto o usuário digita numa memória ou complemento, manter uma cópia transitória no `sessionStorage` com pequeno atraso/debounce para evitar escrita por tecla quando isso não for necessário.

A escolha concreta do intervalo é técnica. O objetivo é proteger uma edição potencialmente demorada contra recarregamentos acidentais comuns.

O rascunho precisa estar suficientemente identificado para não colidir entre:

- contas;
- datas;
- memórias diferentes;
- memória versus complemento;
- edições incompatíveis.

Como `sessionStorage` é isolado por aba, ele também é preferível a um armazenamento compartilhado entre abas para este uso.

## 10.3 O rascunho não cria pendência

Digitar não altera o workspace confirmado.

Antes de Confirmar Memória/Complemento:

- não atualizar o texto confirmado no IndexedDB;
- não marcar a captura como alterada apenas porque existe rascunho;
- não alterar a lista como se o novo conteúdo já estivesse confirmado.

A pendência nasce quando uma operação real é confirmada no workspace: inclusão de memória, edição confirmada, complemento confirmado, exclusão, reordenação etc.

## 10.4 Recarregamento da própria edição

F5, Ctrl+R ou recarregamento equivalente da mesma aba deve tentar reconstruir a mesma edição a partir do `sessionStorage`.

Ao restaurar:

- restaurar o texto transitório;
- restaurar o contexto do objeto editado;
- restaurar a autorização daquela sessão de edição se ela havia sido concedida dentro do prazo.

Assim, uma memória aberta quando ainda estava dentro das 72 horas não vira somente leitura apenas porque houve F5 depois de o prazo ter terminado.

## 10.5 Confirmação bem-sucedida

Ao confirmar:

1. validar conteúdo não vazio/não branco;
2. aplicar a operação no IndexedDB;
3. aguardar confirmação local;
4. somente então considerar a operação concluída;
5. limpar o rascunho efêmero correspondente;
6. retornar a Registrar e organizar preservando aproximadamente o contexto da lista.

Se a gravação local falhar, manter o conteúdo em edição e o rascunho protegido; informar falha e permitir nova tentativa. Não limpar o rascunho nem mostrar a alteração como aplicada.

## 10.6 Abandono deliberado

Se existir alteração não confirmada e o usuário tentar sair pela navegação controlada pelo Rememore — por exemplo ação Voltar — apresentar confirmação de perda da edição.

Comportamento:

- cancelar a saída → permanecer na edição e manter rascunho;
- confirmar a saída → eliminar o rascunho transitório e retornar sem modificar o workspace confirmado.

Ao entrar novamente depois dessa saída, abrir o último estado confirmado do IndexedDB. **Não ressuscitar o rascunho abandonado.**

A redação concreta dessa confirmação pode seguir o padrão de CMP-004, deixando claro que apenas a edição ainda não confirmada será perdida. Se durante a implementação surgir necessidade de texto que não esteja inequívoco, apresentar ao operador na clarificação em vez de inventar consequência funcional.

## 10.7 Voltar/fechar pelo navegador

Usar os recursos nativos disponíveis no navegador para alertar sobre possível perda quando houver edição suja e a navegação/fechamento escapar dos controles do Rememore (`beforeunload` ou mecanismo equivalente suportado pela stack/navegador).

Não prometer mensagem customizada: navegadores modernos controlam o conteúdo e podem até limitar quando o aviso aparece.

Também não prometer proteção absoluta para todo encerramento possível, especialmente interrupções fora do controle da aplicação. O objetivo é fazer o melhor uso do recurso nativo e incentivar a navegação controlada pelo Rememore.

# 11. Exclusão regressiva

A antiga ideia de excluir uma memória e automaticamente remover todos os seus complementos **não vale mais**.

A unidade memória + complementos é desmontada de trás para frente.

## 11.1 Local da ação

Não existe exclusão na lista de Registrar e organizar.

Na tela de Memória, a linha fixa superior apresenta uma ação destrutiva com:

- ícone de lixeira;
- tratamento `danger`/perigo coerente com Bulma;
- rótulo textual dependente do alvo atual.

## 11.2 Quando existem complementos

Se existir ao menos um complemento **já confirmado no workspace**, a ação é:

`Excluir último complemento`

Ela sempre mira o complemento mais recente existente.

Confirmação:

**Título:** `Excluir o último complemento?`

**Mensagem:** `O complemento mais recente será removido desta captura. A memória e os complementos anteriores serão mantidos. A versão já preservada, se existir, só será alterada quando você preservar este dia.`

**Ações:** `Excluir complemento` / `Cancelar`

Confirmar:

- remove somente o último complemento do workspace local;
- aguarda confirmação da persistência local;
- mantém memória e complementos anteriores;
- torna a captura pendente se ainda não estiver;
- se ainda houver complementos, o novo último passa a ser o próximo alvo da ação destrutiva.

## 11.3 Quando não restam complementos

Somente sem nenhum complemento confirmado a ação passa a ser:

`Excluir Memória`

Confirmação:

**Título:** `Excluir esta memória?`

**Mensagem:** `Esta memória será removida desta captura. A versão já preservada, se existir, só será alterada quando você preservar este dia.`

**Ações:** `Excluir memória` / `Cancelar`

Confirmar:

- remove a memória principal do workspace;
- remove naturalmente os dados pertencentes à própria memória, inclusive associações que o modelo já conserve para etapas futuras;
- não há complementos restantes para remoção em cascata;
- o servidor continua inalterado até uma futura preservação da captura;
- retornar à lista preservando contexto útil.

## 11.4 Complemento em criação ainda não confirmado

Um complemento que existe apenas no `sessionStorage` não é um complemento existente para a cadeia de exclusão.

Nessa situação:

- `Excluir último complemento` não serve para descartar o rascunho;
- a ação destrutiva fica inativa;
- abandonar a edição é o modo de descartar o complemento ainda não confirmado.

## 11.5 Exclusão versus edição suja

Para memória existente ou complemento existente:

- ao abrir sem modificar, a exclusão aplicável pode estar ativa;
- depois da primeira alteração não confirmada no campo, desabilitar a lixeira/ação destrutiva;
- confirmar ou abandonar encerra aquele estado sujo e o novo estado da tela decide novamente se a exclusão é aplicável.

Isso evita misturar uma decisão de apagar um estado confirmado com texto transitório que ainda não foi aceito pelo usuário.

# 12. Concorrência entre abas/janelas

## 12.1 Regra do MVP

A mesma combinação de **conta + data de captura** não pode ser editada simultaneamente em duas abas ou janelas do mesmo ambiente.

Se uma instância já estiver trabalhando naquela captura, uma segunda tentativa de edição deve ser bloqueada e orientar o usuário a continuar na instância original.

Não implementar merge local, `last write wins` ou transferência sofisticada de controle nesta unidade.

## 12.2 Recuperação do bloqueio

A tecnologia do lock é decisão do programador, mas precisa cumprir:

- fechar a aba original não deixa bloqueio permanente;
- crash/interrupção precisa poder ser recuperado;
- recarregar a própria aba original não deve ser interpretado simplesmente como uma concorrente e quebrar a continuidade legítima;
- capturas de **datas diferentes** podem permanecer abertas em paralelo;
- contas diferentes não compartilham o mesmo lock funcional.

O requisito principal é impedir gravação concorrente silenciosa no mesmo workspace.

# 13. Navegação e continuidade

## 13.1 Abrir memória pela lista

Clicar na própria caixa da memória abre a tela correspondente. Os controles de elevar/rebaixar não devem propagar o clique e abrir a memória acidentalmente.

## 13.2 Retorno à lista

Ao retornar depois de:

- criar memória;
- editar memória;
- consultar memória histórica;
- confirmar complemento;
- abandonar edição;
- excluir complemento;
- excluir memória;

o sistema deve restaurar o contexto de Registrar e organizar de forma razoável.

Não é exigida a mesma coordenada pixel a pixel. O objetivo é evitar que o usuário volte sempre ao início da lista ou perca completamente a região em que estava trabalhando.

Quando a memória de origem ainda existir, procurar mantê-la visível ou próxima da região anterior. Quando ela tiver sido excluída, manter a lista próxima da posição que ela ocupava, ajustando naturalmente às memórias restantes.

# 14. Ações e linguagem visual

A barra fixa superior deve variar apenas os controles necessários ao contexto atual, sem acumular todas as capacidades ao mesmo tempo.

Exemplos conceituais:

- Registrar e organizar → data + `Adicionar memória`;
- memória nova → data + retorno + `Confirmar Memória` + exclusão inativa/ausente;
- memória editável limpa → data + retorno + `Confirmar Memória` + ação destrutiva aplicável;
- memória editável suja → data + retorno + `Confirmar Memória` + exclusão desabilitada;
- memória histórica sem complemento editável → data + retorno + `Adicionar complemento` + `Excluir último complemento` ou `Excluir Memória`;
- complemento em edição → data + retorno + `Confirmar Complemento` + exclusão conforme estado limpo/sujo e existência prévia.

Não é necessário reproduzir literalmente essa disposição se uma composição equivalente for mais clara. Preservar, porém, os rótulos funcionais e as condições de disponibilidade.

# 15. Tratamento de falhas

Manter os princípios já estabelecidos:

- falha local não pode ser tratada como sucesso;
- falha remota não equivale a ausência;
- interface deve continuar representando o último estado confirmado;
- rascunho em edição deve permanecer disponível quando uma confirmação falhar;
- uma falha na reordenação deve manter/restaurar a ordem confirmada;
- uma falha de exclusão deve manter o elemento no workspace;
- uma falha ao criar/editar memória ou complemento não deve limpar o texto transitório;
- lock concorrente não pode resultar em duas instâncias escrevendo silenciosamente;
- configuração inválida de `prazo_edicao_memoria_dias` não recebe fallback silencioso.

Os textos concretos de novas falhas operacionais podem ser propostos pelo programador na clarificação inicial ou durante a implementação quando a necessidade aparecer. Mensagens técnicas não devem expor detalhes internos desnecessários, mas precisam comunicar a consequência real e permitir tentativa/retorno quando aplicável.

# 16. Remoção do andaime de 05.06

O controle temporário:

`Marcar como alterada`

cumpriu sua função de testar a fundação local e deve ser removido nesta unidade.

A partir da 05.07, a captura passa a ficar alterada somente por operações funcionais reais, por exemplo:

- Confirmar nova memória;
- Confirmar edição realmente diferente;
- Confirmar complemento;
- excluir complemento;
- excluir memória;
- elevar/rebaixar memória.

O texto `Controle temporário de desenvolvimento` e mensagens específicas do botão temporário deixam de fazer parte da experiência final desta área.

# 17. Validações progressivas obrigatórias com o operador

Esta é uma unidade extensa. **Não acumular toda a implementação para apresentar somente no final.**

Antes de iniciar, realizar a clarificação funcional prevista pela metodologia do projeto. Depois, montar o plano operacional de implementação em etapas. A ordem técnica pode ser ajustada, mas deve preservar marcos equivalentes aos abaixo.

Em **cada marco**, quando houver algo verificável pelo operador, o programador deve:

1. dizer de forma curta o que acabou de ficar pronto;
2. indicar exatamente o que o operador deve testar manualmente naquele momento;
3. apresentar uma checklist curta e concreta;
4. esperar o retorno do operador quando aquele teste tiver potencial de evitar retrabalho na etapa seguinte;
5. registrar no Markdown operacional o que foi validado e o que ainda falta.

O objetivo dessa instrução é deliberado: há muitos comportamentos nesta unidade e o operador não deve depender de lembrar sozinho todos os casos.

## Marco A — cache e abertura

Antes de avançar para a interface completa, validar a evolução do workspace/cache.

O programador deve lembrar o operador de testar, quando os mocks permitirem:

- [ ] primeira abertura de data remota existente materializa conteúdo + revisão;
- [ ] primeira abertura de data remota ausente materializa vazio limpo;
- [ ] reabrir workspace limpo com mesma revisão reutiliza IndexedDB sem novo download integral das memórias;
- [ ] revisão remota diferente provoca obtenção integral e reconstrução do workspace limpo;
- [ ] ausência local/remota continua vazia sem download integral desnecessário;
- [ ] ausência local que virou existente baixa a nova composição;
- [ ] existente local que virou ausente reconstrói vazio;
- [ ] falha remota não é tratada como ausência;
- [ ] workspace **alterado** continua prevalecendo e não é substituído pelo remoto;
- [ ] `prazo_edicao_memoria_dias` chega ao contexto de Capturar e o valor mockado vigente pode ser alterado para teste sem hardcode silencioso.

Se o programador conseguir provar parte desses casos com testes automatizados temporários, ótimo; isso não substitui o lembrete dos cenários manuais que forem observáveis.

## Marco B — estrutura da Captura do dia

Depois da casca real:

- [ ] header continua funcionando;
- [ ] linha da captura aparece abaixo do header;
- [ ] data por extenso fica à esquerda;
- [ ] ações contextuais ficam à direita;
- [ ] as três abas aparecem;
- [ ] as três abas podem ser alternadas livremente;
- [ ] Categorizar e Tom permanece apenas como casca, sem funcionalidade inventada;
- [ ] Revisar e Preservar permanece apenas como casca, sem funcionalidade inventada;
- [ ] header + linha de captura + abas permanecem fixos/sticky durante rolagem suficiente para observar o comportamento;
- [ ] somente o conteúdo abaixo rola de forma natural;
- [ ] abrir a tela de uma memória oculta as abas e mantém header + linha da captura.

Validar também pelo menos uma largura menor/mobile disponível no ambiente de desenvolvimento, para detectar cedo sobreposição da data com os botões.

## Marco C — lista, inclusão e ordem

Depois de Registrar e organizar funcional:

- [ ] Adicionar memória está na linha fixa superior;
- [ ] nova memória com texto vazio não pode ser confirmada;
- [ ] texto somente com espaços também não pode ser confirmado;
- [ ] nova memória válida entra na última posição;
- [ ] confirmar a primeira memória transforma a captura em pendente;
- [ ] preview nunca passa de três linhas;
- [ ] preview não ganha rolagem interna;
- [ ] clicar na caixa abre a memória;
- [ ] elevar move somente uma posição;
- [ ] rebaixar move somente uma posição;
- [ ] primeiro item não pode subir;
- [ ] último item não pode descer;
- [ ] não existe drag-and-drop;
- [ ] a rolagem acompanha a memória quando necessário sem fazê-la sumir do contexto;
- [ ] existe respiro perceptível depois da última caixa;
- [ ] recarregar a captura mantém conteúdo e ordem confirmados no IndexedDB.

Se o degradê das três linhas estiver implementado, pedir ao operador que avalie legibilidade. Se o fallback de truncamento estiver sendo usado, informar explicitamente.

## Marco D — edição e rascunho efêmero

Depois da tela editável e `sessionStorage`:

- [ ] memória nova abre com campo editável de altura coerente;
- [ ] ação é `Confirmar Memória`, não `Salvar`;
- [ ] memória existente editável carrega texto confirmado;
- [ ] digitar modifica somente o rascunho efêmero e não o IndexedDB imediatamente;
- [ ] digitar sozinho não cria pendência numa captura limpa;
- [ ] F5/Ctrl+R durante edição restaura o texto transitório da mesma aba;
- [ ] abandonar pelo Voltar do Rememore avisa sobre perda quando houver edição suja;
- [ ] cancelar o abandono mantém texto/edição;
- [ ] confirmar o abandono remove o rascunho e, numa nova entrada, não o restaura;
- [ ] confirmar memória persiste no IndexedDB, limpa o rascunho e retorna próximo da posição anterior da lista;
- [ ] falha simulada de persistência mantém o texto em edição e não apresenta sucesso;
- [ ] depois que a edição fica suja, a exclusão correspondente fica inativa;
- [ ] edição limpa pode mostrar a ação destrutiva aplicável.

Também lembrar o operador de verificar o aviso nativo do navegador em pelo menos um fluxo suportado, sabendo que texto/comportamento final é controlado pelo próprio navegador.

## Marco E — historicidade e complementos

Usar mocks/cenários com timestamps controláveis para não depender de esperar 72 horas reais.

Lembrar o operador de testar:

- [ ] memória nunca preservada continua editável mesmo simulando longa permanência local;
- [ ] memória com primeira preservação dentro das 72 horas abre editável;
- [ ] memória com primeira preservação há mais de 72 horas abre somente leitura;
- [ ] edição aberta dentro do prazo continua confirmável mesmo se o relógio do cenário ultrapassar o limite enquanto ela permanece aberta;
- [ ] sair dessa edição e reabrir depois do limite resulta em somente leitura;
- [ ] F5 da mesma edição autorizada preserva a autorização já concedida;
- [ ] preservação posterior simulada não reinicia o timestamp da primeira preservação;
- [ ] memória histórica oferece Adicionar complemento quando aplicável;
- [ ] complemento vazio/espaços não pode ser confirmado;
- [ ] complemento novo nunca preservado permanece editável;
- [ ] complemento dentro das próprias 72 horas abre editável;
- [ ] complemento fora das próprias 72 horas aparece integrado e somente leitura;
- [ ] memória e complemento usam a **mesma** variável de prazo;
- [ ] só existe um complemento editável por vez;
- [ ] complementos históricos exibem data e conteúdo na sequência da memória.

## Marco F — exclusão regressiva

Criar cenário com memória e pelo menos dois complementos.

Lembrar o operador de testar:

- [ ] com complementos, o rótulo é `Excluir último complemento`;
- [ ] a confirmação deixa claro que memória e complementos anteriores permanecem;
- [ ] excluir remove somente o último complemento;
- [ ] repetir a ação remove o complemento que então passou a ser o último;
- [ ] enquanto existir complemento, não é possível excluir diretamente a memória principal;
- [ ] sem complementos, o rótulo muda para `Excluir Memória`;
- [ ] a confirmação da memória possui o texto específico correto;
- [ ] confirmar exclusão da memória remove somente o estado local da composição atual até futura preservação;
- [ ] complemento novo ainda não confirmado não vira alvo de exclusão;
- [ ] edição suja desabilita exclusão;
- [ ] falha simulada de persistência não remove visualmente o elemento como se tivesse dado certo.

## Marco G — concorrência e Orientação Progressiva

### Concorrência

Lembrar o operador de testar:

- [ ] abrir a mesma conta/data numa segunda aba bloqueia a segunda edição;
- [ ] abrir data diferente em outra aba continua permitido;
- [ ] recarregar a aba original não gera concorrência falsa;
- [ ] fechar a aba original permite recuperação do bloqueio sem lock permanente;
- [ ] a segunda aba nunca consegue gravar silenciosamente por cima da primeira.

### Orientação Progressiva

Lembrar explicitamente o operador de testar o CMP-005, inclusive a pendência de validação da 05.06:

- [ ] captura nova, vazia, limpa e remotamente ausente apresenta orientação;
- [ ] nível iniciante apresenta a mensagem iniciante;
- [ ] nível intermediário apresenta a mensagem intermediária;
- [ ] nível avançado apresenta a mensagem avançada neste contexto;
- [ ] data com conteúdo preservado não apresenta orientação de começo;
- [ ] captura local alterada não apresenta orientação de começo;
- [ ] confirmar primeira memória remove a orientação;
- [ ] excluir depois todas as memórias não faz a orientação reaparecer automaticamente.

## Marco H — integração final da unidade

Antes do Parecer final, conduzir uma passagem integrada com o operador, lembrando pelo menos:

- [ ] abrir nova data → orientação → adicionar memória → confirmar → pendência aparece;
- [ ] adicionar segunda memória → reordenar → abrir/editar → retornar mantendo contexto;
- [ ] recarregar página e confirmar continuidade do estado protegido;
- [ ] abrir data preservada editável → editar e confirmar;
- [ ] abrir data preservada histórica → adicionar complemento e confirmar;
- [ ] excluir complementos em ordem regressiva e, por fim, memória;
- [ ] pendência permanece coerente na Seleção e na Principal depois das alterações reais;
- [ ] controle temporário `Marcar como alterada` não existe mais;
- [ ] abas futuras continuam presentes sem funcionalidade antecipada;
- [ ] erros simulados relevantes não produzem falsos sucessos;
- [ ] build, checks e rotas existentes anteriores continuam válidos.

O programador pode acrescentar casos revelados durante a construção. Não remover os casos acima apenas porque existe cobertura automatizada equivalente: o pedido explícito desta unidade é também **lembrar o operador do que validar manualmente**.

# 18. Verificações técnicas esperadas

A implementação deve usar as verificações técnicas que façam sentido para a stack existente, incluindo no mínimo:

- typecheck/check equivalente do projeto;
- lint aplicável às áreas alteradas;
- build;
- testes temporários ou permanentes que protejam contratos de repositório, cache, historicidade e concorrência enquanto estiverem sendo desenvolvidos;
- cenários de falha de IndexedDB quando viáveis;
- cenários de revisão igual/diferente/ausência/falha do mock remoto;
- cenários de timestamps em torno do limite de 72 horas;
- isolamento por conta/data;
- ausência de regressão das pendências reais implementadas na 05.06.

Como nas unidades anteriores, **não existe objetivo abstrato de cobertura permanente**. Testes criados como andaime de desenvolvimento podem ser removidos depois de cumprirem sua função, se não houver benefício proporcional em mantê-los. O Parecer final deve informar o que foi validado e quais limitações reais permaneceram, sem declarar cobertura que não ocorreu.

# 19. Critérios de aceite

A unidade pode ser considerada funcionalmente concluída quando, conjuntamente:

1. `/capturar/{data}` deixou de ser casca temporária e possui a estrutura fixa definida;
2. as três abas aparecem, com Registrar e organizar funcional;
3. workspaces limpos são validados por existência/revisão e reutilizados sem retransmissão integral quando atuais;
4. trabalho alterado continua tendo prioridade e não é sobrescrito;
5. revisão de origem permanece armazenada para futuro conflito de preservação;
6. `prazo_edicao_memoria_dias` com valor inicial 3 governa memória e complemento como 72 horas;
7. primeira preservação, e não data da captura, inicia o relógio;
8. autorização de edição é determinada ao abrir a sessão e sobrevive ao tempo enquanto a mesma edição permanecer ativa;
9. lista limita preview a três linhas e oferece somente mover acima/abaixo como controles laterais;
10. nova memória entra no final e texto branco não pode ser confirmado;
11. tela única cobre memória nova, editável, histórica e complemento;
12. complementos históricos integram a leitura da memória;
13. rascunho efêmero sobrevive a reload acidental, mas não vira pendência nem reaparece depois de abandono deliberado;
14. `Confirmar Memória` / `Confirmar Complemento` persistem somente após confirmação local;
15. exclusão funciona regressivamente, último complemento por vez e memória somente ao final;
16. edição suja impede ação destrutiva concorrente na mesma tela;
17. mesma captura não pode ser editada por duas abas/janelas ao mesmo tempo;
18. CMP-005 é reutilizado somente para captura genuinamente nova e sua validação manual é lembrada ao operador;
19. primeira alteração real substitui o controle temporário da 05.06;
20. falhas não são convertidas em sucesso aparente;
21. o programador conduziu os lembretes de validação progressiva e registrou os resultados no Markdown operacional.

# 20. Autonomia técnica e retorno ao operador

O programador tem autonomia para escolher, entre outros:

- estrutura interna do schema/migração;
- nomes técnicos de stores/índices/campos;
- representação concreta da revisão opaca;
- forma de compor o contrato mockado;
- debounce do rascunho;
- mecanismo técnico de lock entre abas;
- uso de `BroadcastChannel`, eventos de storage, heartbeat, identificadores de instância ou solução equivalente;
- composição CSS para sticky/fixed;
- CSS do truncamento/degradê;
- organização de componentes React/rotas/serviços;
- ícones concretos equivalentes disponíveis na biblioteca atual;
- quantidade e natureza dos testes técnicos de apoio.

Essas escolhas não precisam retornar ao operador quando preservarem o contrato acima.

**Retornar ao operador antes de decidir** se surgir necessidade de escolher ou inventar:

- comportamento funcional não descrito;
- nova mensagem com consequência relevante;
- regra diferente de historicidade;
- mudança na semântica de pendência;
- perda ou sobrescrita possível de trabalho confirmado;
- nova forma de exclusão;
- restrição de navegação não prevista;
- política de limpeza de cache;
- mudança no limite de 72 horas;
- nova Variável do Sistema;
- alteração de escopo das etapas Categorizar/Tom/Revisar;
- qualquer decisão que transforme esta unidade em algo funcionalmente diferente do aprovado.

Antes do plano operacional, fazer a rodada inicial de clarificação. Se não houver dúvida funcional relevante, dizer explicitamente ao operador que o contrato foi compreendido e que não foram encontradas lacunas que impeçam o desenvolvimento.

# 21. Continuidade depois desta unidade

A 05.07 prepara a Captura do dia para as próximas etapas sem implementá-las antecipadamente.

Depois de concluída e reconciliada:

- a primeira etapa terá conteúdo real e persistente;
- a captura já possuirá memórias com identidade, ordem, historicidade e complementos suficientes para sustentar Categorizar e Tom;
- a revisão de origem estará pronta para ser reutilizada por Revisar e Preservar;
- as abas futuras já estarão integradas ao mesmo shell;
- a infraestrutura de edição local já terá proteção contra reload e concorrência básica.

A próxima unidade só deve ser escolhida depois do Parecer da 05.07. A direção provável é **Categorizar**, aproveitando o estado real das memórias produzido aqui, mas o resultado desta implementação continua tendo prioridade sobre um planejamento antecipado.

## Continuidade

### Intervenção PT-BR — 14/09/2026

- Por orientação posterior do operador, a intervenção parte de `fd1672b` (develop, “Spec 07 - Parcial”), incluindo o código já
  produzido nesta unidade. A branch `refactor/convencao-pt-br` aguarda inspeção e teste antes de qualquer reintegração.
- O operador informou que a entrega parcial contém trabalho testado e validado. A intervenção não executa os marcos C/D nem altera
  os critérios funcionais pendentes. A próxima sessão retoma o estado existente com os novos nomes.
- Referências nominais desta Continuidade e da memória técnica atualizadas. Corpo aprovado acima preservado integralmente.
- Principais entradas: `islands/CapturaDia.tsx`, `components/EstruturaCaptura.tsx`, `components/PainelCaptura.tsx`,
  `app/servicos/captura.ts`, `app/servicos/captura/bloqueio.ts`, `app/servicos/captura/sessaoAberta.ts` e
  `app/servicos/local/`. Métodos locais: `gravar`, `obter`, `remover`, `listarPendentes`, `marcarAlterada`;
  posse: `executar`/`liberar`; sessão aberta: `retomar`/`iniciar`/`encerrar`.
- Schema 3, campos persistidos, chaves de armazenamento e comandos `rememoreCaptureMock` preservados nesta intervenção.
  O operador solicitou analisar depois a nacionalização do IndexedDB, dispensando a preservação dos dados atuais; análise ainda pendente.
- Indicadores de contexto antes das leituras e após a leitura inicial: indisponíveis; sem estimativa retroativa.
- Entrega técnica da intervenção: tipos, lint, build e 31 testes aprovados; formatação dos fontes autorais aprovada. A tarefa global
  `check` para na formatação de documentos/configurações/terceiros preservados. Auditoria confirmou o corpo aprovado e os contratos
  protegidos intactos. Diff entregue ao operador sem reintegração. Indicador final de contexto indisponível.
- Retorno posterior: operador fez alguns testes da nacionalização e informou que ficou tudo certo, sem detalhar os cenários.
  Informou sessão em 77% de contexto, capacidade total não informada, e pediu passagem para outra sessão. Pendentes na intervenção:
  pastas antigas vazias, análise da nacionalização do IndexedDB (dados atuais dispensáveis) e conclusão das operações de Git.
  A 07 permanece no mesmo marco funcional; consultar a Continuidade de `.docs/intervencao-tecnica.md` para retomar a intervenção.

### Sessão de 14/09/2026 — clarificação concluída

- Operador informou 85% de uso semanal restante antes das leituras. Capacidade total não informada. Indicador de ocupação da janela de
  contexto indisponível antes das leituras e após AGENTS, índice, memória inicial e Especificação, antes do fonte; não estimado.
- Estado inicial do Git: somente este Markdown não rastreado. Corpo aprovado preservado.
- Captura pendente conserva o prazo recebido na preparação, sem consulta remota na retomada.
- Reload da captura aberta continua a mesma sessão: mantém workspace/revisão, prazo e, quando implementados, rascunho e autorização.
  Não consulta o remoto nem marca alteração. Nova entrada pela Seleção revalida workspace limpo; alterado sempre prevalece.
- Saída deliberada encerra a sessão e descarta rascunho somente após confirmação quando houver edição não confirmada.
- Remoção de pendência pela Seleção participa do bloqueio por conta/data. Mensagem aprovada: “Esta captura está aberta em outra aba ou
  janela. Feche-a antes de apagar suas alterações.”
- Falha de sessionStorage conserva texto na tela e permite confirmar no IndexedDB, com aviso: “Não foi possível proteger o rascunho contra
  recarregamento. Seu texto continua nesta tela. Confirme a edição antes de sair ou recarregar.” Aviso nativo e rascunho são complementares;
  não há garantia absoluta contra interrupções ou perda do armazenamento pelo navegador.
- Operador dispensou preservação de dados experimentais anteriores; os cenários necessários serão produzidos nesta unidade.
- Datas históricas dos complementos usam o calendário local do navegador; o prazo usa duração exata desde a primeira preservação.
- Abandono aprovado: título “Descartar a edição não confirmada?”, mensagem “As alterações desta edição serão descartadas. O conteúdo já
  confirmado da captura será mantido.”, ações “Descartar edição” / “Continuar editando”.

### Plano e estado

1. **Marco A — implementado e tecnicamente verificado; aguardando validação manual:** modelo local, revisão/cache, prazo recebido,
   continuidade da sessão aberta e fundação de concorrência. Validar abertura/cache com o operador antes da interface completa.
2. **Marco B — implementado e verificado; aguardando avaliação do operador:** estrutura fixa e abas. Operador autorizou
   avanço após a entrega A, sem informar resultados dos testes manuais; esses resultados continuam pendentes.
3. **Marcos C/D — pendentes:** lista, inclusão/ordem, tela editável, rascunho e retorno; validar incrementalmente os respectivos checklists.
4. **Marcos E/F — pendentes:** historicidade/complementos e exclusão regressiva, com cenários de relógio e falha.
5. **Marcos G/H — pendentes:** validação completa de concorrência e CMP-005, passagem integrada e verificações finais.

Os checklists do corpo aprovado permanecem vigentes. Encerramento e Parecer dependem do operador.

### Entrega do marco A — 14/09/2026

- Schema 3: revisão de origem, identidade da materialização local, prazo recebido, primeira preservação e complementos. Migração elimina
  apenas os registros experimentais anteriores à 07, conforme autorização; não há limpeza nas aberturas posteriores.
- Serviço remoto separado em metadados leves e composição integral. Consulta leve sem retransmitir memórias quando a revisão é igual;
  transições de existência/revisão reconstruídas somente após resposta conclusiva e commit. Snapshot integral usa sua própria revisão/prazo.
- Workspace alterado e reload da sessão aberta retomam IndexedDB sem remoto. Entrada normal pela Seleção revalida o limpo.
- Web Locks por conta/data cobrem preparação, operações e remoção na Seleção. Segunda instância bloqueada; saída libera, operações em curso
  mantêm proteção até terminar. Retorno de página via BFCache refaz a entrada antes de permitir ações.
- A tela ainda é o andaime anterior, inclusive `Marcar como alterada`, usado neste marco para testar pendências. Remoção prevista ao
  implementar operações reais. Rascunho de texto, autorização de edição e beforeunload ainda pertencem ao marco D.
- Verificação: `deno check`, `deno lint`, `deno task build` e `deno test -A tests app` passaram; 31 testes no total, incluindo 16 testes
  de captura/sessão. IndexedDB simulado com fake-indexeddb e manager de locks simulado nos testes; não equivalem a validação de quota,
  encerramento abrupto ou comportamento nativo em duas abas reais. Avaliação manual ainda não realizada pelo operador neste marco.
- Indicador de janela de contexto no final desta entrega: indisponível; uso semanal não medido novamente.

### Roteiro manual do marco A

Executar a aplicação em desenvolvimento (`deno task dev`). Abra uma Captura do dia para carregar os controles técnicos do mock. No console
do navegador, habilite **Preservar log**. Os comandos abaixo são exclusivos do desenvolvimento; não criam controles na interface do produto.
Execute cada comando enquanto estiver numa Captura do dia, onde `rememoreCaptureMock` está disponível. Depois use Voltar do Rememore e
abra pela Seleção a data indicada, salvo quando o passo pedir F5. Use datas diferentes das que já marcou como alteradas.

Leitura do console:

- `[Capturar mock] metadata`: uma consulta leve de existência, revisão e prazo.
- `[Capturar mock] download`: uma obtenção integral das memórias.
- `[Capturar local]`: revisão, prazo (`editWindowDays`), estado alterado, quantidade de memórias e identidade do workspace confirmado.
- Os registros anteriores permanecem no console; conte somente os novos de cada abertura. Os textos das memórias podem ser inspecionados em
  Application → IndexedDB → rememore-local → captures; a lista visual será implementada depois.

Passos (a data abaixo pode ser trocada por outra data válida):

1. **Primeira abertura existente:** em outra data aberta, executar `rememoreCaptureMock.set("2026-09-10", "found", "X", 3)`.
   Voltar à Seleção e abrir 10/09/2026. Esperado: metadata + download, revisão X, uma memória, prazo 3, changed false.
2. **Mesmo cache:** voltar à Seleção e abrir novamente 10/09. Esperado: somente metadata; mesma revisão, memória e workspaceId.
3. **F5 versus nova entrada:** na captura aberta, executar `rememoreCaptureMock.set("2026-09-10", "found", "Y", 4)` e pressionar F5.
   Esperado: nenhum metadata/download novo; mantém X e prazo 3. Voltar à Seleção e abrir novamente: metadata + download, Y e prazo 4.
4. **Existente vira ausente:** executar `rememoreCaptureMock.set("2026-09-10", "absent")`; sair e reabrir pela Seleção. Esperado: metadata,
   revisão null, zero memórias, changed false. Repetir saída/entrada: somente metadata, mesmo workspace vazio.
5. **Ausente vira existente:** executar `rememoreCaptureMock.set("2026-09-10", "found", "Z", 3)`; sair e reabrir. Esperado: metadata +
   download, revisão Z e uma memória. Para **primeira abertura ausente**, configurar outra data ainda não aberta com status absent e abri-la:
   somente metadata, workspace vazio limpo confirmado no IndexedDB.
6. **Falha remota:** executar `rememoreCaptureMock.set("2026-09-10", "failed")`; sair e reabrir. Esperado: erro de preparação; registro Z
   permanece no IndexedDB, sem substituição por vazio. Configurar uma data ainda não aberta como failed também não deve criar workspace.
   Para recuperar o cenário, executar `rememoreCaptureMock.set("2026-09-10", "found", "Z", 3)` e entrar novamente pela Seleção.
7. **Prazo inválido:** na captura limpa aberta, configurar `rememoreCaptureMock.set("2026-09-10", "found", "Z", 0)` e reabrir pela Seleção.
   Esperado: erro, sem fallback para 3 nem alteração do workspace. Restaurar prazo 3 pelo mesmo comando e entrar normalmente.
8. **Prioridade da pendência:** na captura Z aberta, acionar o botão temporário `Marcar como alterada`. Configurar remoto como failed e
   reabrir pela Seleção. Esperado: nenhum metadata/download, mantém Z e prazo 3; aparece pendência na Seleção e na Principal.
9. **Duas abas e remoção:** manter a captura pendente aberta e abrir a mesma conta/data numa segunda aba: bloqueio. Data diferente deve
   abrir normalmente. Na Seleção de outra aba, tentar apagar a pendência aberta: mensagem de bloqueio e registro mantido. Fechar a aba
   proprietária e recarregar a aba bloqueada: deve abrir. Fechar a captura e repetir remoção pela Seleção: deve permitir.
10. **Continuidade do lock:** F5 na aba proprietária deve retomar normalmente; não deve gerar bloqueio contra si própria. Testar também
    Voltar/Avançar do navegador: nenhuma página restaurada deve permitir gravar sobre uma captura atualmente aberta em outra aba.

`rememoreCaptureMock.reset("2026-09-10")` retorna o remoto simulado dessa data ao padrão ausente. Isso não apaga trabalho local pendente.
Para simular falha somente no download, `configure(data, {status: "found", revision: "nova", editWindowDays: 3, memories: [], failRead: true})`
substitui o cenário dessa data; usar `rememoreCaptureMock.configure` no console. Sair e reabrir workspace limpo: metadata + download, erro,
workspace anterior mantido. Os testes automatizados já cobrem esse caso.

**Pendência da entrega:** resultados manuais não informados. Operador autorizou prosseguir para o marco B; roteiro A permanece disponível.

### Entrega do marco B — 14/09/2026

- `EstruturaCaptura` em modo dia e novo `PainelCaptura` compõem header, data por extenso/ações e três abas, com rolagem normal do documento.
  A altura real do header determina o deslocamento sticky, inclusive quando muda com largura/tipografia.
- As abas funcionam por clique e teclado (setas/Home/End). Categorizar e Tom e Revisar e Preservar continuam vazias.
- Abertura estrutural de Memória oculta abas e mantém data/ações. Retorno reapresenta Registrar e organizar. Nesta entrega, nova memória
  tem campo e confirmação desabilitados; memórias do mock abrem para leitura. Edição, gravação, ordem e rascunho continuam para C/D.
- Prévia da lista já limita a três linhas, sem degradê nesta etapa. O andaime `Marcar como alterada` permanece ao final de Registrar para
  os testes A, até a substituição por operações reais em C/D.
- Cenário visual disponível somente em desenvolvimento: **08/09/2026**, revisão `layout-B`, 18 memórias; a primeira tem texto longo.
  Configuração manual anterior do mock para essa data tem prioridade. Se necessário, executar `rememoreCaptureMock.reset("2026-09-08")`
  na Captura do dia e voltar pela Seleção. Esse reset retorna essa data ao cenário visual predefinido, não ao padrão ausente das demais datas.
- Verificação técnica: formatação dos arquivos alterados, `deno check`, `deno lint`, build e 31 testes de serviços/rotas passaram.
- Browser/Chrome: conferidos desktop e viewport 390 × 844, abas vazias, troca por teclado, ocultação das abas na Memória, rolagem do documento
  com header no topo e data abaixo, sem overflow horizontal no mobile. A rolagem móvel automatizada por gesto apresentou timeout; a
  conferência da memória longa foi feita por PageDown. Avaliação de toque real e opinião visual do operador permanecem pendentes.
- Indicador de contexto nesta entrega: indisponível. Uso semanal não medido novamente.

### Roteiro manual do marco B

Na aplicação em desenvolvimento, abrir **08/09/2026 pela Seleção** e conferir:

- [ ] Voltar do header retorna à Seleção; Sair abre a confirmação habitual, que pode ser cancelada.
- [ ] Data por extenso fica à esquerda e Adicionar memória à direita, sem sobreposição.
- [ ] Rolar as 18 caixas: header, data/ação e abas permanecem no topo; a página usa a rolagem normal.
- [ ] Alternar livremente as três abas, inclusive por teclado; as duas futuras continuam vazias e sem ação Adicionar memória.
- [ ] Abrir uma caixa: abas somem, data/header permanecem e Voltar à captura recupera a lista. A primeira memória permite testar leitura longa.
- [ ] Adicionar memória abre a estrutura com campo/Confirmar Memória desabilitados nesta etapa; retornar à captura funciona.
- [ ] Repetir em largura de celular, observando quebra dos rótulos, legibilidade da data, ações e ausência de rolagem horizontal.

**Retorno do operador:** estrutura B aprovada (“Tudo ok”), com ajuste solicitado: botões da barra somente com ícones, descrição em `title`
e agrupamento Bulma em um único bloco. Implementado com `buttons has-addons`, mantendo os nomes acessíveis em `aria-label` e os rótulos
funcionais como descrição dos ícones. Essa orientação também vale para as ações que serão acrescentadas nos próximos marcos.

**Etapa corrente:** ajuste visual B entregue; próxima construção C/D. Resultados manuais A não foram declarados como aprovados.

## Parecer final

A ser acrescentado somente no encerramento desta Especificação, sem modificar o corpo aprovado acima.
