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

### Estado final — encerrada pelo operador em 18/09/2026

- Operador determinou: “Pode seguir ao parecer final, está tudo ok.” Registrado aceite global e encerramento da unidade;
  os estados pendentes nas anotações anteriores representam os marcos históricos, não trabalho funcional ainda aberto.
- Conferidos corpo aprovado, critérios de aceite e implementação vigente. Verificações finais: `deno check`, lint e formatação dos
  fontes/CSS alterados, `deno task build` e `deno test -A tests app`: **48 testes aprovados**. A tarefa global `deno task check`
  não foi declarada aprovada; a verificação de formatação foi restrita aos fontes/estilos alterados, preservando os demais documentos.
- Aceite global não foi convertido retroativamente em relatos individuais de cada checklist. Preservados os limites dos testes simulados
  e os retornos manuais efetivamente registrados. Nível simulado restaurado para `beginner`; mensagens não reescritas.
- Parecer final preenchido abaixo e entregue ao operador para transporte ao analista/registro canônico. Google Drive não atualizado.
- Base final: `develop`, HEAD `8e01b7f`; todo o trabalho permanece sem commit, sem push e sem troca de branch. Indicador final de contexto:
  não disponível; indicadores anteriores preservados sem estimativa retroativa.

### Retomada C/D — 15/09/2026

- Base conferida: develop, `8e01b7f`. Preservadas as alterações anteriores neste documento e o adendo não rastreado.
- B e botões aprovados. Única clarificação nova: mensagens de falha abaixo, aprovadas pelo operador.
- Plano: inclusão/ordem e edição com rascunho; verificar contratos e build; apresentar checklist C/D antes de E/F.
- Etapa corrente: C/D implementados e tecnicamente verificados; aguardando validação manual abaixo. Complementos e exclusão permanecem E/F.
- Falhas aprovadas: “Não foi possível confirmar a memória. Seu texto continua nesta tela. Tente novamente.” e
  “Não foi possível alterar a ordem das memórias. A ordem anterior foi mantida. Tente novamente.”
- Indicadores de contexto antes das leituras e após leitura inicial, antes do fonte: não disponíveis; sem estimativa retroativa.

### Passagem para nova sessão — 15/09/2026

- Próximo trabalho: **marcos C/D**, com lista/inclusão/reordenação, edição e confirmação local, proteção do rascunho e retorno à lista.
  Nenhuma implementação de C/D foi iniciada nesta retomada. Preservar a cadência e os checklists já aprovados; não reiniciar a clarificação.
- Marco B e ajuste dos botões aprovados pelo operador: somente ícones, `title`, nome acessível e grupo Bulma `buttons has-addons`.
- Base atual conferida: `develop`, commit `8e01b7f`, intervenção PT-BR integrada sobre `fd1672b`. Usar essa base diretamente.
- Ler `.docs/adendo-operacional-spec-07.md` junto ao contexto obrigatório. O adendo, AGENTS e referências atuais foram lidos nesta sessão;
  não surgiram dúvidas. As anotações antigas abaixo sobre intervenção pendente, branch separada e schema 3 são históricas e estão superadas.
- Estado técnico vigente: schema 4, stores `capturas` e `_diagnostico`, campos locais PT-BR; contratos remotos em inglês com conversão em
  `prepararCaptura`. Preservar chaves de sessão, campo serializado `workspaceId`, comandos `rememoreCaptureMock`, cookies, rotas e locks.
- Código novo segue a convenção PT-BR do AGENTS. Entradas atuais: `CapturaDia`, `EstruturaCaptura`, `PainelCaptura`, `SessaoCapturaAberta`,
  `PosseCaptura`, `RepositorioCapturasLocais`; caminhos e contratos detalhados no adendo e na referência de trabalho local.
- Mantidas as decisões funcionais: pendência conserva o prazo recebido; reload da sessão aberta mantém base e autorização sem remoto;
  nova entrada pela Seleção revalida apenas o limpo; digitação não cria pendência; saída deliberada descarta rascunho após confirmação.
- Validação da intervenção: o adendo informa 34 testes e validação do operador. Esses testes não foram reexecutados nesta passagem.
- Git antes desta anotação: somente `.docs/adendo-operacional-spec-07.md` não rastreado. Nenhum fonte alterado nesta retomada.
- Indicador final informado pelo operador: **68% da capacidade de contexto, 175k de 258k tokens**. É ocupação de contexto, não uso semanal.
  Indicadores anteriores permanecem conforme seus registros, sem reconstrução retroativa. Recomendada nova sessão antes de iniciar C/D.

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
2. **Marco B — aprovado pelo operador, incluindo ajuste dos botões:** estrutura fixa e abas. Os resultados individuais do roteiro A
   não foram detalhados; preservar o histórico e os lembretes para a integração final.
3. **Marcos C/D — passagem manual restante aprovada em 17/09/2026:** lista, inclusão/ordem, tela editável, rascunho e retorno. Itens de exclusão do checklist D serão conferidos em F.
4. **Marcos E/F — implementados:** E teve aceite do cenário histórico e autorização de avanço; demais resultados individuais não detalhados.
   F aguarda validação manual da exclusão regressiva, incluindo edição suja e falha de gravação.
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

**Etapa corrente:** C/D implementados na develop integrada; aguardando validação manual do roteiro de 15/09/2026 abaixo.

### Entrega C/D e roteiro manual — 15/09/2026

- Inclusão válida entra ao final com ID estável; edição idêntica não grava nem cria pendência. Alterações e ordem são publicadas somente
  após commit, sob a posse existente. Removido o botão `Marcar como alterada` e sua apresentação temporária.
- Prévia conserva o fallback aprovado de três linhas, sem degradê nem rolagem interna. Controles laterais movem uma posição, com extremos
  desabilitados e ajuste mínimo de rolagem, procurando incluir uma caixa na direção do movimento. Retorno procura manter a memória visível.
- Campo principal de cinco linhas, Confirmar Memória com bookmark verde e barra de ícones aprovada. Memórias fora do prazo ficam em leitura;
  complemento e exclusão não foram antecipados. Itens do checklist D referentes à lixeira permanecem para integração E/F.
