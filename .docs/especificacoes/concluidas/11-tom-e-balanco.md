# 05.11 - Tom e Balanço Sentimental

## 1. Objetivo

Materializar o Tom e o balanço sentimental na Categorização de /capturar/{data}, partindo do estado real deixado pela 05.10.

A unidade deve transformar CMP-007 — Seletor de Tom em componente real primeiro no laboratório, validar sua linguagem visual antes da
integração e, somente depois, ampliar a Categorização para receber Tom e balanço sentimental sem antecipar Revisar.

A unidade também incorpora pequenos ajustes de conteúdo já definidos para Memorar e Categorizar.

## 2. Estado de entrada

A Captura do dia já possui as abas Memorar, Categorizar e Revisar. Memorar utiliza o componente Memoria, possui inclusão separada por
InclusaoMemoria e edição textual própria. Categorizar apresenta a lista com Memoria e abre a Categorização da memória, com contexto
integral, categorias associadas, PesquisaCategoriaPopup, persistência imediata das associações, navegação Anterior/Próxima e modo histórico.

A linguagem visual reutilizável do Tom já existe a partir da 05.08, com extremos Terracota/petróleo e suporte aos temas claro e escuro.
Memoria já sabe representar Tom ou sua ausência. Esta unidade não deve redescobrir essa linguagem; deve reutilizá-la e materializar o
seletor e as superfícies reais que ainda faltam.

## 3. Limites da unidade

Entram nesta 05.11:

- critérios concretos dos níveis iniciante, intermediário e avançado;
- placeholder da inclusão de memória;
- placeholder da área vazia de categorias associadas;
- separação simples entre as áreas Categorias, Tom e Balanço sentimental;
- CMP-007 — Seletor de Tom real;
- validação inicial do seletor no laboratório;
- integração real do Tom à Categorização;
- persistência do Tom;
- expressão visual do Tom no contexto integral e na área de categorias associadas;
- propagação do Tom já persistido às listas de Memorar e Categorizar;
- orientação progressiva do Tom;
- balanço sentimental opcional, independente do Tom;
- prévia compacta do balanço sentimental;
- popup de inclusão/edição do balanço;
- rascunho efêmero, recuperação por reload, cancelamento protegido e exclusão;
- orientação progressiva e placeholder do balanço sentimental;
- modo histórico correspondente.

Revisar continua fora desta unidade.

## 4. Evolução progressiva

A evolução reconhece três níveis e progride de forma monotônica pela experiência de preservação de dias distintos.

- O primeiro e o segundo dias trabalhados pertencem ao nível iniciante.
- Depois da preservação bem-sucedida do segundo dia distinto, o usuário passa ao nível intermediário para os dois dias seguintes.
- Depois da preservação bem-sucedida do quarto dia distinto, o usuário passa ao nível avançado; a partir do quinto dia de experiência
  permanece avançado.
- Preservar novamente uma data já contada não aumenta o nível.
- Remover posteriormente conteúdo preservado não regride o nível já alcançado.
- A quantidade de categorias, a existência de Tom ou de balanço sentimental não participa do cálculo do nível.

A disponibilidade de Rememorar continua sendo regra própria: pelo menos dois dias preservados e duas categorias distintas. A evolução
progressiva não deve copiar essa segunda exigência.

Tom e balanço sentimental passam a existir na experiência somente a partir do nível intermediário. No nível iniciante, suas áreas não são
apresentadas.

## 5. Pequenos ajustes de conteúdo

Na inclusão de nova memória, o campo textual utiliza o placeholder:

“Registre uma memória...”

Na Categorização, quando nenhuma categoria estiver associada, a região das categorias selecionadas utiliza o placeholder:

“Adicione uma categoria”

A Categorização passa a distinguir suas áreas por títulos simples de seção, sem criar caixas externas pesadas. A ordem é:

1. contexto integral da memória;
2. Categorias;
3. Tom, quando disponível;
4. Balanço sentimental, quando disponível;
5. navegação entre memórias.

Para usuário iniciante, Tom e Balanço sentimental não aparecem e a navegação fica depois de Categorias.

## 6. Marco 1 — transformar o range do laboratório em CMP-007 real

Antes de ampliar a Categorização, substituir o range simples atualmente usado no laboratório pelo componente real CMP-007 — Seletor de Tom.

