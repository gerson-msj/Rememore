Intervenção Técnica - Convenção PT-BR e Nacionalização do Código-Fonte

Finalidade

Este documento orienta uma intervenção técnica única e separada das Especificações funcionais em andamento. Seu objetivo é incorporar ao repositório a convenção permanente de idioma definida para o Rememore, atualizar o AGENTS.md e nacionalizar com segurança o código autoral já existente, sem alterar comportamento, arquitetura ou contratos funcionais.

A intervenção deve ser executada em uma sessão própria, fora da branch corrente da 05.07. Ela parte exclusivamente da develop vigente e só retorna à develop depois da validação do operador.

Fonte permanente

A regra permanente está registrada em Contexto do Desenvolvimento do Rememore, na seção Convenção de idioma do código-fonte. Este documento descreve apenas a execução excepcional necessária para adequar o código já existente. Depois de concluída a intervenção, ele permanece como registro do procedimento e não se transforma em contexto obrigatório para sessões futuras.

Resultado esperado

Ao final da intervenção:

- o AGENTS.md deverá conter uma síntese operacional da convenção PT-BR;
- o código autoral já existente na develop deverá usar português do Brasil sempre que o nome for controlado pelo Rememore e puder ser alterado sem quebrar contratos;
- nomes impostos pela linguagem, pela stack, por bibliotecas, APIs e contratos externos deverão permanecer intactos;
- contratos persistidos ou endereços estáveis não deverão ser alterados apenas para tradução;
- não deverá existir mudança funcional deliberada;
- o operador deverá receber as alterações para inspeção e teste antes de qualquer reintegração na develop.

Preparação da branch

1. Não execute esta intervenção sobre a branch em andamento da 05.07.
2. Verifique se qualquer trabalho local da 05.07 ou de outra atividade está preservado com segurança. Não descarte, transporte ou misture modificações dessa unidade na intervenção de nacionalização.
3. Parta da develop vigente. Sincronize-a com o repositório remoto segundo a configuração normal do projeto, sem reescrita forçada de histórico.
4. Crie a branch `refactor/convencao-pt-br` a partir dessa develop.
5. Confirme antes das alterações que a branch não contém trabalho funcional da 05.07.

Atualização do AGENTS.md

Antes de nacionalizar o fonte, atualize o AGENTS.md para que a própria sessão já passe a operar pela nova convenção. Preserve todas as orientações vigentes e acrescente somente uma síntese curta e operacional das regras abaixo.

A síntese deve estabelecer que:

- o idioma autoral do código do Rememore é o português do Brasil;
- classes, tipos, interfaces, enums, funções, métodos, variáveis, constantes, componentes, Islands, módulos, arquivos autorais, classes CSS próprias, comentários e descrições de testes devem ser escritos preferencialmente em português quando controlados pelo projeto;
- identificadores em português usam ASCII, sem acentos ou cedilha;
- conceitos do domínio preservam o vocabulário canônico do produto, como memoria, captura, complemento, preservacao, rememoracao, categoria e Tom;
- `camelCase`, `PascalCase`, `UPPER_SNAKE_CASE` e demais convenções técnicas de capitalização continuam sendo aplicadas normalmente;
- palavras-chave, APIs e nomes pertencentes a TypeScript/JavaScript, HTML, CSS, Deno, Fresh, Preact, Bulma, Font Awesome, libSQL/SQLite, Web APIs e demais dependências permanecem no idioma e na grafia definidos por essas tecnologias;
- nomes híbridos entre português e inglês devem ser evitados quando o conceito for integralmente controlado pelo Rememore;
- comentários autorais devem ser escritos em português e explicar razões ou restrições relevantes, não repetir o código;
- contratos, dados persistidos e endereços estáveis não podem ser renomeados automaticamente apenas para nacionalização;
- todo código novo passa a seguir a convenção.

Não transforme o AGENTS.md em cópia integral do Contexto do Desenvolvimento. Preserve sua função de contexto curto e operacional.

