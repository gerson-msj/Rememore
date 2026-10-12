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

## Questões técnicas ainda não validadas

- IndexedDB real via JS Interop e tratamento de falhas no Blazor.
- Equivalência funcional dos fluxos das 24 especificações.
- Autenticação, preservação transacional real, versionamento/schema de produção e migrações Turso.
- Pacote EF Core oficial para Turso e compatibilidade remota com EF Core 10.
- Recuperação UX após suspensão da Render, rotas internas SPA do GitHub Pages e comportamento em produção.
- Bulma, fontes e Font Awesome serão integrados conforme especificação: não pressupor sua presença no projeto .NET atual.

Não registrar tokens, connection strings secretas ou conteúdo de `Anotações.md`.
