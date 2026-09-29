05.13 - Preservação e Conflitos
Objetivo
Materializar a preservação da Captura do dia em /capturar/{data}, conectando a etapa Revisar ao estado preservado remoto, com conferência de revisão, preservação integral do estado funcional do dia, tratamento de conflitos, preservação vazia, descarte local, resolução transacional de categorias e tratamento seguro de falhas.
A unidade parte da 05.12 - Revisão da Captura já concluída. A validação local de categoria obrigatória continua pertencendo à Revisão; esta unidade começa quando Preservar ultrapassa essa validação.
A 05.13 é deliberadamente uma unidade grande. Seus comportamentos são pequenos, porém fortemente encadeados. O objetivo é entregar o fluxo completo de preservação sem fracionar artificialmente decisões que precisam ser validadas em conjunto.
Autossuficiência e princípio de implementação
Esta instrução deve ser suficiente para a implementação. Documentos anteriores preservam rastreabilidade, mas não devem ser necessários para descobrir regras funcionais omitidas aqui.
Toda a orquestração do produto nesta unidade deve ser real: IndexedDB, estados de interface, comparação de revisão, decisões dos popups, construção do payload, transições de sucesso e falha, descarte, navegação e consequências locais.
Somente a autoridade remota permanece mockada. O mock representa o futuro backend e responde fatos; não deve conter regras de interface ou decidir o que o produto faz diante de conflito, falha ou sucesso.
Registro obrigatório para continuidade e compactação
Esta especificação provavelmente exigirá compactação de sessão durante o desenvolvimento. O programador deve assumir desde o início que a compactação pode ocorrer a qualquer momento.
Manter um registro operacional contínuo da unidade no local já adotado pelo desenvolvimento. Esse registro deve ser atualizado ao concluir cada bloco relevante, e não apenas ao final da sessão.
O registro deve conter, no mínimo: bloco concluído; arquivos e contratos alterados; migrations ou evolução de schema; decisões técnicas tomadas dentro da liberdade permitida; estado atual do mock; testes executados e resultados; validações ainda pendentes; desvios ou dúvidas funcionais; próximo passo exato.
Nenhuma decisão necessária para retomar o trabalho pode existir somente no contexto transitório da conversa. Depois de uma compactação, a especificação e o registro operacional precisam ser suficientes para reconstruir o estado de desenvolvimento sem refazer investigação já concluída.
Escopo
Ligar funcionalmente o botão Preservar da Revisão ao fluxo remoto simulado.
Implementar conferência leve de existência e revisão da data antes da preservação.
Implementar preservação normal e preservação vazia.
Implementar tratamento de conflito sem merge.
Implementar substituição consciente da versão preservada pelas alterações locais.
Implementar Descartar alterações.
Implementar resolução transacional de categorias novas, existentes, inativas e reativadas durante a preservação.
Definir o contrato remoto integral de memória, Tom, balanço sentimental, categorias, complementos e metadados de controle.
Preservar as regras de primeira preservação e historicidade de memórias e complementos.
Remover o workspace local depois de preservação confirmada.
Preparar mocks stateful e determinísticos para validar todos os caminhos relevantes.
Executar testes automatizados nos contratos e transições que não podem ser validados adequadamente apenas pelo operador, além do roteiro de testes ao vivo.
Fora do escopo
Backend de produção real.
Merge entre versões concorrentes.
Sincronização entre dispositivos.
Proteção adicional contra uma alteração remota ocorrida na fração de tempo entre a conferência de revisão e a gravação.
Idempotência ou recuperação sofisticada para resposta perdida depois de uma gravação remota eventualmente concluída.
Sincronização extraordinária do catálogo de categorias imediatamente após preservar; a abertura de uma captura continua responsável pela sincronização incremental já existente.
Política global de limpeza de caches/workspaces limpos fora das regras já vigentes.
Ponto de partida da 05.12
A etapa Revisar já apresenta as memórias, orientação progressiva e ações Preservar e Descartar alterações. Preservar já valida localmente a existência de ao menos uma categoria por memória. Memórias sem categoria impedem o avanço e são destacadas conforme a materialização aceita da 05.12.
Uma captura nova ainda vazia mantém Preservar desabilitado. Uma captura vazia que nasceu de conteúdo previamente preservado continua podendo acionar Preservar, porque representa a exclusão deliberada de todas as memórias do dia.
Descartar alterações já ocupa sua posição visual, mas seu comportamento real passa a ser ligado nesta unidade.
1. Entrada da preservação e estado de processamento
Depois que a validação local de categorias passa, o clique em Preservar inicia imediatamente a operação.
Enquanto a operação estiver em andamento, o botão deve indicar processamento com texto equivalente a “Preservando…”. Preservar não aceita novo acionamento. Descartar alterações fica indisponível. As abas Memorar, Categorizar e Revisar ficam indisponíveis. As memórias continuam visíveis, mas não podem ser abertas para edição.
A tela Revisar permanece visível; não criar uma tela intermediária nem uma sobreposição global que esconda a composição do dia.
Nenhuma mensagem de sucesso pode ser apresentada antes da confirmação inequívoca da preservação.
Sair da página ou recarregar durante o processamento não autoriza qualquer limpeza local. Não manter uma transação visual especial atravessando reload. Sem confirmação recebida pelo front, o workspace permanece protegido conforme seu último estado local confirmado.
2. Preservação de um dia que ficou sem memórias
Quando o usuário removeu todas as memórias de um dia que possuía conteúdo preservado, Preservar exige confirmação antes da conferência remota.
Usar CMP-004 — Confirmação de Decisão.
Título: “Confirmar a exclusão de todas as memórias?”
Mensagem: “Você removeu todas as memórias deste dia. Ao preservar, essa exclusão será confirmada e nenhuma memória ficará preservada para esta data.”
Ações: “Confirmar exclusão” e “Cancelar”.
Cancelar fecha a confirmação e mantém a Revisão e o workspace inalterados.
Confirmar apenas autoriza prosseguir. Nenhuma memória é considerada definitivamente excluída antes do sucesso da preservação.
3. Conferência leve do estado preservado
Antes de gravar, consultar de forma leve se a data possui memórias preservadas e, quando possuir, qual é sua revisão atual. A consulta não deve retransmitir o conteúdo completo apenas para conferir conflito.
O workspace já guarda como baseline a revisão preservada da qual nasceu, ou a informação de que a data não possuía conteúdo preservado.
Não há conflito quando: a origem era ausente e continua ausente; ou a origem possuía revisão X e a revisão atual continua X.
Há conflito quando: a origem era ausente e agora existe conteúdo; a origem possuía revisão X e agora existe revisão diferente; ou a origem possuía conteúdo e agora a data não possui conteúdo preservado.
Não criar um estado funcional separado de “resultado inconclusivo”. Indisponibilidade, timeout, erro de comunicação ou impossibilidade de obter resposta confiável são tratados como falha de conferência.
A conferência é invisível ao usuário quando não encontra problema.
4. Concorrência entre conferência e gravação
Não implementar validação da validação. Depois que a conferência determina ausência de conflito, a gravação segue. Depois que um conflito é apresentado e o usuário autoriza substituir, a gravação também segue.
Se outra alteração remota ocorrer na fração mínima entre a conferência e a gravação, ela pode ser sobrescrita. A concorrência esperada neste produto é baixa e não justifica criar loops de revalidação ou compare-and-swap nesta unidade.
5. Caminho normal sem conflito
Se o estado preservado continuar compatível com a origem do workspace, preservar imediatamente, sem popup adicional.
O mesmo caminho vale para uma captura nova com memórias e para a atualização de um dia já preservado. Para o usuário, ambos são simplesmente Preservar.
A preservação vazia previamente confirmada também segue por este caminho quando não houver conflito.
6. O que é enviado na preservação
A preservação envia o estado funcional integral atual do dia, não uma sequência de comandos ou diferenças.
No nível do dia, o contrato representa a data e a lista ordenada das memórias.
Cada memória deve poder representar, no mínimo: identidade estável; ordem; texto principal; Tom; balanço sentimental; associações de categorias; lista de complementos/adendos; e informações de controle necessárias para historicidade e regras já existentes.
Tom nulo significa ausência de Tom; Tom 0 continua sendo neutro e diferente de ausência. Balanço sentimental nulo significa ausência de balanço sentimental.
O balanço sentimental pertence à memória, assim como Tom, categorias e complementos.
Estados puramente de interface ou jornada não atravessam a fronteira remota: rolagem, perspectiva aberta, popup, rascunho de sessionStorage, destaque visual, bloqueios temporários e equivalentes.
7. Integralidade funcional não significa sobrescrever dados canônicos de controle
O payload integral representa o estado funcional que o usuário deseja preservar, mas o servidor continua autoridade sobre metadados canônicos de controle.
Uma preservação não deve sobrescrever cegamente todos os campos armazenados no servidor. Para memórias e complementos já preservados, dados como o marco de primeira preservação são conservados pelo servidor. Para itens novos, esses dados são criados pelo servidor na primeira preservação.
A ausência de uma memória no estado integral atual significa que ela não deve mais integrar o estado preservado corrente daquele dia. Isso não autoriza o cliente a fabricar ou reiniciar metadados históricos de itens que permanecem.
8. Identidade estável e historicidade
Memórias nascem localmente com identidade estável e preservam essa mesma identidade no servidor sempre que possível. Não criar um segundo identificador remoto apenas porque ocorreu a primeira preservação.
Complementos/adendos também possuem identidade estável própria.
Na primeira preservação de uma memória, o servidor registra seu marco de primeira preservação. Preservações posteriores da mesma memória mantêm esse marco original e nunca reiniciam o prazo de edição.
Um complemento criado posteriormente recebe seu próprio marco de primeira preservação. A primeira preservação do complemento não altera nem renova a primeira preservação da memória principal.
Reordenar, editar conteúdo ainda autorizado, alterar categoria, Tom ou balanço sentimental não cria uma nova identidade e não reinicia historicidade.
O servidor não precisa devolver todo o conteúdo da captura apenas para atualizar esses dados após o sucesso, porque o workspace será removido. Em uma abertura futura, a leitura integral devolve o estado canônico.
9. Categorias na preservação
Categorias novas não são sincronizadas numa etapa anterior. Elas sobem junto das memórias e fazem parte da mesma transação de preservação.
O front envia as associações finais efetivamente presentes nas memórias. Categoria local que perdeu todas as associações antes de preservar não é enviada nem criada.
O servidor é responsável por resolver, dentro da transação, quais categorias já existem, quais são realmente novas e quais categorias históricas/inativas devem ser reutilizadas ou reativadas.
O nome normalizado da categoria é único. Se uma categoria apresentada pelo cliente como nova corresponder a uma categoria já existente, o servidor reutiliza a identidade existente em vez de criar duplicata.
A mesma categoria local associada a várias memórias deve resultar em uma única categoria canônica e todas as associações devem apontar para essa mesma identidade.
Uma categoria preservada possui identidade estável, nome, versão própria e estado ativa/inativa. O catálogo possui também revisão/cursor global independente da revisão da captura.
O servidor pode determinar, como consequência da nova preservação, que uma categoria histórica seja reativada ou que uma categoria sem associações globais passe a inativa. Categoria não é removida fisicamente apenas por perder associações.
A preservação do dia e a resolução/criação/reativação das categorias são atômicas do ponto de vista funcional: ou toda a transação é confirmada, ou nada é confirmado. Não pode permanecer uma categoria nova criada isoladamente quando a preservação do dia falha.
Em sucesso, a resposta deve trazer a nova revisão da captura e, para cada categoria criada durante a operação, ao menos identificador definitivo, nome e versão. O backend pode retornar outros dados canônicos necessários ao contrato, mas essa resposta não dispara sincronização extraordinária do catálogo.
O catálogo local não é atualizado imediatamente após preservar. A abertura de uma captura continua responsável pela sincronização incremental já existente, que aplica categorias novas, versões avançadas, inativações e reativações a partir da revisão/cursor do catálogo.
10. Contratos remotos mínimos
O front deve trabalhar contra contratos que representem a fronteira futura do backend, ainda que a implementação concreta continue mockada.
Contrato de conferência: recebe a conta/data dentro do contexto autenticado e informa ausência de conteúdo ou existência com revisão atual; pode falhar.
Contrato de preservação: recebe a data e o estado funcional integral do dia; resolve a transação de memórias, complementos e categorias; em sucesso devolve confirmação inequívoca, nova revisão da captura e os dados de categorias criadas definidos acima.
Contrato de leitura integral: continua sendo o mecanismo já usado na abertura para obter o estado preservado canônico quando não existe workspace utilizável ou quando um cache limpo precisa ser reconstruído.
11. Fronteira do mock
O mock substitui somente a autoridade remota. A lógica de conflito, mensagens, escolha do usuário, atualização ou remoção do IndexedDB, navegação e transições permanece fora do mock.
O mock deve ser stateful durante a validação: uma preservação bem-sucedida altera o estado remoto simulado, avança a revisão da data e passa a ser observável por consultas e leituras posteriores.
O mock precisa permitir cenários determinísticos, sem depender de falhas acidentais: data ausente; data existente em revisão conhecida; mudança de revisão; sucesso de preservação; falha de conferência; falha de preservação; latência controlada; categorias existentes, novas e inativas; falha transacional na resolução de categoria.
A técnica de seleção dos cenários fica a cargo do programador, mas não deve poluir a interface final do produto. Pode ser configuração de serviço, fixture ou mecanismo equivalente destinado ao desenvolvimento.
12. Falha antes da confirmação da preservação
Enquanto não houver resposta confirmando a preservação, nada é alterado no workspace por causa da tentativa.
Falha na conferência e falha na gravação possuem o mesmo resultado funcional para o usuário: a captura permanece pendente, a Revisão volta a ficar interativa e uma nova tentativa é possível.
Título: “Não foi possível preservar”.
Mensagem: “Suas alterações continuam protegidas neste dispositivo. Tente preservar novamente.”
Ação: “OK”.
Não criar protocolo especial para o caso raro em que a gravação possa ter sido concluída remotamente, mas sua resposta se perca. Sem confirmação recebida, manter o workspace pendente. Uma tentativa posterior fará nova conferência e poderá encontrar conflito decorrente da tentativa anterior.
13. Conflito normal
Quando a conferência constata que o estado preservado mudou e a captura local ainda contém memórias, apresentar CMP-004.
Título: “Este dia possui alterações mais recentes”.
Mensagem: “As memórias preservadas deste dia mudaram desde que você começou esta captura. Se continuar, suas alterações substituirão o que está preservado atualmente.”
Ações: “Preservar minhas alterações” e “Não substituir”.
Enquanto o popup estiver aberto, a captura permanece protegida e não deve ser editável por trás da decisão.
14. Preservar minhas alterações diante de conflito
Escolher “Preservar minhas alterações” é autorização suficiente para substituir integralmente o estado preservado atual pelo estado funcional local. Não apresentar uma terceira confirmação.
Fechar o popup, retornar ao estado “Preservando…” e executar a preservação. Não fazer nova conferência de revisão antes do envio.
Sucesso e falha posteriores seguem exatamente os mesmos fluxos definidos para uma preservação normal.
15. Não substituir diante de conflito
Escolher “Não substituir” não descarta o workspace e não modifica o estado preservado. A tentativa de preservação termina.
Apresentar em seguida um popup informativo de uma única ação.
Título: “Alterações mantidas”.
Mensagem: “Nada foi substituído. Suas alterações continuam nesta captura. Se não quiser mais mantê-las, você pode usar Descartar alterações.”
Ação: “OK”.
Depois de OK, retornar à Revisão com a captura ainda pendente e controles novamente disponíveis.
16. Conflito durante exclusão de todas as memórias
Se o usuário já confirmou a exclusão total e a conferência encontra uma versão preservada diferente, usar uma mensagem específica que dê continuidade à decisão anterior.
Título: “Este dia possui memórias mais recentes”.
Mensagem: “As memórias preservadas deste dia mudaram desde que você começou esta captura. Se confirmar a exclusão, essas memórias mais recentes também serão apagadas.”
Ações: “Excluir mesmo assim” e “Não excluir”.
“Excluir mesmo assim” autoriza a preservação vazia e segue sem nova conferência.
“Não excluir” não modifica o estado preservado e mantém a captura local vazia como pendente. Em seguida, apresentar o mesmo popup informativo “Alterações mantidas”, com uma única ação OK e indicação de que Descartar alterações pode ser utilizado caso o usuário não queira mais manter a captura local.
17. Confirmação inequívoca de sucesso
A preservação só é considerada confirmada quando o serviço remoto responde explicitamente com sucesso e devolve a nova revisão da captura.
O servidor não precisa retransmitir todo o conteúdo preservado. Ele pode devolver somente os dados canônicos necessários ao contrato, especialmente a nova revisão e as categorias criadas durante a transação.
Depois dessa confirmação, não repetir a preservação automaticamente.
18. Estado local depois do sucesso
Restaurar a decisão consolidada anterior do projeto: depois de preservação confirmada, remover o workspace local daquela data. Não convertê-lo em cache limpo.
Essa remoção evita a necessidade de reconciliar localmente todos os dados canônicos produzidos pela transação, como revisão, primeira preservação, identidades/versões de categorias e outras normalizações do servidor.
Se o usuário abrir a mesma data novamente, a abertura normal consulta o servidor, obtém o estado preservado integral e materializa um novo workspace limpo. Nesse mesmo fluxo de abertura ocorre a sincronização incremental normal do catálogo de categorias.
19. Falha local depois de sucesso remoto
Este é um caso extremo. Se o servidor confirmou a preservação, ela continua sendo sucesso mesmo que a remoção posterior do workspace local falhe.
Tentar remover o workspace. Se a remoção falhar, não reenviar a preservação.
Retornar para a Seleção de datas e informar a inconsistência local.
Título: “Memórias preservadas”.
Mensagem: “Suas memórias foram preservadas, mas não foi possível atualizar esta captura neste dispositivo. Ela poderá continuar aparecendo como pendente até que o armazenamento local volte a funcionar corretamente.”
Ação: “OK”.
Não implementar mecanismo sofisticado de recuperação apenas para esse caso raro nesta unidade.
20. Sucesso normal e retorno
Quando a preservação é confirmada e o workspace é removido com sucesso, retornar para /capturar, a Seleção de datas.
Apresentar o popup de sucesso sobre a Seleção.
Título: “Memórias preservadas”.
Mensagem: “As memórias deste dia foram preservadas com sucesso.”
Ação: “OK”.
Depois de OK, permanecer na Seleção. Nenhum redirecionamento adicional.
A data preservada deixa de aparecer como pendente. Outras datas pendentes permanecem intactas.
21. Descartar alterações
Descartar alterações é uma operação exclusivamente local e distinta da preservação. Não consulta nem modifica o estado remoto.
Quando existe versão previamente preservada:
Título: “Descartar as alterações deste dia?”
Mensagem: “Todas as alterações ainda não preservadas serão descartadas. As memórias já preservadas deste dia serão mantidas.”
Ações: “Descartar alterações” e “Cancelar”.
Quando a captura nunca foi preservada:
Título: “Descartar esta captura?”
Mensagem: “Todas as memórias e alterações desta captura serão descartadas.”
Ações: “Descartar captura” e “Cancelar”.
Cancelar mantém o workspace.
Confirmar remove o workspace local. Somente depois da remoção confirmada considerar o descarte concluído. Retornar para a Seleção de datas sem popup adicional de sucesso.
Se a remoção falhar, permanecer na Revisão e manter a captura pendente.
Título de falha: “Não foi possível descartar”.
Mensagem: “Suas alterações continuam protegidas neste dispositivo. Tente novamente.”
Ação: “OK”.
Depois de um conflito, “Não substituir” não descarta automaticamente. Se o usuário quiser abandonar suas alterações, utiliza este mesmo fluxo de Descartar alterações.
22. Abertura posterior
Depois de preservação bem-sucedida ou descarte bem-sucedido, não existe workspace local da data.
Uma futura abertura segue o fluxo já materializado: consulta o estado remoto, baixa a versão canônica quando aplicável, materializa novo workspace limpo e executa a sincronização incremental normal do catálogo de categorias.
Não criar uma rotina especial de recarga logo após preservar apenas para reconstruir aquilo que o usuário acabou de sair.
23. Checkpoints recomendados de implementação
A ordem técnica pode ser ajustada, mas o registro operacional deve permitir reconhecer claramente estes marcos:
Marco A — contratos remotos e mock stateful para conferência, leitura e preservação.
Marco B — preservação normal sem conflito e estado de processamento.
Marco C — preservação vazia e mensagens de exclusão.
Marco D — conflitos normal e vazio, incluindo substituição consciente e Não substituir.
Marco E — transação de categorias e contratos de memória/historicidade.
Marco F — sucesso, remoção do workspace e retorno à Seleção.
Marco G — Descartar alterações e falhas locais.
Marco H — testes automatizados necessários e roteiro completo de validação ao vivo.
Depois de cada marco, registrar o estado real antes de avançar, para que uma compactação não dependa de memória conversacional.
24. Responsabilidade por testes
Embora o operador realize a validação ao vivo da experiência, muitos comportamentos desta unidade não são observáveis de forma confiável apenas pela interface. O programador deve testar diretamente os contratos e estados internos necessários.
Priorizar testes automatizados direcionados a: detecção de conflito; manutenção do workspace em falhas; remoção somente após sucesso; atomicidade das categorias; identidade estável; primeira preservação; preservação posterior sem reiniciar prazo; isolamento entre datas; e efeitos stateful do mock.
Não é necessário transformar a unidade em uma campanha de testes exaustiva. O objetivo é cobrir regras críticas cuja validação manual seria frágil ou impraticável.
25. Roteiro obrigatório de validação
Captura nova: criar memórias e preservar; receber nova revisão; remover workspace; voltar à Seleção; apresentar sucesso; data não permanece pendente.
Dia já preservado sem conflito: editar e preservar com mesma revisão; nenhuma confirmação extra.
Latência: durante “Preservando…”, bloquear novo Preservar, Descartar, abas e abertura de memórias; garantir uma única solicitação.
Falha na conferência: manter workspace pendente, permanecer na Revisão e apresentar “Não foi possível preservar”.
Falha na preservação: mesmo resultado funcional da falha de conferência.
Saída durante processamento: não limpar workspace por sucesso presumido.
Exclusão total cancelada: manter captura local vazia e pendente; nada remoto muda.
Exclusão total confirmada sem conflito: preservar vazio e remover workspace no sucesso.
Exclusão total com conflito: “Excluir mesmo assim” elimina inclusive memórias preservadas mais recentes.
Exclusão total com conflito e “Não excluir”: nada remoto muda; captura local continua pendente; mostrar popup informativo.
Conflito normal e “Preservar minhas alterações”: substituir integralmente o estado preservado sem nova conferência.
Conflito normal e “Não substituir”: manter workspace e estado preservado; mostrar “Alterações mantidas”.
Descartar alterações de dia já preservado: remover somente workspace; nova abertura recupera o estado preservado.
Descartar captura nunca preservada: remover workspace; nova abertura volta a captura vazia.
Falha ao descartar: manter workspace e pendência.
Categoria nova: memória e categoria são confirmadas na mesma transação.
Falha na resolução/criação de categoria: nenhuma parte da preservação é confirmada.
Mesma categoria local em várias memórias: gerar/reutilizar uma única categoria canônica.
Categoria local equivalente a existente: reutilizar identidade existente, sem duplicar nome normalizado.
Categoria histórica/inativa equivalente: permitir resolução/reativação pelo servidor conforme regra vigente.
Categoria sem associações globais depois da preservação: servidor pode inativá-la; catálogo local só reflete isso em sincronização posterior durante abertura.
Após preservar, não executar sincronização extraordinária do catálogo de categorias.
Reabrir data preservada: sem workspace, baixar estado canônico e criar novo workspace limpo; sincronização normal do catálogo ocorre na abertura.
Primeira preservação de memória: servidor registra marco de primeira preservação.
Nova preservação da mesma memória: marco original permanece e prazo não reinicia.
Complemento novo em memória antiga: complemento recebe sua própria primeira preservação sem alterar a da memória.
Identidades: memórias e complementos mantêm IDs estáveis entre local e remoto.
Sucesso remoto seguido de falha ao remover workspace: não reenviar; voltar à Seleção; informar inconsistência local.
Integridade de outras pendências: preservar ou descartar uma data não altera workspaces de outras datas.
Ciclo completo: memória com texto, Tom, balanço sentimental, categorias existentes e novas e complementos; preservar; sair; reabrir; reconstruir corretamente o estado canônico e os metadados históricos.
26. Critérios de conclusão
A unidade somente pode ser encerrada quando o fluxo normal, preservação vazia, conflitos, descarte e falhas estiverem materializados; os mocks representarem de forma stateful a fronteira remota; categorias forem resolvidas transacionalmente; o workspace for removido somente depois de sucesso remoto; mensagens e navegação corresponderem ao definido; e os cenários críticos tiverem evidência de verificação.
O parecer final deve distinguir claramente: o que foi implementado de forma real no front/local; o que permanece mockado como autoridade remota; quais testes automatizados foram executados; quais cenários foram validados ao vivo; quaisquer cenários não validados; e toda decisão ou desvio solicitado pelo operador durante o desenvolvimento.
27. Liberdade técnica do programador
Ficam a critério do programador, desde que o comportamento acima seja preservado: nomes concretos de tipos e funções; organização interna dos serviços; estratégia de fixtures e seleção de cenários do mock; detalhes de migration do IndexedDB; composição interna das transações locais; e distribuição dos testes.
Qualquer dúvida que possa alterar comportamento funcional, mensagem, consequência de sucesso/falha ou fronteira real/mock deve ser apresentada ao operador antes de ser decidida no código.
Referências documentais de origem — não operacionais
Esta Especificação consolida decisões derivadas de 02.03 — Captura e Evolução das Memórias; 02.05 — Modelo de Trabalho e Continuidade; 03.05 — Capturar; 04.06 — Especificação Funcional - Capturar; 04.07 — Regras - Capturar; 04.08 — Componentes - Capturar; 05.07 — Registrar e Organizar; 05.09 — Categorização; 05.10 — Memorar e Categorização; 05.11 — Tom e Balanço Sentimental; e 05.12 — Revisão da Captura.
As referências acima preservam rastreabilidade histórica. O programador deve ser capaz de implementar a 05.13 a partir desta instrução e do estado real do código, sem depender de reconstruir decisões funcionais em documentos anteriores.


