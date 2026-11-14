# Memória técnica

Este documento reúne informações sobre o projeto, seus recursos e as ferramentas compartilhadas disponíveis. Seu objetivo é permitir que o agente conheça esses recursos sem precisar ler o código. O operador define todo o material registrado aqui.

## Organização e desenvolvimento

- `src` está dividida em `api`, `web` e `shared`.
- O desenvolvimento começa pela aplicação web, com React.
- Os contratos de dados serão definidos ao longo do desenvolvimento e ficarão em `shared`.
- Inicialmente, os dados serão armazenados por implementações fake, possivelmente usando IndexedDB.
- Após a conclusão da parte web, ela servirá de base para definir o que a API deverá fornecer. As implementações fake serão descartadas gradualmente.
- Haverá também armazenamento local definitivo.

## Estilos da aplicação web

- O projeto não utiliza framework CSS. Os estilos são organizados, nesta ordem de precedência: `global`, `elementos`, `componentes`, `componente`, `paginas` e `pagina`.
- Cada camada posterior pode redefinir estilos de qualquer camada anterior, mas essa possibilidade só deve ser usada quando necessária e autorizada pelo operador. Assim, uma página pode fazer um ajuste local sem criar um estilo mais abrangente para um caso de uso único.
- Cada página ou componente mantém seus estilos em um arquivo `.module.css` próprio, para uso local ou redefinição de estilos de camadas anteriores.
- Estilos compartilhados entre componentes ficam nas camadas `componentes` e `paginas`; por sua posição, podem modificar estilos das camadas anteriores.
- Elementos HTML simples são estilizados na camada `elementos`, para uso consistente em páginas e componentes.
- A camada `global` reúne estilos aplicáveis à aplicação inteira.
- O projeto utiliza o pacote gratuito de ícones do Font Awesome 7.

## Serviço de armazenamento

- O serviço de `localStorage` da aplicação web está em `src/web/services/storage.ts`.
