# Rememore — Validação de viabilidade da nova stack

**Estado:** plano de prova de conceito; execução não iniciada.  
**Data:** 11/10/2026.  
**Local previsto:** raiz do **mesmo repositório Git** do Rememore.  
**Natureza:** experimento técnico isolado; **não** é uma especificação funcional nem autoriza reescrever as 24 especificações existentes.

## 1. Objetivo e critério de sucesso

Comprovar, de ponta a ponta e em infraestrutura gratuita, que é possível:

1. Desenvolver um **frontend Blazor WebAssembly standalone em .NET 10**, independente do backend.
2. Publicá-lo no **GitHub Pages**, a partir do repositório atual.
3. Desenvolver um **backend ASP.NET Core Web API tradicional em .NET 10**, servido por **Docker**.
4. Publicá-lo em um **Render Web Service Free**, conectado ao mesmo repositório.
5. Persistir, consultar, atualizar e excluir **registros de teste** em um banco **Turso remoto**, preferencialmente usando o provider oficial de integração com **Entity Framework Core**.
6. Acessar o frontend publicado, comunicar-se com a API publicada e verificar os dados efetivamente persistidos no Turso.
7. Validar o tratamento de **API adormecida, despertar, indisponibilidade e nova tentativa** pelo frontend, **sem heartbeat**.
8. Demonstrar a **exportação e leitura local dos dados de teste**, comprovando a portabilidade mínima.

**A viabilidade será considerada comprovada somente após testes públicos reais, registro das evidências e aceite do operador.** A implantação local, isoladamente, não encerra esta prova.

## 2. Premissas e limites

- Manter o **mesmo repositório Git**; trabalhar em uma **branch exclusiva** de prova de conceito, sem remover ou modificar a aplicação Deno/Fresh existente.
- Criar os novos projetos em uma pasta isolada, sugerida: `poc-dotnet/`. Não substituir ainda o projeto atual, os workflows existentes nem o conteúdo das 24 especificações.
- Front e back em **projetos distintos, na mesma solução .NET**. O frontend **não requer backend para iniciar** ou apresentar a interface-base.
- Front no **GitHub Pages**; back na **Render Free**; banco remoto no **Turso Free** (conta já existente).
- Usar somente **dados fictícios**; nada de memórias pessoais, dados reais, autenticação de produção ou informações sensíveis.
- Não implementar ainda Captura, Rememorar ou qualquer fluxo completo do produto.
- Não criar mecanismos artificiais para manter a Render ativa; testar a suspensão e a recuperação reais.
- Não assumir garantia de disponibilidade ou de ausência absoluta de cobrança. Conferir os planos, permissões e políticas no momento do cadastro, principalmente antes de cadastrar qualquer forma de pagamento.
- As interações em painéis de GitHub, Render e Turso, permissões e segredos exigem ação ou autorização explícita do operador.

## 3. Estrutura sugerida no repositório

```text
<raiz-do-repositorio>/
├── [aplicacao-deno-atual]/         # permanece intacta
├── [especificacoes-existentes]/    # permanecem intactas
├── poc-dotnet/
│   ├── Rememore.Poc.slnx
│   ├── src/
│   │   ├── Rememore.Poc.Client/    # Blazor WebAssembly standalone
│   │   └── Rememore.Poc.Api/       # ASP.NET Core Web API
│   ├── Dockerfile                  # build da API na Render
│   └── README.md                   # instruções de execução local
├── .github/workflows/
│   └── poc-blazor-pages.yml        # workflow novo e isolado
└── VALIDACAO_VIABILIDADE_NOVA_STACK.md
```

Os nomes são sugestões, sujeitos à validação do programador conforme a estrutura efetiva do repositório. Se necessário, acrescentar projeto compartilhado apenas para contratos simples; evitar complexidade prematura.

## 4. Etapas de execução

### Etapa 0 — Preparação e inspeção

- [ ] Inspecionar a estrutura e os workflows existentes do repositório, sem alterá-los.
- [ ] Confirmar que o operador está utilizando o repositório e a branch corretos.
- [ ] Criar branch isolada, por exemplo `poc/viabilidade-dotnet`.
- [ ] Verificar SDK .NET 10, Docker, Git e permissões de GitHub Actions/Pages.
- [ ] Registrar nome do repositório, branch de publicação e caminhos reais dos projetos, sem registrar tokens.

**Aceite:** branch isolada criada; aplicação original preservada.

### Etapa 1 — Fundação .NET local

- [ ] Criar a solução e os projetos Blazor WebAssembly standalone e ASP.NET Core Web API.
- [ ] Fazer o frontend abrir **sem a API em execução**, exibindo uma página de teste.
- [ ] Criar a API com `GET /api/health` retornando estado simples, sem consultar banco.
- [ ] Criar um cliente HTTP no Blazor com `BaseAddress` configurável por ambiente/publicação.
- [ ] Criar uma tela pequena com status da API e operações de teste, sem regras do Rememore.
- [ ] Executar `dotnet build`, testes mínimos e execução local dos dois projetos.