## Continuidade

### Indicadores de contexto

- Antes das leituras: não disponível na interface.
- Após AGENTS, índice, memória técnica e Especificação, antes do fonte: não disponível na interface.
- Ao final desta sessão/unidade: indicador da interface não disponível. O operador informou que, após uma compactação automática, a segunda sessão terminou com 24% restante; os limites de cinco horas e semanal foram pouco utilizados.

### Plano e estado

1. Marco A — contratos e mock stateful implementados em `app/servicos/captura/contratos.ts` e `simulado.ts`; controles de desenvolvimento incluem estado remoto, categoria ativa/inativa, falhas e latência. Preparação atômica do novo estado e resolução de categorias têm teste automatizado.
2. Marcos B–E — fluxo de processamento, conferência/conflito, preservação vazia, payload integral e resolução simulada de categorias conectados em `islands/CapturaDia.tsx`; comparação de revisão extraída para `preservacao.ts`. Captura nova vazia bloqueada conforme clarificação do operador registrada abaixo.
3. Marcos F–G — remoção do workspace após confirmação, retorno à Seleção com mensagens de sucesso/inconsistência e descarte local/falhas conectados. Transições entre falha remota, sucesso seguido de falha local e remoção após confirmação têm teste automatizado.
4. Marco H — concluído. 62 testes automatizados passaram, incluindo conflito, bloqueio de preservação vazia, historicidade/categorias do mock e falhas de remoção; `deno check`, lint, formatação, build de produção e conferência do diff passaram. A execução do build precisou ocorrer fora do sandbox por restrição de acesso do Vite. Validação ao vivo conjunta concluída, conforme registrado abaixo.

