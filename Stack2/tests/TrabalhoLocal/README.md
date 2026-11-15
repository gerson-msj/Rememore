# Verificação da fundação local

Testes direcionados contra Chrome real e o cliente Blazor. Não usam IndexedDB em memória nem acessam a API experimental. Cada execução cria um perfil técnico próprio em `artifacts/verificacao-trabalho-local/`; `resultado.json` registra os cenários aprovados. O teste encerra e reabre o navegador com o mesmo perfil para comprovar persistência física e sessão. A regressão cobre as migrações dos schemas 1 a 3, proteção transacional de workspaces Alterados, associação imediata de categorias, concorrência, falha de escrita, cache por conta e a autoridade fake persistente: composição integral, revisão, categorias canônicas, historicidade, isolamento do workspace, reabertura de datas e atomicidade diante de aborto.

Requisitos: .NET 10, Chrome instalado e módulo Playwright disponível. Nenhuma dependência foi adicionada à aplicação. No ambiente Codex, o módulo usado foi o Playwright do runtime fornecido por `load_workspace_dependencies`.

1. Confirme que `src/Rememore.Client/Pages/VerificacaoTrabalhoLocal.razor` não existe; copie para esse caminho o andaime `tests/TrabalhoLocal/VerificacaoTrabalhoLocal.razor`.
2. Execute `dotnet run --project src/Rememore.Client --no-restore --launch-profile http` em um terminal. No Codex Windows, comandos que compilam Blazor precisam executar fora do sandbox conforme a memória técnica.
3. Em outro terminal PowerShell, defina `$env:PLAYWRIGHT_MODULE` com o caminho absoluto do módulo Playwright, se ele não estiver no caminho padrão do Node. Execute `node tests/TrabalhoLocal/verificar.cjs`. A origem padrão é `http://localhost:5193`; pode ser alterada por `$env:REMEMORE_URL`.
4. Pare o servidor, remova **somente** a cópia temporária em `src/Rememore.Client/Pages/VerificacaoTrabalhoLocal.razor` e recompile o cliente. Preserve o andaime nesta pasta de testes.

O andaime não tem interface de produto; apenas expõe os serviços registrados via `DotNetObjectReference` ao navegador técnico. Não deve ser incluído na aplicação final. Falhas são induzidas temporariamente em APIs/protótipos do navegador isolado, com restauração em `finally`. As migrações dos schemas 1 a 3 são exercitadas em banco técnico separado, usando o mesmo mecanismo de abertura/migrações; o schema 3 guarda capturas, diagnóstico, metadados de origem/revisão e cache do catálogo por conta.