Fronteira de nacionalização

A regra central é: nacionalize aquilo que pertence ao Rememore; preserve aquilo que pertence à linguagem, à stack ou a um contrato externo.

Devem ser avaliados para nacionalização, quando forem autorais e a alteração for segura:

- nomes de classes, tipos, interfaces e enums;
- funções e métodos;
- variáveis, parâmetros e constantes;
- propriedades internas controladas exclusivamente pela aplicação;
- componentes, Islands e módulos próprios;
- nomes de arquivos e diretórios próprios que não sejam convenções da stack nem endereços públicos;
- classes CSS criadas pelo Rememore e todas as referências correspondentes;
- comentários, TODOs e descrições de testes;
- nomes de helpers, repositórios, serviços simulados e demais estruturas internas do projeto;
- textos técnicos internos que existam somente como nomenclatura autoral e não como contrato interoperável.

Devem permanecer em sua forma original:

- palavras-chave e construções das linguagens;
- APIs do JavaScript, TypeScript, DOM e demais Web APIs;
- propriedades e eventos JSX/HTML definidos pela plataforma;
- nomes exigidos por Deno, Fresh, Preact, Vite, Bulma, Font Awesome e outras bibliotecas;
- diretórios e arquivos especiais exigidos pela stack;
- propriedades CSS e valores técnicos como `display`, `flex`, `grid`, `position` e equivalentes;
- classes do Bulma e nomes de ícones do Font Awesome;
- protocolos, headers, MIME types e demais nomes normativos externos;
- chaves ou formatos definidos por serviços ou contratos externos.

Proteção de compatibilidade

A nacionalização é uma refatoração de nomenclatura, não uma autorização para migrar contratos.

Antes de renomear qualquer string ou identificador que ultrapasse a execução local do código, determine se ele possui compatibilidade a preservar. Tenha atenção especial a:

- nomes de object stores e índices do IndexedDB;
- nomes de campos já persistidos ou serializados;
- chaves de localStorage e sessionStorage;
- cookies;
- rotas e segmentos de URL;
- parâmetros de URL;
- payloads e contratos de serviços;
- nomes observáveis por mocks que representem contratos futuros;
- seletores ou identificadores utilizados externamente;
- nomes cuja alteração exija migração de dados existentes.

Se a alteração puder quebrar dado persistido, rota, contrato, teste de integração ou compatibilidade já estabelecida, preserve o nome atual. Não crie migração apenas para traduzir um nome. Se houver dúvida real sobre a natureza de um identificador, preserve-o e indique o caso ao operador.

Arquivos, rotas e convenções do Fresh

Nomes de arquivos próprios podem ser nacionalizados quando forem apenas organização interna do Rememore e todas as importações puderem ser atualizadas com segurança.

Não renomeie arquivos ou diretórios cuja grafia tenha significado para o Fresh, Deno ou outra ferramenta. Não renomeie uma rota pública apenas por ela estar em inglês ou por desejar uniformidade de idioma. A URL é um contrato do produto e só muda por decisão funcional explícita.

Forma dos identificadores

Use português sem diacríticos nos identificadores e nomes técnicos autorais. Exemplos adequados incluem `memoriaSelecionada`, `carregarMemorias`, `RepositorioCapturas`, `EstadoCaptura` e `LIMITE_COMPLEMENTOS`.

Mantenha português natural com acentos em comentários, documentação e textos destinados à leitura humana. A restrição a ASCII vale para identificadores técnicos, não para a língua escrita.

Evite tradução literal ruim apenas para eliminar inglês. Quando um termo técnico externo estiver sendo usado como conceito da própria tecnologia, mantenha-o. O objetivo é melhorar legibilidade para o projeto, não produzir traduções artificiais.

Método de execução

