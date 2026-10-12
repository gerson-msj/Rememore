# Documentação operacional — Stack .NET

Este diretório é a memória técnica do desenvolvimento vigente de Rememore em .NET 10. Não substitui a documentação canônica do produto no Google Drive.

## Leitura inicial do programador

1. `/AGENTS.md` — instruções operacionais permanentes.
2. `.docs/memoria-tecnica.md` — fatos e recursos técnicos **atuais**, reutilizáveis.
3. **Somente** a especificação da unidade indicada pelo operador em `.docs/especificacoes/`.

Não ler por padrão o histórico `Stack1/.docs/`, outras especificações, toda a árvore do código ou documentos Google Drive. A especificação corrente deve ser autossuficiente. Para dúvidas pontuais sobre comportamento da implementação anterior, consultar seletivamente `Stack1/` sem editar seu conteúdo.

## Organização

- `memoria-tecnica.md`: índice curto dos contratos, componentes e conhecimentos **verificados** da nova stack.
- `especificacoes/`: somente as unidades operacionais abertas, corpo original aprovado preservado, continuidade, checkpoints e decisões.
- `especificacoes/concluidas/`: unidades encerradas, incluindo seus pareceres finais completos.
- Referências técnicas temáticas poderão ser criadas conforme necessidade comprovada, com indicação neste índice.

Não importar automaticamente a memória técnica da Stack1. A nova memória cresce conforme as unidades .NET sejam implementadas.

## Ciclo

O analista prepara a unidade a partir da documentação vigente e do histórico original, quando relevante, e o operador a aprova. O programador lê somente a unidade entregue, clarifica dúvidas antes do plano, implementa e valida em checkpoints e registra as decisões/observações a cada conclusão. Compactações de contexto não exigem preparação nem nova sessão.

No encerramento solicitado pelo operador, o programador registra o Parecer final no mesmo Markdown, move-o para `concluidas/` e entrega um bloco completo copiável no chat. O operador/analista reconciliam o Google Drive somente após discussão e autorização.

Referência do contexto canônico: https://docs.google.com/document/d/1THCkMHH-NyKL8xqn_X5AcXtakD2Iu-OEgsehRbZy2tk/edit
