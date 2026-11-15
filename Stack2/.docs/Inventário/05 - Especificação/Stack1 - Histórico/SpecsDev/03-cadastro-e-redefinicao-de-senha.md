# 03 - Cadastro e Redefinição de Senha

## Estado

Terceira unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar o restante
funcional da Área Aberta: Cadastro, Confirmação do Cadastro, Redefinição de Senha e Confirmação da Redefinição. A partir desta aprovação, o
corpo permanece como registro histórico imutável da unidade e somente poderá receber Parecer final quando o operador encerrar o
desenvolvimento.

## Origem funcional

04.03 - Especificação Funcional - Área Aberta / Cadastro, Confirmação do Cadastro, Redefinição de Senha e Confirmação da Redefinição.

04.04 - Regras - Área Aberta / REG-001, REG-002, REG-004, REG-005, REG-006, REG-007, REG-008, REG-009, REG-010, REG-011 e REG-012.

04.05 - Componentes - Área Aberta / CMP-001 — Campo de Senha e CMP-002 — Confirmação de nova chave; além dos componentes globais CMP-027 —
Cabeçalho de Página e CMP-028 — Mensagem em Popup já materializados.

04.02 - Mapa do Site / Área pública, rotas /cadastro, /cadastro/confirmacao, /redefinir-senha e /redefinir-senha/confirmacao.

03.01 - Criar conta por convite e 03.03 - Redefinir senha.

02.06 - Conta, Dados e Administração / Convites, Criação da conta, Redefinição de senha, Chave administrativa e Sessão, observados somente
nos limites que esta unidade consegue simular sem backend real.

## Autossuficiência da instrução

As referências acima registram somente a origem documental usada para elaborar esta unidade. O programador não deve consultá-las para
completar a instrução. Durante o trabalho, seu contexto funcional é o Contexto do Desenvolvimento do Rememore, esta Especificação e o código
necessário à unidade. Os identificadores REG e CMP abaixo são mantidos para rastreabilidade, mas os comportamentos necessários estão
integralmente descritos aqui.

## Objetivo

Materializar as quatro rotas restantes da Área Aberta como páginas reais do front, reutilizando a fronteira de autenticação, sessão simulada
e componentes já construídos em 05.02. Ao final, Cadastro e Redefinição devem funcionar por requisições e navegação reais, com mocks mínimos
atrás de contratos substituíveis pelo backend futuro, e ambas as jornadas devem convergir para o mesmo componente de confirmação de nova
chave.

Esta unidade deve encerrar a materialização funcional do front prevista atualmente para 04.03 - Especificação Funcional - Área Aberta. Isso
não encerra a política real de sessão, persistência, contas, convites ou chaves, que continuam dependentes do backend futuro.

## Condução da unidade

Antes de criar ou atualizar a cópia Markdown operacional, o programador deve ler a instrução, examinar somente o código necessário e
realizar com o operador a rodada inicial de clarificação funcional prevista no contexto permanente. Qualquer ponto que exija inventar regra,
texto, navegação, estado, resposta ou limite funcional deve ser esclarecido antes do plano.

A unidade deve ser executada por etapas com validação progressiva. CMP-002 pode ser construído e validado diretamente na primeira
confirmação, sem necessidade de laboratório isolado; depois deve ser reutilizado na segunda confirmação. Cadastro, confirmação, Redefinição
e integração final dos regimes de acesso devem ser verificáveis separadamente antes do encerramento.

## Fronteira entre front e backend

O Rememore continua sendo materializado primeiro como front funcional. Não construir banco de dados, Turso, contas persistidas, consumo real
de convites, hashes de senha, persistência real de chaves, política definitiva de sessão, invalidação multi-dispositivo ou infraestrutura
administrativa real.

As páginas, rotas, GET/POST, handlers, middleware, navegação e estados de interface devem ser reais. Operações que futuramente dependerão do
backend devem passar por serviços ou contratos próprios; somente a implementação externa permanece simulada. Reutilize e estenda as
estruturas existentes em app/services quando forem adequadas, inclusive a fronteira criada em 05.02, sem criar um segundo sistema paralelo
de autenticação ou sessão.

