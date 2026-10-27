# Especificações operacionais — Stack2

`.docs/especificacoes/` contém **unidades novas em andamento**, somente com escopo definido pelo operador. `concluidas/` mantém os corpos aprovados, checkpoints, decisões, Pareceres finais e adendos das unidades encerradas. Não reescrever o corpo funcional aprovado.

## Preparação e prontidão para páginas

Antes de entregar ao Codex uma especificação autossuficiente de **página**, o analista identifica os ELMs/CMPs, seus estados e variantes e verifica que **todos** já estão implementados, testados e aprovados pelo operador no `/lab`. Se faltar um bloco ou uma adaptação compartilhada, preparar primeiro uma especificação **separada** para criá-lo/revisá-lo no `/lab`; concluir seu aceite antes de liberar a página. HTML estrutural comum não precisa de novo ELM, e capacidades sem apresentação visual independente não exigem bloco fictício.

Uma página começa, por padrão, por (1) **montagem do layout** com HTML semântico, Bulma, blocos aprovados e CSS de composição, e depois (2) **funcionalização** — única ou faseada conforme o risco. As etapas/checkpoints podem ser definidos na especificação. O Codex verifica dúvidas, viabilidade e cria plano técnico **sem aprovação prévia obrigatória**; consulta o operador se houver dúvida, conflito ou bloco compartilhado ausente. O Codex pode sugerir revisões de ELM/CMP, mas **não pode alterá-los autonomamente** durante uma unidade de página.

Unidades de **ELM/CMP no `/lab`** preservam as três fases: demonstração isolada/estrutura HTML+Bulma; personalização visual com CSS e responsividade; funcionalização/testes/aceite. O demonstrador testa os **mesmos blocos reais** e estilos de produção utilizados pelas páginas, não uma cópia a transcrever. Cada CMP usa `BlocoLab` com subcomponente de demonstração próprio quando pertinente; ELMs simples podem estar reunidos num demonstrador com seções identificadas, sem poluir a página principal do laboratório.

## Fontes e precedência

Enquanto a Stack2 estiver funcionalmente atrás da Stack1, o analista utiliza especificações, Pareceres e decisões históricas aplicáveis para preparar a nova especificação Stack2. O Codex pode consultar seletivamente `Stack1/` na `develop` para compreensão complementar, sem precisar buscar documentos no Drive. A especificação Stack2 e as decisões canônicas posteriores têm precedência; não copiar automaticamente código, arquitetura, CSS ou regras históricas conflitantes. Não modificar Stack1 sem autorização expressa.

## Campanha P01–P08 — histórica, encerrada

A refatoração visual das páginas existentes foi aprovada em **27/10/2026**; macroplano e Parecer Final Geral foram arquivados em `.docs/planos/concluidas/plano-refatoracao-paginas.md`. Adendos de apresentação foram anexados às especificações Stack2 concluídas, sem substituição dos seus corpos e Pareceres. A campanha não é mais plano ativo; o antigo caminho `.docs/plano-refatoracao-paginas.md` foi substituído pelo arquivo arquivado. A 05.07.02 cancelada não se torna automaticamente autorizada. As novas unidades seguem `/AGENTS.md` e `.docs/README.md`.

## Preservação

O corpo originalmente aprovado e os Pareceres finais são imutáveis; documentar decisões posteriores em seções anexas. Registrar testes realmente executados, limites não verificados, consultas e aprovações do operador. Somente o operador aceita ou encerra uma unidade.
