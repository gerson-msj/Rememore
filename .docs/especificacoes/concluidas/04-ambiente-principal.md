# Especificação 04 — Ambiente Principal

Fonte: [05.04 - Ambiente Principal](https://docs.google.com/document/d/1gX5sbODd3n8Haubc7hb7G5v4BdHms8Z88hG59k8y0Y0/edit)

## Estado

Quarta unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar o Ambiente
Principal autenticado. A partir desta aprovação, o corpo permanece como registro histórico imutável da unidade e somente poderá receber
Parecer final quando o operador encerrar o desenvolvimento.

## Objetivo

Transformar a rota `/principal`, criada de forma mínima em 05.02 - Login e Fronteira de Autenticação, no hub autenticado real do Rememore. A
página deve apresentar as quatro jornadas pessoais, refletir sua disponibilidade, oferecer os acessos secundários de continuidade, conta e
administração e permitir testar a navegação por meio de cascas mínimas protegidas das páginas de destino.

## Origem funcional

Esta unidade materializa a parte do Ambiente Principal definida principalmente em 03.04 - Orientar-se pelo ambiente principal, 04.01 -
Fundação do Front e 04.02 - Mapa do Site, respeitando também as condições consolidadas de continuidade, conta e administração. As regras
necessárias ao comportamento desta unidade estão reproduzidas no corpo abaixo para que a implementação não dependa de interpretação externa.

## Base já materializada

05.02 já materializou a fronteira autenticada, a rota `/principal` em forma mínima, o cabeçalho de página (CMP-027) e o componente de popup
(CMP-028), além do comportamento de saída da sessão. Esta unidade deve evoluir essa base sem refazer a autenticação existente.

## Escopo

A unidade compreende a composição completa da Principal, os quatro cards de jornadas, seus estados de disponibilidade, os popups
explicativos para jornadas ainda indisponíveis, a região secundária de continuidade, conta e sistema, o contrato mockado necessário à
disponibilidade das jornadas e à autorização administrativa e as cascas mínimas protegidas das rotas de destino.

## Fora de escopo

Não fazem parte desta unidade a implementação funcional de Capturar, Encontrar Memórias, Rever um Dia, Rememorar, Minha Conta e Meus Dados
ou Administração; a implementação real do backend; a persistência definitiva das capacidades do usuário; o cálculo definitivo da evolução do
usuário; a orientação progressiva (CMP-005); a identidade visual rica dos cards; ou uma revisão responsiva específica para dispositivos
móveis.

## Ambiente Principal

Rota: `/principal`.

Acesso: somente com sessão autenticada, reutilizando a fronteira já materializada em 05.02.

O cabeçalho utiliza o cabeçalho de página (CMP-027): ícone `book-open` à esquerda sem ação de retorno, título Rememore ao centro e ação Sair
à direita. O comportamento de saída e sua confirmação permanecem os já materializados em 05.02 por meio do componente de popup (CMP-028).

A página é um hub de navegação com estado contextual mínimo, e não um dashboard de métricas. Não devem ser acrescentados indicadores,
gráficos, históricos recentes ou outros dados não definidos nesta unidade.

## Jornadas

A região principal da página apresenta quatro cards: Capturar, Encontrar Memórias, Rever um Dia e Rememorar. Não há texto introdutório
funcional obrigatório além dos próprios cards.

Em largura suficiente, os cards devem ser organizados inicialmente em duas colunas e duas linhas, usando o padrão de cards do Bulma como
base. Em larguras menores, a composição deve responder naturalmente e pode empilhar os cards. Ajustes finos de proporção, espaçamento,
borda, sombra e microcomposição ficam a critério do desenvolvedor e poderão ser refinados posteriormente.

O card inteiro é acionável. Quando a jornada está disponível, o acionamento navega para sua rota. Quando a jornada está indisponível, o card
continua acionável, mas abre o componente de popup (CMP-028) com a explicação definida nesta especificação e não navega.

Cards disponíveis e indisponíveis não devem receber tratamento visual global diferente. A indisponibilidade é comunicada pelo texto
específico de disponibilidade, que pode receber leve destaque. O objetivo é manter o card convidativo e permitir que o usuário conheça
antecipadamente o recurso.

Cada card deve possuir estrutura que permita a evolução futura de sua identidade visual. Nesta unidade, usa-se um identificador iconográfico
simples; futuramente a região visual superior poderá receber arte ou imagem própria sem exigir mudança da responsabilidade funcional do
card. Os ícones definidos abaixo são iniciais e podem ser revisitados numa etapa artística futura.

### Card Capturar

Ícone inicial: `feather-pointed`.

Descrição: “Preserve as memórias de um dia.”

Disponibilidade: sempre disponível.

Destino: `/capturar`.

### Card Encontrar Memórias

Ícone inicial: `magnifying-glass`.

Descrição: “Localize memórias preservadas usando diferentes critérios.”

Quando indisponível, apresentar no card: “Disponível depois que você capturar seu primeiro dia.”

Condição de disponibilidade: existe ao menos um dia preservado.

Destino quando disponível: `/encontrar`.

### Card Rever um Dia

Ícone inicial: `location-crosshairs`.

Descrição: “Volte às memórias preservadas de uma data específica.”

Quando indisponível, apresentar no card: “Disponível depois que você capturar seu primeiro dia.”

Condição de disponibilidade: existe ao menos um dia preservado.

Destino quando disponível: `/rever`.

### Card Rememorar

Ícone inicial: `book-open`.

Descrição: “Explore suas memórias por categorias e períodos.”

Quando indisponível, apresentar no card: “Disponível quando houver mais memórias preservadas.”

Condição de disponibilidade: existem ao menos dois dias preservados e ao menos duas categorias distintas.

Destino quando disponível: `/rememorar`.

## Popups de indisponibilidade

Os popups de indisponibilidade utilizam o componente de popup (CMP-028), apresentam o mesmo ícone inicial da jornada correspondente e
possuem uma única ação visível, OK, que apenas fecha a explicação. O fechamento por meios não destrutivos, como backdrop ou Esc, deve seguir
o comportamento já existente do componente. Caso o contrato materializado do componente de popup (CMP-028) ainda exija duas ações, ele pode
ser evoluído de forma compatível para suportar mensagem informativa com uma única ação.

### Encontrar Memórias

Título: Encontrar Memórias.

Mensagem: “Encontre memórias já preservadas usando diferentes critérios de busca. Para começar a utilizar este recurso, primeiro capture e
preserve as memórias de pelo menos um dia.”

Ação: OK.

### Rever um Dia

Título: Rever um Dia.

Mensagem: “Reveja as memórias que você preservou em uma data específica. Para utilizar este recurso, primeiro capture e preserve as memórias
de pelo menos um dia.”

Ação: OK.

### Rememorar

Título: Rememorar.

Mensagem: “Rememorar permite explorar suas memórias por categorias e períodos, ajudando a perceber relações ao longo do tempo. Para que essa
exploração faça sentido, é preciso ter memórias preservadas em pelo menos dois dias e distribuídas entre pelo menos duas categorias.
Continue capturando suas memórias e o recurso ficará disponível conforme seu acervo crescer.”

Ação: OK.

## Contrato de disponibilidade das jornadas

A Principal não deve receber contagens brutas do acervo para reproduzir no front as regras de disponibilidade. O contrato com o backend deve
expor capacidades já resolvidas, suficientes para informar se Encontrar Memórias, Rever um Dia e Rememorar podem ser acessados. Capturar é
sempre disponível e não depende de capacidade fornecida pelo backend.

A forma técnica e os nomes concretos dessas propriedades ficam a critério do desenvolvedor, mas semanticamente o contrato deve permitir
distinguir, no mínimo: Encontrar Memórias disponível ou indisponível; Rever um Dia disponível ou indisponível; Rememorar disponível ou
indisponível; e usuário com ou sem autorização administrativa.

Para esta unidade, essas informações são mockadas. A futura implementação do backend poderá manter capacidades materializadas junto ao
estado do usuário, derivá-las de outros dados ou adotar outra estratégia. Essa escolha não pertence a esta especificação. Para o front, a
disponibilidade deve chegar resolvida.

A disponibilidade de Encontrar Memórias e Rever um Dia corresponde à existência de pelo menos um dia preservado. A disponibilidade de
Rememorar corresponde à existência de pelo menos dois dias preservados e duas categorias distintas.

Essas capacidades de navegação não devem ser confundidas com evolução ou nível de orientação do usuário. A orientação progressiva (CMP-005)
permanece fora desta unidade.

## Continuidade, Conta e Sistema

Abaixo das Jornadas existe uma região secundária sem título visível obrigatório. Ela reúne Capturas pendentes, Minha Conta e Meus Dados e,
quando autorizado, Administração.

Em largura suficiente, os elementos presentes são distribuídos horizontalmente pelo espaço disponível, com texto centralizado. Em larguras
menores, podem ser empilhados pela responsividade normal. Não há contador de pendências nem texto explicativo adicional nesta região.

### Capturas pendentes

Este acesso aparece somente quando o front conhece a existência de uma ou mais capturas locais ainda não preservadas no ambiente atual.

A existência de pendências é responsabilidade exclusiva do front. O backend não deve fornecer nem manter indicador de possível captura
pendente em outro dispositivo para a Principal.

Para esta unidade, o estado local de existência ou ausência de pendências pode ser representado por mock ou contrato local mínimo; não é
necessário implementar ainda o armazenamento operacional de Capturar.

Apresentação: ícone de alerta e texto centralizado “Capturas pendentes”. O bloco inteiro é clicável e conduz a `/capturar`. Não apresenta
quantidade nem explicação adicional.

O bloco pode possuir leve destaque visual e ser apresentado como uma pequena caixa ou card simples, preparando espaço para evolução visual
futura sem competir com a região principal de Jornadas.

### Minha Conta e Meus Dados

Ícone inicial: `user-gear`.

Texto: “Minha Conta e Meus Dados”.

Sempre visível para usuário autenticado.

O bloco inteiro é clicável e conduz a `/conta`.

### Administração

Ícone inicial: `wrench`.

Texto: “Administração”.

Somente é apresentado quando a capacidade administrativa recebida pelo front indicar autorização.

O bloco inteiro é clicável e conduz a `/admin`.

Para usuário não autorizado, o acesso não é apresentado como item indisponível: ele simplesmente não existe na Principal.

## Cascas mínimas protegidas

Esta unidade deve criar ou completar as cascas mínimas necessárias para que os destinos da Principal possam ser testados sem produzir rotas
inexistentes: `/capturar`, `/encontrar`, `/rever`, `/rememorar`, `/conta` e `/admin`.

As cascas não materializam o conteúdo funcional futuro dessas páginas. Devem apenas respeitar a fronteira de autenticação existente e
apresentar o cabeçalho de página (CMP-027), com ação Voltar à esquerda conduzindo à Principal, título da página ao centro e ação Sair à
direita.

Os títulos das cascas são, respectivamente: Capturar; Encontrar Memórias; Rever um Dia; Rememorar; Minha Conta e Meus Dados; Administração.

O ícone de identidade usado no card não precisa aparecer na casca nesta unidade. A relação futura entre a arte do card e a identidade visual
do cabeçalho ou da página permanece deliberadamente aberta.

A rota `/admin` possui ainda a fronteira adicional de autorização administrativa. A tentativa de acesso direto por usuário autenticado sem
autorização deve retornar à Principal sem encerrar a sessão.

As demais rotas desta unidade permanecem protegidas pela sessão autenticada já existente.

## Responsividade e evolução visual

A ordem atual da Principal é Jornadas primeiro e Continuidade, Conta e Sistema abaixo. Esta ordem deve ser mantida nesta unidade em todos os
tamanhos.

Fica registrada apenas como hipótese para revisão artística e responsiva futura a possibilidade de, em dispositivos móveis, antecipar a
região secundária quando houver capturas locais pendentes, evitando que essa indicação fique abaixo de uma sequência de cards empilhados.
Essa inversão não deve ser implementada agora.

Também fica para etapa futura a criação de identidade visual rica dos cards, incluindo possíveis imagens ou artes em sua região superior e
eventual continuidade dessa identidade nas páginas de destino. A implementação atual deve apenas evitar uma estrutura que torne essa
evolução desnecessariamente difícil.

## Mocks e cenários de validação

A implementação deve permitir validar, sem backend real, pelo menos os seguintes estados da Principal: usuário autenticado sem dias
preservados; usuário com um dia preservado; usuário com condições suficientes para Rememorar; usuário com e sem captura local pendente;
usuário comum e usuário com autorização administrativa.

Os cenários mockados não devem originar painel, seletor, rota de configuração ou outra interface para que o operador altere valores. Durante
a validação, o programador prepara diretamente um cenário, o operador o testa e, conforme solicitado na conversa, o programador altera os
valores simples do mock para o cenário seguinte. Basta modificar variáveis ou dados mockados no código; não deve ser criada infraestrutura
de controle de mocks que não tenha utilidade funcional para o produto.

No estado sem dias preservados, Capturar navega e Encontrar Memórias, Rever um Dia e Rememorar abrem seus respectivos popups.

Com um dia preservado, Encontrar Memórias e Rever um Dia navegam e Rememorar continua explicativo enquanto sua condição específica não
estiver satisfeita.

Com pelo menos dois dias preservados e duas categorias distintas, Rememorar navega.

Capturas pendentes aparece e desaparece somente conforme o estado local mockado do front.

Administração aparece somente no cenário autorizado.

Também deve ser validado que acesso sem sessão às cascas protegidas respeita a fronteira de autenticação existente e que acesso direto a
`/admin` sem autorização retorna à Principal.

## Critérios de conclusão

A unidade está concluída quando a Principal deixar de ser apenas a casca mínima criada em 05.02 e funcionar como hub autenticado completo
para o escopo atual; os quatro cards apresentarem os textos, ícones e comportamentos definidos; as indisponibilidades forem resolvidas pelo
contrato mockado e explicadas pelo componente de popup (CMP-028); a região secundária refletir corretamente pendência local, conta e
autorização administrativa; todas as rotas de destino possuírem cascas mínimas protegidas navegáveis; e os cenários de validação puderem ser
exercitados sem backend real.

## Parecer final

A preencher pelo programador ao encerramento da implementação, conforme 05.00 - Guia da Especificação.

---

## Continuidade

### Decisões da clarificação inicial

- Cenário inicial aprovado: usuário comum, sem dias preservados, sem capturas locais pendentes e sem autorização administrativa.
- Não foram identificadas outras lacunas funcionais antes do plano.

### Plano de execução

1. **Principal e contratos — validada.** Materializar os contratos substituíveis, o mock inicial, os cards, a região secundária e os popups;
   verificar tecnicamente e apresentar para validação visual e funcional do operador.
2. **Cascas e fronteiras — validada.** Criar as seis cascas protegidas, reutilizar cabeçalho e saída e acrescentar a autorização
   administrativa de `/admin`; verificar navegação e apresentar para validação.
3. **Cenários e integração — concluída.** Alternar diretamente os valores simples do mock conforme solicitado, exercer os estados definidos
   e executar a verificação integrada final.

### Etapa corrente

Especificação encerrada. O cenário final preservado é usuário administrador com condições suficientes para Rememorar e com captura local
pendente.

### Validado pelo operador

- Cenário inicial de apresentação.
- Etapa 1: composição visual e funcional da Principal, cards com altura uniforme, popups e região secundária no cenário inicial.
- Etapa 2: cascas protegidas, navegação Voltar/Sair e retorno de `/admin` sem autorização.
- Etapa 3: todos os cenários mockados, inclusive captura local pendente e autorização administrativa.

### Permanece

- Nada nesta unidade.

### Verificação técnica da Etapa 1

- Formatação, lint e verificação de tipos direcionados aos arquivos alterados: aprovados.
- Build de produção: aprovado.
- Teste HTTP existente de autenticação, proteção e saída: 1 aprovado.
- Leitura HTTP do cenário inicial: status 200, quatro jornadas e Conta presentes; Capturas pendentes e Administração ausentes.
- `deno task check` global continua acusando arquivos preexistentes fora do padrão de formatação; os arquivos desta etapa passaram na
  verificação direcionada.

### Ajustes solicitados na Etapa 1

- O operador aprovou o resultado geral e apontou alturas diferentes entre os cards Rever um Dia e Rememorar. Os cards passaram a usar linhas
  explícitas para a área visual e para o conteúdo, preenchendo toda a altura da linha da grade.
- As frases dos popups de indisponibilidade passaram a ser separadas por parágrafos reais. O intervalo entre parágrafos foi calibrado para
  os mesmos `0,75rem` existentes entre o título e o primeiro parágrafo.
- A nota de indisponibilidade dos cards deixou de ser empurrada ao rodapé: passou a usar o mesmo intervalo de `0,75rem` e o tom secundário
  `--bulma-text-weak`, sem itálico ou negrito.
- Formatação, lint, tipos, build e `git diff --check` foram aprovados depois dos ajustes.

### Verificação técnica da Etapa 2

- Foram criadas as cascas `/capturar`, `/encontrar`, `/rever`, `/rememorar`, `/conta` e `/admin`, compartilhando o cabeçalho com Voltar e
  Sair.
- A fronteira de sessão foi ampliada para as seis rotas; `/admin` também verifica a capacidade administrativa resolvida.
- No cenário comum atual, o acesso direto autenticado a `/admin` retorna à Principal sem encerrar a sessão.
- Formatação, lint, tipos, build e `git diff --check`: aprovados.
- Testes HTTP das cascas e do fluxo preexistente de autenticação: 2 aprovados.

### Cenários da Etapa 3

- **Sem dias preservados — validado.** Capturar navegável; Encontrar Memórias, Rever um Dia e Rememorar explicativos; sem pendência local e
  sem Administração.
- **Um dia preservado — validado.** Capturar, Encontrar Memórias e Rever um Dia navegáveis; Rememorar explicativo; sem pendência local e sem
  Administração. Formatação, lint, tipos, build, leitura HTTP das capacidades e `git diff --check` aprovados.
- **Condições suficientes para Rememorar — validado.** As quatro jornadas navegáveis; sem pendência local e sem Administração.
- **Captura local pendente — validado.** As quatro jornadas navegáveis; Capturas pendentes conduz a `/capturar`; sem Administração.
- **Autorização administrativa — validado.** Preserva o cenário anterior e acrescenta Administração conduzindo a `/admin`.

### Verificação técnica final

- Cenário final preservado conforme decisão do operador: quatro jornadas disponíveis, captura local pendente e Administração autorizada.
- Formatação, lint e tipos direcionados a todos os arquivos da unidade: aprovados.
- Build de produção: aprovado.
- Suíte completa: 3 testes HTTP aprovados, abrangendo autenticação, cadastro e redefinição, cascas protegidas e cenário administrativo.
- `git diff --check`: aprovado.

### Encerramento

- Parecer final inserido no documento 05.04 do Drive com controle de revisão.
- Leitura posterior confirmou a remoção do texto reservado, a presença do Parecer e a preservação integral do corpo aprovado anterior.