- Rascunho independente em sessionStorage, debounce de 200 ms, proteção também ao descarregar; restaura texto e autorização da mesma edição
  no reload. Nova navegação não restaura edição anterior. Compatibilidade de base evita duplicação se houver commit antes de um reload.
- Voltar à captura, Voltar do header e logout confirmado respeitam abandono da edição suja. Aviso nativo em beforeunload; falha de proteção
  avisa sem impedir confirmação local. Não há garantia absoluta contra interrupção ou indisponibilidade do armazenamento pelo navegador.
- Verificação: `deno check`, lint dos arquivos alterados, formatação dos fontes/CSS, build e `deno test -A tests app`: **41 testes passaram**,
  incluindo sete novos casos de inclusão/ordem, falha, prazo, isolamento e rascunho. IndexedDB em memória e Storage simulado não substituem
  validação visual, rolagem/toque, aviso nativo, quota ou duas abas reais. Não foi feita validação manual de C/D pelo operador nesta entrega.
- Indicador de contexto no final desta entrega: não disponível. Sem commit, push ou encerramento da Especificação.

Na aplicação em desenvolvimento, começar por uma data vazia e usar **08/09/2026** para lista longa:

- [ ] Adicionar memória: campo editável; vazio/espaços impedem confirmação; texto válido entra ao final. Conferir pendência na Seleção/Principal.
- [ ] Acrescentar duas memórias, elevar/rebaixar uma posição e conferir extremos. Recarregar: texto e ordem confirmados permanecem.
- [ ] Na lista longa, conferir três linhas sem rolagem interna, abertura pelo texto, retorno à região anterior e acompanhamento da memória
  movida com caixa vizinha quando couber. Repetir em largura móvel, inclusive barra de ícones e respiro final.
- [ ] Abrir uma memória criada localmente, editar e pressionar F5/Ctrl+R: aceitar o aviso nativo quando oferecido e conferir texto restaurado.
  Antes de confirmar, conferir no IndexedDB que o texto confirmado continua anterior.
- [ ] Voltar à captura com edição suja: Continuar editando conserva; Descartar edição retorna. Reabrir e F5 não devem ressuscitar o descarte.
  Repetir com Voltar do header e saída/logout, cancelando quando desejar conservar a sessão.
- [ ] Confirmar edição retorna à região da memória; reabrir carrega texto confirmado. Confirmar sem mudar conteúdo não deve criar pendência
  numa captura limpa. Para esse caso, configurar data limpa com memória editável pelo cenário abaixo.
- [ ] Simular falha de gravação pelo procedimento abaixo: texto/rascunho ou ordem anterior permanecem; restaurar gravação e tentar de novo.
- [ ] Antes de encerrar a 07, lembrar também a validação CMP-005 nos três níveis, concorrência real e checklists E–H ainda pendentes.

Cenário editável limpo: em uma Captura do dia, no console, configurar uma data sem pendência local e abri-la pela Seleção:

```js
rememoreCaptureMock.configure("2026-09-09", {
  status: "found", revision: "edicao-CD", editWindowDays: 3,
  memories: [{ id: "memoria-CD", content: "Memória editável de teste", order: 0,
    firstPreservedAt: new Date().toISOString(), complements: [] }]
})
```

Digitar nesse cenário não cria pendência; confirmar texto idêntico mantém a captura limpa. Para provar o prazo sem esperar, os testes
automatizados cobrem abertura um milissegundo antes do limite e nova abertura no limite; o roteiro completo de relógio continua no marco E.

Falha temporária, somente no desenvolvimento, pelo console da Captura do dia:

```js
var repositorioCD = (await import("/app/servicos/local/capturas.ts")).capturasLocais
var gravarCD = repositorioCD.gravar
repositorioCD.gravar = async () => { throw new Error("Falha simulada de gravação C/D") }
```

Tentar confirmar e conferir texto intacto; ou, sem edição aberta, tentar mover e conferir ordem intacta. Restaurar antes da nova tentativa:

```js
repositorioCD.gravar = gravarCD
```

Esse procedimento injeta rejeição na fronteira da gravação e não simula uma quota real. Não recarregar entre a injeção e a tentativa;
um reload também restaura o módulo original. A avaliação manual desses procedimentos ainda está pendente.

### Ajustes após navegação do operador — 15/09/2026

- Retorno parcial de C/D: operador confirmou que espaços impedem confirmação e apontou ajustes de apresentação, rolagem e abandono.
  Não equivale ao aceite integral dos checklists. Não há nova dúvida funcional; alterações abaixo solicitadas explicitamente.
- Lista: um único box Bulma engloba texto sem borda e botões agrupados em `buttons has-addons`, com menor preenchimento interno.
  Hover destaca a borda externa inclusive sobre os botões; botões mantêm seu hover próprio. Prévia recorta após três linhas sem reticências
  acrescentadas pelo CSS, sem alterar o texto original.
- Reordenação: após commit, compensa a diferença vertical do botão acionado para mantê-lo sob o mouse; a rolagem disponível limita a
  compensação nos extremos. Esta decisão atualiza a prioridade anterior de apenas manter a caixa e uma vizinha visíveis ao mover.
- Edição: campo não redimensionável. Nova memória vazia ou só com espaços sai sem aviso de perda, inclusive no aviso nativo; memória
  existente modificada para vazio continua exigindo confirmação de abandono. A composição adicional da tela foi adiada pelo operador.
- Etapa corrente: conferir visual da caixa inteira, cliques sucessivos de ordem e abandono de nova memória branca versus existente apagada.
  C/D continuam em validação; E/F não iniciados. Indicadores de contexto desta rodada: não disponíveis.
- Verificação desta rodada: formatação de TSX/CSS, tipos do componente, lint, build e diff sem erros passaram. Avaliação de hover,
  rolagem sob o mouse e abandono pela interface permanece com o operador; os 41 testes da entrega anterior não foram reexecutados.

### Segunda rodada de ajustes C/D — 15/09/2026