05.02 materializou Credentials, AuthenticationResult, AuthenticationService e SessionService em app/services/auth/contracts.ts, com
composição em app/services/auth.ts e sessão simulada por cookie. A organização técnica pode evoluir se necessário, mas a nova unidade deve
integrar-se a essa fronteira em vez de reconstruí-la.

## Regras incorporadas à unidade

### REG-001 — Usuário autenticado não permanece na Área Aberta

As quatro novas rotas pertencem à Área Aberta. Com autenticação simulada vigente, acessar /cadastro, /cadastro/confirmacao, /redefinir-senha
ou /redefinir-senha/confirmacao por clique, URL direta ou recarregamento deve conduzir imediatamente a /principal. Sem autenticação,
Cadastro e Redefinição funcionam normalmente; as confirmações exigem adicionalmente um contexto pendente válido da operação que as originou.

### REG-002 — Normalização do nome de usuário

O nome de usuário não diferencia maiúsculas de minúsculas. Espaços somente no início ou no fim são ignorados para identificação; espaços
internos não são permitidos em um nome válido. A mesma interpretação deve ser usada pelo formulário e pelos contratos. No mock desta
unidade, valores que normalizem para usuario representam o único nome aceito.

### REG-004 — Sessão após autenticação bem-sucedida, adaptada ao mock

Nas duas confirmações, uma resposta Sim ao alerta de guarda da chave estabelece a mesma autenticação simulada usada em 05.02 e conduz a
/principal. Não implementar duração, renovação, invalidação real de sessões anteriores, concorrência entre dispositivos ou persistência de
sessão em banco.

### REG-005 — Validade mínima da senha

Toda nova senha definida em Cadastro ou Redefinição deve possuir pelo menos seis caracteres. Não existe campo separado de confirmação. O
mock aceita qualquer senha que tenha ultrapassado essa validação funcional.

### REG-006 — Erros associados ao campo

No Cadastro, convite inválido, nome de usuário inválido e senha inválida são erros atribuíveis aos respectivos campos. Mais de um erro pode
ser apresentado na mesma tentativa. Alterar o valor de um campo remove somente o erro daquele campo. O destaque visual e a posição exata
permanecem sujeitos ao layout, mas a associação entre campo e mensagem deve ser inequívoca.

### REG-007 — Origem do convite

Acesso normal a /cadastro apresenta o convite vazio e editável. A URL /cadastro?convite=valor preenche o campo com valor e o mantém somente
leitura. O parâmetro pode conter qualquer texto; somente usuario é convite válido no mock. Assim, /cadastro?convite=usuario permite sucesso
e /cadastro?convite=qualquer-outro-valor mantém o campo somente leitura, mas a submissão é recusada pelo mock.

### REG-008 — Conclusão do Cadastro

Uma criação aceita conduz a /cadastro/confirmacao com uma nova chave de redefinição. A conta, o consumo do convite e a emissão da chave são
representados apenas pelo resultado do mock; nenhuma sessão é criada nesse momento. O mock não persiste conta nem consumo do convite, para
que o cenário possa ser repetido durante os testes. A autenticação só ocorre na confirmação, depois da resposta Sim ao alerta de guarda da
chave.

### REG-009 — Confirmação de nova chave

Uma nova chave do usuário emitida depois de Cadastro ou Redefinição é apresentada em etapa de confirmação ainda pública. A chave é somente
leitura, permanece visível enquanto existir o contexto pendente e pode ser selecionada ou copiada manualmente. A chave real emitida pelo
produto é um UUID; o mock deve fornecer à confirmação uma chave textual nesse formato, sem transformar o formato em regra de validação do
campo de Redefinição.

Copiar é opcional. O botão Copiar chave usa apenas o ícone Font Awesome Free copy. O ícone não muda para check. Quando a cópia pelo botão
for bem-sucedida, apresentar abaixo do campo: “Chave copiada. Guarde-a em um local seguro.” A mensagem desaparece automaticamente após
alguns segundos; nova cópia bem-sucedida pode reapresentá-la. Se a cópia programática falhar ou não estiver disponível, não exibir a
mensagem de sucesso e não bloquear Entrar; a seleção e cópia manual continuam possíveis.

