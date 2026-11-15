# 05.06 - Seleção e Abertura de Captura

## Estado
Sexta unidade de desenvolvimento da fase 05 - Especificação. O corpo abaixo constitui a instrução aprovada para materializar a Seleção e Abertura de Captura do Rememore. A partir desta aprovação, o corpo permanece como registro histórico imutável da unidade e somente poderá receber Parecer final quando o operador encerrar o desenvolvimento.

## Objetivo
Materializar a entrada funcional de Capturar desde a Principal até a abertura de uma data em `/capturar/{data}`. A unidade torna real a Seleção de data, a orientação progressiva desse contexto, a lista e a exclusão das capturas pendentes, a preparação obrigatória de um workspace da captura no IndexedDB e o indicador real de Capturas pendentes na Principal.

A Captura do dia nasce apenas como casca operacional: recebe e apresenta a data, prepara o workspace local e oferece um controle mock temporário para marcar a captura como alterada. Registrar e organizar, Categorizar e Tom, Revisar e Preservar e a navegação entre essas etapas permanecem fora desta unidade.

## Posição no ciclo de materialização
05.04 - Ambiente Principal já materializou a Principal, o acesso visual ainda mockado a Capturas pendentes e a casca protegida de `/capturar`. 05.05 - Fundação do Trabalho Local já materializou `app/services/local/`, `LocalDatabase`, diagnóstico operacional, schema versionado, `LocalStorageError`, o store `captures`, o store técnico `_health` e `LocalCapturesRepository` com isolamento por conta e data.

Esta unidade consome essas bases e faz a primeira integração funcional real do trabalho local com páginas do produto. Depois dela, a próxima unidade prevista é Registrar e organizar sobre a Captura do dia já aberta e preparada.

## Rastreabilidade histórica — não operacional
Esta unidade deriva historicamente de **02.05 - Modelo de Trabalho e Continuidade**, **03.04 - Orientar-se pelo ambiente principal**, **03.05 - Capturar**, **04.06 - Especificação Funcional - Capturar**, **04.07 - Regras - Capturar**, **04.08 - Componentes - Capturar**, **05.04 - Ambiente Principal** e **05.05 - Fundação do Trabalho Local**.

Essas referências existem apenas para rastreabilidade documental e não constituem leitura, conhecimento prévio nem dependência para o programador. Todo o contexto necessário à implementação está contido nesta especificação.

## Mudança consolidada no modelo local
A existência de um registro de captura no IndexedDB não significa mais, por si só, que exista uma captura pendente.

O IndexedDB passa a ser também o workspace operacional obrigatório da Captura do dia. Toda Captura aberta deve trabalhar sobre um registro local, mesmo quando o usuário ainda não alterou nada.

O registro local precisa distinguir conceitualmente dois estados:

- workspace não alterado: cópia de trabalho reconstruível, não é pendência;
- workspace alterado: contém trabalho ainda não preservado e é uma captura pendente.

A representação técnica dessa distinção — flag, estado enumerado ou equivalente — fica a critério do programador. O requisito é que existir localmente e estar pendente sejam condições diferentes e consultáveis de forma inequívoca.

Workspaces não alterados podem ser eliminados silenciosamente em ponto seguro, porque são reconstruíveis a partir do servidor ou como captura vazia. Eles não podem aparecer na lista de pendências nem manter a prioridade protetiva reservada a trabalho alterado. Workspaces alterados não podem ser removidos por limpeza automática.

## Principal — Capturas pendentes reais
A região `Capturas pendentes` já materializada na Principal deixa de utilizar o estado mockado de pendência.

Ao compor ou atualizar a Principal, o front consulta o armazenamento local da conta autenticada e verifica se existe ao menos um workspace de captura marcado como alterado. Havendo um ou mais, o bloco `Capturas pendentes` é apresentado. Não havendo nenhum, o bloco não é apresentado.

A consulta é exclusivamente local. O backend não participa da descoberta de pendências.

O bloco mantém a apresentação já materializada em 05.04 e continua sem contador. O bloco inteiro é acionável e conduz diretamente à Seleção em `/capturar`.

Falha ao consultar o armazenamento local não pode ser convertida em `nenhuma pendência`. Se a Principal não conseguir determinar o estado, deve informar de forma concisa que não foi possível verificar as capturas pendentes neste dispositivo. A política definitiva de recuperação ou recriação do banco continua fora desta unidade.

