# Memória técnica e capital de tokens

Conhecimento preservado a partir da Especificação 01, em 07/09/2026. Estes registros explicam decisões reutilizáveis; os valores atuais de configuração permanecem nos arquivos indicados.

## Ordem de carregamento dos estilos

Na Home sem islands, o HTML servido em desenvolvimento apresentou os imports CSS separados de `client.ts` em ordem invertida. O Bulma acabou sobrescrevendo a fonte global, embora a configuração da Faculty Glyphic e o arquivo da fonte estivessem corretos. O build e a verificação de tipos passavam, portanto esses checks não detectavam o problema da cascata no HTML servido.

A solução adotada é uma única entrada: `client.ts` importa `assets/app.css`, que reúne por CSS @import, nesta ordem: Bulma, fontes, paletas, tema e estilos. Preserve essa ordem. A correção foi verificada no HTML de desenvolvimento: um único bloco de estilos, com as definições do projeto após o Bulma.

Se uma definição visual deixar de funcionar, verificar a ordem efetiva dos estilos antes de acrescentar especificidade ou `!important`. O comportamento observado pertence à integração presente no projeto; não é uma afirmação geral sobre todas as versões do Fresh ou Vite.

## Paletas definitivas e prévia devem coincidir

`assets/palettes.json` guarda as 16 cores aprovadas de cada tema. `assets/palettes.css` é o resultado gerado e acompanha o repositório. Após uma nova aprovação:

1. Atualizar os valores em `assets/palettes.json`.
2. Executar `deno run --allow-read --allow-write scripts/generate-theme.ts`.
3. Executar `deno fmt assets/palettes.css`.

O gerador e a prévia do laboratório reutilizam `paletteDeclarations`, em `utils/laboratorioPalette.ts`. Essa escolha evita que uma paleta calibrada no laboratório receba derivações diferentes ao ser aplicada definitivamente. Não editar apenas o CSS gerado: a próxima geração apagaria a alteração.

## Cores independentes exigem atenção aos componentes do Bulma

A base utilizada é o Bulma 1.0.4. Alguns componentes recompõem cores a partir de um matiz compartilhado e valores de luminosidade. Alterar apenas o fundo ou as variáveis globais pode, portanto, mudar outras cores ou não respeitar um hexadecimal independente escolhido para texto ou borda.

A solução define diretamente os dez neutros, mantém as variáveis necessárias aos componentes e deriva as escalas das seis cores semânticas. A aplicação aos títulos, campos e bordas também é ajustada em `assets/theme.css` e na prévia de `utils/laboratorioPalette.ts`. Ao mudar essa aplicação, manter os dois caminhos coerentes.

As derivações calculam texto de contraste sobre cores semânticas e variações legíveis sobre o fundo. Isso não equivale a uma garantia de contraste para todas as combinações possíveis escolhidas pelo operador; a avaliação continua no laboratório.

## Laboratório e preferências da Home têm escopos diferentes

`/laboratorio` é uma ferramenta permanente de calibração, preservada por decisão do operador. Ele lê as cores-base do CSS vigente, permite rascunhos separados para Claro e Escuro, restauração por tema e exportação das 16 cores. A comparação de fontes é temporária; a família definitiva fica em `assets/theme.css`, com carregamento local em `assets/fonts.css`.

As chaves locais são `rememore:lab:theme` e `rememore:lab:palettes:v1`. Os rascunhos pertencem ao navegador e à origem usados; não são sincronizados pelo Git nem alteram o CSS. A exportação permite transmiti-los ao programador para aprovação definitiva. Restaurar usa o CSS atual, não uma paleta antiga fixa no painel.

O script `static/laboratorio-theme.js` é carregado somente no laboratório. A Home acompanha o tema do sistema e não deve receber a preferência manual nem os rascunhos do laboratório. Preservar essa separação ao trabalhar no carregamento global.