Entrar permanece disponível desde que a confirmação válida esteja sendo exibida. Ao acioná-lo, abrir CMP-028 como alerta de atenção com a
mensagem: “Você já guardou sua chave de redefinição? Ela não poderá ser exibida novamente depois que você sair desta página.” Ações: Sim e
Não. Sim confirma e autentica; Não, backdrop e Esc cancelam e mantêm a mesma confirmação com a chave visível.

### REG-010 — Origem da chave na Redefinição

A chave de redefinição pode ser digitada manualmente ou vir por /redefinir-senha?chave=valor. Quando vier pelo parâmetro, somente a chave é
preenchida; o nome de usuário continua vazio. Em qualquer origem, o campo da chave permanece editável. O sistema não lê a área de
transferência automaticamente.

### REG-011 — Validação da Redefinição

Redefinir senha só pode ser acionado quando nome de usuário, chave e nova senha possuem conteúdo. Antes do mock, validar localmente somente
a nova senha pelo mínimo de seis caracteres. A chave é texto opaco: não validar UUID, comprimento, prefixo, caracteres ou qualquer outra
estrutura. Isso é deliberado, pois o backend futuro fará comparação textual com a representação válida armazenada.

Depois da senha localmente válida, nome de usuário e chave são validados conjuntamente. O front não distingue chave do usuário de chave
administrativa. Se a combinação falhar, permanecer em /redefinir-senha e apresentar exatamente: “Não foi possível redefinir a senha. Confira
as informações e tente novamente.” A mensagem não revela qual informação falhou nem o tipo de chave. Alterar nome de usuário ou chave remove
esse erro conjunto. Alterar somente a nova senha não remove o erro conjunto.

### REG-012 — Conclusão da Redefinição

Uma redefinição aceita substitui conceitualmente a senha, invalida as chaves anteriores aplicáveis e as sessões existentes e emite nova
chave do usuário, mas essas persistências não são simuladas integralmente. O mock produz somente o resultado necessário ao front e a nova
chave; nenhuma sessão é criada até a confirmação. O mock permanece repetível: usuario continua sendo a chave de teste aceita mesmo depois de
um sucesso.

## Componentes incorporados ou reutilizados

### CMP-001 — Campo de Senha

Reutilizar o componente já materializado. O valor inicia oculto, pode alternar visibilidade e essa alternância nunca conta como edição. Em
Cadastro e Redefinição, a página chamadora aplica a validação mínima de seis caracteres.

### CMP-002 — Confirmação de nova chave

Construir componente compartilhado pelas duas confirmações. Recebe mensagem contextual, chave somente leitura e a informação de apresentação
única. Oferece Copiar chave com ícone copy, feedback temporário de sucesso e Entrar com alerta de guarda da chave. O componente não
condiciona Entrar à observação de cópia e não mantém estados funcionais chave copiada/não copiada.

Mensagem contextual no Cadastro: “Sua conta foi criada. Guarde esta chave: ela será necessária caso você precise redefinir sua senha no
futuro.”

Mensagem contextual na Redefinição: “Sua senha foi redefinida. Guarde esta nova chave: ela será necessária caso você precise redefinir sua
senha novamente no futuro.”

Informação comum: “Esta chave será exibida somente agora. O Rememore não poderá mostrá-la novamente depois que você sair desta página.”

### CMP-027 — Cabeçalho de Página

Reutilizar o componente global existente. /cadastro = título “Criar conta”, chevron-left para /, sem saída. /redefinir-senha = título
“Redefinir senha”, chevron-left para /entrar, sem saída. /cadastro/confirmacao = título “Conta criada”, book-open sem retorno e sem saída.
/redefinir-senha/confirmacao = título “Senha redefinida”, book-open sem retorno e sem saída.

### CMP-028 — Mensagem em Popup