**Aceite:** compilação íntegra; tela Blazor funciona isoladamente; health responde localmente.

### Etapa 2 — Persistência Turso

- [ ] No Turso já existente, criar **um banco exclusivo para a prova de conceito**, sem reutilizar dados reais.
- [ ] Gerar credenciais com o menor escopo disponível; armazená-las somente no ambiente local e nos segredos da Render.
- [ ] Avaliar e testar `Turso.EntityFrameworkCore.Sqlite` e a forma de conexão remota apropriada, **sem presumir compatibilidade completa** das funcionalidades do EF Core.
- [ ] Criar entidade simples, por exemplo `RegistroTeste` com `Id`, `Texto` e `CriadoEmUtc`.
- [ ] Validar criação do esquema e operações **criar, listar, atualizar e excluir**, incluindo leitura após reinicialização da API.
- [ ] Se houver bloqueio do provider, documentar o erro, sua causa e a alternativa de menor impacto; não trocar silenciosamente a tecnologia.
- [ ] Garantir que credenciais e cadeias sensíveis não sejam enviadas ao navegador ou ao Git.

**Aceite:** dados fictícios persistidos e lidos efetivamente no Turso via API local; limitações do provider registradas.

### Etapa 3 — Publicação do frontend no GitHub Pages

- [ ] Confirmar se o repositório e o plano GitHub permitem Pages para sua visibilidade atual; discutir qualquer necessidade de tornar o repositório público **antes de alterá-la**.
- [ ] Configurar **GitHub Actions** exclusivamente para compilar e publicar o Blazor da POC.
- [ ] Ajustar o `base href` para o caminho real do site (`/<nome-do-repositorio>/` quando for project site).
- [ ] Incluir `.nojekyll` para preservar os arquivos `_framework`.
- [ ] Tratar as rotas SPA e o acesso direto/recarregamento a caminhos internos (`404.html` ou estratégia equivalente), conforme documentação Microsoft.
- [ ] Verificar integridade de arquivos e configuração do workflow de publicação.
- [ ] Publicar e abrir a URL pública em navegação anônima.

**Aceite:** frontend acessível por HTTPS, carrega sem o backend, e suporta atualização/acesso direto às rotas de teste.

### Etapa 4 — Publicação da API na Render Free

- [ ] Criar ou acessar conta Render; conectar GitHub **somente com as permissões necessárias**.
- [ ] Criar um **Web Service Free** a partir do mesmo repositório, apontando para o `Dockerfile`/diretório da POC.
- [ ] Ajustar a aplicação para escutar em `0.0.0.0` na porta indicada pelo ambiente Render (`PORT`) ou configuração compatível documentada.
- [ ] Configurar a URL do Turso e o token como variáveis de ambiente secretas no Render.
- [ ] Permitir CORS apenas à origem exata do frontend publicado; diferenciar desenvolvimento local.
- [ ] Confirmar endpoints públicos HTTPS, health, leitura e gravação no Turso e logs sem segredos.
- [ ] Validar que reinício e redeploy da Render não apagam dados remotos.

**Aceite:** API pública funciona com Docker e Turso, sem depender de armazenamento no disco efêmero da Render.

### Etapa 5 — Integração pública completa

- [ ] Configurar a URL pública da API no frontend por configuração de build/publicação, sem secrets.
- [ ] Acessar a página no GitHub Pages e executar **criação, listagem, edição e exclusão** no Turso, passando pela API Render.
- [ ] Validar CORS, HTTPS, erros HTTP e mensagens amigáveis.
- [ ] Atualizar a página e confirmar que os dados persistidos continuam disponíveis.
- [ ] Repetir o teste em janela anônima e, se possível, outro navegador/dispositivo.

**Aceite:** percurso `navegador → GitHub Pages → Render ASP.NET Core → Turso → navegador` comprovado em ambiente público.

### Etapa 6 — Suspensão, recuperação e falhas

- [ ] Deixar a Render ficar **mais de 15 minutos sem tráfego** e confirmar suspensão quando observável.
- [ ] Abrir a aplicação estática do GitHub Pages: ela deve aparecer mesmo se a API estiver suspensa.
- [ ] Solicitar operação remota e exibir mensagem amigável, por exemplo: **“Preparando a conexão. Isso pode levar alguns instantes.”**
- [ ] Executar tentativa de conexão/health controlada com prazos de espera, intervalos e limite total configurável; iniciar com limite **experimental** de aproximadamente 90 segundos, a ajustar pela medição.
- [ ] Quando a API despertar, retomar automaticamente a **consulta segura** que estava aguardando.
- [ ] Ao exceder o limite, apresentar indisponibilidade e opção explícita de tentar novamente; **não bloquear a interface estática**.
- [ ] Diferenciar timeout/falha de rede, erros 4xx, 5xx e API disponível; não repetir indiscriminadamente requisições com efeitos colaterais.
- [ ] Para gravações, validar proteção contra duplicação (identificador idempotente ou consulta de estado antes de repetir).
- [ ] Registrar o tempo medido em pelo menos três tentativas de despertar e uma execução já aquecida.

