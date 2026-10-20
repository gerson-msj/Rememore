# CMP-001 — Campo de Senha

Implementar ou reconstruir o **CMP-001 — Campo de Senha** no Rememore, utilizando Blazor WebAssembly .NET 10 e Bulma.

O objetivo é produzir um componente Razor reutilizável, inicialmente demonstrado no `/laboratorio`, sem integrá-lo neste momento aos formulários reais.

Antes de começar, verificar se já existe uma implementação do CMP-001 e reaproveitá-la ou ajustá-la, evitando duplicações.

## 1. Responsabilidade

O componente recebe um valor textual de senha, permite sua edição e oferece um controle para alternar entre apresentação oculta e visível.

O componente é **passivo**: não valida senhas, não autentica usuários e não decide as consequências das alterações.

## 2. Regras funcionais

- A senha inicia sempre oculta, utilizando o comportamento nativo de um campo `type="password"`.
- O controle de visibilidade alterna entre mostrar e ocultar a senha.
- Mostrar a senha não modifica o valor informado.
- Ocultar novamente a senha também preserva integralmente o valor.
- Alternar a visibilidade não deve produzir um evento de alteração do conteúdo.
- O usuário pode continuar editando o valor tanto no modo visível quanto no oculto.
- O conteúdo não deve ser normalizado, aparado ou transformado automaticamente.
- O campo não possui valor inicial predefinido, exceto quando fornecido explicitamente pelo componente chamador.

## 3. Contrato de reutilização

O componente deve permitir:

- Receber o valor inicial da senha.
- Comunicar alterações reais do valor ao chamador, de maneira compatível com o binding do Blazor.
- Receber o rótulo ou nome acessível apropriado ao contexto.
- Configurar o atributo `autocomplete`, especialmente para `current-password` e `new-password`.
- Ser utilizado em formulários distintos sem incorporar regras particulares do Login, Cadastro ou Redefinição de Senha.

O estado de visibilidade pertence ao próprio componente. O valor da senha pertence ao contrato entre o componente e seu chamador.

## 4. Acessibilidade e interação

- O campo deve possuir identificação acessível.
- O controle de visibilidade deve ser operável por mouse, toque e teclado.
- Sua identificação acessível deve comunicar a ação disponível: **Mostrar senha** ou **Ocultar senha**.
- A alternância deve preservar o conteúdo e não provocar submissão acidental do formulário.
- O foco deve permanecer perceptível.
- O controle deve ser utilizável em telas estreitas.

## 5. Responsabilidades externas

Não implementar no componente:

- Regras de comprimento mínimo ou complexidade da senha.
- Mensagens de erro de autenticação.
- Regras de habilitação de botões de formulário.
- Bloqueio de novas tentativas de Login.
- Integração com autenticação ou backend.
- Persistência em `localStorage`, `sessionStorage` ou IndexedDB.
- Registro do valor da senha em logs ou diagnósticos.

Essas responsabilidades pertencem às páginas e aos serviços que utilizarem o CMP-001.

## 6. Demonstração no laboratório

Adicionar o componente ao bloco **Controles** existente em `/laboratorio`, identificando-o como **CMP-001 — Campo de Senha**.

A demonstração deve permitir:

- Digitar uma senha.
- Mostrar e ocultar o conteúdo repetidamente.
- Confirmar que a alternância não modifica o valor.
- Demonstrar os contextos de senha atual e nova senha.
- Verificar o comportamento pelo teclado.

Não utilizar credenciais reais nos exemplos.

## 7. Construção visual

Utilizar inicialmente os recursos nativos do Bulma e os elementos HTML apropriados.

Não criar estilos CSS personalizados apenas para antecipar uma aparência específica. Qualquer necessidade de ajuste visual será discutida diretamente com o operador durante a construção.

Não modificar a infraestrutura de temas ou outros componentes.

## 8. Critérios de conclusão

A implementação estará funcionalmente correta quando:

1. Iniciar com a senha oculta.
2. Mostrar e ocultar repetidamente sem modificar o valor.
3. Comunicar alterações reais de digitação, mas não alterações de visibilidade.
4. Permitir configuração de `autocomplete`.
5. Funcionar por mouse, teclado e toque.
6. Permanecer reutilizável, sem validações ou comportamentos específicos de formulários.
7. Funcionar corretamente no laboratório sem interferir nos demais controles.

Apresentar o componente no laboratório para validação do operador. Não iniciar integrações com outras páginas nem realizar personalizações visuais não solicitadas.

---

## Continuidade operacional

### Plano e estado

- Reutilizar `Componentes/CampoSenha.razor`, preservando os parâmetros já usados por Login, Cadastro e Redefinição; aplicar somente a adequação visual necessária para usar Bulma nativo, sem alterar os chamadores ou suas regras.
- Criar demonstração sem credenciais reais em `/lab`, conforme a orientação do operador de tratar `/laboratorio` como `/lab`.
- Registrar validações estáticas e limitações; não executar build ou testes automatizados, conforme orientação anterior do operador.