O laboratório continua sem depender de IndexedDB ou da tela real e deve permitir observar, no mínimo:

- Tom não informado;
- Tom ativado em 0;
- valores negativos e positivos próximos do centro;
- valores intermediários;
- extremos -100 e +100;
- temas claro e escuro;
- habilitação e desabilitação;
- interação por mouse, toque e teclado;
- escala cromática revelada a partir do centro;
- resposta visual da linguagem de Tom associada ao valor corrente.

O operador deve validar visualmente este marco antes da integração do seletor à Categorização.

## 7. CMP-007 — Seletor de Tom

O seletor representa um eixo contínuo entre -100 e +100, com 0 no centro. Os números são internos e não aparecem ao usuário.

A trilha inteira possui base neutra. O trecho ativo não funciona como um range convencional preenchido da esquerda até o cursor.

A partir do centro:

- mover para a esquerda revela o eixo negativo;
- mover para a direita revela o eixo positivo;
- somente o trecho entre o centro e a posição atual fica revelado;
- o restante da trilha permanece neutro.

O trecho revelado deve mostrar a progressão cromática completa percorrida. Próximo ao centro, a cor é suave; conforme se aproxima do
extremo, torna-se progressivamente mais intensa. Em +60, por exemplo, o trecho de 0 a +60 apresenta a evolução das tonalidades positivas até
a intensidade correspondente a +60, em vez de ficar inteiro pintado com uma única cor de +60. O mesmo vale para o lado negativo.

A representação deve funcionar de forma determinística independentemente de o usuário ter arrastado por todos os pontos intermediários. A
trilha representa a escala revelada até a posição atual, não um histórico físico do caminho do ponteiro.

O seletor deve manter referências textuais ou acessíveis equivalentes a Negativo, Neutro e Positivo, sem expor -100, 0 e +100 como notas de
interface.

A linguagem cromática reutiliza os extremos já aprovados:

- tema claro: negativo #B45F4D; positivo #237F88;
- tema escuro: negativo #E99E89; positivo #79CBD1.

## 8. Ativação e desativação do Tom

Tom não informado e Tom neutro continuam estados diferentes.

A área utiliza um controle binário adequado a estado persistente, um switch com identificação “Registrar Tom”; não utilizar checkbox
simples.

Quando a memória não possui Tom:

- o switch fica desligado;
- o range permanece visualmente presente para preservar a geometria, porém inativo e neutro;
- a posição visual do cursor fica no centro.

Ao ativar:

- o switch liga;
- o range torna-se interativo;
- quando não existia Tom, o valor inicial é 0;
- 0 já constitui Tom informado e neutro.

Desativar um Tom ativo remove um valor real, inclusive quando ele é 0. Por isso a ação passa por confirmação.

Conteúdo previsto:

Título: “Desativar o Tom?” Mensagem: “O Tom selecionado será apagado. Deseja continuar?” Ações: Desativar / Cancelar.

Cancelar mantém switch e valor exatamente como estavam.

Confirmar persiste ausência de Tom no workspace. Somente depois do commit bem-sucedido o seletor fica inativo e visualmente centralizado.
Uma ativação posterior começa novamente em 0; não existe restauração oculta do valor removido.

## 9. Interação e persistência do range

Enquanto o usuário movimenta o range, o valor corrente é estado transitório de interface.

Durante o movimento:

- o seletor responde continuamente;
- a superfície integral da memória responde continuamente;
- a região das categorias associadas responde continuamente;
- nenhuma gravação é disparada para cada posição intermediária.

A persistência ocorre quando aquela interação termina, utilizando o valor final. Para mouse e toque, isso corresponde ao encerramento do
gesto; para teclado e outros meios acessíveis, a implementação deve preservar a mesma semântica de resposta contínua e commit ao fim da
interação, sem depender exclusivamente de eventos de ponteiro.

Somente depois do commit local o novo valor é considerado confirmado. Falha mantém a interface coerente com o último valor protegido e deve
permitir nova tentativa sem afirmar que o valor transitório foi salvo.

Ativar em 0 e desativar para ausência são alterações discretas e também só são consideradas concluídas depois do commit correspondente.

## 10. Aplicação visual do Tom na Categorização