1. Faça um inventário do código autoral existente na develop e identifique os nomes claramente controlados pelo Rememore.
2. Nacionalize de forma coerente por conjunto relacionado, atualizando todas as referências em conjunto.
3. Preserve contratos protegidos pela regra de compatibilidade.
4. Não faça reorganização arquitetural, extração de abstrações, alteração de comportamento ou limpeza geral não necessária à nacionalização.
5. Não aproveite a intervenção para corrigir regras funcionais ou implementar partes da 05.07.
6. Ao encontrar código híbrido, prefira um nome integralmente em português quando o conceito for do Rememore.
7. Ao encontrar nomes técnicos externos, preserve-os mesmo que permaneçam em inglês.
8. Depois das renomeações, procure referências obsoletas e imports quebrados.
9. Execute os verificadores e testes disponíveis no projeto, incluindo `deno fmt`, `deno lint` e a suíte de testes vigente, respeitando a configuração real do repositório.
10. Execute também qualquer verificação de build, type-check ou inicialização que já faça parte do fluxo normal do projeto.

Critério de escopo

A intervenção deve alcançar o código autoral existente na develop no momento em que a branch for criada. Não precisa nacionalizar dependências, arquivos gerados, artefatos de build, lockfiles, conteúdo de terceiros ou código vendorizado.

Não invente uma arquitetura nova para tornar os nomes mais fáceis de traduzir. Se uma renomeação exigir uma alteração estrutural desnecessária, preserve a estrutura e faça apenas o ajuste nominal seguro.

Validação pelo operador

Ao concluir a refatoração, não reintegre a branch na develop.

Apresente ao operador as alterações da branch para inspeção nas Changes/diff e forneça um resumo curto contendo:

- quais grupos de nomes foram nacionalizados;
- quais nomes em inglês permaneceram por pertencerem à stack ou a contratos;
- quais casos foram deliberadamente preservados por risco de compatibilidade;
- resultado de fmt, lint, testes e demais verificações executadas;
- qualquer ponto que mereça inspeção manual especial.

Lembre o operador de realizar um smoke test do sistema já materializado na develop, com atenção às jornadas existentes até a 05.06: páginas públicas e autenticação, Principal, seleção de Captura, abertura da Captura e operações locais já disponíveis. O objetivo é confirmar que a refatoração nominal não alterou comportamento, navegação, persistência local nem apresentação.

A branch somente deve ser reintegrada à develop depois da validação explícita do operador. Não faça merge, rebase destrutivo ou descarte das mudanças por iniciativa própria.

Depois da reintegração

Depois que o operador validar a intervenção e autorizar sua reintegração à develop, a convenção passa a ser parte normal do projeto por meio do AGENTS.md e do Contexto do Desenvolvimento do Rememore.

A sessão da 05.07 deverá então absorver a develop atualizada conforme o documento Adendo Operacional à 05.07 - Convenção PT-BR, reconciliar seu trabalho em andamento com os nomes nacionalizados e continuar a unidade já aprovada sem redefini-la.


## Continuidade

### Sessão de 14/09/2026

- Acesso confirmado. Estado inicial: somente este documento não rastreado; nenhum fonte modificado pelo operador.
- `git fetch origin` confirmou develop local/remota em `fd1672b`, “Spec 07 - Parcial”. O operador autorizou inicialmente a base
  anterior `fff5a43`, mas depois determinou incluir a 07 parcial testada e validada. A branch `refactor/convencao-pt-br` foi
  avançada por fast-forward até `fd1672b`, antes das alterações autorais. Essa decisão substitui a exclusão da 07 prevista no procedimento.
- Escopo compreendido sem lacunas funcionais: refatoração nominal, sem construção dos próximos marcos da 07. Reintegração somente
  após validação explícita do operador. A develop permanece intacta.
- Indicadores de contexto antes das leituras e após a contextualização, antes do fonte: indisponíveis; não estimados.
- Plano: (1) registrar convenção e inventariar fronteiras; (2) nacionalizar símbolos, arquivos e CSS por conjuntos relacionados;
  (3) atualizar referências e Continuidade da 07; (4) conferir compatibilidade, formatação, lint, tipos, build e testes; (5) entregar diff.