- Operador aprovou a rolagem que acompanha a memória movida.
- Controles de elevar/rebaixar permanecem agrupados, agora empilhados verticalmente.
- A prévia reserva sempre a altura de três linhas, inclusive quando a largura permitir que o conteúdo ocupe apenas uma ou duas linhas;
  o texto continua recortado nessa altura, sem reticências acrescentadas.
- Criação, edição autorizada e edição restaurada após reload iniciam com foco no campo de memória. A rolagem aprovada foi preservada.
- C/D continuam em validação progressiva; conferir altura estável das caixas em larguras acima e abaixo de 900 px, agrupamento vertical e
  foco inicial. Indicadores de contexto desta rodada: não disponíveis.

### Correção visual da segunda rodada — 15/09/2026

- A captura do operador mostrou que reservar a altura não fazia o conteúdo ocupar três linhas em telas largas. A largura útil do texto da
  prévia foi limitada, mantendo o box externo fluido, para conservar três linhas do cenário longo também no limite largo da Captura do dia.
- O agrupamento vertical passou a neutralizar explicitamente margens horizontais do `has-addons`, igualar largura/altura dos dois botões e
  aplicar arredondamento apenas nos cantos externos superior e inferior. Conferir novamente alinhamento e três linhas no cenário 08/09.
- Conferência no Chrome, viewport de 1051 px, cenário 08/09: prévia com 544 px de largura útil e 81,6 px de altura (três linhas de 27,2 px);
  botões com 40 × 40 px, mesmo eixo horizontal, junção de -1 px e raios externos de 6 px. Resultado visual corrigido; retorno do operador
  sobre esta versão ainda pendente.

### Terceira rodada de ajustes C/D — 15/09/2026

- Operador esclareceu que a prévia deve carregar o texto integral da memória, ocupar toda a largura útil e apenas ocultar o conteúdo que
  exceder três linhas, sem rolagem. Removidas a largura limitada e a altura mínima introduzidas nas rodadas anteriores; permanece somente
  a altura máxima de três linhas. Assim, textos que couberem em uma ou duas linhas não deixam espaço reservado artificialmente.
- A tela de Memória passa a usar exclusivamente o Voltar do header. Nela, esse controle retorna a Registrar e organizar, preserva a posição
  aproximada da lista e aplica a confirmação de abandono quando houver trabalho não confirmado. Na lista, o mesmo controle continua voltando
  à Seleção e encerrando a sessão. Removido o Voltar duplicado da barra da memória; a barra mantém apenas Confirmar Memória quando aplicável.
- C/D continuam em validação progressiva. Conferir texto em larguras variadas, retorno limpo/sujo pelo header e ausência do botão duplicado.
  Indicadores de contexto desta rodada: não disponíveis.

### Ajuste de contexto na reordenação — 15/09/2026

- Revisão confirmou que a correção do texto contínuo alterou somente o conteúdo do cenário visual: `\n\n` foi substituído por espaço.
  Não restaram largura máxima nem altura mínima criadas para compensar a linha vazia; a prévia conserva apenas o recorte necessário de até
  três linhas, com o texto integral no DOM.
- Ao reordenar, a prioridade passa a ser manter visíveis a memória movida, sua antecessora e sua sucessora imediatas, quando existirem e
  couberem juntas na área útil. Manter o botão sob o mouse é uma preferência secundária: a compensação só ocorre se não atingir topo/base da
  rolagem e se as três caixas permanecerem integralmente visíveis depois dela.
- Quando a compensação do mouse não for possível, a página faz apenas o deslocamento mínimo necessário para mostrar o trio. Se o trio não
  couber na viewport, mantém ao menos a memória movida visível. A rotina de retorno à lista foi simplificada separadamente, sem parâmetro de
  vizinho que não era mais utilizado; também foi removido o `focus()` redundante dos botões de ordem.
- Validação no Chrome: ao rebaixar a primeira memória no topo, rolagem permaneceu em zero e antecessora, movida e sucessora ficaram visíveis.
  Em caso intermediário onde o trio cabia após compensação, o botão permaneceu praticamente na mesma coordenada vertical (variação menor
  que 1 px) e as três caixas permaneceram visíveis. As ordens usadas na conferência foram restauradas em seguida.

### Máscara lateral do bloco sticky — 15/09/2026

- Operador aprovou a rolagem contextual e identificou que a sombra Bulma dos boxes ultrapassava lateralmente a largura compartilhada com o
  bloco sticky, aparecendo junto à sua borda enquanto as memórias passavam por trás.
- O fundo opaco do bloco de data/abas foi prolongado apenas 0,75 rem para cada lateral por um pseudo-elemento isolado no mesmo contexto de
  empilhamento. A máscara cobre a projeção lateral durante a passagem sem cortar a sombra normal entre memórias e sem ampliar visualmente a
  linha inferior do bloco. Validação visual desta correção permanece com o operador.

### Passagem para nova sessão — 15/09/2026, após C/D

- Operador informou **78% da capacidade de contexto, 200k de 258k tokens**, e solicitou migração antes de travamento. Indicadores anteriores
  desta sessão estavam indisponíveis; este é o indicador final informado pela interface/operador.
- Base canônica: `develop`, HEAD `8e01b7f`. Trabalho de C/D permanece **sem commit**. Não descartar, resetar, trocar de base nem recompor a
  partir de branch antiga. Estado antes desta passagem:
  - modificados: `.docs/especificacoes/07-registrar-e-organizar.md`, `.docs/referencias/componentes-e-capacidades.md`,
    `.docs/referencias/trabalho-local.md`, `app/servicos/captura/simulado.ts`, `assets/estilos.css`,
    `components/EstruturaCaptura.tsx`, `islands/CapturaDia.tsx`;
  - novos não rastreados: `.docs/adendo-operacional-spec-07.md`, `app/servicos/captura/edicao.ts`,
    `tests/edicao_memoria_test.ts`.
- C/D implementados: inclusão e edição confirmadas somente após commit local; inclusão ao final; confirmação idêntica sem pendência;
  reordenação de uma posição; rascunho isolado em sessionStorage com debounce, reload e autorização preservada; abandono deliberado;
  aviso nativo; foco inicial; retorno aproximado à lista; remoção do andaime `Marcar como alterada`.