A caixa integral que apresenta memória e complementos continua sendo somente leitura, mas não deve parecer um controle desabilitado. Ela
mantém opacidade e contraste normais e recebe integralmente a linguagem visual correspondente ao Tom.

Durante o movimento do range, essa caixa é a principal resposta visual do valor corrente.

A região de categorias associadas também acompanha o Tom, reutilizando a mesma função/aparência cromática já existente, adaptada à geometria
própria dessa região.

A aplicação na área de categorias deve tratar a região como uma superfície pertencente à memória, evitando transformar cada categoria em uma
peça fortemente colorida e visualmente concorrente.

A ação integrada de adicionar/pesquisar categoria pode acompanhar a superfície fechada. PesquisaCategoriaPopup e seu catálogo permanecem
neutros: categorias disponíveis não possuem Tom próprio.

O balanço sentimental permanece neutro e não recebe automaticamente a coloração do Tom. A independência conceitual e funcional entre Tom e
balanço deve continuar perceptível.

## 11. Propagação às listas

Memoria já possui linguagem de Tom nos contextos Memorar e Categorizar.

A unidade deve garantir que o valor real do workspace seja fornecido ao componente e que, depois de um commit de Tom, as listas reflitam
esse valor quando reapresentadas.

Não criar uma segunda linguagem visual para as listas.

Memorar continua sem reservar “Sem categoria” quando não houver associação. Categorizar continua usando “Sem categoria” esmaecido na caixa
compacta conforme o contrato atual.

## 12. Orientação progressiva do Tom

O Tom não aparece no nível iniciante.

No nível intermediário, apresentar:

“O Tom registra a impressão geral que esta memória deixa em você. Ative-o para indicar essa percepção entre negativo, neutro e positivo.”

No nível avançado, apresentar:

“Use o Tom para registrar a impressão geral que esta memória deixa em você.”

A orientação explica o conceito; o seletor continua responsável por comunicar operacionalmente direção, centro, ativação e estado.

## 13. Independência do balanço sentimental

O balanço sentimental é opcional e completamente independente do Tom.

Uma memória pode possuir:

- Tom e balanço;
- Tom sem balanço;
- balanço sem Tom;
- nenhum dos dois.

Adicionar, editar ou excluir balanço não ativa, desativa nem altera o Tom. Ativar, mover ou remover Tom não cria, apaga nem modifica balanço
sentimental.

O balanço passa a estar disponível junto com o Tom, a partir do nível intermediário.

Não utilizar switch de ativação para balanço sentimental. Por ser conteúdo textual, sua existência é representada por adicionar, editar e
excluir o texto.

## 14. Orientação progressiva do balanço sentimental

No nível intermediário, apresentar:

“O balanço sentimental é uma extensão opcional da memória para registrar, em palavras, os sentimentos que ela despertou em você, positivos e
negativos.”

No nível avançado, apresentar:

“Use o balanço sentimental para registrar os sentimentos que esta memória despertou em você.”

A orientação do balanço existe independentemente de o Tom estar ativado ou não.

## 15. Balanço sentimental na superfície da Categorização

A área permanece estável para evitar saltos de geometria ao navegar entre memórias.

Sem balanço sentimental:

- existe uma região compacta neutra com referência visual de três linhas;
- não existe texto confirmado a apresentar;
- aparece a ação “Adicionar balanço sentimental”.

Com balanço sentimental:

- a região apresenta até as três primeiras linhas do texto;
- quando houver continuidade, as linhas inferiores recebem esmaecimento/gradiente para indicar conteúdo adicional;
- não utilizar rolagem interna nessa prévia;
- aparece a ação “Editar balanço sentimental”;
- a própria caixa de prévia também pode ser acionada como atalho para a mesma edição.

A ação explícita Adicionar/Editar deve permanecer visível para não depender de descoberta do clique sobre a caixa.

O balanço não recebe coloração de Tom.

## 16. Popup de inclusão e edição do balanço sentimental

Adicionar ou Editar abre um popup próprio de balanço sentimental. Ele é irmão de PesquisaCategoriaPopup; não é aberto sobre outro popup
contextual da Categorização.

Somente um popup contextual da Categorização permanece aberto por vez.

O popup contém um campo textual maior, com referência de aproximadamente cinco linhas e rolagem interna quando necessário.

Placeholder:

“Registre os sentimentos que esta memória despertou em você…”

