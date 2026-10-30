# Memória técnica — método de implementação

Este arquivo guarda somente princípios técnicos reutilizáveis entre unidades. O `/lab` e o código vigente são a fonte para contratos, estados e configuração dos componentes. O Markdown operacional guarda decisões, progresso e validações da unidade; especificações concluídas guardam seus pareceres. Não manter aqui histórico de implementação nem inventário de componentes.

## Laboratório e reutilização

Os ELMs e CMPs demonstrados no `/lab` são os blocos reutilizáveis da aplicação: definem seus próprios parâmetros, estilos e funcionalidades. Cada demonstração deve instanciar o bloco real e configurá-lo pelos parâmetros públicos, como faria uma página. Não deve reproduzir, compensar ou sobrescrever localmente estilos ou comportamentos próprios do bloco, pois isso mascara sua apresentação e cria divergência com os consumidores. Não é necessário testar no laboratório cada combinação de parâmetros ou ajuste local de uma página; valide a integração no contexto da própria página.

A pedido ou com aprovação do operador, uma página pode receber ajustes locais de composição, estilo ou comportamento em seus próprios arquivos, sem modificar o bloco compartilhado; esses ajustes devem ser validados naquela página, não incorporados como exceções ao demonstrador. Quando a mudança deve valer para o elemento ou componente em todas as páginas, altere o código-fonte e os estilos no escopo compartilhado apropriado; o `/lab` e todos os consumidores devem refletir essa mudança. Verifique os consumidores afetados.

O Codex pode sugerir ajustes locais ou compartilhados, mas deve obter solicitação ou aprovação do operador antes de implementá-los.

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