- Etapas 1–4 concluídas e diff entregue. Operador realizou alguns testes e informou que ficou tudo certo; não detalhou os cenários.
  Retomada em outra sessão para pastas vazias, análise do IndexedDB e conclusão das operações de Git.
- Verificação de base: 31 testes passaram antes das renomeações. A suíte HTTP utiliza o build disponível; a verificação final será
  executada após gerar um build com os fontes nacionalizados.
- Campos persistidos e payloads permanecem em inglês quando constituem contrato. Símbolos e variáveis de consumo usam português,
  com aliases onde necessário. Métodos das interfaces de serviços simulados, códigos de resultado/erro, rotas, cookies, identificadores
  HTML, chaves de armazenamento e API pública do mock de Captura preservados.
- Pedido posterior do operador: analisar a nacionalização dos stores/campos IndexedDB depois desta entrega, sem obrigação de manter
  os dados atuais. Não foi criada migração de tradução nesta intervenção.

### Entrega para validação

- Nacionalizados nomes autorais de tipos, classes, componentes, propriedades internas, funções, métodos locais, variáveis, parâmetros,
  arquivos e diretórios internos, classes/variáveis CSS, comentários, erros técnicos internos e descrições de testes. Exemplos:
  `CabecalhoPagina`, `MensagemPopup`, `CapturaDia`, `EstruturaCaptura`, `PainelCaptura`, `BancoLocal`, `RepositorioCapturasLocais`,
  `prepararCaptura`, `SessaoCapturaAberta` e `PosseCaptura`. Serviços e utilitários agora ficam em `app/servicos/` e `app/utilitarios/`.
- Mantidos os nomes impostos por Fresh/Preact/DOM/Bulma e pelos contratos: `app`, `handler`, `GET`, `POST`, `children`, eventos JSX,
  métodos das interfaces de serviços, estados como `found`/`absent`/`failed` e resultados `confirm`/`cancel`. Os nomes HTML estáveis,
  cookies, rotas, chaves de armazenamento e `rememoreCaptureMock.set/configure/reset` continuam funcionando com a grafia anterior.
  `ErroArmazenamentoLocal` preserva `name: "LocalStorageError"`, `operation` e `code` como identidade diagnóstica existente.
- IndexedDB permanece na versão 3, com stores `captures`/`_health`, índice `byAccount` e os mesmos campos. Nenhuma migração nova.
  Dependências, lockfile, CSS gerado e arquivos de terceiros preservados. `static/laboratorio-theme.js` mantém seu endereço público.
- `deno fmt --check` passou nos 78 arquivos de fonte/estilo autoral; `deno lint .` passou nos 73 fontes; `deno check` e
  `deno task build` passaram. `deno test -A tests app` passou: 31 testes, incluindo rotas HTTP com build nacionalizado e cenários de
  cache, falhas, migração existente, sessão e concorrência simulada.
- A tarefa composta `deno task check` para no `fmt --check .`: a verificação global inclui formatação fora desta refatoração,
  como configurações, corpos documentais preservados, AGENTS original e CSS de terceiros. Não foram reformatados só para liberar a tarefa.
  Lint e tipos foram executados diretamente e aprovados. A memória técnica editada foi formatada.
- Auditoria contra a base confirmou: regras CSS equivalentes após desfazer apenas os nomes, paletas sem mudança de valores,
  atributos HTML literais de navegação/identidade/formulários/acessibilidade preservados, mesmos campos e métodos dos contratos
  protegidos e corpo aprovado da 07 integralmente intacto. Nenhuma mudança funcional deliberada.
- Para inspeção manual: páginas públicas, entrada/saída, Cadastro e Redefinição; Principal e destinos protegidos; Seleção de Captura,
  pendências, abertura/retomada e operações locais; Captura de 08/09/2026 em desenvolvimento, barra fixa, abas e leitura da memória;
  duas abas para a mesma captura; laboratório, temas, paletas e popup. Verificar apresentação também em largura de celular.