- Decisões consolidadas de UI:
  - barra de ações usa somente ícones, `title`, `aria-label` e `buttons has-addons`;
  - cada memória é um box único com hover externo, texto integral no DOM limitado visualmente a no máximo três linhas, sem rolagem e sem
    reticências artificiais; controles de ordem ficam agrupados e empilhados;
  - a tela de Memória usa somente o Voltar do header: retorna à lista com regras de abandono; da lista, Voltar segue para a Seleção;
  - campo de edição não é redimensionável e recebe foco ao criar, editar ou restaurar; nova memória vazia/só com espaços sai sem aviso,
    enquanto edição existente apagada continua protegida;
  - cenário visual 08/09 usa texto contínuo; a única alteração no mock foi trocar `\n\n` por espaço. Cache já materializado pode exigir
    recriação local para receber o texto novo, pois a revisão `layout-B` não foi alterada;
  - rolagem ao mover prioriza antecessora + movida + sucessora visíveis. Manter o botão sob o mouse é secundário e só ocorre quando o trio
    permanece visível e a rolagem não está no topo/base; caso contrário, usa o menor deslocamento que preserve o contexto;
  - máscara lateral de 0,75 rem no fundo do sticky cobre a sombra dos boxes ao passarem por trás.
- Retornos explícitos do operador: marco B e botões aprovados; agrupamento/alinhamento dos botões de ordem aprovado; rolagem contextual ao
  reordenar aprovada; máscara da sombra aprovada (“ficou muito bom”). O restante de C/D teve validação exploratória parcial, sem aceite
  integral dos checklists. Não promover automaticamente C/D a aprovado.
- Evidência técnica acumulada:
  - entrega inicial C/D: formatação, `deno check`, lint, build e `deno test -A tests app`, **41 testes aprovados**, incluindo sete novos;
  - após ajustes visuais/navegação/rolagem: tipos e lint pertinentes e builds repetidos passaram; último build após a máscara passou;
    `git diff --check` passou, com apenas avisos conhecidos de LF/CRLF;
  - Chrome confirmou texto integral recortado após três linhas, foco inicial, único Voltar do header, retorno à lista, botões 40 × 40 px,
    reordenação no topo sem perder vizinhas, compensação intermediária com variação menor que 1 px e máscara da sombra. Ordens usadas nos
    testes foram restauradas. O IndexedDB de desenvolvimento pode continuar pendente/alterado por navegações manuais do operador.
- Limites da validação: os 41 testes não foram reexecutados após ajustes exclusivamente de UI/texto; IndexedDB automatizado permanece em
  memória. Ainda faltam os itens manuais de C/D não reportados, especialmente persistência/reload completo, abandono sujo nos diferentes
  caminhos, aviso nativo, falha simulada de gravação e reflexo de pendência na Seleção/Principal.
- Próxima ação: retomar pela validação curta restante de C/D e registrar o retorno. Só depois avançar progressivamente a **E — historicidade
  e complementos** e **F — exclusão regressiva**. G/H continuam pendentes, inclusive concorrência real, CMP-005 nos três níveis e passagem
  integrada. Não implementar E/F antes de ler seus checklists no corpo aprovado e conferir se surge alguma lacuna funcional nova.
- Documentos obrigatórios na retomada: `AGENTS.md`, `.docs/README.md`, `.docs/memoria-tecnica.md`,
  `.docs/referencias/trabalho-local.md`, esta Especificação 07 integral e `.docs/adendo-operacional-spec-07.md`. Não consultar Drive nem
  outras Especificações.

### Retomada da validação C/D — 17/09/2026

- Acesso e Git conferidos: `develop`, HEAD `8e01b7f`, com os mesmos sete arquivos modificados e três novos da passagem após C/D.
  Trabalho sem commit preservado integralmente; nenhuma troca de base ou recomposição de outra branch.
- Lidos AGENTS, índice, memória técnica, referência de trabalho local, adendo operacional e esta Especificação integral.
  A passagem após C/D prevalece sobre os estados anteriores registrados no adendo e nesta Continuidade.
- Operador reiterou os aceites de B/barra de ícones, botões de ordem empilhados/alinhados, rolagem contextual e máscara lateral do sticky.
  Reiterou também que a exploração de C/D não representa aceite integral dos checklists.
- Não há nova dúvida funcional para a validação pendente. Plano: receber retorno da passagem manual curta de C/D, corrigir eventuais
  falhas e registrar resultados; depois desenvolver E progressivamente e validar antes de F. G/H não serão antecipados.
- Etapa corrente: aguardando retorno manual de persistência de conteúdo/ordem após reload, rascunho sem alteração do confirmado,
  abandono sujo e não restauração após descarte, aviso nativo, falha simulada de confirmação/reordenação e pendências na Seleção/Principal.
  O procedimento de falha existente foi conferido contra os chamadores atuais de `capturasLocais.gravar`; ainda requer execução no navegador.
- Nenhum fonte alterado nesta retomada; testes anteriores não reexecutados. Itens de exclusão do checklist D continuam reservados a E/F.
- Indicadores de contexto antes das leituras, após leitura inicial antes do fonte e nesta entrega: não disponíveis; sem estimativa.

### Aceite da passagem curta C/D e início de E — 17/09/2026

- Retorno do operador: “Testes realizados e tudo ocorreu conforme descrito.” Aceitos os cinco grupos apresentados nesta retomada:
  persistência de conteúdo/ordem, rascunho e reload, abandono deliberado, falha simulada com nova tentativa e reflexo das pendências.
  O retorno inclui o aviso nativo e os caminhos de abandono do roteiro. Não estende o aceite a G/H ou aos itens de exclusão ainda não implementados.
- Etapa corrente: E — historicidade e complementos. Implementar leitura histórica integrada e edição do último complemento,
  estender confirmação/rascunho com identidade do alvo e conservar autorização no reload; verificar e apresentar roteiro E antes de F.
- Nova mensagem de falha de complemento submetida ao operador; implementação desse texto aguarda resposta. Demais regras funcionais
  de E estão descritas no corpo aprovado e na clarificação anterior, inclusive datas no calendário local e prazo em horas exatas.

### Entrega E — historicidade e complementos — 17/09/2026

