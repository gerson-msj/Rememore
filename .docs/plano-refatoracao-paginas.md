# Campanha temporária — Refatoração visual das páginas Stack2

**Estado:** preparada, sem piloto iniciado. **Branch:** develop. **Operador:** responsável pela autorização da unidade, validação final e commits das páginas. **Programador:** Codex. **Marco inicial:** componentes da Stack2 concluídos e validados em /lab até CMP-012 (25/10/2026). **Marco final:** todas as páginas existentes no escopo abaixo aprovadas, regressão global aprovada, legados sem consumidores eliminados, adendos registrados e encerramento autorizado pelo operador.

Este é o **macroplano operacional temporário**, a ser lido junto com /AGENTS.md e .docs/README.md. Ele substitui, apenas durante esta campanha, o procedimento normal de criar novas especificações: **não criar novas especificações para as páginas existentes e não voltar ao analista entre unidades**. As especificações originais já aprovadas e seus Pareceres continuam sendo a fonte funcional obrigatória. Não editar seus corpos nem Pareceres antigos.

## 1. Resultado e fronteira

Refatorar **somente a camada de apresentação e suas ligações estritamente necessárias**: HTML semântico primeiro; classes, elementos e padrões documentados do Bulma; componentes atuais já aprovados no /lab; CSS mínimo e organizado; JavaScript apenas quando justificável; eliminação segura de CSS, JS e variantes _old obsoletos. O resultado deve manter integralmente comportamento, conteúdo, experiência aprovada, estados, rotas, mensagens, acessibilidade, operações, proteção de dados e falhas.

**Preservar** regras de negócio, contratos de componentes e serviços, C#, mocks, AuthenticationStateProvider, guarda de rotas, IndexedDB, modelos, migrações, identidade de conta e semântica de eventos. Não tratar funcionalidade existente como refatoração livre. Ajustes triviais de integração só são autônomos se comprovadamente equivalentes em contrato e comportamento, sem atalhos ou efeitos colaterais.

**Fora do escopo:** adicionar páginas/jornadas, continuar 05.07.02 (cancelada), completar Capturar ou outras jornadas, recriar backend/API, alterar Turso, autenticação real, migrations, pipelines ou hospedagem, redesenhar UX aprovada, migrar arquitetura ou tocar Stack1/. **A Stack1 é histórica e não faz parte das leituras desta campanha.** Nem especificações nem código da Stack1 são pré-requisitos.

## 2. Autoridade, fontes e resolução de conflito

1. A especificação operacional **já concluída** da Stack2 correspondente à página — corpo aprovado, seus checkpoints, Parecer final e adendos posteriores — determina o comportamento a preservar. Acrescente as decisões posteriores do operador aplicáveis à unidade e as restrições do contrato atual dos componentes aprovados no /lab.
2. O código atual em develop é referência de implementação e de testes, **não licença para inventar regra**. Caso o código e a especificação/decisões estejam em desacordo, registre e **consulte o operador**; não escolha silenciosamente.
3. /AGENTS.md é a norma permanente de qualidade e segurança; este macroplano determina sequência e procedimentos temporários. Nenhum dos dois pode modificar implicitamente o produto.
4. Leitura seletiva: /AGENTS.md, .docs/README.md, .docs/memoria-tecnica.md, este plano, **somente** a(s) especificação(ões) Stack2 da unidade (incluindo seus Pareceres) e código/chamadores necessários. Não varrer todas as specs ou a Stack1.
5. Não copiar CSS/HTML da implementação antiga como solução aprovada. Preservar resultados funcionais, não dívidas técnicas.

Se o operador aprovar uma exceção, registre o problema, sua decisão e a extensão **exata** da autorização no histórico da unidade. Uma exceção não constitui autorização para repeti-la em outra página.

## 3. Ordem e inventário fechado (estado inicial)

