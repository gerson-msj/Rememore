# Contexto operacional do desenvolvimento do Rememore — Stack .NET

Este arquivo orienta o programador na implementação vigente. Leia-o no início de cada nova sessão de desenvolvimento. Fonte metodológica: [Contexto do Desenvolvimento do Rememore](https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit). A documentação funcional vigente prevalece sobre inferências do código anterior. O operador aprova escopo, decisões funcionais e encerramento.

## Situação e limites

O produto evolui por documentação: Descoberta → Consolidado → Fluxos → Funcionalização → Especificações → implementação → Parecer e reconciliação. O Consolidado expressa a verdade funcional vigente; Fluxos, Funcionalização e Especificações derivam dela. O programador recebe **uma especificação operacional autossuficiente por vez**; não precisa consultar o Google Drive nem toda a documentação de produto, salvo pedido expresso do operador.

A solução atual `Rememore.slnx` contém `src/Rememore.Client` (Blazor WebAssembly **standalone**, .NET 10, estático) e `src/Rememore.Api` (ASP.NET Core **Minimal API**, .NET 10). A API experimental usa `Turso.Data.Sqlite.Provider` 0.8.2 via ADO.NET, sem EF Core validado. O frontend é publicado por GitHub Actions no GitHub Pages; a API, via Docker na Render; os dados remotos de teste estão no Turso. O teste de viabilidade provou a integração pública de leitura de categorias, **não** provou que o restante do domínio ou o backend definitivo esteja implementado.

`Stack1/` contém a implementação histórica Deno/Fresh/Preact, seu `AGENTS.md`, documentação técnica e 24 especificações concluídas. **Não altere ou exclua Stack1.** Ela será mantida até equivalência funcional suficiente e decisão expressa de sua retirada, preservando-se referência histórica. Pode ser consultada **pontualmente** para esclarecer comportamento, algoritmo ou contrato da unidade corrente, nunca como arquitetura, CSS ou layout a copiar obrigatoriamente. Não faça varreduras do legado ou de especificações antigas por iniciativa própria. A documentação vigente e as decisões aprovadas prevalecem.

Branches: `develop` é a branch de trabalho prevista; `main` será a referência de publicação. **Transição:** os pipelines e configurações da Render/Pages ainda podem publicar `Stack2`; não os modifique ou suponha migrados sem tarefa e autorização específica. Verifique branch, estado de Git e arquivos existentes antes de editar. Não abra `Anotações.md` ou arquivos de credenciais.

## Início de cada unidade

1. Leia este `AGENTS.md`, `.docs/README.md` e a memória técnica inicial apontada nele, atualmente `.docs/memoria-tecnica.md`.
2. Leia **integralmente somente** a especificação operacional atual, indicada pelo operador, em `.docs/especificacoes/`. Não liste nem leia as demais especificações ou suas fontes automaticamente. A referência `05.07` no Drive pode originar `05.07` ou subdivisões `05.07.01`, `05.07.02` etc., conforme aprovação; no repositório os arquivos podem usar prefixos locais `07` e `07.01`.
A especificação operacional pode ser fornecida pelo operador como arquivo Markdown ou como texto na conversa. Quando vier como texto, crie em `.docs/especificacoes/` o Markdown operacional da unidade, preservando integralmente o corpo aprovado; depois siga o mesmo fluxo e mantenha plano, checkpoints, validações e estado fora desse corpo.
3. Identifique, pela especificação e pela memória técnica, contratos, componentes reutilizáveis e pontos de integração. Só então abra código **seletivamente**. Confira a implementação e os chamadores antes de alterá-los.
4. Antes de iniciar execução ou atualizar o plano, apresente ao operador entendimento do escopo e dúvidas funcionais agrupadas. Caso não existam, declare isso. Não invente regras, textos, navegação, estados, acessibilidade funcional, limites ou comportamentos. Se uma nova dúvida surgir depois, interrompa somente o trabalho afetado e consulte o operador.
5. Após clarificação, mantenha no **mesmo Markdown operacional** o plano mínimo, checkpoints, validações e estado corrente, separados do corpo aprovado. Faça `git status --short` e informe modificações pré-existentes antes de editar.

Toda especificação é uma unidade deliberadamente delimitada. Prefira unidades pequenas e verificáveis quando blocos forem independentes; não fragmente artificialmente um fluxo transacional coeso. Não amplie escopo, faça refatoração geral, instale dependências, crie infraestrutura para demandas futuras ou altere contratos funcionais sem necessidade e autorização. Decisões técnicas locais dentro do escopo pertencem ao programador e podem ser questionadas pelo operador.

