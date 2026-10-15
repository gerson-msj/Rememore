# Verificação da Seleção e abertura de Capturar

`Abertura.Verificacao.csproj` executa cenários determinísticos do contrato C# sem backend e sem navegador. `verificar-navegacao.cjs` e `verificar-pendencias.cjs` exercitam o cliente Blazor com IndexedDB real no Chrome. `verificar-cenarios.cjs` usa o andaime temporário `VerificacaoCapturar.razor` para trocar o nível simulado e a resposta remota sem adicionar controles ao produto.

1. Execute `dotnet run --project tests/Capturar/Abertura.Verificacao.csproj`.
2. Para `verificar-cenarios.cjs`, copie `VerificacaoCapturar.razor` para `src/Rememore.Client/Pages/VerificacaoCapturar.razor`. Confirme antes que o destino não exista.
3. Execute `dotnet run --project src/Rememore.Client/Rememore.Client.csproj --no-restore --no-launch-profile --urls http://localhost:5193`. No Codex Windows, compilar/executar Blazor exige execução fora do sandbox, conforme `.docs/memoria-tecnica.md`.
4. Configure `PLAYWRIGHT_MODULE` com o caminho do módulo Playwright do runtime local, caso não esteja no caminho padrão do Node. Execute `node tests/Capturar/verificar-navegacao.cjs`, `node tests/Capturar/verificar-pendencias.cjs` e `node tests/Capturar/verificar-cenarios.cjs`. Cada script usa um perfil Chrome isolado em `artifacts/verificacao-capturar/`. A origem padrão é `http://localhost:5193`; `REMEMORE_URL` pode substituí-la.
5. Pare o servidor, remova **somente** a cópia temporária em `src/Rememore.Client/Pages/VerificacaoCapturar.razor` e compile o cliente novamente. Preserve o andaime na pasta de testes.

Os testes não acessam a API experimental. Falhas são induzidas no perfil isolado e os métodos originais do navegador são restaurados após cada cenário. Nenhum painel ou rota de verificação deve integrar a aplicação final.
