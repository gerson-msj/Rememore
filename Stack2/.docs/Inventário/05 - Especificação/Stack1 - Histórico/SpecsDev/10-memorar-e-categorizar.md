# 05.10 - Memorar e Categorização

## 1. Finalidade

Refinar a experiência já materializada de Capturar antes da entrada do Tom, sem reconstruir a funcionalidade desde o início.

Esta unidade parte do estado real produzido por 05.07 - Registrar e Organizar, 05.08 - Componente de Memória e 05.09 - Categorização. Tudo o
que essas unidades já materializaram e que não for explicitamente alterado abaixo permanece vigente.

O objetivo é tornar mais fluida a construção da composição do dia, separar inclusão de edição de memória, integrar o componente reutilizável
de memória à primeira aba e compactar a Categorização para acomodar melhor suas capacidades atuais e a futura entrada do Tom.

## 2. Limite da unidade

Esta Especificação altera somente os pontos descritos neste documento.

Continuam valendo, conforme já materializados, os contratos de workspace local, pendência, prazo de edição, historicidade, complementos,
exclusão regressiva, rascunho efêmero de texto, concorrência entre abas/janelas, cache e revisão de origem, tratamento de falhas e demais
comportamentos de Capturar que não forem modificados aqui.

Não implementar nesta unidade:

- Tom;
- balanço sentimental;
- Revisar e Preservar funcional;
- preservação remota;
- backend real;
- nova navegação por abas dentro de Editar Memória ou Categorização.

A reorganização desta unidade deve preparar a superfície para o Tom futuro, sem antecipar sua mecânica.

## 3. Nomes das três abas

As três abas da Captura do dia passam a ser apresentadas como:

- Memorar;
- Categorizar;
- Revisar.

“Registrar e organizar”, “Categorizar e Tom” e “Revisar e Preservar” deixam de ser os rótulos vigentes da interface.

A mudança deve alcançar os rótulos visuais e nomes acessíveis pertinentes. Renomes técnicos internos ficam a critério do programador quando
não forem necessários ao contrato observável.

## 4. Memorar como composição do dia

Memorar permanece como a primeira aba e continua apresentando a composição das memórias do dia na ordem atual.

A ação Adicionar memória deixa a linha fixa superior. A inclusão passa a acontecer diretamente no fluxo da lista.

Quando a composição estiver sem memórias, permanece a orientação progressiva já vigente para esse contexto. Abaixo dela aparece a ação
Incluir memória.

Quando já houver memórias, Incluir memória aparece depois da última memória da lista.

Enquanto nenhuma inclusão estiver aberta, as memórias existentes continuam podendo ser abertas e reordenadas conforme as regras vigentes.

## 5. Integração do componente Memoria em Memorar

A lista real de Memorar passa a utilizar o componente reutilizável Memoria materializado pela 05.08, no contexto correspondente à primeira
aba.

O componente recebe os dados já disponíveis da memória, inclusive categorias, Tom ou ausência e posição necessária para os controles de
ordenação. Permanecem as regras do componente para prévia compacta, categorias, aparência de Tom e Elevar/Rebaixar.

Neste contexto, ausência de categoria continua sem reservar a indicação “Sem categoria”.

A unidade acrescenta ao componente um estado inativo.

Quando inativo:

- o acionamento geral da memória não executa ação;
- Elevar e Rebaixar não executam ação;
- controles indisponíveis também devem permanecer indisponíveis por teclado e demais meios acessíveis de acionamento;
- a aparência deve comunicar indisponibilidade de forma coerente com o restante da interface.

A solução visual concreta desse estado fica a critério do programador, desde que a indisponibilidade não seja apenas aparente.

## 6. Inclusão de memória dentro da lista

Acionar Incluir memória abre um componente de inclusão no próprio ponto final da composição, em vez de navegar para a tela usada para editar
memórias existentes.

Enquanto o componente de inclusão estiver aberto:

- as memórias existentes permanecem visíveis;
- todas as memórias existentes ficam no estado inativo;
- os controles de ordenação ficam inativos;
- as três abas ficam inativas;
- Incluir memória deixa de ser uma segunda ação concorrente e o componente aberto ocupa essa função;
- a captura continua na aba Memorar.

