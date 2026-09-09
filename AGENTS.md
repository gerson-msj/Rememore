# Contexto de desenvolvimento do Rememore

Estas instruções se aplicam somente a este projeto. Leia este arquivo no início de cada sessão de desenvolvimento. Ele acompanha o repositório para preservar o contexto entre sessões e computadores.

Fonte: [Contexto do Desenvolvimento do Rememore](https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit), no Google Drive, em Projetos → Rememore. Este arquivo foi preparado em 05/09/2026 e atualizado contra o documento integral em 08/09/2026.

Este `AGENTS.md` cumpre o papel do arquivo `.agent` mencionado na fonte: é o contexto permanente do programador e deve conter as orientações necessárias para iniciar novas sessões sem reler normalmente o documento do Drive. A leitura da fonte serve para criar ou ajustar este arquivo; volte ao documento completo somente quando o operador solicitar ou quando for necessário reconstruir o contexto. Preserve aqui orientações curtas e operacionais, mantendo seu significado e seus detalhes relevantes, sem acrescentar convenções ainda não estabelecidas pelo projeto.

## Projeto e ambiente

O Rememore evolui progressivamente a partir de documentação anterior ao código. Descoberta, Consolidação, Fluxos e Funcionalização formaram a base do produto; a etapa atual transforma esse conhecimento em software executável, uma unidade por vez.

A base tecnológica definida é Deno e Fresh, TypeScript/TSX e Preact, Bulma para CSS e Font Awesome para ícones. Turso, com libSQL/SQLite, será usado para persistência quando ela fizer parte da construção. Isso não implica que todos esses recursos já estejam implementados.

Há um operador humano tecnicamente familiarizado com o projeto, que acompanha o desenvolvimento e participa das decisões.

## Início e escopo de cada sessão

1. Leia este `AGENTS.md`.
2. Leia `.docs/README.md` e os documentos de memória técnica indicados ali para leitura inicial. Atualmente, leia também `.docs/memoria-tecnica.md`.
3. Leia somente a Especificação indicada explicitamente pelo operador para iniciar ou continuar a sessão, no Google Drive ou em `.docs/especificacoes/`, conforme a indicação. Não consulte os documentos citados por ela como origem, salvo solicitação explícita do operador.
4. Examine somente o código necessário para compreender e executar esse trabalho, aproveitando o conhecimento já preservado em `.docs/`.
5. Antes de criar ou atualizar a cópia Markdown operacional da Especificação, faça uma rodada inicial de clarificação com o operador.
6. Somente depois dessa clarificação, crie ou atualize a cópia Markdown operacional e transforme a Especificação em um plano mínimo de execução, organizando a ordem das etapas e os pontos de validação com o operador.

Cada Especificação é uma unidade delimitada: página, componente, comportamento, CSS, experimento de arte ou design, infraestrutura ou outro recorte definido como trabalho independente. A Especificação corrente determina o limite do trabalho.

Ela contém somente as informações consideradas necessárias para aquela construção e deve ser autossuficiente para o trabalho solicitado. O fato de alguma informação não estar nela não significa que ela não exista: há uma estrutura documental maior e também código produzido por especificações anteriores. Porém essa documentação maior não é contexto de leitura do programador. Quando a Especificação mencionar regras, componentes, fluxos ou documentos anteriores, a referência serve apenas como rastreabilidade; todo detalhe funcional necessário ao trabalho deve estar reproduzido ou adaptado no próprio corpo da Especificação.

O desenvolvimento não será realizado de uma única vez nem pela leitura integral da documentação. O projeto evolui deliberadamente uma unidade por vez; aquilo que ainda não foi pedido poderá ser tratado em uma Especificação posterior.

Não liste, percorra ou consulte Especificações anteriores ou futuras por iniciativa própria, mesmo que estejam em um diretório do repositório. Não leia toda a documentação nem tente reconstruir o sistema inteiro como contexto inicial. A ausência de uma informação na Especificação não significa que ela não exista na documentação maior ou no código anterior.

## Clarificação funcional antes do plano

A primeira interpretação da Especificação não deve ser transformada silenciosamente em plano ou código. Antes de escrever a cópia Markdown operacional, apresente ao operador seu entendimento do escopo e reúna as dúvidas funcionais encontradas na leitura da Especificação e do código necessário. Sempre que possível, consolide essas dúvidas em uma rodada inicial, evitando que lacunas previsíveis apareçam de forma fragmentada durante a implementação.

Devem ser esclarecidas com o operador todas as lacunas cuja resolução exigiria inventar ou escolher regras, textos apresentados ao usuário, destinos de navegação, estados, respostas, comportamentos, limites funcionais ou qualquer outra decisão que altere o que o produto faz ou comunica. Se não houver dúvida funcional, informe isso explicitamente antes de seguir para o plano.