Clarificação funcional do operador: captura que começou sem conteúdo remoto não pode preservar quando chega à Revisão vazia, mesmo que memórias tenham sido confirmadas localmente e depois removidas. O botão permanece inativo. A confirmação da preservação vazia aplica-se à captura cuja origem tinha conteúdo remoto.
Clarificação funcional do operador: para uma captura não vazia, mostrar uma confirmação genérica somente no caminho sem outros questionamentos: depois que a primeira conferência terminar sem falha nem conflito. Se houver validação pendente, falha, conflito ou confirmação específica de exclusão vazia, usar somente o questionamento/aviso próprio daquele caminho, sem duplicar a confirmação genérica. Usar o popup “Confirmar preservação?” com “As memórias deste dia serão preservadas. Deseja continuar?”, ações “Preservar” e “Voltar à revisão”. O cancelamento mantém a Revisão sem gravar; a confirmação inicia a gravação sem refazer a conferência. O operador aceitou a janela de concorrência existente e considera responsabilidade do usuário atualizar a mesma captura em outra aba durante esse intervalo.
Etapa corrente: encerrada a pedido do operador.
Validado: leitura integral da Especificação, índice, memória técnica e referência pertinente de trabalho local; implementação dos fluxos do front e do mock; `deno check`, lint, 62 testes, verificação de formatação, build de produção e conferência do diff concluídos com sucesso. No navegador local, foram observados os fluxos descritos acima, incluindo captura nova vazia bloqueada, preservação/reabertura, descarte, confirmação de exclusão vazia e o popup de confirmação genérica com cancelamento. O operador acompanhou a validação ao vivo, verificou os cenários que não foram possíveis de observar nesta sessão e validou o código. Por essa validação conjunta, os 30 itens do roteiro e os critérios de conclusão são considerados validados; os itens não observados diretamente pelo programador não são apresentados como observação própria.
Pendente: nenhum item da Especificação 13. O Parecer final foi registrado nesta cópia local e entregue ao operador; a atualização do documento canônico no Drive permanece a cargo do operador.
Estado inicial do Git: `.docs/especificacoes/13-Preservacao.md` estava não rastreado e foi preservado.

