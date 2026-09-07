# Contexto de desenvolvimento do Rememore

Estas instruções se aplicam somente a este projeto. Leia este arquivo no início de cada sessão de desenvolvimento. Ele acompanha o repositório para preservar o contexto entre sessões e computadores.

Fonte: [Contexto do Desenvolvimento do Rememore](https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit), no Google Drive, em Projetos → Rememore. Este arquivo foi preparado em 05/09/2026 e conferido novamente contra o documento integral em 07/09/2026.

Este `AGENTS.md` cumpre o papel do arquivo `.agent` mencionado na fonte: é o contexto permanente do programador e deve conter as orientações necessárias para iniciar novas sessões sem reler normalmente o documento do Drive. A leitura da fonte serve para criar ou ajustar este arquivo; volte ao documento completo somente quando o operador solicitar ou quando for necessário reconstruir o contexto. Preserve aqui orientações curtas e operacionais, mantendo seu significado e seus detalhes relevantes, sem acrescentar convenções ainda não estabelecidas pelo projeto.

## Projeto e ambiente

O Rememore evolui progressivamente a partir de documentação anterior ao código. Descoberta, Consolidação, Fluxos e Funcionalização formaram a base do produto; a etapa atual transforma esse conhecimento em software executável, uma unidade por vez.

A base tecnológica definida é Deno e Fresh, TypeScript/TSX e Preact, Bulma para CSS e Font Awesome para ícones. Turso, com libSQL/SQLite, será usado para persistência quando ela fizer parte da construção. Isso não implica que todos esses recursos já estejam implementados.

Há um operador humano tecnicamente familiarizado com o projeto, que acompanha o desenvolvimento e participa das decisões.

## Início e escopo de cada sessão

1. Leia este `AGENTS.md`.
2. Leia `.docs/README.md` e os documentos de memória técnica indicados ali para leitura inicial. Atualmente, leia também `.docs/memoria-tecnica.md`.
3. Leia somente a Especificação indicada explicitamente pelo operador para iniciar ou continuar a sessão, em `.docs/especificacoes/`.
4. Examine somente o código necessário para compreender e executar esse trabalho, aproveitando o conhecimento já preservado em `.docs/`.

Cada Especificação é uma unidade delimitada: página, componente, comportamento, CSS, experimento de arte ou design, infraestrutura ou outro recorte definido como trabalho independente. A Especificação corrente determina o limite do trabalho.

Ela contém somente as informações consideradas necessárias àquela construção. O desenvolvimento não será realizado de uma única vez nem pela leitura integral da documentação. O projeto evolui deliberadamente uma unidade por vez; aquilo que ainda não foi pedido poderá ser tratado em uma Especificação posterior.

Não liste, percorra ou consulte Especificações anteriores ou futuras por iniciativa própria, mesmo que estejam em um diretório do repositório. Não leia toda a documentação nem tente reconstruir o sistema inteiro como contexto inicial. A ausência de uma informação na Especificação não significa que ela não exista na documentação maior ou no código anterior.

## Implementação e decisões

- Reutilize estruturas, padrões, componentes e recursos existentes quando forem adequados.
- Tome decisões técnicas locais necessárias para materializar claramente a Especificação.
- Consulte o operador quando faltar uma decisão funcional, houver interpretações relevantes distintas, for necessário sair do escopo ou surgir uma decisão estrutural com impacto além da unidade corrente.
- Não invente comportamentos para preencher lacunas nem altere silenciosamente decisões funcionais.
- Não amplie a unidade para completar o sistema, reorganizar o projeto ou refatorar áreas sem relação necessária com o trabalho.
- Não crie abstrações, infraestrutura, bibliotecas, funcionalidades ou preparações para necessidades futuras apenas por conveniência.

Use o conhecimento técnico como referência normal, sem consultas externas repetitivas para operações triviais. Diante de comportamento inesperado, dúvida concreta sobre API ou recurso, suspeita de mudança de versão, incompatibilidade aparente ou pedido do operador, consulte a documentação oficial atual antes de concluir que a implementação ou o sistema estão incorretos.

Deno, Fresh, Bulma, Font Awesome e as demais dependências evoluem ao longo do tempo. A consulta pode partir do programador quando houver motivo concreto ou ser solicitada pelo operador. Seu objetivo é resolver incertezas reais e diferenças de versão, sem transformar a documentação externa em contexto obrigatório de cada tarefa.

## Continuidade da Especificação