Reutilizar o componente global existente para o alerta ao acionar Entrar nas confirmações. Deve funcionar com Sim/Não, backdrop e Esc
conforme já materializado. Usar aparência semântica de atenção. Confirmação e cancelamento são interpretados pela página; o popup não
autentica por conta própria.

## Contratos e mocks revelados por esta unidade

O Cadastro precisa enviar convite, nome de usuário normalizado e senha e receber somente o necessário ao front: cadastro aceito com nova
chave, ou rejeições atribuíveis aos campos convite, nome de usuário e senha. O front não precisa receber dados de conta, perfil, datas de
convite ou detalhes administrativos.

O mock de Cadastro aceita sucesso somente quando convite é exatamente usuario, o nome normaliza para usuario e a senha possui pelo menos
seis caracteres. Qualquer outro convite produz o erro de convite; qualquer outro nome produz o erro de nome; senha curta produz o erro de
senha. Erros aplicáveis podem coexistir. O mock é stateless: não consome definitivamente usuario nem cria uma conta persistida.

A Redefinição precisa enviar nome de usuário normalizado, chave textual e nova senha e receber somente redefinição aceita com nova chave ou
redefinição rejeitada. Depois da validação local da senha, o mock aceita sucesso somente quando nome normalizado = usuario e chave =
usuario. Todo o restante produz a falha genérica. O valor usuario é apenas fixture do mock e não representa o formato real da chave.

Em todo sucesso de Cadastro ou Redefinição, produzir uma nova chave textual no formato UUID para exibição na confirmação. A técnica concreta
de geração é decisão técnica; o contrato deve tratá-la como string opaca.

## Cadastro (/cadastro)

Criar a página real na rota /cadastro com CMP-027, os campos Convite, Nome de usuário e Senha, as informações de estágio experimental e
privacidade, a ação Criar conta e os estados de validação.

Texto de estágio experimental: “Esta é uma versão experimental do Rememore. O sistema já pode ser utilizado, mas ainda está em
desenvolvimento e não podemos garantir a manutenção permanente dos dados nesta fase.”

Texto de privacidade: “Suas memórias são pessoais. O conteúdo que você registra não fica disponível para leitura por outras pessoas nem pelo
administrador do Rememore.”

Convite segue REG-007. Nome de usuário segue REG-002. Senha usa CMP-001 e REG-005. Criar conta inicia desabilitado e só fica disponível
quando os três campos possuem conteúdo. Ao submeter, usar fluxo real de requisição e o serviço de Cadastro; não resolver o mock apenas por
condição descartável no estado da interface.

Mensagens exatas: convite inválido = “Não foi possível usar este convite. Confira o código recebido e tente novamente.”; nome inválido =
“Este nome de usuário não pode ser utilizado. Escolha outro e tente novamente.”; senha inválida = “A senha deve ter pelo menos 6
caracteres.”

Com sucesso, criar o contexto pendente da confirmação e conduzir a /cadastro/confirmacao sem estabelecer autenticação.

## Confirmação do Cadastro (/cadastro/confirmacao)

A rota só permanece quando existe um contexto pendente produzido por Cadastro aceito. Acesso direto sem esse contexto conduz a /. Se houver
autenticação simulada vigente, REG-001 prevalece e conduz a /principal. O mecanismo técnico do contexto pendente é decisão do programador,
mas a chave não deve ser colocada na URL. Enquanto o contexto pendente existir, recarregar a rota deve manter a confirmação e a chave.

Renderizar CMP-027 e CMP-002 com o contexto de conta criada. Entrar abre o alerta definido em REG-009. Sim estabelece a sessão simulada
existente, encerra o contexto pendente e conduz a /principal. Não, backdrop ou Esc preservam a confirmação. Depois que o usuário sair
definitivamente da etapa ou autenticar, a chave não deve poder ser recuperada pela própria interface.

## Redefinição de Senha (/redefinir-senha)

Criar a página real na rota /redefinir-senha com CMP-027, Nome de usuário, Chave de redefinição, Nova senha, ação Redefinir senha e retorno
pelo cabeçalho para /entrar.