Quando a unidade criar ou reconstruir um componente reutilizável, mantenha sua especificação operacional separada das especificações das páginas que irão utilizá-lo. Implemente e demonstre o componente no `/lab`; não o integre a páginas reais até o operador validar sua aparência e interação no laboratório. Depois da validação, a integração à página permanece uma unidade própria e exige também validação nessa página: o aceite no laboratório não substitui a verificação no contexto real. É válido reconstruir e validar os componentes prioritários antes de iniciar a revisão das páginas.

## Checkpoints e memória permanente da unidade

**O Markdown operacional é a memória permanente da unidade, não somente da sessão.** Preserve integralmente e sem alterações o corpo original aprovado. Fora dele, o programador pode organizar livremente seções, tabelas, registros e notas de trabalho, desde que sejam legíveis e sirvam à retomada, aos checkpoints e ao Parecer final.

Ao **concluir cada checkpoint**, registre imediatamente: o que foi implementado; testes e validações e seus resultados; arquivos ou contratos relevantes; observações, solicitações, alterações e aceite do operador; decisões que substituíram outras, com a decisão vigente; pendências, riscos e próximo passo concreto. Faça também anotações intermediárias quando uma descoberta ou decisão importante ocorrer. Não dependa de avisos sobre tamanho do contexto, trocas de sessão ou pedidos para anotar: compactação automática ou manual pode acontecer a qualquer momento e a memória escrita deve bastar para retomar. **Não exija medição de tokens nem registros de percentuais de contexto.** A memória da unidade não substitui a memória técnica reutilizável entre diferentes unidades.

Valide progressivamente com o operador quando isso evitar retrabalho. O programador executa verificações técnicas e, quando úteis, testes de regras e cenários determinísticos; o operador confirma experiência visual e funcional. Testes não têm meta artificial de cobertura; não apague testes úteis automaticamente, nem confunda testes contra mocks com testes do backend real.

Ao interpretar a Especificação, identifique os requisitos funcionais, regras, estados, UX, garantias técnicas e critérios de aceite pertinentes. Planeje verificações que demonstrem seu cumprimento, contemplando situações normais, alternativas e falhas relevantes ao risco da unidade. Utilize testes automatizados, verificações técnicas ou validações no navegador conforme a necessidade concreta, sem criar estruturas de teste ou proteções desproporcionais. Registre o que foi efetivamente verificado e o que permanece sem comprovação.

Ao entregar a última atividade de implementação prevista em uma Especificação, informe explicitamente ao operador que **toda a implementação prevista na Especificação foi concluída**. Comunique esse marco mesmo quando ainda houver testes, avaliação do operador, possíveis ajustes ou encerramento pendentes; registre cada etapa com seu estado próprio.

## Estratégia funcional e mocks

Reconstrua primeiro o **frontend funcional real**: páginas, rotas, estados, interface e comportamento. Dependências de backend ainda não implementadas são simuladas **no projeto Blazor**, atrás de contratos C# explícitos e substituíveis via injeção de dependências. Simule a **dependência externa**, não a página. Mocks podem ser stateful quando o fluxo exigir (preservação, conflitos, sincronização), com dados determinísticos e somente o escopo necessário. Não misture estado remoto simulado e workspace local.

**IndexedDB é persistência local real**, não mock; seu acesso em Blazor pode usar JS Interop isolado e encapsulado, mantendo regras autorais em C# quando apropriado. Use `sessionStorage` apenas para responsabilidades efêmeras aprovadas. A API ASP.NET Core existente é infraestrutura **experimental**, com endpoint e tabela de categorias de teste: não converta o esquema, o seed na inicialização ou o contrato experimental em solução definitiva por presunção. Não implemente backend definitivo, autenticação real ou schema remoto/migrations antes de especificação própria e autorização expressa. ADO.NET/Turso tem validação limitada; EF Core/Turso, transações, migrações e operações remotas reais deverão ser verificadas separadamente.

Frontend no GitHub Pages inicia independentemente da Render. Para uso remoto futuro, preferir recuperação amigável de indisponibilidade/hibernação, sem heartbeat, com espera limitada, retentativa controlada e sem repetição insegura de escritas (idempotência). Essa estratégia precisa de validação na especificação apropriada; não invente implementações prematuras.

## Arquitetura, linguagem e reutilização

