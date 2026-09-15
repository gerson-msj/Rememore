# Trabalho local

## Entrada para consumidores

- `app/servicos/local/banco.ts`: `bancoLocal.diagnosticar()` retorna `{status: "operational"}` ou
  `{status: "unsupported" | "unavailable", error: ErroArmazenamentoLocal}`. A API ausente é diferente de acesso negado, bloqueio ou falha. A
  importação é segura no SSR; operações exigem IndexedDB no ambiente executor. Não executar essas operações em handlers de servidor.
- `app/servicos/local/capturas.ts`: `capturasLocais.gravar(captura)`, `obter(idConta, dataCaptura)`, `remover(idConta, dataCaptura)` e
  `listarPorConta(idConta)`. `obter` retorna `undefined` para ausência; a consulta retorna `[]` para conta sem registros. Escrita e remoção
  retornam `void` somente após commit; remover registro ausente é sucesso idempotente. Toda falha rejeita a Promise.
- `CapturaLocal`: `idConta: string`, `dataCaptura: string` (data civil YYYY-MM-DD fornecida pelo consumidor), `memorias: MemoriaLocal[]`.
  Exige `alterada: boolean` (somente true é pendência), `origemPreservada: boolean`, `revisaoOrigem: string | null` (revisão opaca, null
  para ausência remota), `idAreaTrabalho: string` (identidade desta materialização) e `prazoEdicaoDias: number` (prazo recebido na
  preparação). `MemoriaLocal`: `id: string`, `conteudo: string`, `ordem: number`, `primeiraPreservacaoEm: string | null`,
  `complementos: ComplementoLocal[]`. Complementos estão em ordem histórica, com `id`, `conteudo` e `primeiraPreservacaoEm` próprios. null
  significa nunca preservado; timestamp ISO representa a primeira preservação e não deve ser reiniciado em futuras edições/preservações. O
  fluxo atribui um identificador uma única vez, por exemplo com `crypto.randomUUID()`, e o mantém ao editar/reordenar. O repositório
  persiste o agregado fornecido, sem gerar identidades, ordenar arrays, converter datas ou definir regras de edição. A ordem explícita é
  independente da posição no array.
- Conta e data formam a chave composta; substituição afeta somente esse par. O índice `porConta` restringe a consulta à conta informada.
  Esse isolamento é de seleção dos dados, não uma fronteira de segurança contra scripts da mesma origem. A identidade da conta vem de
  `ServicoSessao.accountId(request)` nos handlers; não fixar uma identidade nas páginas.

Páginas devem consumir diagnóstico e repositório, sem abrir IndexedDB diretamente. A Seleção em `/capturar` já consulta pendências e remove
workspaces após confirmação; a Principal consulta pendências reais ao montar e nos eventos pageshow/focus. Falhas mostram mensagem
explícita.

`listarPendentes(idConta)` filtra `alterada` e ordena por data crescente. `marcarAlterada(idConta, dataCaptura)` lê e atualiza na mesma
transação; ausência aborta e rejeita, repetição é idempotente. Ambos preservam isolamento por conta e confirmação após commit.

`app/servicos/captura.ts`: `prepararCaptura(idConta, dataCaptura, repositorio?, remoto?, idAreaTrabalhoRetomada?)` pressupõe data validada,
diagnóstico operacional e posse do bloqueio. Retoma workspace alterado, ou a mesma materialização numa sessão restaurada por reload, sem
consulta remota, conservando o prazo recebido. Nova entrada com workspace limpo chama `ServicoCapturasPreservadas.inspect`: found +
revisão + prazo, absent + prazo, ou failed. Revisão igual/ausência igual reutiliza conteúdo local e atualiza somente o prazo se necessário.
Mudança para found chama `read`, que entrega composição, revisão e prazo do mesmo snapshot. Mudança para absent grava vazio limpo. Falha ou
configuração inválida rejeita sem substituir o estado anterior. A revisão de origem permanece no workspace alterado para a futura
preservação.

`app/servicos/captura/contratos.ts` define `MemoriaPreservada` e `ComplementoPreservado` para o payload remoto, separados dos tipos locais.
Os campos remotos continuam `memories`, `content`, `order`, `firstPreservedAt`, `complements`, `revision` e `editWindowDays`.
`prepararCaptura` converte explicitamente para o agregado local, conservando valores, IDs, ordem dos arrays e historicidade.
`rememoreCaptureMock.set/configure/reset`, seus cenários serializados e chaves de localStorage permanecem compatíveis.

`app/servicos/captura/sessaoAberta.ts`: `SessaoCapturaAberta` usa sessionStorage por conta/data. `retomar(tipoNavegacao)` só retorna
identidade para reload; navigate/back_forward encerram a sessão anterior. `iniciar(idAreaTrabalho)` ocorre após preparação confirmada.
`encerrar()` na saída controlada. Falhas propagam para o chamador avisar sobre proteção indisponível. Esse marcador não é rascunho nem
pendência. Rascunhos de texto/autorização ainda serão integrados no marco D da 07.