- Mensagem aprovada pelo operador: “Não foi possível confirmar o complemento. Seu texto continua nesta tela. Tente novamente.”
- Memória histórica integra complementos em sequência, com data local da primeira preservação. Último complemento dentro do prazo ou
  nunca preservado abre em campo próprio de quatro linhas; enquanto houver edição autorizada, não oferece outro complemento.
- Adicionar complemento cria somente rascunho. Confirmação válida publica o resultado após commit, mantém IDs/primeira preservação/revisão
  e retorna à lista; confirmação idêntica não grava. Prazo compartilhado é decidido na abertura, sem recálculo na confirmação.
- Rascunho distingue memória/complemento e conserva autorização no reload. Mantidos abandono, aviso nativo, foco, barra somente de ícones
  e retorno ao contexto da memória. Inclusão já confirmada ou cadeia de complementos incompatível não restaura rascunho obsoleto.
- Verificação: formatação dos fontes/CSS alterados, `deno check`, lint pertinente, build e `deno test -A tests app` passaram: **45 testes**,
  incluindo quatro novos casos de complementos. Testes de armazenamento usam memória; leitura, foco e comportamento visual aguardam operador.
- Etapa corrente: E implementado e tecnicamente verificado, aguardando validação manual abaixo antes de F. F/G/H não implementados nesta rodada.
  Os itens de exclusão de D continuam pendentes de F. Indicadores de contexto desta entrega: não disponíveis.

#### Roteiro manual E

Em desenvolvimento, no console de uma Captura do dia, configurar uma data sem pendência local. O exemplo usa 11/09/2026;
se já houver trabalho alterado nessa data, trocar a data do comando, sem apagar esse trabalho. Depois abrir a data pela Seleção.

```js
var agoraE = Date.now()
var horasE = (horas) => new Date(agoraE - horas * 3600000).toISOString()
rememoreCaptureMock.configure("2026-09-11", {
  status: "found", revision: "historicidade-E-1", editWindowDays: 3,
  memories: [
    { id: "E-local", content: "Nunca preservada: deve permitir editar.", order: 0,
      firstPreservedAt: null, complements: [] },
    { id: "E-recente", content: "Preservada há 24 horas: deve permitir editar.", order: 1,
      firstPreservedAt: horasE(24), complements: [] },
    { id: "E-historica", content: "Memória histórica: texto principal somente leitura.", order: 2,
      firstPreservedAt: horasE(240), complements: [
        { id: "E-c1", content: "Primeira percepção histórica.", firstPreservedAt: horasE(168) },
        { id: "E-c2", content: "Segunda percepção histórica.", firstPreservedAt: horasE(96) }
      ] },
    { id: "E-complemento", content: "Memória histórica com complemento recente.", order: 3,
      firstPreservedAt: horasE(240), complements: [
        { id: "E-c3", content: "Percepção histórica anterior.", firstPreservedAt: horasE(96) },
        { id: "E-c4", content: "Complemento editável, preservado há 24 horas.", firstPreservedAt: horasE(24) }
      ] }
  ]
})
```

- [ ] As duas primeiras memórias são editáveis, sem Adicionar complemento. A terceira apresenta texto principal e dois complementos
  somente leitura, em sequência, com datas locais corretas; a quarta mantém principal/primeiro complemento em leitura e só o último editável.
- [ ] Na terceira, Adicionar complemento abre campo de quatro linhas e Confirmar Complemento; vazio/espaços não confirmam.
  Digitar não muda o IndexedDB. F5 restaura texto; Voltar permite conservar ou descartar sem ressuscitar o descarte.
- [ ] Confirmar complemento válido retorna à região da memória na lista. Reabrir oferece edição daquele complemento nunca preservado,
  sem data histórica inventada e sem Adicionar complemento. Conteúdo persiste após reload; principal e anteriores permanecem intactos.
- [ ] Na quarta, editar/confirmar conserva primeira preservação do complemento. Confirmação idêntica não altera a captura limpa;
  conferir esse caso antes de confirmar qualquer alteração na data. Reordenar memórias históricas continua possível.
- [ ] Repetir a injeção de falha C/D na confirmação do complemento: mensagem aprovada, texto e rascunho mantidos, nenhum falso sucesso;
  restaurar `gravar` e confirmar novamente. Conferir a leitura/campo/barra também em largura móvel.

Para atravessar o prazo sem esperar 72 horas, usar outra data sem pendência (exemplo 12/09/2026). Executar o comando abaixo e abrir
imediatamente a primeira memória; o limite chega dois minutos após executar. A segunda memória testa a mesma fronteira no complemento.

```js
var limiteE = Date.now() + 120000
var primeiraE = new Date(limiteE - 72 * 3600000).toISOString()
rememoreCaptureMock.configure("2026-09-12", {
  status: "found", revision: "limite-E-" + limiteE, editWindowDays: 3,
  memories: [
    { id: "E-limite-m", content: "Abrir antes do limite e manter a edição.", order: 0,
      firstPreservedAt: primeiraE, complements: [] },
    { id: "E-limite-c", content: "Principal histórica para testar o limite do complemento.", order: 1,
      firstPreservedAt: new Date(limiteE - 240 * 3600000).toISOString(), complements: [
        { id: "E-limite-ultimo", content: "Complemento no limite.", firstPreservedAt: primeiraE }
      ] }
  ]
})
console.info("Limite do cenário:", new Date(limiteE).toLocaleTimeString())
```

- [ ] Abrir antes do limite, digitar e manter aberta até depois do horário: continua confirmável. F5 depois do limite conserva texto e
  autorização. Confirmar e reabrir: texto confirmado em leitura, primeira preservação inalterada; Adicionar complemento disponível.
- [ ] Repetir para a segunda memória com novo cenário/data limpa e novo limite. Somente o complemento permanece autorizado durante a
  sessão; após confirmar/sair e reabrir fora do prazo, ele integra a leitura histórica. Não mudar timestamps de um workspace alterado
  pelo mock: a prioridade do trabalho local impede essa substituição. A variável de três dias é a mesma nos dois testes.

