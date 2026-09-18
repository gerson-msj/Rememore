Adendo Operacional à 05.07 - Convenção PT-BR

Finalidade

Este documento complementa exclusivamente a condução operacional da 05.07 - Registrar e Organizar após a conclusão da intervenção técnica de adoção da convenção PT-BR no código-fonte do Rememore. Ele não altera o corpo aprovado da Especificação, não cria requisito funcional novo e não modifica seu escopo.

A intervenção foi concluída, validada pelo operador e autorizada para reintegração à develop em 15/09/2026. A convenção PT-BR agora integra o contexto permanente do projeto e o AGENTS.md vigente.

Estado após a intervenção

A intervenção partiu de fd1672b (Spec 07 - Parcial). Por decisão explícita do operador, a nacionalização incluiu também o código parcial da 05.07 já existente nessa base. Portanto, a develop resultante da reintegração contém simultaneamente a convenção PT-BR e o trabalho funcional da 05.07 que já havia sido produzido antes da pausa.

A develop integrada passa a ser a base canônica para a retomada. Não tente recompor a 05.07 a partir de uma branch anterior nem reaplicar manualmente a nacionalização sobre o estado antigo. Se existir branch de trabalho anterior à intervenção, ela deve ser tratada apenas como referência histórica até que o operador determine outro uso.

Contexto obrigatório para a retomada

Antes de continuar a implementação da 05.07:

1. use a develop vigente com a intervenção técnica já integrada;
2. leia o AGENTS.md atualizado;
3. consulte .docs/README.md, .docs/memoria-tecnica.md e .docs/referencias/trabalho-local.md para os contratos técnicos atuais;
4. leia a Continuidade operacional da 05.07 já existente no repositório e preserve o plano, os marcos e as validações registradas;
5. considere este adendo como atualização técnica da passagem entre a intervenção e a continuação da Especificação, sem substituir o corpo aprovado da 05.07.

Caso queira consultar a documentação que deu origem à intervenção técnica, ela permanece disponível no repositório em `.docs\intervencao-tecnica.md`. Essa consulta é opcional e não faz parte do contexto obrigatório para retomar a 05.07.

Ponto exato de retomada

O trabalho funcional permanece no ponto anterior à intervenção: as fundações e o marco B estão parcialmente materializados. Edição e confirmação, rascunhos e os demais marcos restantes não foram implementados pela intervenção técnica.

A próxima sessão deve continuar a 05.07 desse ponto, usando os nomes e contratos atuais. Não reinicie a clarificação funcional nem reescreva a Especificação ou seu plano operacional, salvo se a continuação revelar uma lacuna funcional real.

Nomenclatura atual relevante da 05.07

Os principais nomes atualmente materializados são:

- islands/CapturaDia.tsx;
- components/EstruturaCaptura.tsx;
- components/PainelCaptura.tsx;
- app/servicos/captura.ts, com prepararCaptura;
- app/servicos/captura/sessaoAberta.ts, com SessaoCapturaAberta;
- app/servicos/captura/bloqueio.ts, com PosseCaptura e adquirirBloqueioCaptura;
- app/servicos/local/, incluindo BancoLocal, RepositorioCapturasLocais e capturasLocais;
- componentes compartilhados CabecalhoPagina, MensagemPopup e SeletorData.

Serviços ficam em app/servicos/, utilitários em app/utilitarios/ e o utilitário da raiz é utilitarios.ts. O restante do código autoral novo deve continuar seguindo a convenção definida no AGENTS.md: português preferencial, identificadores ASCII e comentários em português natural, preservando nomes exigidos pela stack ou por contratos estáveis.

IndexedDB vigente

O banco continua rememore-local e está no schema 4.

A migração 4, autorizada expressamente pelo operador, remove os stores antigos captures e _health com seus dados e cria capturas e _diagnostico. Esse descarte pertence exclusivamente ao upgrade para o schema 4; não estabelece política geral de limpeza, cache ou TTL e não altera o comportamento histórico das migrações 1 a 3.

No estado atual:

- a chave composta de capturas é [idConta, dataCaptura];
- o índice é porConta;
- a chave técnica de diagnóstico é sonda;
- CapturaLocal usa idConta, dataCaptura, memorias, alterada, origemPreservada, revisaoOrigem, idAreaTrabalho e prazoEdicaoDias;
- memórias usam id, conteudo, ordem, primeiraPreservacaoEm e complementos;
- complementos usam id, conteudo e primeiraPreservacaoEm;
- somente alterada: true representa pendência.

Datas, IDs, ordenação, historicidade e regras de preparação e retomada mantêm seus significados funcionais anteriores.

Fronteira remota e contratos preservados

Os payloads remotos permanecem em inglês. MemoriaPreservada e ComplementoPreservado, em app/servicos/captura/contratos.ts, representam separadamente esses dados remotos. prepararCaptura faz a conversão explícita para os campos locais PT-BR sem alterar valores, ordem ou identidade.

rememoreCaptureMock.set/configure/reset e o formato de seus cenários permanecem compatíveis.

A sessão aberta conserva sua chave de sessionStorage e o campo serializado workspaceId, alimentado pelo idAreaTrabalho local. Cookies, rotas, payloads dos handlers, identidade autenticada, nomes dos locks, códigos de resultado ou erro e demais contratos estáveis preservados pela intervenção não devem ser nacionalizados apenas por conveniência.

Um marcador de sessão anterior ao descarte do schema 4 não restaura materialização removida. Quando necessário, a preparação obtém nova base e registra nova identidade após confirmação local.

Validação já realizada

A intervenção passou pela formatação dos fontes e estilos autorais, lint dos fontes, verificação de tipos, build e 34 testes após o build. Foram validados migração, rollback, persistência em reaberturas, conversão e identidade da sessão. IndexedDB automatizado foi validado em memória, e o operador também navegou pela aplicação, inspecionou os fontes e conferiu o banco no navegador.

A limitação global já conhecida de deno task check para documentos, configurações e terceiros preservados continua existindo e não representa pendência desta intervenção.

Condução daqui em diante

A partir desta retomada, a convenção PT-BR não é mais uma tarefa especial: ela faz parte do modo normal de desenvolvimento da 05.07 e das unidades futuras. Continue usando as checklists e validações progressivas já previstas na Especificação, lembrando o operador do que deve ser testado a cada marco.

Não aproveite a retomada para reorganizar arquitetura, alterar contratos protegidos ou ampliar escopo. Se uma necessidade futura exigir migração de dado persistido, mudança de contrato remoto ou decisão funcional, trate-a pela regra normal do projeto e consulte o operador quando ela ultrapassar uma decisão puramente técnica.

Limite deste adendo

Este adendo registra somente a transição técnica efetivamente ocorrida durante a pausa da 05.07 e fornece o contexto necessário para sua continuação. O corpo aprovado da 05.07 permanece histórico e inalterado. A intervenção técnica também permanece como registro próprio do trabalho transversal que foi realizado.


