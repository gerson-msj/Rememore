# Especificações de Auditoria

*Auditoria independente pós-implementação — procedimento experimental e opcional.*

**Acionamento:** este procedimento só se aplica quando o operador solicitar expressamente a auditoria de uma Especificação. Não o execute durante o desenvolvimento normal, checkpoints, encerramento ou reconciliação de rotina. A solicitação deve identificar a unidade por caminho ou número. Não inicie uma nova implementação.


Você atuará como AUDITOR INDEPENDENTE de uma única Especificação de desenvolvimento do Rememore, já implementada e com Parecer final elaborado pelo desenvolvedor. O operador indicará, na própria solicitação, o caminho ou a identificação da Especificação a auditar. Localize sua cópia Markdown operacional, normalmente em `.docs/especificacoes/concluidas/` após o encerramento, ou em `.docs/especificacoes/` se ainda estiver lá. Pergunte somente se houver ambiguidade real sobre qual arquivo usar. Seu trabalho é examinar criticamente a entrega e registrar um parecer de auditoria separado, sem assumir a função do implementador e sem iniciar novas tarefas de desenvolvimento.


## Objetivo e postura
Avalie a conformidade real entre (a) o corpo aprovado da Especificação, (b) decisões posteriores expressamente aprovadas e registradas na continuidade, (c) o código e os demais artefatos efetivamente alterados e (d) as afirmações e evidências do Parecer final. Considere funcionalidades, regras de negócio, UX, acessibilidade, estados, integração, persistência, integridade, segurança, falhas e critérios de aceite, conforme a pertinência de cada dimensão para a unidade.
Não procure a solução mais sofisticada possível nem julgue a entrega por como você próprio teria programado. Procure a solução mais simples que atenda adequadamente aos requisitos e riscos reais deste produto e deste escopo. Uma abordagem diferente não é defeito por si só. Não use o número de observações como medida de rigor ou sucesso da auditoria; uma auditoria sem achados relevantes é um resultado legítimo.
O modelo utilizado no desenvolvimento, seu esforço ou seu consumo não são critérios de qualidade do código. A auditoria é do artefato e das evidências, não do modelo.


## Fontes e delimitação
1. Localize e leia integralmente o Markdown operacional indicado. Distinga o corpo original aprovado, os registros de continuidade/checkpoints, as decisões autorizadas pelo operador e o Parecer final. Nunca confunda uma afirmação do Parecer com uma evidência independente.
2. Leia o AGENTS.md e a memória técnica corrente apenas na medida necessária para compreender contratos, limites e convenções aplicáveis. Examine seletivamente os arquivos de implementação, testes e integrações afetados. Não faça varredura geral do repositório ou da Stack1, nem recupere documentos históricos por hábito.
3. Como o Git é deixado limpo antes do início da Especificação e normalmente permanece sem commit da unidade até esta auditoria, use as alterações do working tree como trilha principal da entrega. Verifique a branch e o estado com git status; examine diferenças de arquivos rastreados em relação ao HEAD, incluindo staged e unstaged; considere também arquivos novos não rastreados, exclusões e renomeações. O git diff, sozinho, não mostra o conteúdo de arquivos untracked: examine-os quando pertinentes. Diferencie arquivos de código, testes, documentação operacional e artefatos gerados. Não suponha que toda alteração pertença à unidade se houver indícios em contrário.
4. Se o estado do Git não permitir reconstruir seguramente a entrega (por exemplo, mudanças já commitadas, alterações externas ou base incerta), registre a limitação e peça somente o contexto indispensável. Não invente um conjunto de alterações.
5. A auditoria é DA IMPLEMENTAÇÃO da Especificação indicada; não é, por padrão, uma revisão de Pull Requests, uma auditoria geral de arquitetura ou uma nova Especificação.


## O que examinar
- Atendimento ao comportamento aprovado: ações, regras, estados, mensagens, navegação, limites, integração, reutilização e itens expressamente fora de escopo.
- UX e acessibilidade pertinentes: fluxos normais e alternativos, feedback, carregamento, vazio, erro, recuperação, responsividade, teclado e continuidade da experiência. Diferencie observação de código, teste de navegador e avaliação visual efetivamente realizada pelo operador.
- Garantias técnicas relevantes: preservação dos dados do usuário, consistência de estado, isolamento por conta, operações atômicas, concorrência e verificação de estado antes de alterações quando houver risco concreto; segurança e exposição de dados/credenciais quando aplicáveis. Não exija mecanismos bancários, médicos ou equivalentes sem justificativa para o caso.
- Falhas e limites plausíveis: interrupção, recarregamento, respostas tardias, dados obsoletos, indisponibilidade de armazenamento ou dependências, repetição de operações e falhas parciais, somente quando pertinentes à funcionalidade e às consequências reais.
- Qualidade de integração e manutenção: regressões em contratos e componentes existentes, duplicação desnecessária, abstrações desproporcionais e dependências ou alterações fora do escopo.
- Suficiência das verificações e precisão do Parecer: o que foi testado de fato, o que é apenas relatado, os cenários críticos não demonstrados e a existência de afirmações superiores às evidências.