## Parecer final

A unidade implementa o fluxo de preservação da rota `/capturar/{data}` no front e nos serviços locais: contratos da fronteira remota, mock stateful, conferência de revisão e conflitos, envio do estado integral da captura, resolução de categorias, descarte, tratamento de falhas e remoção do workspace local somente após sucesso remoto. O estado remoto continua simulado no navegador; não foi implementado backend real nem persistência remota definitiva. Os testes automatizados cobriram as regras críticas e 62 testes passaram; `deno check`, lint, formatação, build de produção e conferência do diff também passaram. A validação ao vivo foi concluída conjuntamente: o programador observou os fluxos possíveis no navegador e o operador verificou os cenários restantes e validou o código. Assim, os 30 itens do roteiro foram considerados atendidos.

Durante a validação, o operador acrescentou duas clarificações funcionais relevantes: impedir a preservação de captura nova que chega vazia à Revisão e pedir confirmação genérica apenas no caminho não vazio sem outros questionamentos. Essa confirmação não repete a conferência; o operador aceitou a janela de concorrência entre abas. A implementação e esta Continuidade registram essas decisões.

Como especificação de desenvolvimento, o documento foi muito bem realizado. Seu detalhamento tornou o escopo autossuficiente e claro, especialmente nas transições de estado, fronteira local/remota, conflitos, falhas, categorias e critérios de conclusão. O roteiro de 30 cenários foi valioso para testar regras que não seriam cobertas apenas por inspeção visual. Uma melhoria possível para próximas unidades é explicitar desde o início a confirmação do caminho normal de sucesso, que foi identificada durante o teste; também é útil manter clara a divisão entre validações de regras, que podem ser especificadas e executadas pelo programador inclusive via navegador, e avaliação visual, que cabe ao operador.

Parecer do operador, sintetizado: a especificação teve nível de detalhamento excelente; entendimento e desenvolvimento couberam em uma sessão com uma única dúvida simples e justificada, apesar de uma compactação automática. Na segunda sessão restavam 24% de contexto, e os limites de cinco horas e semanal foram pouco utilizados. O roteiro de regras tornou a validação eficiente. O operador considera adequado que futuras especificações definam validações de regras mesmo quando dependam de manipulação do navegador pelo programador, deixando as validações visuais sob sua responsabilidade.

Não há pendências desta unidade. Parecer final elaborado e entregue ao operador; este registro local não afirma atualização do documento canônico no Drive.