Texto vazio ou composto somente por espaços não constitui balanço sentimental.

Em inclusão nova:

- campo inicia vazio e recebe foco;
- ações: Salvar e Cancelar;
- Salvar fica disponível somente com conteúdo textual válido.

Em edição de balanço existente:

- o campo recebe o conteúdo integral;
- ações: Salvar alterações, Cancelar e Excluir balanço sentimental;
- apagar todo o campo não deve contornar a exclusão explícita; sem conteúdo válido, Salvar alterações não fica disponível e a remoção ocorre
  pela ação Excluir.

## 17. Salvar balanço sentimental

Durante a digitação, o texto é rascunho e não integra o workspace confirmado.

Salvar:

1. valida conteúdo não vazio;
2. persiste o balanço no IndexedDB;
3. somente depois do commit bem-sucedido considera a alteração confirmada;
4. elimina o rascunho efêmero;
5. fecha o popup;
6. retorna à mesma Categorização e atualiza a prévia de três linhas.

Falha de persistência mantém o popup aberto, preserva o texto e informa a falha. Não apresentar a alteração como concluída.

Categoria e Tom continuam usando suas persistências imediatas próprias. A existência de um rascunho de balanço não desfaz alterações de
categoria ou Tom já confirmadas.

## 18. Cancelamento dentro do próprio popup

Não abrir um segundo modal de confirmação sobre o popup de balanço sentimental.

Cancelar sem alteração em relação ao conteúdo confirmado fecha o popup diretamente.

Se houver rascunho modificado, Cancelar, Esc, clique fora ou outra tentativa controlada de fechar o popup mantém a mesma janela e troca para
um estado interno de confirmação.

Conteúdo previsto:

Título: “Descartar as alterações?” Mensagem: “As alterações feitas no balanço sentimental ainda não foram salvas e serão perdidas.” Ações:
Descartar alterações / Continuar editando.

Continuar editando retorna ao editor exatamente com o rascunho anterior.

Descartar alterações elimina o rascunho e fecha o popup sem modificar o balanço confirmado no workspace.

## 19. Exclusão dentro do próprio popup

Excluir balanço sentimental também não abre modal sobre modal.

Ao acionar Excluir, o próprio popup entra em estado interno de confirmação.

Conteúdo previsto:

Título: “Excluir o balanço sentimental?” Mensagem: “O balanço sentimental desta memória será removido desta captura.” Ações: Excluir balanço
sentimental / Manter balanço.

Manter balanço retorna à edição.

Confirmar exclusão persiste a ausência de balanço no workspace. O popup só fecha depois do commit bem-sucedido. Falha mantém a janela aberta
e o conteúdo protegido.

Depois da exclusão confirmada, a Categorização volta ao estado sem balanço e apresenta novamente Adicionar balanço sentimental.

## 20. Proteção do rascunho e F5

A edição do balanço sentimental segue o mesmo princípio já utilizado nas edições textuais de Capturar: rascunho efêmero protegido sem virar
alteração confirmada do workspace.

F5, Ctrl+R ou recarregamento equivalente da mesma sessão:

- reconstruem a Categorização da mesma memória;
- reabrem o popup de balanço;
- restauram o último rascunho disponível;
- retornam ao estado normal de edição.

Se o reload ocorrer enquanto o popup estava no estado interno de confirmação de cancelamento ou exclusão, restaurar o editor normal com o
rascunho; não restaurar a pergunta transitória de confirmação.

Voltar, Logout ou outra navegação controlada que abandone a edição com alterações não salvas deve proteger o rascunho antes de permitir a
saída. Quando a própria janela ainda pode permanecer como contexto, utilizar o estado interno de confirmação de descarte; a continuação da
navegação só ocorre depois da confirmação.

Navegação ou encerramento por recursos nativos do navegador utiliza a proteção nativa disponível quando aplicável, sem prometer mensagem
customizada depois do encerramento efetivo da sessão.

## 21. Navegação entre memórias

Fora de um popup ativo, Anterior e Próxima continuam navegando diretamente pela composição.

No nível intermediário ou avançado, os controles aparecem depois das áreas Tom e Balanço sentimental. No nível iniciante, aparecem depois de
Categorias.

Não existe gravação adicional ao navegar quando categoria e Tom já foram confirmados e nenhum popup de balanço possui rascunho ativo.

