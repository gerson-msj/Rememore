# Trabalho local

## Entrada para consumidores

- `app/services/local/database.ts`: `localDatabase.diagnose()` retorna `{status: "operational"}` ou
  `{status: "unsupported" | "unavailable", error: LocalStorageError}`. A API ausente é diferente de acesso negado, bloqueio ou falha. A
  importação é segura no SSR; operações exigem IndexedDB no ambiente executor. Não executar essas operações em handlers de servidor.
- `app/services/local/captures.ts`: `localCaptures.put(capture)`, `get(accountId, date)`, `remove(accountId, date)` e
  `listByAccount(accountId)`. `get` retorna `undefined` para ausência; a consulta retorna `[]` para conta sem registros. Escrita e remoção
  retornam `void` somente após commit; remover registro ausente é sucesso idempotente. Toda falha rejeita a Promise.
- `LocalCapture`: `accountId: string`, `date: string` (data civil YYYY-MM-DD fornecida pelo consumidor), `memories: LocalMemory[]`. Exige
  `changed: boolean` (somente true é pendência), `preservedOrigin: boolean`, `originRevision: string | null` (revisão opaca, null para
  ausência remota), `workspaceId: string` (identidade desta materialização) e `editWindowDays: number` (prazo recebido na preparação).
  `LocalMemory`: `id: string`, `content: string`, `order: number`, `firstPreservedAt: string | null`, `complements: LocalComplement[]`.
  Complementos estão em ordem histórica, com `id`, `content` e `firstPreservedAt` próprios. null significa nunca preservado; timestamp ISO
  representa a primeira preservação e não deve ser reiniciado em futuras edições/preservações. O fluxo atribui um identificador uma única
  vez, por exemplo com `crypto.randomUUID()`, e o mantém ao editar/reordenar. O repositório persiste o agregado fornecido, sem gerar
  identidades, ordenar arrays, converter datas ou definir regras de edição. A ordem explícita é independente da posição no array.
- Conta e data formam a chave composta; substituição afeta somente esse par. O índice `byAccount` restringe a consulta à conta informada.
  Esse isolamento é de seleção dos dados, não uma fronteira de segurança contra scripts da mesma origem. A identidade da conta vem de
  `SessionService.accountId(request)` nos handlers; não fixar uma identidade nas páginas.

Páginas devem consumir diagnóstico e repositório, sem abrir IndexedDB diretamente. A Seleção em `/capturar` já consulta pendências e remove
workspaces após confirmação; a Principal consulta pendências reais ao montar e nos eventos pageshow/focus. Falhas mostram mensagem
explícita.

`listPending(accountId)` filtra `changed` e ordena por data crescente. `markChanged(accountId, date)` lê e atualiza na mesma transação;
ausência aborta e rejeita, repetição é idempotente. Ambos preservam isolamento por conta e confirmação após commit.

`app/services/capture.ts`: `prepareCapture(accountId, date, repository?, remote?, resumeWorkspaceId?)` pressupõe data validada, diagnóstico
operacional e posse do bloqueio. Retoma workspace alterado, ou a mesma materialização numa sessão restaurada por reload, sem consulta
remota, conservando o prazo recebido. Nova entrada com workspace limpo chama `PreservedCapturesService.inspect`: found + revisão + prazo,
absent + prazo, ou failed. Revisão igual/ausência igual reutiliza conteúdo local e atualiza somente o prazo se necessário. Mudança para
found chama `read`, que entrega composição, revisão e prazo do mesmo snapshot. Mudança para absent grava vazio limpo. Falha ou configuração
inválida rejeita sem substituir o estado anterior. A revisão de origem permanece no workspace alterado para a futura preservação.

`app/services/capture/openSession.ts`: `CaptureOpenSession` usa sessionStorage por conta/data. `resume(navigationType)` só retorna
identidade para reload; navigate/back_forward encerram a sessão anterior. `begin(workspaceId)` ocorre após preparação confirmada. `end()` na
saída controlada. Falhas propagam para o chamador avisar sobre proteção indisponível. Esse marcador não é rascunho nem pendência. Rascunhos
de texto/autorização ainda serão integrados no marco D da 07.

