# Trabalho local

## Entrada para consumidores

- `app/services/local/database.ts`: `localDatabase.diagnose()` retorna `{status: "operational"}` ou
  `{status: "unsupported" | "unavailable", error: LocalStorageError}`. A API ausente é diferente de acesso negado, bloqueio ou falha. A
  importação é segura no SSR; operações exigem IndexedDB no ambiente executor. Não executar essas operações em handlers de servidor.
- `app/services/local/captures.ts`: `localCaptures.put(capture)`, `get(accountId, date)`, `remove(accountId, date)` e
  `listByAccount(accountId)`. `get` retorna `undefined` para ausência; a consulta retorna `[]` para conta sem registros. Escrita e remoção
  retornam `void` somente após commit; remover registro ausente é sucesso idempotente. Toda falha rejeita a Promise.
- `LocalCapture`: `accountId: string`, `date: string` (data civil YYYY-MM-DD fornecida pelo consumidor), `memories: LocalMemory[]`.
  Agora também exige `changed: boolean` (somente true é pendência) e `preservedOrigin: boolean` (origem com conteúdo preservado).
  `LocalMemory`: `id: string`, `content: string`, `order: number`. O fluxo futuro atribui um identificador uma única vez, por exemplo com
  `crypto.randomUUID()`, e o mantém ao editar/reordenar. O repositório persiste o agregado fornecido, sem gerar identidades, ordenar arrays,
  converter datas ou definir regras de edição. A ordem explícita é independente da posição no array.
- Conta e data formam a chave composta; substituição afeta somente esse par. O índice `byAccount` restringe a consulta à conta informada.
  Esse isolamento é de seleção dos dados, não uma fronteira de segurança contra scripts da mesma origem. A identidade da conta vem de
  `SessionService.accountId(request)` nos handlers; não fixar uma identidade nas páginas.

Páginas devem consumir diagnóstico e repositório, sem abrir IndexedDB diretamente. A Seleção em `/capturar` já consulta pendências e remove
workspaces após confirmação; a Principal consulta pendências reais ao montar e nos eventos pageshow/focus. Falhas mostram mensagem explícita.

`listPending(accountId)` filtra `changed` e ordena por data crescente. `markChanged(accountId, date)` lê e atualiza na mesma transação;
ausência aborta e rejeita, repetição é idempotente. Ambos preservam isolamento por conta e confirmação após commit.

`app/services/capture.ts`: `prepareCapture` pressupõe data validada e diagnóstico operacional. Retoma workspace alterado sem consultar
remoto; reconstrói workspace intacto usando `PreservedCapturesService.read(accountId, date)` com resultados found/absent/failed. Falhas
rejeitam; apenas found/absent permitem gravar workspace intacto. A composição usa mock sem conteúdo preservado inicialmente.
`islands/CaptureDay.tsx` valida data pelo calendário local do navegador antes de diagnosticar ou preparar; só mostra a casca operacional
depois da confirmação local. O botão temporário marca alteração, sem editar memórias. Falha de abertura oferece retorno à Principal.
Não há limpeza automática: workspaces intactos são substituídos na próxima abertura, alterados são retomados sem consulta remota.

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

Banco `rememore-local`, versão 2. A migração 2 limpa os registros experimentais de capturas sem estado/origem, conforme autorizado antes da V1.
`app/services/local/schema.ts` concentra migrações consecutivas a partir de 1. Para evoluir, acrescentar
uma migração com a próxima versão; ela recebe banco e transação de upgrade, permitindo criar stores/índices ou transformar registros com
requisições IndexedDB. O mecanismo aplica somente versões posteriores à armazenada, dentro da transação nativa de upgrade. Não aumentar
versão sem migração nem alterar retroativamente a migração já aplicada. Não existe recriação silenciosa para contornar falhas.

Stores atuais: `captures`, chave `[accountId, date]`, índice `byAccount`; `_health`, técnico, sem dados funcionais. O diagnóstico
prepara/abre o banco, grava um token, lê e remove esse token em uma transação de escrita. Compara a leitura e aguarda commit. Sucesso não
garante operações futuras nem diagnostica exaustivamente corrupção, capacidade disponível ou a política de retenção do navegador.

Os construtores `LocalDatabase({name, factory, migrations})` e `LocalCapturesRepository(database)` permitem validação técnica isolada. Não
há dependência externa de runtime. Cenários de desenvolvimento usaram `fake-indexeddb` em memória; não equivalem a teste de persistência em
disco, quota ou permissões reais de cada navegador.