### Checkpoint — Implementação

- Estado: implementação concluída; validação do operador pendente.
- Descoberta: `CampoSenha.razor` já existe, mantém a visibilidade em estado interno e o valor no contrato `Valor`/`ValorChanged`; páginas reais o utilizam. Não há arquivo operacional pré-existente localizado pelo identificador CMP-001 ou pelo nome CampoSenha.
- Alterações pré-existentes: `git status --short` estava limpo na branch `develop` antes desta unidade.
- Decisão: reaproveitar o componente e adicionar uma demonstração ao `/lab`; não renomear o arquivo porque não há conflito de nomes.
- Implementado: `CampoSenha.razor` mantém o contrato existente, controla visibilidade localmente, usa botão `type="button"` com nome acessível dinâmico e o padrão Bulma `field has-addons` com controle expandido; removido o CSS isolado específico. Criada `DemonstracaoCampoSenha.razor` com um único campo vazio, seletor Bulma para alternar `autocomplete` entre `current-password` e `new-password`, contagem de alterações/caracteres e orientação de teclado. O bloco `CMP-001 - Senha` foi movido para o fim da lista de blocos de `/lab` conforme solicitação do operador.
- Arquivos/contratos: `Componentes/CampoSenha.razor`, removido `Componentes/CampoSenha.razor.css`, `Componentes/Lab/DemonstracaoCampoSenha.razor`, `Pages/Lab.razor` e este registro.
- Verificação estática: encontrados os três usos existentes do contrato em Entrar, Cadastro e Redefinir Senha; os parâmetros existentes foram preservados e os chamadores não foram alterados. `git diff --check` passou, e uma busca confirmou que não há mais referências às classes CSS removidas. Build e testes automatizados não executados, conforme orientação do operador.
- Observações: a página `/lab` não possuía bloco chamado `Controles`; após verificar essa diferença, o operador definiu que o título do bloco deve ser exatamente `CMP-001 - Senha`. A documentação oficial do Bulma confirma `field has-addons` e `control is-expanded` para agrupar e dimensionar input e botão. O valor digitado não é exibido; a contagem de eventos e de caracteres permite observar alterações sem expor o conteúdo.
- Ajuste após retorno do operador: CMP-001 permanece como último bloco; a demonstração tem apenas um campo de senha. O seletor de autocomplete demonstra os contextos atual e nova senha sem duplicar o componente.
- Próximo passo: operador validar interação e aparência no `/lab`; não há integração ou ajuste visual adicional previsto nesta unidade.
- Ajuste exploratório posterior: a pedido do operador, substituir temporariamente o botão pelo exemplo oficial Bulma “With icons”: `control has-icons-right`, `input` como primeiro filho e `span.icon.is-right` depois do campo, contendo apenas o olho decorativo. A alternância visual deixa de estar implementada nesta versão exploratória; critérios de mostrar/ocultar não estão atendidos enquanto esse desenho estiver em avaliação. Fonte consultada: <https://bulma.io/documentation/elements/form/>. Build/testes não executados.
- Ajuste seguinte solicitado pelo operador: testar a possibilidade de tornar o ícone sobreposto ao campo clicável. O exemplo “With icons” não cobre comportamento interativo; usar um `<button type="button">` com classes Bulma `button is-ghost icon is-right`, mantendo-o como filho do `control has-icons-right` após o `input`. Restaurar alternância de visibilidade interna, rótulo acessível dinâmico e estado anunciado. CSS local Bulma confirma posicionamento do ícone à direita e transparência do botão ghost; `git diff --check` passou. Não houve build, teste automatizado ou verificação no navegador.
- Alteração visual solicitada: o operador autorizou uma regra CSS isolada para restaurar o clique do botão, pois o Bulma define `pointer-events: none` em `.control.has-icons-right .icon`. Recriado `CampoSenha.razor.css` com seletor específico sob `.campo-senha` e `pointer-events: auto` apenas em `.campo-senha__alternar`; a classe foi adicionada ao botão. A regra local tem especificidade maior que a regra Bulma verificada. Pendente operador conferir no `/lab`; build/testes/navegador não executados.
- Ajuste visual solicitado após identificação do contraste: CSS local agora define `color: var(--bulma-text)` no estado normal, usa `var(--bulma-link)` em `:hover` e `:focus-visible`, e explicita `text-decoration: none`. O traço do `fa-eye-slash` é parte do glifo e foi mantido como indicador da ação/estado; não foi removida a alternância de ícones. Pendente avaliação visual no `/lab`; build/testes/navegador não executados.
