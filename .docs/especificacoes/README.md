# Especificações operacionais abertas

Somente os documentos `05.XX` ou `05.XX.YY` entregues e aprovados pelo operador podem entrar como unidades em execução. A referência documental canônica está no Google Drive, `05 - Especificação`; histórico de Deno/Fresh está em `Stack1 - Histórico` (Drive) e `Stack1/` (repositório).

## Reconstrução histórica da Stack1 — orientação temporária

Na fase atual, as unidades tratam da reconstrução de componentes produzidos anteriormente na Stack1. Cada nova especificação pode apontar os arquivos de origem relevantes — por exemplo, `.tsx`, `.css` e JavaScript —, blocos do laboratório antigo e especificações anteriores. Ela condensará as regras e decisões necessárias para a unidade, mesmo quando o histórico as tenha registrado em documentos diferentes.

Consulte os arquivos e documentos da Stack1 indicados expressamente na especificação para compreender a implementação anterior, seus comportamentos e a forma como HTML, Bulma, CSS, JavaScript e TypeScript foram combinados. Se necessário para esclarecer comportamento ou aparência, pode-se executar o projeto antigo e observá-lo. Use essas referências para reconstruir o componente na nova stack, seguindo as etapas visuais e técnicas do `/AGENTS.md`; adapte a implementação à arquitetura atual, sem editar a Stack1. Não faça varreduras do legado nem leia especificações antigas que não tenham sido referenciadas pela unidade.

Por enquanto, essa fase abrange somente componentes. Quando a reconstrução de páginas começar, as referências históricas da Stack1 também poderão orientar esse trabalho, conforme as especificações então aprovadas. Essa orientação transitória vale enquanto estiver sendo coberto o material produzido na Stack1; o operador avisará quando ela deixar de valer e o trabalho passar a tratar de conteúdo novo, sem equivalente histórico.

Cada arquivo operacional conserva **integralmente e sem modificações** o corpo aprovado. O programador pode anexar e organizar livremente notas, plano, checkpoints, decisões, observações do operador, pendências e Parecer final em seções separadas. Registre a conclusão de **cada checkpoint**, independentemente de compactação do contexto.

A numeração `05.07.01` indica divisão deliberada da antiga `05.07`, **não** revisão de seu corpo nem versão da unidade. Uma unidade por vez; seu escopo deve ser autossuficiente, mesmo que referências históricas sejam indicadas. Não consulte automaticamente outras especificações; durante a reconstrução histórica, consulte apenas as fontes da Stack1 e especificações antigas explicitamente apontadas pela unidade corrente.

Após encerramento **solicitado pelo operador**, incluir Parecer final autossuficiente no mesmo arquivo, movê-lo a `concluidas/` e apresentar o Parecer integral em bloco copiável no chat.
