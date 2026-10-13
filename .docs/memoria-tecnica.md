# Memória técnica reutilizável — Stack .NET

**Situação:** fundação visual inicial implementada na Spec 01; a API continua experimental e aprovada apenas quanto à viabilidade pública. Esta memória descreve o que está efetivamente disponível, sem antecipar as futuras jornadas funcionais.

## Estruturas verificadas

- Solução: `Rememore.slnx` com `src/Rememore.Client` (Blazor WebAssembly standalone, .NET 10) e `src/Rememore.Api` (ASP.NET Core Minimal API, .NET 10).
- Cliente: `Program.cs` registra `HttpClient` com `ApiBaseUrl` e `EstadoTema`. `Pages/Home.razor` é a Página Inicial da Spec 01; o acesso de categorias experimental não deve ser inferido como jornada do produto.
- API de prova: `GET /api/categorias`; `Turso.Data.Sqlite.Provider` 0.8.2 com ADO.NET. Criação/seed de Categorias na inicialização é **experimental** e não deve ser adotada como política de produção.
- Publicação: `.github/workflows/publish-pages.yml` no GitHub Pages, `Dockerfile` da API na Render, Turso remoto. Workflow atual aponta para `Stack2`; `develop` será trabalho e `main` publicação após transição deliberada.
- `Stack1/` contém implementação anterior protegida para consulta seletiva; não reutilizar automaticamente sua arquitetura, CSS ou dados.

## Contratos e componentes compartilhados da nova stack

- `CabecalhoPagina` — `src/Rememore.Client/Componentes/CabecalhoPagina.razor`: cabeçalho de página com título obrigatório, fixação configurável e ações opcionais de retorno/saída via `EventCallback`; callbacks delegam ao chamador e não navegam nem encerram sessão por conta própria. Extensão: o chamador fornece título e ações conforme a jornada.
- `SeletorTema` — `src/Rememore.Client/Componentes/SeletorTema.razor`: seleção única Sistema/Claro/Escuro; recebe `PreferenciaTema` e emite `PreferenciaChanged`. Não persiste nem aplica paletas por si; deve ficar ligado ao contexto proprietário do estado.
- `EstadoTema`, `PreferenciaTema`, `PaletaTema` — `src/Rememore.Client/Infraestrutura/`: serviço scoped que centraliza escolha, preferência de sistema, paletas e aplicação; enums e valores iniciais em tipo/record separado. Laboratório usa localStorage (`rememore.lab.tema.v1`, `rememore.lab.paletas.v1`); isso não é preferência de conta. Se vários descendentes precisarem refletir mutações do serviço via cascata, `Revisao` deve acompanhar a alteração para provocar renderização.
- `BlocoLaboratorio` — `src/Rememore.Client/Componentes/BlocoLaboratorio.razor`: contêiner independente, acessível e expansível com `Identificador`, `Titulo`, `ExpandidoInicial` e `ChildContent`; persiste expansão em `rememore.lab.bloco.{Identificador}.v1`. Componente específico do laboratório, não presumir que seja estrutura geral de página.
- `MensagemPopup` — `src/Rememore.Client/Componentes/MensagemPopup.razor`: componente modal reutilizável, controlado pelo chamador via `IsOpen`; recebe título opcional, parágrafos textuais, ícone Font Awesome opcional, cor semântica opcional e a configuração/rótulos das ações. `AoResponder` sempre emite `RespostaPopup.Confirmacao` ou `RespostaPopup.Cancelamento`; o chamador decide se fecha. Usa `<dialog>` nativo e `wwwroot/js/mensagemPopup.js` para Esc, backdrop e restauração de foco. Exercitado no bloco CMP-028 de `/laboratorio`; popup validado pelo operador em 13/10/2026. A integração em páginas de produto continua condicionada à subespecificação seguinte.

Antes de criar componente parecido, verificar este índice e a implementação existente. O antigo `Memoria` é exemplo histórico de comportamento pensado para extensão, não um componente já existente no Blazor. CMP-029 foi implementado nesta unidade; a reconciliação da Funcionalização compartilhada depende do processo documental autorizado após o Parecer.

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
- Viewport estreito, cálculo de contraste e percurso completo de teclado não foram medidos separadamente pelo programador durante o encerramento da Spec 01; o operador informou que a unidade estava validada.

Não registrar tokens, connection strings secretas ou conteúdo de `Anotações.md`.