Os testes técnicos exercitam também nunca preservado após longa permanência, limite exato em milissegundos e mudança do prazo compartilhado.
Não há preservação real nesta unidade: conservação do timestamp em confirmação local não equivale a teste de backend.

### Cenário direto de complementos históricos — 17/09/2026

- A pedido do operador, acrescentado cenário padrão exclusivo de desenvolvimento para **13/09/2026**, revisão
  `complementos-historicos-E-1`: uma memória preservada em 13/09 às 12h UTC, com dois complementos preservados em 13/09 às 13h UTC
  e 14/09 às 03h UTC, ambos há mais de 72 horas nesta sessão. Datas exibidas seguem o calendário local do navegador.
- Abrir 13/09 pela Seleção e clicar na memória para conferir texto principal e dois complementos somente leitura, com datas e sequência.
  Não precisa configurar o console. Configuração manual anterior do mock e trabalho local alterado continuam tendo prioridade;
  nenhum workspace existente foi apagado ou sobrescrito. Esta preparação não representa aceite do item 4 de E.

### Retorno de E e início de F — 17/09/2026

- Operador informou “Ok, testato, informe a próxima parte e pode executar.” após o cenário direto de dois complementos históricos.
  Registrado aceite desse cenário de leitura e autorização explícita para avançar a F. Os demais itens de E não receberam resultados
  individuais nesta resposta; preservar essa distinção, sem declarar automaticamente aceite integral do checklist.
- Etapa corrente: F — exclusão regressiva. Implementar lixeira contextual e confirmações do corpo aprovado; remover somente o último
  complemento ou, na ausência de complementos, a memória. Bloquear criação/edição suja, aguardar commit e retornar à lista com contexto.
- Verificar cadeia regressiva, preservação dos elementos anteriores, falha de gravação e bloqueio de edição suja; depois apresentar
  checklist F ao operador. G/H permanecem fora desta rodada. Nova mensagem de falha de exclusão submetida ao operador.
- Git conferido e trabalho sem commit preservado na develop. Indicadores de contexto nesta rodada: não disponíveis.

### Integração da lixeira F — 17/09/2026

- Operador observou ausência da lixeira durante o início de F. Esclarecido que a versão de E ainda não a incluía.
  Agora integrada à barra de ícones com `danger`, `title` e nome acessível conforme alvo; criação ou edição suja a mantém desabilitada.
- Serviço `excluirUltimoElemento` remove um complemento por vez; só remove a memória quando não houver complementos. Confirmações usam
  os textos exatos do corpo aprovado. Após commit, retorna à lista próximo da memória ou de uma vizinha quando a memória foi removida.
- Tipos, lint, formatação, build e 14 testes de edição/exclusão passaram. Não houve validação visual do operador desta versão.
- F permanece em andamento: falta integrar a mensagem de falha, ainda aguardando resposta à proposta
  “Não foi possível excluir. O conteúdo da captura foi mantido. Tente novamente.” A cadeia de falha do serviço conserva o agregado;
  o tratamento visual dessa rejeição ainda não está concluído. Não considerar F entregue nem executar seu checklist de falha ainda.
- G/H não iniciados; trabalho permanece sem commit. Indicadores de contexto: não disponíveis.

### Entrega F — exclusão regressiva — 17/09/2026

- Operador aprovou a mensagem: “Não foi possível excluir. O conteúdo da captura foi mantido. Tente novamente.”
  Integrado o tratamento visual: falha mantém tela, conteúdo confirmado e rascunho, informa o erro e permite nova tentativa.
  Esta entrega supera a pendência de tratamento de falha da anotação anterior.
- Exclusão só publica o novo agregado após commit sob a posse existente. Não há remoção remota, exclusão em cascata ou lixeira na lista.
  Edição suja continua bloqueando exclusão mesmo se o texto for manualmente devolvido ao original; confirmar ou abandonar encerra a edição.
- Verificações acumuladas de F: tipos, lint, formatação, build e 48 testes passaram antes da integração final da mensagem;
  tipos, lint, formatação e build do tratamento final também passaram. Os 48 testes não foram repetidos por essa alteração de mensagem;
  os testes de armazenamento são em memória. Avaliação manual segue abaixo.
- Etapa corrente: validação F pelo operador. G/H permanecem pendentes e não foram antecipados. Sem commit ou encerramento da 07;
  indicadores de contexto desta entrega não disponíveis.

#### Roteiro manual F

Usar a memória de **13/09/2026** já testada, com dois complementos históricos (e C3, caso tenha sido confirmado).

- [ ] Com edição limpa, a lixeira mostra `Excluir último complemento`; abrir a confirmação e cancelar mantém todos os elementos.
- [ ] Confirmar exclui somente o último complemento e mantém a tela da memória: principal e anteriores permanecem; repetir até não
  restarem complementos. Recarregar confirma a persistência da remoção e a captura continua pendente na Seleção/Principal.
- [ ] Sem complementos, a lixeira muda para `Excluir Memória`, com a confirmação específica. Cancelar conserva; confirmar remove apenas
  essa memória e retorna à região anterior da lista. O acervo remoto simulado permanece intacto.
- [ ] Memória/complemento existente sem edição permite exclusão; digitar desabilita a lixeira. Confirmar ou abandonar e reabrir restabelece
  a ação adequada. Nova memória e novo complemento ainda não confirmados deixam a lixeira desabilitada, inclusive quando vazios.
- [ ] Antes de consumir a cadeia inteira, simular falha com os comandos abaixo. A confirmação de exclusão deve apresentar a mensagem
  aprovada, conservar o elemento e permitir nova tentativa após restaurar a gravação. Repetir para memória sem complementos.
- [ ] Na lista longa, excluir uma memória de teste no meio e conferir retorno próximo de uma vizinha, sem perder todo o contexto.

No console da Captura do dia, somente em desenvolvimento:

```js
var repositorioF = (await import("/app/servicos/local/capturas.ts")).capturasLocais
var gravarF = repositorioF.gravar
repositorioF.gravar = async () => { throw new Error("Falha simulada de gravação F") }
```

Não recarregar entre injeção e tentativa. Depois do teste, restaurar antes de tentar novamente:

```js
repositorioF.gravar = gravarF
```