Use a estrutura de projetos existente e crie abstrações apenas quando o comportamento exigir; não introduza DDD, repositories, services ou projetos compartilhados por hábito. Evite lógica desnecessariamente duplicada e acoplamento de regra de negócio a componentes visuais. Prefira componentes Razor coesos e reutilizáveis quando houver comportamento compartilhado, sem obrigar que toda divisão organizacional gere um componente público.

**Antes de criar ou duplicar um componente, consulte o índice de componentes compartilhados na memória técnica, os contratos e os usos existentes.** Considere ampliar com cuidado um componente criado para extensão, como `Memoria`, preservando usos anteriores e validando regressões. Na preparação da especificação, oportunidades de reutilização devem ser explicitadas; o programador deve verificar se permanecem válidas no código atual. Mantenha na memória técnica um índice **seletivo** de componentes reutilizáveis, contratos, modos de uso e pontos previstos para extensão. Não produza inventário exaustivo de arquivos.

Idioma autoral: **português brasileiro** para tipos, classes, interfaces, métodos, variáveis, componentes Razor, arquivos, CSS próprio, descrições de testes e comentários, usando identificadores ASCII sem acentos, com PascalCase/camelCase e convenções usuais de C#/.NET. Preserve nomes de APIs, protocolos, bibliotecas, atributos Razor/HTML, contratos externos, rotas e identificadores estáveis em sua grafia imposta. Não traduza esquemas, payloads, stores IndexedDB ou outros contratos já persistidos sem migração deliberada. Comentários devem explicar decisões ou restrições, não parafrasear o código.

## UX, acessibilidade, CSS e identidade visual

A reescrita **não copia fielmente** layouts, usabilidade, CSS ou organização de `Stack1`. Preserve regras e objetivos funcionais vigentes; redesenhe livremente a apresentação **dentro das decisões aprovadas**. O operador valida escolhas novas que alterem experiência relevante. Princípios de qualidade:
- Clareza e hierarquia visual; consistência e continuidade entre páginas e componentes.
- Revelação progressiva; feedback claro de carregamento, sucesso, vazio, falha e recuperação; proteção do trabalho do usuário.
- Responsividade e acessibilidade orientadas a WCAG 2.2 AA: semântica, contraste, teclado, foco visível, nomes acessíveis e respeito a `prefers-reduced-motion`.
- Identidade visual sistemática: tipografia, espaçamento, cores, estados e componentes compartilhados, sem impor precocemente um design system extenso.
- Transições suaves quando ajudam o usuário a compreender uma mudança; nunca sacrifique acessibilidade ou fluidez por decoração. A aprovação em laboratório não substitui validação na página real.

**Bulma é a base CSS prevista**, junto às fontes e ao Font Awesome; ainda não pressuponha que estejam instalados no projeto Blazor. Priorize utilizar e **estender/personalizar** Bulma (tokens/variáveis, classes e configurações suportadas), evitando modificar seus arquivos distribuídos. Criar CSS novo é normal; organize por responsabilidade, com estilos globais e `.razor.css` quando adequado, sem formar monolito e sem duplicações. Não tente reduzir o acoplamento a Bulma às custas de pior UX: não há plano de substituí-lo sem motivo forte. Registre padrões visuais compartilhados quando se consolidarem, sem copiar estilos inteiros para cada componente.

**Antes de implementar qualquer componente, controle ou padrão visual baseado no Bulma, consulte a documentação oficial em <https://bulma.io/documentation/> e, quando útil, seus exemplos de marcação.** Confira como o Bulma estrutura o elemento e aplica suas classes, incluindo os elementos filhos e a ordem esperada, antes de escrever o markup ou CSS. Reproduza o padrão documentado e adapte apenas o necessário ao contrato e à acessibilidade do Rememore; não invente classes ou estruturas presumindo que sejam o padrão do Bulma. Se a documentação e os exemplos oficiais não demonstrarem como implementar a necessidade, informe isso ao operador antes de propor a solução. Em seguida, construa um componente reutilizável com base nas convenções do Bulma, discutindo com o operador as decisões visuais ou de interação que não estiverem definidas. Essa consulta vale também para ajustes de layout e para usos de elementos conhecidos, como campos, botões e ícones.

Quando o padrão do Bulma não atender integralmente ao comportamento aprovado, preserve sua estrutura e seus recursos como base e personalize somente o necessário para o componente, de preferência em CSS isolado `.razor.css`. Identifique a regra do Bulma que impede o comportamento desejado, limite o seletor e a alteração ao componente, e registre o padrão técnico confirmado na especificação operacional ou na memória técnica quando puder ser reutilizado. Não modifique os arquivos distribuídos do Bulma.