O componente possui:

- caixa de texto com altura visual de referência de cinco linhas;
- rolagem interna quando o texto exceder essa altura;
- botão em ícone para Incluir memória;
- botão em ícone para Cancelar inclusão.

Os ícones devem possuir nome acessível e descrição/title coerentes. O title da ação principal é simplesmente “Incluir memória”; não repetir
nele as dicas de atalhos.

Texto vazio ou composto somente por espaços continua não constituindo memória válida.

## 7. Rolagem ao abrir e continuar uma inclusão

A abertura da inclusão deve reposicionar a região rolável para preservar contexto, e não apenas executar um “rolar até o fim” genérico.

Quando já existir ao menos uma memória, a última memória da composição deve ficar visível no topo da região rolável, ou tão próxima do topo
quanto a geometria disponível permitir, com o componente de inclusão imediatamente abaixo.

O objetivo é permitir que o usuário reconheça facilmente qual foi a última memória já incluída e escreva a próxima em continuidade visual.

Quando ainda não existir memória, a orientação progressiva aplicável permanece visível acima da região de inclusão sempre que o espaço
permitir, seguida do componente.

Depois de uma inclusão que imediatamente abra outra inclusão, a memória recém-confirmada passa a ser a referência: ela deve ficar no topo ou
tão alta quanto possível, com o novo componente vazio logo abaixo.

## 8. Confirmar e cancelar inclusão

Confirmar uma memória válida:

1. persiste a nova memória no workspace IndexedDB segundo o contrato já vigente;
2. inclui a memória na última posição da composição;
3. somente depois da confirmação local apresenta a memória como item normal da lista;
4. encerra a inclusão normal.

Se a persistência falhar:

- a memória não aparece como confirmada;
- o componente de inclusão permanece aberto;
- o texto digitado permanece disponível e protegido;
- deve ser possível tentar novamente.

Cancelar inclusão sempre solicita confirmação antes de descartar o texto atual, inclusive quando a caixa ainda estiver vazia.

A confirmação deve deixar claro que a inclusão em andamento será cancelada e que o texto ainda não incluído será perdido. O programador pode
reutilizar CMP-004 e ajustar a redação ao padrão já existente, sem mudar essa consequência.

Confirmando o cancelamento:

- o rascunho efêmero da inclusão é descartado;
- o componente fecha;
- a lista volta ao estado interativo normal.

Recusar o cancelamento mantém a inclusão exatamente como estava.

## 9. Continuidade da inclusão e F5

O texto da inclusão continua protegido de forma efêmera, sem transformar o rascunho em memória nem em alteração confirmada do workspace.

F5, Ctrl+R ou recarregamento equivalente da própria página não representam abandono.

Ao reconstruir a captura depois de um reload:

- Memorar volta a ser apresentado;
- o componente de inclusão volta aberto;
- o texto protegido é restaurado até o último estado disponível;
- as memórias e abas continuam inativas enquanto a inclusão permanecer aberta;
- a rolagem volta ao contexto adequado da inclusão.

O usuário só abandona deliberadamente a inclusão por uma ação de saída, como Cancelar inclusão, Voltar, Logout ou navegação que deixe a
captura.

Voltar pelo header, Logout e demais navegações controladas pelo Rememore que abandonem a inclusão devem solicitar confirmação antes de
descartar o rascunho.

Navegação/fechamento por recursos nativos do navegador utiliza a proteção nativa disponível quando aplicável, sem prometer mensagem
customizada ou restauração depois do encerramento efetivo da sessão da aba.

## 10. Atalhos da inclusão

Dentro da caixa de inclusão:

- Enter insere quebra de linha normalmente;
- Shift+Enter executa a inclusão normal da memória;
- Ctrl+Enter inclui a memória e, depois de confirmação local bem-sucedida, abre imediatamente uma nova inclusão vazia;
- Esc aciona Cancelar inclusão e passa pela mesma confirmação do botão.

Ctrl+Enter nunca abre a próxima inclusão antes de a memória corrente estar confirmada no IndexedDB. Em caso de falha, permanece na memória
atual com seu texto.

Depois de Ctrl+Enter bem-sucedido:

- a memória confirmada aparece no fim da lista;
- um novo componente de inclusão vazio é aberto logo abaixo;
- o foco fica disponível para continuar a digitação;
- a rolagem usa a regra de continuidade definida acima.

## 11. Dica inicial dos atalhos

Durante a inclusão da primeira memória da captura, enquanto o usuário ainda não tiver alcançado o nível intermediário, apresentar abaixo do
componente uma dica curta sobre os atalhos.

Texto previsto:

“Enter cria uma nova linha. Shift+Enter inclui a memória. Ctrl+Enter inclui e permite registrar outra. Esc cancela.”

A dica é própria da aprendizagem da inclusão e não substitui a Orientação Progressiva de Memorar.

Ela aparece somente para a primeira memória daquela captura. Depois que a primeira memória for confirmada, não volta naquela captura mesmo
que todas as memórias sejam posteriormente excluídas.

O critério que informa se o usuário já alcançou o nível intermediário continua pertencendo ao mecanismo de evolução já existente; esta tela
não inventa nem calcula um novo critério.

## 12. Editar Memória permanece separado da inclusão

Clicar numa memória existente em Memorar passa a representar exclusivamente a entrada em Editar Memória.

A tela específica de memória existente mantém as regras atuais de editabilidade, prazo, leitura histórica, complementos, rascunho, exclusão
regressiva e demais comportamentos já materializados.

A identificação da superfície passa a ser “Editar Memória” no header/contexto correspondente.

As abas da Captura do dia continuam ocultas durante Editar Memória.

Não criar navegação interna entre Memorar, Categorizar e Revisar dentro de Editar Memória. Voltar retorna a Memorar.

Os controles Elevar/Rebaixar continuam não propagando o clique geral da memória.

## 13. Nova composição da Categorização

A tela Categorização continua sendo aberta a partir da lista da aba Categorizar e permanece uma superfície específica da memória.

A organização passa a ser mais compacta.

De cima para baixo:

1. contexto integral da memória;
2. categorias atualmente associadas;
3. ação de adicionar/pesquisar categoria;
4. navegação entre memórias.

A caixa de contexto da memória utiliza altura visual de referência de cinco linhas e rolagem interna para o excedente, aproximando sua
linguagem da região textual usada em Editar Memória. O conteúdo continua sendo somente leitura nessa superfície e inclui memória e
complementos conforme o contrato vigente.

## 14. Área das categorias associadas

As categorias atualmente associadas aparecem imediatamente abaixo da caixa de contexto.

A região começa com altura suficiente para uma única linha.

Se as categorias não couberem, a própria região cresce naturalmente até duas linhas.

A partir de duas linhas, não cresce mais; o excedente utiliza rolagem interna.

Essa composição deve favorecer visualmente a ideia de uma categoria dominante sem proibir múltiplas associações.

Cada categoria associada continua oferecendo a ação de remoção quando a memória estiver editável.

A ação de adicionar/pesquisar categoria permanece sempre acessível à direita da região e não deve desaparecer em razão da rolagem interna
das categorias.

A forma visual concreta dos itens e do controle de pesquisa pode aproveitar a materialização vigente, desde que preserve esses
comportamentos.

## 15. Popup de pesquisa de categoria

Adicionar/pesquisar categoria abre um popup dedicado.

O popup reutiliza o comportamento de pesquisa já materializado na 05.09:

- pesquisa vazia apresenta as categorias disponíveis na ordem já vigente;
- pesquisa usa debounce;
- correspondência textual normalizada vem primeiro, ignorando caixa, acentuação e espaços externos;
- enquanto houver resultado simples, busca aproximada não é misturada;
- somente quando a busca simples retornar zero resultados pode aparecer a opção de nova categoria seguida das sugestões suficientemente
  semelhantes;
- a opção de criar categoria nova continua precedendo as sugestões aproximadas quando aplicável.

Categorias já associadas à memória continuam aparecendo nos resultados para evitar dúvida sobre sua existência, porém ficam indisponíveis
para nova seleção.

A indicação concreta desse estado — esmaecimento, marca, texto auxiliar ou solução equivalente — fica a critério do programador, desde que
seja inequívoco que a categoria já está associada e não execute nova ação.