Mantenha as cópias operacionais em `.docs/especificacoes/`. Ao receber a indicação de uma Especificação no Google Drive, leia somente esse documento e salve sua cópia Markdown com identificação e título no nome do arquivo, preservando o conteúdo e incluindo o link da fonte. Se a cópia já existir, preserve suas anotações de continuidade ao atualizá-la.

Na identificação local, retire o prefixo `05.`, que pertence à organização documental do Drive, e mantenha apenas a sequência numérica: `05.01` no Drive corresponde à Especificação `01` no projeto, `05.02` corresponde à `02`, e assim por diante. Use essa sequência no nome do arquivo, no título local e nas referências locais; por exemplo, `01-fundacao-visual-e-pagina-inicial.md`. Preserve a identificação original e o link na referência da fonte, sem renumerar os documentos do Drive nem alterar seu corpo aprovado.

Mantenha estado do trabalho, decisões e pendências em uma seção separada chamada **Continuidade**, no mesmo arquivo, sem misturá-los ao corpo aprovado. Essa organização acompanha o repositório entre sessões e computadores e não autoriza a leitura de outras Especificações.

A cópia Markdown da Especificação corrente pode guardar anotações úteis à continuidade enquanto a unidade estiver aberta. Registre somente o necessário para outra sessão retomar aquele trabalho sem reconstruir o raciocínio.

Essa memória local é diferente da documentação de capital de tokens: a Especificação guarda a continuidade daquele trabalho; o capital de tokens preserva conhecimento técnico reutilizável entre trabalhos diferentes.

## Memória técnica e capital de tokens

Mantenha essa documentação em `.docs/`, dentro deste repositório, para acompanhar o projeto entre computadores e modelos. `.docs/README.md` é o índice de leitura inicial e `.docs/memoria-tecnica.md` reúne o conhecimento técnico reutilizável. Novos documentos podem ser acrescentados quando houver material relevante; mantenha o índice atualizado para que o conhecimento essencial seja lido na abertura das sessões. Essa leitura não autoriza percorrer outras Especificações.

Durante o desenvolvimento, o programador pode manter uma documentação técnica própria destinada às suas sessões futuras. Use esse espaço para preservar decisões, soluções, restrições e conhecimentos específicos deste projeto cujo raciocínio tenha valor suficiente para não precisar ser repetido posteriormente.

Registre principalmente aquilo que:

- exigiu investigação, comparação ou reflexão relevante;
- estabeleceu uma decisão técnica que deverá continuar sendo respeitada;
- revelou uma particularidade do projeto que não seja evidente pelo contexto inicial;
- provavelmente será reutilizado ou consultado em trabalhos futuros.

Preserve o resultado útil do raciocínio, não o histórico detalhado da sessão. Não transforme essa documentação em diário de alterações, descrição do código ou coleção de boas práticas genéricas.

Essa documentação pertence ao programador: pode ser criada e atualizada por ele sem depender de uma Especificação específica. Seu objetivo é formar **capital de tokens**, preservando conhecimento técnico já conquistado para que futuras sessões — inclusive executadas por outro modelo — possam reutilizá-lo em vez de redescobri-lo.

Quando uma decisão registrada deixar de ser válida devido à evolução do código ou a uma determinação posterior do operador, atualize ou remova a anotação correspondente.

## Validação com o operador

O operador executa a aplicação, navega, observa o comportamento e avalia resultados visuais e funcionais, fornecendo retorno. Não é necessário assumir autonomamente essas responsabilidades, salvo atividade específica de execução, teste ou investigação solicitada pela Especificação. Arte e design também podem avançar em ciclos curtos de construção e avaliação pelo operador.

## Encerramento

O operador determina quando uma Especificação deve ser encerrada ou cancelada.

Quando ele solicitar o encerramento, releia o corpo original da Especificação no Google Drive e acrescente somente um **Parecer final** breve. Nunca modifique o corpo aprovado. Registre, quando aplicável:

- o que foi efetivamente produzido e os nomes concretos de páginas, rotas, componentes ou estruturas;
- diferenças entre a Especificação e a implementação final;
- descobertas funcionais ou consequências relevantes percebidas durante o desenvolvimento;
- pontos deliberadamente não realizados ou pendentes.

Decisões puramente técnicas reutilizáveis permanecem na memória técnica de capital de tokens. Quando uma descoberta técnica também tiver consequência relevante para a compreensão funcional do projeto, inclua essa consequência resumida no Parecer.

O Parecer pertence somente ao documento do Google Drive; não precisa ser reproduzido na cópia Markdown operacional. Não produza documentação extensa da implementação por padrão. A próxima unidade será definida pelo operador fora da sessão.
