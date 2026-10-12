# 05 - Fundação do Trabalho Local

## Estado
Quinta unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar a Fundação do Trabalho Local do Rememore. A partir desta aprovação, o corpo permanece como registro histórico imutável da unidade e somente poderá receber Parecer final quando o operador encerrar o desenvolvimento.

## Objetivo
Criar a infraestrutura local persistente do Rememore sobre IndexedDB, preparada para atender Capturar e, posteriormente, outras jornadas que necessitem de estado, continuidade ou cache local. Esta unidade deve estabelecer disponibilidade operacional, abertura e evolução do banco, object stores, chaves, índices, operações, transações e contrato de falhas, além de materializar um primeiro object store mínimo de capturas locais suficiente para provar a fundação.

## Posição no ciclo de materialização
05.04 - Ambiente Principal já materializou o hub autenticado, as cascas protegidas das jornadas e um indicador de capturas pendentes ainda mockado. Esta unidade não altera essas páginas: cria a fundação real que poderá ser consumida pelas próximas especificações.

O ciclo previsto de Capturar segue, no momento, esta direção: Fundação do Trabalho Local; Seleção; casca e abertura da Captura do dia; Registrar e organizar; Categorizar; Tom; Revisar e Preservar; integração real das pendências à Principal; cenários transversais. Essa sequência existe apenas para dar contexto de continuidade. Cada unidade posterior permanece sujeita a refinamento após o resultado da anterior.

A Fundação do Trabalho Local é transversal ao produto. Capturar é seu primeiro consumidor concreto, mas a infraestrutura deve permitir que Rememorar, Encontrar Memórias, Rever um Dia e outras jornadas acrescentem futuramente seus próprios object stores, índices, chaves e operações sem reestruturar o núcleo do banco.

## Rastreabilidade histórica — não operacional
Esta unidade deriva historicamente de decisões consolidadas anteriormente no projeto, principalmente em **02.05 - Modelo de Trabalho e Continuidade**, em conjunto com a base tecnológica de **04.01 - Fundação do Front** e com as definições de Capturar presentes em **02.03 - Captura e Evolução das Memórias** e **04.06 - Especificação Funcional - Capturar**. Essas referências existem apenas para rastreabilidade documental e não constituem leitura, conhecimento prévio nem dependência para o programador. Todo o contexto necessário à implementação está contido nesta especificação.

## Princípios
O banco local representa a fonte da verdade do trabalho em elaboração. O servidor representa a fonte da verdade do acervo preservado. Esta unidade materializa apenas a fundação do primeiro; não implementa preservação, sincronização ou resolução de conflito com o servidor.

A infraestrutura pertence ao Rememore, não a uma página específica. Páginas e domínios não devem precisar conhecer diretamente os detalhes de abertura, versionamento, upgrade, transação ou diagnóstico do IndexedDB.

O desenho deve favorecer crescimento incremental. Novos domínios poderão acrescentar object stores próprios e os stores existentes poderão receber novos índices, chaves ou estruturas conforme suas especificações futuras. Não deve ser criado um object store genérico único destinado a armazenar qualquer domínio como pares arbitrários de tipo, chave e conteúdo serializado.

## Tecnologia e responsabilidade técnica
IndexedDB é a tecnologia local prevista para esta fundação, conforme a Fundação do Front já consolidada. A nomenclatura concreta do banco, object stores, índices, módulos, classes, funções, tipos e arquivos fica a critério do programador.

A solução deve separar conceitualmente a infraestrutura geral do banco das operações específicas de cada domínio. A infraestrutura conhece IndexedDB, versão, schema, transações e erros; os serviços ou repositórios de domínio conhecem a estrutura e o significado de seus próprios dados. As páginas não devem espalhar acesso direto ao IndexedDB.

## Disponibilidade operacional
A fundação deve oferecer uma capacidade reutilizável para determinar se o armazenamento local necessário ao Rememore está operacional no ambiente atual.

A simples existência da API IndexedDB não é verificação suficiente. O diagnóstico deve ser capaz de preparar ou abrir o banco e comprovar uma operação válida do mecanismo de persistência, sem criar lixo funcional nem alterar capturas existentes.

O resultado deve permitir ao consumidor distinguir, no mínimo, armazenamento operacional, recurso não suportado pelo ambiente e recurso existente porém inacessível ou com falha operacional. A nomenclatura técnica e a representação desse resultado ficam a critério do programador.

