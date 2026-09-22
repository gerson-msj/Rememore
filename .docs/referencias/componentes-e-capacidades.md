# Componentes compartilhados e capacidades

Consulta sob demanda ao reutilizar ou alterar cabeçalhos, mensagens e navegação autenticada.

## Seleção de Captura

`components/SeletorData.tsx` (CMP-003): value, max e onChange; input date nativo com calendário acionável e fallback para foco. O ícone
personalizado fica integrado ao campo e substitui o indicador nativo quando showPicker está disponível; sem suporte ou após falha, preserva
o controle nativo. Data incompleta ou inválida usa a cor de placeholder, incluindo a validade nativa durante digitação parcial.
`app/utilitarios/dataCaptura.ts`: hoje usa calendário local; ehDataCaptura valida YYYY-MM-DD completo, calendário e limite atual;
formatarDataCaptura apresenta DD/MM/AAAA. O campo nativo mantém a apresentação própria do navegador.

`app/servicos/orientacao.ts` (CMP-005): orientar("captureSelection") retorna texto ou null e resolve internamente nivelSimulado.
`orientar("inicioCaptura")` fornece os três textos de início da Captura do dia; o consumidor exibe apenas na lista vazia, limpa e sem
origem preservada. Confirmação torna a captura alterada, impedindo reapresentação após exclusões. Alterar
nivelSimulado no fonte para validar beginner/intermediate/advanced; nenhuma configuração ou persistência de nível.
`orientar("categorizacao")` fornece os três textos da tela Categorização, apenas no modo editável; a orientação sobre múltiplas categorias é separada.

`ServicoSessao.accountId(request)` retorna identidade opaca da conta autenticada ou null. O mock fornece ULID fixo; páginas não devem fixar
identidade por conta própria. A Seleção já recebe esse identificador pelo handler autenticado.

## CabecalhoPagina

`components/CabecalhoPagina.tsx`: título obrigatório; callbacks opcionais `aoVoltar` e `aoSair`. Com `aoVoltar`, mostra Voltar; sem ele,
mostra book-open sem ação. Sair aparece somente com `aoSair`. Os callbacks pertencem ao chamador, incluindo navegação e confirmação de
saída.

## MensagemPopup

`components/MensagemPopup.tsx`: propriedades obrigatórias `aberto`, `mensagem`, `acoes` e `aoResponder`; opcionais `titulo`, `icone`, `cor`,
`rotuloConfirmacao` e `rotuloCancelamento`. Ações: `yesNo`, `yes`, `no`, `okCancel`, `ok`, `none`. Cores: primary, link, info, success,
warning, danger. O chamador controla a abertura e decide a resposta a `confirm` ou `cancel`.

## Rótulos e decisões do popup

`MensagemPopup` aceita `rotuloConfirmacao` e `rotuloCancelamento` opcionais. `acoes` continua definindo quais ações existem; os rótulos
personalizados não mudam os resultados `confirm` e `cancel`. Sem rótulos personalizados, os textos originais permanecem. Ao compor novas
mensagens, usar textos que expliquem a ação ao usuário quando definidos pela Especificação; não inferir o resultado a partir do texto
personalizado. Esc e backdrop continuam cancelando.

## Ambiente Principal e capacidades resolvidas

A Principal recebe de `app/servicos/principal/contratos.ts` somente capacidades booleanas já resolvidas para Encontrar Memórias, Rever um
Dia, Rememorar e Administração. Não enviar contagens do acervo para a página recalcular regras. A composição substituível permanece em
`app/servicos/principal.ts`; o estado de capturas ainda não preservadas pertence exclusivamente ao front e fica separado do contrato de
backend.

As rotas `/principal`, `/capturar`, `/capturar/{data}`, `/encontrar`, `/rever`, `/rememorar`, `/conta` e `/admin` compartilham a fronteira
autenticada em `routes/_middleware.ts`. `/admin` acrescenta a capacidade administrativa e, quando negada, retorna por 303 à Principal sem
encerrar a sessão. As cascas de destino compartilham `islands/EstruturaProtegida.tsx`, com Voltar para a Principal e Sair pelo POST já
existente em `/principal`.