Trabalhar uma unidade por vez, na ordem abaixo, respeitando dependências compartilhadas. **P01 é piloto obrigatório**: após seu aceite, o operador pode calibrar este plano antes de liberar P02. Identificadores identificam unidades de refatoração, não novas especificações.

| ID | Unidade e arquivos-alvo iniciais | Especificação Stack2 principal | Estado |
|---|---|---|---|
| P01 | Página Inicial — Pages/Home.razor, visual público de /inicio e acesso a partir de / | concluidas/01.md | Pendente — piloto |
| P02 | Login — Pages/Entrar.razor e CSS local | concluidas/02.02.md | Pendente |
| P03 | Cadastro e confirmação — Pages/Cadastro*.razor | concluidas/03.01.md | Pendente |
| P04 | Redefinição e confirmação — Pages/RedefinirSenha*.razor | concluidas/03.02.md | Pendente |
| P05 | Ambiente Principal — Pages/Principal.razor e dependências de apresentação | concluidas/04.md; evolução de pendências em 06.02.md | Pendente |
| P06 | Seleção de Captura — Pages/SelecaoCapturar.razor | concluidas/06.02.md; fundação preservada em 05.md e orientação em 06.01.md | Pendente |
| P07 | Captura do Dia, **somente a casca existente** — Pages/CapturaDia.razor | concluidas/06.02.md | Pendente |
| P08 | Cascas auxiliares existentes — Pages/CascaJornada.razor e seus destinos protegidos | concluidas/04.md e decisões posteriores pertinentes | Pendente |

Os paths acima são pontos de entrada, não inventário exaustivo de arquivos a modificar. Uma unidade pode incluir CSS e componentes compartilhados **somente quando necessários e justificados**; alterações compartilhadas exigem regressão das unidades já aceitas. A ordem P06/P07 deve preservar invariantes do IndexedDB, cache/revisão, data e pendências da 06.02. 05.md (fundação IndexedDB), 06.01.md (orientação não visual) e 07.01.md (CMP-030 no laboratório antigo) **não são páginas a refatorar**. 07.02 cancelada **não entra** na campanha. Não implementar conteúdo real das cascas futuras.

Se o inventário de código demonstrar mais páginas visuais efetivamente implementadas até 06.02 ou uma dependência que torne a ordem insegura, **não ampliar silenciosamente o escopo**: informar, propor ajuste do mapa e obter decisão do operador.

## 4. Ritual obrigatório por unidade

### A. Preparação e autorização (ponto obrigatório de aprovação)

- Confirmar develop e `git status --short`; relatar alterações pré-existentes e não sobrescrevê-las. Não iniciar com divergência não analisada.
- Ler as fontes seletivas acima; levantar comportamentos invariantes, rotas, dados, mensagens, estados de erro/carregamento/vazio, foco/teclado, interações, limites de acesso, operações e persistência relevantes.
- Inspecionar página, CSS/JS e chamadores, mapear classes existentes, Bulma disponível, componentes atuais aprovados e consumidores de `_old`. Identificar CSS potencialmente duplicado e artefatos do /laboratorio antigo sem apagá-los.
- Propor **plano técnico curto da unidade**: estrutura HTML/Bulma; substituições com compatibilidade demonstrada; CSS/JS que deve permanecer, migrar ou sumir; eventuais padrões reutilizáveis a provar no /lab; plano de verificação funcional antes/depois; riscos e incompatibilidades; arquivos e fronteiras. **Aguardar aprovação do operador antes de editar.**
- Para P01, tratar o aceite como piloto e registrar o que aprimorar no macroplano. Não prosseguir automaticamente para P02.

### B. Execução autônoma (quatro etapas internas, sem quatro pausas obrigatórias)

**1 — Estrutura HTML + Bulma e CMPs.** Corrigir HTML semântico e hierarquia; preferir controles nativos e classes Bulma verificadas na documentação oficial. Reutilizar apenas componentes/padrões aprovados no /lab, sem duplicar comportamento ou CSS. Pode utilizar dados/serviços já existentes ou cenários determinísticos para renderização; não reimplementar a lógica nesta etapa. Verificar estrutura, foco e responsividade básicos.