Boas práticas orientam decisões técnicas e de apresentação, **não autorizam mudar** regras, mensagens, rotas, fluxos ou decisões de UX explicitamente aprovadas. Consultar o operador em caso de dúvida funcional.

## Ferramentas, execução, segurança e publicação

A solução usa .NET 10; comandos usuais incluem `dotnet restore Rememore.slnx`, `dotnet build Rememore.slnx`, `dotnet run --project src/Rememore.Api` e `dotnet run --project src/Rememore.Client`. Verifique endpoints/ports em configurações atuais; não os suponha fixos. `src/Rememore.Client/wwwroot/appsettings.json` contém apenas dados públicos de configuração e a URL de API local; o workflow ajusta a URL no artefato de publicação.

O cliente estático, seus artefatos WASM e qualquer arquivo distribuído são **públicos**: nunca inclua credenciais neles. Token Turso/connection string sensível pertence somente ao servidor e a segredos da plataforma, como `ConnectionStrings__Rememore` na Render. Não copie `Anotações.md`, não exponha tokens em código, logs, prompts ou commits; não abra esse arquivo. Configure CORS explicitamente pelas origens aprovadas, sem confundi-lo com autenticação. Nunca implemente endpoints de escrita reais sem autorização e proteção adequadas. Nenhuma alteração de pipelines, segredos, dados remotos ou publicação é implícita ao desenvolvimento de frontend.

`.github/workflows/publish-pages.yml` e `Dockerfile` são os mecanismos experimentais existentes. GitHub Pages ajusta base `/Rememore/`; rotas SPA internas, refresh e comportamento de recuperação da API ainda requerem testes próprios. O trabalho cotidiano ocorre em `develop`; publicação futura será em `main`; até migração efetiva os serviços podem continuar configurados para `Stack2`.

## Capital de tokens e continuidade entre unidades

`.docs/README.md` mantém o índice de leitura obrigatória e seletiva. `.docs/memoria-tecnica.md` é curta, atual e necessária na abertura. O programador pode criar referências temáticas quando houver conhecimento reutilizável: decisões não óbvias, contratos públicos, componentes compartilhados, limitações verificadas e caminhos relevantes. Registre **o resultado útil** do raciocínio, não um diário, catálogo de funções ou teoria genérica. Corrija ou remova conhecimento superado; decisões da Stack1 são históricas, não memória técnica atual da Stack2. Alterações em contratos compartilhados pedem atualização concomitante dessa memória.

## Auditoria independente (somente sob solicitação)

**Apenas quando o operador solicitar expressamente uma auditoria de Especificação** (por exemplo, “faça a auditoria da especificação 05.XX.YY”), leia integralmente `.docs/AUDITORIA.md` e siga esse procedimento para a unidade indicada. A auditoria é opcional, independente e posterior à implementação e ao Parecer final. **Não leia nem execute `AUDITORIA.md` automaticamente** no início das sessões, no desenvolvimento, em checkpoints, no encerramento habitual ou durante a reconciliação; uma mera menção à auditoria também não a aciona. Quando solicitada, siga as regras específicas de auditoria, em vez de iniciar novo ciclo de implementação: inspecione a entrega, registre o relatório após o Parecer final no mesmo Markdown, sem modificar o trabalho auditado, e deixe ao operador as decisões sobre os achados.

## Encerramento, Parecer e reconciliação

**Somente o operador encerra ou cancela** a especificação. Quando ele determinar encerramento:
1. Confira corpo aprovado, código entregue, checkpoints, validações e todas as observações e alterações do operador; escreva **Parecer final autossuficiente** no próprio Markdown operacional, sem tocar no corpo aprovado. Preserve diferenças entre intenção e resultado, decisões finais que substituíram anteriores, nomes concretos, comportamentos aceitos, pendências, limitações e evidências de validação. O analista precisa reconciliar a documentação **sem ler toda a Continuidade ou a conversa**.
2. Após o parecer, mova o Markdown para `.docs/especificacoes/concluidas/` (preserve nome e conteúdo); não arquive antes da solicitação do operador.
3. Apresente **no chat um bloco copiável com o Parecer final integral**, idêntico ao escrito no arquivo, para o operador transferir ao analista e ao Google Drive. Não afirme que atualizou o Drive sem fazê-lo.
4. O analista e o operador discutem o Parecer e autorizam reconciliação com a Funcionalização e, quando necessário, Fluxos/Consolidado. A próxima especificação só é determinada depois disso.

Não refaça especificações históricas, não altere o corpo aprovado e não apague evidências de divergências para fazer o resultado parecer idêntico ao plano.