Essa verificação não apresenta mensagens, não redireciona o usuário e não decide o comportamento de nenhuma jornada. As páginas ou fluxos futuros utilizarão a capacidade e definirão sua própria reação. A Área Principal será revisitada posteriormente para consumir essa verificação antes de permitir acesso a recursos que dependam do trabalho local.

Uma verificação positiva também não transforma as operações posteriores em infalíveis. Permissões podem mudar, o armazenamento pode ser limpo ou manipulado, uma transação pode falhar e o banco pode se tornar inconsistente durante o uso. Toda operação posterior continua obrigada a reportar seu próprio sucesso ou falha.

## Banco, schema e evolução
O banco deve possuir versionamento explícito de schema e um mecanismo central de evolução capaz de criar e alterar object stores, chaves e índices ao longo do desenvolvimento.

A estrutura deve permitir adicionar migrações futuras sem reescrever o mecanismo central de abertura do banco. A forma concreta de organizar versões e migrações é decisão técnica, desde que a evolução permaneça compreensível, determinística e extensível.

Durante a fase de desenvolvimento anterior à V1 do Rememore, migrações podem ser destrutivas e não existe obrigação de preservar dados de desenvolvimento entre mudanças de schema. Não deve ser gasto esforço mantendo compatibilidade com estados experimentais sem valor funcional.

A arquitetura, porém, deve nascer apta a suportar migrações preservadoras. A partir da futura V1, quando dados locais passarem a poder representar trabalho real que não pode ser perdido, a regra será que evoluções de schema preservem os dados anteriores sempre que tecnicamente possível e nunca recorram silenciosamente a apagar e recriar o banco como estratégia normal de upgrade. A implementação dessa política definitiva será consolidada quando a V1 for preparada.

## Operações e transações
A fundação deve encapsular as operações básicas disponibilizadas pelo IndexedDB para seus object stores, permitindo ao menos criação ou substituição de registros, leitura, remoção e consultas por índices conforme o store declarar.

Um resultado vazio legítimo deve permanecer diferente de uma falha de operação. Erro de leitura não pode ser convertido em lista vazia; erro de gravação não pode ser apresentado como sucesso; erro de remoção não pode ser tratado como ausência do registro.

As operações devem respeitar a atomicidade das transações do IndexedDB e devolver sucesso somente depois da conclusão efetiva da transação correspondente.

Nesta unidade basta materializar as transações necessárias às operações atuais. A arquitetura não deve, porém, impedir transações futuras que envolvam vários object stores na mesma unidade atômica, pois esse uso será necessário em etapas posteriores.

## Contrato de falhas e recuperação
Falhas de abertura, upgrade, leitura, escrita, remoção, consulta ou transação devem ser propagadas de forma explícita e consistente ao consumidor. A fundação não deve mascarar falhas com valores funcionais aparentemente válidos.

O contrato de erro deve fornecer informação suficiente para que o consumidor interrompa a operação em andamento e execute uma ação segura. Nas jornadas futuras, falhas durante o uso do trabalho local poderão ser informadas ao usuário e conduzi-lo de volta à Área Principal em vez de manter uma interface operando sobre estado não protegido ou desconhecido.

A Área Principal será revisitada posteriormente para definir a experiência de nova verificação, preparação do banco, execução de migrações e recuperação de situações de inconsistência ou corrupção, inclusive eventual recriação quando essa for uma ação segura e deliberadamente definida. Esta unidade fornece a capacidade técnica e os erros necessários para esse fluxo, mas não implementa a interface nem a política de recuperação da Principal.

## Primeiro domínio: capturas locais
A fundação deve criar o primeiro object store real, destinado às capturas locais. Ele existe para provar a infraestrutura e fornecer uma base evolutiva às próximas unidades; não representa ainda a implementação funcional de Registrar e organizar.

A unidade funcional de uma captura local é a combinação de conta e data no ambiente atual. O próprio armazenamento local já delimita o ambiente ou dispositivo; não é necessário introduzir nesta unidade um identificador artificial de dispositivo, salvo necessidade técnica concreta encontrada durante a implementação.

Deve existir no máximo um registro de captura local para a mesma conta e data. A estrutura precisa permitir recuperar uma captura específica por conta e data e consultar eficientemente as capturas pertencentes a uma conta, preservando isolamento entre usuários diferentes que utilizem o mesmo ambiente.

A existência de um registro neste store representa trabalho local pendente para aquela conta e data. Apenas abrir ou consultar uma data não cria registro. O nascimento funcional da pendência e as operações de produto que a provocam serão materializados nas especificações posteriores.

