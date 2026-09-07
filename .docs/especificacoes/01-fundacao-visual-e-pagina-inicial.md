# 01 - Fundação Visual e Página Inicial

Fonte: [05.01 - Fundação Visual e Página Inicial](https://docs.google.com/document/d/19kZ-U_67KBnx7YlhyNHfWN1WRq-fqqdXcQuzlly1pug/edit).

Cópia obtida em 05/09/2026. Última alteração informada pelo Drive: 03/09/2026.

---

## Estado

Primeira unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar a fundação visual inicial do Rememore e sua primeira aplicação concreta na Página Inicial da Área Aberta.

## Origem funcional

04.03 - Especificação Funcional - Área Aberta / Página Inicial (/).

A REG-001 — Usuário autenticado não permanece na Área Aberta não integra esta unidade. Sua materialização será tratada quando a infraestrutura de autenticação for construída; nesse momento, a Página Inicial deverá ser revisitada para incorporar esse comportamento.

## Objetivo

Construir a fundação visual mínima reutilizável necessária ao início do Rememore, disponibilizar um laboratório interno para avaliação dessa fundação e, depois de validada durante o desenvolvimento, materializar a Página Inicial aberta utilizando-a.

A unidade deve chegar a um resultado em que tipografia, layout responsivo e temas possam ser avaliados e ajustados globalmente sem antecipar definições finas próprias das futuras rotas do sistema.

## Laboratório visual

Criar uma rota interna destinada exclusivamente a testes e definições visuais durante o desenvolvimento.

Ela deve reunir uma amostra suficientemente abrangente de títulos em diferentes níveis, textos e elementos HTML/Bulma básicos para permitir avaliar tipografia, larguras, margens, espaçamentos, responsividade, cores, fundos, bordas, sombras, estados visuais e demais efeitos globais relevantes.

O laboratório deve permitir também verificar elementos e estados representativos do Bulma cuja aparência possa ser afetada pela paleta, sem transformar essa rota em implementação antecipada dos componentes funcionais futuros do Rememore.

A barra de rolagem também deve poder ser avaliada nos temas claro e escuro, ainda que sua estilização não pertença ao Bulma.

A rota é ferramenta de desenvolvimento e poderá permanecer disponível para ajustes globais posteriores. Ela não representa uma página do produto nem define o acabamento particular das demais rotas.

## Tipografia

Preparar o projeto para utilizar fontes locais fornecidas pelo operador e permitir que a família tipográfica global possa ser alterada de forma centralizada durante os testes.

O programador deve orientar o operador quanto ao local e ao formato adequados para inclusão dos arquivos de fonte no projeto e decidir a forma técnica de carregamento, configuração e fallback.

Devem ser carregados somente os recursos necessários à solução aprovada, preservando uma base adequada para uso web.

## Layout responsivo

Estabelecer a base de layout responsivo necessária à Página Inicial e às construções seguintes, aproveitando os recursos já disponíveis no projeto quando adequados.

O laboratório deve permitir verificar o comportamento da base em diferentes larguras e apoiar pequenos ajustes globais de largura útil, margens e espaçamentos. A estrutura técnica, os breakpoints, as classes e eventuais complementos ficam a cargo do programador.

## Temas e colorização

Criar a capacidade inicial de tema com três estados: Sistema, Claro e Escuro.

A escolha deve poder ser persistida no dispositivo e reaplicada em novas aberturas. No estado Sistema, a aparência deve acompanhar a preferência clara ou escura do sistema operacional.

O laboratório visual deve disponibilizar o controle necessário para alternar entre Sistema, Claro e Escuro, permitindo que o operador avalie as duas paletas e seus efeitos de forma abrangente.

A estrutura de estilos deve permitir que as paletas clara e escura sejam configuradas centralmente pelo operador em conjunto com o programador, aproveitando adequadamente os mecanismos de tema e variáveis do Bulma. A definição de quais variáveis, arquivos, abstrações ou estratégias CSS serão utilizadas pertence ao programador.

Durante essa construção, o programador deve indicar ao operador quais entradas de cor precisam ser definidas para compor e ajustar os temas de forma coerente, evitando a dispersão desnecessária de valores de cor pela aplicação.

Quando necessário para compreender ou validar os recursos atuais do Bulma envolvidos nesta unidade, podem ser consultadas as documentações oficiais sobre CSS variables, themes, dark mode e color palettes.

## Página Inicial (/)

Depois de estabelecida e validada a fundação visual necessária, materializar a Página Inicial definida em 04.03.

A página apresenta:

Nem todos os dias são iguais. Às vezes, é a memória que os torna parecidos.

O Rememore ajuda você a preservar lembranças do cotidiano e voltar a elas ao longo do tempo, recuperando detalhes que poderiam se perder com a passagem dos dias.

Entre na sua conta ou, se recebeu um convite, comece por aqui.

Devem existir as ações Entrar, conduzindo ao Login, e Criar conta, conduzindo ao Cadastro.

Nesta unidade a Página Inicial não oferece controle de alteração de tema. Ao ser aberta, utiliza o estado Sistema: tema claro ou escuro conforme a preferência vigente do dispositivo.

Os avisos de versão experimental e privacidade não pertencem à Página Inicial.

## Limites

Esta Especificação não determina a ordem interna do desenvolvimento, a organização de arquivos, a arquitetura CSS, a divisão em componentes, islands ou módulos, nem a estratégia técnica de testes. Essas decisões permanecem sob responsabilidade do programador dentro do resultado esperado.

Não devem ser antecipados Login, Cadastro, autenticação, sessão, REG-001, Campo de Senha, Confirmação de nova chave, componentes de ajuda ou outros comportamentos funcionais futuros.

As definições produzidas aqui são globais e iniciais. Ajustes visuais específicos de cada rota serão realizados quando essas rotas forem materializadas.

---

## Continuidade

- Especificação 01 encerrada por solicitação do operador. A fundação visual, o laboratório e o conteúdo final da Home foram validados, incluindo os ajustes de fonte e parágrafos. O Parecer final foi acrescentado e verificado no documento original do Drive, mantendo o corpo aprovado intacto.
- Faculty Glyphic é a família global em `assets/theme.css`, com fallback de sistema. A fonte local já fornecida é carregada por `assets/fonts.css`. Outras famílias permanecem disponíveis para comparação no laboratório e só são baixadas quando usadas.
- As 16 cores exatas de cada tema aprovado estão em `assets/palettes.json`. `assets/palettes.css` contém o CSS definitivo gerado por `deno run --allow-read --allow-write scripts/generate-theme.ts`; após gerar, formatar com `deno fmt assets/palettes.css`. O gerador reutiliza as mesmas derivações do laboratório para preservar a aparência aprovada. Cores neutras independentes, escalas semânticas e variações de contraste são mantidas.
- `client.ts` importa somente `assets/app.css`, que reúne Bulma, fontes, paletas, tema e estilos nessa ordem via CSS @import. Imports JS separados estavam chegando em ordem invertida no HTML de desenvolvimento da Home sem islands, permitindo que o Bulma sobrescrevesse a fonte. A entrada única foi verificada no HTML servido; o arquivo Faculty Glyphic respondeu HTTP 200. `assets/theme.css` concentra tipografia e dimensões globais; `assets/styles.css` contém layout, Home e laboratório.
- O título da aba da Home foi ajustado para apenas “Rememore”, conforme solicitação do operador.
- `routes/index.tsx` substitui integralmente a Home padrão do Fresh pelos textos da especificação e ações Entrar e Criar conta. O operador confirmou `/login` e `/cadastro` e autorizou que os destinos ainda não funcionem: serão revistos nas próximas unidades. Não foram implementadas autenticação ou páginas de acesso.
- A Home usa o tema Sistema, sem seletor de tema nem os avisos excluídos pela especificação. O script de preferência permanece restrito a `/laboratorio`, sem aplicar rascunhos ou tema manual na Home.
- O laboratório em `routes/laboratorio.tsx` permanece disponível permanentemente para calibrações futuras, com amostras de tipografia, cores, estados, campos, superfícies, responsividade e rolagem.
- `islands/LaboratorioControls.tsx` mantém comparação temporária de fontes e seleção Sistema/Claro/Escuro. A chave do tema no navegador é `rememore:lab:theme`; `static/laboratorio-theme.js` reaplica essa preferência antes da pintura.
- `components/LaboratorioPalette.tsx` permite editar as 16 cores por tema, com seletor visual, hexadecimal, restauração por tema e exportação identificada. No modo Sistema, a paleta é exibida sem permitir edição. Os valores de base são lidos do CSS vigente.
- Os rascunhos persistem no navegador/origem em `rememore:lab:palettes:v1` e são reaplicados após a hidratação; não alteram o CSS do projeto. Rascunhos existentes foram preservados. Restaurar cores do CSS retorna agora à paleta aprovada. Há cópia manual quando o clipboard falha e aviso quando o armazenamento não está disponível.
- `utils/laboratorioPalette.ts` valida rascunhos, converte cores e gera as derivações utilizadas tanto pela prévia quanto pelo CSS definitivo. Os sete testes de paleta passaram após a aplicação das definições aprovadas.
- Os aprendizados reutilizáveis foram preservados em `.docs/memoria-tecnica.md`, cuja leitura inicial está indicada no `AGENTS.md`. A cópia operacional desta Especificação fica em `.docs/especificacoes/01-fundacao-visual-e-pagina-inicial.md`, com identificação local 01 e identificação original 05.01 preservada na referência da fonte do Drive.
- Não há trabalho aberto nesta unidade. A próxima Especificação será indicada pelo operador. O Parecer final permanece exclusivamente no Drive.
