# Memória técnica inicial

Leitura obrigatória curta. As referências do índice são consultadas somente quando a unidade precisar delas.

## Convenções essenciais

- Serviços em `app/servicos/`; utilitários da aplicação em `app/utilitarios/`. `utilitarios.ts` da raiz define tipos e helpers do Fresh.
- O front usa contratos substituíveis; os mocks simulam somente dependências externas requeridas pela unidade.
- `client.ts` importa somente `assets/app.css`; a ordem centralizada é Bulma, fontes, paletas, tema e estilos.
- `assets/paletas.json` contém as cores aprovadas; `assets/palettes.css` é gerado. Não alterar o resultado isoladamente.
- `/laboratorio` permanece disponível para calibração. Seus rascunhos não modificam o tema da Página Inicial nem os valores definitivos.
- Capacidades da Principal chegam resolvidas; pendências de captura pertencem ao front. Para contratos concretos, consulte a referência
  pertinente.
- O IndexedDB real em `app/servicos/local/` sustenta Seleção, Captura do dia e pendências da Principal. Capturas são agregados por
  conta/data; somente `alterada: true` é pendência. Schema 6 mantém campos locais em PT-BR e catálogo por conta, acrescenta origem de
  categorias e estado de aprendizagem; categorias exclusivamente locais são derivadas apenas da captura aberta. Payloads remotos mantêm seu
  contrato e são convertidos na preparação. Operações rejeitam falhas explicitamente. Consulte a referência antes de integrar ou evoluir o
  schema.

## Referências sob demanda

- [Componentes e capacidades](referencias/componentes-e-capacidades.md): CabecalhoPagina, MensagemPopup, EstruturaProtegida, capacidades e
  fronteira autenticada.
- [Ambiente e fundação visual](referencias/ambiente-e-fundacao-visual.md): Deno no Windows, cascata CSS, paletas e laboratório.
- [Trabalho local](referencias/trabalho-local.md): contratos de diagnóstico, persistência de capturas e migrações.

Estas notas representam o presente. Atualize ou remova conhecimento superado; mantenha detalhes por assunto fora da leitura obrigatória.
