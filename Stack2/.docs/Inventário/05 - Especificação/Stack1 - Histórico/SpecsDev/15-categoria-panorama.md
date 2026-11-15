# 05.15 - Categoria do Panorama

## Finalidade

Construir, experimentar e aprovar visualmente **CMP-009 — Categoria do Panorama**, segundo componente próprio da jornada Rememorar.

A unidade é deliberadamente pequena e permanece no laboratório. Seu objetivo é fechar o contrato funcional e a linguagem visual da categoria individual antes de construir o bloco real que reúne, ordena e revela várias categorias no Panorama.

CMP-009 deve nascer como componente reutilizável, ser experimentado isoladamente e depois observado em uma pequena composição demonstrativa com várias categorias. Essa composição existe somente para validar o aspecto visual do conjunto; ela não constitui a futura lista real do Panorama.

Nesta unidade, CMP-009 **não deve ser integrado a `/rememorar`**. A integração real ficará para uma unidade posterior, quando também forem definidos o cálculo do conjunto, a ordenação, a quantidade inicialmente visível e o mecanismo de paginação, revelação ou equivalente.

## Base existente

A 05.14 materializou **CMP-008 — Janela Temporal de Rememorar** e deixou `/rememorar` preparada para crescimento progressivo, ainda com dados controlados.

O laboratório existente permanece organizado em blocos independentes. CMP-009 deve receber um novo bloco próprio, sem transformar experimentos anteriores em um bloco monolítico.

A linguagem visual reutilizável do Tom já foi descoberta e materializada a partir da 05.08 e reutilizada posteriormente em Capturar. Ela utiliza o par cromático Terracota/petróleo, possui tratamento para temas claro e escuro e mantém **Tom neutro** visualmente distinto de **ausência de Tom**. A implementação reutilizável já existe e não deve ser redescoberta nesta unidade.

CMP-009 já possui responsabilidade funcional definida: representar uma categoria do Panorama de forma resumida por meio de seu nome, sua frequência relativa e seu Tom agregado, sem apresentar os detalhes pertencentes ao aprofundamento da categoria.

# 1. Limite da unidade

Entram nesta 05.15:

- construção de CMP-009 — Categoria do Panorama como componente reutilizável;
- contrato de entrada e ação emitida pelo componente;
- CSS isolado próprio do componente;
- expressão da representatividade por uma barra horizontal dentro da própria caixa;
- reaproveitamento da linguagem visual de Tom já existente;
- tratamento de Tom agregado, Tom neutro e ausência de Tom;
- comportamento de nomes curtos e longos;
- truncamento responsivo por reticências quando necessário;
- comportamento em diferentes larguras disponíveis;
- estados de interação por ponteiro e teclado;
- bloco independente de laboratório;
- experimentação do componente isolado;
- pequena lista demonstrativa de várias Categorias do Panorama para validação visual conjunta;
- validação em temas claro e escuro;
- validação visual do operador antes do encerramento.

Não entram nesta unidade cálculo de dados do Panorama, lista funcional de categorias, ordenação, paginação/revelação ou integração real em `/rememorar`.

# 2. CMP-009 — Categoria do Panorama

## Responsabilidade

CMP-009 representa visualmente **uma categoria já preparada pelo contexto chamador**.

O componente não conhece o acervo, não percorre datas preservadas, não conta memórias, não calcula Tom agregado e não compara categorias entre si.

Sua responsabilidade é receber os dados finais necessários à apresentação e transformá-los em uma unidade visual simples, acionável e coerente com a linguagem do Rememore.

A unidade visual deve comunicar simultaneamente:

- **qual categoria é**, pelo nome;
- **quão representativa ela é em relação à categoria mais frequente do período**, pela largura da barra;
- **qual é seu Tom agregado**, pela expressão cromática.

Quantidade numérica, percentual, média numérica de Tom ou detalhes de distribuição não são apresentados.

# 3. Contrato de entrada

O contexto chamador deve fornecer ao componente, no mínimo:

- um identificador estável da categoria;
- o nome da categoria;
- a representatividade já calculada e normalizada entre `0` e `1`;
- o Tom agregado como valor válido da escala de Tom ou ausência de Tom;
- uma ação a ser emitida quando a categoria for selecionada.

Conceitualmente:

```text
Categoria do Panorama
- identificador
- nome
- representatividade: 0..1
- Tom agregado: valor de Tom | nulo
- ação de seleção
```

A nomenclatura técnica concreta das propriedades fica a critério do programador e deve seguir as convenções vigentes do projeto.

## Representatividade recebida

CMP-009 **não recebe a quantidade bruta como informação necessária para calcular sua largura** e não conhece a maior quantidade do conjunto.

A representatividade chega pronta.

`1` representa a maior largura disponível para a barra.

`0,5` representa aproximadamente metade da largura disponível.

`0` representa ausência de extensão da barra. Em produção, uma categoria apresentada normalmente possuirá alguma ocorrência e, portanto, representatividade positiva; ainda assim, o laboratório pode exercitar `0` como caso de limite técnico.

A fórmula que produz a representatividade pertence ao futuro contexto do Panorama e não deve ser duplicada dentro do componente.

## Tom agregado recebido

O Tom agregado chega pronto ao componente.

CMP-009 não calcula médias nem recebe a coleção de Tons individuais das memórias.

O valor `0` significa **Tom neutro**.

A ausência de Tom é um estado diferente e deve chegar de forma inequívoca, por exemplo como valor nulo ou equivalente.

Essa distinção deve permanecer visível na apresentação.

# 4. Ação de seleção

A caixa inteira da Categoria do Panorama deve ser acionável.

Ao ser selecionada, CMP-009 apenas comunica ao contexto chamador qual categoria foi acionada.

O componente não conhece a rota de destino, não abre por conta própria o aprofundamento da categoria e não executa navegação de negócio.

A consequência futura da seleção pertence ao Panorama que utilizará o componente.

O acionamento deve ser possível por:

- ponteiro/mouse;
- toque, quando aplicável;
- teclado.

A implementação deve possuir semântica acessível equivalente a um controle interativo e apresentar foco perceptível.

Não é necessário nesta unidade criar um estado persistente de “categoria selecionada”, pois a seleção real será tratada futuramente pelo contexto chamador.

# 5. Unidade visual

A Categoria do Panorama deve ser percebida como **uma única caixa ou linha compacta**, e não como uma composição de pequenos elementos independentes.

O nome da categoria é sua identificação textual principal.

Dentro da caixa existe uma barra horizontal de representatividade que cresce da esquerda para a direita e ocupa o fundo da unidade, produzindo uma leitura semelhante a um progresso.

A barra fica atrás do texto da categoria.

A apresentação inicial para experimentação deve ser simples. O objetivo é chegar rapidamente a uma forma funcional e ajustá-la junto ao operador no laboratório, sem criar antecipadamente ornamentação complexa.

# 6. Representatividade visual

A largura da barra é diretamente proporcional ao valor normalizado recebido pelo componente.

A representatividade é semântica e não muda quando a largura física do componente muda.

Por exemplo, representatividade `0,4` continua sendo `0,4` em qualquer viewport. O que muda é apenas a quantidade física de pixels ocupada pela barra.

Conceitualmente:

```text
container de 500 px + representatividade 0,4 -> barra próxima de 200 px
container de 250 px + representatividade 0,4 -> barra próxima de 100 px
```

A barra deve portanto responder naturalmente à largura disponível.

A versão inicial não deve introduzir largura mínima artificial para aumentar categorias pouco representativas. Uma representatividade pequena deve continuar sendo pequena.

Para evitar que barras muito curtas desapareçam perceptivamente exatamente atrás do início do nome, o texto da categoria deve possuir **margem ou espaçamento interno confortável em relação à borda esquerda da caixa**.

Essa separação permite que uma pequena extensão da barra continue visível antes do texto.

A adequação final desse espaçamento deve ser validada visualmente.

# 7. Expressão cromática do Tom

CMP-009 deve reutilizar a linguagem visual de Tom já existente no Rememore.