**2 — Refinamento de aparência.** Aplicar CSS mínimo, local e limpo, preferindo tokens/classes Bulma e `.razor.css`. JS somente quando indispensável para a apresentação ou capacidade do navegador, sem criar autoridade paralela ao estado Blazor. Identificar soluções compartilhadas reais; testar padrão compartilhado ou ajuste de componente em /lab antes de integrá-lo. O laboratório é prova, não depósito de CSS de páginas.

**3 — Integração e regressão funcional.** Reutilizar serviços, contratos e operações aprovados. Ajustar somente o vínculo técnico necessário e semanticamente equivalente dos CMPs novos; testar estados, navegação, chamadas, callbacks, continuação após F5, falhas, acessibilidade e jornadas pertinentes. Nunca aproximar regra existente para fazê-la caber no componente.

**4 — Higiene, regressão e entrega.** Revisar HTML/CSS/JS, regras duplicadas, especificidade, classe não usada, CSS de experimentos, estados de tema e viewport, acessibilidade e efeitos compartilhados. Remover variantes `_old` e materiais do /laboratorio **apenas quando todos os consumidores e testes estiverem migrados ou comprovadamente desnecessários**. Não eliminar código por busca textual isolada: investigar bindings e seletores dinâmicos. Repetir build, testes pertinentes e uso no navegador; registrar limites. Não apagar antecipadamente a rota /laboratorio nem componentes usados por páginas ainda pendentes.

O programador pode percorrer e corrigir as quatro etapas sem solicitar aceite em cada uma, **desde que permaneça estritamente no planejamento aprovado**. Registrar checkpoints internos e observações em notas operacionais para retomada entre sessões/compactações; evitar burocracia e refatoração ampla não requerida.

### C. Entrega, aceite e avanço (pontos obrigatórios)

- Antes de pedir validação final, executar verificações técnicas, testes automatizados pertinentes, percursos de navegador, temas Claro/Escuro/Sistema conforme aplicáveis, responsividade, teclado/foco, hover, mensagens e cenários de falha. Apresentar evidência honesta e **limites não testados**; não alegar testes não executados.
- Comparar com o comportamento anterior e a especificação: ausência de regressão funcional é critério de aceite, não apenas build verde ou aparência satisfatória.
- Entregar resumo de arquivos, CMPs migrados, estilos removidos e compartilhados, riscos e testes; disponibilizar execução visual ao operador. **Aguardar inspeção e aceite do operador**, fazer correções solicitadas e revalidar.
- **Somente após aceite e ordem de encerramento**, anexar à especificação operacional **existente** em `.docs/especificacoes/concluidas/` uma seção **“Adendo Técnico — Refatoração da Apresentação (Stack2)”** com data/ID, escopo, HTML/Bulma, CMPs substituídos, CSS/JS, preservação funcional, exceções autorizadas, testes/limites e aceite. **Não alterar corpo original, Continuidade, Parecer final anterior nem outros registros históricos.** O adendo suplementa, não substitui, o Parecer.
- Atualizar nesta tabela o estado para **Concluída — [data e hash do commit quando conhecido]** e anotar dependências/padrões novos. O operador realiza o **commit da página** e autoriza expressamente a próxima unidade. Codex **não deve fazer commit, push ou avançar sozinho**, salvo autorização específica do operador para aquela ação.
- A documentação canônica do Google Drive **não precisa de reconciliação por página**. Preservar o adendo e histórico em Git para reconciliação única no encerramento geral.

## 5. Protocolo estrito de autonomia e escalonamento

**Autonomia permitida**, dentro do plano aprovado: melhorar markup semântico, trocar CSS redundante por Bulma documentado, organizar estilos locais, remover regras realmente sem uso, substituir `_old` por contrato novo **já compatível**, manter ou reaproveitar padrão validado, ajustar binding puramente equivalente e executar/retificar testes.