Um popup de pesquisa de categoria ou de balanço não permanece aberto ao concluir a troca de memória. Rascunho modificado de balanço precisa
ser resolvido antes da troca.

## 22. Modo histórico

A autorização de edição continua seguindo a memória original e o prazo vigente.

Quando a memória estiver histórica:

- categorias permanecem visíveis, sem adicionar, remover ou pesquisar;
- Tom permanece visível com seu valor ou ausência, sem switch editável e sem interação de range;
- balanço sentimental existente permanece consultável;
- não existe ação de adicionar, editar ou excluir balanço;
- quando o balanço for maior que a prévia, sua caixa pode abrir o popup em modo somente leitura para apresentar o conteúdo integral, com
  ação apenas de fechamento;
- a superfície da memória conserva sua aparência normal e a expressão de Tom, sem aparência de item desabilitado.

A navegação Anterior/Próxima continua podendo atravessar memórias históricas.

## 23. Falhas e coerência do workspace

Nenhuma alteração pode ser apresentada como confirmada antes do commit local correspondente.

Em falha:

- categoria conserva as regras já vigentes;
- Tom retorna ou permanece coerente com o último valor confirmado;
- balanço mantém popup e rascunho quando uma gravação falhar;
- exclusão de balanço não fecha a janela se a remoção não tiver sido persistida;
- a pendência da captura deve refletir o estado efetivamente confirmado e não interações transitórias.

Tom, balanço e categorias continuam pertencendo ao workspace local até a futura preservação do dia; esta unidade não transforma commit de
IndexedDB em preservação no servidor.

## 24. Cenários mínimos de validação

### Evolução e visibilidade

- primeiro e segundo dias usam nível iniciante;
- depois da segunda preservação de data distinta, a próxima experiência usa nível intermediário;
- depois da quarta preservação de data distinta, a próxima experiência usa nível avançado;
- repetição de preservação da mesma data não progride nível;
- nível alcançado não regride por remoção posterior de conteúdo;
- iniciante não vê Tom nem balanço;
- intermediário e avançado veem ambos, independentemente de utilizá-los.

### Ajustes de conteúdo

- InclusaoMemoria apresenta “Registre uma memória...”;
- área vazia de categorias apresenta “Adicione uma categoria”;
- Categorias, Tom e Balanço sentimental possuem separação simples e inequívoca.

### Laboratório e seletor

- o range simples do laboratório é substituído pelo Seletor de Tom real;
- sem Tom e Tom 0 são visualmente diferentes;
- o range inativo permanece centralizado e neutro;
- a escala é revelada a partir do centro;
- valores intermediários mostram gradiente progressivo, não cor uniforme;
- negativos e positivos usam seus respectivos extremos;
- temas claro e escuro funcionam;
- mouse, toque e teclado preservam a semântica do controle.

### Tom na Categorização

- ativar ausência cria 0 somente após commit;
- mover responde visualmente sem gravar cada posição intermediária;
- finalizar interação persiste o valor final;
- contexto integral e área de categorias acompanham o valor transitório;
- popup de categorias permanece neutro;
- balanço permanece neutro;
- desativar Tom pede confirmação;
- cancelar mantém o valor;
- confirmar remove o Tom e centraliza/inativa o range;
- reativar depois da remoção começa em 0;
- falha simulada de persistência não afirma valor não confirmado.

### Listas

- Tom confirmado aparece corretamente em Memorar;
- Tom confirmado aparece corretamente em Categorizar;
- ausência e neutro permanecem distintos;
- não é criada outra linguagem visual paralela a Memoria.

### Balanço sentimental

- balanço aparece apenas a partir do intermediário;
- pode existir com ou sem Tom;
- Tom pode existir com ou sem balanço;
- sem balanço aparece Adicionar;
- balanço existente mostra até três linhas com esmaecimento e Editar;
- clicar na prévia abre a mesma edição;
- popup novo recebe foco e placeholder correto;
- conteúdo somente de espaços não pode ser salvo;
- edição existente carrega o texto integral;
- Salvar só fecha depois do commit;
- falha de Salvar mantém texto e popup;
- Cancelar sem mudança fecha diretamente;
- Cancelar com mudança usa confirmação interna, sem novo modal;
- Esc e clique fora obedecem à mesma proteção;
- Excluir usa confirmação interna no mesmo popup;
- falha de exclusão não fecha;
- F5 restaura popup e rascunho;
- F5 durante uma confirmação retorna à edição normal;
- navegação controlada não perde rascunho silenciosamente;
- histórico apresenta balanço somente para consulta.