Não devem ser criadas novas paletas ou regras paralelas para Rememorar quando a infraestrutura existente puder ser reutilizada.

A hipótese visual inicial desta unidade é aplicar a expressão cromática do Tom agregado em:

- **borda da caixa**;
- **barra de representatividade**;
- **texto da categoria**.

Essa configuração é o ponto de partida da experimentação, não uma obrigação de preservar exatamente essas três superfícies até o encerramento.

Durante a validação visual, o operador pode solicitar ajustes diretos de CSS ou composição ao programador até encontrar a combinação satisfatória.

Não é necessário criar no laboratório controles para ligar ou desligar individualmente a cor da borda, barra ou texto.

A experiência deve começar com a configuração acima e ser refinada diretamente durante as iterações.

## Tom neutro e ausência de Tom

O mecanismo visual já existente distingue adequadamente Tom neutro de ausência de Tom e deve ser reaproveitado.

CMP-009 deve preservar essa distinção sem introduzir uma nova linguagem visual própria.

Tom `0` continua sendo um Tom definido.

Ausência de Tom continua sendo ausência, não neutralidade.

# 8. Nome da categoria e truncamento

O nome deve permanecer em uma única linha na apresentação compacta.

Quando a largura disponível não comportar o conteúdo integral, o nome deve ser truncado visualmente com reticências.

A decisão concreta sobre o ponto em que o truncamento ocorre pertence à implementação responsiva e deve considerar a largura real disponível, não um número fixo de caracteres.

O comportamento precisa responder a:

- redimensionamento da janela;
- containers estreitos;
- telas pequenas;
- divisão de tela;
- outras alterações da largura disponível.

O nome integral deve permanecer disponível de forma acessível mesmo quando a apresentação visual estiver truncada.

A implementação concreta desse acesso — por semântica nativa, atributo apropriado ou solução equivalente — fica a critério do programador.

# 9. Responsividade e redimensionamento

CMP-009 deve reagir à largura do container sem exigir que o chamador recalcule a representatividade.

Ao redimensionar:

- a caixa acompanha a largura disponível;
- a barra conserva a mesma proporção relativa;
- o texto pode passar de integral para truncado ou voltar a ser integral;
- os estados de Tom permanecem coerentes;
- o componente não deve exigir reconstrução funcional ou novo cálculo de dados pelo chamador apenas para responder ao resize.

A solução técnica pode ser realizada principalmente por CSS ou por outro mecanismo adequado. A Especificação define apenas o comportamento observável.

# 10. CSS isolado

CMP-009 deve possuir **CSS isolado próprio**, seguindo o padrão dos componentes reutilizáveis já materializados no projeto.

O estilo específico da Categoria do Panorama não deve ser espalhado por folhas genéricas da página Rememorar.

Regras compartilhadas já existentes, especialmente a linguagem de Tom, podem e devem ser reutilizadas sem duplicação.

O nome técnico concreto do arquivo CSS segue as convenções vigentes do repositório.

# 11. Laboratório do componente

CMP-009 deve receber um novo bloco independente no laboratório existente.

O laboratório deve servir para ajustar rapidamente aparência, comportamento responsivo e interação antes de qualquer futura integração ao Panorama real.

Os controles auxiliares podem ser simples e utilitários. Eles não constituem interface futura do produto.

## Componente isolado

A região de experimentação isolada deve permitir alterar, no mínimo:

- nome da categoria;
- representatividade;
- Tom agregado, incluindo ausência de Tom;
- largura disponível para observação do componente.

O tema claro/escuro deve ser exercitável utilizando a infraestrutura já existente do laboratório quando ela puder ser reutilizada.

Também deve ser possível observar o acionamento da categoria, por exemplo exibindo de forma simples qual identificador foi selecionado.

Não é necessário criar controles para escolher quais partes do componente recebem a coloração do Tom.

## Lista demonstrativa

Além do componente isolado, o laboratório deve apresentar uma pequena composição com várias instâncias de Categoria do Panorama empilhadas.

Essa composição existe **somente para validação visual do conjunto**.