A chave `rememore:capture:open:v1:` por conta/data e o campo serializado `workspaceId` permanecem no sessionStorage; `iniciar` recebe o
`idAreaTrabalho` local. Após descarte no upgrade 4, um marcador antigo não encontra sua materialização: a preparação consulta o remoto e
cria outra identidade, registrada somente após confirmação local. O marcador não autoriza retomar conteúdo de outra materialização.

`app/servicos/captura/bloqueio.ts`: `adquirirBloqueioCaptura(idConta, dataCaptura)` retorna `PosseCaptura` ou null se já ocupado;
indisponibilidade rejeita. Usa Web Locks exclusivo, sem tomada forçada nem fila de espera. A lease cobre toda a abertura da Captura do dia e
suas operações; `posse.executar(operacao)` mantém operações em curso protegidas até completar. `liberar()` impede novas operações e aguarda
as atuais antes de liberar. Seleção adquire o mesmo lock antes de remover pendência. Chamadores não devem escrever sem posse do lock.
`pagehide` libera a lease; retorno por BFCache refaz a entrada antes de aceitar ações. O navegador libera locks ao terminar o contexto, sem
heartbeat/TTL próprios. Referência consultada: [Web Locks API](https://www.w3.org/TR/web-locks/).

`islands/CapturaDia.tsx` valida calendário local antes do diagnóstico/preparação; mostra o workspace somente após confirmação local. No
marco B da 07, a estrutura visual e a leitura do mock já aparecem, mas edição/confirmação e rascunho ainda aguardam C/D. O botão temporário
permanece ao final da lista para validar a fundação. Não há política automática de limpeza/TTL. O mock inicial continua remotamente ausente,
exceto o cenário visual de 08/09/2026 somente em desenvolvimento; controles pelo console estão na Continuidade da 07.

## Falhas e transações

`app/servicos/local/erros.ts` define `ErroArmazenamentoLocal`, com `operation`, `code` e `cause` original. Operações: `open`, `upgrade`,
`diagnose`, `read`, `write`, `remove`, `query`, `transaction`; códigos: `unsupported`, `blocked`, `failed`. Uma abertura ou migração que
falhe durante um CRUD mantém sua operação de origem. O consumidor decide mensagem, navegação e recuperação. Não existe fallback para dados
vazios, exclusão automática do banco ou política de recuperação.

`BancoLocal.transacao(stores, modo, operacao, enfileirar)` é o ponto interno para operações de infraestrutura/repositórios. O callback
enfileira requisições sincronamente e retorna a requisição cujo resultado interessa. Pode usar vários stores na mesma transação; não deve
aguardar rede, timers ou outro trabalho externo. A Promise aguarda `complete`, nunca apenas o sucesso de uma requisição. Exceção síncrona
aborta a transação; falhas nativas e abortos rejeitam com o contrato comum. Não suprimir erros nativos nem substituir os handlers do núcleo.

A conexão é aberta por operação e fechada em `finally`, evitando cache de conexão inválida após limpeza do armazenamento. `versionchange`
solicita fechamento; `blocked` rejeita explicitamente. IndexedDB não permite cancelar uma requisição de abertura pendente: se uma abertura
já reportada como bloqueada prosseguir depois, seu upgrade será abortado ou sua conexão fechada, sem executar a migração abandonada.

Referência técnica consultada para commit, bloqueio e rollback: [Indexed Database API 3.0](https://w3c.github.io/IndexedDB/).

## Schema e diagnóstico

Banco `rememore-local`, versão 4. A migração 2 limpa registros experimentais sem estado/origem. A migração 3 limpa capturas experimentais
anteriores à 07 sem revisão/historicidade, conforme dispensa explícita do operador em 14/09/2026. A migração 4 substitui
`captures`/`_health` pelos stores em PT-BR e descarta os dados anteriores, conforme aprovação do operador em 15/09/2026. Migrações 1–3
mantêm seus nomes históricos e comportamento, independentemente das constantes do schema atual. Cada limpeza ocorre somente no upgrade
correspondente, sem limpar capturas nas aberturas posteriores. `app/servicos/local/esquema.ts` concentra migrações consecutivas a partir
de 1. Para evoluir, acrescentar uma migração com a próxima versão; ela recebe banco e transação de upgrade, permitindo criar stores/índices
ou transformar registros com requisições IndexedDB. O mecanismo aplica somente versões posteriores à armazenada, dentro da transação nativa
de upgrade. Não aumentar versão sem migração nem alterar retroativamente a migração já aplicada. Não existe recriação silenciosa para
contornar falhas.

Stores atuais: `capturas`, chave `[idConta, dataCaptura]`, índice `porConta`; `_diagnostico`, técnico, sem dados funcionais. O diagnóstico
prepara/abre o banco, grava um token na chave `sonda`, lê e remove esse token em uma transação de escrita. Compara a leitura e aguarda
commit. Sucesso não garante operações futuras nem diagnostica exaustivamente corrupção, capacidade disponível ou a política de retenção do
navegador.

Os construtores `BancoLocal({nome, fabrica, migracoes})` e `RepositorioCapturasLocais(banco)` permitem validação técnica isolada. Não há
dependência externa de runtime. Cenários de desenvolvimento usaram `fake-indexeddb` em memória; não equivalem a teste de persistência em
disco, quota ou permissões reais de cada navegador.