## Estrutura mínima da captura
A captura é um agregado da data e contém uma composição ordenada de memórias.

Para esta primeira versão, cada memória precisa apenas de identidade local estável, conteúdo e ordem persistida fisicamente como dado próprio. A identidade não pode depender da ordem nem do conteúdo, pois ambos podem mudar. A escolha técnica do identificador fica a critério do programador.

A ordem é parte explícita dos dados persistidos e não deve existir somente como posição eventual em um array ou resultado de consulta.

Essa estrutura é deliberadamente incompleta. Historicidade, origem remota, regras de edição, exclusão física ou lógica, complementos, categorias, Tom, balanço sentimental, metadados de preservação e demais campos serão acrescentados quando as unidades que realmente os utilizam forem especificadas.

Categorias não pertencem ao agregado de uma data e futuramente possuirão estrutura própria agregada pela conta. Nenhum object store de categorias deve ser criado nesta unidade; a fundação deve apenas demonstrar que um novo store desse tipo poderá ser acrescentado posteriormente pela evolução normal do schema.

## CRUD inicial de Capturas
O primeiro domínio deve expor apenas as operações mínimas necessárias para exercitar a fundação: criar ou substituir uma captura, recuperar uma captura por conta e data, remover uma captura por conta e data e consultar as capturas de uma conta pelo índice adequado.

Essas operações são infraestrutura inicial para validação. As regras que decidirão quando criar, modificar, excluir, reordenar ou manter uma captura pertencem às próximas especificações e não devem ser inventadas nesta unidade.

## Validação de desenvolvimento
Testes automatizados podem e devem ser usados como ferramenta temporária de desenvolvimento desta fundação quando ajudarem a reduzir retrabalho e tornar falhas técnicas mais fáceis de localizar. O objetivo não é estabelecer cobertura permanente nem criar obrigação de manutenção de uma suíte unitária. Testes criados apenas como andaime podem ser removidos ao final da unidade.

A implementação deve demonstrar, por testes automatizados temporários e/ou cenários técnicos equivalentes, pelo menos: criação e abertura do banco; reabertura de banco existente; CRUD básico do store de capturas; consulta por conta; isolamento entre contas; remoção sem afetar outros registros; distinção entre consulta vazia e falha; detecção de indisponibilidade operacional; e evolução de versão capaz de acrescentar ou alterar estrutura de schema.

Convém exercitar ao menos uma evolução não destrutiva durante a validação para provar que a arquitetura suporta preservação futura, mesmo que a fase de desenvolvimento continue autorizada a descartar dados experimentais entre versões.

Não deve ser criada interface de teste, painel de diagnóstico ou infraestrutura permanente sem utilidade funcional para o produto apenas para exercitar esses cenários.

## Fora de escopo
Não fazem parte desta unidade a interface de Seleção de Capturar; a abertura e resolução entre estado local e acervo preservado; a casca das três etapas da captura; as regras de Registrar e organizar; historicidade; complementos; categorias; Tom; Revisar e Preservar; comunicação com o backend; conflitos de versão remota; indicador real de pendências na Principal; mensagens ao usuário sobre indisponibilidade; redirecionamento em caso de erro; política definitiva de recuperação ou recriação do banco; criptografia do IndexedDB; ou stores das demais jornadas.

## Critérios de conclusão
A unidade está concluída quando existir uma fundação IndexedDB reutilizável pelo Rememore; sua disponibilidade operacional puder ser verificada sem depender de uma página específica; o banco possuir abertura, schema versionado e caminho claro de evolução; stores, índices e operações puderem ser acrescentados sem reestruturar o núcleo; sucessos, resultados vazios e falhas forem distinguíveis; transações confirmarem operações somente após conclusão efetiva; o primeiro store mínimo de capturas respeitar conta e data, isolamento entre contas, identidade estável das memórias e ordem fisicamente persistida; e a implementação tiver sido exercitada o suficiente para demonstrar que a próxima unidade poderá consumir essa base sem refazê-la.

## Continuidade

### Sessão de 13/09/2026