## Seleção — `/capturar`
A casca existente de `/capturar` passa a ser a Seleção funcional de Capturar.

A página preserva a fronteira autenticada e o cabeçalho já utilizados no projeto. Sua responsabilidade é permitir escolher uma data válida ou abrir uma captura pendente existente.

A data inicial é a data atual.

A página contém, nesta ordem funcional:

- orientação progressiva quando houver mensagem aplicável;
- CMP-003 — Seletor de Data;
- ação `Capturar`;
- lista de capturas pendentes, somente quando existirem.

Não deve ser criado contador de pendências, paginação ou estado vazio substitutivo. Se não existirem pendências, a região da lista simplesmente não é apresentada.

## CMP-003 — Seletor de Data
O seletor opera em data completa e deve permitir somente datas existentes, presentes ou passadas. Datas futuras são inválidas. A ação `Capturar` somente fica disponível enquanto houver uma data completa e válida.

A restrição deve existir tanto na experiência do seletor quanto na validação funcional. Não é suficiente depender apenas da interface do navegador, porque `/capturar/{data}` também pode ser acessada diretamente.

O componente deve possuir apresentação integrada ao Rememore e pode utilizar `input type="date"` como base semântica e operacional. O ícone de calendário deve poder acionar o seletor nativo quando o ambiente oferecer essa capacidade, sem sacrificar fallback ou operação normal do campo.

### Referência de intenção fornecida pelo autor — não prescritiva
O exemplo abaixo existe apenas para comunicar a intenção. O programador pode e deve melhorar estrutura, tipagem, acessibilidade, compatibilidade, classes e fallback conforme a base real do projeto.

```tsx
import { InputHTMLAttributes } from "preact"
import { useRef } from "preact/hooks"

type InputTextType = InputHTMLAttributes<HTMLInputElement> & { label: string }

export default function InputDate({ label, ...inputHtmlAttributes }: InputTextType) {
    const dtRef = useRef<HTMLInputElement>(null)

    return (
        <div class="field">
            {label !== "" && <label class="label">{label}</label>}
            <div class="control has-icons-right">
                <input
                    type="date"
                    {...inputHtmlAttributes}
                    ref={dtRef}
                />
                <span class="icon is-small is-right is-clickable" onClick={() => dtRef.current?.showPicker()}>
                    <i class="fas fa-calendar"></i>
                </span>
            </div>
        </div>
    )
}
```

```css
.is-placeholder {
    color: var(--bulma-input-placeholder-color) !important;
}

input[type="date"]::-webkit-calendar-picker-indicator {
    display: none;
}
```

O código e o CSS acima não constituem requisitos literais. O resultado funcional e visual é o requisito.

## Orientação Progressiva na Seleção
A Seleção solicita ao CMP-005 uma orientação por meio de uma identidade estável de contexto. Essa identidade não pode ser o próprio texto da mensagem. Pode ser enumeração, código, chave ou estrutura equivalente; a nomenclatura técnica fica a critério do programador.

Conceitualmente, a chamada informa `qual contexto de orientação está sendo solicitado`. O CMP-005 resolve o nível atual do usuário, seleciona a mensagem correspondente e devolve a orientação. A página de Seleção é responsável por apresentar o conteúdo devolvido.

Nesta unidade o nível do usuário permanece mockado. Não deve ser criado cálculo, persistência, painel de configuração ou estrutura definitiva de evolução. O mock pode ser alterado diretamente pelo programador para os cenários de validação.

Mensagens deste contexto:

- iniciante: `Você pode capturar qualquer dia até hoje. Escolha uma data para começar.`
- intermediário: `Você pode voltar a qualquer data passada quando quiser registrar algo que ainda lembra.`
- avançado: nenhuma mensagem neste momento.

O CMP-005 deve ser reutilizável por futuros contextos sem espalhar pelas páginas a lógica que decide o nível do usuário.

## Lista de capturas pendentes
A lista consulta o armazenamento local somente para a conta autenticada e apresenta exclusivamente workspaces marcados como alterados.

Cada item apresenta a data como ação de abertura e, ao lado, um ícone discreto de exclusão. O ícone deve possuir significado acessível inequívoco; a escolha visual fina fica a critério do programador.