Decisões de implementação puramente técnicas pertencem ao programador e não precisam de aprovação prévia: organização do código, composição interna, estruturas locais, nomes técnicos, uso adequado dos recursos da stack e demais escolhas que não alterem o contrato funcional podem ser decididas durante a construção. O operador poderá questionar essas decisões posteriormente, inclusive após validar o comportamento produzido.

Se uma nova lacuna funcional surgir somente durante a implementação, interrompa a parte afetada e consulte o operador antes de preenchê-la. A rodada inicial reduz esse risco, mas não autoriza inferências funcionais posteriores. Uma decisão técnica deixa de ser apenas técnica quando altera comportamento, conteúdo, escopo, contrato funcional ou produz impacto estrutural relevante além da unidade corrente.

## Planejamento e cadência de execução

O programador é responsável por organizar a cadência da unidade corrente. O plano deve indicar uma sequência curta de etapas coerentes, o que será construído em cada uma e qual verificação ou validação deve ocorrer antes de avançar quando houver risco relevante de retrabalho.

Não acumule toda uma Especificação extensa para apresentar ao operador somente no final quando seus blocos puderem ser validados progressivamente. Componentes, fundações, comportamentos ou fluxos que sirvam de base para etapas seguintes devem, quando pertinente, ser construídos, tecnicamente verificados e apresentados ao operador antes da continuação.

Durante a execução, mantenha na cópia Markdown da Especificação o estado do plano, a etapa corrente, o que já foi validado e o que permanece. Esse controle deve permitir continuidade entre sessões sem reconstruir a sequência do trabalho.

O plano é operacional e pode ser ajustado pelo programador conforme a implementação revelar uma ordem melhor, desde que não amplie o escopo, não altere decisões funcionais e respeite pontos de validação já necessários. O operador continua responsável pela validação e pelo encerramento da Especificação.

## Estratégia de construção do front antes do backend

Na etapa atual, o Rememore será materializado primeiro como front funcional. As páginas, rotas, navegação, estados de interface e comportamentos do front são reais; dependências que futuramente serão fornecidas pelo backend devem permanecer atrás de contratos destinados a sobreviver à troca da implementação simulada pela implementação real.

Quando uma operação do front exigir resposta futura do backend, preserve o fluxo real da aplicação — incluindo métodos e rotas pertinentes, quando fizerem parte da solução — e simule somente a dependência externa. O mock deve ocupar o lugar da implementação do serviço, não transformar a página em demonstração descartável.

Os contratos devem expressar somente aquilo que o front efetivamente necessita enviar e receber. A construção de uma página pode, portanto, revelar e materializar contratos que o backend futuro deverá atender, sem criar antecipadamente serviços, dados ou funcionalidades que o front ainda não demandou.

Até que a etapa de front seja concluída, não implemente backend real, persistência remota ou regras de servidor definitivas, salvo determinação explícita de uma Especificação posterior. Os mocks devem ser mínimos e orientados aos cenários necessários à unidade corrente, evitando antecipar cenários de páginas futuras apenas por conveniência.

## Implementação e decisões

- Reutilize estruturas, padrões, componentes e recursos existentes quando forem adequados.
- Tome decisões técnicas locais necessárias para materializar claramente a Especificação.
- Consulte o operador quando faltar uma decisão funcional, houver interpretações relevantes distintas, for necessário sair do escopo ou surgir uma decisão estrutural com impacto além da unidade corrente.
- Não invente comportamentos para preencher lacunas nem altere silenciosamente decisões funcionais.
- Não amplie a unidade para completar o sistema, reorganizar o projeto ou refatorar áreas sem relação necessária com o trabalho.
- Não crie abstrações, infraestrutura, bibliotecas, funcionalidades ou preparações para necessidades futuras apenas por conveniência.

Use o conhecimento técnico como referência normal, sem consultas externas repetitivas para operações triviais. Diante de comportamento inesperado, dúvida concreta sobre API ou recurso, suspeita de mudança de versão, incompatibilidade aparente ou pedido do operador, consulte a documentação oficial atual antes de concluir que a implementação ou o sistema estão incorretos.

Deno, Fresh, Bulma, Font Awesome e as demais dependências evoluem ao longo do tempo. A consulta pode partir do programador quando houver motivo concreto ou ser solicitada pelo operador. Seu objetivo é resolver incertezas reais e diferenças de versão, sem transformar a documentação externa em contexto obrigatório de cada tarefa.

## Continuidade da Especificação

Mantenha as cópias operacionais em `.docs/especificacoes/`. Ao receber a indicação de uma Especificação no Google Drive, leia somente esse documento e faça a clarificação funcional descrita acima antes de criar ou atualizar sua cópia Markdown. Depois da clarificação, salve a cópia com identificação e título no nome do arquivo, preservando o conteúdo e incluindo o link da fonte. Se a cópia já existir, preserve suas anotações de continuidade ao atualizá-la.

