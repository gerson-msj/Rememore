# Projeção de Rememorar

## Persistência local

`app/servicos/local/projecaoRememorar.ts` persiste um bloco por conta/data no store `projecaoRememorar`; `metadadosProjecaoRememorar` guarda
a revisão global por conta. Um bloco contém apenas `idConta`, data civil, IDs de categoria e listas de Tons (`number | null`). A
reconciliação incremental e a reconstrução gravam blocos/remoções e metadados na mesma transação. A reconstrução apaga somente os blocos da
conta selecionada. Schema 7 acrescenta stores e índice sem tocar nos dados das versões anteriores.

## Serviço e remoto mockado

`app/servicos/rememorar/contratos.ts` define respostas completa, incremental e atualizada; `projecao.ts` sincroniza ou reconstrói e só
promove a revisão após persistência. `simulado.ts` acompanha revisão da última alteração por data: entrega somente o estado atual do bloco
alterado, ou tombstone da data removida. Remoção seguida de recriação entrega o bloco atual. Em desenvolvimento,
`rememoreRememorarMock.selecionarCenario(2 | 7 | 30 | 300)`, `alterarData`, `removerData` e `falhar` controlam o remoto por conta.
O cenário padrão de desenvolvimento é 300 dias; produção simulada mantém 30. Selecionar outro cenário preserva a revisão anterior e
publica blocos/tombstones incrementais para reconciliar o cache local sem deixar datas do cenário anterior.

`app/servicos/rememorar.ts` prepara projeção antes de `prepararCatalogo`; retorna status e dados locais de ambos sem compor interface ou
calcular o Panorama. `/rememorar` fornece a identidade da conta autenticada e inicia essa preparação no cliente. Falhas preservam e devolvem
cache local legível como estado técnico, marcado como falho.

## Acervo de referência

`acervo.ts` constrói um universo determinístico de 300 dias, IDs de memória estáveis, 1–15 memórias por dia, Tons definidos/ausentes,
associações múltiplas e até três adendos. Os cenários menores reutilizam os primeiros dias; todos usam o mesmo catálogo de 40 categorias,
incluindo duas inativas. A projeção derivada omite texto, adendos e balanço. Os testes correspondentes ficam em `projecao_test.ts`.