A verificação de duplicidade para categoria nova considera também categorias já associadas; filtrar ou desabilitar uma categoria não pode
fazer surgir uma criação duplicada do mesmo nome normalizado.

Selecionar uma categoria ainda não associada ou a opção válida de nova categoria:

1. fecha o popup;
2. promove a associação ao workspace conforme a persistência definida abaixo;
3. faz a categoria aparecer na área de categorias da memória.

O popup pode ser fechado sem selecionar nada:

- por controle explícito de fechar;
- por clique fora da área do popup.

Fechar sem seleção não produz alteração.

## 16. Persistência imediata da Categorização

A Categorização deixa de usar uma etapa final de Salvar/Cancelar para as associações.

Toda inclusão ou remoção efetiva de categoria é persistida imediatamente no workspace IndexedDB.

O IndexedDB continua sendo o workspace de elaboração; a preservação definitiva do dia permanece responsabilidade futura de
Revisar/Preservar.

Consequências:

- não existe botão Salvar da Categorização;
- não existe botão Cancelar para desfazer um conjunto de mudanças de categoria;
- não existe rascunho de categorias em sessionStorage;
- F5 simplesmente reconstrói a Categorização a partir do workspace já atualizado;
- trocar de memória não exige confirmação ou gravação adicional;
- voltar à lista não exige salvar nem descartar categorias.

Uma alteração só deve aparecer como efetivamente concluída depois do commit local correspondente.

Se a persistência falhar, a interface não pode afirmar silenciosamente um estado que não existe no workspace. A tela permanece utilizável e
deve permitir nova tentativa ou nova ação coerente com o estado realmente confirmado.

Persistência imediata não deve criar pendência artificial. Se as associações retornarem efetivamente ao mesmo estado da origem aplicável e
não houver outras alterações no workspace, o estado de pendência deve refletir essa equivalência. Mudanças anteriores de outros tipos não
podem ser apagadas por essa comparação.

## 17. Navegação entre memórias na Categorização

A Categorização passa a oferecer navegação direta para a memória anterior e para a próxima memória da composição, evitando voltar à lista
para categorizar itens consecutivos.

Os controles devem possuir nomes acessíveis equivalentes a “Memória anterior” e “Próxima memória”.

Na primeira memória, Anterior fica indisponível. Na última, Próxima fica indisponível.

Ao navegar:

- a memória alvo passa a ocupar a mesma superfície de Categorização;
- contexto e categorias são atualizados;
- a autorização de edição/historicidade é avaliada para a memória alvo conforme as regras vigentes;
- não há Salvar, Cancelar ou confirmação intermediária, pois alterações de categoria anteriores já foram persistidas;
- eventual popup de pesquisa não permanece aberto para a memória seguinte.

Memórias históricas continuam somente para consulta: não oferecem inclusão, remoção ou pesquisa de categoria, mas podem participar da
navegação anterior/próxima.

A posição visual concreta dos controles de navegação fica a critério do programador, desde que pertençam claramente à Categorização da
memória corrente e não se confundam com as abas da Captura do dia.

## 18. Retorno da Categorização à lista

Ao voltar da Categorização para a lista de Categorizar, a memória que estava aberta deve ser a referência da restauração de rolagem.

Quando houver espaço, posicioná-la no topo da região rolável da lista.

Nas últimas memórias, quando não houver conteúdo suficiente abaixo para alinhamento exato ao topo, posicioná-la tão alta quanto a geometria
permitir.

Esta regra é deliberadamente diferente da reordenação de Memorar, que preserva contexto com memórias vizinhas.

O objetivo aqui é tornar inequívoco qual memória acabou de ser trabalhada.

## 19. Relação com o futuro Tom

Esta unidade não implementa Tom nem balanço sentimental.

A nova composição da Categorização deve, porém, evitar ocupar desnecessariamente a altura disponível e deixar a superfície apta a receber
posteriormente:

- um range de Tom usando a largura disponível;
- resposta visual de cor durante interação;
- persistência do Tom em momento apropriado da interação;
- um mecanismo para incluir balanço sentimental e exibi-lo quando existente.