Este procedimento simula rejeição na fronteira de gravação, não quota real. Os testes e aceites anteriores continuam registrados;
o presente roteiro não declara aprovação integral de E, F, G ou H.

### Permanência na memória após excluir complemento — 17/09/2026

- Alteração funcional solicitada pelo operador: excluir complemento mantém a tela da memória aberta, atualizando conteúdo e ação
  destrutiva. Somente excluir a memória retorna à lista. Esta decisão substitui o retorno à lista após exclusão de complemento
  previsto no corpo aprovado e nas entregas anteriores; corpo aprovado preservado.
- Após commit, o rascunho acompanha o estado restante. A edição principal mantida conserva sua autorização; se o complemento em edição
  foi removido, a abertura do alvo restante decide sua autorização. Falha continua mantendo conteúdo/tela com a mensagem aprovada.
- Validar: excluir complementos sucessivamente sem sair da tela; sem complementos, a lixeira muda para Excluir Memória;
  excluir a memória retorna à lista. Conferir também reload após remover complemento. G/H permanecem pendentes.
- Indicadores de contexto: não disponíveis. Trabalho sem commit preservado.

### Aceite do retorno de exclusão e orientação inicial — 17/09/2026

- Operador aprovou o funcionamento após a alteração de navegação da exclusão e informou ausência das mensagens por nível na captura vazia.
  Aceite registrado para esse funcionamento; não presume resultados de todos os testes de falha de F.
- Conferido que CMP-005 existia somente na Seleção. Por esta solicitação, integrada a parte de Orientação Progressiva de G na Captura
  do dia: os três textos exatos da seção 5, com nível ainda simulado em `app/servicos/orientacao.ts` (atualmente `beginner`).
- Exibir somente em Registrar e organizar, sem memória aberta, com composição vazia, limpa e origem remota ausente.
  Captura vazia após exclusões continua alterada e não reapresenta orientação. Não há nova regra funcional nem cálculo real de nível.
- Validar numa data nova sem pendência/conteúdo remoto: mensagem iniciante; confirmar primeira memória remove a mensagem; excluir a
  memória não a traz de volta. Para os outros níveis, alterar `nivelSimulado` para `intermediate` e `advanced` e abrir data genuinamente nova.
  Os três níveis e os demais cenários do checklist CMP-005 ainda precisam de retorno manual. Concorrência de G e integração H não antecipadas.
- Verificação desta integração: formatação dos fontes, tipos dos consumidores, lint, build e diff sem erros passaram.
- Trabalho sem commit preservado. Indicadores de contexto: não disponíveis.

### Retorno da orientação e pendência para o analista — 17/09/2026

- Operador confirmou que a orientação funcionou. Este retorno valida o cenário observado, sem declarar teste dos três níveis.
- Determinação expressa: as mensagens de orientação precisarão ser revisadas pelo analista; não revisar seus textos nesta unidade agora.
  Ao redigir o Parecer final no encerramento, incluir explicitamente essa pendência, de forma autossuficiente para o analista.
- Próxima etapa: concluir a validação de G, especialmente concorrência real entre abas e cenários/níveis ainda não reportados do CMP-005.
  Depois, H — passagem integrada e verificações finais, retomando eventuais itens de E/F ainda não detalhados. Encerramento depende do operador.
  Nenhuma dessas validações foi executada ou aprovada por esta anotação.

### Validação G autorizada — 17/09/2026

- Operador autorizou prosseguir com G. Conferidos os contratos atuais de bloqueio/sessão e os cenários do CMP-005.
  Os cinco testes de `tests/sessao_captura_test.ts` passaram nesta rodada; usam gerenciador/Storage simulados e não substituem duas abas reais.
- Cadência: primeiro concorrência real no mesmo navegador/conta; depois condições da orientação e níveis intermediário/avançado,
  alternados pelo programador no mock existente. Sem novos controles no produto e sem revisão das mensagens.
- Roteiro de concorrência para o operador:
  1. Na aba A, abrir uma captura de teste com memória confirmada e permanecer nela.
  2. Na aba B, usando a mesma conta e origem da aplicação, abrir a mesma data: deve informar que está aberta em outra aba/janela,
     sem permitir editar ou gravar. Não usar janela anônima ou outro perfil, pois não compartilham o mesmo ambiente local.
  3. Recarregar A: deve retomar normalmente. Recarregar B: deve continuar bloqueada enquanto A estiver aberta.
  4. Na aba B, abrir outra data pela Seleção: deve funcionar, mantendo A disponível na data original.
  5. Voltar B à data original: bloqueio. Fechar A sem edição suja; recarregar B: deve abrir e conservar a memória confirmada.
- Depois, validar orientação: data nova apresenta mensagem; primeira confirmação a remove; apagar a última memória não a reapresenta;
  data preservada também não mostra orientação de começo. Nível atual permanece iniciante até a próxima rodada.
- Etapa corrente: aguardando resultados manuais de concorrência. A aprovação da orientação já observada permanece registrada;
  níveis intermediário/avançado e demais condições ainda não detalhados. H só depois da passagem necessária de G.
- Indicadores de contexto: não disponíveis. Nenhum fonte alterado nesta preparação; trabalho sem commit preservado.

### Aceite da concorrência e validação do nível intermediário — 17/09/2026

- Operador confirmou “Funcionamento ok, pode seguir.” para os cinco passos de concorrência real apresentados: bloqueio da mesma
  conta/data em B, reload de A sem falsa concorrência, B ainda bloqueada, datas diferentes permitidas e recuperação após fechar A.
- Alterado somente `nivelSimulado` para `intermediate` no mock existente do CMP-005. Textos preservados, conforme pedido de revisão
  futura pelo analista. Conferir Seleção e início de uma captura genuinamente nova; não usar data alterada que ficou vazia por exclusões.
- Esperado na Captura do dia: “Registre uma lembrança por vez. Memórias mais focadas ajudam a reencontrar melhor cada contexto depois.”
  Na Seleção: “Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.”
- Etapa corrente: aguardando validação do nível intermediário; depois alternar para avançado e restaurar o nível inicial após os testes.
  H permanece pendente. Trabalho sem commit preservado; indicadores de contexto não disponíveis.