- Leitura integral concluída; escopo apresentado ao operador, sem dúvidas funcionais iniciais. Escolhas técnicas seguem a autonomia prevista no corpo aprovado.
- Estado inicial do Git: somente este arquivo, não rastreado. Corpo fornecido preservado.
- Preferência informada pelo operador: Astra, esforço Leve. A seleção efetiva depende da interface.
- Indicadores antes das leituras: limites semanal e de 5 horas em 100%, informados pelo operador; capacidade total não informada. Indicador da janela de contexto não disponível.
- Após AGENTS, índice, memória inicial e Especificação, antes do fonte: indicador de contexto não disponível. Limites de uso não são medida da janela de contexto.
- Plano: (1) núcleo IndexedDB com schema, diagnóstico, transações e contrato de erros; verificar os contratos antes do domínio; (2) repositório mínimo de capturas e cenários técnicos de persistência, isolamento, falhas e migração preservadora; apresentar resultado para validação do operador.
- Etapas 1 e 2 implementadas em `app/services/local/`: núcleo, migração inicial, diagnóstico técnico e repositório mínimo de capturas. Páginas e mocks existentes não são consumidores nesta unidade.
- Validação técnica: nove cenários automatizados passaram com `fake-indexeddb@6.2.4`, dependência apenas do andaime de desenvolvimento. Exercitados criação/reabertura, diagnóstico sem resíduos, CRUD e substituição por chave composta, consulta e isolamento por conta, remoção idempotente, ausência versus falha, API ausente/acesso negado/falha operacional, confirmação após commit, abortos e rollback, migração preservadora com novo store e índice, atomicidade entre stores, falha de upgrade preservando versão/dados e upgrade bloqueado sem execução posterior inadvertida.
- Limite da validação: emulador em memória, sem teste de armazenamento em disco, quota ou permissões reais de navegador. Nenhuma interface de teste foi criada.
- Contratos reutilizáveis registrados em `.docs/referencias/trabalho-local.md`; índice e memória inicial atualizados.
- Verificações finais: `deno lint .` e `deno check --no-lock` passaram. `deno fmt --check .` encontrou 40 arquivos fora do formato, incluindo arquivos existentes, CSS de terceiros e o Markdown aprovado; não foi aplicada reformatação global. Os arquivos técnicos desta unidade foram formatados separadamente.
- O andaime automatizado foi removido após os nove cenários passarem; nenhuma dependência de teste foi adicionada a `deno.json` ou `deno.lock`.
- Indicadores finais informados pelo operador no pedido de encerramento: 27% do contexto utilizado, limite de 5 horas com 71% restante e limite semanal com 96% restante. Capacidade total da janela de contexto não informada. São os valores comunicados antes da redação do parecer, não uma medição posterior a ela.
- Estado: unidade encerrada por solicitação do operador em 13/09/2026, após conferência da implementação com o corpo aprovado. Parecer final registrado abaixo e entregue ao operador para transporte ao registro canônico; nenhuma atualização do Drive foi realizada.

## Parecer final

Foi produzida a Fundação do Trabalho Local em `app/services/local/`, com `LocalDatabase`, diagnóstico operacional, schema versionado e migrações extensíveis, transações com confirmação somente após commit e contrato explícito `LocalStorageError`. O banco `rememore-local`, versão 1, possui o store `captures`, com chave composta de conta/data e índice `byAccount`, e o store técnico `_health`, usado pelo diagnóstico sem deixar registros nem alterar capturas.

O `LocalCapturesRepository` oferece criação/substituição, leitura, remoção por conta/data e consulta por conta. Cada captura persiste memórias com identidade local, conteúdo e ordem explícita. A identidade é fornecida pelo consumidor e preservada independentemente do conteúdo e da ordem; apenas consultar uma data não cria pendência. A definição dos momentos de criação e edição continua reservada às próximas unidades.

Não houve desvio funcional identificado em relação ao escopo aprovado. Nove cenários automatizados temporários passaram, incluindo isolamento entre contas, distinção entre ausência e falha, rollback, upgrade bloqueado e evolução não destrutiva com novo store e índice. O andaime foi removido após a validação. A verificação usou IndexedDB em memória; persistência em disco, quota e permissões de navegadores reais não foram exercitadas. Tipos e lint passaram; a formatação dos arquivos técnicos alterados foi verificada, sem reformatação global das divergências existentes no projeto.

Permanecem deliberadamente para especificações posteriores a integração às páginas e às pendências da Principal, as regras funcionais de Capturar, a comunicação com o backend e a experiência e política de recuperação. Não foram criados stores de categorias ou de outras jornadas, nem interface de teste. A unidade é encerrada por determinação do operador, com a base disponível para consumo pelas próximas especificações.

Indicadores de uso informados pelo operador no pedido de encerramento: 27% do contexto utilizado, limite de 5 horas com 71% restante e limite semanal com 96% restante. A capacidade total da janela de contexto não foi informada. Os valores antecedem a redação deste parecer.