Esses comportamentos são apenas direção de continuidade e serão especificados na unidade própria do Tom. Não antecipar sua mecânica nesta
implementação.

## 20. Cenários de validação

Antes do encerramento, validar com o operador pelo menos os seguintes comportamentos observáveis.

### Memorar e inclusão

- as abas aparecem como Memorar, Categorizar e Revisar;
- a lista real de Memorar utiliza Memoria;
- sem memórias, orientação aparece e Incluir memória fica abaixo;
- com memórias, Incluir memória fica depois da última;
- abrir inclusão mantém memórias visíveis, mas inativas;
- clicar ou usar teclado nas memórias/ordenação durante inclusão não executa ação;
- abas ficam inativas durante inclusão;
- campo possui referência de cinco linhas e rolagem interna;
- Enter cria nova linha;
- Shift+Enter inclui e encerra a inclusão;
- Ctrl+Enter inclui e abre outra inclusão somente depois do commit local;
- Esc passa pela confirmação de cancelamento;
- Cancelar inclusão passa pela confirmação mesmo com campo vazio;
- falha simulada de persistência não fecha a inclusão nem perde o texto;
- F5 restaura a inclusão e o texto sem criar memória;
- na primeira inclusão de usuário ainda iniciante, a dica de atalhos aparece;
- depois da primeira memória confirmada, a dica não reaparece naquela captura;
- a rolagem mantém a última memória como referência e o novo componente logo abaixo;
- confirmar inclusão faz a memória surgir como último item da lista.

### Editar Memória

- clicar numa memória existente abre Editar Memória;
- header/contexto identifica Editar Memória;
- abas permanecem ocultas;
- regras atuais de edição, historicidade, complementos e exclusão continuam funcionando;
- Voltar retorna a Memorar segundo o comportamento vigente.

### Categorização

- contexto integral ocupa caixa de aproximadamente cinco linhas com rolagem interna;
- categorias ocupam uma linha quando possível, crescem no máximo até duas e depois rolam internamente;
- ação de pesquisa permanece acessível;
- popup pode fechar por controle próprio ou clique fora sem alterar nada;
- busca simples, difusa e criação mantêm a lógica atual;
- categoria já associada aparece no resultado, mas não pode ser selecionada de novo;
- seleção válida fecha o popup e persiste no workspace;
- remoção de categoria persiste imediatamente;
- não existe Salvar ou Cancelar da categorização;
- F5 reflete o estado já confirmado no IndexedDB;
- falha simulada de persistência não apresenta associação inexistente como concluída;
- Anterior/Próxima navegam pelas memórias sem retorno à lista;
- primeira/última memória indisponibilizam o controle correspondente;
- modo histórico permanece somente leitura;
- Voltar à lista posiciona a memória trabalhada no topo ou tão alta quanto possível.

## 21. Liberdade técnica e retorno ao operador

Composição interna, nomes técnicos, CSS, estratégia de foco, implementação do popup, recurso usado para inativação, mecanismo concreto de
rolagem e demais escolhas que preservem o contrato acima ficam sob responsabilidade do programador.

Antes de criar ou atualizar o Markdown operacional, realizar a clarificação funcional prevista pela metodologia do projeto.

Retornar ao operador antes de avançar se a implementação exigir:

- mudar alguma consequência funcional descrita acima;
- perder proteção de rascunho de texto;
- alterar as regras vigentes de prazo, historicidade, complementos ou exclusão;
- transformar persistência local em preservação definitiva;
- antecipar Tom ou Revisar;
- modificar o significado de pendência;
- criar navegação entre perspectivas dentro de Editar Memória.

## 22. Referências de elaboração

Esta Especificação foi elaborada a partir do estado vigente de:

- 04.06 - Especificação Funcional - Capturar;
- 04.08 - Componentes - Capturar;
- 05.07 - Registrar e Organizar;
- 05.08 - Componente de Memória;
- 05.09 - Categorização.

Estas referências preservam rastreabilidade histórica e não constituem dependência de leitura para o programador. O corpo desta 05.10 deve
ser suficiente para executar as alterações aqui determinadas sobre o código vigente.

## Continuidade

### Sessão de 23/09/2026