### Retomada do nível intermediário — 18/09/2026

- Conferidos develop, HEAD `8e01b7f`, trabalho sem commit preservado e mock em `intermediate`.
- A checagem anterior havia sido impedida pelo limite de uso da ferramenta após aplicar a alteração. Retomada agora:
  `deno check app/servicos/orientacao.ts` passou. Nenhuma mudança adicional de fonte nesta retomada.
- Aguardando retorno manual das mensagens intermediárias na Seleção e numa captura genuinamente nova; depois testar avançado.
  Pendência de revisão editorial das mensagens pelo analista permanece para o Parecer final. Indicadores de contexto não disponíveis.

### Posição da orientação na Seleção — 18/09/2026

- Por solicitação do operador, a mensagem CMP-005 na Seleção de Captura passa a aparecer abaixo do botão Capturar, após o formulário.
  Texto e regra por nível preservados; nível intermediário continua ativo para validação.
- Retorno posterior do operador: preferiu a posição anterior. Mensagem restaurada acima do formulário; a mudança de posição foi revertida
  e não constitui diferença final a reportar no Parecer.
- Trabalho sem commit preservado; indicadores de contexto não disponíveis.

### Validação do nível avançado — 18/09/2026

- Operador aprovou a posição restaurada da orientação acima do formulário e autorizou avançar para o próximo nível.
  Não foram detalhados separadamente os resultados das duas mensagens intermediárias.
- Mock CMP-005 alterado de `intermediate` para `advanced`, sem mudar textos. Esperado: nenhuma orientação na Seleção;
  numa captura genuinamente nova, “Observe detalhes que normalmente passariam despercebidos: uma conversa, uma sensação, uma pequena mudança.”
- Etapa corrente: aguardar retorno do nível avançado, depois restaurar `beginner` e conduzir H. A revisão editorial das mensagens
  continua reservada ao analista no Parecer final. Trabalho sem commit preservado; indicadores de contexto não disponíveis.

### Aceite do nível avançado e preparação de H — 18/09/2026

- Operador confirmou “Tudo certo” para ausência de orientação na Seleção e mensagem avançada na captura nova/vazia.
  Restaurado `nivelSimulado` para `beginner`, conforme a cadência combinada; textos preservados.
- Próxima etapa: H — passagem integrada do roteiro do corpo aprovado, incluindo criação, ordem, edição, reload, complementos,
  exclusão regressiva com permanência na memória, pendências, falhas e cascas futuras. Reconciliar os itens manuais ainda sem relato
  individual, especialmente prazo/reload de E e falha de exclusão de F, sem presumir cobertura pelo aceite dos níveis.
- Após retorno manual, concluir verificações técnicas finais e aguardar determinação do operador para encerramento e Parecer final.
  O Parecer deverá mencionar a revisão das mensagens pelo analista e a mudança de navegação após exclusão de complemento.
- H ainda não validado; nenhum encerramento ou commit realizado. Indicadores de contexto não disponíveis.

## Parecer final

Especificação 07 encerrada em **18/09/2026**, por determinação e aceite global do operador.

Foi materializado Registrar e organizar em `/capturar/{data}`, com `CapturaDia`, `EstruturaCaptura` e `PainelCaptura`: estrutura sticky,
três abas, lista com prévia de até três linhas, inclusão, edição, ordem física, leitura histórica, complementos e exclusão regressiva.
As operações reais confirmadas no IndexedDB geram pendências na Seleção e Principal; o controle temporário Marcar como alterada foi removido.

A abertura reutiliza cache limpo por existência/revisão e prioriza trabalho local alterado. Reload mantém a mesma sessão, sem consulta remota;
nova entrada revalida o limpo. Memória e complemento compartilham o prazo de três dias (72 horas desde a primeira preservação), com autorização
decidida ao abrir e conservada no reload da edição. `sessionStorage` protege somente rascunhos, sem criar pendência; abandono deliberado
descarta a edição transitória. Bloqueio por conta/data impede edição simultânea no mesmo ambiente. Falhas locais mantêm o estado confirmado.

Decisões finais relevantes para reconciliação documental:

- **Excluir complemento mantém a tela da memória aberta**, atualizando leitura e ações. Somente excluir a memória retorna à lista.
  Esta alteração foi solicitada e aprovada pelo operador, substituindo o retorno à lista após exclusão de complemento previsto no corpo.
- Ações superiores usam somente ícones, agrupados, com descrição e nome acessível. A tela de Memória usa exclusivamente o Voltar do header.
  Nova criação vazia/só com espaços dispensa aviso de abandono; conteúdo existente apagado continua protegido.
- Prévia usa o fallback de até três linhas, sem degradê, rolagem interna ou reticências artificiais. Botões de ordem ficam empilhados;
  rolagem prioriza a memória movida e suas vizinhas, mantendo o botão sob o mouse somente quando esse contexto não for perdido.
- CMP-005 aparece apenas na captura genuinamente nova, vazia, limpa e remotamente ausente; não reaparece após exclusões.
  **As mensagens de orientação precisarão ser revisadas pelo analista.** Por determinação do operador, essa revisão não foi feita aqui.
  Os textos atuais foram mantidos, com nível ainda simulado e restaurado para iniciante. Na Seleção, a orientação permanece acima do formulário.

Verificação final: tipos, lint, formatação dos fontes/estilos alterados, build e **48 testes aprovados**, além dos retornos manuais progressivos
e aceite global do operador. Os testes automatizados de armazenamento/locks usam simulações e não comprovam quota real ou proteção absoluta
contra encerramentos abruptos. O aceite global não constitui registro individual de execução de todos os itens dos checklists.

Categorizar e Tom e Revisar e Preservar permanecem abas estruturais. Backend, preservação remota, conflitos, cálculo real do nível,
sincronização e política de limpeza/TTL não foram implementados. O schema local vigente é 4, com campos PT-BR e contratos remotos preservados;
a revisão de origem permanece disponível para a futura preservação. A próxima unidade será definida pelo operador.

Parecer entregue localmente ao operador; não houve atualização do Google Drive. Trabalho mantido sem commit na `develop`, HEAD `8e01b7f`.