## 25. Fora de escopo

Não fazem parte desta unidade:

- materializar Revisar ou Preservar;
- alterar os cálculos de Rememorar;
- alterar a regra de disponibilidade de Rememorar;
- criar Tom agregado de dia;
- tornar Tom obrigatório;
- tornar balanço sentimental obrigatório;
- vincular a existência do balanço à existência do Tom;
- criar interpretação automática dos sentimentos escritos;
- apresentar números -100 a +100 ao usuário;
- redesenhar a linguagem cromática já aprovada na 05.08, além da adaptação necessária ao seletor e às superfícies reais;
- alterar prazo e historicidade da memória;
- transformar o popup de balanço em modal empilhado sobre outro modal;
- antecipar backend real ou preservação definitiva.

## 26. Cadência e validações progressivas

### Marco 1 — CMP-007 no laboratório

Materializar o Seletor de Tom real sobre o experimento existente e validar com o operador escala, ativação, ausência/neutro, gradientes,
extremos, temas e acessibilidade de interação.

Não integrar à Categorização antes dessa validação visual.

### Marco 2 — Tom real na Categorização

Integrar o seletor aprovado, persistência final da interação, confirmação de remoção, resposta visual do contexto e categorias e propagação
para as listas.

Validar com o operador antes de ampliar o trabalho textual.

### Marco 3 — Balanço sentimental

Materializar orientação, prévia estável, popup, inclusão, edição, cancelamento protegido, exclusão, rascunho, F5 e histórico.

Executar os cenários mínimos e apresentar o conjunto integrado para aceite.

## 27. Decisões técnicas

Arquitetura interna, nomes concretos de arquivos, composição de estado, estratégia de eventos do range, implementação do gradiente,
mecanismo exato de detecção do fim da interação, persistência efêmera do rascunho, testes e abstrações equivalentes pertencem ao
programador.

Essas decisões não podem alterar:

- a distinção entre ausência e 0;
- a progressão a partir do centro;
- a ausência de gravações por cada posição transitória;
- a confirmação antes de remover Tom existente;
- a independência entre Tom e balanço;
- a proteção textual do balanço;
- a ausência de modal sobre modal dentro do editor de balanço;
- os critérios de evolução progressiva;
- os textos funcionais definidos nesta unidade.

## 28. Critérios de conclusão

A unidade está concluída quando:

- o Seletor de Tom real tiver sido validado no laboratório antes da integração;
- a Categorização estiver dividida claramente em Categorias, Tom e Balanço sentimental conforme o nível aplicável;
- Tom puder ser ativado, movido, persistido e removido com todos os estados definidos;
- a trilha revelar a escala cromática do centro ao valor corrente;
- contexto integral e categorias responderem visualmente ao Tom sem fazer a memória parecer desabilitada;
- Memorar e Categorizar refletirem os Tons reais através de Memoria;
- balanço sentimental puder ser adicionado, lido em prévia, editado e excluído;
- seu popup proteger rascunho, sobreviver a reload e realizar confirmações de cancelamento/exclusão internamente;
- Tom e balanço continuarem totalmente independentes;
- modo histórico permitir consulta sem alteração;
- os placeholders e mensagens progressivas definidos estiverem presentes;
- nenhum comportamento de Revisar tiver sido antecipado.

## 29. Referências de elaboração

- 05.08 - Componente de Memória;
- 05.09 - Categorização;
- 05.10 - Memorar e Categorização;
- 04.06 - Especificação Funcional - Capturar;
- 04.07 - Regras - Capturar;
- 04.08 - Componentes - Capturar.

Estas referências preservam rastreabilidade histórica e não constituem dependência de leitura para o programador. O corpo desta 05.11 deve
ser suficiente para executar a unidade sobre o código vigente.

## Continuidade

### Indicadores de contexto

- Antes das leituras: não disponível na interface; valor inicial não reconstruível.
- Após AGENTS, índice, memória inicial, referências pertinentes e Especificação, antes do fonte: não disponível na interface.
- Final da unidade/sessão: não disponível na interface; não estimar.
- Sessão de retomada em 27/09/2026: indicador indisponível na interface nos marcos inicial e após leitura documental, antes do fonte.