Selecionar a data abre `/capturar/{data}`.

Acionar exclusão nunca remove imediatamente. Deve utilizar a confirmação já existente no projeto.

Quando a captura pendente não tiver origem em conteúdo previamente preservado:

- título: `Apagar as memórias de {data}?`
- mensagem: `As memórias desta captura ainda não foram preservadas e serão removidas.`
- ações: `Apagar` / `Cancelar`.

Quando a captura pendente tiver sido criada a partir de conteúdo previamente preservado:

- título: `Apagar as alterações de {data}?`
- mensagem: `As alterações ainda não preservadas serão removidas. As memórias já preservadas desse dia serão mantidas.`
- ações: `Apagar` / `Cancelar`.

Cancelar não altera o workspace. Confirmar remove o workspace local pendente inteiro e não altera o acervo preservado. Se a remoção falhar, a pendência permanece e a página informa que não foi possível apagar as alterações.

A captura local precisa, portanto, conservar informação suficiente para distinguir se sua origem possuía ou não conteúdo preservado. A forma concreta desse metadado fica a critério do programador. Se o contrato remoto já fornecer identificador ou versão de origem útil a uma futura detecção de conflito, essa informação pode ser preservada junto ao workspace em vez de ser descartada; não é necessário definir agora o mecanismo definitivo de versionamento remoto.

Se a consulta das pendências falhar, a página não apresenta lista vazia como se a consulta tivesse funcionado. Deve informar que não foi possível verificar as capturas pendentes neste dispositivo e pode oferecer nova tentativa.

## Abertura — `/capturar/{data}`
A rota é protegida pela sessão autenticada e deve validar a data recebida antes de iniciar qualquer workspace. Data incompleta, inexistente no calendário ou futura não abre a captura e deve conduzir o usuário de volta à Seleção com informação de data inválida.

Antes de abrir a Captura do dia, a página utiliza o diagnóstico operacional materializado em 05.05. A mera existência da API IndexedDB não é suficiente.

Quando o navegador não oferecer suporte ao armazenamento local necessário, apresentar a mensagem:

`Não é possível iniciar uma captura neste navegador. O Rememore precisa do armazenamento local do navegador para proteger suas memórias enquanto você trabalha. Tente utilizar uma versão atualizada de um navegador compatível.`

Quando o recurso existir, mas não puder ser acessado, apresentar:

`Não foi possível acessar o armazenamento local. O Rememore precisa desse recurso para proteger suas memórias enquanto você trabalha. Verifique as configurações de privacidade do navegador ou tente novamente em uma janela de navegação normal.`

A captura não deve prosseguir sobre estado desconhecido ou desprotegido. Depois de informar a falha, o usuário deve possuir retorno seguro à Principal. A política de reparar, migrar, recriar ou recuperar banco inconsistente permanece para revisão futura da Principal.

## Preparação obrigatória do workspace
Com armazenamento local operacional, a Captura do dia trabalha sempre sobre IndexedDB. Não deve existir uma implementação paralela em que conteúdo recém-carregado opere apenas em estado volátil e conteúdo pendente opere em IndexedDB.

A sequência funcional é:

1. procurar um workspace local da conta e data;
2. se existir workspace alterado, retomá-lo como fonte protegida do trabalho;
3. se existir workspace não alterado utilizável, ele pode servir como workspace atual, sabendo que continua reconstruível e não é pendência;
4. se não existir workspace local utilizável, consultar o servidor para a conta e data;
5. se o servidor devolver conteúdo preservado, materializá-lo no IndexedDB como workspace não alterado;
6. se o servidor confirmar inequivocamente que não há conteúdo preservado para a data, materializar no IndexedDB um workspace vazio e não alterado;
7. considerar a Captura do dia aberta somente depois que o workspace local necessário estiver confirmado.

Falha de leitura local não equivale a `não existe local`. Falha remota ou resposta inconclusiva não equivale a `não existe conteúdo preservado`. Nesses casos a abertura é interrompida e a interface informa a falha.

A consulta ao servidor nesta fase usa a fronteira de serviço/mock disponível no front; implementar backend real está fora de escopo. O contrato precisa permitir distinguir pelo menos `conteúdo encontrado`, `conteúdo inexistente` e `falha ou resultado inconclusivo`.