**Exige interrupção da parte afetada e decisão expressa do operador:**
- Contratos novos e antigos divergem (parâmetros, callbacks, modos, estados, eventos, identidade, foco, ordem, interpretação de dados) e não há equivalência comprovada;
- o componente aprovado em /lab não consegue reproduzir comportamento exigido na página;
- HTML/Bulma/CSS aprovados e funcionalidade não se encaixam sem mudar experiência ou lógica;
- seria necessário alterar componente, interface pública, regra, texto, rota, habilitação, fluxo, tratamento de falha, persistência ou serviço;
- seria necessário introduzir padrão visual compartilhado **não comprovado no laboratório**, alterar visual aprovado ou tomar decisão relevante de UX;
- há ambiguidade/conflito entre especificação, Parecer, decisão posterior e código, ou risco à integridade/autenticação;
- o escopo exigiria alterações em outra página aceita, em infraestrutura ou em dependências não previstas.

**Proibido sem autorização específica:** inventar CSS compensatório ou JS paralelo para disfarçar incompatibilidade; duplicar componente em página; adicionar parâmetros ou eventos ao CMP às escondidas; omitir estados; silenciar erros; alterar cálculos/regras para obter encaixe visual; adaptar contratos ou persistência por conveniência; executar novos requisitos; refatorar serviços comuns indiscriminadamente; apagar testes/legados usados; modificar Stack1.

**Ao escalar:** apresentar (1) comportamento aprovado e fonte exata, (2) contrato/limitação encontrados, (3) diferença e efeito, (4) alternativas reais — alterar componente com retorno ao /lab, integração comprovadamente equivalente ou mudança funcional formal — com riscos, (5) recomendação **sem implementá-la**. Prosseguir só após resposta registrada. Pode continuar em tarefas comprovadamente independentes sem contornar o ponto bloqueado. Alteração aprovada no CMP volta primeiro ao /lab para prova e regressão, depois à página; mudança funcional excepcional exige escopo e validação expressos.

**Não tomar silêncio como consentimento.** A possibilidade de “fazer funcionar” não é autorização para mudar contrato. Sempre perguntar antes de inventar uma solução de integração.

## 6. Critérios de conclusão geral

A campanha só termina mediante aceite expresso do operador após:
1. P01–P08 concluídas e com Adendos Técnicos anexados aos arquivos existentes;
2. componentes novos em uso onde cabíveis, sem `_old` remanescentes com equivalência já aprovada; nenhum legado apagado enquanto necessário;
3. CSS e JS obsoletos/duplicados efetivamente auditados e removidos com segurança; soluções compartilhadas validadas e memória técnica atualizada;
4. /laboratorio antigo sem consumidores e removido apenas com verificação/aceite final, mantendo /lab atual;
5. regressão transversal das páginas, rotas, guarda, temas, viewport, teclado, estados e fluxos locais pertinentes com evidências e limites registrados;
6. nenhum contrato/regra funcional alterado sem decisão expressa; cobertura de problemas encontrados e exceções;
7. **Parecer Final Geral da Campanha** preparado pelo Codex e aprovado pelo operador, incluindo inventário final, commits, remoções, regressões, pendências e decisões.

Depois da conclusão, retirar a campanha de /AGENTS.md e do índice ativo de .docs; **arquivar este macroplano** para rastreabilidade, não apagá-lo antes da reconciliação final no Drive. A metodologia permanente HTML/Bulma → CSS → função → higiene e o uso obrigatório do /lab para CMPs/padrões reutilizáveis permanecem em /AGENTS.md.

## 7. Registro de progresso

- **25/10/2026 — Preparação documental:** macroplano criado; nenhuma página ou componente refatorado.
- **Próxima ação:** somente por comando do operador, abrir P01 (piloto), apresentar diagnóstico e plano, aguardar aprovação.