**Aceite:** nenhum erro bruto na interface durante cold start; recuperação ou falha controlada; operações sem duplicação; sem heartbeat.

### Etapa 7 — Recuperação e portabilidade dos dados

- [ ] Executar exportação suportada do banco Turso de teste (`.dump` ou outra modalidade oficial confirmada no momento).
- [ ] Restaurar o conteúdo em SQLite local e consultar registros esperados.
- [ ] Verificar contagens, esquema e amostra de registros antes de considerar a exportação válida.
- [ ] Documentar procedimento de repetição, acessos necessários e limitações, **sem anexar credenciais ao Git**.
- [ ] Confirmar que excluir o container/serviço Render não afeta o banco Turso.

**Aceite:** banco de teste reproduzível localmente e dados independentes da hospedagem da API.

### Etapa 8 — Custos, limitações e conclusão

- [ ] Confirmar custos reais nos dashboards de **GitHub Pages, Render e Turso**, incluindo banda e minutos de build; registrar se foi pedido cartão.
- [ ] Verificar as consequências de esgotamento das franquias, suspensão, reinício e indisponibilidade do serviço.
- [ ] Registrar URLs públicas, commit e branch da POC, resultados de build/testes, versões, tempos de retomada e observações.
- [ ] Produzir **parecer final de viabilidade**: aprovado, aprovado com ressalvas ou reprovado; justificar cada ressalva.
- [ ] Submeter o resultado ao operador para aceite antes de qualquer novo plano de reescrita.

**Aceite:** prova encerrada com evidências e decisão explícita do operador.

## 5. Restrições de segurança e custos

- Nenhum token Turso, senha ou credencial deve aparecer em `appsettings` versionado, código do Blazor, logs públicos ou workflow.
- O frontend no GitHub Pages é **público**: nenhum segredo deve ser distribuído com o WebAssembly.
- Durante a POC, a API deve trabalhar apenas com dados fictícios. Como não há autenticação de produção, restringir suas operações e remover/desabilitar endpoints de mutação após os testes se a aplicação permanecer pública.
- Não habilitar cobrança, modificar visibilidade do repositório ou conceder acesso amplo às contas sem decisão do operador.
- Render Free suspende serviços após 15 minutos sem tráfego, pode levar cerca de um minuto para retomada e tem filesystem efêmero; sua franquia de execução é compartilhada no workspace.
- O Render pode ter regras adicionais sobre tráfego para serviços externos e limites de banda/build. Conferir esses itens antes da publicação definitiva.
- O Turso Free tem franquias e termos próprios. A exportação manual demonstra portabilidade, **não equivale a política completa de backup ou recuperação de desastres**.

## 6. Evidências mínimas do parecer final

| Evidência | Resultado a registrar |
| --- | --- |
| Branch e commit | Identificador exato da POC |
| Blazor local | Inicializa sem API: sim/não |
| API local | Health e operações com Turso: sim/não |
| GitHub Pages | URL HTTPS; refresh e rotas funcionando |
| Render Free | URL HTTPS; imagem Docker e health |
| Turso | CRUD remoto confirmado após restart |
| Integração pública | CRUD pelo frontend publicado |
| Recuperação | Tempos de cold start; mensagens e comportamento |
| Persistência | Exportação restaurada e conferida localmente |
| Custos | Cobranças efetivas e métodos de pagamento exigidos |
| Restrições | Riscos e limitações para o MVP |
| Decisão | Aprovado / aprovado com ressalvas / reprovado |

## 7. Fora do escopo e próximo marco

**Não executar nesta POC:** reescrita das 24 especificações; migração do Deno/Fresh; criação de um backend completo; autenticação definitiva; implementação dos fluxos de Captura ou Rememorar; decisão final sobre estrutura documental.

**Somente depois do aceite da viabilidade** será criado, em trabalho separado, um novo plano para coletar os registros técnicos do repositório, confrontá-los com a documentação do Google Drive e preparar a reescrita orientada pelas especificações já validadas.

## 8. Fontes de referência

- Microsoft — Blazor WebAssembly no GitHub Pages: https://learn.microsoft.com/en-us/aspnet/core/blazor/host-and-deploy/webassembly/github-pages?view=aspnetcore-10.0
- Render — limites do plano Free: https://render.com/docs/free
- Render — serviços web e configuração de porta: https://render.com/docs/web-services
- Render — regras de cobrança no Free: https://render.com/docs/faq
- Turso — integração .NET e EF Core: https://github.com/tursodatabase/turso/blob/main/bindings/dotnet/Readme.md
- Turso — preços e franquias: https://turso.tech/pricing
