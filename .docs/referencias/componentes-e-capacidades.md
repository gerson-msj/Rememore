# Componentes compartilhados e capacidades

Consulta sob demanda ao reutilizar ou alterar cabeçalhos, mensagens e navegação autenticada.

## Seleção de Captura

`components/DateSelector.tsx` (CMP-003): value, max e onChange; input date nativo com calendário acionável e fallback para foco.
O ícone personalizado fica integrado ao campo e substitui o indicador nativo quando showPicker está disponível; sem suporte ou após falha,
preserva o controle nativo. Data incompleta ou inválida usa a cor de placeholder, incluindo a validade nativa durante digitação parcial.
`app/utils/captureDate.ts`: today usa calendário local; isCaptureDate valida YYYY-MM-DD completo, calendário e limite atual;
formatCaptureDate apresenta DD/MM/AAAA. O campo nativo mantém a apresentação própria do navegador.

`app/services/guidance.ts` (CMP-005): guidance("captureSelection") retorna texto ou null e resolve internamente mockLevel.
Alterar mockLevel no fonte para validar beginner/intermediate/advanced; nenhuma configuração ou persistência de nível.

`SessionService.accountId(request)` retorna identidade opaca da conta autenticada ou null. O mock fornece ULID fixo; páginas não devem
fixar identidade por conta própria. A Seleção já recebe esse identificador pelo handler autenticado.

## PageHeader

`components/PageHeader.tsx`: título obrigatório; callbacks opcionais `onBack` e `onLogout`. Com `onBack`, mostra Voltar; sem ele, mostra book-open sem ação. Sair aparece somente com `onLogout`. Os callbacks pertencem ao chamador, incluindo navegação e confirmação de saída.

## MessagePopup

`components/MessagePopup.tsx`: propriedades obrigatórias `open`, `message`, `actions` e `onResult`; opcionais `title`, `icon`, `color`, `confirmLabel` e `cancelLabel`. Ações: `yesNo`, `yes`, `no`, `okCancel`, `ok`, `none`. Cores: primary, link, info, success, warning, danger. O chamador controla a abertura e decide a resposta a `confirm` ou `cancel`.

## Rótulos e decisões do popup

`MessagePopup` aceita `confirmLabel` e `cancelLabel` opcionais. `actions` continua definindo quais ações existem; os rótulos personalizados
não mudam os resultados `confirm` e `cancel`. Sem rótulos personalizados, os textos originais permanecem. Ao compor novas mensagens, usar
textos que expliquem a ação ao usuário quando definidos pela Especificação; não inferir o resultado a partir do texto personalizado. Esc e
backdrop continuam cancelando.

## Ambiente Principal e capacidades resolvidas

A Principal recebe de `app/services/principal/contracts.ts` somente capacidades booleanas já resolvidas para Encontrar Memórias, Rever um
Dia, Rememorar e Administração. Não enviar contagens do acervo para a página recalcular regras. A composição substituível permanece em
`app/services/principal.ts`; o estado de capturas ainda não preservadas pertence exclusivamente ao front e fica separado do contrato de
backend.

As rotas `/principal`, `/capturar`, `/capturar/{data}`, `/encontrar`, `/rever`, `/rememorar`, `/conta` e `/admin` compartilham a fronteira autenticada em
`routes/_middleware.ts`. `/admin` acrescenta a capacidade administrativa e, quando negada, retorna por 303 à Principal sem encerrar a
sessão. As cascas de destino compartilham `islands/ProtectedShell.tsx`, com Voltar para a Principal e Sair pelo POST já existente em
`/principal`.

Capturar usa `components/CaptureLayout.tsx`: Seleção volta à Principal; Captura do dia volta à Seleção. Sair mantém confirmação e POST
em `/principal`. A rota dinâmica rejeita calendário inválido no servidor; o limite de hoje é validado no navegador antes do IndexedDB,
evitando depender do fuso do servidor. Datas inválidas retornam a `/capturar?data-invalida`.

`MessagePopup` aceita título opcional e mensagens com parágrafos separados por linha vazia. O texto descritivo completo permanece associado
ao diálogo por `aria-describedby`; preserve essa associação ao evoluir a estrutura visual interna.