- Código e registros entregues ao operador na branch `refactor/convencao-pt-br`, sem commit, push ou reintegração nesta entrega.
  A próxima sessão da 07 deve usar as referências e nomes atualizados. A nacionalização do IndexedDB permanece para análise posterior.
- Indicador de contexto final: indisponível; capacidade total não informada, sem estimativa.

### Retomada em outra sessão — retorno do operador

- Após a entrega, o operador informou: “Fiz alguns testes e ficou tudo ok”. Isso registra aprovação dos cenários que ele testou,
  sem declarar executado todo o roteiro manual.
- Indicador posterior informado pelo operador: sessão em 77% de ocupação de contexto; capacidade total não informada. Esse valor
  corresponde à preparação da passagem de sessão e não substitui os marcos anteriores indisponíveis.
- Git conferido na passagem: branch `refactor/convencao-pt-br`, HEAD `fd1672b`, alterações sem commit. Novos arquivos estão marcados
  com intent-to-add para aparecer no diff; o índice não contém alterações preparadas para commit. Preservar todo esse trabalho.
- Pendências: verificar e remover somente diretórios antigos efetivamente vazios, incluindo entradas ocultas; analisar os nomes dos
  object stores, índices e campos do IndexedDB e seus consumidores. O operador dispensou a preservação dos dados existentes.
  Essa dispensa não implica autorização para alterar outros contratos, chaves, cookies, rotas ou regras funcionais.
- A próxima sessão deve apresentar o recorte e esclarecer dúvidas antes de implementar a mudança do IndexedDB, verificando também
  a interação com os payloads remotos simulados e com a identidade da sessão aberta. Schema atual continua 3; não alterar migrações
  históricas silenciosamente nem ampliar para políticas de limpeza/TTL.
- Commit, push e reintegração ainda não realizados. O operador autorizou as manipulações de Git para a intervenção, mas ainda não
  solicitou sua reintegração. Conservar a branch atual e o resultado produzido até a conclusão acordada.
- Continuar esta intervenção técnica, sem executar os marcos funcionais restantes da 07 e sem acessar o Drive. O corpo aprovado da 07
  permanece intacto; sua sessão própria retomará depois no padrão PT-BR.

### Sessão de 15/09/2026 — IndexedDB

- Git confirmado em `refactor/convencao-pt-br`, HEAD `fd1672b`, com o trabalho anterior preservado e índice sem alterações preparadas.
- Removidas somente pastas vazias, verificadas inclusive com entradas ocultas: `app/services/auth`, `capture`, `local`, `principal`,
  a própria `app/services` e `app/utils`.
- Operador aprovou o recorte e os nomes propostos: schema 4, stores `capturas`/`_diagnostico`, índice `porConta`, chave técnica `sonda`;
  campos locais `idConta`, `dataCaptura`, `memorias`, `alterada`, `origemPreservada`, `revisaoOrigem`, `idAreaTrabalho`, `prazoEdicaoDias`,
  `conteudo`, `ordem`, `primeiraPreservacaoEm` e `complementos`. `id` e o nome do banco `rememore-local` permanecem.
- Descarte dos dados antigos autorizado somente no upgrade 4. Preservar o comportamento das migrações 1–3. Separar tipos remotos dos
  locais e converter na preparação; payloads, comandos do mock, sessionStorage (inclusive `workspaceId`), autenticação e locks preservados.
- Sem dúvidas funcionais restantes neste recorte. Plano: (1) implementar migração e atualizar consumidores; (2) validar migrações,
  conversão, persistência e sessão, além de fmt/lint/tipos/build/suíte; (3) atualizar referências e entregar para validação do operador.
  Etapas 1–3 concluídas; entregue para validação do operador. Git ao final conforme combinação; reintegração não solicitada.