## Workspace não alterado e limpeza
Criar ou carregar o workspace local não o torna pendente.

Workspaces não alterados são residuais reconstruíveis. Podem ser eliminados silenciosamente quando o usuário sai da Captura, retorna à Seleção ou em outro ponto seguro escolhido pela implementação. Não é necessário criar nesta unidade uma política sofisticada de cache.

O comportamento obrigatório é:

- nunca listar workspace não alterado como pendência;
- nunca fazer a Principal anunciar pendência por sua simples existência;
- nunca impedir sua substituição ou reconstrução futura por conteúdo remoto mais recente;
- nunca eliminar automaticamente workspace alterado.

## Casca da Captura do dia
Nesta unidade `/capturar/{data}` não recebe ainda Registrar e organizar, Categorizar e Tom, Revisar, tabs ou apresentação funcional das memórias.

A página deve apenas nascer como casca real da Captura do dia, apresentar de forma clara a data recebida e estar sustentada pelo workspace preparado no IndexedDB.

A ação de retorno contextual da Captura do dia conduz à Seleção em `/capturar`. A fronteira de autenticação e a ação global de saída continuam seguindo os componentes já existentes.

Mesmo quando o workspace contiver memórias vindas do servidor ou de uma pendência, sua apresentação e edição ficam para as próximas unidades.

## Controle mock temporário de alteração
A casca da Captura do dia deve possuir um botão mock simples e claramente temporário para marcar o workspace atual como alterado. Um rótulo como `Marcar como alterada` ou equivalente é suficiente.

Esse controle não cria, edita, exclui nem reordena memórias. Sua única função é alterar o estado do workspace para `alterado`, permitindo testar a infraestrutura de pendências antes de Registrar e organizar existir.

Depois de confirmação local bem-sucedida, o workspace passa imediatamente a ser captura pendente. A partir desse momento:

- a Principal deve apresentar `Capturas pendentes`;
- a Seleção deve listar a data;
- a data pode ser reaberta pela lista;
- a pendência pode ser excluída pela ação de exclusão e sua confirmação.

Acionar o mock sobre um workspace já alterado não deve produzir uma segunda pendência nem duplicar registros.

O botão é andaime funcional de desenvolvimento e deverá ser removido quando uma operação real de Capturar puder produzir a primeira alteração.

## Evolução do repositório local
O primeiro domínio criado em 05.05 deve evoluir apenas o necessário para sustentar esta unidade. O programador pode adaptar o modelo e o `LocalCapturesRepository` para representar o estado alterado, origem preservada e operações necessárias à preparação, listagem de pendências, marcação temporária e descarte.

A escolha entre filtrar pelo índice já existente, acrescentar índice, criar métodos de domínio ou outra solução coerente é técnica. A arquitetura deve continuar respeitando isolamento por conta, transações confirmadas somente após commit e distinção entre ausência legítima e falha.

Como o projeto ainda está antes da V1, não existe obrigação de preservar dados experimentais de IndexedDB já criados durante o desenvolvimento se a evolução do schema exigir reset ou migração destrutiva. A arquitetura de migrações criada em 05.05 deve continuar intacta e extensível.

## Falhas que não podem virar resultados funcionais
Nesta unidade permanecem obrigatórias as distinções:

- falha ao listar pendências não é lista vazia;
- falha ao procurar workspace local não é workspace ausente;
- falha ao consultar servidor não é data sem conteúdo preservado;
- falha ao criar workspace local não é captura aberta;
- falha ao marcar alterado não é pendência criada;
- falha ao excluir não é pendência removida.

A interface só avança quando o estado necessário tiver sido efetivamente confirmado.

## Validação de desenvolvimento
Testes automatizados ou outros andaimes técnicos podem ser usados temporariamente e removidos ao final. Não existe objetivo de criar cobertura permanente.

A implementação deve permitir validar, no mínimo:

- Seleção inicia com a data atual;
- data futura não pode ser capturada;
- acesso direto com data inválida ou futura não abre workspace;
- orientação iniciante apresenta a mensagem iniciante;
- orientação intermediária apresenta a mensagem intermediária;
- orientação avançada não apresenta mensagem;
- nenhuma pendência produz nenhuma lista nem estado vazio;
- várias pendências da mesma conta aparecem pelas respectivas datas;
- workspaces de outra conta não aparecem;
- ícone de exclusão exige confirmação;
- cancelar exclusão mantém a pendência;
- confirmar exclusão remove somente o workspace local pendente;
- falha de exclusão mantém a pendência;
- falha de consulta de pendências não é apresentada como ausência;
- abertura com pendência local retoma o workspace alterado;
- abertura sem local e com conteúdo remoto materializa workspace local não alterado;
- abertura sem local e com ausência remota confirmada materializa workspace vazio não alterado;
- falha remota não cria workspace vazio;
- workspace não alterado não aparece como pendência;
- botão mock transforma o workspace em pendência sem duplicá-lo;
- depois do mock, Principal apresenta `Capturas pendentes` de forma real;
- clicar em `Capturas pendentes` na Principal conduz a `/capturar`;
- depois da exclusão da última pendência, o indicador da Principal deixa de ser apresentado;
- falha local durante abertura impede a tela de operar como se o workspace estivesse protegido.

Não deve ser criado painel, seletor de cenários ou interface administrativa para controlar mocks.

## Fora de escopo
Não fazem parte desta unidade Registrar e organizar; criação, edição, exclusão ou reordenação real de memórias; historicidade e complementos; Categorizar; Tom; balanço sentimental; Revisar e Preservar; tabs das três etapas; preservação no servidor; resolução de conflitos remotos; concorrência de edição entre abas; backend real; cálculo ou persistência definitiva do nível do usuário; administração das mensagens progressivas; política definitiva de corrupção, reparo ou recriação do IndexedDB; criptografia; ou stores de outras jornadas.

Também não devem ser introduzidos dados funcionais especulativos de categorias, Tom ou demais etapas apenas para preparar código futuro.

## Critérios de conclusão
A unidade está concluída quando `/capturar` funcionar como Seleção real; o CMP-003 respeitar data atual ou passada; a Orientação Progressiva resolver mensagens por contexto com nível mockado; somente workspaces alterados aparecerem como pendências; exclusão funcionar com confirmação e sem tocar o acervo preservado; `/capturar/{data}` validar a data, verificar armazenamento operacional e terminar sua abertura somente com um workspace confirmado no IndexedDB; conteúdo remoto encontrado ou ausência remota confirmada forem materializados localmente sem criar pendência; o botão mock puder transformar o workspace em pendência; a Principal passar a refletir pendências reais do IndexedDB; e todo esse ciclo puder ser validado sem implementar ainda as operações reais de captura.

## Continuidade

### Sessão de 13/09/2026

