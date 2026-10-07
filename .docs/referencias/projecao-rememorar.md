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
`rememoreRememorarMock.selecionarCenario(2 | 7 | 30 | 300)`, `alterarData`, `removerData` e `falhar` controlam o remoto por conta. O cenário
padrão de desenvolvimento é 300 dias; produção simulada mantém 30. Selecionar outro cenário preserva a revisão anterior e publica
blocos/tombstones incrementais para reconciliar o cache local sem deixar datas do cenário anterior.

`app/servicos/rememorar.ts` prepara projeção antes de `prepararCatalogo`; retorna status e dados locais de ambos sem compor interface ou
calcular o Panorama. `/rememorar` fornece a identidade da conta autenticada e inicia essa preparação no cliente. Falhas preservam e devolvem
cache local legível como estado técnico, marcado como falho.

## Panorama, ordenação e Tom visual

`app/utilitarios/panoramaRememorar.ts` deriva as categorias por intervalo sem limitar quantidade, incluindo `quantidadeTons` (associações
com Tom definido) e média individual. `calcularTomMedioPanorama` calcula a média global ponderando as médias pelo número de Tons definidos;
`calcularTomMedioCategoria` calcula a média simples de uma lista de Tons, ignorando `null` e incluindo zero. O CMP-008 recebe o Tom médio
da vista pelo contexto e mantém `null` quando não há categorias ou Tons definidos. `ordenacaoPanorama.ts` aplica os critérios
Representatividade crescente/decrescente e Tom positivo/negativo/sem Tom primeiro, com desempates por nome `pt-BR`; as transições reiniciam
no estado inicial do critério selecionado. `/rememorar` persiste somente o estado ativo em `localStorage`, na chave versionada e isolada por
conta `rememore:rememorar:ordenacao:v1:<conta codificada>`; falha de armazenamento mantém a preferência ativa na sessão.

`app/utilitarios/aparenciaTom.ts` aplica aos consumidores a transformação padrão de `curvaTom.ts` (limiar 20, intensidade 50), preservando o
Tom funcional e a família pelo sinal. Tom nulo não recebe intensidade. Componentes podem injetar transformação apenas para experimentação;
consumidores regulares usam o mapeamento comum.

## Acervo de referência

`acervo.ts` constrói um universo determinístico de 300 dias, IDs de memória estáveis, 1–15 memórias por dia, Tons definidos/ausentes,
associações múltiplas e até três adendos. Os cenários menores reutilizam os primeiros dias; todos usam o mesmo catálogo de 40 categorias,
incluindo duas inativas. A projeção derivada omite texto, adendos e balanço. Os testes correspondentes ficam em `projecao_test.ts`.