Nome segue REG-002. Chave é campo textual editável e pode ser pré-preenchida por ?chave=. Nova senha usa CMP-001 e REG-005. Redefinir senha
inicia desabilitado e só fica disponível quando os três campos possuem conteúdo.

Ao submeter, validar primeiro somente a nova senha. Senha curta apresenta “A senha deve ter pelo menos 6 caracteres.” associada ao campo e
não chama o mock. Com senha válida, enviar nome normalizado e chave textual ao serviço. Não validar formato UUID ou comprimento da chave.

Se o serviço rejeitar, manter os valores e apresentar abaixo da região de ações, sem revelar o motivo: “Não foi possível redefinir a senha.
Confira as informações e tente novamente.” O erro conjunto desaparece quando nome ou chave é alterado. Não existe bloqueio de nova tentativa
equivalente a REG-003 do Login: enquanto os campos permitirem submissão, nova tentativa pode ser feita.

Com sucesso, criar o contexto pendente da confirmação e conduzir a /redefinir-senha/confirmacao sem estabelecer nova sessão.

## Confirmação da Redefinição (/redefinir-senha/confirmacao)

A rota só permanece quando existe contexto pendente produzido por redefinição aceita. Acesso direto sem contexto conduz a /. Se houver
autenticação vigente, REG-001 conduz a /principal. A chave não deve ser colocada na URL. Recarregamento com contexto pendente mantém a
etapa.

Renderizar CMP-027 e CMP-002 com o contexto de senha redefinida. Entrar abre o mesmo alerta. Sim estabelece nova autenticação simulada e
conduz a /principal; Não, backdrop ou Esc preservam a confirmação. A política real de invalidação das sessões antigas permanece fora desta
unidade.

## Regimes de acesso e integração

Estender a proteção já criada em 05.02 para que todas as quatro novas rotas públicas apliquem REG-001 em requisições reais. Não proteger
apenas os links. /principal continua exigindo autenticação. Acesso autenticado a qualquer rota desta unidade deve terminar em /principal
antes de permitir permanência na página pública.

## Cenários mínimos de validação funcional

O desenvolvimento deve permitir ao operador validar, no mínimo: /cadastro manual com convite editável; /cadastro?convite=usuario com convite
preenchido e somente leitura; parâmetro de convite inválido também somente leitura e rejeitado; usuario com convite usuario e senha de seis
ou mais caracteres conclui Cadastro; erros de convite, nome e senha aparecem nos campos pertinentes e somem individualmente quando o campo
muda; sucesso conduz à confirmação sem autenticar.

Na confirmação: chave UUID visível e somente leitura; seleção manual possível; botão com ícone copy; cópia bem-sucedida mostra “Chave
copiada. Guarde-a em um local seguro.” e a mensagem some após alguns segundos; Entrar funciona mesmo sem cópia observada; Não, backdrop e
Esc mantêm a confirmação; Sim autentica e conduz a /principal; acesso direto sem contexto retorna a /; usuário autenticado é conduzido a
/principal.

Na Redefinição: acesso manual e ?chave= preenchem corretamente; a chave permanece editável; senha com menos de seis caracteres falha
localmente sem chamar o mock; usuario + usuario + senha válida produz sucesso; qualquer outra combinação de nome/chave produz a mensagem
genérica; o front não rejeita chaves por não parecerem UUID; sucesso conduz à segunda confirmação sem autenticar.

Depois da confirmação positiva de Redefinição, /principal permanece autenticada e as rotas públicas voltam a redirecionar conforme REG-001.
Verificações técnicas adicionais, testes automatizados e escolhas de cobertura pertencem ao programador.

## Limites

Não construir backend real, banco, persistência de contas ou convites, controle real de convite utilizado, armazenamento ou hash de chaves,
chave administrativa real, política definitiva de sessão, invalidação multi-dispositivo, Principal completa ou Administração.

Não criar validação local de UUID para a chave informada na Redefinição. Não tornar cópia programática obrigatória. Não trocar o ícone copy
por check depois da cópia. Não adicionar confirmação de senha. Não revelar se uma falha de Redefinição veio do usuário ou da chave.