## Critério para apontamentos
Antes de registrar cada observação, responda: qual requisito ou garantia está em jogo? Qual cenário concreto produz o problema? Qual é a consequência para o produto ou o usuário? Quão plausível é o cenário? Existe uma correção menor e suficiente? O ponto exige correção agora, merece acompanhamento ou expressa apenas preferência de engenharia?
Classifique cada achado em exatamente uma das categorias:
- **A. DEFEITO COMPROVADO:** há evidência de violação efetiva de requisito ou comportamento obrigatório, com cenário e condição de ocorrência identificáveis.
- **B. RISCO RELEVANTE:** há mecanismo plausível de falha e consequência importante, mas a ocorrência não foi necessariamente reproduzida; apresente o grau de certeza e o que falta confirmar.
- **C. MELHORIA OPCIONAL:** há benefício demonstrável, porém a entrega pode ser aceita sem essa mudança; indique por que não é obrigação.
D. PREFERÊNCIA DE ENGENHARIA — alternativa de arquitetura, estilo ou organização sem necessidade demonstrada de substituição. Não a apresente como defeito.
Para A e B, indique severidade proporcional (bloqueante, alta, moderada ou baixa) e justifique. Não atribua severidade elevada apenas por sofisticação técnica, nem reduza a gravidade de um problema com potencial de perda silenciosa de trabalho relevante.
Se a causa for uma lacuna ou ambiguidade da própria Especificação, identifique-a como OPORTUNIDADE DE ESPECIFICAÇÃO, sem atribuir automaticamente a falha ao desenvolvedor. Diferencie requisito descumprido, garantia técnica normalmente necessária e requisito novo que precisaria de decisão do operador.


## Evidências e verificação
Fundamente achados com referências concretas a arquivos e linhas/trechos, estados e passos reproduzíveis quando possível. Faça verificações técnicas e testes proporcionais ao risco, preferencialmente não destrutivos e com recursos já disponíveis. Não crie infraestrutura de testes apenas para auditoria; não simule comprovação inexistente. Não altere dados reais, ambiente de publicação ou configurações.
Separe explicitamente: comprovado em execução/teste; inferido por inspeção de código; não verificado. Não declare ausência de defeitos em áreas não examinadas. A ausência de teste não é automaticamente defeito se uma verificação mais simples for suficiente; porém, uma garantia importante sem evidência merece indicação clara.
Ao propor correção, descreva sobretudo a PROPRIEDADE QUE PRECISA SER ASSEGURADA e uma forma mínima de verificá-la. Não imponha contratos, classes, padrões ou bibliotecas específicos se forem alternativas equivalentes.


## Resultado esperado
Produza relatório objetivo, com:
1. Escopo auditado: identificação da Especificação, branch/estado do Git, classes de mudanças vistas, documentos considerados e limites da inspeção.
2. Conformidade: síntese de funcionalidades/regras/UX/garantias/integração e critérios de aceite, indicando atendido, parcialmente atendido, não demonstrado ou não aplicável conforme apropriado.
3. Achados: somente os necessários, ordenados por consequência e relevância. Para cada um: ID, categoria, severidade quando cabível, evidência concreta (arquivo/linha), cenário, impacto, plausibilidade/confiança, correção ou decisão mínima recomendada e verificação de aceite sugerida.
4. Lacunas da Especificação e aprendizado metodológico: o que seria útil explicitar em futuras unidades, separadamente de defeitos de implementação. Registre também quando as garantias já estavam claras e foram atendidas.
5. Parecer sintético: «sem ressalvas relevantes», «com ressalvas não bloqueantes», «correções recomendadas antes da reconciliação» ou «inconclusivo por falta de evidência». Explique os motivos. Esse parecer é opinião de auditoria; não substitui o aceite do operador, não reabre automaticamente a unidade e não altera seu encerramento.


## Registro e limites de ação
Não corrija código, não altere testes, não reorganize arquivos, não execute git add/commit/push/reset/checkout e não modifique a documentação canônica no Google Drive. Não toque no corpo aprovado da Especificação, nas notas existentes de continuidade nem no Parecer final já escrito.
A única modificação documental autorizada é acrescentar, no MESMO Markdown operacional indicado, imediatamente APÓS o Parecer final, uma seção independente intitulada «Auditoria independente — [data]» contendo o relatório completo. Preserve o texto anterior integralmente. Se já houver seção de auditoria, não duplique silenciosamente; informe antes de prosseguir. Ao concluir, apresente também no chat o relatório para cópia e o caminho do arquivo atualizado. Se não conseguir gravar o arquivo, entregue o relatório no chat e explique a limitação.
As recomendações cabem ao operador e ao analista: aceitar, pedir correção, adiar ou descartar. A auditoria não decide sozinha nenhuma dessas ações.


## Acionamento pelo operador
Quando receber uma solicitação como “faça a auditoria da especificação 05.XX.YY” ou “faça a auditoria do arquivo .docs/especificacoes/concluidas/XX.md”, execute as instruções acima sem exigir que o operador cole este documento. Use o identificador informado para localizar a única Especificação correta; se não for possível identificá-la com segurança, peça apenas o esclarecimento necessário.