Capturar usa `components/EstruturaCaptura.tsx`: Seleção volta à Principal; Captura do dia volta à Seleção. O título opcional (`titulo`) tem
padrão Capturar e permite Categorização sem alterar os demais consumidores. Sair mantém confirmação e POST em
`/principal`. Callback opcional `aoDeixar` encerra a sessão aberta antes do Voltar ou logout confirmado; Seleção não precisa fornecê-lo. A
propriedade opcional `antesDeSair(continuar)` permite à Captura do dia confirmar abandono antes de executar logout; `aoVoltar` permite que
a tela de Memória use o Voltar do header para retornar à lista e que a lista volte à Seleção. Sem callbacks, a navegação usa `retorno`.
A rota dinâmica rejeita calendário inválido no servidor; o limite de hoje é validado no navegador antes do IndexedDB, evitando depender do
fuso do servidor. Datas inválidas retornam a `/capturar?data-invalida`.

O modo `dia` de EstruturaCaptura usa header sticky no fluxo do documento e mede sua altura por ResizeObserver, expondo
`--captura-altura-cabecalho` somente na raiz da Captura do dia. A Seleção conserva o layout anterior. `components/PainelCaptura.tsx` recebe
data, aba, callback de troca, `memoriaAberta`, ações e conteúdo; mantém data/ações e abas sticky abaixo do header. As abas são navegáveis
por setas/Home/End e ocultadas na tela de Memória. `formatarDataCapturaPorExtenso` apresenta a data civil por extenso sem deslocamento pelo
fuso.

`MensagemPopup` aceita título opcional e mensagens com parágrafos separados por linha vazia. O texto descritivo completo permanece associado
ao diálogo por `aria-describedby`; preserve essa associação ao evoluir a estrutura visual interna.

## Componente de memória e linguagem de Tom

`components/Memoria.tsx` é uma peça de apresentação, consumida pelo laboratório e pela lista real de Categorizar e Tom. Recebe `conteudo`, `categorias`,
`tom` (`number` entre -100 e +100 ou `null`), `contexto` (`registrar`, `categorizar`, `revisar`) e `aoAcionar`. No contexto `registrar`,
recebe também `primeira`, `ultima`, `aoElevar` e `aoRebaixar`. Não contém persistência nem navegação. Seu CSS é `assets/memoria.css`.
Categorias compactas usam primeiro nome e excedentes; revisão usa todos os nomes. Texto integral fica no DOM e a prévia é limitada por CSS.

`app/utilitarios/aparenciaTom.ts` fornece classes e variáveis para um valor de Tom e centraliza `configuracaoTom`: categoria, borda,
sombra, fundo, faixa e setas. `assets/tom.css` define extremos por tema e variáveis de saída por região. Outro consumidor pode usar essa
aparência sem depender de Memoria. Desligar uma região restaura o tema; a faixa começa desligada por decisão do operador na Spec 08.
Tom ausente não recebe tonalização; zero recebe as misturas neutras. O gradiente sempre usa o fundo efetivo.

## Categorização

`components/Categorizacao.tsx` apresenta memória e complementos em uma caixa rolável de cinco linhas, selecionadas em duas linhas fixas,
orientação e modo histórico. `components/SeletorCategoria.tsx` recebe consulta, resultados, selecionadas, opção de criação e callbacks;
não acessa persistência. Botões dos resultados usam `aria-pressed`; selecionadas permanecem visíveis nos resultados.

`components/EdicaoCategorizacao.tsx` integra essas peças ao estado transitório da captura, com debounce de 180 ms. `CapturaDia` fornece a
edição, o catálogo e a confirmação após commit. O título Categorização usa a mesma estrutura da captura; as abas ficam ocultas durante a
edição. O laboratório `/laboratorio-categorizacao` permanece uma demonstração sem persistência, com layout aprovado na Especificação 09.

`app/utilitarios/pesquisaTexto.ts` exporta `normalizarPesquisa` e `correspondeAproximadamente`. A política de fallback fica em
`pesquisarCategorias`: somente zero resultados simples habilita aproximações e criação. A comparação ignora acentos, caixa e espaços
externos; a apresentação preserva a grafia. Distância inicial de edição limitada a dois caracteres, proporcional ao comprimento; não
constitui decisão definitiva para outros consumidores.