Ela não constitui o futuro componente de lista do Panorama e não deve implementar:

- ordenação real;
- paginação;
- revelação progressiva;
- “mostrar mais”;
- cálculo de representatividade;
- cálculo de Tom;
- integração com a Janela Temporal de Rememorar;
- navegação real.

A lista pode utilizar dados determinísticos fixos.

Deve incluir exemplos suficientemente diferentes para revelar problemas de composição, incluindo:

- representatividade máxima;
- representatividades intermediárias;
- representatividade muito pequena;
- duas categorias com a mesma representatividade e Tons diferentes;
- duas categorias com o mesmo Tom e representatividades muito diferentes;
- Tom positivo;
- Tom negativo;
- diferentes intensidades de Tom;
- Tom neutro;
- ausência de Tom;
- nome curto;
- nome longo;
- combinação de nomes e representatividades que tensione a leitura da barra.

O objetivo é confirmar que quantidade relativa e Tom permanecem perceptíveis como dimensões independentes quando várias categorias são observadas juntas.

# 12. Estados de interação

O laboratório deve permitir observar pelo menos:

- estado normal;
- hover ou realce equivalente por ponteiro;
- foco por teclado;
- acionamento;
- comportamento em tema claro;
- comportamento em tema escuro.

Os estados devem preservar legibilidade do nome, percepção da barra e expressão do Tom.

A resposta visual concreta desses estados pode ser refinada iterativamente com o operador.

# 13. Validação visual progressiva

A unidade deve privilegiar validação visual antes de qualquer tentativa de ampliar seu escopo.

A sequência esperada é:

1. construir o contrato funcional mínimo do componente;
2. apresentar CMP-009 isolado no laboratório;
3. ajustar caixa, barra, espaçamento, Tom, texto, truncamento, hover e foco com o operador;
4. observar o componente em diferentes larguras;
5. observar a lista demonstrativa;
6. ajustar o comportamento conjunto;
7. somente então encerrar a unidade.

Não existe etapa de integração em `/rememorar` nesta Especificação.

A aprovação visual no laboratório constitui a validação de apresentação necessária para o escopo desta unidade.

# 14. Validação técnica

As garantias técnicas adequadas ao componente devem ser verificadas conforme a arquitetura adotada.

Quando fizer sentido, testes automatizados podem cobrir:

- aplicação da representatividade recebida sem recálculo próprio;
- preservação da distinção entre Tom `0` e ausência de Tom;
- emissão da ação de seleção com a identidade correta;
- ausência de navegação própria;
- operação por teclado;
- manutenção do conteúdo integral como nome acessível mesmo quando visualmente truncado.

A implementação deve passar pelas verificações técnicas usuais aplicáveis ao repositório, incluindo formatação, lint, checagem de tipos e demais verificações pertinentes.

A avaliação de proporções, legibilidade, composição cromática, espaçamento, qualidade do truncamento, aparência em diferentes larguras e sensação dos estados de interação permanece com o operador.

# 15. Fora do escopo

Não fazem parte da 05.15:

- integração de CMP-009 em `/rememorar`;
- construção do componente real que reúne as categorias do Panorama;
- obtenção da projeção local de Rememorar;
- IndexedDB definitivo de Rememorar;
- sincronização com o servidor;
- catálogo real de categorias de Rememorar;
- filtragem dos blocos pelas datas escolhidas na Janela Temporal de Rememorar;
- contagem das memórias de cada categoria;
- cálculo da representatividade;
- aplicação da fórmula de frequência relativa do Panorama;
- cálculo do Tom agregado;
- ordenação por quantidade;
- ordenação por Tom em qualquer direção;
- definição da quantidade inicial de categorias visíveis;
- paginação;
- revelação progressiva;
- mecanismo “mostrar mais” ou equivalente;
- estados de carregamento da lista real;
- integração entre Janela Temporal de Rememorar e categorias;
- navegação real para o aprofundamento da categoria;
- Projeção Temporal da Categoria;
- Onda de Utilização da Categoria;
- Variação do Tom da Categoria;
- lista de memórias;
- consulta individual de memória;
- Encontrar Memórias;
- Rever um Dia.

