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

Capturar usa `components/EstruturaCaptura.tsx`: Seleção volta à Principal; Captura do dia volta à Seleção. Sair mantém confirmação e POST em
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
