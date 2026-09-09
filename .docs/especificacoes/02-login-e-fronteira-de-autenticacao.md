# 02 - Login e Fronteira de Autenticação

Fonte: [05.02 - Login e Fronteira de Autenticação](https://docs.google.com/document/d/1FRFh2xmRerKNe3RrwppkE1a9DyykVX-vc-bc9Flj0to/edit). Leitura integral em 08/09/2026. O corpo aprovado abaixo foi preservado, com adaptação apenas da identificação do título local e da formatação Markdown.

## Estado

Segunda unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar o Login e a fronteira inicial de autenticação do front do Rememore. A partir desta aprovação, o corpo permanece como registro histórico imutável da unidade e somente poderá receber Parecer final quando o operador encerrar o desenvolvimento.

## Origem funcional

04.03 - Especificação Funcional - Área Aberta / Página Inicial (/) e Login (/entrar).
04.04 - Regras - Área Aberta / REG-001, REG-002, REG-003 e REG-004.
04.05 - Componentes - Área Aberta / CMP-001 — Campo de Senha.
04.01 - Fundação do Front / fronteira entre funcionalidade e dependências, CMP-027 — Cabeçalho de Página e CMP-028 — Mensagem em Popup.
04.02 - Mapa do Site / regimes de acesso, Login (/entrar) e Ambiente principal (/principal).
03.02 - Entrar no Rememore e 03.04 - Orientar-se pelo ambiente principal.
02.06 - Conta, Dados e Administração / Login, Sessão e Ambiente principal, observados somente nos limites que esta unidade consegue simular sem backend real.

## Autossuficiência da instrução

As referências acima registram somente a origem documental utilizada para elaborar esta unidade. O programador não deve consultá-las para completar a instrução. Durante o trabalho, seu contexto funcional é o Contexto do Desenvolvimento do Rememore, esta Especificação e o código necessário à unidade. Os identificadores REG e CMP abaixo são mantidos para rastreabilidade, mas suas definições operacionais estão integralmente descritas aqui.

## Regras incorporadas à unidade

### REG-001 — Usuário autenticado não permanece na Área Aberta

As páginas abertas materializadas nesta unidade devem verificar a existência da autenticação simulada antes de permitir permanência. Sem autenticação, a Página Inicial (/) e o Login (/entrar) funcionam normalmente. Com autenticação vigente, acessar / ou /entrar, inclusive por URL direta ou recarregamento, conduz imediatamente a /principal. A rota /principal opera no regime oposto: sem autenticação vigente, conduz a /entrar. A verificação deve fazer parte do fluxo real das requisições e rotas, não apenas dos cliques produzidos pela interface.

### REG-002 — Normalização do nome de usuário

O nome de usuário não diferencia maiúsculas de minúsculas. Espaços existentes somente no início ou no fim são ignorados para identificação. Espaços internos não são permitidos em um nome de usuário válido. Essa mesma interpretação deve ser usada pelo formulário e pelo contrato de autenticação, evitando que cada camada compare o valor de maneira diferente.

Nesta unidade, o Login não cria uma mensagem específica para espaço interno. Se um valor com espaço interno alcançar a tentativa de autenticação, ele não corresponde ao usuário válido do mock e produz a mesma resposta genérica de credenciais inválidas. Variações como USUARIO, Usuario ou valores com espaços apenas nas extremidades devem normalizar para usuario e ser aceitas pelo mock.

### REG-003 — Nova tentativa após falha de autenticação

A ação Entrar só pode estar disponível quando Nome de usuário e Senha possuem conteúdo. Depois de uma tentativa de autenticação inválida, os dois valores permanecem nos campos, a mensagem de erro permanece visível e Entrar fica inativo. Uma nova tentativa somente se torna possível quando o valor de Nome de usuário ou o valor de Senha for efetivamente alterado. Alterar apenas a visibilidade da senha não conta como edição do valor, não remove a mensagem e não libera nova tentativa. Quando qualquer um dos dois valores for alterado, a mensagem de autenticação inválida desaparece e a disponibilidade de Entrar volta a ser calculada pela presença de conteúdo nos dois campos.

### REG-004 — Sessão após autenticação bem-sucedida, adaptada ao mock

No produto completo, uma autenticação bem-sucedida estará submetida a uma política real de sessão fornecida pelo backend. Essa política não será simulada integralmente nesta unidade. Para este desenvolvimento, sucesso na autenticação deve estabelecer somente um estado de autenticação simulada que sobreviva às requisições e navegações necessárias para que recarregamento, acesso direto às rotas e REG-001 funcionem de maneira realista. O logout remove esse estado.

Não implementar nesta unidade duração de sessão, renovação periódica, invalidação de sessões anteriores, concorrência entre dispositivos, persistência de sessão em banco ou qualquer outro comportamento temporal. O mecanismo técnico do estado simulado pertence ao programador. A fronteira criada deve permitir que uma implementação real de backend substitua futuramente o mock sem exigir reconstrução das páginas.

## Componentes incorporados à unidade

### CMP-001 — Campo de Senha

Componente de entrada de senha com controle de visibilidade incorporado. O valor inicia oculto. O usuário pode alternar entre ocultar e mostrar o conteúdo e retornar ao estado oculto. Essa alternância modifica somente a apresentação: não altera o valor, não deve ser tratada como edição e, no Login, não remove erro de autenticação nem libera nova tentativa depois de falha.

O componente cuida apenas da entrada e da visibilidade. Validações, mensagens e consequências funcionais pertencem à página chamadora. Nesta unidade, o Login não valida comprimento mínimo da senha: qualquer senha não vazia pode ser submetida ao contrato de autenticação.

### CMP-027 — Cabeçalho de Página

Componente global fixo no topo da área visível, ocupando toda a largura e permanecendo presente durante a rolagem. Deve ter altura compacta, suficiente para título, ícones e pequenas margens, sem consumir espaço vertical desnecessário. Possui três regiões estáveis: esquerda, central e direita.

A região esquerda apresenta um único ícone. Quando a página não possui retorno, usa Font Awesome book-open sem ação de clique. Quando existe retorno, usa Font Awesome chevron-left e entrega o acionamento à página chamadora, que decide o destino. O espaço horizontal reservado à região esquerda deve permanecer igual nos dois modos para que a troca entre book-open e chevron-left não desloque o título.

A região central apresenta o título fornecido pela página, alinhado à esquerda dentro de sua região, sem ação de clique e usando a tipografia correspondente ao segundo nível de título do sistema.

A região direita pode apresentar Font Awesome arrow-right-from-bracket como ação de saída. A página chamadora decide se essa ação aparece e o que ocorre quando ela é acionada. O componente não encerra a sessão por conta própria nem decide se haverá confirmação. Nas páginas da Área Aberta desta unidade, a saída não aparece. Em /principal ela aparece permanentemente.

Ícones esquerdo e direito permanecem centralizados verticalmente em relação ao título e respeitam margens laterais. Cores, dimensões exatas, espaçamentos finos e demais detalhes visuais podem ser ajustados pelo programador com o operador durante a validação, desde que os comportamentos estruturais acima sejam preservados.

Nesta unidade, as configurações concretas são: Home (/) = título Rememore, book-open, sem saída; Login (/entrar) = título Entrar, chevron-left retornando a /, sem saída; Principal mínima (/principal) = título Rememore, book-open, com saída.

### CMP-028 — Mensagem em Popup

Componente global para apresentar mensagem ou questionamento simples sem carregar lógica de negócio própria. A página chamadora fornece texto simples e controla se o popup está aberto ou fechado. Conteúdo HTML formatado não é necessário nesta versão.

A página pode optar por nenhum ícone ou informar um ícone da coleção Font Awesome. Quando houver ícone, ele aparece à esquerda da mensagem e centralizado verticalmente em relação ao conteúdo.

As configurações de ações suportadas são: Sim e Não; somente Sim; somente Não; OK e Cancelar; somente OK; ou nenhuma ação visível. Independentemente do rótulo, o componente devolve somente dois resultados abstratos: Sim e OK significam confirmação; Não e Cancelar significam cancelamento.

O popup possui backdrop ao redor da caixa. Clicar no backdrop também produz cancelamento, inclusive quando não existe ação visível. O componente comunica confirmação ou cancelamento à página chamadora, mas não decide sozinho a consequência nem o momento funcional de fechar. A página recebe o resultado, executa a consequência pertinente e controla o fechamento.

A abertura e o encerramento devem possuir transições visuais suaves e coerentes com a linguagem de interação do sistema. Duração, deslocamento, opacidade, easing e técnica de animação são decisões de construção. A caixa fica aproximadamente no centro da área visível, porém deliberadamente deslocada para cima; o deslocamento exato será calibrado com o operador durante o teste no laboratório.

A página pode solicitar uma cor semântica da fundação visual: principal, link, informação, sucesso, atenção ou perigo. Sem cor solicitada, o popup usa a aparência padrão da página e respeita o tema vigente. O componente não deve inventar lógica funcional adicional, fechamento temporizado ou ações não solicitadas pela página.

Na Principal mínima, CMP-028 será usado especificamente para logout com o texto “Deseja realmente sair?”, botões Sim e Não, sem ícone e sem cor semântica específica. Sim confirma o logout; Não e backdrop cancelam.

## Objetivo

Materializar o Login como funcionalidade real do front, construir a fronteira inicial entre Área Aberta e Área Autenticada e tornar navegável o fluxo completo de entrada e saída do sistema sem construir backend real.

A unidade também materializa e valida os componentes globais CMP-027 e CMP-028, revisita a Página Inicial criada em 05.01, implementa CMP-001 no Login e cria uma versão mínima de /principal destinada exclusivamente a permitir o teste real de autenticação, proteção de rota e logout.

Ao final, páginas, rotas, requisições, navegação e estados de interface devem ser reais. Somente as dependências que futuramente pertencerão ao backend permanecem simuladas atrás de contratos destinados a sobreviver à substituição do mock pela implementação real.

## Condução da unidade

Esta é uma unidade extensa e pode atravessar mais de uma sessão. O programador deve seguir o Contexto do Desenvolvimento do Rememore vigente.

Antes de criar ou atualizar a cópia Markdown operacional desta Especificação, deve ler a instrução, examinar apenas o código necessário e realizar com o operador uma rodada inicial de clarificação funcional. Deve apresentar seu entendimento do escopo e questionar qualquer ponto em que seria necessário escolher ou inventar regra, texto, navegação, estado, resposta, comportamento ou limite funcional. Se não encontrar lacunas relevantes, deve informar isso explicitamente.

Decisões puramente técnicas permanecem sob sua responsabilidade e não exigem aprovação prévia, desde que não alterem o contrato funcional. Somente depois da clarificação deve criar ou atualizar o Markdown operacional e registrar nele um plano mínimo com etapas, dependências, estado da execução e pontos de validação.

A unidade não deve ser acumulada integralmente para teste somente no final. Em especial, os componentes globais definidos abaixo devem ser construídos e validados no laboratório antes de sua incorporação às páginas reais. O programador controla a cadência restante e deve preservar no Markdown o que já foi validado e o que ainda permanece.

## Fronteira entre front e backend

O Rememore está sendo materializado primeiro como front funcional. Não construir nesta unidade banco de dados, Turso, contas persistidas, gerenciamento real de convites, hashes de senha, política definitiva de sessão, serviços reais de backend ou outra infraestrutura de servidor que dependa da futura etapa de backend.

Isso não transforma a interface em demonstração descartável. O ciclo normal de requisição da aplicação deve existir. GET, POST, handlers, middleware, navegação server-side ou client-side e demais mecanismos necessários devem ser utilizados normalmente quando fizerem parte da solução técnica. Uma operação que futuramente consultará o backend deve continuar passando pela fronteira de serviço ou contrato correspondente; somente a implementação dessa dependência é simulada.

O programador decide nomes, arquivos, tipos, composição e forma técnica dos contratos. Eles devem, porém, expressar somente necessidades já reveladas por esta unidade e ficar suficientemente separados das implementações simuladas para que o backend futuro possa assumir os mesmos contratos sem reconstruir as páginas.

## Contratos revelados por esta unidade

A autenticação precisa enviar o nome de usuário normalizado e a senha informada e receber somente o resultado necessário ao front: autenticação aceita ou credenciais inválidas. O front não necessita conhecer se o nome existe, se a senha individualmente falhou ou qualquer outra classificação de erro.

A aplicação também precisa conseguir distinguir, nas requisições e rotas pertinentes, se existe autenticação simulada vigente e precisa conseguir encerrá-la por ação explícita de logout.

Não criar nesta unidade dados de perfil, autorização administrativa, estatísticas da conta, convites ou outras respostas futuras apenas para enriquecer o contrato. O Parecer final deve registrar os nomes concretos dos contratos, serviços ou estruturas que tenham sido criados, porque eles formarão referência importante para a futura etapa de backend.

## Mock de autenticação

O mock existe somente para o Login desta unidade. Não implementar agora mocks de Cadastro, convite ou Redefinição de Senha.

Depois de aplicada REG-002 — Normalização do nome de usuário, o valor usuario representa a credencial de teste válida. Quando o nome normalizado for usuario, a autenticação é aceita independentemente do conteúdo da senha, desde que exista conteúdo no campo para que a ação Entrar possa ser utilizada.

Qualquer outro nome que alcance a tentativa de autenticação produz o resultado genérico de credenciais inválidas. Essa simulação não declara para a interface se a conta existe ou não existe e não deve produzir mensagens diferentes por causa disso.

Maiúsculas e minúsculas e espaços externos seguem REG-002. Portanto, variações que normalizem para usuario devem ser aceitas. Espaços internos não são válidos conforme a regra vigente e não criam mensagem específica nova; o Login continua apresentando somente o erro genérico já definido para falha de autenticação.

## Sessão simulada

A sessão desta unidade representa somente o estado necessário para distinguir usuário autenticado de usuário não autenticado e para permitir que essa condição seja observada ao navegar, recarregar a página ou acessar diretamente as rotas envolvidas.

Depois de um Login válido, a autenticação simulada permanece vigente sem gerenciamento de duração até que o usuário realize logout ou até que o próprio ambiente técnico deixe de conservar o mecanismo escolhido. Não implementar agora expiração de trinta dias, renovação de sete dias, invalidação de sessões anteriores, controle entre dispositivos, armazenamento de sessões em banco ou demais aspectos da política real de sessão.

Essas limitações são deliberadas. A política completa definida no produto será retomada quando o backend e a persistência de sessão forem materializados. A estrutura criada agora deve evitar tornar essa futura substituição desnecessariamente invasiva.

## Regimes de acesso

Materializar REG-001 para as páginas abertas que existem nesta unidade. Quando houver autenticação simulada vigente, acessar a Página Inicial (/) ou o Login (/entrar) deve conduzir diretamente a /principal.

A rota /principal pertence ao regime autenticado. Quando for acessada sem autenticação vigente, deve conduzir a /entrar.

Esses comportamentos devem funcionar também em acesso direto por URL e após recarregamento, não somente nas transições produzidas pelos botões da interface.

## Componentes globais no laboratório

### CMP-027 — Cabeçalho de Página e CMP-028 — Mensagem em Popup devem ser materializados primeiro como componentes globais e exercitados em /laboratorio antes de serem incorporados às páginas do produto.

O laboratório deve permitir verificar CMP-027 nas configurações necessárias para esta unidade: página sem retorno e sem saída; página com retorno e sem saída; página autenticada sem retorno e com saída. A estabilidade do espaço dos ícones, o título, a posição fixa, a responsividade e a convivência com os temas devem poder ser avaliados pelo operador.

O laboratório deve permitir exercitar CMP-028 com texto simples, presença ou ausência de ícone Font Awesome, todas as configurações de botões definidas no componente, cor semântica ou aparência padrão do tema, clique no backdrop, retorno de confirmação e cancelamento, controle de abertura e fechamento pelo chamador, posicionamento deslocado para cima e transições suaves de abertura e encerramento. A forma técnica do painel de teste é livre e não precisa se transformar em parte do produto.

Somente depois da validação desses componentes no laboratório eles devem ser utilizados na Home, no Login e na Principal mínima.

### CMP-001 — Campo de Senha não precisa ser levado ao laboratório nesta unidade. Ele pode ser materializado e validado diretamente no Login, porque pertence ao conjunto de componentes específicos da Área Aberta e será reutilizado posteriormente por poucas páginas já previstas.

## Página Inicial (/)

Revisitar a Home criada em 05.01 sem reconstruir seu conteúdo.

Substituir o título textual atual por CMP-027 — Cabeçalho de Página com o título Rememore. A região esquerda utiliza book-open sem ação de retorno e a ação de saída não aparece.

Preservar os textos já aprovados:

Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.

O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que poderiam se perder com a passagem dos dias.

Entre na sua conta ou, se recebeu um convite, comece por aqui.

Preservar as ações Entrar e Criar conta. Entrar deve passar a conduzir à rota canônica /entrar, corrigindo o destino provisório /login criado em 05.01. Criar conta permanece apontando para /cadastro; Cadastro não deve ser construído nesta unidade.

A Home continua sem seletor de tema e preserva o comportamento visual vigente. Seu título de aba já existente, Rememore, permanece. Esta unidade não cria uma regra nova de título de aba para /entrar ou /principal.

Com autenticação simulada vigente, o acesso a / deve aplicar REG-001 e conduzir a /principal antes de permitir permanência na Área Aberta.

## Login (/entrar)

Criar a página real de Login na rota /entrar.

O cabeçalho utiliza CMP-027 com o título Entrar. A região esquerda apresenta chevron-left e sua ação retorna à Página Inicial (/). A ação de saída não aparece.

A página apresenta os campos Nome de usuário e Senha. Nome de usuário é campo textual e segue REG-002. Senha utiliza CMP-001 — Campo de Senha, inicia oculta e permite alternar visibilidade sem alterar seu valor.

A ação Entrar inicia desabilitada e somente fica disponível quando os dois campos possuem conteúdo. Login não aplica a validação mínima de seis caracteres usada para definição de novas senhas; qualquer senha não vazia pode ser submetida ao contrato de autenticação.

A submissão deve utilizar o fluxo real de requisição adequado à solução construída, mantendo o mock atrás do contrato de autenticação. Não substituir o comportamento por uma condição descartável restrita ao estado local da interface.

Quando as credenciais forem inválidas, permanecer em /entrar, manter os valores dos dois campos e apresentar exatamente:

Não foi possível entrar. Confira seu nome de usuário e senha e tente novamente.

A mensagem pertence ao estado da própria página e não utiliza CMP-028. Ela permanece enquanto nome de usuário e senha não forem alterados. Alternar somente a visibilidade da senha não a remove. Depois da falha, a ação Entrar permanece inativa até que o valor de nome de usuário ou senha seja efetivamente alterado, conforme REG-003.

Quando as credenciais forem aceitas, estabelecer a autenticação simulada e conduzir a /principal.

A ação Redefinir senha deve conduzir à rota canônica /redefinir-senha. A página de Redefinição de Senha não integra esta unidade e não deve ser criada para completar o destino.

Com autenticação simulada já vigente, acessar /entrar deve aplicar REG-001 e conduzir a /principal.

## Ambiente Principal mínimo (/principal)

Criar somente a casca mínima necessária para validar a fronteira autenticada. Esta construção não materializa a futura Home autenticada completa definida no produto.

A página contém apenas CMP-027 — Cabeçalho de Página com o título Rememore. A região esquerda utiliza book-open sem retorno. A região direita apresenta permanentemente a ação de saída por arrow-right-from-bracket.

Não criar nesta unidade entradas Capturar, Encontrar Memórias, Rever um Dia, Rememorar, Minha Conta e Meus Dados, Administração, alertas de pendências, textos de orientação, métricas ou qualquer outro conteúdo futuro da Principal.

Sem autenticação simulada vigente, acessar /principal conduz a /entrar.

## Logout na Principal mínima

Acionar a saída no cabeçalho abre CMP-028 com a mensagem:

Deseja realmente sair?

O popup utiliza botões Sim e Não, não apresenta ícone e não solicita cor semântica específica, respeitando portanto a aparência padrão do tema vigente.

Sim corresponde a confirmação. A página fecha a mensagem, encerra a autenticação simulada e conduz à Página Inicial (/).

Não corresponde a cancelamento. A página fecha a mensagem, mantém a autenticação e permanece em /principal. Clicar no backdrop também corresponde a cancelamento e produz o mesmo resultado.

A confirmação não pode impedir definitivamente o logout: a ação de saída continua sempre disponível enquanto houver sessão autenticada. Nesta Principal mínima não existe trabalho em andamento que exija mensagem adicional sobre perda de dados.

## Cenários mínimos de validação funcional

O desenvolvimento deve permitir ao operador validar, no mínimo, os seguintes comportamentos:

- usuário não autenticado abre / e permanece na Home;
- usuário não autenticado abre /entrar e permanece no Login;
- usuário não autenticado acessa /principal diretamente e é conduzido a /entrar;
- tentativa com nome diferente de usuario e senha preenchida produz o erro genérico, mantém os valores e bloqueia nova tentativa até alteração de um campo;
- usuario, depois da normalização de REG-002, com qualquer senha não vazia autentica e conduz a /principal;
- variações de maiúsculas, minúsculas e espaços externos que normalizem para usuario também autenticam;
- recarregar /principal depois do Login mantém o usuário autenticado;
- usuário autenticado acessa / ou /entrar diretamente e é conduzido a /principal;
- acionar Sair e responder Não mantém a sessão e a Principal;
- acionar Sair e clicar no backdrop mantém a sessão e a Principal;
- acionar Sair e responder Sim encerra a autenticação e conduz a /;
- depois do logout, tentar acessar /principal novamente conduz a /entrar.

As verificações técnicas automatizadas ou manuais adicionais ficam a cargo do programador. Os pontos de apresentação visual e comportamento interativo devem ser validados progressivamente com o operador conforme o plano registrado no Markdown.

## Limites

Não construir Cadastro nem seus mocks de convite ou disponibilidade de nome. Não construir Redefinição de Senha. Não materializar a Principal completa. Não implementar backend real, banco, política temporal real de sessão, gerenciamento multi-dispositivo ou autorização administrativa.

Não antecipar endpoints, modelos ou respostas que o front desta unidade ainda não necessita. O contrato futuro deve nascer das necessidades concretas observadas aqui, não de uma tentativa de desenhar antecipadamente todo o backend de autenticação.

Não alterar os textos e comportamentos canônicos já definidos sem consultar o operador. Se durante a implementação surgir uma lacuna funcional não coberta por esta instrução, interromper apenas o ponto afetado e clarificá-lo com o operador; não preencher a lacuna com conhecimento próprio.

Organização de arquivos, nomes de módulos, uso de middleware ou helpers, mecanismo concreto da sessão simulada, forma de estruturar contracts/services, composição entre server rendering e Islands, estratégia de testes e demais decisões equivalentes são técnicas e pertencem ao programador, desde que satisfaçam integralmente os comportamentos definidos.

## Encerramento esperado

Quando o operador considerar a unidade concluída, o Parecer final deve registrar de forma breve o que foi efetivamente produzido, as rotas e componentes concretos, os nomes dos contratos e implementações simuladas criados, o mecanismo técnico adotado para representar a autenticação simulada, diferenças em relação ao corpo aprovado, descobertas relevantes e pontos deliberadamente deixados para o backend futuro.

## Continuidade

### Estado atual

Especificação concluída e encerrada por solicitação explícita do operador. Parecer final acrescentado e conferido no documento original do Google Drive, preservando o corpo aprovado. Não há trabalho pendente nesta unidade; a próxima será definida pelo operador. O Parecer permanece somente no Drive.

O operador definiu Astra Leve para o desenvolvimento no Codex e informou que a Especificação foi produzida com Sol Alto.

### Entrega da etapa 1 — 08/09/2026

- CMP-027: `components/PageHeader.tsx`, com título e callbacks opcionais de retorno e saída. As regiões laterais têm largura estável; o cabeçalho permanece fixo no topo.
- CMP-028: `components/MessagePopup.tsx`, com abertura controlada pelo chamador, texto simples, ícone opcional, seis cores semânticas, seis configurações de ações e resultados `confirm`/`cancel`. Usa dialog nativo e transições de 180 ms, respeitando redução de movimento. O backdrop comunica cancelamento; o componente não toma a decisão funcional de fechar.
- `islands/LaboratorioComponents.tsx` reúne as amostras em `/laboratorio#componentes`. O teste opcional de manter aberto após o primeiro resultado demonstra o controle pelo chamador; nessa amostra, o segundo resultado fecha o popup.
- O operador atualizou os recursos locais para Font Awesome Free 7.3.1. A folha é carregada no laboratório; o ícone de saída agora usa `fas fa-arrow-right-from-bracket`, substituindo o SVG isolado. As classes dos demais ícones usados continuam disponíveis nessa versão.
- Verificações concluídas: `deno fmt` dos cinco arquivos de código/estilo envolvidos, lint e tipos dos quatro arquivos TSX, e `deno task build`. Todos passaram. Componentes posteriormente validados pelo operador, incluindo os ajustes de Esc e Font Awesome.
- Validação explícita recebida: “Ficou ótimo! Etapa Validada! siga para a próxima.”

### Entrega da etapa 2 — 08/09/2026

- Home utiliza `PageHeader`, preserva os textos e conduz a `/entrar`. Font Awesome é carregado em `routes/_app.tsx` para os componentes globais.
- `routes/entrar.tsx` recebe POST nativo; `islands/Login.tsx` mantém o estado interativo e usa `components/PasswordField.tsx` (CMP-001). Falha devolve a página com os dois valores preservados e a mensagem canônica. A senha permanece exatamente como informada; somente a presença de conteúdo usa a verificação de espaços.
- Contratos `Credentials`, `AuthenticationResult`, `AuthenticationService` e `SessionService` em `app/services/auth/contracts.ts`. O ponto de composição `app/services/auth.ts` liga os contratos a `mockAuthentication` e `mockSession`, em `app/services/auth/mock.ts`. Normalização e presença de conteúdo são compartilhadas por `app/utils/login.ts`.
- `routes/_middleware.ts` aplica os regimes de acesso somente a `/`, `/entrar` e `/principal`, com respostas sem cache. Laboratório e destinos futuros não recebem regras novas.
- A sessão usa o cookie marcador `rememore_mock_auth`, HttpOnly, SameSite=Lax, Path=/ e Secure em HTTPS. Não define duração, não armazena dados pessoais, não usa banco nem representa autenticação real. O backend futuro substituirá os serviços no ponto de composição. No logout, o cookie é removido.
- `routes/principal.tsx` e `islands/Principal.tsx` materializam somente o cabeçalho e a confirmação de saída. O POST de `/principal` encerra a sessão e redireciona a `/`. A implementação de logout foi antecipada para permitir ao operador repetir os testes de Login; a validação integrada continua pendente.
- Verificações concluídas: formatação e lint dos arquivos envolvidos, tipos das rotas, `deno task build`, dois testes em `app/services/auth/mock_test.ts` e um teste HTTP integrado em `tests/auth_flow_test.ts` (executar após build com `deno test -A tests/auth_flow_test.ts`). Todos passaram. O teste HTTP cobre páginas abertas, proteção, falha preservando campos e desabilitando Entrar, normalização, requisições sucessivas autenticadas e logout.
- Pendente com o operador: layout do Login e Home, habilitação por conteúdo, edição efetiva após falha, visibilidade da senha sem remover erro, navegação e recarregamento no navegador, cancelamento do logout por Não/backdrop/Esc e ciclo completo. Etapa e Especificação ainda não encerradas.

### Decisões funcionais complementares

Retorno posterior do operador: implementações aprovadas com ajuste da mensagem de erro para abaixo das ações do Login, evitando deslocar campos e botão quando aparecer. Ajuste realizado. Os diretórios `services` e `utils` foram movidos para `app/`, com imports e referências técnicas atualizados. O arquivo `utils.ts` do Fresh permanece na raiz. Testes unitários não têm meta de cobertura: ficam a critério do programador conforme sua utilidade; os atuais foram mantidos para conferir esta reorganização e a fronteira simulada enquanto a unidade estiver aberta. Próximo ponto: conferência final do ajuste e dos cenários integrados pelo operador; encerramento somente mediante solicitação explícita.

Durante a validação do popup, o operador definiu que Esc deve produzir cancelamento, assim como Não, Cancelar e backdrop, inclusive sem ações visíveis. O chamador continua decidindo se fecha. A implementação intercepta a tecla antes do fechamento nativo e ignora repetição por tecla mantida pressionada. Validar também reabertura após Esc e o modo do laboratório que fecha somente no segundo resultado.

Nome de usuário e senha compostos somente por espaços são considerados vazios e não habilitam Entrar. Essa decisão complementa a presença de conteúdo exigida no corpo aprovado. A normalização do nome permanece conforme REG-002; a decisão não autoriza remover espaços de uma senha que também contenha outros caracteres.

### Plano mínimo de execução

1. **Componentes globais no laboratório — validados pelo operador.** Construir CMP-027 e CMP-028 e seus controles de teste em `/laboratorio`, reutilizando a fundação visual. Verificar tecnicamente e apresentar ao operador todas as configurações, temas, responsividade, posição fixa, resultados das ações, backdrop e transições. **Aguardar validação do operador antes de incorporar os componentes às páginas reais.**
2. **Fronteira de autenticação e páginas — concluída.** Criar os contratos mínimos, mock de autenticação e mecanismo de estado simulado; implementar os regimes de acesso em requisições reais. Incorporar o cabeçalho à Home, corrigir o destino para `/entrar`, construir Login com CMP-001 e a Principal mínima. Verificar normalização, campos vazios ou somente com espaços, falha preservando valores, bloqueio de nova tentativa, edição efetiva e alternância de visibilidade. Apresentar o fluxo de entrada, acesso direto e recarregamento para validação do operador.
3. **Logout e validação integrada — concluídos.** Incorporar o popup de confirmação à Principal; ligar confirmação ao encerramento do estado simulado e retorno à Home. Verificar cancelamento por Não e backdrop, disponibilidade da saída e proteção após logout. Apresentar ao operador o ciclo completo e conferir todos os cenários mínimos do corpo aprovado.

As verificações técnicas serão proporcionais a cada etapa. A validação visual e interativa pertence ao operador. Registrar aqui resultados, ajustes, etapa corrente e pendências à medida que o trabalho avançar. O encerramento e o Parecer final dependem de solicitação do operador.
