# Referências visuais HTML simples do /Lab — preparação para P06

**Estado:** proposta operacional para execução e aceite visual; **não aprovada nem concluída**.  
**Data:** 26/10/2026. **Branch-alvo:** `develop`. **Origem:** lacunas do inventário visual de P06 — Seleção de Captura.  
**Natureza:** especificação **independente da página consumidora**, para qualificar padrões básicos reutilizáveis no `/Lab`; não é uma nova especificação funcional de `/capturar`, não altera o corpo aprovado da 06.02 e não é o plano técnico de P06.

## 1. Autoridade, objetivo e bloqueio

Ler `/AGENTS.md`, `.docs/README.md`, `.docs/plano-refatoracao-paginas.md`, `.docs/especificacoes/concluidas/06.02.md` e o código relacionado em `src/Rememore.Client/Pages/Lab.razor`. Prevalecem os componentes **vigentes e já aprovados** do `/Lab`, não variantes `_old` ainda consumidas pelas páginas. Os documentos de contexto 00 e 01 do projeto no Drive explicam a precedência metodológica; não resgatar Stack1 nesta campanha.

**Entregável:** quatro referências demonstradas e efetivamente avaliadas em “Componentes HTML Simples” do `/Lab`, com seus estados, comportamento de teste, acessibilidade e parecer do operador. As amostras adicionadas no commit `170f499` são **candidatas**, não decisões visuais: orientação `notification is-info is-light`, itens de lista em `box p-3` + `level is-mobile`, falha em `notification is-danger is-light` + `role="alert"`, botão `disabled`.

**Gate obrigatório:** P06 continua **suspensa**. Não concluir o inventário visual, fechar o plano técnico de P06 ou editar `/capturar` enquanto qualquer referência aqui requerida não estiver demonstrada e **expressamente aceita pelo operador**. A aceitação das referências não aprova automaticamente a posterior integração à página.

## 2. Classificação e fundamentação Bulma oficial

A classificação abaixo é a **recomendação técnica inicial**, não o aceite da aparência final:

| Padrão | Classificação proposta | Base Bulma consultada | Motivo para não criar CMP agora |
|---|---|---|---|
| Orientação antes da data | **HTML básico** | [Notification](https://bulma.io/documentation/elements/notification/): `notification`, `is-info`, `is-light`; [Content](https://bulma.io/documentation/elements/content/): parágrafos | Bloco informativo sem comportamento próprio de interface; a resolução da orientação é responsabilidade pré-existente de `IOrientacaoProgressiva`/CMP-005, **não** do invólucro visual. |
| Lista de capturas pendentes | **Composição HTML/Bulma básica** | [Level](https://bulma.io/documentation/layout/level/): `level`, `level-left`, `level-right`, `level-item`, `is-mobile`; [Button](https://bulma.io/documentation/elements/button/): `button`, `is-ghost`, ícone; [Box](https://bulma.io/documentation/elements/box/): `box`; [Content](https://bulma.io/documentation/elements/content/): listas | `ul`/`li`, âncora de data e botão de exclusão são suficientes. Ordenação, consulta, abertura e confirmação pertencem ao consumidor e aos contratos já aprovados; não são lógica de um novo componente visual. `box` traz sombra e preenchimento por definição: **comparar sua adequação**, não aceitá-la por estar no exemplo. |
| Falha de consulta + nova tentativa | **HTML básico** | [Notification](https://bulma.io/documentation/elements/notification/): `notification is-danger is-light`; [Button](https://bulma.io/documentation/elements/button/): `button is-danger is-light` | A mensagem e a ação podem coexistir **inline**; nenhum modal nem contrato reutilizável próprio é exigido pela experiência 06.02. |
| Ação Capturar desabilitada | **HTML básico** | [Button](https://bulma.io/documentation/elements/button/): `button is-link` e atributo HTML `disabled` (a classe `is-disabled` é obsoleta) | O estado deriva da validade da data no chamador. Não criar componente para um estado nativo de botão. |

Outras referências oficiais de apoio: [Bulma — Spacing helpers](https://bulma.io/documentation/helpers/spacing-helpers/) para `p-3`, `mb-*` e ajustes; [Bulma — Icon](https://bulma.io/documentation/elements/icon/). Documentação do Bulma regula **aparência/estrutura CSS**, não cria por si só semântica ARIA, regra de negócio nem comportamento de retry. A nomenclatura `component` dentro da documentação do framework não implica um **CMP Rememore**.

**Critério de escalonamento:** somente se a prova em laboratório revelar uma estrutura Bulma insuficiente **ou** um comportamento/contrato reutilizável real não atendido pela composição, parar e apresentar (a) limitação reproduzível, (b) alternativas, (c) custo/risco e (d) recomendação ao operador. Somente após decisão expressa, criar **especificação própria do CMP**, independente da página, construir e validar o CMP no `/Lab` em seus três checkpoints antes de autorizar uso em P06. Não criar CMP preventivo, CSS global de conveniência ou lógica duplicada.

## 3. Requisitos transversais das demonstrações

1. **Somente laboratório:** dados determinísticos fictícios; nenhuma navegação para capturas reais, IndexedDB, API, alteração de pendências, descarte efetivo ou mudança em serviços/contratos. Um feedback local simples pode provar ações de demonstração. Não acoplar os quatro padrões num componente novo apenas para demonstrá-los.
2. **Semântica e acessibilidade:** controles nativos reais, nomes acessíveis inequívocos, título/descrição quando necessários, hierarquia de headings coerente com o bloco, associação explícita de erro ou ajuda quando pertinente; não usar `div` clicável, links sem destino demonstrável ou botão sem `type="button"`. Ícone decorativo com `aria-hidden="true"`; nome da ação de excluir inclui a data. As duas ações de cada item são independentes.
3. **Teclado e foco:** tabulação previsível, `Shift+Tab`, `Enter` em link e botão, `Espaço` em botão, foco visível sem depender de hover, nenhuma ação de exclusão dispara a abertura e vice-versa. Estado `disabled` não responde a clique nem teclado e, naturalmente, não entra na ordem de tabulação; a causa deve ser compreensível pelo contexto do campo.
4. **Temas:** Claro, Escuro e Sistema; fundos, texto, links, bordas, foco e variantes `is-light` legíveis com paletas atuais. Verificar o tema Sistema em resolução clara e escura quando houver suporte no ambiente, sem afirmar teste não executado.
5. **Viewport e zoom:** testar ~360 px, ~768 px, desktop ~1280 px e zoom 200%; sem rolagem horizontal causada pelos exemplos, truncamento da data, sobreposição de ações ou botões fora da área visível. O `level is-mobile` deve ser reavaliado caso comprima as ações.
6. **Isolamento visual:** preferir primeiro classes oficiais Bulma. CSS, se comprovadamente necessário para preservar quebras de linha, normalizar lista ou ajustar largura/foco, deve ficar estritamente no contexto do Lab e ser mínimo, justificado, compatível com tokens e sem afetar CMPs existentes. Não usar CSS compensatório para esconder uma incompatibilidade de contrato.
7. **Sem aceite presumido:** a presença do markup no repositório, build verde ou captura de tela não constitui validação visual. Documentar alternativas apresentadas, observações, mudanças e declaração de aceite do operador por referência.

## 4. Referência A — Orientação informativa

**Estrutura candidata:** `<div class="notification is-info is-light">…</div>`, acima da área do seletor, sem controle de fechar nem `role="alert"` por padrão. Conteúdo real chega do CMP-005/`IOrientacaoProgressiva`; **a demonstração apenas simula** o texto já resolvido.

**Estados a demonstrar:** texto curto; texto com 2–3 linhas e quebras explícitas preservadas visualmente; ausência de orientação (região integralmente omitida, não apenas `visibility:hidden` nem `notification` vazia). Mostrar as variantes no laboratório sem alterar a regra de progressividade nem criar frases novas de produto; texto ilustrativo identificado como tal.

**Verificações objetivas:** bloco acima da seleção; quebras de linha reais preservadas por recurso mínimo apropriado (`white-space: pre-wrap` restrito ao conteúdo, se necessário); nenhuma rolagem horizontal, quebra indevida ou falso papel de alerta; contraste e espaçamento adequados em todos os temas e tamanhos; ausência não deixa resíduo de padding/borda/altura. Se `notification` comunicar urgência visual excessiva, apresentar alternativa Bulma documentada e pedir escolha visual, **sem substituir por CMP automaticamente**.

## 5. Referência B — Capturas pendentes: lista com duas ações independentes

**Estrutura candidata:** seção com heading “Capturas pendentes”, `<ul>` e itens `<li>`; dentro, âncora identificada pela data `DD/MM/AAAA`, ao lado botão de excluir com `aria-label="Apagar captura de DD/MM/AAAA"`, ícone decorativo, `level is-mobile` para alinhamento. Classes `box p-3` e `button is-ghost` são hipóteses de aparência, não padrão aprovado.

**Revisão visual obrigatória:** a amostra atual **exibe marcadores de lista** e a **sombra padrão de `box`**. Comparar pelo menos (a) composição corrente e (b) variante visual discreta, sem marcadores expostos e sem sombra de `box` — podendo usar outra estrutura Bulma básica ou ajuste de CSS local mínimo se necessário. Preservar a semântica `ul/li`; se optar por suprimir o marcador com CSS, verificar sua exposição à tecnologia assistiva (inclusive `role="list"` quando necessário). O operador decide a aparência final; não impor `box` nem customizar globalmente a classe.

**Estados a demonstrar:** nenhuma pendência (seção omitida); uma data; duas ou mais datas em ordem cronológica ascendente; múltiplos itens com nomes acessíveis distintos; simulação de acionamento de abrir e apagar com retornos locais independentes e observáveis. As datas exemplificativas do commit `170f499` são fictícias. A simulação de exclusão **não** realiza exclusão nem introduz outro popup; confirmação real já pertence ao CMP-028 na integração futura.

**Verificações objetivas:** sem marcadores acidentais na variante escolhida; sem sombra se a alternativa sem `box` for aceita; alinhamento data/ação consistente; foco visível em ambos; a ação do botão não ativa o link; o link tem destino existente/feedback funcional no próprio Lab (não `href="#…"` sem alvo correspondente); nomes acessíveis completos, leitura da lista preservada; sem truncamento ou sobreposição a 360 px/zoom 200%. Não atribuir clique ao item inteiro.

## 6. Referência C — Falha na consulta, com retry inline

**Estrutura candidata:** `<div class="notification is-danger is-light" role="alert"> <p>Não foi possível verificar as capturas pendentes neste dispositivo.</p> <button type="button" class="button is-danger is-light">Tentar novamente</button> </div>`.

**Estados a demonstrar:** falha exibida; acionamento de “Tentar novamente” por teclado e ponteiro; resultado simulado de sucesso (a falha sai da tela); resultado simulado de persistência da falha (mensagem permanece ou retorna de modo inteligível); opcionalmente breve estado de processamento **somente visual**, sem declarar que serviço real foi consultado. A escolha de comportamento real da consulta pertence à 06.02, não à demonstração.

**Verificações objetivas:** mensagem exata acima e botão **no mesmo fluxo da página**, nunca no CMP-028; ordem de leitura correta, sem sobreposição em viewport estreito; botão com nome acessível e foco evidente; uso de `role="alert"` apenas para falha que **surge após evento**, observando se a região é anunciada uma vez, sem reanúncio indevido a cada rerender ou duplicação com `aria-live` aninhado; restauração/continuidade de foco coerente ao refazer a tentativa, sem prender o usuário. O botão simulado deve produzir resultado verificável; clique inerte não atende à prova funcional. Verificar temas e contraste do texto vermelho, do botão e dos estados de foco.

**Separação obrigatória:** não confundir falha de consulta de pendências com falha de **remoção** (“Não foi possível apagar as alterações. Tente novamente.”), nem mudar a apresentação desta última sem unidade/decisão própria. Erro da consulta **não** é lista vazia e não pode ser anunciado como ausência de pendências.

## 7. Referência D — Botão Capturar e validade da data

**Estrutura:** `<button type="button" class="button is-link" disabled>Capturar</button>`; a classe `is-disabled` **não** deve ser usada. Na demonstração adicional, o estado precisa ser comutável para conferir a relação `disabled = !dataValida` no **consumidor**, sem alterar o CMP-003.

**Estados a demonstrar:** sem data; incompleta/inválida; futura; hoje e passada válidas; passagem de inválida a válida e vice-versa, com o botão respectivamente não acionável/acionável. Pode-se usar uma simulação local controlada de validade ou consumir a saída **existente** do CMP-003 `ValorInicial`/`AoMudarValor` em cenário isolado, sem forçar mudança de contrato nem introduzir regra concorrente. Se CMP-003 for utilizado, `null` representa ausência de seleção válida, e a amostra deve usar a resposta atual do componente. A ação habilitada gera somente feedback no Lab, nunca navegação real para `/capturar/{data}`.

**Verificações objetivas:** `disabled` presente somente quando seleção não é válida; ausência de clique/teclado em estado desabilitado, sem `tab stop`; ao habilitar, ação por teclado e ponteiro funciona, foco visível e cor/contraste adequados; indicação compreensível de por que a ação está desabilitada dentro do exemplo; teste de reversão do estado. **Não** converter `disabled` para `aria-disabled` em controle aparentemente ativo nem adicionar parâmetro ao CMP-003 para obter esta prova.

## 8. Divergência independente para decisão do operador em P06 — CMP-003

Esta questão **não é resolvida** pela aprovação dos quatro padrões HTML. Código identificado em `Pages/SelecaoCapturar.razor`: `<SeletorData_old Valor="@valorData" Maximo="@hojeTexto" Invalido="@(!DataValida)" AoMudar="AtualizarData" />`. O componente vigente `Componentes/SeletorData.razor`, aprovado no `/Lab`, expõe **`ValorInicial` (`string?`) e `AoMudarValor` (`EventCallback<string?>`)**, valida internamente a data e emite `null` para ausência/invalidez. O antigo expõe valor textual bruto, limite e sinal externo de inválido, além de apresentar ajuda/placeholder próprios. Há diferença de **contrato, titularidade da validação, sinal de evento e aparência**, não mera renomeação de parâmetros.

**Decisão pendente do operador durante planejamento de P06:** (1) integrar o CMP-003 vigente mediante adaptação demonstravelmente equivalente à regra/data/UX da 06.02; (2) autorizar ajuste específico do CMP-003, com nova prova e aceite **primeiro no /Lab**; ou (3) redefinir formalmente algum comportamento da página, se inevitável, com autorização funcional separada. Recomendação inicial: tratar o CMP-003 atual como referência, analisar correspondência de saída válida e inicialização, e **escalar qualquer diferença observável antes de alterar**. Não modificar CMP-003 para reproduzir `SeletorData_old`, nem trocar seletor na página, sem decisão expressa. O plano definitivo de P06 registra a opção autorizada e sua verificação.

## 9. Arquivos e fronteira de edição

- **Esta especificação:** `.docs/especificacoes/referencias-visuais-html-simples-lab.md` (arquivo independente da especificação concluída da página).
- **Alvo previsto para implementação, após autorização:** `src/Rememore.Client/Pages/Lab.razor`, somente as demonstrações do bloco “Componentes HTML Simples”, preservando os demais exemplos aceitos e blocos CMP.
- **Somente se comprovado necessário:** `src/Rememore.Client/Pages/Lab.razor.css`, com seletores estritos dos exemplos, sem modificar estilos dos componentes existentes. Um arquivo auxiliar específico de demonstração pode ser proposto **somente** se a complexidade concreta exigir, registrando justificativa; não transformar as amostras em CMP.
- **Registro após aceite:** observações, testes e decisão do operador **neste arquivo**; o macroplano mantém P06 suspensa até o gate e depois recebe o apontamento de referências aprovadas no registro de P06.
- **Não alterar nesta unidade:** `.docs/especificacoes/concluidas/06.02.md`, `Pages/SelecaoCapturar.razor` e CSS/JS da página, `Pages/CapturaDia.razor`, `Componentes/SeletorData.razor` e `SeletorData_old.razor`, dados persistentes, autenticação, serviços, contratos, lógica da orientação, confirmação CMP-028, cascas, outras páginas, componentes já aprovados, `Stack1/`, API ou infraestrutura.

## 10. Checkpoints, testes e decisão final

**Checkpoint 1 — conferência estrutural.** Inspecionar o Lab vigente e suas classes, revisar os quatro exemplos à luz das fontes Bulma citadas; apresentar as opções de lista (marcadores/sombra) **sem aceitá-las automaticamente**. Registrar diferenças e arquivos efetivamente tocados. Se surgir necessidade concreta de CMP, parar e escalonar antes de prosseguir.

**Checkpoint 2 — estados e comportamento.** Implementar **somente** as simulações locais e estados de A–D que faltam; tornar aferíveis abertura/exclusão simuladas, retry e habilitação. Verificar markup/semântica, foco e teclado, temas, viewport e zoom; não declarar sucesso sem testes de navegador. Registrar resultados, limites não verificados e correções. `dotnet build` e `git diff --check` são verificações pertinentes quando executáveis, mas não substituem inspeção visual.

**Checkpoint 3 — revisão visual com operador.** Apresentar cada referência no `/Lab` em estados relevantes; colher escolhas explícitas (principalmente marcadores, sombra, cores, espaçamentos e comportamento de alerta); corrigir e repetir provas pertinentes. Registrar aqui o **aceite nominal das quatro referências**, com data, alternativas rejeitadas/aprovadas e eventuais pendências. Não confundir “visualização realizada” com “aceito”.

**Condição de conclusão deste documento:** as **quatro novas referências revisadas e aceitas expressamente pelo operador**, com provas técnicas e visuais honestamente registradas. Se houver CMP aprovado como substituição em qualquer item, concluir primeiro sua especificação independente e aceite no `/Lab`. **Somente depois** dar baixa no bloqueio de inventário visual, retornar ao planejamento final de P06 e tratar separadamente a divergência CMP-003. O aceite do plano técnico P06 e a integração permanecem gates posteriores próprios.

## 11. Registro operacional inicial — 26/10/2026

- **Fonte encontrada:** em `Lab.razor`, os quatro exemplos já existem como markup candidato desde `170f499`. São estáticos: orientação de uma linha, duas datas em links `#lab-captura-pendente-…` sem comprovação de destino, botão de retry sem ação, botão Capturar permanentemente `disabled`; não provam os cenários necessários.
- **Problema visual explícito:** marcadores HTML e sombra default de `box` aparecem na lista. Avaliar variantes no laboratório; não consolidar visual sem escolha do operador.
- **Classificação provisória:** quatro padrões como básicos Bulma/HTML; **nenhum CMP novo solicitado** nesta etapa.
- **Prova pendente:** não foram executados build, testes de teclado, leitores de tela ou avaliação visual de navegador neste registro documental. O operador ainda **não aceitou** as amostras.
- **Próximo passo:** autorizar e executar checkpoints 1–2 **apenas no /Lab**; expor as opções e cenários para revisão/aceite no checkpoint 3. P06 continua suspensa.