### Plano e estado

1. **CMP-007 no laboratório** — substituir o range experimental pelo seletor real; apresentar e aguardar validação visual do operador antes
   da integração. **Implementado, verificado tecnicamente e aceito visualmente pelo operador em 25/09/2026.**
2. **Tom na Categorização** — integrar seletor validado, commit final, confirmação de remoção, resposta visual e propagação às listas;
   apresentar para validação antes da etapa textual. **Implementado, verificado tecnicamente e aceito visualmente pelo operador em
   26/09/2026.**
3. **Balanço sentimental** — implementar orientações, prévia, popup, proteção de rascunho/reload, confirmações, exclusão e modo histórico;
   apresentar para validação integrada. **Implementado, verificado tecnicamente e aceito visual e funcionalmente pelo operador em
   27/09/2026.**

Etapa corrente: unidade concluída, aguardando eventual solicitação do operador para preparar o Parecer final. Os Marcos 1 e 2 foram aceitos
anteriormente; não reabri-los sem nova indicação. Preservar as alterações documentais preexistentes.

### Marco 3 — início da sessão de retomada

- Clarificação funcional: sem lacunas pendentes. Textos, limites, estados de inclusão/edição/consulta, confirmações internas, persistência,
  proteção por reload e critérios de historicidade estão definidos no corpo aprovado; os campos locais e o contrato de experiência já foram
  aprovados pelo operador.
- Referências lidas: `.docs/referencias/trabalho-local.md` e `.docs/referencias/componentes-e-capacidades.md`. Estado Git anterior às
  alterações desta retomada contém mudanças preexistentes da Spec 11 e a movimentação local da Spec 10; preservar integralmente.
- As verificações técnicas e o aceite do operador estão registrados em “Marco 3 — implementação e verificação técnica”; nenhum teste foi
  executado.

### Marco 1 — registro desta sessão

- `components/SeletorTom.tsx` e `assets/seletor-tom.css` materializam o seletor real, escala neutra, revelação progressiva a partir do
  centro, estados acessíveis e tratamento de ponteiro/teclado.
- `components/ExperimentoMemoria.tsx` usa o seletor no laboratório com ausência/0 distintos, alternância, posições sem exibir números, e
  integração com temas e cores experimentais existentes.
- Verificações: `deno fmt`; lint dos dois componentes; `deno check routes/laboratorio.tsx`; `deno task build`; `git diff --check`. Sem
  testes nesta etapa. Aceite visual registrado acima.

### Marco 2 — registro desta sessão

- `MemoriaLocal` agora admite `tom?: number` e `balancoSentimental?: string`; registros seguem no agregado da captura do store `capturas`,
  sem nova versão IndexedDB. O serviço `salvarTom` verifica historicidade, persiste somente valor final/ativação/remoção e conserva a
  pendência depois do commit.
- `Categorizacao` distingue Categorias e Tom; contexto integral e região das categorias usam `aparenciaTom`, e o seletor aprovado atualiza
  as superfícies durante o movimento. Memorar e Categorizar recebem o Tom confirmado. Exclusão pede a confirmação definida na Especificação;
  falha mantém o valor anterior.
- Após observação visual do operador, removido o status textual redundante logo abaixo da escala; os três rótulos da escala e o switch
  comunicam direção e estado sem duplicação. Formatação, lint, tipos, build e `git diff --check` passaram novamente.
- Inclusão e área de categorias vazias receberam os placeholders definidos.
- Ajuste final da área vazia de categorias: remover a lista sem itens quando não há categorias e alinhar o placeholder verticalmente,
  mantendo a altura de uma linha igual à região com uma ou poucas categorias. Operador confirmou que está tudo ok em 26/09/2026.
- Operador aprovou `diasPreservadosDistintos` como entrada do contrato front de experiência. `experienciaUsuario.read(request)` tem mock com
  valor 2; `nivelDaExperiencia` desconta a captura atual quando já preservada e escolhe os limites de 2 e 4 dias.
- Verificações: `deno fmt`; lint de `components/Categorizacao.tsx`; `deno check routes/capturar/[data].tsx`; `deno task build`;
  `git diff --check`. Sem testes nesta etapa. Aceite visual registrado acima.