- Leitura inicial concluída; única alteração preexistente: este arquivo ainda não versionado.
- Clarificação: datas apresentadas em DD/MM/AAAA; pendências em ordem da mais antiga para a mais recente. Data atual pelo calendário local do navegador.
- Operador autorizou definir os textos não fornecidos literalmente. No Parecer final, informar explicitamente que o analista não enviou essas mensagens e o programador as definiu.
- Identidade da conta: contrato de sessão fornecerá identificador opaco; mock usará ULID fixo. Nenhum gerador de identidades ou backend real será criado.
- Contexto antes das leituras: indisponível. Após leitura inicial: 17% usado, informado pelo operador; capacidade total não informada. Limites de uso informados no início: janela de 5h em 65% e semanal em 95% (não são indicadores de contexto).
- Plano: (1) evoluir contrato local, identidade e preparação do workspace, com verificação técnica; (2) construir Seleção, seletor e orientação, apresentando para validação visual do operador; (3) integrar Captura do dia e Principal e validar o ciclo de pendências; (4) atualizar referências técnicas e aguardar encerramento pelo operador.
- Etapas 1 e 2 implementadas: contratos de identidade/origem/alteração, preparação substituível, CMP-003, CMP-005 e Seleção com consulta e exclusão confirmada. Schema 2 limpa capturas experimentais antigas, conforme autorização do corpo aprovado. Workspaces intactos são reconstruídos a cada abertura, sem limpeza automática dos alterados.
- Verificação técnica: build, tipos e sete testes aprovados (datas, workspace com IndexedDB simulado, identidade, sessão e HTTP das rotas autenticadas). Testes de workspace usam fake-indexeddb 6.2.4 já instalado; não representam validação das permissões e persistência do navegador real.
- Operador aprovou o seletor ajustado e autorizou continuidade. Orientação inicial permanece iniciante.
- Etapa 3 implementada: `/capturar/{data}` protegida, validação da data, diagnóstico obrigatório, preparação confirmada e controle temporário de alteração. A Principal recebe identidade da sessão e consulta pendências reais; removido o mock anterior de pendências.
- Datas incompletas/inexistentes são rejeitadas pelo servidor; a validação contra hoje ocorre no navegador antes de qualquer operação local, respeitando seu calendário civil. Workspaces intactos permanecem reconstruíveis e são substituídos na próxima abertura; não foi criada limpeza automática.
- Etapa concluída: integração verificada e funcionamento aprovado pelo operador; referências técnicas atualizadas.
- Verificação da integração: build, tipos e lint aprovados; nove testes passaram, incluindo contratos locais, falhas simuladas de consulta/escrita/exclusão, rota dinâmica protegida, calendário inválido e regressão de autenticação. Validação visual/funcional no navegador e cenários alternativos de orientação/conteúdo remoto seguem sob avaliação do operador; não foram declarados aprovados automaticamente.
- Operador aprovou o funcionamento implementado. Decidiu manter workspaces não alterados no IndexedDB, mesmo sem reaproveitamento atual, evitando introduzir limpeza que seria retirada posteriormente. No Parecer final, informar que esses registros hoje são residuais e reconstruídos na reabertura; a intenção é analisar e definir seu reaproveitamento como cache na próxima especificação, incluindo eventual validação de igualdade/versão com o servidor. Cache ainda não implementado.
- Escopo complementar autorizado e concluído: rastrear diagnósticos de tipos em componentes, islands e rotas, inclusive anteriores à unidade, preservando o comportamento funcional aprovado.
- Diagnóstico inicial: `deno check` completo passou em todos os arquivos. Configuração local habilita Deno; log do servidor de linguagem confirma Deno 2.9.6 e reconhecimento do deno.json deste projeto. Os erros de propriedades relatados ainda não foram reproduzidos; solicitados exemplos do painel Problems com arquivo/mensagem/origem. Nenhuma definição de tipo foi alterada sem diagnóstico confirmado.
- Exemplo recebido: CaptureLayout.tsx, owner typescript/source ts, código 2875, procura indevida de react/jsx-runtime. O projeto configura jsxImportSource preact no deno.json. Esse diagnóstico vem do serviço TypeScript nativo do editor, que deveria ser desativado para estes arquivos pela extensão Deno. Documentação oficial recomenda reiniciar o VS Code quando deno.enable está ativo e os diagnósticos nativos persistem. Solicitado recarregamento da janela antes de modificar configurações ou tipos; resolução visual ainda não confirmada.
- Diagnósticos adicionais do editor: códigos TypeScript 2875 e 7026 eram provenientes do serviço nativo do VS Code, sem a configuração JSX do Deno/Preact. Após orientação de recarregar a janela, o operador confirmou que estava tudo certo; não foram necessárias alterações de tipos ou instalação de React.
- Encerramento solicitado pelo operador. Plano concluído e Parecer final entregue no próprio arquivo para transporte pelo operador ao analista e ao registro canônico; Drive não acessado nem atualizado.
- Indicadores finais informados pelo operador: contexto 37% utilizado, capacidade total não informada; uso semanal 86% restante. Uso final de 5h não informado por decisão do operador, pois se recupera. Limites de uso não são indicadores de contexto.
- Retorno visual do operador: eliminar calendário duplicado e botão isolado; usar um ícone integrado ao campo e texto na cor de placeholder para data incompleta ou inválida. Ajuste implementado com fallback nativo quando showPicker não estiver disponível ou falhar. Referência TSX/CSS posteriormente fornecida na conversa. Ajuste aprovado pelo operador.

## Parecer final

Especificação 06 — Seleção e Abertura de Captura encerrada por determinação do operador, com funcionamento e ajuste visual do seletor aprovados.