- Clarificação concluída; implementação autorizada pelo operador.
- Aprovado adaptar o workspace local para guardar categorias de origem, alterações de outros tipos e o indicador de primeira memória
  confirmada. Workspaces antigos de desenvolvimento podem ser descartados; não é necessário preservar ou migrar seus dados. A adaptação não
  altera payloads remotos, cookies, rotas ou contratos de autenticação.
- A dica de atalhos usa o nível resolvido pelo serviço de orientação e não reaparece após a primeira confirmação, mesmo depois de exclusões.
- Manter a orientação progressiva acima do contexto da Categorização e o aviso de múltiplas categorias abaixo das categorias.
- Estado inicial do Git: exclusão de `09-categorizacao.md`, nova cópia em `concluidas/09-categorizacao.md` e esta Spec 10 não rastreada.
  Alterações preexistentes preservadas; sem commit ou push.

Plano e validações:

1. **Implementado e validado pelo operador — base local e Memorar:** adaptar metadados locais e controle de pendência; integrar
   Memoria e inativação; inclusão na lista, atalhos, rolagem e proteção de rascunho; manter Editar Memória separado. Verificar commit/falha,
   reload e regressões de edição; apresentar o bloco ao operador para validação visual e funcional antes da próxima etapa.
2. **Implementada e validada pelo operador — Categorização:** estrutura compacta, popup, associação/remoção
   imediatas, navegação e retorno contextual à lista.
3. **Concluída — revisão da unidade:** operador confirmou que todos os cenários foram testados e estão corretos; Parecer final registrado
   abaixo a pedido do operador.

Indicadores de contexto: antes das leituras e após a leitura inicial/antes do fonte, percentual e capacidade total não disponíveis. Ao final
da etapa 1, percentual e capacidade total também não disponíveis; nenhum valor foi estimado.

Resultado técnico da etapa 1:

- Schema local 6: descarte único das capturas antigas, preservando `catalogosCategorias`; campos `categoriasOrigem`, `alteracoesOutras` e
  `primeiraMemoriaConfirmada`. Preparação captura as associações da origem; alterações de texto/composição/ordem mantêm marca própria. O
  serviço de categorias já reconhece reversão para a origem sem apagar outras pendências, inclusive depois de reabrir o workspace.
- Lista real de Memorar usa `Memoria`, com estado `inativa`; callbacks de ordenação conservam a referência do botão para a rolagem vigente.
  As três abas foram renomeadas e ficam indisponíveis durante inclusão. Laboratórios conservados, com rótulos atualizados.
- `InclusaoMemoria` apresenta campo de cinco linhas, botões com ícone e texto, dica inicial, atalhos e foco de continuidade. Confirmação
  normal fecha; Ctrl+Enter abre outra inclusão somente após commit. Cancelar/Esc sempre confirmam; Voltar e Logout protegem abandono,
  inclusive vazio.
- Rascunho continua em `RascunhoMemoria`, com a mesma chave e retomada compatível por reload; abertura/continuidade/restauração usam a
  última memória como referência de rolagem. Tela de memória existente agora identificada como Editar Memória, mantendo regras anteriores.
- Validações: 48 testes passaram (edição, categorias, preparação/workspace e sessão/bloqueio), incluindo falha de gravação, espera por
  commit, rascunho vazio, primeira confirmação/exclusão, reversão de categorias após reabertura, preservação de outras pendências e
  migração 6. Tipos dos consumidores afetados, lint direcionado e build de produção passaram. `git diff --check` conferido ao final.
- Testes de IndexedDB usam emulação em memória; não substituem F5, falhas de disco/quota e comportamento visual no navegador real. Nenhuma
  validação visual/funcional do operador foi presumida. Próximo passo: avaliar Memorar (seção 20) e ajustar esse bloco antes da etapa 2.
- Tom e Revisar não foram implementados nesta unidade. O estado anterior da Categorização descrito ao final da etapa 1 foi substituído pelas
  alterações da etapa 2. Referências técnicas locais foram atualizadas para o estado atual.
- Sem commit ou push; alterações documentais preexistentes preservadas. Spec 10 permanece aberta, sem Parecer final.

Ajuste solicitado pelo operador após avaliar a inclusão:

- O operador aprovou visualmente o controle de inclusão e a disposição dos botões abaixo do campo; isso não representa aceite dos demais
  cenários da etapa 1.
- As ações existentes de Editar Memória foram removidas da linha da data e posicionadas abaixo do campo ativo, inclusive na edição de
  complemento. Em leitura histórica, permanecem após o conteúdo. Mantidos ícones, cores, ações, confirmações e condições de disponibilidade.
- Inclusão e edição compartilham a classe `captura-acoes-texto`, com `buttons has-addons`, margem superior e alinhamento à direita.

Cenário solicitado para validação de rolagem e complementos:

- Em desenvolvimento, 10/09/2026 recebe do serviço remoto simulado 18 memórias, com IDs estáveis, ordem de 0 a 17, primeira preservação em
  10/09/2026 às 23h UTC e prazo de três dias. Na data desta sessão, todas são históricas e oferecem Adicionar complemento; não há
  complementos prévios. Revisão `spec10-rolagem-complementos-1` em `app/servicos/captura/simulado.ts`.
- O cenário usa a preparação remota simulada normal; não grava diretamente no IndexedDB. Configuração manual do mock para a data continua
  tendo precedência, e workspace pendente continua protegido contra substituição. Entrada normal pela Seleção busca a nova revisão se não
  houver pendência; reload de materialização aberta mantém o contrato de retomada vigente.

Ajuste de apresentação solicitado após mover as ações para baixo dos campos:

- Botões de inclusão e edição agora exibem ícone e texto, reutilizando os rótulos das ações existentes: Incluir memória, Cancelar inclusão,
  Confirmar Memória/Complemento, Adicionar complemento e Excluir Memória/último complemento. Substitui, por determinação do operador, a
  apresentação somente em ícone prevista originalmente para inclusão. Mantidos agrupamento, alinhamento, cores e disponibilidade.

Permanência em Editar Memória determinada pelo operador:

- Confirmar edição de memória, incluir complemento ou confirmar edição de complemento mantém a tela Editar Memória aberta, após commit. O
  estado passa a limpo, com texto original e cadeia de complementos atualizados para permitir nova edição, exclusão ou reload sem duplicar o
  complemento confirmado; preserva a autorização da edição em curso.
- Excluir o último complemento continua na mesma tela. Somente excluir a própria memória provoca retorno automático à lista nesse contexto.
  Voltar pelo header permanece uma ação explícita do usuário. Inclusão de nova memória na lista mantém sua confirmação normal/Ctrl+Enter.

Retorno visual solicitado pelo operador para as operações em Editar Memória:

- Após commit efetivo, usar MensagemPopup de sucesso com apenas OK: “Memória alterada.”, “Complemento incluído.”, “Complemento alterado.”,
  “Último complemento excluído.” ou “Memória excluída.”, conforme a operação.
- Alterações e exclusão de complemento mantêm Editar Memória aberta; exclusão da memória retorna à lista e apresenta o aviso ali.
  Confirmações anteriores à exclusão permanecem. Falha não apresenta sucesso e confirmação sem mudança não afirma alteração. Inclusão de
  memória na lista mantém seu fluxo, inclusive Ctrl+Enter, sem esse popup intermediário.

Ajuste visual da ordenação solicitado pelo operador:

- Elevar e Rebaixar no componente Memoria ficam lado a lado, à direita e centralizados verticalmente, para não sugerirem uma barra de
  rolagem. Mantidas as setas, nomes acessíveis, condições de indisponibilidade e comportamento de reordenação. A mudança de CSS vale para a
  lista real e para o componente apresentado no laboratório.

Avanço autorizado pelo operador para a etapa 2 após os ajustes de Memorar e Editar Memória. A autorização não substitui a validação
explícita dos cenários ainda não observados. Implementação segue composição compacta, pesquisa em popup, gravação imediata, navegação entre
memórias e restauração de rolagem; contexto de sessão guarda somente alvo/autorização, nunca associações transitórias.

### Etapa 2 — Categorização

- Implementada; aguardando validação visual/funcional do operador após avanço autorizado em 23/09/2026.
- `Categorizacao` reorganiza orientação, contexto, categorias e navegação; seleção/removação em lista usa persistência imediata com
  confirmação pelo commit local. A tela atualiza apenas com a captura retornada pelo serviço.