### Decisão registrada

- Operador aprovou acrescentar `MemoriaLocal.tom?: number` (-100 a 100, ausência distinta de 0) e `MemoriaLocal.balancoSentimental?: string`
  (texto não vazio após validação, preservado como digitado), armazenados no agregado da captura em `capturas`. A captura só sinaliza
  pendência após commit. Payload remoto fica inalterado; sem migração destrutiva.
- Operador aprovou `diasPreservadosDistintos` como campo de contrato da experiência da conta, fornecido pela fronteira de serviço
  substituível e não inferido da cache local incompleta.

### Marco 3 — implementação e verificação técnica

- `components/BalancoSentimental.tsx` apresenta orientação por nível, prévia neutra fixa de três linhas, popup irmão da pesquisa de
  categorias, edição, leitura integral histórica e confirmações internas de descarte/exclusão. A orientação está em
  `app/servicos/orientacao.ts`; o popup não recebe cores do Tom.
- `app/servicos/captura/balanco.ts` valida texto e historicidade, persiste inclusão/alteração/exclusão somente após commit e marca pendência
  no workspace local. `ProtecaoRascunhoBalanco` guarda conteúdo efêmero separado em sessionStorage, valida conta/data, identidade da
  materialização e texto confirmado de base, restaura somente a mesma sessão e protege navegação controlada e recarregamento.
- `components/EdicaoCategorizacao.tsx` integra Balanço após Tom e antes da navegação nos níveis intermediário/avançado;
  `islands/CapturaDia.tsx` conduz commit e proteção; `assets/categorizacao.css` define geometria estável, linhas de referência, truncamento
  e esmaecimento neutro.
- Mensagem de falha de gravação aprovada pelo operador: “Não foi possível salvar o balanço sentimental. Seu texto continua aqui. Tente
  novamente.” Para exclusão, usa “excluir” no lugar de “salvar”.
- Referências técnicas atualizadas em `.docs/referencias/componentes-e-capacidades.md` e `.docs/referencias/trabalho-local.md`.
- Verificações: `deno fmt` nos cinco arquivos TS/TSX editados; `deno lint` nos mesmos arquivos; `deno check` na rota e nos cinco módulos
  TS/TSX; `deno task build`; `git diff --check`. Todas passaram. Nenhum teste foi criado ou executado. O build completo client/server
  terminou com sucesso.
- O mock atual usa duas datas distintas preservadas e oferece nível intermediário numa nova data. O operador confirmou que a validação da
  unidade está correta em 27/09/2026. Preservar alterações Git preexistentes da Spec 11 e a movimentação da Spec 10.
- Ajuste após observação do operador: prévia vazia sem linhas de skeleton; esmaecimento de conteúdo longo alinhado ao componente Memoria
  compacto; campo de edição com altura fixa e sem redimensionamento; ações Salvar/Cancelar/Excluir e Excluir/Manter com largura uniforme de
  8rem, alinhadas à direita sem ocupar o popup; removido o botão X dos cabeçalhos do popup. Ajustes aceitos pelo operador em 27/09/2026.

## Parecer final

Foram implementados e aceitos pelo operador o Seletor de Tom CMP-007, sua aplicação na Categorização e nas listas de memórias, e o balanço
sentimental progressivo com prévia, edição, leitura histórica, exclusão e proteção de rascunho/reload. O componente
`components/BalancoSentimental.tsx` é integrado à página pela `components/EdicaoCategorizacao.tsx`; persistência e proteção local ficam em
`app/servicos/captura/balanco.ts` e `islands/CapturaDia.tsx`.

Os campos `tom` e `balancoSentimental` são locais ao agregado da captura IndexedDB. A implementação não alterou o payload remoto nem exigiu
migração destrutiva. O nível de experiência recebe `diasPreservadosDistintos` pelo contrato front substituível, com mock para o cenário
desta unidade. Não foi antecipado comportamento de Revisar.

O operador confirmou a validação visual e funcional em 27/09/2026. Formatação, lint, checagem de tipos e `git diff --check` passaram; o
build completo passou antes dos ajustes finais de apresentação. Nenhum teste foi criado ou executado. Parecer final entregue ao operador; o
registro canônico no Drive permanece sob responsabilidade do operador.
