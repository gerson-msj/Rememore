# Mapa do Laboratório — Elementos e Componentes

Conferido documentalmente em 15/11/2026. Este documento registra o que está implementado na página do Laboratório no projeto. A rota `/lab` apresenta seis elementos; a aba Componentes está vazia.

## Elementos (ELMs)

- **ELM-01 — Título:** exemplo de título HTML (`h1`). Código: `src/web/pages/laboratorio/elementos/elm01.tsx`.
- **ELM-02 — Parágrafo:** exemplo de texto corrido em parágrafo. Código: `src/web/pages/laboratorio/elementos/elm02.tsx`.
- **ELM-03 — Link:** exemplos de link padrão e link de perigo. Código: `src/web/pages/laboratorio/elementos/elm03.tsx`.
- **ELM-04 — Lista:** lista não ordenada com três itens de exemplo. Código: `src/web/pages/laboratorio/elementos/elm04.tsx`.
- **ELM-05 — Campo de texto:** demonstrações de campo de texto, campo multilinha, estado de erro, campo somente leitura e caixa de seleção; inclui controle para selecionar cores padrão, de link e de perigo nos campos compatíveis. Código: `src/web/pages/laboratorio/elementos/elm05.tsx`; estilos: `src/web/pages/laboratorio/elementos/elm05.css`.
- **ELM-06 — Botões:** demonstrações de botão simples, botão com ícone e grupo de botões; controles permitem alternar estado ativo, cor, posição do ícone e quantidade de botões no grupo. Código: `src/web/pages/laboratorio/elementos/elm06.tsx`; estilos: `src/web/pages/laboratorio/elementos/elm06.css`.

## Componentes (CMPs)

Nenhum componente está implementado na aba Componentes do Laboratório. O painel existe, mas está vazio.

## Página do Laboratório

A página importa e renderiza ELM-01 a ELM-06 no painel Elementos. A rota `/lab` é definida em `src/web/router/AppRouter.tsx`; a página e os painéis estão em `src/web/pages/laboratorio/laboratorio.tsx`.