- Pesquisa em popup, resultados associados indisponíveis, filtro de debounce enquanto aguarda e navegação anterior/próxima estão integrados.
  Popup também fecha por Escape, botão e clique fora. A restauração de Categorização lê associações confirmadas do workspace; o marcador de
  sessão guarda somente alvo/autorização/rolagem.
- Laboratório atualizado com alteração imediata das amostras em memória, sem tocar no workspace.
- Verificações de tipos, lint, build e `git diff --check` passaram após a revisão automática voltar a aceitar o executor. Não foram
  executados testes automatizados nesta retomada. Validação visual/funcional do operador permanece pendente. Spec 10 continua aberta.

### Etapa 2 — estado da implementação em 23/09/2026

- Implementadas composição compacta, popup de pesquisa, associação/remoção com persistência imediata, falha recuperável, estados históricos,
  navegação e retorno à lista. Laboratório demonstra associações imediatas somente em estado de amostra.
- Verificações técnicas concluídas: `deno check` dos consumidores/arquivo de contratos alterados, lint direcionado, build completo e
  `git diff --check`.
- Não foram executados testes automatizados nem inspeção visual do navegador nesta retomada. Permanecem pendentes a validação funcional e
  visual do operador dos cenários da seção 20, sobretudo pesquisa simples/aproximada/criação, falha de persistência, reload de associações,
  modos histórico/editável, limites anterior/próxima e alinhamento da memória ao retornar à lista.
- A anotação anterior de que a interface ainda usava Salvar corresponde ao estado ao final da etapa 1 e foi substituída pela implementação
  desta etapa. Referências técnicas locais agora descrevem persistência imediata e o marcador de sessão sem seleções.
- Etapa 2 implementada, aguardando validação do operador. Etapa 3 de revisão global da unidade continua pendente. Spec permanece aberta, sem
  Parecer final.

### Ajuste visual da pesquisa de categorias solicitado pelo operador em 23/09/2026

- A caixa de categorias selecionadas também abre a pesquisa por clique, Enter ou Espaço; os controles individuais de remoção mantêm sua
  ação própria. O botão de pesquisa foi integrado visualmente à borda direita da caixa.
- A lista de resultados no popup reserva a altura de cinco resultados mesmo vazia e usa rolagem interna para resultados adicionais.
- O operador validou visualmente e funcionalmente os ajustes da Spec 10 e confirmou que todos os cenários estão corretos. O ícone foi
  mantido à direita, sem fundo, centralizado verticalmente. Não houve mudança no contrato de pesquisa, seleção ou persistência imediata.

## Parecer final

Foram implementadas a inclusão de memória diretamente na lista Memorar, sua proteção de rascunho e atalhos, os ajustes da tela Editar
Memória e a Categorização com pesquisa, associação e remoção persistidas imediatamente no workspace local, navegação entre memórias e
restauração contextual da lista. A composição usa `Memoria`, `InclusaoMemoria`, `Categorizacao`, `SeletorCategoria` e
`PesquisaCategoriaPopup`; o schema local foi atualizado para os metadados de origem e pendência necessários. A pesquisa de categorias
permanece numa janela; sua caixa de categorias abre a janela por clique ou teclado, integra o ícone sem fundo à direita e mantém área de
resultados para cinco itens com rolagem adicional.

Por solicitação do operador, as ações de edição ficam abaixo do campo ativo, os botões de confirmação exibem ícone e texto, as confirmações
de edição mantêm a tela aberta até ação explícita, as operações efetivas exibem retorno de sucesso e a ordenação usa setas lado a lado.
Foi preparado no serviço remoto simulado um cenário de 18 memórias para 10/09/2026. Nenhum comportamento de Tom ou Revisar foi antecipado.

O operador confirmou que testou os cenários previstos na seção 20 e que estão corretos. A implementação foi validada tecnicamente conforme
registrado na Continuidade; uma tentativa posterior de validação local não pôde executar Deno porque o comando não estava disponível nesse
terminal. As alterações permanecem sem commit ou push. Parecer entregue ao operador; não houve atualização do registro canônico no Drive.