Na identificação local, retire o prefixo `05.`, que pertence à organização documental do Drive, e mantenha apenas a sequência numérica: `05.01` no Drive corresponde à Especificação `01` no projeto, `05.02` corresponde à `02`, e assim por diante. Use essa sequência no nome do arquivo, no título local e nas referências locais; por exemplo, `01-fundacao-visual-e-pagina-inicial.md`. Preserve a identificação original e o link na referência da fonte, sem renumerar os documentos do Drive nem alterar seu corpo aprovado.

Mantenha estado do trabalho, decisões e pendências em uma seção separada chamada **Continuidade**, no mesmo arquivo, sem misturá-los ao corpo aprovado. Inclua ali o plano de execução, seu estado, a etapa corrente, o que já foi validado e o que permanece. Essa organização acompanha o repositório entre sessões e computadores e não autoriza a leitura de outras Especificações.

A cópia Markdown da Especificação corrente pode guardar anotações úteis à continuidade enquanto a unidade estiver aberta. Registre somente o necessário para outra sessão retomar aquele trabalho sem reconstruir o raciocínio.

Essa memória local é diferente da documentação de capital de tokens: a Especificação guarda a continuidade daquele trabalho; o capital de tokens preserva conhecimento técnico reutilizável entre trabalhos diferentes.

## Memória técnica e capital de tokens

Mantenha essa documentação em `.docs/`, dentro deste repositório, para acompanhar o projeto entre computadores e modelos. `.docs/README.md` é o índice de leitura inicial e `.docs/memoria-tecnica.md` reúne o conhecimento técnico reutilizável. Novos documentos podem ser acrescentados quando houver material relevante; mantenha o índice atualizado para que o conhecimento essencial seja lido na abertura das sessões. Essa leitura não autoriza percorrer outras Especificações.

Durante o desenvolvimento, o programador pode manter uma documentação técnica própria destinada às suas sessões futuras. Use esse espaço para preservar decisões, soluções, restrições e conhecimentos específicos deste projeto cujo raciocínio tenha valor suficiente para não precisar ser repetido posteriormente.

Registre principalmente aquilo que:

- exigiu investigação, comparação ou reflexão relevante;
- estabeleceu uma decisão técnica que deverá continuar sendo respeitada;
- revelou uma particularidade do projeto que não seja evidente pelo contexto inicial;
- provavelmente será reutilizado ou consultado em trabalhos futuros.

Preserve o resultado útil do raciocínio, não o histórico detalhado da sessão. Não transforme essa documentação em diário de alterações, descrição do código ou coleção de boas práticas genéricas.

Essa documentação pertence ao programador: pode ser criada e atualizada por ele sem depender de uma Especificação específica. Seu objetivo é formar **capital de tokens**, preservando conhecimento técnico já conquistado para que futuras sessões — inclusive executadas por outro modelo — possam reutilizá-lo em vez de redescobri-lo.

Quando uma decisão registrada deixar de ser válida devido à evolução do código ou a uma determinação posterior do operador, atualize ou remova a anotação correspondente.

## Validação com o operador

Orientação complementar do operador: testes unitários servem às necessidades do programador durante o desenvolvimento, sem metas de cobertura. Use-os quando forem úteis e mantenha-os somente enquanto houver necessidade; podem ser removidos após o uso. Considere o retrabalho de testes ligados aos mocks quando o backend for implementado.

O operador executa a aplicação, navega, observa o comportamento e avalia resultados visuais e funcionais, fornecendo retorno. Não é necessário assumir autonomamente essas responsabilidades, salvo atividade específica de execução, teste ou investigação solicitada pela Especificação. Arte e design também podem avançar em ciclos curtos de construção e avaliação pelo operador.

## Encerramento

O operador determina quando uma Especificação deve ser encerrada ou cancelada.

Quando ele solicitar o encerramento, releia o corpo original da Especificação no Google Drive e acrescente somente um **Parecer final** breve. Nunca modifique o corpo aprovado. Registre, quando aplicável:

- o que foi efetivamente produzido e os nomes concretos de páginas, rotas, componentes ou estruturas;
- diferenças entre a Especificação e a implementação final;
- descobertas funcionais ou consequências relevantes percebidas durante o desenvolvimento;
- pontos deliberadamente não realizados ou pendentes.

Decisões puramente técnicas reutilizáveis permanecem na memória técnica de capital de tokens. Quando uma descoberta técnica também tiver consequência relevante para a compreensão funcional do projeto, inclua essa consequência resumida no Parecer.

O Parecer pertence somente ao documento do Google Drive; não precisa ser reproduzido na cópia Markdown operacional. Não produza documentação extensa da implementação por padrão. A próxima unidade será definida pelo operador fora da sessão.