- Indicadores antes das leituras e após leitura inicial, antes do fonte: indisponíveis, capacidade não informada. Os 77% informados pelo
  operador pertencem à passagem da sessão anterior, sem estimativa retroativa nesta sessão.
- Implementado schema 4 com descarte único dos stores antigos. Migrações históricas usam nomes literais anteriores para conservar seu
  comportamento; as constantes atuais apontam aos stores novos. Repositório, preparação, Seleção e Captura do dia usam campos locais
  em PT-BR. A Principal continua consumindo o mesmo método de pendências.
- Criados tipos remotos `MemoriaPreservada` e `ComplementoPreservado`, mantendo campos dos payloads. Conversão explícita na preparação
  preserva valores, IDs, ordem, timestamps e null. O marcador sessionStorage conserva `workspaceId`, recebendo `idAreaTrabalho`.
  Marcador anterior ao descarte não retoma conteúdo perdido; nova preparação confirma outra materialização e atualiza o marcador.
- Validação: fmt dos 78 fontes/estilos autorais, lint dos 73 fontes, tipos e build aprovados; suíte completa após build: 34 testes,
  todos aprovados. Novos cenários verificam estrutura do schema 4, descarte único, persistência em reaberturas, diagnóstico sem resíduo,
  sessão antiga, conversão de memórias/complementos e rollback de upgrade com nova tentativa. O teste da migração 3 agora verifica
  diretamente a versão histórica, sem depender do repositório do schema atual.
- `.docs/memoria-tecnica.md` e `.docs/referencias/trabalho-local.md` atualizadas e formatadas. A limitação previamente registrada de
  `deno task check` global permanece: documentos aprovados, configurações e terceiros não foram reformatados indiscriminadamente.
- A validação de IndexedDB usa `fake-indexeddb` em memória. Pendente validação do operador no navegador: primeira abertura após upgrade,
  pendências, leitura das memórias, recarregamento e nova entrada. Os testes manuais relatados anteriormente precedem o schema 4.
- Nenhum avanço funcional da 07, commit, push ou reintegração nesta retomada. Alterações disponíveis no diff da branch existente.
  Indicador final de contexto: indisponível; capacidade total não informada.

### Validação e encerramento — 15/09/2026

- Após a entrega do schema 4, o operador navegou pela aplicação, verificou os fontes e o novo IndexedDB no navegador e informou
  que tudo parecia correto. Solicitou o resumo final abaixo e autorizou a reintegração da branch à develop.
- Esse retorno substitui a pendência de validação para encerramento, sem afirmar que todos os cenários do roteiro foram executados.
- Encerramento da intervenção autorizado; os marcos funcionais restantes da 07 continuam sob responsabilidade da sessão própria.
  Indicador de contexto no encerramento indisponível; capacidade total não informada.

## Parecer final — passagem para a sessão da Spec 07

A intervenção técnica PT-BR foi concluída e validada pelo operador. Partiu de `fd1672b` (`Spec 07 - Parcial`) na branch
`refactor/convencao-pt-br`. Por decisão explícita do operador, incluiu também o código parcial da 07 já presente nessa base,
substituindo a exclusão inicialmente prevista neste procedimento. A reintegração à `develop` foi autorizada em 15/09/2026.

### O que mudou no código

- A convenção permanente foi incorporada ao `AGENTS.md`: nomes autorais novos usam preferencialmente português, com identificadores
  ASCII e comentários em português natural. Nomes exigidos pela stack e contratos estáveis continuam com sua grafia.
- Nacionalizados componentes, serviços, utilitários, tipos, funções, propriedades internas, arquivos, classes/variáveis CSS,
  comentários e testes, com atualização de imports e consumidores. Serviços passaram de `app/services/` para `app/servicos/`;
  utilitários, de `app/utils/` para `app/utilitarios/`; `utils.ts` da raiz passou a `utilitarios.ts`. Pastas antigas vazias foram removidas.