Foram materializados `/capturar` como Seleção funcional, CMP-003 em `DateSelector`, CMP-005 em `guidance`, `/capturar/{data}` como casca protegida da Captura do dia e pendências reais na Principal. A abertura exige diagnóstico operacional e workspace confirmado no IndexedDB. Somente registros alterados são pendências; a retomada os prioriza sem consulta remota. A exclusão exige confirmação, distingue origem com ou sem conteúdo preservado e remove apenas o workspace local. Falhas não são tratadas como ausência ou sucesso. O botão temporário `Marcar como alterada` não manipula memórias e deverá ser retirado quando uma operação real produzir a primeira alteração.

Decisões e consequências para reconciliação pelo analista:

- **Datas e seletor:** pendências ordenadas da mais antiga para a mais recente, por decisão do operador; datas da lista e da casca em DD/MM/AAAA. O campo usa apresentação nativa do navegador, um único ícone integrado e cor de placeholder enquanto incompleto ou inválido. A data atual segue o calendário local do navegador; o servidor rejeita calendário inválido, e o navegador também rejeita datas futuras antes de acessar o armazenamento.
- **Conta e modelo local:** a sessão passou a fornecer identidade opaca da conta, representada no mock por ULID fixo. O workspace distingue alteração e origem preservada; conta/data continuam isolando os registros. A migração para schema 2 elimina capturas experimentais do schema anterior, conforme autorização pré-V1; isso não constitui uma política de limpeza de trabalho alterado no modelo atual.
- **Registros intactos mantidos, cache ainda ausente:** por decisão expressa do operador, não foi implementada remoção ao sair. Abrir várias datas pode acumular registros não alterados. Hoje eles são residuais sem benefício de cache: a reabertura consulta novamente o serviço remoto e, havendo resposta conclusiva, reconstrói a cópia local. Não geram pendências. O operador solicitou que a próxima especificação analise e defina seu reaproveitamento como cache, evitando implementar agora uma limpeza que depois seria retirada. Uma possibilidade discutida é validar versão/igualdade com o servidor e reutilizar a cópia quando atual, dispensando retransmissão das memórias. Esse contrato, a forma de comparação e a política de limite/expiração ainda precisam ser definidos; nada disso foi implementado ou aprovado como solução definitiva. Trabalho alterado mantém prioridade de retomada e não pode ser descartado automaticamente.
- **Mensagens definidas pelo programador:** o analista não enviou a redação literal de todas as mensagens necessárias. Com autorização do operador, o programador definiu os textos abaixo, que devem ser incorporados ou reconciliados na documentação funcional. As mensagens de orientação, diagnóstico do armazenamento e confirmação de exclusão fornecidas na especificação foram preservadas.

| Situação | Texto implementado |
| --- | --- |
| Data inválida | Data inválida. Escolha uma data completa, existente e até hoje. |
| Falha ao consultar pendências, na Seleção ou Principal | Não foi possível verificar as capturas pendentes neste dispositivo. |
| Falha de exclusão | Não foi possível apagar as alterações. Tente novamente. |
| Falha de preparação, incluindo leitura local, consulta remota ou gravação do workspace | Não foi possível preparar esta captura. O trabalho não foi aberto. Volte e tente novamente. |
| Falha ao marcar alteração | Não foi possível marcar a captura como alterada. Tente novamente. |
| Abertura em andamento | Preparando captura… |
| Estado da casca | Captura sem alterações. / Captura com alterações pendentes. |
| Identificação do andaime e retorno após falha | Controle temporário de desenvolvimento / Voltar à Principal |

O cenário final mantém orientação iniciante e serviço remoto mockado com ausência de conteúdo preservado. O contrato remoto distingue conteúdo encontrado, ausência e falha; não há backend real. Apresentação/edição de memórias, demais etapas de Capturar, preservação, conflitos, evolução real do nível do usuário e recuperação definitiva do banco continuam fora desta entrega.

Build, verificações de tipos/lint dos arquivos trabalhados e nove testes de contratos locais, falhas e rotas passaram; a checagem completa `deno check` também passou. O operador aprovou o funcionamento apresentado. Os diagnósticos posteriores de JSX no editor foram resolvidos sem alteração de contratos funcionais ou inclusão de tipos do React. Não se afirma validação exaustiva de navegadores, permissões ou de todos os cenários alternativos de mock.

Parecer entregue ao operador para encaminhamento ao analista e ao Google Doc canônico. O corpo aprovado foi preservado; não houve atualização do Drive.