Não antecipar modelos, endpoints, respostas ou dados que as quatro páginas não precisam. Se durante a implementação surgir uma lacuna
funcional não coberta por esta instrução, interromper somente o ponto afetado e clarificá-lo com o operador; não completar com conhecimento
próprio.

## Encerramento esperado

Quando o operador considerar a unidade concluída, o Parecer final deve registrar brevemente as quatro rotas produzidas, CMP-002 e eventuais
ajustes nos componentes reutilizados, os nomes concretos dos contratos e mocks criados, o mecanismo técnico usado para manter o contexto
pendente das confirmações, a forma de geração da chave UUID simulada, diferenças em relação ao corpo aprovado, descobertas relevantes e
pendências deliberadamente reservadas ao backend.

## Continuidade

Fonte: [05.03 - Cadastro e Redefinição de Senha](https://docs.google.com/document/d/1AAYNsQkdEWrP0YPlgmOpO9OpNnQSo3YSkpiBlORO5yU). Leitura
em 09/09/2026.

### Clarificação aprovada

O contexto pendente sobrevive ao recarregamento e à navegação durante a sessão da mesma aba. Não detectar saída para outra página ou site.
Sim consome explicitamente o contexto; encerrar a sessão da aba pode removê-lo naturalmente. Depois do consumo, a interface não recupera a
chave como dado da conta. O operador autorizou prosseguir mantendo os textos originais, inclusive a orientação sobre sair da página.

### Plano e estado

1. Cadastro e confirmação com CMP-002 testados e fonte revisado pelo operador, que aprovou a primeira etapa. Ajuste posterior de mensagem e
   rótulos aprovado. Verificações Deno realizadas com sucesso na segunda etapa.
2. Concluída: Redefinição e segunda confirmação reutilizando CMP-002, tecnicamente verificadas e validadas pelo operador.
3. Concluída: integração dos quatro regimes de acesso verificada por testes HTTP e avaliação final do operador. Unidade encerrada por sua determinação.

O operador informou que testou o que foi construído e verificou o fonte, com resultado aprovado.

### Entrega da primeira etapa

Implementados `/cadastro`, `/cadastro/confirmacao`, `Registration` e `NewKeyConfirmation` (CMP-002). A island de confirmação foi extraída
para `KeyConfirmation` na segunda etapa, compartilhando o mecanismo de contexto e os estados entre as duas jornadas. `PasswordField` aceita
autocomplete de nova senha, preservando o padrão do Login. Middleware protege as duas novas rotas.

`RegistrationService` e `PendingKeyService` são compostos em `app/services/auth.ts`. O mock guarda somente contextos transitórios em
memória, com identificador e chave distintos gerados por `crypto.randomUUID()`. O navegador guarda somente o identificador em
`sessionStorage` (`rememore:pending:registration`). POST de leitura recupera a chave; POST de confirmação consome o identificador e
estabelece a sessão existente. GET da confirmação entrega uma island sem chave; a verificação do contexto da aba ocorre após hidratação,
pois sessionStorage não acompanha requisições GET. Sem contexto válido, a interface retorna à Home.

Limitação do mock: reiniciar o processo servidor perde os contextos pendentes. Fechar a sessão da aba elimina o acesso ao identificador, mas
entradas abandonadas no mock permanecem em memória até reiniciar o processo; não existe recuperação por nome de usuário ou dados de conta.
Nenhuma persistência real foi adicionada.

Verificação atual: formatação e lint dos arquivos alterados, `deno check`, build, cinco testes dos serviços de autenticação e dois testes
HTTP passaram. O Deno 2.9.6 foi localizado pelo processo da aplicação, no diretório de pacotes do WinGet; sua execução exigiu acesso fora do
sandbox. A limitação anterior de verificação está resolvida. Os testes HTTP usam o build local, sem interferir na sessão do navegador do
operador.

Roteiro do operador: Cadastro manual e com parâmetro de convite válido/inválido; erros simultâneos e remoção individual; sucesso com
convite/nome `usuario` e senha de seis caracteres; recarregar confirmação e navegar para fora/voltar na mesma aba; copiar opcionalmente;
cancelar alerta por Não, Esc e backdrop; Sim autentica; sair da sessão e revisitar confirmação consumida retorna à Home.

### Ajuste aprovado de CMP-028 e alerta da chave

Após validar a primeira etapa, o operador aprovou rótulos opcionais personalizados no popup: `confirmLabel` e `cancelLabel`. Eles alteram
somente o texto apresentado; `actions` mantém quais botões existem e `onResult` continua retornando `confirm` ou `cancel`. Sem
personalização, os textos anteriores permanecem. Usos revisados: confirmação de saída na Principal e exemplos no Laboratório; ambos
continuam com seus rótulos e comportamentos existentes. Esc e backdrop continuam produzindo cancelamento.

No CMP-002, mensagem aprovada: “Você já guardou sua chave de redefinição? Depois de entrar, ela não poderá ser exibida novamente.” Botões:
“Já guardei, entrar” e “Voltar e guardar”. Esta decisão substitui o texto original do alerta para a implementação; o corpo histórico acima
permanece preservado. A informação fora do popup não foi alterada.

### Orientação obrigatória para o Parecer final

Quando o operador solicitar o encerramento, incluir no Parecer final do Drive o pedido ao analista: revisitar as mensagens já criadas e
decidir, ao preparar a próxima Especificação, se convém revisar suas mensagens e os textos de seus botões; usar a nova funcionalidade de
rótulos personalizados do CMP-028 nas próximas mensagens. Registrar também a mudança aprovada do alerta da chave e a compatibilidade dos
usos existentes. Orientação incluída no Parecer final, acrescentado ao Drive e conferido no encerramento; os outros textos não foram alterados.

### Entrega da segunda etapa

Implementados `/redefinir-senha` e `/redefinir-senha/confirmacao`, a island `ResetPassword` e o contrato `PasswordResetService`, composto em
`app/services/auth.ts` com `mockPasswordReset`. Nova senha é validada antes da requisição e no handler antes de chamar o serviço; a chave é
enviada literalmente, sem validação estrutural. O erro conjunto permanece ao editar apenas a senha e é removido ao editar nome ou chave. Não
há bloqueio de nova tentativa após rejeição.

`KeyConfirmation` e `NewKeyConfirmation` são reutilizados pelas duas confirmações. Cada contexto pendente registra sua operação
(`registration` ou `passwordReset`); `PendingKeyService` verifica a origem antes da leitura ou consumo. A Redefinição guarda seu
identificador em `rememore:pending:passwordReset` no sessionStorage. O middleware aplica o regime público às quatro rotas, em GET e POST.

Testes adicionados: `app/services/auth/registrationMock_test.ts` verifica erros de Cadastro, normalização, comparação textual da chave,
origem do contexto, leituras repetidas e consumo único; `tests/password_flows_test.ts` verifica os dois fluxos HTTP e a proteção das quatro
rotas. Também passou o teste HTTP anterior de Login e logout. Avaliação visual e eventos no navegador continuam com o operador.

Para validar: abrir `/redefinir-senha` manualmente e com `?chave=usuario`; confirmar chave editável e usuário vazio; tentar senha curta;
testar combinação inválida e a remoção do erro somente ao alterar nome ou chave; obter sucesso com nome/chave `usuario` e senha de seis
caracteres; recarregar a confirmação; cancelar e confirmar o alerta; conferir Principal autenticada e redirecionamentos públicos. Após a
extração da island compartilhada, revisitar também a confirmação de Cadastro. O operador confirmou código e site validados antes do encerramento.

### Encerramento

Especificação 03 encerrada por determinação do operador. Código e site aprovados; nenhuma tarefa de implementação pendente nesta unidade.
O documento original foi relido e recebeu somente um Parecer final, com leitura de confirmação: corpo anterior preservado integralmente,
orientação ao analista incluída e 42% de uso de contexto registrado conforme informação do operador. O Parecer permanece somente no Drive.