- Para a 07, os principais nomes atuais são `islands/CapturaDia.tsx`, `components/EstruturaCaptura.tsx`,
  `components/PainelCaptura.tsx`, `app/servicos/captura.ts` (`prepararCaptura`), `app/servicos/captura/sessaoAberta.ts`
  (`SessaoCapturaAberta`), `app/servicos/captura/bloqueio.ts` (`PosseCaptura`, `adquirirBloqueioCaptura`) e
  `app/servicos/local/` (`BancoLocal`, `RepositorioCapturasLocais`, `capturasLocais`).
  Componentes compartilhados incluem `CabecalhoPagina`, `MensagemPopup` e `SeletorData`.

### IndexedDB e fronteira remota

O banco permanece `rememore-local`, agora no schema 4. A migração 4 descarta os stores antigos `captures`/`_health` e seus dados,
com dispensa expressa do operador, e cria `capturas` e `_diagnostico`. A chave composta é `[idConta, dataCaptura]`, o índice é
`porConta` e a chave técnica de diagnóstico é `sonda`. O descarte ocorre somente nesse upgrade; o comportamento das migrações
1–3 foi preservado. Não foi criada política de limpeza, cache ou TTL.

Os campos de `CapturaLocal` agora são `idConta`, `dataCaptura`, `memorias`, `alterada`, `origemPreservada`, `revisaoOrigem`,
`idAreaTrabalho` e `prazoEdicaoDias`. Memórias usam `id`, `conteudo`, `ordem`, `primeiraPreservacaoEm` e `complementos`;
complementos usam `id`, `conteudo` e `primeiraPreservacaoEm`. Somente `alterada: true` representa pendência. Datas, IDs,
ordenação, historicidade e regras de preparação/retomada conservam seus significados.

Os payloads remotos continuam em inglês. `MemoriaPreservada` e `ComplementoPreservado`, em
`app/servicos/captura/contratos.ts`, agora descrevem esses dados separadamente dos tipos locais. `prepararCaptura` converte
explicitamente a composição recebida para os campos PT-BR, sem alterar valores, ordem ou identidade.
`rememoreCaptureMock.set/configure/reset` e o formato de seus cenários permanecem compatíveis.

A sessão aberta conserva sua chave de sessionStorage e o campo serializado `workspaceId`, alimentado pelo `idAreaTrabalho` local.
Um marcador anterior ao descarte não restaura uma materialização excluída: a preparação obtém nova base e registra outra identidade
após confirmação local. Cookies, rotas, payloads dos handlers, identidade autenticada, nomes dos locks, códigos de resultado/erro
e contratos de serviços foram preservados.

### Como retomar a 07

A sessão da 07 deve usar a develop com esta intervenção integrada e consultar `AGENTS.md`, `.docs/README.md`,
`.docs/memoria-tecnica.md` e a referência `.docs/referencias/trabalho-local.md` para os contratos atuais. A Continuidade da 07
já recebeu os nomes nacionalizados na primeira etapa; para os campos IndexedDB, este parecer e a referência técnica registram
a evolução posterior ao schema 4. Seu corpo aprovado foi preservado.

O trabalho funcional permanece no ponto anterior: fundações e marco B parcial materializados; edição/confirmação, rascunhos e
demais marcos restantes não foram implementados nesta intervenção. A próxima sessão retoma esse trabalho com os nomes atuais.

### Validação e entrega

Passaram formatação dos 78 fontes/estilos autorais, lint dos 73 fontes, tipos, build e 34 testes após o build. Os testes incluem
migração, rollback, persistência em reaberturas, conversão e identidade da sessão. IndexedDB automatizado foi validado em memória;
o operador também navegou, inspecionou os fontes e conferiu o novo banco no navegador.
`deno task check` global mantém a limitação de formatação já registrada para documentos, configurações e terceiros preservados.

Parecer entregue ao operador neste arquivo para informar a retomada da 07 e eventual transporte ao registro canônico.
O Drive não foi acessado nem atualizado. Não há pendência de implementação dentro do recorte aprovado desta intervenção.
