# Memória técnica — método de implementação

Este arquivo guarda somente princípios técnicos reutilizáveis entre unidades. O `/lab` e o código vigente são a fonte para contratos, estados e configuração dos componentes. O Markdown operacional guarda decisões, progresso e validações da unidade; especificações concluídas guardam seus pareceres. Não manter aqui histórico de implementação nem inventário de componentes.

## Laboratório e reutilização

O `/lab` demonstra e valida os ELMs, CMPs e estilos reais usados pelas páginas. Antes de implementar, consulte o bloco no laboratório e inspecione no código seus contratos e consumidores atuais. Reutilize elementos e componentes existentes; não replique seu comportamento ou aparência em páginas.

Se a necessidade exigir criar ou mudar um padrão compartilhado, trate-o como unidade própria e obtenha decisão do operador. Demonstração e aceite no laboratório não substituem a verificação dos consumidores reais.

## HTML, Bulma e CSS

Trabalhe nesta ordem: HTML semântico; estrutura e classes documentadas do Bulma; personalização suportada do Bulma; CSS autoral localizado e justificado. Use JavaScript apenas quando necessário. Não altere os arquivos distribuídos do Bulma.

A propriedade dos estilos é definida pelo alcance:

- `wwwroot/css/app.css`: tokens e regras globais da aplicação.
- `wwwroot/css/elementos.css`: personalizações compartilhadas dos ELMs.
- `wwwroot/css/componentes.css`: estilos realmente compartilhados entre CMPs.
- `Componentes/Nome.razor.css`: apresentação particular de um CMP.
- `Pages/Nome.razor.css`: composição e estilos exclusivos da página.
- `wwwroot/css/paginas.css`: criar e conectar somente quando surgir um padrão de layout reutilizado entre páginas.

Reaproveite classes e estilos existentes antes de criar outros. Não reproduza estilos de ELMs ou CMPs em páginas. Mudanças em CSS compartilhado exigem verificar os consumidores afetados; mudanças de markup, parâmetros ou eventos exigem revisar os chamadores.

## Execução .NET no Windows

No ambiente Windows do ChatGPT Desktop, não execute comandos `dotnet` dentro do sandbox: suas restrições de acesso impedem a execução correta. Execute restauração, build, testes e aplicação fora do sandbox.

## Convenções de código

Use português brasileiro em nomes autorais, com identificadores ASCII e convenções usuais da linguagem. Preserve a grafia de APIs, bibliotecas, atributos, rotas e contratos externos. Separe regras de negócio da apresentação quando isso ajudar a manter comportamento reutilizável e testável; não crie camadas ou abstrações sem necessidade concreta.