# 16. Critério de conclusão

A 05.15 está concluída quando:

- CMP-009 — Categoria do Panorama existe como componente reutilizável;
- seu contrato recebe identidade, nome, representatividade pronta, Tom agregado ou ausência e ação de seleção;
- o componente não calcula por conta própria quantidade, representatividade ou Tom agregado;
- a categoria é apresentada como uma única caixa/linha compacta;
- a barra de representatividade aparece ao fundo e cresce proporcionalmente à largura disponível;
- o texto possui espaçamento esquerdo suficiente para não ocultar perceptualmente barras muito pequenas;
- a expressão de Tom reutiliza a linguagem visual já existente;
- Tom neutro permanece distinto de ausência de Tom;
- a hipótese inicial de coloração de borda, barra e texto foi experimentada e refinada conforme validação do operador;
- nomes longos são truncados responsivamente por reticências quando necessário;
- o nome integral continua disponível de forma acessível;
- o componente responde adequadamente ao redimensionamento;
- a caixa inteira é acionável por meios pertinentes, inclusive teclado;
- o CSS específico permanece isolado;
- o bloco individual do laboratório está funcional;
- a lista demonstrativa permite validar várias categorias em conjunto sem se transformar na lista real do Panorama;
- temas claro e escuro foram observados;
- estados normal, hover, foco e acionamento foram validados;
- verificações técnicas pertinentes passaram;
- o operador aprovou visualmente o componente no laboratório;
- nenhuma lógica do futuro Panorama real foi antecipada.


# Continuidade

## Estado e decisões

- Componente isolado aprovado visualmente pelo operador após ciclos de ajuste de altura, cores, barra, hover e sombra do texto.
- CMP-009 reutiliza `aparenciaTom`; a barra usa `--tom-fundo`, e sem Tom permanece neutra. O nome usa a cor de Tom.
- A composição demonstrativa foi adicionada com dados fixos e não contém cálculo, ordenação nem navegação real.
- O arquivo desta Especificação já estava não rastreado (`??`) no início; foi preservado.
- Indicadores de contexto antes das leituras, após as leituras iniciais e ao fim desta etapa: não disponíveis na interface.

## Plano

1. **Contrato e apresentação isolada — concluída.**
2. **Ajustes visuais e responsividade — concluída e aprovada pelo operador.**
3. **Composição demonstrativa — implementada e aprovada visualmente pelo operador em 2026-10-01.**

## Verificações

`deno fmt --check`, `deno check islands/Laboratorio.tsx` e `deno lint` dos arquivos TSX pertinentes passaram. `git diff --check` não apontou erros; informou somente conversão de LF para CRLF nos arquivos existentes `assets/app.css` e `islands/Laboratorio.tsx`.

## Pendência

A aprovação visual da composição foi recebida em 2026-10-01. Encerramento solicitado pelo operador e registrado abaixo. Não há pendências desta unidade.
# Parecer final

A Especificação 05.15 produziu CMP-009 — Categoria do Panorama como componente reutilizável (`components/CategoriaPanorama.tsx`), com CSS próprio em `assets/categoria-panorama.css`. O contrato recebe identificador, nome, representatividade normalizada, Tom agregado ou ausência e callback de seleção. A caixa apresenta barra proporcional, expressão cromática reutilizada de `aparenciaTom`, nome responsivo com reticências e interação acessível por botão, incluindo foco de teclado. O nome mantém a cor do Tom; os ajustes visuais de barra, altura, sombra e hover foram validados pelo operador.

O laboratório ganhou um bloco CMP-009 em `/laboratorio`, com controles do componente isolado e composição demonstrativa fixa de nove categorias. A composição foi aprovada visualmente. A seleção apenas comunica o identificador; não foram implementados cálculo, ordenação, navegação real ou integração em `/rememorar`, conforme o limite desta unidade.

Formatação, checagem de tipos e lint passaram. Não foram executados testes automatizados. Parecer entregue ao operador; o registro canônico no Drive não foi atualizado nesta sessão.