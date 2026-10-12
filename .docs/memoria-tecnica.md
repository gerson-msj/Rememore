# Memória técnica reutilizável — Stack .NET

**Situação:** fundação experimental aprovada quanto à viabilidade pública. Esta memória descreve apenas o que está efetivamente disponível, não o estado funcional das futuras especificações.

## Estruturas verificadas

- Solução: `Rememore.slnx` com `src/Rememore.Client` (Blazor WebAssembly standalone, .NET 10) e `src/Rememore.Api` (ASP.NET Core Minimal API, .NET 10).
- Cliente: `Program.cs` registra `HttpClient` com `ApiBaseUrl`; `Pages/Home.razor` consome categorias de exemplo. Não há ainda componentes autorais funcionais do Rememore portados.
- API de prova: `GET /api/categorias`; `Turso.Data.Sqlite.Provider` 0.8.2 com ADO.NET. Criação/seed de Categorias na inicialização é **experimental** e não deve ser adotada como política de produção.
- Publicação: `.github/workflows/publish-pages.yml` no GitHub Pages, `Dockerfile` da API na Render, Turso remoto. Workflow atual aponta para `Stack2`; `develop` será trabalho e `main` publicação após transição deliberada.
- `Stack1/` contém implementação anterior protegida para consulta seletiva; não reutilizar automaticamente sua arquitetura, CSS ou dados.

## Contratos e componentes compartilhados da nova stack

**Ainda não consolidados.** Adicionar a este índice **somente após implementação validada**: nome, responsabilidade, contratos públicos, localização e modos previstos de extensão. Antes de criar componente parecido, verificar este índice e a implementação existente. O antigo `Memoria` é exemplo histórico de comportamento pensado para extensão, não um componente já existente no Blazor.

## Recursos visuais locais

- `src/Rememore.Client/wwwroot/css/bulma.min.css`: Bulma 1.0.4, copiado de `Stack1/assets/bulma.min.css` e carregado globalmente pelo `index.html`.
- `src/Rememore.Client/wwwroot/css/all.min.css` e `wwwroot/webfonts/fa-*.woff2`: Font Awesome Free 7.3.1 (solid, regular, brands e compatibilidade v4), copiado de `Stack1/_fresh/client`; o CSS usa caminhos relativos aos arquivos de fonte.
- `src/Rememore.Client/wwwroot/css/fontes.css` registra as famílias Chewy, Damion, Dekko, Dongle, Faculty Glyphic, Happy Monkey, Iansui e Kalam. Os arquivos e licenças correspondentes ficam em `wwwroot/webfonts/`; as fontes só são baixadas pelo navegador quando usadas.
- A ordem global em `wwwroot/index.html` carrega Bulma, Font Awesome, as fontes autorais e depois `app.css`, permitindo personalização do Bulma pelo CSS da aplicação sem editar o arquivo distribuído.
- Validação em 12/10/2026: o operador compilou `Rememore.Client.csproj` com `--no-restore` no PowerShell do Windows com sucesso; o manifesto de static web assets do build inclui as folhas CSS e fontes locais. A tentativa pelo ambiente restrito do Codex falhou ao iniciar o task host do MSBuild (MSB4216), mas isso não se reproduziu no Windows do operador.
- Execução no Codex: confirmado em 12/10/2026 que `dotnet build src/Rememore.Client/Rememore.Client.csproj --no-restore --verbosity:minimal` falha no sandbox Windows ao criar/conectar o task host NET/x64 de `ComputeWasmBuildAssets` (MSB4216); o build da API passa no mesmo sandbox e o build do cliente passa com execução fora dele. Para evitar repetir essa falha conhecida, executar diretamente fora do sandbox, solicitando aprovação (`sandbox_permissions: require_escalated`), qualquer comando que compile o cliente Blazor WASM, inclusive build da solução, `dotnet run` ou `dotnet publish` do cliente. Manter as permissões gerais do sandbox em “Aprovar por mim”; os demais comandos continuam no sandbox quando apropriado. Rever esta orientação se uma atualização do Codex, Windows ou SDK/MSBuild alterar o resultado.

## Questões técnicas ainda não validadas

- IndexedDB real via JS Interop e tratamento de falhas no Blazor.
- Equivalência funcional dos fluxos das 24 especificações.
- Autenticação, preservação transacional real, versionamento/schema de produção e migrações Turso.
- Pacote EF Core oficial para Turso e compatibilidade remota com EF Core 10.
- Recuperação UX após suspensão da Render, rotas internas SPA do GitHub Pages e comportamento em produção.
- Bulma, fontes e Font Awesome serão integrados conforme especificação: não pressupor sua presença no projeto .NET atual.

Não registrar tokens, connection strings secretas ou conteúdo de `Anotações.md`.