`app/services/capture/lock.ts`: `acquireCaptureLock(accountId, date)` retorna `CaptureLease` ou null se já ocupado; indisponibilidade
rejeita. Usa Web Locks exclusivo, sem tomada forçada nem fila de espera. A lease cobre toda a abertura da Captura do dia e suas operações;
`lease.run(operation)` mantém operações em curso protegidas até completar. `release()` impede novas operações e aguarda as atuais antes de
liberar. Seleção adquire o mesmo lock antes de remover pendência. Chamadores não devem escrever sem posse do lock. `pagehide` libera a
lease; retorno por BFCache refaz a entrada antes de aceitar ações. O navegador libera locks ao terminar o contexto, sem heartbeat/TTL
próprios. Referência consultada: [Web Locks API](https://www.w3.org/TR/web-locks/).

`islands/CaptureDay.tsx` valida calendário local antes do diagnóstico/preparação; mostra o workspace somente após confirmação local. No
marco B da 07, a estrutura visual e a leitura do mock já aparecem, mas edição/confirmação e rascunho ainda aguardam C/D. O botão temporário
permanece ao final da lista para validar a fundação. Não há política automática de limpeza/TTL. O mock inicial continua remotamente
ausente, exceto o cenário visual de 08/09/2026 somente em desenvolvimento; controles pelo console estão na Continuidade da 07.

## Falhas e transações

`app/services/local/errors.ts` define `LocalStorageError`, com `operation`, `code` e `cause` original. Operações: `open`, `upgrade`,
`diagnose`, `read`, `write`, `remove`, `query`, `transaction`; códigos: `unsupported`, `blocked`, `failed`. Uma abertura ou migração que
falhe durante um CRUD mantém sua operação de origem. O consumidor decide mensagem, navegação e recuperação. Não existe fallback para dados
vazios, exclusão automática do banco ou política de recuperação.

`LocalDatabase.transaction(stores, mode, operation, enqueue)` é o ponto interno para operações de infraestrutura/repositórios. O callback
enfileira requisições sincronamente e retorna a requisição cujo resultado interessa. Pode usar vários stores na mesma transação; não deve
aguardar rede, timers ou outro trabalho externo. A Promise aguarda `complete`, nunca apenas o sucesso de uma requisição. Exceção síncrona
aborta a transação; falhas nativas e abortos rejeitam com o contrato comum. Não suprimir erros nativos nem substituir os handlers do núcleo.

A conexão é aberta por operação e fechada em `finally`, evitando cache de conexão inválida após limpeza do armazenamento. `versionchange`
solicita fechamento; `blocked` rejeita explicitamente. IndexedDB não permite cancelar uma requisição de abertura pendente: se uma abertura
já reportada como bloqueada prosseguir depois, seu upgrade será abortado ou sua conexão fechada, sem executar a migração abandonada.

Referência técnica consultada para commit, bloqueio e rollback: [Indexed Database API 3.0](https://w3c.github.io/IndexedDB/).

## Schema e diagnóstico

Banco `rememore-local`, versão 3. A migração 2 limpa registros experimentais sem estado/origem. A migração 3 limpa capturas experimentais
anteriores à 07 sem revisão/historicidade, conforme dispensa explícita do operador em 14/09/2026. Cada limpeza ocorre somente no upgrade
correspondente, sem limpar capturas nas aberturas posteriores. `app/services/local/schema.ts` concentra migrações consecutivas a partir
de 1. Para evoluir, acrescentar uma migração com a próxima versão; ela recebe banco e transação de upgrade, permitindo criar stores/índices
ou transformar registros com requisições IndexedDB. O mecanismo aplica somente versões posteriores à armazenada, dentro da transação nativa
de upgrade. Não aumentar versão sem migração nem alterar retroativamente a migração já aplicada. Não existe recriação silenciosa para
contornar falhas.

Stores atuais: `captures`, chave `[accountId, date]`, índice `byAccount`; `_health`, técnico, sem dados funcionais. O diagnóstico
prepara/abre o banco, grava um token, lê e remove esse token em uma transação de escrita. Compara a leitura e aguarda commit. Sucesso não
garante operações futuras nem diagnostica exaustivamente corrupção, capacidade disponível ou a política de retenção do navegador.

Os construtores `LocalDatabase({name, factory, migrations})` e `LocalCapturesRepository(database)` permitem validação técnica isolada. Não
há dependência externa de runtime. Cenários de desenvolvimento usaram `fake-indexeddb` em memória; não equivalem a teste de persistência em
disco, quota ou permissões reais de cada navegador.
